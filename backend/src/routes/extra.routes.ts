import { Router } from 'express';
import {
  createExtraService,
  getVenueServices,
  updateExtraService,
  deleteExtraService,
} from '../controllers/extra.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/role';
import { upload } from '../middleware/uploads';

const router = Router();

// Public: venue xizmatlarini ko'rish
router.get('/venue/:venue_id', getVenueServices);

// Admin yoki owner: qo'shish/tahrirlash/o'chirish (1 ta rasm: 'image')
router.post(
  '/venue/:venue_id',
  authenticate, authorize('admin', 'owner'),
  upload.single('image'),
  createExtraService
);
router.put(
  '/:id',
  authenticate, authorize('admin', 'owner'),
  upload.single('image'),
  updateExtraService
);
router.delete(
  '/:id',
  authenticate, authorize('admin', 'owner'),
  deleteExtraService
);

export default router;
