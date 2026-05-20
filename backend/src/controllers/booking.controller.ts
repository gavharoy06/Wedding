import { Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../types';

// ─── BRON YARATISH ───────────────────────────────────────
export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { venue_id, booking_date, additional_info } = req.body;
    const user_id = req.user?.user_id;

    // 1. Maydonlar to'liqmi?
    if (!venue_id || !booking_date) {
      res.status(400).json({ message: "venue_id va booking_date shart." });
      return;
    }

    // 2. To'yxona mavjudmi?
    const venue = await pool.query(
      `SELECT venue_id FROM venues WHERE venue_id = $1`,
      [venue_id]
    );
    if (venue.rows.length === 0) {
      res.status(404).json({ message: "To'yxona topilmadi." });
      return;
    }

    // 3. Sana band emasmi?
    const existing = await pool.query(
      `SELECT booking_id FROM bookings 
       WHERE venue_id = $1 
       AND booking_date = $2 
       AND status != 'Bekor qilingan'`,
      [venue_id, booking_date]
    );
    if (existing.rows.length > 0) {
      res.status(409).json({ message: "Bu sana allaqachon band." });
      return;
    }

    // 4. Bron yaratish
    const result = await pool.query(
      `INSERT INTO bookings (user_id, venue_id, booking_date, additional_info, status)
       VALUES ($1, $2, $3, $4, 'Kutilmoqda')
       RETURNING *`,
      [user_id, venue_id, booking_date, additional_info || null]
    );

    res.status(201).json({
      message: "Bron muvaffaqiyatli yaratildi!",
      booking: result.rows[0],
    });

  } catch (error) {
    console.error('createBooking xatosi:', error);
    res.status(500).json({ message: 'Server xatosi.' });
  }
};

// ─── FOYDALANUVCHI BRONLARI ──────────────────────────────
export const getMyBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user_id = req.user?.user_id;

    const result = await pool.query(
      `SELECT 
         b.booking_id,
         b.booking_date,
         b.additional_info,
         b.status,
         b.created_at,
         v.name      AS venue_name,
         v.region    AS venue_region,
         v.price     AS venue_price,
         v.image_url AS venue_image
       FROM bookings b
       JOIN venues v ON b.venue_id = v.venue_id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
      [user_id]
    );

    res.status(200).json({ bookings: result.rows });

  } catch (error) {
    console.error('getMyBookings xatosi:', error);
    res.status(500).json({ message: 'Server xatosi.' });
  }
};