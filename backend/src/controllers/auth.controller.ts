import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db";
import { AuthRequest, JwtPayload } from "../types";
import { sendOtpEmail } from "../utils/mailer";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// ─── REGISTER (Client) ───
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: "Barcha maydonlarni to'ldiring." });
      return;
    }

    const existing = await pool.query("SELECT user_id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      res.status(409).json({ message: "Bu email allaqachon ro'yxatdan o'tgan." });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, 'client') RETURNING user_id, name, email, role`,
      [name, email, hashedPassword]
    );

    const user = result.rows[0];

    const payload: JwtPayload = { user_id: user.user_id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: "7d" });

    res.cookie("token", token, COOKIE_OPTIONS);

    res.status(201).json({
      message: "Muvaffaqiyatli ro'yxatdan o'tdingiz!",
      user: { user_id: user.user_id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error("Register xatosi:", error);
    res.status(500).json({ message: "Server xatosi." });
  }
};

// ─── LOGIN (Asosiy) ───
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: "Email va parol kiritilishi shart." });
      return;
    }

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user) {
      res.status(401).json({ message: "Email yoki parol xato." });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: "Email yoki parol xato." });
      return;
    }

    // Owner va hali verified bo'lmagan bo'lsa → OTP
    if (user.role === "owner" && !user.is_verified) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date(Date.now() + 10 * 60 * 1000);

      await pool.query(
        `UPDATE users SET otp_code = $1, otp_expires_at = $2 WHERE user_id = $3`,
        [code, expires, user.user_id]
      );

      await sendOtpEmail(user.email, code);

      res.status(200).json({
        message: "Emailingizga tasdiqlash kodi yuborildi.",
        otpRequired: true,
        email: user.email,
      });
      return;
    }

    // Boshqa hollarda (client, admin, verified owner) → to'g'ridan token
    const payload: JwtPayload = { user_id: user.user_id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: "7d" });

    res.cookie("token", token, COOKIE_OPTIONS);

    res.status(200).json({
      message: "Tizimga muvaffaqiyatli kirdingiz!",
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login xatosi:", error);
    res.status(500).json({ message: "Server xatosi." });
  }
};

// Qolgan funksiyalar (verifyOtp, getMe, logout, registerOwner) o'zgarmaydi...
export const logout = (_req: Request, res: Response): void => {
  res.clearCookie("token", COOKIE_OPTIONS);
  res.status(200).json({ message: "Tizimdan chiqdingiz." });
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      "SELECT user_id, name, email, role FROM users WHERE user_id = $1",
      [req.user?.user_id]
    );
    res.status(200).json({ user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Server xatosi." });
  }
};

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      res.status(400).json({ message: "Email va kod kiritilishi shart." });
      return;
    }

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user || user.otp_code !== code || new Date(user.otp_expires_at) < new Date()) {
      res.status(400).json({ message: "Kod noto'g'ri yoki muddati tugagan." });
      return;
    }

    await pool.query(
      `UPDATE users SET is_verified = TRUE, otp_code = NULL, otp_expires_at = NULL WHERE user_id = $1`,
      [user.user_id]
    );

    const payload: JwtPayload = { user_id: user.user_id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: "7d" });

    res.cookie("token", token, COOKIE_OPTIONS);

    res.status(200).json({
      message: "Tasdiqlandi! Tizimga kirdingiz.",
      user: { user_id: user.user_id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error("verifyOtp xatosi:", error);
    res.status(500).json({ message: "Server xatosi." });
  }
};

export const registerOwner = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: "Ism, email va parol shart." });
      return;
    }

    const existing = await pool.query(
      "SELECT user_id FROM users WHERE email = $1",
      [email]
    );

    if (existing.rows.length > 0) {
      res.status(409).json({ message: "Bu email allaqachon ro'yxatdan o'tgan." });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, phone, is_verified)
       VALUES ($1, $2, $3, 'owner', $4, FALSE)
       RETURNING user_id, name, email, role`,
      [name, email, hashedPassword, phone || null]
    );

    res.status(201).json({
      message: "Owner ro'yxatdan o'tdi. Endi login qiling (OTP yuboriladi).",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("registerOwner xatosi:", error);
    res.status(500).json({ message: "Server xatosi." });
  }
};