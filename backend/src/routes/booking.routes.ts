import { Router } from 'express';
import {
  createBooking,
  getMyBookings,
  cancelMyBooking,
} from '../controllers/booking.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/role';

const router = Router();

// Faqat login qilgan user bron qila oladi
router.post('/',           authenticate, authorize('user'), createBooking);
router.get('/my',          authenticate, getMyBookings);
router.patch('/:id/cancel', authenticate, cancelMyBooking);

export default router;
