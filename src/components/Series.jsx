import { useEffect, useRef, useState } from "react";
import Markdown from "./Markdown.jsx";
import AnswerRecorder from "./AnswerRecorder.jsx";
import EvaluationCard from "./EvaluationCard.jsx";
import { seriesFor } from "../data/series.js";
import { evaluateAnswer } from "../lib/evaluate.js";
import ListenButton from "./ListenButton.jsx";
import { timeAgo } from "../lib/text.js";

const best = (list) => (list?.length ? Math.max(...list.map((a) => a.eval?.overall ?? 0)) : null);

export default function Series({ role, ai, attempts, setAttempts, moduleId, setModuleId, onSave, onDeepDive, onAddNote, isSaved }) {
  const modules = seriesFor(role.id);
  const mod = modules.find((m) => m.id === moduleId);

  if (!mod) return <ModuleList role={role} modules={modules} attempts={attempts} onOpen={setModuleId} />;
  return (
    <ModuleView
      key={mod.id}
      role={role}
      mod={mod}
      ai={ai}
      attempts={attempts}
      setAttempts={setAttempts}
      onBack={() => setModuleId(null)}
      onSave={onSave}
      onDeepDive={onDeepDive}
      onAddNote={onAddNote}
      isSaved={isSaved}
    />
  );
}

