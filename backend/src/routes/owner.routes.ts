import { Router } from 'express';
import { getOwnerBookings, updateBookingStatus } from '../controllers/owner.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/role';

const router = Router();

router.get('/',       authenticate, authorize('owner'), getOwnerBookings);
router.put('/:id',    authenticate, authorize('owner'), updateBookingStatus);

export default router;