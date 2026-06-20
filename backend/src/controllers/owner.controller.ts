import { Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../types';

export const getOwnerBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const owner_id = req.user?.user_id;
    const result = await pool.query(
      `SELECT b.booking_id, b.booking_date, b.additional_info, b.guest_count,
              b.total_price, b.status, b.created_at,
              u.name AS user_name, u.email AS user_email, u.phone AS user_phone,
              v.name AS venue_name
       FROM bookings b
       JOIN venues v ON b.venue_id = v.venue_id
       JOIN users  u ON b.user_id  = u.user_id
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

export const updateBookingStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const owner_id = req.user?.user_id;

    const allowed = ['CONFIRMED', 'CANCELLED', 'COMPLETED'];
    if (!allowed.includes(status)) {
      res.status(400).json({ message: "Status noto'g'ri." });
      return;
    }

    const check = await pool.query(
      `SELECT b.booking_id FROM bookings b
       JOIN venues v ON b.venue_id = v.venue_id
       WHERE b.booking_id = $1 AND v.owner_id = $2`,
      [id, owner_id]
    );
    if (check.rows.length === 0) {
      res.status(403).json({ message: 'Bu bron sizga tegishli emas.' });
      return;
    }

    const result = await pool.query(
      `UPDATE bookings SET status = $1 WHERE booking_id = $2 RETURNING *`,
      [status, id]
    );
    res.status(200).json({ message: 'Holat yangilandi.', booking: result.rows[0] });
  } catch (error) {
    console.error('updateBookingStatus xatosi:', error);
    res.status(500).json({ message: 'Server xatosi.' });
  }
};


import { Request } from 'express';

// ─── OWNER YANGI TO'YXONA ARIZASI (PENDING) ───
export const createOwnerVenue = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const owner_id = req.user?.user_id;
    const { name, district_id, seats, price, description, address, phone } = req.body;

    if (!name || !district_id || !seats || !price) {
      res.status(400).json({ message: 'name, district_id, seats, price shart.' });
      return;
    }

    const result = await pool.query(
      `INSERT INTO venues
         (name, district_id, seats, price, description, address, phone, owner_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'PENDING')
       RETURNING *`,
      [name, district_id, seats, price, description || null, address || null, phone || null, owner_id]
    );

    res.status(201).json({
      message: "To'yxona arizasi yuborildi. Admin tasdiqlagach faollashadi.",
      venue: result.rows[0],
    });
  } catch (error) {
    console.error('createOwnerVenue xatosi:', error);
    res.status(500).json({ message: 'Server xatosi.' });
  }
};

// ─── OWNER O'Z TO'YXONALARINI KO'RISH ───
export const getOwnerVenues = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const owner_id = req.user?.user_id;
    const result = await pool.query(
      `SELECT v.*, d.district_name
       FROM venues v
       JOIN districts d ON v.district_id = d.district_id
       WHERE v.owner_id = $1
       ORDER BY v.created_at DESC`,
      [owner_id]
    );
    res.status(200).json({ venues: result.rows });
  } catch (error) {
    console.error('getOwnerVenues xatosi:', error);
    res.status(500).json({ message: 'Server xatosi.' });
  }
};

// ─── OWNER O'Z TO'YXONASINI TAHRIRLASH ───
export const updateOwnerVenue = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const owner_id = req.user?.user_id;
    const { id } = req.params;
    const { name, district_id, seats, price, description, address, phone } = req.body;

    // Faqat o'ziniki
    const own = await pool.query(
      `SELECT venue_id FROM venues WHERE venue_id = $1 AND owner_id = $2`,
      [id, owner_id]
    );
    if (own.rows.length === 0) {
      res.status(403).json({ message: "Bu to'yxona sizga tegishli emas." });
      return;
    }

    const result = await pool.query(
      `UPDATE venues SET
         name=COALESCE($1,name), district_id=COALESCE($2,district_id),
         seats=COALESCE($3,seats), price=COALESCE($4,price),
         description=COALESCE($5,description), address=COALESCE($6,address),
         phone=COALESCE($7,phone)
       WHERE venue_id=$8
       RETURNING *`,
      [name || null, district_id || null, seats || null, price || null,
       description || null, address || null, phone || null, id]
    );

    res.status(200).json({ message: 'Yangilandi.', venue: result.rows[0] });
  } catch (error) {
    console.error('updateOwnerVenue xatosi:', error);
    res.status(500).json({ message: 'Server xatosi.' });
  }
};

// owner.controller.ts ga qo'shing:
export const uploadVenueImages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { venue_id } = req.body;
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      res.status(400).json({ message: "Hech qanday fayl yuklanmadi." });
      return;
    }
    
    // Owner faqat o'z venuesiga rasm yuklay olishini tekshirish
    const check = await pool.query(
      `SELECT venue_id FROM venues WHERE venue_id = $1 AND owner_id = $2`,
      [venue_id, req.user?.user_id]
    );
    
    if (check.rows.length === 0) {
      res.status(403).json({ message: "Bu to'yxona sizga tegishli emas." });
      return;
    }
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const imageUrl = `/uploads/${file.filename}`;
      const isPrimary = i === 0; // birinchi rasm primary
      
      await pool.query(
        `INSERT INTO venue_images (venue_id, image_url, is_primary)
         VALUES ($1, $2, $3)`,
        [venue_id, imageUrl, isPrimary]
      );
    }
    
    res.status(200).json({ message: `${files.length} ta rasm yuklandi.` });
  } catch (error) {
    console.error('uploadVenueImages xatosi:', error);
    res.status(500).json({ message: 'Server xatosi.' });
  }
};