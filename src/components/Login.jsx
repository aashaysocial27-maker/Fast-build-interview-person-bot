import { useState } from "react";
import ProviderKeyForm from "./ProviderKeyForm.jsx";
import { ROLE_LIST } from "../data/roles.js";

export default function Login({ onLogin }) {
  const [name, setName] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");

  function handleVerified({ provider, key, models, model }) {
    if (!name.trim()) {
      setError("Tell us your name so we can keep your notes and saved questions separate.");
      return;
    }
    onLogin({
      name: name.trim(),
      remember,
      provider,
      model,
      keys: { [provider]: key },
      models: { [provider]: models },
    });
  }

  return (
    <div className="login-page">
      <section className="login-hero">
        <div className="brand big">
          <img src="/favicon.svg" alt="" />
          <span>PrepPilot</span>
        </div>
        <h1>
          Land your first <span className="grad-text">AI role</span>.
        </h1>
        <p className="lead">
          Practice with an AI interview coach, get scored feedback, dive deep into every question with sources, and keep your notes in one
          place.
        </p>
        <ul className="role-pills">
          {ROLE_LIST.map((r) => (
            <li key={r.id} style={{ "--rc": r.color }}>
              <span>{r.emoji}</span> {r.name}
            </li>
          ))}
        </ul>
        <ul className="feature-list">
          <li>💬 Mock interviews with scored feedback</li>
          <li>🔍 Deep dives with links to learn more</li>
          <li>⭐ Save questions to revisit</li>
          <li>📝 Notes linked to questions</li>
        </ul>
      </section>

      <section className="login-card card">
        <h2>Sign in with your API key</h2>
        <p className="muted">
          Bring your own key from any of the four providers. It is sent only to that provider, straight from your browser.
        </p>

        <label className="field">
          <span className="field-label">Your name</span>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            placeholder="e.g. Priya"
            autoFocus
          />
        </label>

        <ProviderKeyForm submitLabel="Verify key & start practicing →" onVerified={handleVerified} />

        {error && <div className="alert error">{error}</div>}

        <label className="check">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          <span>Remember me on this device (stores the key in this browser — don't use on shared computers)</span>
        </label>
      </section>
    </div>
  );
}
