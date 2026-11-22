import { ROLE_LIST } from "../data/roles.js";

const NAV = [
  { id: "series", label: "Question series", icon: "🎓" },
  { id: "chat", label: "Practice chat", icon: "💬" },
  { id: "bank", label: "Question bank", icon: "📚" },
  { id: "saved", label: "Saved questions", icon: "⭐" },
  { id: "notes", label: "Notes", icon: "📝" },
];

export default function Sidebar({ roleId, setRoleId, view, setView, counts, userName, onLogout, open, onClose }) {
  return (
    <>
      <div className={`scrim ${open ? "show" : ""}`} onClick={onClose} />
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="brand">
          <img src="/favicon.svg" alt="" />
          <span>PrepPilot</span>
        </div>

        <div className="side-section">
          <div className="side-title">Target role</div>
          {ROLE_LIST.map((r) => (
            <button
              key={r.id}
              className={`role-btn ${roleId === r.id ? "active" : ""}`}
              style={{ "--rc": r.color }}
              onClick={() => {
                setRoleId(r.id);
                onClose();
              }}
            >
              <span className="role-emoji">{r.emoji}</span>
              <span className="role-text">
                <strong>{r.name}</strong>
                <small>{r.tagline}</small>
              </span>
            </button>
          ))}
        </div>

        <nav className="side-section">
          <div className="side-title">Workspace</div>
          {NAV.map((n) => (
            <button
              key={n.id}
              className={`nav-btn ${view === n.id ? "active" : ""}`}
              onClick={() => {
                setView(n.id);
                onClose();
              }}
            >
              <span>{n.icon}</span>
              <span className="grow">{n.label}</span>
              {counts[n.id] ? <span className="count">{counts[n.id]}</span> : null}
            </button>
          ))}
        </nav>

        <div className="side-foot">
          <div className="avatar">{userName.slice(0, 1).toUpperCase()}</div>
          <div className="grow">
            <div className="who">{userName}</div>
            <div className="muted tiny">Studying hard ✨</div>
          </div>
          <button className="ghost small" onClick={onLogout} title="Log out">
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}
