import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../store/store";
import { logout } from "../store/authSlice";

export default function Navbar() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate("/login");
  };

  return (
    <nav
      className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl shadow-black/5 ring-1 ring-white/10
"
      style={{ position: "sticky", top: 0, zIndex: 50 }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 32px",
          height: 62,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
        }}
      >
        {/* ── Logo ── */}
        <Link
          to="/"
          className="font-display"
          style={{
            fontSize: 19,
            fontWeight: 700,
            color: "var(--primary)",
            textDecoration: "none",
            letterSpacing: "0.01em",
            flexShrink: 0,
          }}
        >
          Aura Weddings
        </Link>

        {/* ── Right side ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {user ? (
            <>
              {/* Role-based links */}
              {user.role === "admin" && (
                <Link
                  to="/admin"
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--on-surface-variant)",
                    textDecoration: "none",
                    padding: "6px 14px",
                    borderRadius: 9,
                    transition: "background 0.18s, color 0.18s",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(106,81,136,0.07)";
                    e.currentTarget.style.color = "var(--secondary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--on-surface-variant)";
                  }}
                >
                  <span className="mi" style={{ fontSize: 16 }}>
                    admin_panel_settings
                  </span>
                  Admin Panel
                </Link>
              )}

              {user.role === "owner" && (
                <Link
                  to="/owner/venues"
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--on-surface-variant)",
                    textDecoration: "none",
                    padding: "6px 14px",
                    borderRadius: 9,
                    transition: "background 0.18s, color 0.18s",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(106,81,136,0.07)";
                    e.currentTarget.style.color = "var(--secondary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--on-surface-variant)";
                  }}
                >
                  <span className="mi" style={{ fontSize: 16 }}>
                    domain
                  </span>
                  Mening To'yxonalarim
                </Link>
              )}

              {user.role === "client" && (
                <Link
                  to="/my-bookings"
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--on-surface-variant)",
                    textDecoration: "none",
                    padding: "6px 14px",
                    borderRadius: 9,
                    transition: "background 0.18s, color 0.18s",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(106,81,136,0.07)";
                    e.currentTarget.style.color = "var(--secondary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--on-surface-variant)";
                  }}
                >
                  <span className="mi" style={{ fontSize: 16 }}>
                    event_note
                  </span>
                  Mening Bronlarim
                </Link>
              )}

              {/* Heart & calendar icons */}
              <button
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 9,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--on-surface-variant)",
                  transition: "background 0.18s, color 0.18s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(106,81,136,0.07)";
                  e.currentTarget.style.color = "var(--secondary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--on-surface-variant)";
                }}
              >
                <span className="mi" style={{ fontSize: 20 }}>
                  favorite_border
                </span>
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="btn-glass"
                style={{
                  padding: "7px 18px",
                  fontSize: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span className="mi" style={{ fontSize: 15 }}>
                  logout
                </span>
                Chiqish
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="btn-glass"
                style={{
                  textDecoration: "none",
                  padding: "8px 20px",
                  fontSize: 12,
                }}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="btn-primary"
                style={{
                  textDecoration: "none",
                  padding: "8px 22px",
                  fontSize: 12,
                }}
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
