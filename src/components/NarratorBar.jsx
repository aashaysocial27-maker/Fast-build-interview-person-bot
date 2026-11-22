import { useEffect, useRef, useState } from "react";
import { narrator, useNarrator } from "../lib/narrator.js";

/** Bottom player bar: shows what's being read, highlights the current sentence, and holds voice settings. */
export default function NarratorBar() {
  const n = useNarrator();
  const [showSettings, setShowSettings] = useState(false);
  const activeRef = useRef(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [n.index, n.expanded]);

  const visible = n.status !== "idle" && n.segments.length > 0;
  useEffect(() => {
    document.body.classList.toggle("nar-on", visible);
    return () => document.body.classList.remove("nar-on");
  }, [visible]);

  if (!visible) return null;
  const seg = n.segments[n.index];
  const pct = Math.round(((n.index + 1) / n.segments.length) * 100);

  return (
    <div className={`narrator ${n.expanded ? "expanded" : ""}`} role="region" aria-label="Narrator">
      {n.expanded && (
        <div className="nar-transcript">
          {n.segments.map((s, i) => (
            <span
              key={i}
              ref={i === n.index ? activeRef : null}
              className={`nar-seg ${s.kind} ${i === n.index ? "now" : i < n.index ? "done" : ""}`}
              onClick={() => narrator.jump(i)}
            >
              {s.text}{" "}
            </span>
          ))}
        </div>
      )}

      {showSettings && (
        <div className="nar-settings">
          <label className="nar-field">
            <span>Voice</span>
            <select className="select" value={n.voiceURI} onChange={(e) => narrator.setVoice(e.target.value)}>
              {n.voices.length === 0 && <option value="">System default</option>}
              {n.voices.map((v) => (
                <option key={v.uri} value={v.uri}>
                  {v.natural ? "✨ " : ""}
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </label>
          <label className="nar-field">
            <span>Speed {n.rate.toFixed(1)}×</span>
            <input type="range" min="0.6" max="1.8" step="0.1" value={n.rate} onChange={(e) => narrator.setRate(Number(e.target.value))} />
          </label>
          <label className="check nar-check">
            <input type="checkbox" checked={n.teacher} onChange={(e) => narrator.setTeacher(e.target.checked)} />
            <span>
              <strong>Teacher style</strong>
              <br />
              <span className="muted tiny">Spoken cues ("First…", "Next up…"), longer pauses. Applies to the next thing you play.</span>
            </span>
          </label>
        </div>
      )}

      <div className="nar-main">
        <div className="nar-info">
          <div className="nar-title">
            {n.status === "playing" ? (
              <span className="eq" aria-hidden>
                <i />
                <i />
                <i />
              </span>
            ) : (
              "⏸"
            )}{" "}
            {n.title}
          </div>
          <div className="nar-now">{seg?.text}</div>
        </div>
        <div className="nar-controls">
          <button className="icon-btn" onClick={narrator.prev} aria-label="Previous sentence" title="Previous sentence">
            ⏮
          </button>
          <button className="nar-play" onClick={narrator.toggle} aria-label={n.status === "playing" ? "Pause" : "Play"}>
            {n.status === "playing" ? "❚❚" : "▶"}
          </button>
          <button className="icon-btn" onClick={narrator.next} aria-label="Next sentence" title="Next sentence">
            ⏭
          </button>
          <button
            className={`icon-btn ${n.expanded ? "on" : ""}`}
            onClick={() => narrator.setExpanded(!n.expanded)}
            aria-label="Show transcript"
            title="Follow along (highlighted transcript)"
          >
            📜
          </button>
          <button className={`icon-btn ${showSettings ? "on" : ""}`} onClick={() => setShowSettings((s) => !s)} aria-label="Voice settings" title="Voice, speed & teacher style">
            ⚙️
          </button>
          <button className="icon-btn" onClick={narrator.stop} aria-label="Stop" title="Stop">
            ✕
          </button>
        </div>
      </div>
      <div className="nar-progress">
        <div style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
