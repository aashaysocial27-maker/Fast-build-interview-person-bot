import { narrator, ttsSupported, useNarrator } from "../lib/narrator.js";

/**
 * Play / pause toggle for one piece of content.
 * Pass `markdown` (or `parts` for a playlist) and a stable `id`.
 */
export default function ListenButton({ id, title, markdown, parts, intro, label = "Listen", className = "", disabled }) {
  const n = useNarrator();
  if (!ttsSupported) return null;
  const active = n.id === id && n.status !== "idle";
  const playing = active && n.status === "playing";

  function onClick() {
    if (active) narrator.toggle();
    else narrator.play({ id, title, markdown, parts, intro });
  }

  return (
    <button
      type="button"
      className={`listen-btn ${playing ? "playing" : ""} ${className}`}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={playing}
      title={playing ? "Pause" : active ? "Resume" : `${label} (read aloud)`}
    >
      {playing ? (
        <>
          <span className="eq" aria-hidden>
            <i />
            <i />
            <i />
          </span>
          Pause
        </>
      ) : (
        <>{active ? "▶ Resume" : `🔊 ${label}`}</>
      )}
    </button>
  );
}
