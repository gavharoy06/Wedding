import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store/store";
import { fetchMyBookings, cancelBooking } from "../store/bookingSlice";
import { Link } from "react-router-dom";
import myBookingsBg from "../assets/wedding-3.jpg";


export default function MyBookingsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { bookings, isLoading, error } = useSelector((state: RootState) => state.bookings);

  useEffect(() => {
    dispatch(fetchMyBookings());
  }, [dispatch]);

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

  if (isLoading) return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", border: "2.5px solid transparent", borderTopColor: "var(--secondary)", animation: "spin 0.8s linear infinite" }} />
      <p style={{ fontSize: 13, color: "var(--outline)" }}>Yuklanmoqda...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "var(--error)", fontSize: 14 }}>{error}</p>
    </div>
  );

  return (
        <section
      className="bg-cover bg-center bg-no-repeat bg-fixed w-full min-h-screen"
      style={{ backgroundImage: `url(${myBookingsBg})` }}
    >
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px 64px" }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 32 }}>
        <h1 className="font-display" style={{ fontSize: 32, fontWeight: 700, color: "var(--on-surface)", marginBottom: 6 }}>
          Mening Bronlarim
        </h1>
        <p style={{ fontSize: 13, color: "var(--outline)" }}>
          Barcha bron so'rovlaringiz va ularning holati
        </p>
      </div>

      {bookings.length === 0 ? (
        <div  className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl shadow-black/5 ring-1 ring-white/10" >
          <span className="mi" style={{ fontSize: 56, color: "var(--outline-variant)", display: "block", marginBottom: 16 }}>event_busy</span>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--on-surface)", marginBottom: 8 }}>Hozircha bron yo'q</h3>
          <p style={{ fontSize: 13, color: "var(--outline)", marginBottom: 24 }}>
            To'yxona tanlang va bron qiling
          </p>
          <Link to="/" className="btn-primary" style={{ textDecoration: "none", display: "inline-flex", padding: "11px 28px" }}>
            <span className="mi" style={{ fontSize: 17 }}>search</span>
            To'yxonalarni ko'rish
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {bookings.map((b) => (
            <div
             className="backdrop-blur-xl bg-white/10 border border-white/22 shadow-2xl shadow-black/5 ring-1 ring-white/10" 
              key={b.venue_id}
            >
              {/* Top stripe */}
              <div style={{ height: 4, background: b.status === "CONFIRMED" ? "linear-gradient(90deg,#10b981,#34d399)" : b.status === "PENDING" ? "linear-gradient(90deg,#f59e0b,#fbbf24)" : b.status === "CANCELLED" ? "linear-gradient(90deg,#ba1a1a,#ef4444)" : "linear-gradient(90deg,#6c4ab2,#9c6dd6)" }} />

              <div style={{ padding: "20px 24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--on-surface)", marginBottom: 4 }}>
                      {b.venue_name}
                    </h3>
                    <p style={{ fontSize: 12, color: "var(--outline)" }}>Bron ID: #{b.venue_id}</p>
                  </div>
                  {getStatusDot(b.status)}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, padding: "16px 0", borderTop: "1px solid rgba(200,185,220,0.15)", borderBottom: "1px solid rgba(200,185,220,0.15)", marginBottom: 16 }}>
                  <div>
                    <p style={{ fontSize: 11, color: "var(--outline)", marginBottom: 3, display: "flex", alignItems: "center", gap: 4 }}>
                      <span className="mi" style={{ fontSize: 13 }}>event</span> Sana
                    </p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "var(--on-surface)" }}>
                      {new Date(b.booking_date).toLocaleDateString("uz-UZ")}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: "var(--outline)", marginBottom: 3, display: "flex", alignItems: "center", gap: 4 }}>
                      <span className="mi" style={{ fontSize: 13 }}>group</span> Mehmonlar
                    </p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "var(--on-surface)" }}>{b.guest_count} kishi</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: "var(--outline)", marginBottom: 3, display: "flex", alignItems: "center", gap: 4 }}>
                      <span className="mi" style={{ fontSize: 13 }}>payments</span> Jami narx
                    </p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "var(--secondary)" }}>
                      {b.total_price.toLocaleString()} so'm
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: "var(--outline)", marginBottom: 3, display: "flex", alignItems: "center", gap: 4 }}>
                      <span className="mi" style={{ fontSize: 13 }}>account_balance_wallet</span> Avans
                    </p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "var(--on-surface)" }}>
                      {b.prepayment.toLocaleString()} so'm
                    </p>
                  </div>
                </div>

                {/* Action */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                  <Link
                    to={`/venues/${b.venue_id}`}
                    className="btn-glass"
                    style={{ textDecoration: "none", padding: "8px 18px", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}
                  >
                    <span className="mi" style={{ fontSize: 15 }}>visibility</span>
                    Ko'rish
                  </Link>
                  {b.status !== "CANCELLED" && b.status !== "COMPLETED" && (
                    <button
                      onClick={() => dispatch(cancelBooking(b.venue_id))}
                      style={{ padding: "8px 18px", borderRadius: 10, background: "rgba(186,26,26,0.06)", color: "var(--error)", border: "1px solid rgba(186,26,26,0.18)", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5 }}
                    >
                      <span className="mi" style={{ fontSize: 15 }}>cancel</span>
                      Bekor qilish
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </section>
  );
}