function ModuleList({ role, modules, attempts, onOpen }) {
  const all = modules.flatMap((m) => m.questions);
  const practiced = all.filter((q) => attempts[q.id]?.length).length;
  const bests = all.map((q) => best(attempts[q.id])).filter((x) => x != null);
  const avg = bests.length ? (bests.reduce((a, b) => a + b, 0) / bests.length).toFixed(1) : "—";

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>🎓 {role.name} question series</h1>
          <p className="muted">
            A guided path through the topics interviewers ask most. Answer each question out loud, get scored by the evaluator, then compare
            with the model answer.
          </p>
        </div>
      </header>

      <div className="series-stats">
        <div className="card stat-card">
          <span className="muted tiny">Questions practiced</span>
          <b>
            {practiced}/{all.length}
          </b>
        </div>
        <div className="card stat-card">
          <span className="muted tiny">Average best score</span>
          <b>{avg}</b>
        </div>
        <div className="card stat-card">
          <span className="muted tiny">Modules</span>
          <b>{modules.length}</b>
        </div>
      </div>

      <div className="module-grid">
        {modules.map((m, i) => {
          const done = m.questions.filter((q) => attempts[q.id]?.length).length;
          const pct = Math.round((done / m.questions.length) * 100);
          const scores = m.questions.map((q) => best(attempts[q.id])).filter((x) => x != null);
          const mAvg = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : null;
          return (
            <article key={m.id} className="module-card card" style={{ "--rc": role.color }}>
              <div className="module-num">Module {i + 1}</div>
              <div className="module-emoji">{m.emoji}</div>
              <h3>{m.title}</h3>
              <p className="muted small-text">{m.summary}</p>
              <ol className="module-qs">
                {m.questions.map((q) => {
                  const b = best(attempts[q.id]);
                  return (
                    <li key={q.id}>
                      <span className="grow">{q.q}</span>
                      {b != null && <span className={`mini-score ${b >= 8 ? "good" : b >= 6 ? "warn" : "bad"}`}>{b.toFixed(1)}</span>}
                    </li>
                  );
                })}
              </ol>
              <div className="bar">
                <div style={{ width: `${pct}%` }} />
              </div>
              <div className="module-foot">
                <span className="muted tiny">
                  {done}/{m.questions.length} practiced{mAvg ? ` · avg ${mAvg}` : ""}
                </span>
                <button className="primary small" onClick={() => onOpen(m.id)}>
                  {done === 0 ? "Start ▶" : done === m.questions.length ? "Review" : "Continue ▶"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function ModuleView({ role, mod, ai, attempts, setAttempts, onBack, onSave, onDeepDive, onAddNote, isSaved }) {
  const firstOpen = Math.max(0, mod.questions.findIndex((q) => !attempts[q.id]?.length));
  const [idx, setIdx] = useState(firstOpen);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showTip, setShowTip] = useState(false);
  const [reveal, setReveal] = useState(false);
  const abortRef = useRef(null);
  const evalRef = useRef(null);

  const q = mod.questions[idx];
  const history = attempts[q.id] || [];
  const last = history[history.length - 1];

  useEffect(() => {
    setReveal(false);
    setShowTip(false);
    setError("");
    abortRef.current?.abort();
    setBusy(false);
  }, [q.id]);
  useEffect(() => () => abortRef.current?.abort(), []);

  async function evaluate({ answer, metrics }) {
    const controller = new AbortController();
    abortRef.current = controller;
    setBusy(true);
    setError("");
    try {
      const ev = await evaluateAnswer({
        ai,
        roleId: role.id,
        question: q.q,
        modelAnswer: q.modelAnswer,
        keyPoints: q.keyPoints,
        answer,
        metrics,
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      setAttempts((all) => ({ ...all, [q.id]: [...(all[q.id] || []), { ts: Date.now(), answer, metrics, eval: ev }].slice(-10) }));
      setReveal(true);
      setTimeout(() => evalRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } catch (err) {
      if (!controller.signal.aborted) setError(err.message || String(err));
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  }

  return (
    <div className="page series-page">
      <div className="series-top">
        <button className="ghost small" onClick={onBack}>
          ← All modules
        </button>
        <div className="grow">
          <div className="muted tiny">{role.name}</div>
          <h2 className="series-title">
            {mod.emoji} {mod.title}
          </h2>
        </div>
        <ListenButton
          id={`mod-${mod.id}`}
          title={`${mod.title} — listen & learn`}
          parts={mod.questions.flatMap((x, i) => [
            { intro: `Question ${i + 1} of ${mod.questions.length}. ${x.q} Think about how you'd answer. Here's a model answer.`, markdown: x.modelAnswer },
          ])}
          intro={mod.title}
          label="Play whole module"
          className="big"
        />
      </div>

      <div className="stepper" style={{ "--rc": role.color }}>
        {mod.questions.map((x, i) => {
          const b = best(attempts[x.id]);
          return (
            <button key={x.id} className={`step ${i === idx ? "active" : ""} ${b != null ? "done" : ""}`} onClick={() => setIdx(i)} title={x.q}>
              <span className="step-num">{b != null ? "✓" : i + 1}</span>
              <span className="step-label">Question {i + 1}</span>
              {b != null && <span className="step-score">{b.toFixed(1)}</span>}
            </button>
          );
        })}
      </div>

      <section className="question-card card" style={{ "--rc": role.color }}>
        <div className="qc-meta">
          <span className="tag">
            Question {idx + 1} of {mod.questions.length}
          </span>
          <span className="grow" />
          <ListenButton id={`q-${q.id}`} title={`Question ${idx + 1}`} markdown={q.q} intro={`Question ${idx + 1}.`} label="Read aloud" />
          <button
            className={`icon-btn star ${isSaved(q.q, role.id) ? "on" : ""}`}
            title="Save question"
            onClick={() => onSave({ question: q.q, roleId: role.id, answer: q.modelAnswer, source: "series" })}
          >
            {isSaved(q.q, role.id) ? "★" : "☆"}
          </button>
        </div>
        <h2 className="qc-text">{q.q}</h2>
        <button className="tip-toggle" onClick={() => setShowTip((s) => !s)}>
          💡 {showTip ? "Hide hint" : "Need a hint?"}
        </button>
        {showTip && <div className="tip">{q.tip}</div>}
      </section>

      <AnswerRecorder key={q.id} onSubmit={evaluate} busy={busy} />
      {error && <div className="alert error">{error}</div>}

      <div ref={evalRef} className="scroll-anchor">{last && <EvaluationCard evaluation={last.eval} metrics={last.metrics} />}</div>

      {history.length > 1 && (
        <div className="history card">
          <span className="muted tiny">Your attempts:</span>
          {history.map((a, i) => (
            <span key={a.ts} className={`mini-score ${a.eval.overall >= 8 ? "good" : a.eval.overall >= 6 ? "warn" : "bad"}`} title={timeAgo(a.ts)}>
              #{i + 1} · {a.eval.overall.toFixed(1)}
            </span>
          ))}
        </div>
      )}

      <section className="model-answer card">
        <div className="ma-head">
          <h3>📘 Model answer</h3>
          <span className="grow" />
          {reveal && (
            <ListenButton
              id={`ma-${q.id}`}
              title={`Model answer · Q${idx + 1}`}
              parts={[
                { intro: `Question ${idx + 1}. ${q.q} Here's a model answer.`, markdown: q.modelAnswer },
                { intro: "Now, the key points interviewers listen for.", markdown: q.keyPoints.map((k) => `- ${k}`).join("\n") },
              ]}
              label="Listen to model answer"
            />
          )}
          {!reveal && (
            <button className="secondary small" onClick={() => setReveal(true)}>
              {history.length ? "Show model answer" : "Reveal anyway"}
            </button>
          )}
        </div>
        {reveal ? (
          <>
            <Markdown>{q.modelAnswer}</Markdown>
            <div className="keypoints">
              <h4>🔑 Key points interviewers listen for</h4>
              <ul>
                {q.keyPoints.map((k) => (
                  <li key={k}>{k}</li>
                ))}
              </ul>
            </div>
            <div className="q-actions">
              <button className="secondary small" onClick={() => onDeepDive(q.q, role.id)}>
                🔍 Deep dive with sources
              </button>
              <button
                className="secondary small"
                onClick={() =>
                  onAddNote({
                    title: q.q.slice(0, 80),
                    body: `${q.modelAnswer}\n\n### Key points\n${q.keyPoints.map((k) => `- ${k}`).join("\n")}${
                      last ? `\n\n### My last attempt (${last.eval.overall}/10)\n${last.answer}` : ""
                    }`,
                    roleId: role.id,
                  })
                }
              >
                📝 Add to notes
              </button>
            </div>
          </>
        ) : (
          <p className="muted small-text">Try answering first — you'll learn far more by comparing your answer with this one afterwards.</p>
        )}
      </section>

      <div className="series-nav">
        <button className="secondary" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>
          ← Previous
        </button>
        <span className="grow" />
        {idx < mod.questions.length - 1 ? (
          <button className="primary" onClick={() => setIdx(idx + 1)}>
            Next question →
          </button>
        ) : (
          <button className="primary" onClick={onBack}>
            Finish module 🎉
          </button>
        )}
      </div>
    </div>
  );
}
