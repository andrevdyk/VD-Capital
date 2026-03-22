import { NextRequest } from "next/server";
import { Disaster } from "@/types/disaster";

// This route calls your LOCAL Ollama instance
// Make sure Ollama is running: `ollama serve`
// And you have a model pulled: `ollama pull llama3.2` or `ollama pull mistral`

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "llama3.2";

function buildPrompt(disaster: Disaster): string {
  const avgModel = (
    (disaster.model_breakdown.xgboost +
      disaster.model_breakdown.lightgbm +
      disaster.model_breakdown.pytorch) /
    3
  ).toFixed(1);

  return `You are a quantitative commodity and macro trader specializing in disaster-driven market analysis.

Analyze this natural disaster event and provide a concise, expert-level market impact assessment:

EVENT: ${disaster.type}
LOCATION: ${disaster.location}
SEVERITY: ${disaster.severity}
DATE: ${disaster.date}
PRIMARY COMMODITY: ${disaster.primary} (${disaster.primary_pct}% of global production at risk)
ML MODEL CONSENSUS: +${disaster.magnitude.toFixed(1)}% price prediction
  - XGBoost: +${disaster.model_breakdown.xgboost}%
  - LightGBM: +${disaster.model_breakdown.lightgbm}%
  - PyTorch: +${disaster.model_breakdown.pytorch}%
  - Average: +${avgModel}%

Event description: ${disaster.description}

Indirect asset impacts predicted:
${disaster.indirect.map((i) => `- ${i.asset}: ${i.impact}`).join("\n")}

Provide a 3-4 paragraph analysis covering:
1. Why the ML models agree/diverge and what drives the consensus
2. The key supply chain mechanism behind the primary commodity price move
3. The 2-3 most important indirect market impacts and the causal chain
4. Key risks that could invalidate the prediction and expected timeframe (hours/days/weeks)

Write like a Bloomberg Intelligence analyst — specific, quantitative, no generic commentary.`;
}

export async function POST(req: NextRequest) {
  try {
    const disaster: Disaster = await req.json();

    const prompt = buildPrompt(disaster);

    // Call Ollama's streaming API
    const ollamaRes = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: true,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          num_predict: 800,
        },
      }),
    });

    if (!ollamaRes.ok) {
      const error = await ollamaRes.text();
      return new Response(
        JSON.stringify({
          error: `Ollama error: ${ollamaRes.status} — ${error}. Is Ollama running? Try: ollama serve`,
        }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    // Stream the response back to the client
    const stream = new ReadableStream({
      async start(controller) {
        const reader = ollamaRes.body!.getReader();
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n").filter(Boolean);

            for (const line of lines) {
              try {
                const json = JSON.parse(line);
                if (json.response) {
                  // Send just the text token
                  controller.enqueue(new TextEncoder().encode(json.response));
                }
                if (json.done) {
                  controller.close();
                  return;
                }
              } catch {
                // Skip malformed JSON lines
              }
            }
          }
        } catch (err) {
          controller.error(err);
        } finally {
          reader.releaseLock();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("Disaster analysis API error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}