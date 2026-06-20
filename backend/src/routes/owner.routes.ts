import { Router } from "express";
import {
  createOwnerVenue,
  getOwnerBookings,
  getOwnerVenues,
  updateBookingStatus,
  updateOwnerVenue,
  uploadVenueImages,  // YANGI
} from "../controllers/owner.controller";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/role";
import { upload } from "../middleware/uploads"; // Multer konfiguratsiyasi

const router = Router();

const ownerOnly = [authenticate, authorize("owner")];

// Bronlar
router.get("/bookings", ...ownerOnly, getOwnerBookings);
router.put("/bookings/:id", ...ownerOnly, updateBookingStatus);

// To'yxonalar
router.get("/venues", ...ownerOnly, getOwnerVenues);
router.post("/new-venue", ...ownerOnly, createOwnerVenue);
router.put("/venues/:id", ...ownerOnly, updateOwnerVenue);
router.post("/upload-images", ...ownerOnly, upload.array("images", 10), uploadVenueImages); // YANGI

export default router;