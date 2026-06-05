import { Request, Response } from "express";
import pool from "../config/db";
import bcrypt from "bcryptjs";

// ─── YANGI TO'YXONA QO'SHISH (admin) ───
export const createVenue = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const client = await pool.connect();
  try {
    const {
      name,
      district_id,
      seats,
      price,
      description,
      address,
      phone,
      owner_email,
      owner_name,
      owner_password,
    } = req.body;

    if (
      !name ||
      !district_id ||
      !seats ||
      !price ||
      !owner_email ||
      !owner_name ||
      !owner_password
    ) {
      res.status(400).json({ message: "Barcha maydonlarni to'ldiring." });
      return;
    }

    await client.query("BEGIN");

    const hashedPassword = await bcrypt.hash(owner_password, 12);
    const ownerResult = await client.query(
      `INSERT INTO users (name, email, password, role, is_verified)
       VALUES ($1, $2, $3, 'owner', TRUE)
       RETURNING user_id`,
      [owner_name, owner_email, hashedPassword],
    );
    const owner_id = ownerResult.rows[0].user_id;

    await client.query(
      `INSERT INTO users (name, email, password, role, is_verified)
   VALUES ($1, $2, $3, 'owner', FALSE)   -- FALSE: birinchi login'da OTP
   RETURNING user_id`,
      [owner_name, owner_email, hashedPassword],
    );

    // Admin qo'shsa to'g'ridan-to'g'ri APPROVED
    const venueResult = await client.query(
      `INSERT INTO venues (name, district_id, seats, price, description, address, phone, owner_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'APPROVED')
       RETURNING *`,
      [
        name,
        district_id,
        seats,
        price,
        description || null,
        address || null,
        phone || null,
        owner_id,
      ],
    );

    await client.query("COMMIT");
    res.status(201).json({
      message: "To'yxona va egasi muvaffaqiyatli yaratildi!",
      venue: venueResult.rows[0],
    });
  } catch (error: any) {
    await client.query("ROLLBACK");
    if (error.code === "23505") {
      res
        .status(409)
        .json({ message: "Bu email allaqachon ro'yxatdan o'tgan." });
      return;
    }
    console.error("createVenue xatosi:", error);
    res.status(500).json({ message: "Server xatosi." });
  } finally {
    client.release();
  }
};

// ─── TO'YXONA TAHRIRLASH ───
export const updateVenue = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, district_id, seats, price, description, address, phone } =
      req.body;
    const result = await pool.query(
      `UPDATE venues
       SET name=$1, district_id=$2, seats=$3, price=$4, description=$5, address=$6, phone=$7
       WHERE venue_id=$8
       RETURNING *`,
      [name, district_id, seats, price, description, address, phone, id],
    );
    if (result.rows.length === 0) {
      res.status(404).json({ message: "To'yxona topilmadi." });
      return;
    }
    res.status(200).json({ message: "Yangilandi.", venue: result.rows[0] });
  } catch (error) {
    console.error("updateVenue xatosi:", error);
    res.status(500).json({ message: "Server xatosi." });
  }
};

// ─── TO'YXONANI TASDIQLASH / RAD ETISH ───
export const updateVenueStatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'APPROVED' | 'REJECTED'
    if (!["APPROVED", "REJECTED", "PENDING"].includes(status)) {
      res.status(400).json({ message: "Status noto'g'ri." });
      return;
    }
    const result = await pool.query(
      `UPDATE venues SET status = $1 WHERE venue_id = $2 RETURNING *`,
      [status, id],
    );
    if (result.rows.length === 0) {
      res.status(404).json({ message: "To'yxona topilmadi." });
      return;
    }
    res
      .status(200)
      .json({ message: "Status yangilandi.", venue: result.rows[0] });
  } catch (error) {
    console.error("updateVenueStatus xatosi:", error);
    res.status(500).json({ message: "Server xatosi." });
  }
};

