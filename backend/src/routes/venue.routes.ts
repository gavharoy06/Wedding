import { Router } from 'express';
import { getVenues, getVenueById, getDistricts } from '../controllers/venue.controller';

const router = Router();

router.get('/',    getVenues);
router.get('/districts', getDistricts);
router.get('/:id', getVenueById);




export default router;