// Narrator: reads Markdown aloud sentence by sentence with the browser's speech synthesis.
// A single global player so one bottom bar can control whatever is playing.
import { useSyncExternalStore } from "react";
import { readJSON, writeJSON } from "./storage.js";

const synth = typeof window !== "undefined" ? window.speechSynthesis : undefined;
export const ttsSupported = !!synth;

const PREFS_KEY = "preppilot:narrator";
const prefs = readJSON(PREFS_KEY, { rate: 1, voiceURI: "", teacher: true });

let state = {
  status: "idle", // idle | playing | paused
  id: null,
  title: "",
  segments: [],
  index: 0,
  rate: prefs.rate,
  voiceURI: prefs.voiceURI,
  teacher: prefs.teacher,
  voices: [],
  expanded: false,
};

const listeners = new Set();
function set(patch) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}
function savePrefs() {
  writeJSON(PREFS_KEY, { rate: state.rate, voiceURI: state.voiceURI, teacher: state.teacher });
}

export function useNarrator() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state
  );
}

// ---------- voices ----------

const NATURAL = /(natural|neural|google|online|enhanced|premium|siri|aria|jenny|guy|samantha|daniel)/i;

function loadVoices() {
  if (!synth) return;
  const all = synth.getVoices().filter((v) => /^en(-|_|$)/i.test(v.lang));
  const sorted = [...all].sort((a, b) => {
    const na = NATURAL.test(a.name) ? 0 : 1;
    const nb = NATURAL.test(b.name) ? 0 : 1;
    if (na !== nb) return na - nb;
    const la = a.lang === "en-US" ? 0 : 1;
    const lb = b.lang === "en-US" ? 0 : 1;
    return la - lb || a.name.localeCompare(b.name);
  });
  const voices = sorted.map((v) => ({ uri: v.voiceURI, name: v.name, lang: v.lang, natural: NATURAL.test(v.name) }));
  const keep = voices.some((v) => v.uri === state.voiceURI);
  set({ voices, voiceURI: keep ? state.voiceURI : voices[0]?.uri || "" });
}
if (synth) {
  loadVoices();
  synth.addEventListener?.("voiceschanged", loadVoices);
}

function currentVoice() {
  return synth?.getVoices().find((v) => v.voiceURI === state.voiceURI) || null;
}

// ---------- Markdown → spoken segments ----------

const ORDINALS = ["First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh", "Eighth", "Ninth", "Tenth"];

