// src/services/openrouter.js

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Most stable free models as of 2026 — all confirmed :free tier
const FREE_MODELS = [
  "meta-llama/llama-4-scout:free",
  "deepseek/deepseek-r1:free",
  "deepseek/deepseek-chat-v3-0324:free",
  "nvidia/llama-3.1-nemotron-70b-instruct:free",
  "meta-llama/llama-3.1-8b-instruct:free",
];

export async function getChatCompletion(messages, modelIndex = 0) {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("Missing VITE_OPENROUTER_API_KEY in your .env file.");

  if (modelIndex >= FREE_MODELS.length) {
    throw new Error("All free models are currently unavailable. Please try again in a few minutes.");
  }

  const model = FREE_MODELS[modelIndex];
  console.log(`Trying model: ${model}`);

  const res = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": window.location.origin,
      "X-Title": "Social Lead Tracker",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    const errMsg = data?.error?.message || "";
    console.warn(`Model ${model} failed: ${errMsg}`);

    // Auto-fallback for endpoint/availability errors
    if (
      errMsg.toLowerCase().includes("no endpoints") ||
      errMsg.toLowerCase().includes("unavailable") ||
      errMsg.toLowerCase().includes("not found") ||
      res.status === 404 ||
      res.status === 503
    ) {
      return getChatCompletion(messages, modelIndex + 1);
    }

    // 429 = rate limited — tell the user clearly
    if (res.status === 429) {
      throw new Error("Rate limit reached (200 requests/day on free tier). Try again tomorrow or add credits at openrouter.ai.");
    }

    throw new Error(errMsg || `OpenRouter error ${res.status}`);
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response from AI — please try again.");

  console.log(`✓ Response from ${model}`);
  return content;
}