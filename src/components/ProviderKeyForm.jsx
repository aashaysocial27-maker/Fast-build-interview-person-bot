import { useState } from "react";
import { PROVIDER_LIST, PROVIDERS } from "../lib/providers.js";
import { listModels } from "../lib/llm.js";

/**
 * Pick a provider, paste a key, verify it (by listing models) and pick a model.
 * Calls onVerified({ provider, key, models, model }).
 */
export default function ProviderKeyForm({ initialProvider = "anthropic", existingKeys = {}, submitLabel = "Verify key", onVerified }) {
  const [provider, setProvider] = useState(initialProvider);
  const [key, setKey] = useState(existingKeys[initialProvider] || "");
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState({ state: "idle" });

  const p = PROVIDERS[provider];

  function choose(id) {
    setProvider(id);
    setKey(existingKeys[id] || "");
    setStatus({ state: "idle" });
  }

  async function verify(e) {
    e.preventDefault();
    const trimmed = key.trim();
    if (!trimmed) {
      setStatus({ state: "error", message: "Paste your API key first." });
      return;
    }
    setStatus({ state: "loading" });
    try {
      const live = await listModels(provider, trimmed);
      const models = live.length ? live : p.models;
      const model = models.find((m) => m.id === p.defaultModel)?.id || models[0]?.id || p.defaultModel;
      setStatus({ state: "ok" });
      onVerified({ provider, key: trimmed, models, model });
    } catch (err) {
      setStatus({ state: "error", message: err.message || String(err) });
    }
  }

  return (
    <form className="key-form" onSubmit={verify}>
      <div className="provider-grid" role="radiogroup" aria-label="AI provider">
        {PROVIDER_LIST.map((pv) => (
          <button
            type="button"
            key={pv.id}
            role="radio"
            aria-checked={provider === pv.id}
            className={`provider-card ${provider === pv.id ? "active" : ""}`}
            style={{ "--pc": pv.color }}
            onClick={() => choose(pv.id)}
          >
            {pv.recommended && <span className="badge-rec">★ Recommended</span>}
            <span className="pc-name">{pv.name}</span>
            <span className="pc-co">{pv.company}</span>
            {existingKeys[pv.id] && <span className="pc-saved">key saved</span>}
          </button>
        ))}
      </div>

      <p className="provider-blurb">{p.blurb}</p>

      <label className="field">
        <span className="field-label">
          {p.company} API key
          <a href={p.keyUrl} target="_blank" rel="noopener noreferrer" className="field-hint">
            Get a key ↗
          </a>
        </span>
        <div className="key-input">
          <input
            type={show ? "text" : "password"}
            value={key}
            onChange={(e) => {
              setKey(e.target.value);
              setStatus({ state: "idle" });
            }}
            placeholder={`${p.keyPrefix}…`}
            autoComplete="off"
            spellCheck={false}
          />
          <button type="button" className="ghost small" onClick={() => setShow((s) => !s)}>
            {show ? "Hide" : "Show"}
          </button>
        </div>
      </label>

      {status.state === "error" && <div className="alert error">{status.message}</div>}

      <button className="primary wide" type="submit" disabled={status.state === "loading"}>
        {status.state === "loading" ? <span className="spinner" /> : null}
        {status.state === "loading" ? "Checking key…" : submitLabel}
      </button>
    </form>
  );
}
