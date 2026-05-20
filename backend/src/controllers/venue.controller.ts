import { Request, Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../types';

// ─── BARCHA TO'YXONALAR (qidiruv + filter + saralash) ───
export const getVenues = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, region, sort } = req.query;

    let query = `SELECT * FROM venues WHERE 1=1`;
    const params: any[] = [];
    let i = 1;

    // Qidiruv — nom bo'yicha
    if (search) {
      query += ` AND name ILIKE $${i}`;
      params.push(`%${search}%`);
      i++;
    }

    // Filter — viloyat bo'yicha
    if (region) {
      query += ` AND region = $${i}`;
      params.push(region);
      i++;
    }

    // Saralash — narx bo'yicha
    if (sort === 'asc') {
      query += ` ORDER BY price ASC`;
    } else if (sort === 'desc') {
      query += ` ORDER BY price DESC`;
    } else {
      query += ` ORDER BY created_at DESC`;
    }

    const result = await pool.query(query, params);
    res.status(200).json({ venues: result.rows });

  } catch (error) {
    console.error('getVenues xatosi:', error);
    res.status(500).json({ message: 'Server xatosi.' });
  }
};

// ─── BITTA TO'YXONA ──────────────────────────────────────
export const getVenueById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT * FROM venues WHERE venue_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: "To'yxona topilmadi." });
      return;
    }

    // Shu to'yxonaning band sanalari
    const bookings = await pool.query(
      `SELECT booking_date FROM bookings 
       WHERE venue_id = $1 
       AND status != 'Bekor qilingan'`,
      [id]
    );

    res.status(200).json({
      venue: result.rows[0],
      bookedDates: bookings.rows.map(b => b.booking_date),
    });

  } catch (error) {
    console.error('getVenueById xatosi:', error);
    res.status(500).json({ message: 'Server xatosi.' });
  }
};