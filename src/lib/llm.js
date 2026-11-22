// Unified, browser-side client for the four providers.
// Keys never leave the user's browser except to go directly to the provider they belong to.

import Anthropic from "@anthropic-ai/sdk";
import { PROVIDERS } from "./providers.js";

const OPENAI_COMPAT = {
  openai: "https://api.openai.com/v1",
  groq: "https://api.groq.com/openai/v1",
};
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";

// ---------- helpers ----------

class ProviderError extends Error {}

async function httpError(res, providerName) {
  let detail = "";
  try {
    const body = await res.json();
    detail = body?.error?.message || body?.message || JSON.stringify(body);
  } catch {
    detail = res.statusText;
  }
  if (res.status === 401 || res.status === 403) {
    return new ProviderError(`${providerName} rejected the API key (${res.status}). Check that it is correct and active.`);
  }
  if (res.status === 429) {
    return new ProviderError(`${providerName} rate limit or quota reached. Wait a moment or check your billing. (${detail})`);
  }
  return new ProviderError(`${providerName} error ${res.status}: ${detail}`);
}

function friendlyAnthropicError(err) {
  if (err instanceof Anthropic.AuthenticationError) return new ProviderError("Claude rejected the API key. Check that it is correct and active.");
  if (err instanceof Anthropic.PermissionDeniedError) return new ProviderError("This Claude API key doesn't have permission for that model.");
  if (err instanceof Anthropic.NotFoundError) return new ProviderError("That Claude model wasn't found for your account. Pick another model in Settings.");
  if (err instanceof Anthropic.RateLimitError) return new ProviderError("Claude rate limit reached. Wait a moment and try again.");
  if (err instanceof Anthropic.APIConnectionError) return new ProviderError("Couldn't reach the Claude API. Check your internet connection.");
  if (err instanceof Anthropic.APIError) return new ProviderError(`Claude error ${err.status ?? ""}: ${err.message}`);
  return err;
}

// Reads a Server-Sent-Events stream and yields each parsed `data:` JSON payload.
async function* readSSE(res, signal) {
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    if (signal?.aborted) {
      reader.cancel();
      return;
    }
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx;
    while ((idx = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, idx).trim();
      buffer = buffer.slice(idx + 1);
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (!data || data === "[DONE]") continue;
      try {
        yield JSON.parse(data);
      } catch {
        /* ignore keep-alives / partial lines */
      }
    }
  }
}

function dedupeSources(sources) {
  const seen = new Set();
  return sources.filter((s) => {
    if (!s?.url || seen.has(s.url)) return false;
    seen.add(s.url);
    return true;
  });
}

// ---------- Claude (Anthropic SDK) ----------

const isClaude5 = (m) => /^claude-(fable|mythos|opus|sonnet|haiku)-5/.test(m);
// Server-side refusal fallbacks are supported on these models.
const supportsFallbacks = (m) => /^claude-(fable-5|mythos-5|opus-5|sonnet-5-5)/.test(m);

function anthropicClient(apiKey) {
  // Browser-direct access is intentional: this is a bring-your-own-key app.
  return new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
}

async function listAnthropicModels(apiKey) {
  try {
    const client = anthropicClient(apiKey);
    const out = [];
    for await (const m of client.models.list({ limit: 100 })) {
      if (/^claude-(fable|opus|sonnet|haiku)-(5|4-[5-9])/.test(m.id)) out.push({ id: m.id, label: m.display_name || m.id });
    }
    return out;
  } catch (err) {
    throw friendlyAnthropicError(err);
  }
}

async function streamAnthropic({ apiKey, model, system, messages, onText, signal, deep }) {
  const client = anthropicClient(apiKey);
  const convo = messages.map((m) => ({ role: m.role, content: m.content }));
  const params = {
    model,
    max_tokens: deep ? 32000 : 8000,
    system,
  };
  if (isClaude5(model)) {
    // Thinking is adaptive by default on Claude 5 models; effort controls depth.
    params.output_config = { effort: deep ? "medium" : "low" };
  }
  if (supportsFallbacks(model)) {
    params.betas = ["server-side-fallback-2026-07-01"];
    params.fallbacks = "default";
  }
  if (deep) {
    const modernSearch = isClaude5(model) && !model.startsWith("claude-haiku") || /^claude-(opus|sonnet)-4-[6-9]/.test(model);
    params.tools = [{ type: modernSearch ? "web_search_20260209" : "web_search_20250305", name: "web_search", max_uses: 5 }];
  }

  let fullText = "";
  const sources = [];
  try {
    // A long server-tool turn can pause; resend to let the server continue (max 4 rounds).
    for (let round = 0; round < 4; round++) {
      const stream = client.beta.messages.stream({ ...params, messages: convo }, { signal });
      stream.on("text", (t) => {
        fullText += t;
        onText?.(t, fullText);
      });
      const final = await stream.finalMessage();

      for (const block of final.content) {
        if (block.type === "text" && Array.isArray(block.citations)) {
          for (const c of block.citations) if (c.url) sources.push({ title: c.title || c.url, url: c.url });
        }
        if (block.type === "web_search_tool_result" && Array.isArray(block.content)) {
          for (const r of block.content) if (r.url) sources.push({ title: r.title || r.url, url: r.url });
        }
      }

      if (final.stop_reason === "pause_turn") {
        convo.push({ role: "assistant", content: final.content });
        continue;
      }
      if (final.stop_reason === "refusal") {
        const note = "\n\n> ⚠️ The model declined to answer this request. Try rephrasing the question.";
        fullText += note;
        onText?.(note, fullText);
      }
      if (final.stop_reason === "max_tokens") {
        const note = "\n\n> ✂️ The answer hit the length limit. Ask a follow-up to continue.";
        fullText += note;
        onText?.(note, fullText);
      }
      break;
    }
  } catch (err) {
    if (err?.name === "AbortError" || signal?.aborted) return { text: fullText, sources: dedupeSources(sources), aborted: true };
    throw friendlyAnthropicError(err);
  }
  return { text: fullText, sources: dedupeSources(sources) };
}

