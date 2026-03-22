import { NextRequest } from "next/server";
import { Disaster } from "@/app/dashboard/fundamentals/disasters/types/disaster";

// ── Model config ─────────────────────────────────────────────────────────────
// Set OLLAMA_MODEL in .env.local. Recommended upgrade path:
//   ollama pull mistral          → great analysis, fast (~4GB)
//   ollama pull llama3.1:8b      → smarter reasoning (~5GB)
//   ollama pull deepseek-r1:8b   → chain-of-thought reasoning (~5GB)
//   ollama pull llama3.3:70b     → best quality, needs strong GPU (~40GB)

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
const OLLAMA_MODEL    = process.env.OLLAMA_MODEL    ?? "llama3.1:8b";

function buildPrompt(disaster: Disaster): string {
  const avgProb = Math.round(
    disaster.ai_models.reduce((s, m) => s + m.probability, 0) / disaster.ai_models.length
  );
  const avgPred = (
    disaster.ai_models.reduce((s, m) => s + m.prediction, 0) / disaster.ai_models.length
  ).toFixed(1);

  return `You are a senior quantitative analyst at a top macro hedge fund specializing in disaster-driven market analysis.

Analyze this event with precision:

EVENT: ${disaster.type} | ${disaster.location} | ${disaster.severity} | ${disaster.date}
SOURCE: ${disaster.source}
PRIMARY COMMODITY: ${disaster.primary} (${disaster.primary_pct}% of global supply at risk)

AI MODEL PREDICTIONS:
${disaster.ai_models.map((m) => `  ${m.name}: ${m.probability}% probability of price ${disaster.direction === "UP" ? "increase" : "decrease"}, predicted move: ${disaster.direction === "UP" ? "+" : "-"}${m.prediction}%`).join("\n")}
  Consensus: ${avgProb}% probability | Average predicted move: ${disaster.direction === "UP" ? "+" : "-"}${avgPred}%
  Confidence: ${Math.round(disaster.confidence * 100)}%

DESCRIPTION: ${disaster.description}

PREDICTED INDIRECT IMPACTS:
${disaster.indirect.map((i) => `  • ${i.asset} (${i.category}): ${i.impact}`).join("\n")}

Write exactly 4 tight paragraphs:

1. SUPPLY CHAIN MECHANISM — Why does this ${disaster.type} disrupt ${disaster.primary}? Specific geography, infrastructure, production timelines.
2. AI CONSENSUS — Why do AI Alpha, AI Beta, and AI Gamma agree or diverge? What historical analogues support this prediction?
3. INDIRECT CONTAGION — Trace the exact transmission mechanism from disaster → ${disaster.primary} → each indirect asset.
4. RISK & TIMING — What invalidates this prediction? When does price impact materialize (hours/days/weeks)? What should traders watch?

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