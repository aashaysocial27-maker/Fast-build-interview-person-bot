import { useEffect, useRef, useState } from "react";
import Markdown from "./Markdown.jsx";
import { streamChat } from "../lib/llm.js";
import { coachSystemPrompt, QUICK_PROMPTS } from "../lib/prompts.js";
import { extractQuestion } from "../lib/text.js";
import { uid } from "../lib/storage.js";
import { useSpeech } from "../lib/speech.js";
import ListenButton from "./ListenButton.jsx";

export default function Chat({ role, ai, userName, messages, setMessages, onSave, onDeepDive, onAddNote, notify, pendingPrompt, clearPending }) {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const abortRef = useRef(null);
  const listRef = useRef(null);
  const taRef = useRef(null);
  const speech = useSpeech();
  const dictBaseRef = useRef("");

  // Live dictation: whatever was typed before + what's being said.
  useEffect(() => {
    if (!speech.listening && !speech.transcript) return;
    const spoken = [speech.transcript, speech.interim].filter(Boolean).join(" ");
    setInput([dictBaseRef.current, spoken].filter(Boolean).join(" "));
  }, [speech.transcript, speech.interim, speech.listening]);

  function toggleMic() {
    if (speech.listening) {
      speech.stop();
      return;
    }
    speech.reset();
    dictBaseRef.current = input.trim();
    speech.start();
  }

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  useEffect(() => () => abortRef.current?.abort(), []);

  // A question queued from "Practice" (question bank, saved list or deep dive).
  useEffect(() => {
    if (!pendingPrompt || busy) return;
    // Deferred so React StrictMode's mount/unmount check doesn't send twice or abort it.
    const t = setTimeout(() => {
      clearPending();
      send(pendingPrompt.text);
    }, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingPrompt]);

  async function send(text) {
    const content = (text ?? input).trim();
    if (!content || busy) return;
    if (speech.listening) speech.stop();
    speech.reset();
    dictBaseRef.current = "";
    setInput("");
    const userMsg = { id: uid(), role: "user", content };
    const botId = uid();
    const history = [...messages.filter((m) => !m.error && m.content), userMsg].slice(-20);
    setMessages((prev) => [...prev, userMsg, { id: botId, role: "assistant", content: "", pending: true }]);
    setBusy(true);
    const controller = new AbortController();
    abortRef.current = controller;

    const update = (patch) => setMessages((prev) => prev.map((m) => (m.id === botId ? { ...m, ...patch } : m)));

    try {
      const result = await streamChat({
        provider: ai.provider,
        apiKey: ai.key,
        model: ai.model,
        system: coachSystemPrompt(role.id, userName),
        messages: history.map(({ role, content }) => ({ role, content })),
        signal: controller.signal,
        onText: (_d, full) => update({ content: full }),
      });
      update({ content: result.text || (result.aborted ? "_Stopped._" : "_No response._"), pending: false });
    } catch (err) {
      update({ content: err.message || String(err), error: true, pending: false });
    } finally {
      setBusy(false);
      abortRef.current = null;
      taRef.current?.focus();
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      notify("Copied to clipboard");
    } catch {
      notify("Couldn't copy — select the text instead");
    }
  }

  // Find the user message that preceded an assistant message (for context on save).
  const prevUser = (idx) => {
    for (let i = idx - 1; i >= 0; i--) if (messages[i].role === "user") return messages[i].content;
    return "";
  };

  return (
    <div className="chat">
      <div className="chat-list" ref={listRef}>
        {messages.length === 0 ? (
          <div className="welcome card">
            <div className="welcome-emoji" style={{ background: role.color }}>
              {role.emoji}
            </div>
            <h2>Hi {userName}! Let's prep for {role.name}.</h2>
            <p className="muted">{role.tagline}</p>
            <div className="focus-grid">
              {role.focus.map((f) => (
                <div key={f} className="focus-item">
                  <span className="dot" style={{ background: role.color }} />
                  {f}
                </div>
              ))}
            </div>
            <p className="muted small-text">
              Tip: ask for a question, answer it in your own words, and the coach will score you and show a model answer. Hit{" "}
              <strong>🔍 Deep dive</strong> on any reply for a full study guide with links.
            </p>
          </div>
        ) : (
          messages.map((m, idx) => (
            <div key={m.id} className={`msg ${m.role} ${m.error ? "error" : ""}`}>
              <div className="msg-avatar" style={m.role === "assistant" ? { background: role.color } : undefined}>
                {m.role === "assistant" ? role.emoji : userName.slice(0, 1).toUpperCase()}
              </div>
              <div className="msg-body">
                {m.role === "assistant" ? (
                  m.pending && !m.content ? (
                    <div className="typing">
                      <span />
                      <span />
                      <span />
                    </div>
                  ) : (
                    <Markdown>{m.content}</Markdown>
                  )
                ) : (
                  <div className="user-text">{m.content}</div>
                )}
                {m.role === "assistant" && !m.pending && !m.error && m.content && (
                  <div className="msg-actions">
                    <ListenButton id={`chat-${m.id}`} title={`${role.short} coach`} markdown={m.content} label="Play" className="primary-listen" />
                    <button
                      onClick={() => {
                        const q = extractQuestion(m.content);
                        onSave({ question: q, notes: "", context: m.content, source: "chat" });
                      }}
                    >
                      ⭐ Save question
                    </button>
                    <button onClick={() => onDeepDive(extractQuestion(m.content) || prevUser(idx))}>🔍 Deep dive</button>
                    <button
                      onClick={() =>
                        onAddNote({ title: extractQuestion(m.content).slice(0, 80) || "Chat note", body: m.content })
                      }
                    >
                      📝 Add to notes
                    </button>
                    <button onClick={() => copy(m.content)}>📋 Copy</button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="composer-wrap">
        <div className="chips">
          {QUICK_PROMPTS.map((p) => (
            <button key={p.label} className="chip" disabled={busy} onClick={() => send(p.text)}>
              {p.label}
            </button>
          ))}
          {messages.length > 0 && (
            <button
              className="chip subtle"
              disabled={busy}
              onClick={() => {
                if (confirm("Clear this conversation? Saved questions and notes are kept.")) setMessages([]);
              }}
            >
              🧹 New chat
            </button>
          )}
        </div>
        {speech.error && <div className="alert error">{speech.error}</div>}
        <div className={`composer card ${speech.listening ? "dictating" : ""}`}>
          <textarea
            ref={taRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={`Answer a question, or ask anything about ${role.short} interviews…  (Enter to send, Shift+Enter for a new line)`}
            rows={2}
          />
          {speech.supported && (
            <button
              className={`mic-mini ${speech.listening ? "on" : ""}`}
              onClick={toggleMic}
              disabled={busy}
              title={speech.listening ? "Stop dictation" : "Answer by voice"}
              aria-label={speech.listening ? "Stop dictation" : "Answer by voice"}
            >
              {speech.listening ? "■" : "🎙️"}
            </button>
          )}
          {busy ? (
            <button className="secondary" onClick={() => abortRef.current?.abort()}>
              ■ Stop
            </button>
          ) : (
            <button className="primary" onClick={() => send()} disabled={!input.trim()}>
              Send ➤
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
