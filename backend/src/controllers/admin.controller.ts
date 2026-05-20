import { Request, Response } from 'express';
import pool from '../config/db';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../types';

// ─── YANGI TO'YXONA QO'SHISH ─────────────────────────────
export const createVenue = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, region, seats, price, description, image_url, owner_email, owner_name, owner_password } = req.body;

    if (!name || !region || !seats || !price || !owner_email || !owner_name || !owner_password) {
      res.status(400).json({ message: "Barcha maydonlarni to'ldiring." });
      return;
    }

    // 1. Owner hisob yaratish
    const hashedPassword = await bcrypt.hash(owner_password, 12);
    const ownerResult = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, 'owner')
       RETURNING user_id`,
      [owner_name, owner_email, hashedPassword]
    );
    const owner_id = ownerResult.rows[0].user_id;

    // 2. To'yxona yaratish
    const venueResult = await pool.query(
      `INSERT INTO venues (name, region, seats, price, description, image_url, owner_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, region, seats, price, description || null, image_url || null, owner_id]
    );

    res.status(201).json({
      message: "To'yxona va egasi muvaffaqiyatli yaratildi!",
      venue: venueResult.rows[0],
    });

  } catch (error) {
    console.error('createVenue xatosi:', error);
    res.status(500).json({ message: 'Server xatosi.' });
  }
};

// ─── TO'YXONA TAHRIRLASH ─────────────────────────────────
export const updateVenue = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, region, seats, price, description, image_url } = req.body;

    const result = await pool.query(
      `UPDATE venues 
       SET name=$1, region=$2, seats=$3, price=$4, description=$5, image_url=$6
       WHERE venue_id=$7
       RETURNING *`,
      [name, region, seats, price, description, image_url, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: "To'yxona topilmadi." });
      return;
    }

    res.status(200).json({ message: "Yangilandi.", venue: result.rows[0] });

  } catch (error) {
    console.error('updateVenue xatosi:', error);
    res.status(500).json({ message: 'Server xatosi.' });
  }
};

// ─── TO'YXONA O'CHIRISH ──────────────────────────────────
export const deleteVenue = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await pool.query(`DELETE FROM bookings WHERE venue_id = $1`, [id]);
    await pool.query(`DELETE FROM venues WHERE venue_id = $1`, [id]);

    res.status(200).json({ message: "To'yxona o'chirildi." });

  } catch (error) {
    console.error('deleteVenue xatosi:', error);
    res.status(500).json({ message: 'Server xatosi.' });
  }
};

// ─── BARCHA BRONLAR ──────────────────────────────────────
export const getAllBookings = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT 
         b.booking_id,
         b.booking_date,
         b.additional_info,
         b.status,
         b.created_at,
         u.name  AS user_name,
         u.email AS user_email,
         v.name  AS venue_name,
         v.region AS venue_region
       FROM bookings b
       JOIN users  u ON b.user_id  = u.user_id
       JOIN venues v ON b.venue_id = v.venue_id
       ORDER BY b.created_at DESC`
    );

    res.status(200).json({ bookings: result.rows });

  } catch (error) {
    console.error('getAllBookings xatosi:', error);
    res.status(500).json({ message: 'Server xatosi.' });
  }
};

// ─── BARCHA TO'YXONALAR ──────────────────────────────────
export const getAllVenues = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT v.*, u.name AS owner_name, u.email AS owner_email
       FROM venues v
       JOIN users u ON v.owner_id = u.user_id
       ORDER BY v.created_at DESC`
    );
    res.status(200).json({ venues: result.rows });
  } catch (error) {
    res.status(500).json({ message: 'Server xatosi.' });
  }
};