// ---------- OpenAI & Groq (OpenAI-compatible chat completions) ----------

async function listOpenAICompatModels(provider, apiKey) {
  const res = await fetch(`${OPENAI_COMPAT[provider]}/models`, { headers: { Authorization: `Bearer ${apiKey}` } });
  if (!res.ok) throw await httpError(res, PROVIDERS[provider].name);
  const { data = [] } = await res.json();
  const skip = /(audio|realtime|tts|transcribe|whisper|image|dall-e|embedding|moderation|search|guard|instruct|babbage|davinci|codex|computer)/i;
  return data
    .map((m) => m.id)
    .filter((id) => !skip.test(id))
    .filter((id) => (provider === "openai" ? /^(gpt-|o\d|chatgpt)/.test(id) : true))
    .sort()
    .map((id) => ({ id, label: id }));
}

async function streamOpenAICompat(provider, { apiKey, model, system, messages, onText, signal }) {
  const res = await fetch(`${OPENAI_COMPAT[provider]}/chat/completions`, {
    method: "POST",
    signal,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      stream: true,
      messages: [{ role: "system", content: system }, ...messages],
    }),
  });
  if (!res.ok) throw await httpError(res, PROVIDERS[provider].name);
  let fullText = "";
  try {
    for await (const chunk of readSSE(res, signal)) {
      const delta = chunk?.choices?.[0]?.delta?.content;
      if (delta) {
        fullText += delta;
        onText?.(delta, fullText);
      }
    }
  } catch (err) {
    if (signal?.aborted) return { text: fullText, sources: [], aborted: true };
    throw err;
  }
  return { text: fullText, sources: [] };
}

// ---------- Gemini ----------

async function listGeminiModels(apiKey) {
  const res = await fetch(`${GEMINI_BASE}/models?pageSize=200&key=${encodeURIComponent(apiKey)}`);
  if (!res.ok) throw await httpError(res, "Gemini");
  const { models = [] } = await res.json();
  return models
    .filter((m) => m.supportedGenerationMethods?.includes("generateContent") && /gemini/.test(m.name) && !/(embedding|image|tts|audio|live)/i.test(m.name))
    .map((m) => ({ id: m.name.replace(/^models\//, ""), label: m.displayName || m.name }));
}

async function streamGemini({ apiKey, model, system, messages, onText, signal, deep }) {
  const body = {
    systemInstruction: { parts: [{ text: system }] },
    contents: messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
  };
  if (deep) body.tools = [{ google_search: {} }];
  const res = await fetch(`${GEMINI_BASE}/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse&key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    signal,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw await httpError(res, "Gemini");
  let fullText = "";
  const sources = [];
  try {
    for await (const chunk of readSSE(res, signal)) {
      const cand = chunk?.candidates?.[0];
      for (const part of cand?.content?.parts || []) {
        if (part.text && !part.thought) {
          fullText += part.text;
          onText?.(part.text, fullText);
        }
      }
      for (const g of cand?.groundingMetadata?.groundingChunks || []) {
        if (g.web?.uri) sources.push({ title: g.web.title || g.web.uri, url: g.web.uri });
      }
    }
  } catch (err) {
    if (signal?.aborted) return { text: fullText, sources: dedupeSources(sources), aborted: true };
    throw err;
  }
  return { text: fullText, sources: dedupeSources(sources) };
}

// ---------- public API ----------

/** Validates the key and returns the models it can use. */
export async function listModels(provider, apiKey) {
  if (provider === "anthropic") return listAnthropicModels(apiKey);
  if (provider === "gemini") return listGeminiModels(apiKey);
  return listOpenAICompatModels(provider, apiKey);
}

/**
 * Streams a reply. `messages` is [{role: "user"|"assistant", content: string}].
 * `deep: true` enables web search where the provider supports it.
 * Resolves to { text, sources: [{title, url}] }.
 */
export async function streamChat(opts) {
  const { provider } = opts;
  if (provider === "anthropic") return streamAnthropic(opts);
  if (provider === "gemini") return streamGemini(opts);
  return streamOpenAICompat(provider, opts);
}

/** Pull markdown links out of a model's answer (used for providers without search tools). */
export function extractLinks(markdown) {
  const out = [];
  const re = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  let m;
  while ((m = re.exec(markdown))) out.push({ title: m[1], url: m[2] });
  return dedupeSources(out);
}
