import { useEffect, useMemo, useState } from "react";

// ── Icons (inline SVG helpers) ──────────────────────────────────────────────
const Icon = ({
  d,
  size = 18,
  stroke = "currentColor",
  fill = "none",
  strokeWidth = 1.75,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke={stroke}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);

const icons = {
  dashboard: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  doctors:
    "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8",
  patients:
    "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  register:
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M19 8v6 M22 11h-6",
  exercise: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  feedback: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  therapy:
    "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2 M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v0H9v0z",
  signout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
  bell: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0",
  search: "M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0",
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8",
  mail: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6",
  phone:
    "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.1 2.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.41 9.6a16 16 0 0 0 6 6l1.47-1.47a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.88 16z",
  plus: "M12 5v14 M5 12h14",
  filter: "M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
  chevLeft: "M15 18l-6-6 6-6",
  chevRight: "M9 18l6-6-6-6",
  settings:
    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
  info: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 16v-4 M12 8h.01",
  steth: "M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0z",
  progress: "M12 20V10 M18 20V4 M6 20v-4",
};

// ── Styles ──────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');
 
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
 
  :root {
    --navy:   #1B2A4A;
    --navy2:  #243356;
    --blue:   #2E4DA0;
    --blue2:  #3B5FBF;
    --accent: #2563EB;
    --teal:   #0EA5E9;
    --bg:     #F4F6FA;
    --white:  #FFFFFF;
    --border: #E2E8F0;
    --text:   #1E293B;
    --muted:  #64748B;
    --light:  #94A3B8;
    --green:  #16A34A;
    --orange: #EA580C;
    --purple: #7C3AED;
    --radius: 10px;
    --shadow: 0 1px 4px rgba(0,0,0,.07), 0 2px 12px rgba(0,0,0,.05);
  }
 
  body { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--text); }
 
  .app { display: flex; height: 100vh; overflow: hidden; }
 
  /* ── Sidebar ── */
  .sidebar {
    width: 168px; min-width: 168px;
    background: var(--navy);
    display: flex; flex-direction: column;
    padding: 0; overflow: hidden;
  }
  .sidebar-brand {
    padding: 20px 16px 16px;
    border-bottom: 1px solid rgba(255,255,255,.08);
    display: flex; align-items: center; gap: 10px;
  }
  .avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: linear-gradient(135deg,#4F8EF7,#2563EB);
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-size: 13px; font-weight: 600; flex-shrink: 0;
  }
  .brand-info { overflow: hidden; }
  .brand-name { color: #fff; font-size: 13px; font-weight: 600; line-height: 1.2; }
  .brand-role { color: rgba(255,255,255,.45); font-size: 11px; }
 
  .nav { flex: 1; padding: 12px 8px; display: flex; flex-direction: column; gap: 2px; }
  .nav-item {
    display: flex; align-items: center; gap: 9px;
    padding: 8px 10px; border-radius: 7px;
    color: rgba(255,255,255,.55); font-size: 13px; font-weight: 450;
    cursor: pointer; transition: all .15s; user-select: none;
    border: none; background: none; text-align: left; width: 100%;
  }
  .nav-item:hover { color: rgba(255,255,255,.85); background: rgba(255,255,255,.06); }
  .nav-item.active { color: #fff; background: rgba(255,255,255,.12); font-weight: 500; }
  .nav-item svg { flex-shrink: 0; opacity: .8; }
 
  .nav-bottom { padding: 12px 8px 16px; border-top: 1px solid rgba(255,255,255,.08); }
  .nav-bottom .nav-item { color: rgba(255,255,255,.4); }
  .nav-bottom .nav-item:hover { color: rgba(255,255,255,.7); }
 
  /* ── Main ── */
  .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
 
  .topbar {
    background: var(--white); border-bottom: 1px solid var(--border);
    padding: 0 28px; height: 56px;
    display: flex; align-items: center; justify-content: space-between;
    flex-shrink: 0;
  }
  .topbar-title { font-size: 15px; font-weight: 600; color: var(--text); }
  .topbar-right { display: flex; align-items: center; gap: 10px; }
 
  .search-bar {
    display: flex; align-items: center; gap: 8px;
    background: var(--bg); border: 1px solid var(--border);
    border-radius: 8px; padding: 6px 12px; width: 220px;
  }
  .search-bar input {
    border: none; background: none; outline: none;
    font-size: 13px; color: var(--text); width: 100%;
    font-family: inherit;
  }
  .search-bar input::placeholder { color: var(--light); }
 
  .icon-btn {
    width: 34px; height: 34px; border-radius: 8px;
    background: var(--bg); border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: var(--muted); transition: all .15s;
  }
  .icon-btn:hover { background: var(--border); }
 
  .btn-primary {
    display: flex; align-items: center; gap: 6px;
    background: var(--navy); color: #fff;
    border: none; border-radius: 8px;
    padding: 8px 16px; font-size: 13px; font-weight: 500;
    cursor: pointer; transition: background .15s; font-family: inherit;
  }
  .btn-primary:hover { background: var(--navy2); }
  .btn-primary.accent { background: var(--accent); }
  .btn-primary.accent:hover { background: var(--blue2); }
 
  .btn-ghost {
    background: none; border: 1px solid var(--border);
    border-radius: 8px; padding: 8px 16px;
    font-size: 13px; color: var(--muted); cursor: pointer;
    font-family: inherit; transition: all .15s;
  }
  .btn-ghost:hover { border-color: var(--light); color: var(--text); }
 
  .content { flex: 1; overflow-y: auto; padding: 28px; }
 
  /* ── Page Headers ── */
  .page-header { margin-bottom: 24px; }
  .page-header h1 { font-size: 22px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
  .page-header p { font-size: 13px; color: var(--muted); }
 
  .breadcrumb {
    display: flex; align-items: center; gap: 6px;
    font-size: 12px; color: var(--muted); margin-bottom: 14px;
  }
  .breadcrumb span { cursor: pointer; }
  .breadcrumb span:hover { color: var(--accent); }
  .breadcrumb .sep { color: var(--light); }
  .breadcrumb .current { color: var(--text); font-weight: 500; }
 
  /* ── Cards ── */
  .card {
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
  }
  .card-header {
    padding: 18px 22px 14px;
    display: flex; align-items: center; gap: 9px;
    border-bottom: 1px solid var(--border);
    font-size: 15px; font-weight: 600; color: var(--text);
  }
  .card-header svg { color: var(--muted); }
  .card-body { padding: 20px 22px; }
 
  /* ── Form ── */
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .form-group { display: flex; flex-direction: column; gap: 5px; }
  .form-group.full { grid-column: 1 / -1; }
  .form-label { font-size: 12px; font-weight: 500; color: var(--text); }
  .form-label .req { color: var(--accent); margin-left: 2px; }
 
  .form-input, .form-select, .form-textarea {
    border: 1px solid var(--border); border-radius: 7px;
    padding: 9px 12px; font-size: 13px; color: var(--text);
    outline: none; transition: border-color .15s, box-shadow .15s;
    font-family: inherit; background: var(--white); width: 100%;
  }
  .form-input:focus, .form-select:focus, .form-textarea:focus {
    border-color: var(--accent); box-shadow: 0 0 0 3px rgba(37,99,235,.08);
  }
  .form-input::placeholder, .form-textarea::placeholder { color: var(--light); }
  .form-select { cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px; }
  .form-textarea { resize: vertical; min-height: 90px; }
 
  .input-with-icon { position: relative; }
  .input-with-icon .form-input, .input-with-icon .form-select { padding-left: 34px; }
  .input-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--light); pointer-events: none; }
 
  .form-actions {
    display: flex; justify-content: flex-end; align-items: center;
    gap: 10px; padding-top: 20px; margin-top: 4px;
  }
 
  /* ── Registration Page ── */
  .reg-stack { display: flex; flex-direction: column; gap: 20px; }
 
  /* ── Doctor Profile Page ── */
  .doctor-layout { display: grid; grid-template-columns: 220px 1fr; gap: 20px; align-items: start; }
 
  .profile-card { padding: 24px 20px; display: flex; flex-direction: column; align-items: center; gap: 4px; }
  .profile-photo {
    width: 88px; height: 88px; border-radius: 50%;
    object-fit: cover; margin-bottom: 10px;
    border: 3px solid var(--border);
  }
  .profile-photo-placeholder {
    width: 88px; height: 88px; border-radius: 50%;
    background: linear-gradient(135deg, #BFDBFE, #93C5FD);
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 10px; font-size: 26px; font-weight: 700; color: var(--accent);
    border: 3px solid var(--border);
  }
  .profile-name { font-size: 16px; font-weight: 700; color: var(--text); text-align: center; }
  .profile-specialty { font-size: 13px; color: var(--accent); font-weight: 500; }
 
  .status-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 10px; border-radius: 20px; font-size: 11.5px; font-weight: 500;
    margin: 8px 0 14px;
  }
  .status-badge.active { background: #DCFCE7; color: var(--green); }
  .status-badge.active::before { content:''; width:6px;height:6px;border-radius:50%;background:var(--green); }
 
  .profile-divider { width: 100%; height: 1px; background: var(--border); margin: 8px 0; }
  .profile-detail { width: 100%; text-align: left; }
  .profile-detail-label { font-size: 10.5px; font-weight: 600; color: var(--light); text-transform: uppercase; letter-spacing: .5px; margin-bottom: 2px; }
  .profile-detail-value { font-size: 12.5px; color: var(--text); }
  .profile-detail-value.link { color: var(--accent); text-decoration: none; }
  .profile-details-grid { display: flex; flex-direction: column; gap: 12px; width: 100%; padding-top: 4px; }
  .profile-btn { margin-top: 16px; width: 100%; justify-content: center; }
 
  /* ── Patients Table ── */
  .table-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 22px 14px;
  }
  .table-header h3 { font-size: 15px; font-weight: 600; }
  .table { width: 100%; }
  .table-head { display: grid; grid-template-columns: 2fr 2fr 1.5fr 1.2fr; padding: 8px 22px; }
  .table-head span { font-size: 11.5px; font-weight: 600; color: var(--light); text-transform: uppercase; letter-spacing: .5px; }
  .table-row {
    display: grid; grid-template-columns: 2fr 2fr 1.5fr 1.2fr;
    padding: 12px 22px; border-top: 1px solid var(--border);
    align-items: center; transition: background .12s; cursor: pointer;
  }
  .table-row:hover { background: #F8FAFC; }
 
  .child-cell { display: flex; align-items: center; gap: 10px; }
  .child-avatar {
    width: 30px; height: 30px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 700; color: #fff; flex-shrink: 0;
  }
  .cell-name { font-size: 13px; font-weight: 500; color: var(--text); }
  .cell-sub { font-size: 12px; color: var(--muted); }
 
  .badge {
    display: inline-flex; align-items: center;
    padding: 3px 9px; border-radius: 20px;
    font-size: 11.5px; font-weight: 500; white-space: nowrap;
  }
  .badge-green { background: #DCFCE7; color: #15803D; }
  .badge-orange { background: #FFF7ED; color: #C2410C; }
  .badge-gray { background: #F1F5F9; color: var(--muted); }
 
  .table-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 22px; border-top: 1px solid var(--border);
    font-size: 12px; color: var(--muted);
  }
  .table-footer .pager { display: flex; gap: 4px; }
  .page-btn {
    width: 26px; height: 26px; border-radius: 6px;
    border: 1px solid var(--border); background: none;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: var(--muted); transition: all .15s;
  }
  .page-btn:hover { background: var(--bg); color: var(--text); }
 
  /* ── Add Doctor ── */
  .info-banner {
    display: flex; gap: 12px; padding: 16px 20px;
    background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: var(--radius);
    margin-top: 20px;
  }
  .info-banner svg { color: var(--accent); flex-shrink: 0; margin-top: 1px; }
  .info-banner h4 { font-size: 13.5px; font-weight: 600; color: #1D4ED8; margin-bottom: 3px; }
  .info-banner p { font-size: 12.5px; color: #3B82F6; line-height: 1.45; }
`;

// ── Data ────────────────────────────────────────────────────────────────────
const patientsSeed = [
  {
    initials: "LM",
    color: "#2563EB",
    name: "Liam Miller",
    parent: "Sarah Miller",
    time: "2 hours ago",
    status: "Active Plan",
    badge: "badge-green",
  },
  {
    initials: "ED",
    color: "#7C3AED",
    name: "Emma Davis",
    parent: "Mark Davis",
    time: "1 day ago",
    status: "Requires Review",
    badge: "badge-orange",
  },
  {
    initials: "NG",
    color: "#0EA5E9",
    name: "Noah Garcia",
    parent: "Elena Garcia",
    time: "3 days ago",
    status: "Active Plan",
    badge: "badge-green",
  },
  {
    initials: "AJ",
    color: "#64748B",
    name: "Ava Johnson",
    parent: "Michael Johnson",
    time: "1 week ago",
    status: "Completed",
    badge: "badge-gray",
  },
];

const badgeMap = {
  active: "badge-green",
  review: "badge-orange",
  completed: "badge-gray",
};

const colorPool = [
  "#2563EB",
  "#7C3AED",
  "#0EA5E9",
  "#64748B",
  "#16A34A",
  "#EA580C",
];

const getInitials = (value) =>
  value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard" },
  { id: "doctors", label: "Doctors", icon: "doctors" },
  { id: "patients", label: "Patients", icon: "patients" },
  { id: "register", label: "Registration", icon: "register" },
  { id: "exercise", label: "Exercise Library", icon: "exercise" },
  { id: "feedback", label: "Feedback", icon: "feedback" },
  { id: "therapy", label: "Therapy Plan Builder", icon: "therapy" },
];

// ── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ active, onNav }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="avatar">DA</div>
        <div className="brand-info">
          <div className="brand-name">Dr. Aris</div>
          <div className="brand-role">Clinic Admin</div>
        </div>
      </div>
      <nav className="nav">
        {navItems.map((n) => (
          <button
            key={n.id}
            className={`nav-item ${active === n.id ? "active" : ""}`}
            onClick={() => onNav(n.id)}
          >
            <Icon d={icons[n.icon]} size={15} />
            {n.label}
          </button>
        ))}
      </nav>
      <div className="nav-bottom">
        <button className="nav-item">
          <Icon d={icons.signout} size={15} /> Sign Out
        </button>
      </div>
    </aside>
  );
}

// ── Registration Page ────────────────────────────────────────────────────────
function RegistrationPage({
  formState,
  onFormChange,
  onSubmit,
  submitStatus,
  doctors,
}) {
  return (
    <>
      <div className="topbar">
        <span className="topbar-title">SPD CLINIC</span>
        <div className="topbar-right">
          <div className="icon-btn">
            <Icon d={icons.bell} size={16} />
          </div>
        </div>
      </div>
      <div className="content">
        <div className="page-header">
          <h1>Family Registration</h1>
          <p>Register a new parent and child profile for SPD therapy.</p>
        </div>

        <div className="reg-stack">
          {/* Parent Card */}
          <div className="card">
            <div className="card-header">
              <Icon d={icons.user} size={16} />
              Parent Information
            </div>
            <div className="card-body">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input
                    className="form-input"
                    name="parentName"
                    value={formState.parentName}
                    onChange={onFormChange}
                    placeholder="e.g. Jane Doe"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Relationship to Child</label>
                  <select
                    className="form-select"
                    name="relationship"
                    value={formState.relationship}
                    onChange={onFormChange}
                  >
                    <option value="" disabled>
                      Select relationship
                    </option>
                    <option value="mother">Mother</option>
                    <option value="father">Father</option>
                    <option value="guardian">Guardian</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    className="form-input"
                    name="email"
                    value={formState.email}
                    onChange={onFormChange}
                    placeholder="jane.doe@example.com"
                    type="email"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    className="form-input"
                    name="phone"
                    value={formState.phone}
                    onChange={onFormChange}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Child Card */}
          <div className="card">
            <div className="card-header">
              <Icon d={icons.patients} size={16} />
              Child Information
            </div>
            <div className="card-body">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Child Full Name</label>
                  <input
                    className="form-input"
                    name="childName"
                    value={formState.childName}
                    onChange={onFormChange}
                    placeholder="e.g. Sam Doe"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input
                    className="form-input"
                    name="dateOfBirth"
                    value={formState.dateOfBirth}
                    onChange={onFormChange}
                    placeholder="mm/dd/yyyy"
                    type="text"
                  />
                </div>
                <div className="form-group full">
                  <label className="form-label">
                    Preliminary Diagnosis Notes
                  </label>
                  <textarea
                    className="form-textarea"
                    name="diagnosisNotes"
                    value={formState.diagnosisNotes}
                    onChange={onFormChange}
                    placeholder="Enter any initial observations, previous diagnoses, or primary concerns regarding Sensory Processing Disorder..."
                  />
                </div>
                <div className="form-group full">
                  <label className="form-label">Assign Primary Doctor</label>
                  <div className="input-with-icon">
                    <span className="input-icon">
                      <Icon d={icons.steth} size={14} />
                    </span>
                    <select
                      className="form-select"
                      style={{ paddingLeft: "34px" }}
                      name="doctor"
                      value={formState.doctor}
                      onChange={onFormChange}
                    >
                      <option value="">Unassigned</option>
                      {doctors.length === 0 && (
                        <option value="" disabled>
                          No doctors available
                        </option>
                      )}
                      {doctors.map((doctor) => (
                        <option key={doctor.id} value={doctor.id}>
                          {doctor.first_name} {doctor.second_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <span style={{ color: "var(--muted)", fontSize: 12 }}>
                  {submitStatus}
                </span>
                <button
                  className="btn-ghost"
                  type="button"
                  onClick={onSubmit.reset}
                >
                  Reset Form
                </button>
                <button
                  className="btn-primary accent"
                  type="button"
                  onClick={onSubmit.save}
                >
                  <Icon d={icons.plus} size={14} />
                  Register Patients
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Add Doctor Page ──────────────────────────────────────────────────────────
function AddDoctorPage({
  onBack,
  doctorForm,
  onDoctorChange,
  onDoctorSave,
  doctorStatus,
}) {
  return (
    <>
      <div className="topbar">
        <span className="topbar-title">Doctor Management</span>
        <div className="topbar-right">
          <div className="search-bar">
            <Icon d={icons.search} size={14} stroke="var(--light)" />
            <input placeholder="Search doctors..." />
          </div>
          <div
            className="icon-btn"
            style={{ background: "var(--navy)", border: "none" }}
          >
            <Icon d={icons.user} size={15} stroke="#fff" />
          </div>
        </div>
      </div>
      <div className="content">
        <div className="breadcrumb">
          <span onClick={onBack}>Doctors Management</span>
          <span className="sep">›</span>
          <span className="current">Add New Doctor</span>
        </div>

        <div className="page-header">
          <h1>Add New Doctor</h1>
          <p>Enter the details below to onboard a new medical professional.</p>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  Full Name <span className="req">*</span>
                </label>
                <div className="input-with-icon">
                  <span className="input-icon">
                    <Icon d={icons.user} size={14} />
                  </span>
                  <input
                    className="form-input"
                    name="fullName"
                    value={doctorForm.fullName}
                    onChange={onDoctorChange}
                    placeholder="Dr. Jane Doe"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">
                  Specialty <span className="req">*</span>
                </label>
                <div className="input-with-icon">
                  <span className="input-icon">
                    <Icon d={icons.steth} size={14} />
                  </span>
                  <select
                    className="form-select"
                    style={{ paddingLeft: "34px" }}
                    name="specialty"
                    value={doctorForm.specialty}
                    onChange={onDoctorChange}
                  >
                    <option value="" disabled>
                      Select specialty...
                    </option>
                    <option>Neurology</option>
                    <option>Pediatrics</option>
                    <option>Occupational Therapy</option>
                    <option>Speech Therapy</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">
                  Email Address <span className="req">*</span>
                </label>
                <div className="input-with-icon">
                  <span className="input-icon">
                    <Icon d={icons.mail} size={14} />
                  </span>
                  <input
                    className="form-input"
                    name="email"
                    value={doctorForm.email}
                    onChange={onDoctorChange}
                    placeholder="doctor@clinic.com"
                    type="email"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">
                  Mobile Number <span className="req">*</span>
                </label>
                <div className="input-with-icon">
                  <span className="input-icon">
                    <Icon d={icons.phone} size={14} />
                  </span>
                  <input
                    className="form-input"
                    name="phone"
                    value={doctorForm.phone}
                    onChange={onDoctorChange}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <span style={{ color: "var(--muted)", fontSize: 12 }}>
                {doctorStatus}
              </span>
              <button className="btn-ghost" onClick={onBack}>
                Cancel
              </button>
              <button
                className="btn-primary accent"
                type="button"
                onClick={onDoctorSave}
              >
                <Icon d={icons.plus} size={14} />
                Add Doctor
              </button>
            </div>
          </div>
        </div>

        <div className="info-banner">
          <Icon d={icons.info} size={16} />
          <div>
            <h4>Account Verification</h4>
            <p>
              Once added, an invitation email will be sent to the doctor to
              complete their profile setup and verify their credentials.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Doctor Profile Page ──────────────────────────────────────────────────────
function DoctorProfilePage({ onAdd, patients }) {
  return (
    <>
      <div className="topbar">
        <div className="search-bar">
          <Icon d={icons.search} size={14} stroke="var(--light)" />
          <input placeholder="Search..." />
        </div>
        <div className="topbar-right">
          <div className="icon-btn">
            <Icon d={icons.bell} size={16} />
          </div>
          <div className="icon-btn">
            <Icon d={icons.settings} size={16} />
          </div>
          <button className="btn-primary accent" onClick={onAdd}>
            <Icon d={icons.plus} size={14} />
            New Patient
          </button>
        </div>
      </div>
      <div className="content">
        <div className="breadcrumb">
          <span>Doctors Management</span>
          <span className="sep">›</span>
          <span className="current">Dr. Sarah Jenkins</span>
        </div>

        <div className="doctor-layout">
          {/* Profile Card */}
          <div className="card profile-card">
            <div className="profile-photo-placeholder">SJ</div>
            <div className="profile-name">Dr. Sarah Jenkins</div>
            <div className="profile-specialty">Neurology</div>
            <div className="status-badge active">Active Status</div>
            <div className="profile-divider" />
            <div className="profile-details-grid">
              {[
                { label: "License Number", value: "MED-9824-TX" },
                {
                  label: "Email Address",
                  value: "s.jenkins@therapyplan.clinic",
                  link: true,
                },
                { label: "Office Phone", value: "(555) 867-5309" },
                { label: "Assigned Facility", value: "North Wing, Room 402" },
              ].map((d) => (
                <div className="profile-detail" key={d.label}>
                  <div className="profile-detail-label">{d.label}</div>
                  <div
                    className={`profile-detail-value ${d.link ? "link" : ""}`}
                  >
                    {d.value}
                  </div>
                </div>
              ))}
            </div>
            <button className="btn-ghost profile-btn">
              <Icon d={icons.progress} size={13} />
              &nbsp;Review Progress
            </button>
          </div>

          {/* Patients Table */}
          <div className="card" style={{ overflow: "hidden" }}>
            <div className="table-header">
              <h3>Assigned Patients</h3>
              <button
                className="btn-ghost"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                }}
              >
                <Icon d={icons.filter} size={13} /> Filter
              </button>
            </div>
            <div className="table">
              <div className="table-head">
                <span>Child Name</span>
                <span>Parent Name</span>
                <span>Last Activity</span>
                <span>Status</span>
              </div>
              {patients.map((p, i) => (
                <div className="table-row" key={i}>
                  <div className="child-cell">
                    <div
                      className="child-avatar"
                      style={{ background: p.color }}
                    >
                      {p.initials}
                    </div>
                    <span className="cell-name">{p.name}</span>
                  </div>
                  <span className="cell-sub">{p.parent}</span>
                  <span className="cell-sub">{p.time}</span>
                  <span className={`badge ${p.badge}`}>{p.status}</span>
                </div>
              ))}
            </div>
            <div className="table-footer">
              <span>Showing 4 of 28 patients</span>
              <div className="pager">
                <button className="page-btn">
                  <Icon d={icons.chevLeft} size={12} />
                </button>
                <button className="page-btn">
                  <Icon d={icons.chevRight} size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("register");
  const [patients, setPatients] = useState(patientsSeed);
  const [submitStatus, setSubmitStatus] = useState("");
  const [submitState, setSubmitState] = useState("idle");
  const [doctors, setDoctors] = useState([]);
  const [doctorStatus, setDoctorStatus] = useState("");
  const [doctorForm, setDoctorForm] = useState({
    fullName: "",
    specialty: "",
    email: "",
    phone: "",
  });
  const [formState, setFormState] = useState({
    parentName: "",
    relationship: "",
    email: "",
    phone: "",
    childName: "",
    dateOfBirth: "",
    diagnosisNotes: "",
    doctor: "",
  });

  const apiBaseUrl = useMemo(() => import.meta.env.VITE_API_BASE_URL || "", []);
  const token = useMemo(() => localStorage.getItem("token") || "", []);

  useEffect(() => {
    const loadDoctors = async () => {
      if (!apiBaseUrl) {
        return;
      }

      try {
        const response = await fetch(`${apiBaseUrl}/api/v1/users?role=Doctor`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        if (!response.ok) {
          setDoctors([]);
          return;
        }

        const data = await response.json();
        const incoming = Array.isArray(data) ? data : [];
        setDoctors((prev) => {
          const existingIds = new Set(prev.map((doctor) => doctor.id));
          const merged = [...prev];
          incoming.forEach((doctor) => {
            if (!existingIds.has(doctor.id)) {
              merged.push(doctor);
            }
          });
          return merged;
        });
      } catch {
        setDoctors([]);
      }
    };

    loadDoctors();
  }, [apiBaseUrl, token]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFormState({
      parentName: "",
      relationship: "",
      email: "",
      phone: "",
      childName: "",
      dateOfBirth: "",
      diagnosisNotes: "",
      doctor: "",
    });
    setSubmitStatus("");
    setSubmitState("idle");
  };

  const handleDoctorChange = (event) => {
    const { name, value } = event.target;
    setDoctorForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDoctorSave = () => {
    const name = doctorForm.fullName.trim();
    const specialty = doctorForm.specialty.trim();
    if (!name || !specialty) {
      setDoctorStatus("Name and specialty are required.");
      return;
    }

    const nameParts = name.split(" ").filter(Boolean);
    if (nameParts.length < 2) {
      setDoctorStatus("Enter first and second name.");
      return;
    }

    const newDoctor = {
      id: `local-${Date.now()}`,
      first_name: nameParts[0],
      second_name: nameParts.slice(1).join(" "),
      specialty,
      email: doctorForm.email.trim(),
      phone: doctorForm.phone.trim(),
    };

    setDoctors((prev) => [newDoctor, ...prev]);
    setDoctorStatus("Saved locally.");
    setDoctorForm({ fullName: "", specialty: "", email: "", phone: "" });
    setPage("register");
  };

  const handleSave = async () => {
    const parentName = formState.parentName.trim();
    const childName = formState.childName.trim();
    if (!parentName || !childName) {
      setSubmitStatus("Add parent and child names to save.");
      setSubmitState("error");
      return;
    }

    if (!formState.email.trim() || !formState.phone.trim()) {
      setSubmitStatus("Email and phone are required.");
      setSubmitState("error");
      return;
    }

    if (!formState.relationship) {
      setSubmitStatus("Select a relationship.");
      setSubmitState("error");
      return;
    }

    const parentParts = parentName.split(" ").filter(Boolean);
    const childParts = childName.split(" ").filter(Boolean);
    if (parentParts.length < 2 || childParts.length < 2) {
      setSubmitStatus("Please enter first and second names.");
      setSubmitState("error");
      return;
    }

    const rawDate = formState.dateOfBirth.trim();
    if (!rawDate) {
      setSubmitStatus("Date of birth is required.");
      setSubmitState("error");
      return;
    }

    const dateParts = rawDate.split("/");
    const normalizedDate =
      dateParts.length === 3
        ? `${dateParts[2]}-${dateParts[0].padStart(2, "0")}-${dateParts[1].padStart(2, "0")}`
        : rawDate;

    if (!apiBaseUrl) {
      setSubmitStatus("Missing API base URL.");
      setSubmitState("error");
      return;
    }

    if (!token) {
      setSubmitStatus("Missing auth token. Please sign in.");
      setSubmitState("error");
      return;
    }

    setSubmitState("loading");
    setSubmitStatus("Saving...");

    const payload = {
      parent: {
        first_name: parentParts[0],
        second_name: parentParts.slice(1).join(" "),
        email: formState.email.trim(),
        phone: formState.phone.trim(),
        relationship_type: formState.relationship,
      },
      child: {
        first_name: childParts[0],
        second_name: childParts.slice(1).join(" "),
        date_of_birth: normalizedDate,
        diagnosis_notes: formState.diagnosisNotes.trim(),
      },
      doctor_id: formState.doctor || undefined,
    };

    try {
      const response = await fetch(
        `${apiBaseUrl}/api/v1/auth/parent-with-child`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();
      if (!response.ok) {
        setSubmitStatus(
          data?.error || "Failed to save. Please check the input.",
        );
        setSubmitState("error");
        return;
      }

      const initials = getInitials(childName) || "NA";
      const nextPatient = {
        initials,
        color: colorPool[patients.length % colorPool.length],
        name: childName,
        parent: parentName,
        time: "Just now",
        status: "Active Plan",
        badge: badgeMap.active,
      };

      setPatients((prev) => [nextPatient, ...prev]);
      setSubmitStatus("Saved. Onboarding message sent.");
      setSubmitState("success");
      setPage("doctorProfile");
    } catch {
      setSubmitStatus("Network error. Please try again.");
      setSubmitState("error");
    }
  };

  const handleNav = (id) => {
    if (id === "doctors") setPage("doctorProfile");
    else if (id === "register") setPage("register");
    else setPage(id);
  };

  const activeNav =
    page === "register"
      ? "register"
      : page === "addDoctor" || page === "doctorProfile"
        ? "doctors"
        : page;

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <Sidebar active={activeNav} onNav={handleNav} />
        <div className="main">
          {page === "register" && (
            <RegistrationPage
              formState={formState}
              onFormChange={handleFormChange}
              submitStatus={submitStatus}
              doctors={doctors}
              onSubmit={{ save: handleSave, reset: handleReset }}
            />
          )}
          {page === "addDoctor" && (
            <AddDoctorPage onBack={() => setPage("doctorProfile")} />
          )}
          {page === "doctorProfile" && (
            <DoctorProfilePage
              onAdd={() => setPage("addDoctor")}
              patients={patients}
            />
          )}
          {!["register", "addDoctor", "doctorProfile"].includes(page) && (
            <>
              <div className="topbar">
                <span className="topbar-title">SPD CLINIC</span>
              </div>
              <div
                className="content"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                }}
              >
                <div style={{ textAlign: "center", color: "var(--muted)" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🏥</div>
                  <div
                    style={{ fontWeight: 600, fontSize: 16, marginBottom: 6 }}
                  >
                    Coming Soon
                  </div>
                  <div style={{ fontSize: 13 }}>
                    This section is not yet implemented.
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
