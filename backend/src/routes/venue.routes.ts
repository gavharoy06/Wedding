import { Router } from 'express';
import { getVenues, getVenueById } from '../controllers/venue.controller';

const router = Router();

router.get('/',    getVenues);
router.get('/:id', getVenueById);

export default router;