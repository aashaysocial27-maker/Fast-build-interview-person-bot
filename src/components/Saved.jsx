import { useState } from "react";
import Markdown from "./Markdown.jsx";
import { ROLES, ROLE_LIST } from "../data/roles.js";
import { timeAgo } from "../lib/text.js";

const STATUS = [
  { id: "todo", label: "To practice", icon: "🌱" },
  { id: "review", label: "Needs review", icon: "🔁" },
  { id: "confident", label: "Confident", icon: "✅" },
];

export default function Saved({ saved, setSaved, onDeepDive, onPractice, onAddNote }) {
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState(null);

  const list = saved
    .filter((s) => roleFilter === "all" || s.roleId === roleFilter)
    .filter((s) => statusFilter === "all" || (s.status || "todo") === statusFilter)
    .filter((s) => (s.question + " " + (s.myNotes || "")).toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => b.createdAt - a.createdAt);

  const patch = (id, p) => setSaved((all) => all.map((s) => (s.id === id ? { ...s, ...p } : s)));
  const remove = (id) => {
    if (confirm("Remove this saved question?")) setSaved((all) => all.filter((s) => s.id !== id));
  };

  const progress = saved.length ? Math.round((saved.filter((s) => s.status === "confident").length / saved.length) * 100) : 0;

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>⭐ Saved questions</h1>
          <p className="muted">Your personal revision list. Mark how confident you feel and keep quick notes on each question.</p>
        </div>
        <input className="search" placeholder="Search saved…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </header>

      {saved.length > 0 && (
        <div className="progress card">
          <div className="progress-text">
            <strong>{progress}% confident</strong>
            <span className="muted">
              {saved.filter((s) => s.status === "confident").length} of {saved.length} questions
            </span>
          </div>
          <div className="bar">
            <div style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <div className="tabs">
        <button className={`tab ${roleFilter === "all" ? "active" : ""}`} onClick={() => setRoleFilter("all")}>
          All roles
        </button>
        {ROLE_LIST.map((r) => (
          <button key={r.id} className={`tab ${roleFilter === r.id ? "active" : ""}`} style={{ "--rc": r.color }} onClick={() => setRoleFilter(r.id)}>
            {r.emoji} {r.short}
          </button>
        ))}
        <span className="tab-sep" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="select">
          <option value="all">Any status</option>
          {STATUS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.icon} {s.label}
            </option>
          ))}
        </select>
      </div>

      {saved.length === 0 ? (
        <div className="empty card">
          <div className="empty-emoji">⭐</div>
          <h3>Nothing saved yet</h3>
          <p className="muted">Tap “⭐ Save question” in the chat, or the ☆ star in the question bank, to build your revision list.</p>
        </div>
      ) : (
        <div className="saved-list">
          {list.map((s) => {
            const role = ROLES[s.roleId];
            const open = openId === s.id;
            return (
              <article key={s.id} className={`saved-item card ${open ? "open" : ""}`} style={{ "--rc": role.color }}>
                <button className="saved-head" onClick={() => setOpenId(open ? null : s.id)} aria-expanded={open}>
                  <span className="role-dot">{role.emoji}</span>
                  <span className="grow saved-q">{s.question}</span>
                  {s.answer && <span className="tag soft">answer saved</span>}
                  <span className="muted tiny">{timeAgo(s.createdAt)}</span>
                  <span className="chev">{open ? "▾" : "▸"}</span>
                </button>

                {open && (
                  <div className="saved-body">
                    <div className="status-row">
                      {STATUS.map((st) => (
                        <button
                          key={st.id}
                          className={`status-pill ${(s.status || "todo") === st.id ? "on" : ""}`}
                          onClick={() => patch(s.id, { status: st.id })}
                        >
                          {st.icon} {st.label}
                        </button>
                      ))}
                    </div>

                    <label className="field">
                      <span className="field-label">My quick notes</span>
                      <textarea
                        rows={3}
                        value={s.myNotes || ""}
                        placeholder="Key points, my STAR story, things to remember…"
                        onChange={(e) => patch(s.id, { myNotes: e.target.value })}
                      />
                    </label>

                    {s.answer ? (
                      <details className="answer-box" open>
                        <summary>📖 Saved deep-dive answer</summary>
                        <Markdown>{s.answer}</Markdown>
                        {s.sources?.length > 0 && (
                          <div className="link-group">
                            <h3>🌐 Sources</h3>
                            <ul>
                              {s.sources.slice(0, 8).map((src) => (
                                <li key={src.url}>
                                  <a href={src.url} target="_blank" rel="noopener noreferrer">
                                    {src.title}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </details>
                    ) : s.context ? (
                      <details className="answer-box">
                        <summary>💬 From your chat</summary>
                        <Markdown>{s.context}</Markdown>
                      </details>
                    ) : null}

                    <div className="q-actions">
                      <button className="primary small" onClick={() => onDeepDive(s.question, s.roleId)}>
                        🔍 {s.answer ? "Open deep dive" : "Deep dive"}
                      </button>
                      <button className="secondary small" onClick={() => onPractice(s.question, s.roleId)}>
                        🎤 Practice
                      </button>
                      <button
                        className="secondary small"
                        onClick={() =>
                          onAddNote({
                            title: s.question.slice(0, 80),
                            body: [s.myNotes, s.answer].filter(Boolean).join("\n\n---\n\n"),
                            roleId: s.roleId,
                            questionId: s.id,
                          })
                        }
                      >
                        📝 Open as note
                      </button>
                      <span className="grow" />
                      <button className="ghost small danger" onClick={() => remove(s.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
          {list.length === 0 && <p className="muted">No saved questions match these filters.</p>}
        </div>
      )}
    </div>
  );
}