function cleanInline(s) {
  return s
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/(\*\*|__|\*|_|~~)/g, "")
    .replace(/\p{Extended_Pictographic}|️|‍/gu, "")
    .replace(/\be\.g\.,?/gi, "for example,")
    .replace(/\bi\.e\.,?/gi, "that is,")
    .replace(/\betc\./gi, "and so on.")
    .replace(/\bvs\b\.?/gi, "versus")
    .replace(/→|->/g, " then ")
    .replace(/≈|~(?=\d)/g, "about ")
    .replace(/×/g, " times ")
    .replace(/\s·\s/g, " dot ")
    .replace(/√/g, " square root of ")
    .replace(/ᵀ/g, " transpose")
    .replace(/≥/g, " at least ")
    .replace(/≤/g, " at most ")
    .replace(/\bA\/B\b/g, "A B")
    .replace(/(?<=[a-z]{2})\/(?=[a-z]{2})/g, " or ")
    .replace(/\s\/\s/g, " divided by ")
    .replace(/[|#>]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sentences(text) {
  return text
    .split(/(?<=[.!?])\s+(?=["'(A-Z0-9])/)
    .map((s) => s.trim())
    .filter((s) => /[a-z0-9]/i.test(s));
}

/** Turns Markdown into an ordered list of { text, pause, kind } to speak. */
export function markdownToSegments(md, { teacher = true, intro } = {}) {
  const out = [];
  const push = (text, pause = 250, kind = "sentence") => {
    const t = cleanInline(text);
    if (t && /[a-z0-9]/i.test(t)) out.push({ text: t, pause, kind });
  };
  if (intro) push(intro, teacher ? 700 : 400, "cue");

  const lines = (md || "").replace(/\r/g, "").split("\n");
  let inCode = false;
  let tableHeader = null;
  let listCount = 0;

  for (const raw of lines) {
    const line = raw.trim();
    if (line.startsWith("```")) {
      if (!inCode && teacher) push("There's a code example here. Have a look at it on screen.", 600, "cue");
      inCode = !inCode;
      continue;
    }
    if (inCode) continue;
    if (!line) {
      listCount = 0;
      tableHeader = null;
      continue;
    }

    // tables
    if (line.startsWith("|")) {
      const cells = line.split("|").slice(1, -1).map((c) => cleanInline(c));
      if (cells.every((c) => /^:?-{2,}:?$/.test(c.replace(/\s/g, "")))) continue;
      if (!tableHeader) {
        tableHeader = cells;
        if (teacher) push("Here's a quick comparison.", 400, "cue");
        continue;
      }
      push(cells.map((c, i) => (tableHeader[i] ? `${tableHeader[i]}: ${c}` : c)).join(". ") + ".", 350);
      continue;
    }
    tableHeader = null;

    // headings
    const h = line.match(/^#{1,6}\s+(.*)/);
    if (h) {
      const title = cleanInline(h[1]);
      if (title) push(teacher ? `Next up: ${title}.` : `${title}.`, teacher ? 700 : 400, "heading");
      listCount = 0;
      continue;
    }

    // list items
    const li = line.match(/^(?:[-*+]|(\d+)[.)])\s+(.*)/);
    if (li) {
      const body = li[2];
      const parts = sentences(cleanInline(body));
      parts.forEach((p, i) => {
        let text = p;
        if (i === 0 && teacher && li[1]) {
          const lower = /^[A-Z][a-z]*\s+[a-z]/.test(p) ? p[0].toLowerCase() + p.slice(1) : p;
          text = `${ORDINALS[listCount] || `Point ${listCount + 1}`}, ${lower}`;
        }
        push(/[.!?]$/.test(text) ? text : `${text}.`, i === parts.length - 1 ? (teacher ? 450 : 250) : 200);
      });
      listCount++;
      continue;
    }

    // paragraph / blockquote
    for (const s of sentences(cleanInline(line.replace(/^>\s*/, "")))) push(s, teacher ? 300 : 200);
  }
  return out;
}

// ---------- playback ----------

let token = 0;
let pauseTimer = null;

function speakCurrent() {
  if (!synth) return;
  clearTimeout(pauseTimer);
  const my = ++token;
  synth.cancel();
  const seg = state.segments[state.index];
  if (!seg) {
    set({ status: "idle", index: 0 });
    return;
  }
  const u = new SpeechSynthesisUtterance(seg.text);
  const v = currentVoice();
  if (v) {
    u.voice = v;
    u.lang = v.lang;
  }
  u.rate = state.rate;
  u.pitch = state.teacher && seg.kind !== "sentence" ? 1.08 : 1;
  u.onend = () => {
    if (my !== token || state.status !== "playing") return;
    pauseTimer = setTimeout(() => {
      if (my !== token || state.status !== "playing") return;
      if (state.index + 1 >= state.segments.length) {
        set({ status: "idle", index: 0 });
        return;
      }
      set({ index: state.index + 1 });
      speakCurrent();
    }, seg.pause / state.rate);
  };
  u.onerror = (e) => {
    if (e.error === "interrupted" || e.error === "canceled") return;
    if (my === token) set({ status: "paused" });
  };
  synth.speak(u);
}

export const narrator = {
  /** Start reading. `items` is either a markdown string or an array of {title?, markdown} parts. */
  play({ id, title, markdown, parts, intro }) {
    if (!synth) return;
    const t = state.teacher;
    let segments = [];
    if (parts) {
      for (const p of parts) {
        const segs = markdownToSegments(p.markdown, { teacher: t, intro: p.intro });
        if (segs.length) segs[segs.length - 1].pause = t ? 1100 : 600; // breathing room between parts
        segments.push(...segs);
      }
    } else {
      segments = markdownToSegments(markdown, { teacher: t, intro });
    }
    if (t && segments.length > 3) segments.push({ text: "That's it. Now try saying it back in your own words.", pause: 0, kind: "cue" });
    if (!segments.length) return;
    set({ id, title, segments, index: 0, status: "playing" });
    speakCurrent();
  },
  toggle() {
    if (state.status === "playing") narrator.pause();
    else if (state.status === "paused") narrator.resume();
  },
  pause() {
    token++;
    clearTimeout(pauseTimer);
    synth?.cancel();
    set({ status: "paused" });
  },
  resume() {
    if (!state.segments.length) return;
    set({ status: "playing" });
    speakCurrent();
  },
  jump(i) {
    if (i < 0 || i >= state.segments.length) return;
    set({ index: i, status: "playing" });
    speakCurrent();
  },
  next() {
    narrator.jump(Math.min(state.index + 1, state.segments.length - 1));
  },
  prev() {
    narrator.jump(Math.max(state.index - 1, 0));
  },
  stop() {
    token++;
    clearTimeout(pauseTimer);
    synth?.cancel();
    set({ status: "idle", id: null, title: "", segments: [], index: 0, expanded: false });
  },
  setRate(rate) {
    set({ rate });
    savePrefs();
    if (state.status === "playing") speakCurrent();
  },
  setVoice(voiceURI) {
    set({ voiceURI });
    savePrefs();
    if (state.status === "playing") speakCurrent();
  },
  setTeacher(teacher) {
    set({ teacher });
    savePrefs();
  },
  setExpanded(expanded) {
    set({ expanded });
  },
};
