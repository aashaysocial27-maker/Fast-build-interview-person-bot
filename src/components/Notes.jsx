import { useState } from "react";
import Markdown from "./Markdown.jsx";
import { ROLES, ROLE_LIST } from "../data/roles.js";
import { timeAgo } from "../lib/text.js";

export default function Notes({ notes, setNotes, activeId, setActiveId, createNote, currentRoleId }) {
  const [query, setQuery] = useState("");
  const [preview, setPreview] = useState(false);

  const list = notes
    .filter((n) => (n.title + " " + n.body).toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => b.updatedAt - a.updatedAt);
  const active = notes.find((n) => n.id === activeId) || null;

  const patch = (p) => setNotes((all) => all.map((n) => (n.id === activeId ? { ...n, ...p, updatedAt: Date.now() } : n)));

  function remove() {
    if (!active || !confirm(`Delete “${active.title || "Untitled"}”?`)) return;
    setNotes((all) => all.filter((n) => n.id !== active.id));
    setActiveId(null);
  }

  function download() {
    const blob = new Blob([`# ${active.title}\n\n${active.body}`], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${(active.title || "note").replace(/[^\w-]+/g, "_").slice(0, 50)}.md`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className={`notes ${active ? "has-active" : ""}`}>
      <aside className="notes-list card">
        <div className="notes-list-head">
          <h2>📝 Notes</h2>
          <button className="primary small" onClick={() => createNote({ roleId: currentRoleId })}>
            + New
          </button>
        </div>
        <input className="search" placeholder="Search notes…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <div className="notes-items">
          {list.map((n) => {
            const role = ROLES[n.roleId];
            return (
              <button key={n.id} className={`note-item ${n.id === activeId ? "active" : ""}`} onClick={() => setActiveId(n.id)}>
                <div className="note-title">
                  {role ? role.emoji : "🗒️"} {n.title || "Untitled"}
                </div>
                <div className="note-snippet">{n.body.replace(/[#*`>_-]/g, "").slice(0, 90) || "Empty note"}</div>
                <div className="muted tiny">{timeAgo(n.updatedAt)}</div>
              </button>
            );
          })}
          {notes.length === 0 && (
            <div className="empty small">
              <div className="empty-emoji">📝</div>
              <p className="muted">No notes yet. Create one, or use “📝 Add to notes” on any chat reply or deep dive.</p>
            </div>
          )}
        </div>
      </aside>

      <section className="note-editor card">
        {active ? (
          <>
            <div className="editor-bar">
              <button className="ghost small back-btn" onClick={() => setActiveId(null)}>
                ← All notes
              </button>
              <select className="select" value={active.roleId || ""} onChange={(e) => patch({ roleId: e.target.value || null })}>
                <option value="">General</option>
                {ROLE_LIST.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.emoji} {r.name}
                  </option>
                ))}
              </select>
              <div className="seg">
                <button className={!preview ? "on" : ""} onClick={() => setPreview(false)}>
                  ✏️ Write
                </button>
                <button className={preview ? "on" : ""} onClick={() => setPreview(true)}>
                  👀 Preview
                </button>
              </div>
              <span className="grow" />
              <span className="muted tiny">Saved {timeAgo(active.updatedAt)}</span>
              <button className="ghost small" onClick={download} title="Download as Markdown">
                ⬇︎ .md
              </button>
              <button className="ghost small danger" onClick={remove}>
                Delete
              </button>
            </div>
            <input className="note-title-input" value={active.title} onChange={(e) => patch({ title: e.target.value })} placeholder="Note title" />
            {preview ? (
              <div className="note-preview">
                <Markdown>{active.body || "_Nothing here yet._"}</Markdown>
              </div>
            ) : (
              <textarea
                className="note-body"
                value={active.body}
                onChange={(e) => patch({ body: e.target.value })}
                placeholder={"Write in Markdown…\n\n## Key idea\n- bullet points\n- **bold** for terms"}
              />
            )}
          </>
        ) : (
          <div className="empty">
            <div className="empty-emoji">📒</div>
            <h3>Pick a note or start a new one</h3>
            <p className="muted">Notes autosave as you type and support Markdown.</p>
          </div>
        )}
      </section>
    </div>
  );
}
