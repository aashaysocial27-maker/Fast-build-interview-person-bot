// The four supported AI providers. Users "log in" by bringing their own API key.
// `models` are fallbacks; the real list is fetched live from the provider once a key is entered.

export const PROVIDERS = {
  anthropic: {
    id: "anthropic",
    name: "Claude",
    company: "Anthropic",
    recommended: true,
    blurb: "Best for deep, well-structured explanations. Deep dives include live web search with real source links.",
    keyPrefix: "sk-ant-",
    keyUrl: "https://platform.claude.com/settings/keys",
    defaultModel: "claude-opus-5-5",
    models: [
      { id: "claude-opus-5-5", label: "Claude Opus 5.5 (recommended)" },
      { id: "claude-sonnet-5-5", label: "Claude Sonnet 5.5 (faster)" },
      { id: "claude-haiku-5-5", label: "Claude Haiku 5.5 (cheapest)" },
    ],
    color: "#d97757",
  },
  openai: {
    id: "openai",
    name: "ChatGPT",
    company: "OpenAI",
    blurb: "GPT models via the OpenAI API.",
    keyPrefix: "sk-",
    keyUrl: "https://platform.openai.com/api-keys",
    defaultModel: "gpt-5-mini",
    models: [
      { id: "gpt-5", label: "GPT-5" },
      { id: "gpt-5-mini", label: "GPT-5 mini" },
    ],
    color: "#10a37f",
  },
  gemini: {
    id: "gemini",
    name: "Gemini",
    company: "Google",
    blurb: "Gemini models. Deep dives use Google Search grounding for links.",
    keyPrefix: "AI",
    keyUrl: "https://aistudio.google.com/apikey",
    defaultModel: "gemini-2.5-flash",
    models: [
      { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
      { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
    ],
    color: "#4285f4",
  },
  groq: {
    id: "groq",
    name: "Llama (Groq)",
    company: "Groq",
    blurb: "Open models (Llama and others) with very fast responses. Generous free tier for students.",
    keyPrefix: "gsk_",
    keyUrl: "https://console.groq.com/keys",
    defaultModel: "llama-3.3-70b-versatile",
    models: [
      { id: "llama-3.3-70b-versatile", label: "Llama 3.3 70B" },
      { id: "llama-3.1-8b-instant", label: "Llama 3.1 8B (instant)" },
    ],
    color: "#f55036",
  },
};

export const PROVIDER_LIST = Object.values(PROVIDERS);
