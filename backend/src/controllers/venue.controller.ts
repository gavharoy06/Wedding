import { Request, Response } from 'express';
import pool from '../config/db';

// ─── BARCHA TO'YXONALAR (qidiruv + filter + saralash) ───
// Public: faqat APPROVED. Admin/owner uchun alohida endpoint ishlatamiz.
export const getVenues = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, district_id, sort } = req.query;

    let query = `
      SELECT v.*, d.district_name,
             (SELECT image_url FROM venue_images vi
                WHERE vi.venue_id = v.venue_id AND vi.is_primary = TRUE
                LIMIT 1) AS primary_image
      FROM venues v
      JOIN districts d ON v.district_id = d.district_id
      WHERE v.status = 'APPROVED'`;
    const params: any[] = [];
    let i = 1;

    // Case-insensitive, qisman moslik qidiruv (nom bo'yicha)
    if (search) {
      query += ` AND v.name ILIKE $${i}`;
      params.push(`%${search}%`);
      i++;
    }

    // Filter — rayon bo'yicha
    if (district_id) {
      query += ` AND v.district_id = $${i}`;
      params.push(district_id);
      i++;
    }

    // Saralash — narx yoki sig'im
    switch (sort) {
      case 'price_asc':  query += ` ORDER BY v.price ASC`;  break;
      case 'price_desc': query += ` ORDER BY v.price DESC`; break;
      case 'seats_asc':  query += ` ORDER BY v.seats ASC`;  break;
      case 'seats_desc': query += ` ORDER BY v.seats DESC`; break;
      default:           query += ` ORDER BY v.created_at DESC`;
    }

    const result = await pool.query(query, params);
    res.status(200).json({ venues: result.rows });
  } catch (error) {
    console.error('getVenues xatosi:', error);
    res.status(500).json({ message: 'Server xatosi.' });
  }
};

// ─── BITTA TO'YXONA (suratlar + xizmatlar + band sanalar) ───
export const getVenueById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT v.*, d.district_name
       FROM venues v
       JOIN districts d ON v.district_id = d.district_id
       WHERE v.venue_id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ message: "To'yxona topilmadi." });
      return;
    }

    const images = await pool.query(
      `SELECT image_id, image_url, is_primary FROM venue_images
       WHERE venue_id = $1 ORDER BY is_primary DESC, image_id ASC`,
      [id]
    );

    const services = await pool.query(
      `SELECT extra_service_id, service_type, service_name, service_price,
              service_desc, image_url, is_available
       FROM extra_services WHERE venue_id = $1 ORDER BY service_type`,
      [id]
    );

    const bookings = await pool.query(
      `SELECT booking_date FROM bookings
       WHERE venue_id = $1 AND status <> 'CANCELLED'`,
      [id]
    );

    res.status(200).json({
      venue: result.rows[0],
      images: images.rows,
      services: services.rows,
      bookedDates: bookings.rows.map(b => b.booking_date),
    });
  } catch (error) {
    console.error('getVenueById xatosi:', error);
    res.status(500).json({ message: 'Server xatosi.' });
  }
};
