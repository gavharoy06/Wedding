import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import authRoutes    from './routes/auth.routes';
import venueRoutes   from './routes/venue.routes';
import bookingRoutes from './routes/booking.routes';
import ownerRoutes   from './routes/owner.routes';
import adminRoutes   from './routes/admin.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// ─── Routes ──────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/venues',        venueRoutes);
app.use('/api/bookings',      bookingRoutes);
app.use('/api/owner/bookings', ownerRoutes);
app.use('/api/admin',         adminRoutes);

app.get('/', (_req, res) => {
  res.json({ message: 'Toyxona API ishlayapti ✅' });
});

app.listen(PORT, () => {
  console.log(`Server ${PORT}-portda ishlamoqda 🚀`);
});