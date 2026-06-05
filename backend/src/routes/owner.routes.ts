import { Router } from 'express';
import { createOwnerVenue, getOwnerBookings, getOwnerVenues, updateBookingStatus, updateOwnerVenue } from '../controllers/owner.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/role';

const router = Router();


const ownerOnly = [authenticate, authorize('owner')];

router.get('/',       authenticate, authorize('owner'), getOwnerBookings);
router.put('/:id',    authenticate, authorize('owner'), updateBookingStatus);

// Bronlar
router.get('/bookings',        ...ownerOnly, getOwnerBookings);
router.put('/bookings/:id',    ...ownerOnly, updateBookingStatus);

// To'yxonalar
router.get('/venues',          ...ownerOnly, getOwnerVenues);
router.post('/venues',         ...ownerOnly, createOwnerVenue);
router.put('/venues/:id',      ...ownerOnly, updateOwnerVenue);

export default router;