import { useCallback, useEffect, useRef, useState } from "react";
import Login from "./components/Login.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Chat from "./components/Chat.jsx";
import QuestionBank from "./components/QuestionBank.jsx";
import Series from "./components/Series.jsx";
import Saved from "./components/Saved.jsx";
import Notes from "./components/Notes.jsx";
import DeepDive from "./components/DeepDive.jsx";
import Settings from "./components/Settings.jsx";
import NarratorBar from "./components/NarratorBar.jsx";
import { narrator } from "./lib/narrator.js";
import { ROLES } from "./data/roles.js";
import { PROVIDERS } from "./lib/providers.js";
import { clearSession, loadSession, saveSession, uid, userKey, usePersistentState } from "./lib/storage.js";

export default function App() {
  const [session, setSession] = useState(loadSession);

  const updateSession = useCallback((s) => {
    setSession(s);
    saveSession(s);
  }, []);

  if (!session) return <Login onLogin={updateSession} />;
  return (
    <Workspace
      key={session.name}
      session={session}
      updateSession={updateSession}
      onLogout={() => {
        narrator.stop();
        clearSession();
        setSession(null);
      }}
    />
  );
}

const EMPTY_CHATS = { pm: [], gpm: [], fde: [], eng: [] };

function Workspace({ session, updateSession, onLogout }) {
  const u = session.name;
  const [roleId, setRoleId] = usePersistentState(userKey(u, "role"), "pm");
  const [view, setView] = usePersistentState(userKey(u, "view"), "chat");
  const [chats, setChats] = usePersistentState(userKey(u, "chats"), EMPTY_CHATS);
  const [saved, setSaved] = usePersistentState(userKey(u, "saved"), []);
  const [notes, setNotes] = usePersistentState(userKey(u, "notes"), []);
  const [dives, setDives] = usePersistentState(userKey(u, "dives"), {});
  const [attempts, setAttempts] = usePersistentState(userKey(u, "attempts"), {});
  const [seriesModule, setSeriesModule] = useState(null);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [dive, setDive] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const role = ROLES[roleId] || ROLES.pm;
  const ai = { provider: session.provider, model: session.model, key: session.keys[session.provider] };
  const provider = PROVIDERS[session.provider];

  const notify = useCallback((message) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const messages = chats[roleId] || [];
  const setMessages = useCallback(
    (updater) =>
      setChats((all) => {
        const cur = all[roleId] || [];
        // Don't persist in-flight placeholders as "pending" forever.
        const next = typeof updater === "function" ? updater(cur) : updater;
        return { ...all, [roleId]: next };
      }),
    [roleId, setChats]
  );

  // Clear any streaming placeholders left over from a reload.
  useEffect(() => {
    setChats((all) => {
      let changed = false;
      const fixed = {};
      for (const [k, list] of Object.entries(all)) {
        fixed[k] = list.map((m) => {
          if (!m.pending) return m;
          changed = true;
          return { ...m, pending: false, content: m.content || "_Interrupted._" };
        });
      }
      return changed ? fixed : all;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const norm = (s) => s.trim().toLowerCase();
  const isSaved = useCallback((q, rid) => saved.some((s) => s.roleId === rid && norm(s.question) === norm(q)), [saved]);

  function saveQuestion({ question, roleId: rid = roleId, answer, sources, context, source }) {
    if (!question?.trim()) return notify("Couldn't find a question to save");
    const existing = saved.find((s) => s.roleId === rid && norm(s.question) === norm(question));
    if (existing) {
      if (answer) {
        setSaved((all) => all.map((s) => (s.id === existing.id ? { ...s, answer, sources } : s)));
        return notify("Updated saved question with the deep-dive answer");
      }
      return notify("Already in your saved questions ⭐");
    }
    setSaved((all) => [
      { id: uid(), roleId: rid, question: question.trim(), answer: answer || "", sources: sources || [], context: context || "", source, status: "todo", myNotes: "", createdAt: Date.now() },
      ...all,
    ]);
    notify("Saved ⭐  Find it under Saved questions");
  }

  function createNote({ title = "", body = "", roleId: rid = roleId, questionId } = {}) {
    if (questionId) {
      const existing = notes.find((n) => n.questionId === questionId);
      if (existing) {
        setActiveNoteId(existing.id);
        setView("notes");
        setDive(null);
        return;
      }
    }
    const n = { id: uid(), title, body, roleId: rid, questionId: questionId || null, createdAt: Date.now(), updatedAt: Date.now() };
    setNotes((all) => [n, ...all]);
    setActiveNoteId(n.id);
    setView("notes");
    setDive(null);
    if (body) notify("Added to your notes 📝");
  }

  function openDeepDive(question, rid = roleId) {
    if (!question?.trim()) return notify("Nothing to deep-dive into yet");
    setDive({ question: question.trim(), roleId: rid });
  }

  function practice(question, rid = roleId) {
    setDive(null);
    setRoleId(rid);
    setView("chat");
    setPendingPrompt({
      roleId: rid,
      text: `Let's practice this interview question. Ask it to me exactly as an interviewer would, then wait for my answer:\n\n"${question}"`,
    });
  }

  const counts = { saved: saved.length, notes: notes.length };

  return (
    <div className="app">
      <Sidebar
        roleId={roleId}
        setRoleId={setRoleId}
        view={view}
        setView={setView}
        counts={counts}
        userName={u}
        onLogout={onLogout}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      <main className="main">
        <header className="topbar">
          <button className="icon-btn menu-btn" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            ☰
          </button>
          <div className="topbar-role" style={{ "--rc": role.color }}>
            <span className="role-emoji sm hide-sm">{role.emoji}</span>
            <div>
              <div className="topbar-title">
                <span className="hide-sm">{role.name}</span>
                <span className="show-sm">{role.short}</span>
              </div>
              <div className="muted tiny hide-sm">{role.tagline}</div>
            </div>
          </div>
          <span className="grow" />
          {session.provider !== "anthropic" && (
            <button className="rec-hint hide-sm" onClick={() => setShowSettings(true)} title="Claude is recommended for deep dives with live web sources">
              ★ Try Claude
            </button>
          )}
          <button className="model-pill" style={{ "--pc": provider.color }} onClick={() => setShowSettings(true)} title="AI settings">
            <span className="pdot" />
            <span className="model-name">
              {provider.name} · <span className="mono">{session.model}</span>
            </span>
            <span>⚙️</span>
          </button>
        </header>

        <div className="content">
          {view === "chat" && (
            <Chat
              key={roleId}
              role={role}
              ai={ai}
              userName={u}
              messages={messages}
              setMessages={setMessages}
              onSave={(p) => saveQuestion({ ...p, roleId })}
              onDeepDive={(q) => openDeepDive(q, roleId)}
              onAddNote={(p) => createNote({ ...p, roleId })}
              notify={notify}
              pendingPrompt={pendingPrompt?.roleId === roleId ? pendingPrompt : null}
              clearPending={() => setPendingPrompt(null)}
            />
          )}
          {view === "series" && (
            <Series
              role={role}
              ai={ai}
              attempts={attempts}
              setAttempts={setAttempts}
              moduleId={seriesModule?.startsWith(roleId + "-") ? seriesModule : null}
              setModuleId={setSeriesModule}
              onSave={saveQuestion}
              onDeepDive={openDeepDive}
              onAddNote={createNote}
              isSaved={isSaved}
            />
          )}
          {view === "bank" && (
            <QuestionBank role={role} onDeepDive={(q) => openDeepDive(q, roleId)} onSave={saveQuestion} onPractice={practice} isSaved={isSaved} />
          )}
          {view === "saved" && <Saved saved={saved} setSaved={setSaved} onDeepDive={openDeepDive} onPractice={practice} onAddNote={createNote} />}
          {view === "notes" && (
            <Notes notes={notes} setNotes={setNotes} activeId={activeNoteId} setActiveId={setActiveNoteId} createNote={createNote} currentRoleId={roleId} />
          )}
        </div>
      </main>

      {dive && (
        <DeepDive
          key={dive.roleId + dive.question}
          dive={dive}
          ai={ai}
          cache={dives}
          setCache={setDives}
          onClose={() => setDive(null)}
          onSave={saveQuestion}
          onAddNote={createNote}
          onPractice={practice}
          isSaved={isSaved}
        />
      )}

      {showSettings && <Settings session={session} onChange={updateSession} onClose={() => setShowSettings(false)} />}

      <NarratorBar />

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}
