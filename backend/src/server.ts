import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';

import authRoutes    from './routes/auth.routes';
import venueRoutes   from './routes/venue.routes';
import bookingRoutes from './routes/booking.routes';
import ownerRoutes   from './routes/owner.routes';
import adminRoutes   from './routes/admin.routes';
import extraRoutes from './routes/extra.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// ─── Statik fayllar (yuklangan rasmlar) ──────────────────
// uploads papkasi backend ildizida (src dan tashqarida) turadi
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ─── Routes ──────────────────────────────────────────────
app.use('/api/auth',           authRoutes);
app.use('/api/venues',         venueRoutes);
app.use('/api/bookings',       bookingRoutes);
app.use('/api/admin',          adminRoutes);
app.use('/api/owner',          ownerRoutes);
app.use('/api/extra-services', extraRoutes);


app.get('/', (_req, res) => {
  res.json({ message: 'Toyxona API ishlayapti ' });
});

app.listen(PORT, () => {
  console.log(`Server ${PORT}-portda ishlamoqda `);
});
