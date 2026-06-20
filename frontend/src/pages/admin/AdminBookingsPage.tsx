import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import { fetchAllBookings, cancelBooking, clearAdminError, clearAdminSuccess } from "../../store/adminSlice";

export default function AdminBookingsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { bookings, isLoading, error, success } = useSelector((state: RootState) => state.admin);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateSort, setDateSort] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    dispatch(fetchAllBookings());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => dispatch(clearAdminSuccess()), 3000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  const handleCancel = async (bookingId: number) => {
    if (window.confirm("Bronni bekor qilmoqchimisiz?")) {
      await dispatch(cancelBooking(bookingId));
    }
  };

  // Filter va sort
  const filteredBookings = bookings
    .filter((b: any) => {
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          b.venue_name?.toLowerCase().includes(search) ||
          b.user_name?.toLowerCase().includes(search) ||
          b.user_phone?.includes(search)
        );
      }
      return true;
    })
    .sort((a: any, b: any) => {
      const dateA = new Date(a.booking_date).getTime();
      const dateB = new Date(b.booking_date).getTime();
      return dateSort === "asc" ? dateA - dateB : dateB - dateA;
    });

  const getStatusDot = (status: string) => {
    const map: Record<string, string> = {
      CONFIRMED: "confirmed",
      PENDING: "pending",
      CANCELLED: "cancelled",
      COMPLETED: "completed",
    };
    const labels: Record<string, string> = {
      CONFIRMED: "Tasdiqlangan",
      PENDING: "Kutilmoqda",
      CANCELLED: "Bekor qilingan",
      COMPLETED: "Bo'lib o'tgan",
    };
    return (
      <span className={`status-dot ${map[status] || "pending"}`}>
        {labels[status] || status}
      </span>
    );
  };

  // Statistika
  const stats = {
    total: bookings.length,
    pending: bookings.filter((b: any) => b.status === 'PENDING').length,
    confirmed: bookings.filter((b: any) => b.status === 'CONFIRMED').length,
    completed: bookings.filter((b: any) => b.status === 'COMPLETED').length,
    cancelled: bookings.filter((b: any) => b.status === 'CANCELLED').length,
  };

  if (isLoading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "80px 0", gap: 12 }}>
      <div style={{ width: 24, height: 24, borderRadius: "50%", border: "2px solid transparent", borderTopColor: "var(--secondary)", animation: "spin 0.8s linear infinite" }} />
      <p style={{ fontSize: 13, color: "var(--outline)" }}>Yuklanmoqda...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--on-surface)" }}>Barcha Bronlar</h1>
        <p style={{ fontSize: 12, color: "var(--outline)", marginTop: 3 }}>Tizimda ro'yxatdan o'tgan barcha bronlar</p>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Jami", value: stats.total, icon: "list_alt", cls: "purple-bg" },
          { label: "Kutilmoqda", value: stats.pending, icon: "hourglass_empty", cls: "orange-bg" },
          { label: "Tasdiqlangan", value: stats.confirmed, icon: "check_circle", cls: "green-bg" },
          { label: "Bo'lib o'tgan", value: stats.completed, icon: "event_available", cls: "purple-bg" },
          { label: "Bekor qilingan", value: stats.cancelled, icon: "cancel", cls: "orange-bg" },
        ].map((s) => (
          <div key={s.label} className="admin-stat-card" style={{ padding: 16 }}>
            <div className={`admin-stat-icon ${s.cls}`} style={{ width: 36, height: 36, marginBottom: 10 }}>
              <span className="mi" style={{ fontSize: 18 }}>{s.icon}</span>
            </div>
            <p className="admin-stat-value" style={{ fontSize: 22 }}>{s.value}</p>
            <p className="admin-stat-label" style={{ fontSize: 11 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Alerts ── */}
      {error && (
        <div style={{ marginBottom: 16, padding: "12px 16px", borderRadius: 12, background: "rgba(186,26,26,0.06)", border: "1px solid rgba(186,26,26,0.15)", color: "var(--error)", fontSize: 13, display: "flex", justifyContent: "space-between" }}>
          {error}
          <button onClick={() => dispatch(clearAdminError())} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--error)" }}>
            <span className="mi" style={{ fontSize: 16 }}>close</span>
          </button>
        </div>
      )}
      {success && (
        <div style={{ marginBottom: 16, padding: "12px 16px", borderRadius: 12, background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)", color: "#059669", fontSize: 13, display: "flex", gap: 8, alignItems: "center" }}>
          <span className="mi" style={{ fontSize: 16 }}>check_circle</span>
          {success}
        </div>
      )}

      {/* ── Filter Panel ── */}
      <div className="admin-filter-bar">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          <div>
            <label className="form-label">Qidirish</label>
            <div style={{ position: "relative" }}>
              <span className="mi" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 18, color: "var(--outline)" }}>search</span>
              <input
                type="text"
                placeholder="To'yxona, mijoz yoki telefon..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
                style={{ paddingLeft: 40 }}
              />
            </div>
          </div>
          <div>
            <label className="form-label">Holat</label>
            <div style={{ position: "relative" }}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-input"
                style={{ appearance: "none", paddingRight: 36 }}
              >
                <option value="all">Barcha holatlar</option>
                <option value="PENDING">Kutilmoqda</option>
                <option value="CONFIRMED">Tasdiqlangan</option>
                <option value="COMPLETED">Bo'lib o'tgan</option>
                <option value="CANCELLED">Bekor qilingan</option>
              </select>
              <span className="mi" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 20, color: "var(--outline)", pointerEvents: "none" }}>expand_more</span>
            </div>
          </div>
          <div>
            <label className="form-label">Sana bo'yicha</label>
            <div style={{ position: "relative" }}>
              <select
                value={dateSort}
                onChange={(e) => setDateSort(e.target.value as "asc" | "desc")}
                className="form-input"
                style={{ appearance: "none", paddingRight: 36 }}
              >
                <option value="desc">Eng yangi</option>
                <option value="asc">Eng eski</option>
              </select>
              <span className="mi" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 20, color: "var(--outline)", pointerEvents: "none" }}>expand_more</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      {filteredBookings.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", background: "#fff", borderRadius: 16, border: "1px solid rgba(200,185,220,0.2)" }}>
          <span className="mi" style={{ fontSize: 48, color: "var(--outline-variant)", display: "block", marginBottom: 12 }}>inbox</span>
          <p style={{ color: "var(--outline)", fontSize: 14 }}>Hech qanday bron topilmadi.</p>
        </div>
      ) : (
        <div className="admin-section-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="admin-venues-table" style={{ minWidth: 900 }}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>To'yxona</th>
                  <th>Mijoz</th>
                  <th>Sana</th>
                  <th>Mehmonlar</th>
                  <th>Jami</th>
                  <th>Avans</th>
                  <th>Holat</th>
                  <th>Harakat</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((b: any) => (
                  <tr key={b.booking_id}>
                    <td style={{ fontSize: 12, color: "var(--outline)", fontWeight: 600 }}>#{b.booking_id}</td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{b.venue_name}</div>
                      <div style={{ fontSize: 11, color: "var(--outline)" }}>{b.venue_district}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{b.user_name}</div>
                      <div style={{ fontSize: 11, color: "var(--outline)" }}>{b.user_phone}</div>
                    </td>
                    <td style={{ fontSize: 12, color: "var(--on-surface-variant)" }}>
                      {new Date(b.booking_date).toLocaleDateString('uz-UZ')}
                    </td>
                    <td style={{ fontSize: 13 }}>{b.guest_count} kishi</td>
                    <td style={{ fontSize: 13, fontWeight: 600 }}>{Number(b.total_price).toLocaleString()} so'm</td>
                    <td style={{ fontSize: 13 }}>{Number(b.prepayment).toLocaleString()} so'm</td>
                    <td>{getStatusDot(b.status)}</td>
                    <td>
                      {b.status !== 'CANCELLED' && b.status !== 'COMPLETED' && (
                        <button
                          onClick={() => handleCancel(b.booking_id)}
                          className="icon-btn danger"
                          title="Bekor qilish"
                        >
                          <span className="mi" style={{ fontSize: 17 }}>cancel</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="admin-pagination" style={{ margin: "0 24px 16px" }}>
            <p>Jami {filteredBookings.length} ta bron</p>
          </div>
        </div>
      )}
    </div>
  );
}