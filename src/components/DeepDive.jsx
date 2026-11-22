import { useEffect, useRef, useState } from "react";
import Markdown from "./Markdown.jsx";
import { streamChat } from "../lib/llm.js";
import { deepDiveSystemPrompt } from "../lib/prompts.js";
import { ROLES, searchLinks } from "../data/roles.js";
import { PROVIDERS } from "../lib/providers.js";

export const diveKey = (roleId, question) => `${roleId}::${question.trim().toLowerCase()}`;

export default function DeepDive({ dive, ai, cache, setCache, onClose, onSave, onAddNote, onPractice, isSaved }) {
  const role = ROLES[dive.roleId];
  const key = diveKey(dive.roleId, dive.question);
  const cached = cache[key];
  const [text, setText] = useState(cached?.text || "");
  const [sources, setSources] = useState(cached?.sources || []);
  const [state, setState] = useState(cached ? "done" : "idle");
  const [error, setError] = useState("");
  const abortRef = useRef(null);
  const hasSearch = ai.provider === "anthropic" || ai.provider === "gemini";

  async function generate() {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setState("loading");
    setError("");
    setText("");
    setSources([]);
    try {
      const result = await streamChat({
        provider: ai.provider,
        apiKey: ai.key,
        model: ai.model,
        deep: true,
        system: deepDiveSystemPrompt(dive.roleId, hasSearch),
        messages: [{ role: "user", content: `Interview question for a ${role.name} role:\n\n"${dive.question}"` }],
        signal: controller.signal,
        onText: (_d, full) => setText(full),
      });
      if (controller.signal.aborted) return;
      setText(result.text);
      setSources(result.sources);
      setState("done");
      setCache((c) => ({
        ...c,
        [key]: { text: result.text, sources: result.sources, provider: ai.provider, model: ai.model, createdAt: Date.now() },
      }));
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(err.message || String(err));
      setState("error");
    }
  }

  useEffect(() => {
    if (!cached) generate();
    const onEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onEsc);
    return () => {
      abortRef.current?.abort();
      window.removeEventListener("keydown", onEsc);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const saved = isSaved(dive.question, dive.roleId);

  return (
    <div className="drawer-root" role="dialog" aria-modal="true" aria-label="Deep dive">
      <div className="drawer-scrim" onClick={onClose} />
      <div className="drawer">
        <header className="drawer-head" style={{ "--rc": role.color }}>
          <div className="drawer-kicker">
            <span>🔍 Deep dive</span>
            <span className="role-tag" style={{ "--rc": role.color }}>
              {role.emoji} {role.short}
            </span>
          </div>
          <h2>{dive.question}</h2>
          <div className="drawer-actions">
            <button className={saved ? "secondary" : "primary"} disabled={state === "loading"} onClick={() => onSave({ question: dive.question, answer: text, sources, roleId: dive.roleId, source: "deep-dive" })}>
              {saved ? "★ Saved — update" : "☆ Save with answer"}
            </button>
            <button className="secondary" disabled={!text} onClick={() => onAddNote({ title: dive.question.slice(0, 80), body: text, roleId: dive.roleId })}>
              📝 Copy to notes
            </button>
            <button className="secondary" onClick={() => onPractice(dive.question, dive.roleId)}>
              🎤 Practice in chat
            </button>
            <button className="ghost" disabled={state === "loading"} onClick={generate}>
              ↻ Regenerate
            </button>
            <button className="icon-btn" onClick={onClose} aria-label="Close">
              ✕
            </button>
          </div>
        </header>

        <div className="drawer-body">
          {state === "loading" && !text && (
            <div className="loading-card">
              <span className="spinner dark" />
              <div>
                <strong>Building your study guide…</strong>
                <div className="muted small-text">
                  {hasSearch ? "Searching the web for good sources and writing a full answer." : "Writing a full answer with resources."}{" "}
                  Using {PROVIDERS[ai.provider].name} · {ai.model}
                </div>
              </div>
            </div>
          )}
          {state === "error" && (
            <div className="alert error">
              {error}{" "}
              <button className="ghost small" onClick={generate}>
                Try again
              </button>
            </div>
          )}
          {text && <Markdown>{text}</Markdown>}
          {state === "loading" && text && <div className="cursor-line">Writing…</div>}

          {(state === "done" || state === "error") && (
            <section className="links-panel">
              {sources.length > 0 && (
                <div className="link-group">
                  <h3>🌐 Sources found by web search</h3>
                  <ul>
                    {sources.slice(0, 10).map((s) => (
                      <li key={s.url}>
                        <a href={s.url} target="_blank" rel="noopener noreferrer">
                          {s.title}
                        </a>
                        <span className="host">{safeHost(s.url)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="link-group">
                <h3>📌 Trusted resources for {role.name}</h3>
                <ul>
                  {role.resources.map((s) => (
                    <li key={s.url}>
                      <a href={s.url} target="_blank" rel="noopener noreferrer">
                        {s.title}
                      </a>
                      <span className="host">{safeHost(s.url)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="link-group">
                <h3>🔎 Keep exploring this topic</h3>
                <div className="search-links">
                  {searchLinks(dive.question).map((s) => (
                    <a key={s.url} className="chip" href={s.url} target="_blank" rel="noopener noreferrer">
                      {s.title} ↗
                    </a>
                  ))}
                </div>
              </div>
              {!hasSearch && (
                <p className="muted tiny">
                  Links inside the answer were suggested by the model — double-check them. Use Claude or Gemini for live web-searched sources.
                </p>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function safeHost(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}
