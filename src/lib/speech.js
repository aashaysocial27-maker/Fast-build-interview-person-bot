// Browser speech recognition (Web Speech API) + delivery metrics.
// Supported in Chrome, Edge and Safari. Firefox users can type their answer instead.
import { useCallback, useEffect, useRef, useState } from "react";

const Recognition = typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : undefined;

export const speechSupported = !!Recognition;

/**
 * useSpeech() → { supported, listening, transcript, interim, seconds, error, start, stop, reset, setTranscript }
 * `transcript` is the finalized text; `interim` is the live guess for the current phrase.
 */
export function useSpeech({ lang = "en-US" } = {}) {
  const recRef = useRef(null);
  const wantRef = useRef(false); // user still wants to listen (Chrome stops after silence)
  const startedAtRef = useRef(0);
  const accumulatedRef = useRef(0);
  const timerRef = useRef(null);

  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState("");

  const tick = useCallback(() => {
    setSeconds(Math.round((accumulatedRef.current + (Date.now() - startedAtRef.current)) / 1000));
  }, []);

  const stop = useCallback(() => {
    wantRef.current = false;
    if (startedAtRef.current) {
      accumulatedRef.current += Date.now() - startedAtRef.current;
      startedAtRef.current = 0;
    }
    clearInterval(timerRef.current);
    try {
      recRef.current?.stop();
    } catch {
      /* already stopped */
    }
    setListening(false);
    setInterim("");
  }, []);

  const start = useCallback(() => {
    if (!Recognition) {
      setError("Speech recognition isn't supported in this browser. Try Chrome or Edge, or type your answer.");
      return;
    }
    setError("");
    const rec = new Recognition();
    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (e) => {
      let finalText = "";
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else interimText += r[0].transcript;
      }
      if (finalText) setTranscript((t) => (t ? `${t.trimEnd()} ${finalText.trim()}` : finalText.trim()));
      setInterim(interimText);
    };
    rec.onerror = (e) => {
      if (e.error === "no-speech" || e.error === "aborted") return;
      const messages = {
        "not-allowed": "Microphone access was blocked. Allow the microphone in your browser's address bar and try again.",
        "audio-capture": "No microphone found. Plug one in or type your answer instead.",
        network: "Speech recognition needs an internet connection.",
      };
      setError(messages[e.error] || `Speech recognition error: ${e.error}`);
      wantRef.current = false;
    };
    rec.onend = () => {
      // Chrome ends the session after a pause — restart while the user is still recording.
      if (wantRef.current) {
        try {
          rec.start();
          return;
        } catch {
          /* fall through */
        }
      }
      stop();
    };

    recRef.current = rec;
    wantRef.current = true;
    startedAtRef.current = Date.now();
    clearInterval(timerRef.current);
    timerRef.current = setInterval(tick, 500);
    try {
      rec.start();
      setListening(true);
    } catch (err) {
      setError(String(err?.message || err));
      stop();
    }
  }, [lang, stop, tick]);

  const reset = useCallback(() => {
    stop();
    setTranscript("");
    setInterim("");
    setSeconds(0);
    accumulatedRef.current = 0;
    setError("");
  }, [stop]);

  useEffect(
    () => () => {
      wantRef.current = false;
      clearInterval(timerRef.current);
      try {
        recRef.current?.abort();
      } catch {
        /* ignore */
      }
    },
    []
  );

  return { supported: speechSupported, listening, transcript, interim, seconds, error, start, stop, reset, setTranscript };
}

const FILLERS = ["um", "uh", "erm", "uhm", "like", "you know", "basically", "actually", "literally", "sort of", "kind of", "i mean", "so yeah"];

/** Delivery metrics computed locally from the transcript. */
export function deliveryMetrics(text, seconds) {
  const clean = (text || "").toLowerCase();
  const words = clean.match(/[a-z0-9']+/g) || [];
  const fillers = {};
  let fillerCount = 0;
  for (const f of FILLERS) {
    const re = new RegExp(`\\b${f.replace(/ /g, "\\s+")}\\b`, "g");
    const n = (clean.match(re) || []).length;
    if (n) {
      fillers[f] = n;
      fillerCount += n;
    }
  }
  const wpm = seconds > 5 ? Math.round((words.length / seconds) * 60) : null;
  return {
    words: words.length,
    seconds,
    wpm,
    fillerCount,
    fillers,
    fillerRate: words.length ? +((fillerCount / words.length) * 100).toFixed(1) : 0,
  };
}

/** Plain-language guidance on pace. */
export function paceLabel(wpm) {
  if (wpm == null) return { label: "—", tone: "neutral" };
  if (wpm < 110) return { label: "A bit slow", tone: "warn" };
  if (wpm <= 165) return { label: "Great pace", tone: "good" };
  if (wpm <= 190) return { label: "Slightly fast", tone: "warn" };
  return { label: "Too fast", tone: "bad" };
}

/** Read text aloud like an interviewer (speech synthesis). */
export function speak(text) {
  if (typeof window === "undefined" || !window.speechSynthesis) return false;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 1;
  u.pitch = 1;
  window.speechSynthesis.speak(u);
  return true;
}
