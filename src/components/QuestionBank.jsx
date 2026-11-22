import { useState } from "react";

export default function QuestionBank({ role, onDeepDive, onSave, onPractice, isSaved }) {
  const [cat, setCat] = useState("All");
  const [query, setQuery] = useState("");
  const list = role.questions.filter(
    (q) => (cat === "All" || q.cat === cat) && q.q.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>
            {role.emoji} {role.name} question bank
          </h1>
          <p className="muted">Hand-picked questions that come up often. Deep-dive any of them, practice out loud, or save for later.</p>
        </div>
        <input className="search" placeholder="Search questions…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </header>

      <div className="tabs">
        {["All", ...role.categories].map((c) => (
          <button key={c} className={`tab ${cat === c ? "active" : ""}`} style={{ "--rc": role.color }} onClick={() => setCat(c)}>
            {c}
          </button>
        ))}
      </div>

      <div className="q-grid">
        {list.map((q) => {
          const saved = isSaved(q.q, role.id);
          return (
            <article key={q.q} className="q-card card">
              <div className="q-meta">
                <span className="tag" style={{ "--rc": role.color }}>
                  {q.cat}
                </span>
                <span className={`level ${q.level === "Advanced" ? "adv" : ""}`}>{q.level}</span>
              </div>
              <p className="q-text">{q.q}</p>
              <div className="q-actions">
                <button className="primary small" onClick={() => onDeepDive(q.q)}>
                  🔍 Deep dive
                </button>
                <button className="secondary small" onClick={() => onPractice(q.q, role.id)}>
                  🎤 Practice
                </button>
                <button
                  className={`icon-btn star ${saved ? "on" : ""}`}
                  title={saved ? "Saved" : "Save question"}
                  onClick={() => onSave({ question: q.q, roleId: role.id, source: "bank" })}
                >
                  {saved ? "★" : "☆"}
                </button>
              </div>
            </article>
          );
        })}
        {list.length === 0 && <p className="muted">No questions match. Try another filter or ask the coach in Practice chat.</p>}
      </div>
    </div>
  );
}
