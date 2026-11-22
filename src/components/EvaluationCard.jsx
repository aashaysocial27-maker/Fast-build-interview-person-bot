import { paceLabel } from "../lib/speech.js";
import ListenButton from "./ListenButton.jsx";

const LABELS = { content: "Content", structure: "Structure", communication: "Communication", depth: "Depth" };

function tone(score) {
  if (score >= 8) return "good";
  if (score >= 6) return "warn";
  return "bad";
}

export default function EvaluationCard({ evaluation: ev, metrics }) {
  const pct = Math.round((ev.overall / 10) * 100);
  const pace = paceLabel(metrics?.wpm);
  return (
    <section className="eval card" aria-label="Evaluation">
      <div className="eval-head">
        <div className={`score-ring ${tone(ev.overall)}`} style={{ "--pct": pct }}>
          <div>
            <b>{ev.overall.toFixed(1)}</b>
            <span>/10</span>
          </div>
        </div>
        <div className="grow">
          <div className="eval-kicker">Evaluator feedback</div>
          {ev.verdict && <div className={`verdict ${tone(ev.overall)}`}>{ev.verdict}</div>}
          <div className="score-bars">
            {Object.entries(LABELS).map(([k, label]) => (
              <div key={k} className="score-bar">
                <span>{label}</span>
                <div className="bar">
                  <div className={tone(ev.scores[k])} style={{ width: `${ev.scores[k] * 10}%` }} />
                </div>
                <b>{ev.scores[k]}</b>
              </div>
            ))}
          </div>
        </div>
      </div>

      {metrics?.wpm != null && (
        <div className="delivery">
          <div className="delivery-item">
            <span className="muted tiny">Duration</span>
            <b>
              {Math.floor(metrics.seconds / 60)}m {metrics.seconds % 60}s
            </b>
          </div>
          <div className={`delivery-item ${pace.tone}`}>
            <span className="muted tiny">Pace</span>
            <b>
              {metrics.wpm} wpm · {pace.label}
            </b>
          </div>
          <div className={`delivery-item ${metrics.fillerRate > 4 ? "bad" : metrics.fillerRate > 2 ? "warn" : "good"}`}>
            <span className="muted tiny">Filler words</span>
            <b>
              {metrics.fillerCount}
              {metrics.fillerCount > 0 && (
                <span className="muted tiny">
                  {" "}
                  ({Object.entries(metrics.fillers)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
                    .map(([w, n]) => `"${w}" ×${n}`)
                    .join(", ")})
                </span>
              )}
            </b>
          </div>
        </div>
      )}

      <div className="eval-grid">
        {ev.covered.length > 0 && (
          <div>
            <h4>✅ You covered</h4>
            <div className="pill-list">
              {ev.covered.map((c) => (
                <span key={c} className="pill good">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}
        {ev.missed.length > 0 && (
          <div>
            <h4>🧩 You missed</h4>
            <div className="pill-list">
              {ev.missed.map((c) => (
                <span key={c} className="pill bad">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}
        {ev.strengths.length > 0 && (
          <div>
            <h4>💪 Strengths</h4>
            <ul>
              {ev.strengths.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        )}
        {ev.improvements.length > 0 && (
          <div>
            <h4>🎯 How to improve</h4>
            <ul>
              {ev.improvements.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {ev.improvedAnswer && (
        <details className="answer-box">
          <summary>✍️ Your answer, improved</summary>
          <div className="box-actions">
            <ListenButton id={`improved-${ev.improvedAnswer.length}-${ev.overall}`} title="Your answer, improved" markdown={ev.improvedAnswer} label="Listen" />
          </div>
          <p className="improved">{ev.improvedAnswer}</p>
        </details>
      )}
      {ev.followUp && (
        <div className="follow-up">
          <span>🔁 Likely follow-up:</span> {ev.followUp}
        </div>
      )}
    </section>
  );
}
