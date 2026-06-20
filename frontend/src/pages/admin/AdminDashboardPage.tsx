import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import type { AppDispatch, RootState } from "../../store/store";
import { fetchAllVenues } from "../../store/adminSlice";
import { fetchAllBookings } from "../../store/adminSlice";

export default function AdminDashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { venues, bookings } = useSelector((state: RootState) => state.admin);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(fetchAllVenues());
    dispatch(fetchAllBookings());
  }, [dispatch]);

  const stats = {
    totalVenues: venues.length,
    pendingVenues: venues.filter((v: any) => v.status === "PENDING").length,
    approvedVenues: venues.filter((v: any) => v.status === "APPROVED").length,
    rejectedVenues: venues.filter((v: any) => v.status === "REJECTED").length,
    totalBookings: bookings.length,
    pendingBookings: bookings.filter((b: any) => b.status === "PENDING").length,
    confirmedBookings: bookings.filter((b: any) => b.status === "CONFIRMED")
      .length,
    totalRevenue: bookings.reduce(
      (sum: number, b: any) => sum + Number(b.prepayment || 0),
      0,
    ),
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "A";

  const recentVenues = [...venues].slice(0, 5);

  const getStatusDot = (status: string) => {
    const map: Record<string, string> = {
      APPROVED: "approved",
      PENDING: "pending",
      REJECTED: "rejected",
    };
    const labels: Record<string, string> = {
      APPROVED: "Tasdiqlangan",
      PENDING: "Kutilmoqda",
      REJECTED: "Rad etilgan",
    };
    return (
      <span className={`status-dot ${map[status] || "pending"}`}>
        {labels[status] || status}
      </span>
    );
  };

  const formatRevenue = (val: number) => {
    if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)}B`;
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
    return val.toLocaleString();
  };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      {/* ── Welcome Banner ── */}
      <div className="admin-welcome-banner">
        <div>
          <h1 className="admin-welcome-title">Xush kelibsiz, Admin</h1>
          <p className="admin-welcome-sub">
            Bugun ajoyib kun. Tizim holati barqaror va yangi so'rovlar kutmoqda.
          </p>
        </div>
        <div className="admin-user-card">
          <div className="admin-user-avatar">{initials}</div>
          <div className="admin-user-card-info">
            <h4>Asosiy Administrator</h4>
            <p>Toshkent, O'zbekiston</p>
          </div>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="admin-stats-grid">
        {/* Jami Zallar */}
        <div className="admin-stat-card">
          <span className="admin-stat-badge green">
            +{stats.approvedVenues} yangi
          </span>
          <div className="admin-stat-icon purple-bg">
            <span className="mi" style={{ fontSize: 22 }}>
              domain
            </span>
          </div>
          <p className="admin-stat-label">Jami Zallar</p>
          <p className="admin-stat-value">{stats.totalVenues}</p>
        </div>

        {/* Kutilayotgan Tasdiqlar */}
        <div className="admin-stat-card">
          <span className="admin-stat-badge orange">Muhim</span>
          <div className="admin-stat-icon orange-bg">
            <span className="mi" style={{ fontSize: 22 }}>
              pending_actions
            </span>
          </div>
          <p className="admin-stat-label">Kutilayotgan Tasdiqlar</p>
          <p className="admin-stat-value">{stats.pendingVenues}</p>
        </div>

        {/* Band Qilinganlar */}
        <div className="admin-stat-card">
          <span className="admin-stat-badge blue">Bugun</span>
          <div className="admin-stat-icon green-bg">
            <span className="mi" style={{ fontSize: 22 }}>
              event_available
            </span>
          </div>
          <p className="admin-stat-label">Band Qilinganlar</p>
          <p className="admin-stat-value">{stats.confirmedBookings}</p>
        </div>

        {/* Oylik Tushum */}
        <div className="admin-stat-card">
          <span className="admin-stat-badge purple">+15%</span>
          <div className="admin-stat-icon peach-bg">
            <span className="mi" style={{ fontSize: 22 }}>
              payments
            </span>
          </div>
          <p className="admin-stat-label">Oylik Tushum</p>
          <p className="admin-stat-value">
            {formatRevenue(stats.totalRevenue)}
            <span>UZS</span>
          </p>
        </div>
      </div>

      {/* ── Recent Venues Table ── */}
      <div className="admin-section-card">
        <div className="admin-section-header">
          <div>
            <h2>Yangi Zal So'rovlari</h2>
            <p>Oxirgi ro'yxatdan o'tish arizalari</p>
          </div>
          <Link
            to="/admin/venues"
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "var(--secondary)",
              textDecoration: "none",
            }}
          >
            Barchasini ko'rish
          </Link>
        </div>

        {recentVenues.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px 0",
              color: "var(--outline)",
            }}
          >
            <span
              className="mi"
              style={{ fontSize: 40, display: "block", marginBottom: 8 }}
            >
              inbox
            </span>
            Hozircha so'rovlar yo'q
          </div>
        ) : (
          <>
            <table className="admin-venues-table">
              <thead>
                <tr>
                  <th>Zal Nomi</th>
                  <th>Egasi</th>
                  <th>Manzil</th>
                  <th>Sana</th>
                  <th>Holat</th>
                  <th>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {recentVenues.map((venue: any) => (
                  <tr key={venue.venue_id}>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <div className="admin-venue-thumb">
                          {venue.primary_image ? (
                            <img
                              src={`http://localhost:5000${venue.primary_image}`}
                              alt={venue.name}
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                          ) : (
                            <span
                              className="mi"
                              style={{ fontSize: 20, color: "#c4b5d9" }}
                            >
                              domain
                            </span>
                          )}
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: 13 }}>
                            {venue.name}
                          </p>
                          <p style={{ fontSize: 11, color: "var(--outline)" }}>
                            ID: #{venue.venue_id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 13 }}>{venue.owner_name || "—"}</td>
                    <td
                      style={{
                        fontSize: 13,
                        color: "var(--on-surface-variant)",
                      }}
                    >
                      {venue.district_name}
                      {venue.address ? `, ${venue.address}` : ""}
                    </td>
                    <td style={{ fontSize: 12, color: "var(--outline)" }}>
                      {venue.created_at
                        ? new Date(venue.created_at).toLocaleDateString("uz-UZ")
                        : "—"}
                    </td>
                    <td>{getStatusDot(venue.status)}</td>
                    <td>
                      <div style={{ display: "flex", gap: 4 }}>
                        <Link
                          to={`/venues/${venue.venue_id}`}
                          className="icon-btn"
                          title="Ko'rish"
                        >
                          <span
                            className="mi"
                            style={{ fontSize: 17, color: "var(--secondary)" }}
                          >
                            visibility
                          </span>
                        </Link>
                        <button className="icon-btn" title="Boshqa">
                          <span className="mi" style={{ fontSize: 17 }}>
                            more_vert
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="admin-pagination">
              <p>
                Jami {venues.length} tadan 1-{recentVenues.length}{" "}
                ko'rsatilmoqda
              </p>
              <div className="admin-pagination-btns">
                <button className="admin-page-btn">Oldingi</button>
                <button className="admin-page-btn active">Keyingi</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
