import { useMemo } from "react";
import { deliveryMetrics, paceLabel, useSpeech } from "../lib/speech.js";

const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/** Microphone recorder with live transcript and delivery stats; also works as a typed answer box. */
export default function AnswerRecorder({ onSubmit, busy, submitLabel = "✨ Evaluate my answer" }) {
  const speech = useSpeech();
  const text = speech.transcript;
  const metrics = useMemo(() => deliveryMetrics(text, speech.seconds), [text, speech.seconds]);
  const pace = paceLabel(metrics.wpm);
  const spoken = speech.seconds > 0;

  function submit() {
    if (speech.listening) speech.stop();
    const answer = (text + (speech.interim ? ` ${speech.interim}` : "")).trim();
    if (!answer) return;
    onSubmit({ answer, metrics: spoken ? deliveryMetrics(answer, speech.seconds) : { ...deliveryMetrics(answer, 0), wpm: null } });
  }

  return (
    <div className={`recorder card ${speech.listening ? "live" : ""}`}>
      <div className="rec-top">
        {speech.supported ? (
          speech.listening ? (
            <button className="mic-btn on" onClick={speech.stop} aria-label="Stop recording">
              <span className="mic-ring" />■
            </button>
          ) : (
            <button className="mic-btn" onClick={speech.start} disabled={busy} aria-label="Start recording">
              🎙️
            </button>
          )
        ) : (
          <div className="mic-btn disabled" title="Voice not supported in this browser">
            🎙️
          </div>
        )}
        <div className="rec-status grow">
          <strong>{speech.listening ? "Listening… answer as if you're in the interview" : spoken ? "Recording paused" : "Answer out loud or type"}</strong>
          <div className="muted tiny">
            {speech.supported
              ? speech.listening
                ? "Click ■ when you're done. You can edit the transcript before evaluating."
                : "Press the mic and speak. Your voice is transcribed by your browser."
              : "Voice input works in Chrome, Edge and Safari. In this browser, type your answer below."}
          </div>
        </div>
        <div className="rec-timer mono">{fmt(speech.seconds)}</div>
      </div>

      {speech.error && <div className="alert error">{speech.error}</div>}

      <textarea
        className="rec-text"
        rows={6}
        value={text}
        onChange={(e) => speech.setTranscript(e.target.value)}
        placeholder="Your answer will appear here as you speak — or type it."
      />
      {speech.interim && <div className="interim">{speech.interim}…</div>}

      <div className="rec-foot">
        <div className="stats">
          <span className="stat">
            <b>{metrics.words}</b> words
          </span>
          {spoken && (
            <span className={`stat ${pace.tone}`}>
              <b>{metrics.wpm ?? "—"}</b> wpm · {pace.label}
            </span>
          )}
          {spoken && (
            <span className={`stat ${metrics.fillerRate > 4 ? "bad" : metrics.fillerRate > 2 ? "warn" : "good"}`}>
              <b>{metrics.fillerCount}</b> fillers
            </span>
          )}
        </div>
        <span className="grow" />
        {(text || spoken) && (
          <button className="ghost small" onClick={speech.reset} disabled={busy}>
            ↺ Start over
          </button>
        )}
        <button className="primary" onClick={submit} disabled={busy || !(text || speech.interim).trim()}>
          {busy ? <span className="spinner" /> : null}
          {busy ? "Evaluating…" : submitLabel}
        </button>
      </div>
    </div>
  );
}
