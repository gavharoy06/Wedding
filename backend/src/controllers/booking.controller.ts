import { Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../types';

// ─── BRON YARATISH (xizmatlar + 20% avans, transaction bilan) ───
export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  const client = await pool.connect();
  try {
    const { venue_id, booking_date, additional_info, guest_count, services } = req.body;
    // services = [{ extra_service_id, quantity }]
    const user_id = req.user?.user_id;

    if (!venue_id || !booking_date || !guest_count) {
      res.status(400).json({ message: 'venue_id, booking_date va guest_count shart.' });
      return;
    }

    await client.query('BEGIN');

    // To'yxona mavjud va tasdiqlangan?
    const venue = await client.query(
      `SELECT venue_id, price, seats FROM venues
       WHERE venue_id = $1 AND status = 'APPROVED'`,
      [venue_id]
    );
    if (venue.rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(404).json({ message: "To'yxona topilmadi yoki tasdiqlanmagan." });
      return;
    }

    // Sana band emasmi?
    const existing = await client.query(
      `SELECT booking_id FROM bookings
       WHERE venue_id = $1 AND booking_date = $2 AND status <> 'CANCELLED'`,
      [venue_id, booking_date]
    );
    if (existing.rows.length > 0) {
      await client.query('ROLLBACK');
      res.status(409).json({ message: 'Bu sana allaqachon band.' });
      return;
    }

    // Narx hisobi: o'rindiq narxi * mehmonlar soni + xizmatlar
    const seatPrice = Number(venue.rows[0].price);
    let total = seatPrice * Number(guest_count);

    // Xizmatlarni tekshirish va subtotal hisoblash
    const chosen: { id: number; qty: number; subtotal: number }[] = [];
    if (Array.isArray(services)) {
      for (const s of services) {
        const sv = await client.query(
          `SELECT service_price FROM extra_services
           WHERE extra_service_id = $1 AND venue_id = $2 AND is_available = TRUE`,
          [s.extra_service_id, venue_id]
        );
        if (sv.rows.length === 0) continue;
        const qty = Number(s.quantity) > 0 ? Number(s.quantity) : 1;
        const subtotal = Number(sv.rows[0].service_price) * qty;
        total += subtotal;
        chosen.push({ id: s.extra_service_id, qty, subtotal });
      }
    }

    const prepayment = Math.round(total * 0.2 * 100) / 100; // 20% avans

    const result = await client.query(
      `INSERT INTO bookings
         (user_id, venue_id, booking_date, additional_info, guest_count, total_price, prepayment, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING')
       RETURNING *`,
      [user_id, venue_id, booking_date, additional_info || null, guest_count, total, prepayment]
    );
    const booking = result.rows[0];

    for (const c of chosen) {
      await client.query(
        `INSERT INTO booking_extra_services (booking_id, extra_service_id, quantity, subtotal)
         VALUES ($1, $2, $3, $4)`,
        [booking.booking_id, c.id, c.qty, c.subtotal]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({
      message: 'Bron muvaffaqiyatli yaratildi!',
      booking,
      total_price: total,
      prepayment,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('createBooking xatosi:', error);
    res.status(500).json({ message: 'Server xatosi.' });
  } finally {
    client.release();
  }
};

// ─── FOYDALANUVCHI BRONLARI ──────────────────────────────
export const getMyBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user_id = req.user?.user_id;
    const result = await pool.query(
      `SELECT b.booking_id, b.venue_id, b.booking_date, b.additional_info, b.guest_count,
              b.total_price, b.prepayment, b.status, b.created_at,
              v.name AS venue_name, d.district_name AS venue_district, v.price AS venue_price
       FROM bookings b
       JOIN venues v   ON b.venue_id = v.venue_id
       JOIN districts d ON v.district_id = d.district_id
       WHERE b.user_id = $1
       ORDER BY b.booking_date DESC`,
      [user_id]
    );
    res.status(200).json({ bookings: result.rows });
  } catch (error) {
    console.error('getMyBookings xatosi:', error);
    res.status(500).json({ message: 'Server xatosi.' });
  }
};

// ─── BRONNI BEKOR QILISH (foydalanuvchi o'ziniki) ───
export const cancelMyBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user_id = req.user?.user_id;
    const result = await pool.query(
      `UPDATE bookings SET status = 'CANCELLED'
       WHERE booking_id = $1 AND user_id = $2 AND status <> 'CANCELLED'
       RETURNING *`,
      [id, user_id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Bron topilmadi yoki allaqachon bekor qilingan.' });
      return;
    }
    res.status(200).json({ message: 'Bron bekor qilindi.', booking: result.rows[0] });
  } catch (error) {
    console.error('cancelMyBooking xatosi:', error);
    res.status(500).json({ message: 'Server xatosi.' });
  }
};
