import { Router } from 'express';
import {
  createVenue,
  updateVenue,
  updateVenueStatus,
  deleteVenue,
  getAllBookings,
  getAllVenues,
  uploadVenueImages,
  deleteVenueImage,
} from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/role';
import { upload } from '../middleware/uploads';


const router = Router();

const adminOnly = [authenticate, authorize('admin')];

router.get('/venues',            ...adminOnly, getAllVenues);
router.post('/venues',           ...adminOnly, createVenue);
router.put('/venues/:id',        ...adminOnly, updateVenue);
router.patch('/venues/:id/status', ...adminOnly, updateVenueStatus);
router.delete('/venues/:id',     ...adminOnly, deleteVenue);
router.get('/bookings',          ...adminOnly, getAllBookings);

router.post('/venues/:id/images', ...adminOnly, upload.array('images', 10), uploadVenueImages);
router.delete('/venues/images/:imageId', ...adminOnly, deleteVenueImage);


export default router;
