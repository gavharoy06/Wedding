import { Link, useLocation, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";

const AdminLayout = () => {
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);

  const menuItems = [
    { path: "/admin", label: "Dashboard", icon: "dashboard", exact: true },
    { path: "/admin/bookings", label: "Bookings", icon: "event_note" },
    { path: "/admin/venues", label: "Venues", icon: "domain" },
    { path: "/admin/analytics", label: "Analytics", icon: "bar_chart" },
  ];

  const isActive = (item: { path: string; exact?: boolean }) =>
    item.exact
      ? location.pathname === item.path
      : location.pathname.startsWith(item.path);

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "A";

  return (
    <div className="admin-layout">
      {/* ── Sidebar ── */}
      <aside className="admin-sidebar">
        {/* Logo */}
        <div className="admin-sidebar-logo">
          <h2>Admin Panel</h2>
          <p>Wedding Management</p>
        </div>

        {/* Nav */}
        <nav className="admin-sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-nav-item${isActive(item) ? " active" : ""}`}
            >
              <span className="mi">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="admin-sidebar-bottom">
          <Link
            to="/admin/settings"
            className={`admin-nav-item${location.pathname === "/admin/settings" ? " active" : ""}`}
          >
            <span className="mi">settings</span>
            Barcha To'yxonalar
          </Link>
          <Link to="/admin/venues?action=create" className="admin-new-booking-btn">
            <span className="mi" style={{ fontSize: 18 }}>add</span>
            Yangi bronlar
          </Link>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;