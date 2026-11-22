import { useEffect, useState } from "react";
import ProviderKeyForm from "./ProviderKeyForm.jsx";
import { PROVIDERS, PROVIDER_LIST } from "../lib/providers.js";

export default function Settings({ session, onChange, onClose }) {
  const [adding, setAdding] = useState(false);
  const connected = PROVIDER_LIST.filter((p) => session.keys[p.id]);
  const models = session.models[session.provider] || PROVIDERS[session.provider].models;

  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  function useProvider(id) {
    const list = session.models[id] || PROVIDERS[id].models;
    const model = list.find((m) => m.id === PROVIDERS[id].defaultModel)?.id || list[0]?.id;
    onChange({ ...session, provider: id, model });
  }

  function removeKey(id) {
    const keys = { ...session.keys };
    delete keys[id];
    const next = { ...session, keys };
    if (session.provider === id) {
      const other = Object.keys(keys)[0];
      if (!other) return; // keep at least one key
      next.provider = other;
      const list = session.models[other] || PROVIDERS[other].models;
      next.model = list[0]?.id;
    }
    onChange(next);
  }

  return (
    <div className="modal-root" role="dialog" aria-modal="true" aria-label="Settings">
      <div className="drawer-scrim" onClick={onClose} />
      <div className="modal card">
        <header className="modal-head">
          <h2>⚙️ AI settings</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        <div className="modal-body">
          <h3>Connected providers</h3>
          <div className="conn-list">
            {connected.map((p) => (
              <div key={p.id} className={`conn ${session.provider === p.id ? "active" : ""}`} style={{ "--pc": p.color }}>
                <div className="grow">
                  <strong>{p.name}</strong> <span className="muted tiny">{p.company}</span>
                  {p.recommended && <span className="badge-rec inline">★ Recommended</span>}
                  <div className="muted tiny mono">key •••• {session.keys[p.id].slice(-4)}</div>
                </div>
                {session.provider === p.id ? (
                  <span className="tag soft">In use</span>
                ) : (
                  <button className="secondary small" onClick={() => useProvider(p.id)}>
                    Use
                  </button>
                )}
                {connected.length > 1 && (
                  <button className="ghost small danger" onClick={() => removeKey(p.id)}>
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          <label className="field">
            <span className="field-label">Model for {PROVIDERS[session.provider].name}</span>
            <select className="select wide" value={session.model} onChange={(e) => onChange({ ...session, model: e.target.value })}>
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>

          <label className="check">
            <input type="checkbox" checked={!!session.remember} onChange={(e) => onChange({ ...session, remember: e.target.checked })} />
            <span>Remember my keys on this device</span>
          </label>

          <hr />
          {adding ? (
            <>
              <h3>Add or replace a key</h3>
              <ProviderKeyForm
                initialProvider={PROVIDER_LIST.find((p) => !session.keys[p.id])?.id || "anthropic"}
                existingKeys={session.keys}
                submitLabel="Verify & connect"
                onVerified={({ provider, key, models, model }) => {
                  onChange({
                    ...session,
                    keys: { ...session.keys, [provider]: key },
                    models: { ...session.models, [provider]: models },
                    provider,
                    model,
                  });
                  setAdding(false);
                }}
              />
            </>
          ) : (
            <button className="secondary wide" onClick={() => setAdding(true)}>
              + Connect another provider
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
