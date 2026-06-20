import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import { fetchOwnerBookings, updateBookingStatus, clearOwnerError, clearOwnerSuccess } from "../../store/ownerSlice";
import { useSearchParams } from "react-router-dom";

export default function OwnerBookingsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { bookings, isLoading, error, success } = useSelector((state: RootState) => state.owner);
  const [searchParams] = useSearchParams();
  const venueFilter = searchParams.get("venue");
  
  const [selectedVenue, setSelectedVenue] = useState<string>(venueFilter || "all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [venues, setVenues] = useState<{ venue_id: number; name: string }[]>([]);

  useEffect(() => {
    dispatch(fetchOwnerBookings());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => dispatch(clearOwnerSuccess()), 3000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  // Venues list for filter
  useEffect(() => {
    if (bookings) {
      const uniqueVenues = Array.from(
        new Map(bookings.map((b: any) => [b.venue_id, { venue_id: b.venue_id, name: b.venue_name }])).values()
      );
      setVenues(uniqueVenues);
    }
  }, [bookings]);

  const filteredBookings = bookings.filter((b: any) => {
    if (selectedVenue !== "all" && b.venue_id !== Number(selectedVenue)) return false;
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    return true;
  });

  const handleStatusChange = async (bookingId: number, newStatus: string) => {
    if (window.confirm(`Bronni ${newStatus === 'CANCELLED' ? 'bekor qilmoqchimisiz?' : newStatus === 'COMPLETED' ? "bo'lib o'tgan deb belgilamoqchimisiz?" : 'tasdiqlamoqchimisiz?'}`)) {
      await dispatch(updateBookingStatus({ bookingId, status: newStatus }));
    }
  };

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

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b: any) => b.status === 'PENDING').length,
    confirmed: bookings.filter((b: any) => b.status === 'CONFIRMED').length,
    completed: bookings.filter((b: any) => b.status === 'COMPLETED').length,
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
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--on-surface)" }}>To'yxona Bronlari</h1>
        <p style={{ fontSize: 12, color: "var(--outline)", marginTop: 3 }}>Sizning to'yxonalaringizga tushgan bronlar</p>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Jami bronlar", value: stats.total, icon: "list_alt", cls: "purple-bg" },
          { label: "Kutilmoqda", value: stats.pending, icon: "hourglass_empty", cls: "orange-bg" },
          { label: "Tasdiqlangan", value: stats.confirmed, icon: "check_circle", cls: "green-bg" },
          { label: "Bo'lib o'tgan", value: stats.completed, icon: "event_available", cls: "purple-bg" },
        ].map((s) => (
          <div key={s.label} className="admin-stat-card">
            <div className={`admin-stat-icon ${s.cls}`}>
              <span className="mi" style={{ fontSize: 20 }}>{s.icon}</span>
            </div>
            <p className="admin-stat-value">{s.value}</p>
            <p className="admin-stat-label">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Alerts ── */}
      {error && (
        <div style={{ marginBottom: 16, padding: "12px 16px", borderRadius: 12, background: "rgba(186,26,26,0.06)", border: "1px solid rgba(186,26,26,0.15)", color: "var(--error)", fontSize: 13, display: "flex", justifyContent: "space-between" }}>
          {error}
          <button onClick={() => dispatch(clearOwnerError())} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--error)" }}>
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
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label className="form-label">To'yxona</label>
            <div style={{ position: "relative" }}>
              <select
                value={selectedVenue}
                onChange={(e) => setSelectedVenue(e.target.value)}
                className="form-input"
                style={{ appearance: "none", paddingRight: 36 }}
              >
                <option value="all">Barcha to'yxonalar</option>
                {venues.map((v) => (
                  <option key={v.venue_id} value={v.venue_id}>{v.name}</option>
                ))}
              </select>
              <span className="mi" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 20, color: "var(--outline)", pointerEvents: "none" }}>expand_more</span>
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
                <option value="CANCELLED">Bekor qilingan</option>
                <option value="COMPLETED">Bo'lib o'tgan</option>
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
          <p style={{ color: "var(--outline)", fontSize: 14 }}>Hozircha bronlar mavjud emas.</p>
        </div>
      ) : (
        <div className="admin-section-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="admin-venues-table" style={{ minWidth: 800 }}>
              <thead>
                <tr>
                  <th>#ID</th>
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
                    <td style={{ fontWeight: 600, fontSize: 13 }}>{b.venue_name}</td>
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
                      <div style={{ display: "flex", gap: 6 }}>
                        {b.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(b.booking_id, 'CONFIRMED')}
                              className="icon-btn success"
                              title="Tasdiqlash"
                            >
                              <span className="mi" style={{ fontSize: 16 }}>check_circle</span>
                            </button>
                            <button
                              onClick={() => handleStatusChange(b.booking_id, 'CANCELLED')}
                              className="icon-btn danger"
                              title="Bekor qilish"
                            >
                              <span className="mi" style={{ fontSize: 16 }}>cancel</span>
                            </button>
                          </>
                        )}
                        {b.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleStatusChange(b.booking_id, 'COMPLETED')}
                            className="icon-btn"
                            title="Bo'lib o'tdi"
                            style={{ color: "#4f46e5" }}
                          >
                            <span className="mi" style={{ fontSize: 16 }}>event_available</span>
                          </button>
                        )}
                      </div>
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