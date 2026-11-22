/** Best-effort extraction of the interview question from an assistant message. */
export function extractQuestion(text) {
  if (!text) return "";
  const labelled = text.match(/\*\*Question:?\*\*:?\s*([\s\S]+?)(?:\n\s*\n|$)/i);
  if (labelled) return clean(labelled[1]);
  const lines = text.split("\n").map(clean).filter(Boolean);
  const q = lines.find((l) => l.endsWith("?") && l.length > 20);
  if (q) return q;
  return clean(text).slice(0, 220);
}

function clean(s) {
  return s
    .replace(/[*_`>#]/g, "")
    .replace(/^\s*[-•]\s*/, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(ts).toLocaleDateString();
}
