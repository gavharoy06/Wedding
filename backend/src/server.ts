import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL,   // Frontend manzili
  credentials: true,                // Cookie yuborish uchun
}));
app.use(express.json());
app.use(cookieParser());            // Cookie o'qish uchun

// ─── Routes ──────────────────────────────────────────────
app.use('/api/auth', authRoutes);

// ─── Health check ─────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({ message: 'Toyxona API ishlayapti ✅' });
});

// ─── Server ───────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server ${PORT}-portda ishlamoqda 🚀`);
});