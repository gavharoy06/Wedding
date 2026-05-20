import { Router } from 'express';
import {
  createVenue,
  updateVenue,
  deleteVenue,
  getAllBookings,
  getAllVenues,
} from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/role';

const router = Router();

const adminOnly = [authenticate, authorize('admin')];

router.get('/venues',        ...adminOnly, getAllVenues);
router.post('/venues',       ...adminOnly, createVenue);
router.put('/venues/:id',    ...adminOnly, updateVenue);
router.delete('/venues/:id', ...adminOnly, deleteVenue);
router.get('/bookings',      ...adminOnly, getAllBookings);

export default router;