// ─── TO'YXONA O'CHIRISH (CASCADE FK borligi uchun sodda) ───
export const deleteVenue = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `DELETE FROM venues WHERE venue_id = $1 RETURNING venue_id`,
      [id],
    );
    if (result.rows.length === 0) {
      res.status(404).json({ message: "To'yxona topilmadi." });
      return;
    }
    res.status(200).json({ message: "To'yxona o'chirildi." });
  } catch (error) {
    console.error("deleteVenue xatosi:", error);
    res.status(500).json({ message: "Server xatosi." });
  }
};

// ─── BARCHA BRONLAR (admin) ───
export const getAllBookings = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT b.booking_id, b.booking_date, b.additional_info, b.guest_count,
              b.total_price, b.status, b.created_at,
              u.name AS user_name, u.email AS user_email, u.phone AS user_phone,
              v.name AS venue_name, d.district_name AS venue_district
       FROM bookings b
       JOIN users  u ON b.user_id  = u.user_id
       JOIN venues v ON b.venue_id = v.venue_id
       JOIN districts d ON v.district_id = d.district_id
       ORDER BY b.created_at DESC`,
    );
    res.status(200).json({ bookings: result.rows });
  } catch (error) {
    console.error("getAllBookings xatosi:", error);
    res.status(500).json({ message: "Server xatosi." });
  }
};

// ─── BARCHA TO'YXONALAR (admin — hamma status) ───
export const getAllVenues = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { status } = req.query;
    let query = `
      SELECT v.*, d.district_name, u.name AS owner_name, u.email AS owner_email
      FROM venues v
      JOIN users u ON v.owner_id = u.user_id
      JOIN districts d ON v.district_id = d.district_id`;
    const params: any[] = [];
    if (status) {
      query += ` WHERE v.status = $1`;
      params.push(status);
    }
    query += ` ORDER BY v.created_at DESC`;
    const result = await pool.query(query, params);
    res.status(200).json({ venues: result.rows });
  } catch (error) {
    console.error("getAllVenues xatosi:", error);
    res.status(500).json({ message: "Server xatosi." });
  }
};

// ─── TO'YXONAGA RASM(LAR) YUKLASH ───
export const uploadVenueImages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const files = req.files as Express.Multer.File[] | undefined;

    if (!files || files.length === 0) {
      res.status(400).json({ message: 'Hech qanday rasm yuklanmadi.' });
      return;
    }

    // To'yxona bormi?
    const venue = await pool.query(`SELECT venue_id FROM venues WHERE venue_id = $1`, [id]);
    if (venue.rows.length === 0) {
      res.status(404).json({ message: "To'yxona topilmadi." });
      return;
    }

    // Birinchi rasm bormi (primary ni belgilash uchun)
    const existing = await pool.query(
      `SELECT COUNT(*)::int AS c FROM venue_images WHERE venue_id = $1`,
      [id]
    );
    let hasPrimary = existing.rows[0].c > 0;

    const saved = [];
    for (const file of files) {
      const url = `/uploads/${file.filename}`;
      const isPrimary = !hasPrimary;
      hasPrimary = true;
      const r = await pool.query(
        `INSERT INTO venue_images (venue_id, image_url, is_primary)
         VALUES ($1, $2, $3) RETURNING *`,
        [id, url, isPrimary]
      );
      saved.push(r.rows[0]);
    }

    res.status(201).json({ message: 'Rasmlar yuklandi.', images: saved });
  } catch (error) {
    console.error('uploadVenueImages xatosi:', error);
    res.status(500).json({ message: 'Server xatosi.' });
  }
};

// ─── RASMNI O'CHIRISH ───
export const deleteVenueImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { imageId } = req.params;
    const result = await pool.query(
      `DELETE FROM venue_images WHERE image_id = $1 RETURNING image_url`,
      [imageId]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Rasm topilmadi.' });
      return;
    }
    // Diskdagi faylni ham o'chirish
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '..', '..', result.rows[0].image_url.replace('/uploads', 'uploads'));
    fs.existsSync(filePath) && fs.unlinkSync(filePath);

    res.status(200).json({ message: "Rasm o'chirildi." });
  } catch (error) {
    console.error('deleteVenueImage xatosi:', error);
    res.status(500).json({ message: 'Server xatosi.' });
  }
};
