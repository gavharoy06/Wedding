import { Link, useLocation, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";

export default function OwnerLayout() {
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);

  const menuItems = [
    { path: "/owner/venues", label: "To'yxonalarim", icon: "domain" },
    { path: "/owner/bookings", label: "Bronlar", icon: "event_note" },
  ];

  const isActive = (path: string) => location.pathname.startsWith(path);

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "O";

  return (
    <div className="admin-layout">
      {/* ── Sidebar ── */}
      <aside className="admin-sidebar">
        {/* Logo */}
        <div className="admin-sidebar-logo">
          <h2>Owner Panel</h2>
          <p>Wedding Management</p>
        </div>

        {/* User Info */}
        <div style={{ padding: "16px 16px 8px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="admin-user-avatar" style={{ width: 36, height: 36, fontSize: 14 }}>
              {initials}
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{user?.name || "Owner"}</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{user?.email || ""}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="admin-sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-nav-item${isActive(item.path) ? " active" : ""}`}
            >
              <span className="mi">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="admin-sidebar-bottom">
          <Link to="/" className="admin-nav-item">
            <span className="mi">home</span>
            Bosh sahifa
          </Link>
          <button
            onClick={() => window.location.href = "/owner/venues"}
            className="admin-new-booking-btn"
          >
            <span className="mi" style={{ fontSize: 18 }}>add</span>
            Yangi To'yxona
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}