import { NextRequest } from "next/server";
import { Disaster } from "../../types/disaster";

// ── Model config ─────────────────────────────────────────────────────────────
// Set OLLAMA_MODEL in .env.local. Recommended upgrade path:
//   ollama pull mistral          → great analysis, fast (~4GB)
//   ollama pull llama3.1:8b      → smarter reasoning (~5GB)
//   ollama pull deepseek-r1:8b   → chain-of-thought reasoning (~5GB)
//   ollama pull llama3.3:70b     → best quality, needs strong GPU (~40GB)

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
const OLLAMA_MODEL    = process.env.OLLAMA_MODEL    ?? "mistral";

function buildPrompt(disaster: Disaster): string {
  const avg = (
    (disaster.model_breakdown.xgboost +
      disaster.model_breakdown.lightgbm +
      disaster.model_breakdown.pytorch) / 3
  ).toFixed(1);

  return `You are a senior quantitative analyst at a top macro hedge fund specializing in disaster-driven market analysis.

Analyze this event with precision:

EVENT: ${disaster.type} | ${disaster.location} | ${disaster.severity} | ${disaster.date}
PRIMARY COMMODITY: ${disaster.primary} (${disaster.primary_pct}% of global supply at risk)

ML MODEL PREDICTIONS:
  XGBoost:  +${disaster.model_breakdown.xgboost}%
  LightGBM: +${disaster.model_breakdown.lightgbm}%
  PyTorch:  +${disaster.model_breakdown.pytorch}%
  Average:  +${avg}% | Confidence: ${Math.round(disaster.confidence * 100)}%

DESCRIPTION: ${disaster.description}

PREDICTED INDIRECT IMPACTS:
${disaster.indirect.map((i) => `  • ${i.asset}: ${i.impact}`).join("\n")}

Write exactly 4 tight paragraphs:

1. SUPPLY CHAIN MECHANISM — Why does this disaster disrupt ${disaster.primary}? Specific geography, infrastructure, production timelines.
2. MODEL CONSENSUS — Why do the three ML models agree or diverge? What historical analogues support this prediction?
3. INDIRECT CONTAGION — Trace the exact transmission mechanism from disaster → primary commodity → each indirect asset.
4. RISK & TIMING — What invalidates this prediction? When does the price impact materialize (hours/days/weeks)? What should traders watch?

Be specific and quantitative. Write like a Bloomberg Intelligence analyst. No generic statements.`;
}

export async function POST(req: NextRequest) {
  try {
    const disaster: Disaster = await req.json();

    const ollamaRes = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model:  OLLAMA_MODEL,
        prompt: buildPrompt(disaster),
        stream: true,
        options: {
          temperature:    0.65,
          top_p:          0.9,
          num_predict:    1200,
          repeat_penalty: 1.1,
        },
      }),
    });

    if (!ollamaRes.ok) {
      const txt = await ollamaRes.text();
      return new Response(
        JSON.stringify({ error: `Ollama ${ollamaRes.status}: ${txt}. Run: ollama serve` }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader  = ollamaRes.body!.getReader();
        const decoder = new TextDecoder();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            for (const line of decoder.decode(value, { stream: true }).split("\n").filter(Boolean)) {
              try {
                const j = JSON.parse(line);
                if (j.response) controller.enqueue(new TextEncoder().encode(j.response));
                if (j.done)     { controller.close(); return; }
              } catch { /* skip */ }
            }
          }
        } catch (err) { controller.error(err); }
        finally { reader.releaseLock(); }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type":      "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control":     "no-cache",
      },
    });
  } catch (err) {
    console.error("[disaster-analysis]", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}