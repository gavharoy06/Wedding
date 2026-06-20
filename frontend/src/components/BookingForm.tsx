import { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store/store";
import { createBooking } from "../store/bookingSlice";
import type { ExtraService } from "../types/venue";
import BookingCalendar from "./BookingCalendar";

interface Props {
  venueId: number;
  services: ExtraService[];
  bookedDates: string[];
  venuePrice: number;
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--on-surface-variant)",
  marginBottom: 8,
};

export default function BookingForm({ venueId, services, bookedDates, venuePrice = 0 }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error, success } = useSelector((state: RootState) => state.bookings);

  const [bookingDate, setBookingDate] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [showPaymentStep, setShowPaymentStep] = useState(false);

  const toggleService = (id: number) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = 1;
      return next;
    });
  };

  const totalPrice = useMemo(() => {
    const venueTotal = (venuePrice || 0) * guestCount;
    const servicesTotal = Object.entries(selected).reduce((sum, [id, qty]) => {
      const service = services.find(s => s.extra_service_id === Number(id));
      return sum + (service ? service.service_price * qty : 0);
    }, 0);
    return venueTotal + servicesTotal;
  }, [venuePrice, guestCount, selected, services]);

  const prepayment = Math.round(totalPrice * 0.20);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDate) return;
    setShowPaymentStep(true);   // Avans bosqichiga o'tish
  };

  const confirmPaymentAndBook = () => {
    const servicesPayload = Object.entries(selected).map(([id, qty]) => ({
      extra_service_id: Number(id),
      quantity: qty,
    }));

    dispatch(createBooking({
      venue_id: venueId,
      booking_date: bookingDate,
      guest_count: guestCount,
      additional_info: additionalInfo || undefined,
      services: servicesPayload,
      prepayment: prepayment,
    }));
  };

  // Success holati
  if (success) {
    return (
      <div style={{ borderRadius: 16, border: "1.5px solid rgba(16,185,129,0.25)", background: "rgba(16,185,129,0.06)", padding: "40px 24px", textAlign: "center" }}>
        <span className="mi" style={{ fontSize: 48, color: "#059669" }}>check_circle</span>
        <p style={{ fontSize: 18, fontWeight: 700, color: "#059669", marginTop: 16 }}>Bron muvaffaqiyatli yaratildi!</p>
        <p style={{ color: "var(--on-surface-variant)", marginTop: 8 }}>Avans to‘landi: <strong>{prepayment.toLocaleString()} so‘m</strong></p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Calendar */}
      <div style={{ marginBottom: 28 }}>
        <label style={labelStyle}>Sana tanlang</label>
        <BookingCalendar
          bookedDates={bookedDates}
          onSelectDate={setBookingDate}
          selectedDate={bookingDate || null}
        />
      </div>

      {/* Mehmonlar soni */}
      <div style={{ marginBottom: 24 }}>
        <label style={labelStyle}>Mehmonlar soni</label>
        <div style={{ display: "flex", alignItems: "center", border: "1.5px solid var(--outline-variant)", borderRadius: 12, overflow: "hidden" }}>
          <button type="button" onClick={() => setGuestCount(v => Math.max(1, v-1))} style={{ width: 44, height: 44, fontSize: 20 }}>-</button>
          <input type="number" value={guestCount} onChange={e => setGuestCount(Number(e.target.value))} style={{ flex: 1, textAlign: "center", fontSize: 17, fontWeight: 700 }} min={1} />
          <button type="button" onClick={() => setGuestCount(v => v+1)} style={{ width: 44, height: 44, fontSize: 20 }}>+</button>
        </div>
      </div>

      {/* Xizmatlar */}
      {services.filter(s => s.is_available).length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Qo'shimcha xizmatlar</label>
          {/* ... sizning oldingi xizmatlar kodingiz ... */}
        </div>
      )}

      {/* Additional Info */}
      <div style={{ marginBottom: 28 }}>
        <label style={labelStyle}>Qo'shimcha izoh</label>
        <textarea value={additionalInfo} onChange={e => setAdditionalInfo(e.target.value)} placeholder="Maxsus talablar..." rows={3} className="form-input" />
      </div>

      {/* Avans ma'lumoti */}
      {bookingDate && (
        <div style={{ background: "rgba(108,74,178,0.05)", padding: 20, borderRadius: 16, marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Umumiy summa</span>
            <span style={{ fontWeight: 700 }}>{totalPrice.toLocaleString()} so‘m</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, color: "#059669", fontWeight: 700 }}>
            <span>Avans (20%)</span>
            <span>{prepayment.toLocaleString()} so‘m</span>
          </div>
        </div>
      )}

      {/* Asosiy tugma */}
      <button
        type="submit"
        disabled={isLoading || !bookingDate}
        className="btn-primary"
        style={{ width: "100%" }}
      >
        {isLoading ? "Yuborilmoqda..." : "Bron qilish va Avans to‘lash"}
      </button>

      {/* Avans tasdiqlash oynasi */}
      {showPaymentStep && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "white", borderRadius: 20, padding: 32, maxWidth: 380, textAlign: "center" }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Avans to‘lovi</h3>
            <p style={{ fontSize: 28, fontWeight: 700, color: "#059669", marginBottom: 8 }}>{prepayment.toLocaleString()} so‘m</p>
            <p style={{ color: "#666", marginBottom: 24 }}>20% avans to‘lovi</p>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                type="button"
                onClick={() => setShowPaymentStep(false)}
                style={{ flex: 1, padding: "14px", borderRadius: 12, border: "1px solid #ddd" }}
              >
                Bekor qilish
              </button>
              <button
                onClick={confirmPaymentAndBook}
                disabled={isLoading}
                style={{ flex: 1, padding: "14px", borderRadius: 12, background: "#6a47af", color: "white", fontWeight: 600 }}
              >
                {isLoading ? "Yuborilmoqda..." : "To‘lovni tasdiqlash"}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}