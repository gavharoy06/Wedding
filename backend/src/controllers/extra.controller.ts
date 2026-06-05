import { Request, Response } from "express";
import pool from "../config/db";
import { AuthRequest } from "../types";

const TYPES = ["SINGER", "KARNAY", "MENU", "CAR", "OTHER"];

// Owner shu venue egasimi yoki admin'mi — tekshiruv
async function canManageVenue(
  venueId: string | string[] | number,
  user: any,
): Promise<boolean> {
  if (user?.role === "admin") return true;
  const id = Array.isArray(venueId) ? venueId[0] : venueId;
  const r = await pool.query(
    `SELECT 1 FROM venues WHERE venue_id = $1 AND owner_id = $2`,
    [id, user?.user_id],
  );
  return r.rows.length > 0;
}

// ─── XIZMAT QO'SHISH ───
export const createExtraService = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { venue_id } = req.params;
    const { service_type, service_name, service_price, service_desc } =
      req.body;
    const file = req.file as Express.Multer.File | undefined;

    if (!service_name || !service_type) {
      res.status(400).json({ message: "service_type va service_name shart." });
      return;
    }
    if (!TYPES.includes(service_type)) {
      res
        .status(400)
        .json({
          message: "service_type noto'g'ri (SINGER/KARNAY/MENU/CAR/OTHER).",
        });
      return;
    }

    if (!(await canManageVenue(venue_id, req.user))) {
      res.status(403).json({ message: "Bu to'yxona sizga tegishli emas." });
      return;
    }

    const image_url = file ? `/uploads/${file.filename}` : null;

    const result = await pool.query(
      `INSERT INTO extra_services
         (venue_id, service_type, service_name, service_price, service_desc, image_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        venue_id,
        service_type,
        service_name,
        service_price || 0,
        service_desc || null,
        image_url,
      ],
    );

    res
      .status(201)
      .json({ message: "Xizmat qo'shildi.", service: result.rows[0] });
  } catch (error) {
    console.error("createExtraService xatosi:", error);
    res.status(500).json({ message: "Server xatosi." });
  }
};

// ─── VENUE XIZMATLARINI OLISH ───
export const getVenueServices = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { venue_id } = req.params;
    const result = await pool.query(
      `SELECT * FROM extra_services WHERE venue_id = $1 ORDER BY service_type, extra_service_id`,
      [venue_id],
    );
    res.status(200).json({ services: result.rows });
  } catch (error) {
    console.error("getVenueServices xatosi:", error);
    res.status(500).json({ message: "Server xatosi." });
  }
};

// ─── XIZMAT TAHRIRLASH ───
export const updateExtraService = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      service_type,
      service_name,
      service_price,
      service_desc,
      is_available,
    } = req.body;
    const file = req.file as Express.Multer.File | undefined;

    // Xizmat va uning venue egasi
    const own = await pool.query(
      `SELECT es.extra_service_id, v.owner_id
       FROM extra_services es
       JOIN venues v ON es.venue_id = v.venue_id
       WHERE es.extra_service_id = $1`,
      [id],
    );
    if (own.rows.length === 0) {
      res.status(404).json({ message: "Xizmat topilmadi." });
      return;
    }
    if (
      req.user?.role !== "admin" &&
      own.rows[0].owner_id !== req.user?.user_id
    ) {
      res.status(403).json({ message: "Ruxsat yo'q." });
      return;
    }

    const image_url = file ? `/uploads/${file.filename}` : undefined;

    const result = await pool.query(
      `UPDATE extra_services SET
         service_type  = COALESCE($1, service_type),
         service_name  = COALESCE($2, service_name),
         service_price = COALESCE($3, service_price),
         service_desc  = COALESCE($4, service_desc),
         is_available  = COALESCE($5, is_available),
         image_url     = COALESCE($6, image_url)
       WHERE extra_service_id = $7
       RETURNING *`,
      [
        service_type || null,
        service_name || null,
        service_price ?? null,
        service_desc || null,
        typeof is_available === "boolean" ? is_available : null,
        image_url ?? null,
        id,
      ],
    );

    res.status(200).json({ message: "Yangilandi.", service: result.rows[0] });
  } catch (error) {
    console.error("updateExtraService xatosi:", error);
    res.status(500).json({ message: "Server xatosi." });
  }
};

// ─── XIZMAT O'CHIRISH ───
export const deleteExtraService = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const own = await pool.query(
      `SELECT v.owner_id FROM extra_services es
       JOIN venues v ON es.venue_id = v.venue_id
       WHERE es.extra_service_id = $1`,
      [id],
    );
    if (own.rows.length === 0) {
      res.status(404).json({ message: "Xizmat topilmadi." });
      return;
    }
    if (
      req.user?.role !== "admin" &&
      own.rows[0].owner_id !== req.user?.user_id
    ) {
      res.status(403).json({ message: "Ruxsat yo'q." });
      return;
    }
    await pool.query(`DELETE FROM extra_services WHERE extra_service_id = $1`, [
      id,
    ]);
    res.status(200).json({ message: "Xizmat o'chirildi." });
  } catch (error) {
    console.error("deleteExtraService xatosi:", error);
    res.status(500).json({ message: "Server xatosi." });
  }
};
