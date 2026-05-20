
import { Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../types';

// ─── OWNER BRONLARINI KO'RISH ────────────────────────────
export const getOwnerBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const owner_id = req.user?.user_id;

    const result = await pool.query(
      `SELECT 
         b.booking_id,
         b.booking_date,
         b.additional_info,
         b.status,
         b.created_at,
         u.name  AS user_name,
         u.email AS user_email,
         v.name  AS venue_name
       FROM bookings b
       JOIN venues  v ON b.venue_id = v.venue_id
       JOIN users   u ON b.user_id  = u.user_id
       WHERE v.owner_id = $1
       ORDER BY b.booking_date ASC`,
      [owner_id]
    );

    res.status(200).json({ bookings: result.rows });

  } catch (error) {
    console.error('getOwnerBookings xatosi:', error);
    res.status(500).json({ message: 'Server xatosi.' });
  }
};

// ─── BRON HOLATINI YANGILASH ─────────────────────────────
export const updateBookingStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const owner_id = req.user?.user_id;

    const allowed = ['Tasdiqlangan', 'Bekor qilingan'];
    if (!allowed.includes(status)) {
      res.status(400).json({ message: "Status noto'g'ri." });
      return;
    }

    // Bron shu owner ga tegishlimi?
    const check = await pool.query(
      `SELECT b.booking_id FROM bookings b
       JOIN venues v ON b.venue_id = v.venue_id
       WHERE b.booking_id = $1 AND v.owner_id = $2`,
      [id, owner_id]
    );

    if (check.rows.length === 0) {
      res.status(403).json({ message: "Bu bron sizga tegishli emas." });
      return;
    }

    const result = await pool.query(
      `UPDATE bookings SET status = $1 
       WHERE booking_id = $2 
       RETURNING *`,
      [status, id]
    );

    res.status(200).json({
      message: "Holat yangilandi.",
      booking: result.rows[0],
    });

  } catch (error) {
    console.error('updateBookingStatus xatosi:', error);
    res.status(500).json({ message: 'Server xatosi.' });
  }
};