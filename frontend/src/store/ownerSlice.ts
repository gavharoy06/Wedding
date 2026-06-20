import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

export interface OwnerVenue {
  venue_id: number;
  name: string;
  address?: string;
  seats: number;
  price: number;
  description?: string;
  status: string;
  district_name?: string;
  phone?: string;
}

export interface OwnerBooking {
  booking_id: number;
  venue_id: number;
  venue_name: string;
  booking_date: string;
  guest_count: number;
  total_price: number;
  prepayment: number;
  status: string;
  user_name?: string;
  user_phone?: string;
  user_email?: string;
  additional_info?: string;
}

interface OwnerState {
  venues: OwnerVenue[];
  bookings: OwnerBooking[];
  isLoading: boolean;
  error: string | null;
  success: string | null;
}

const initialState: OwnerState = {
  venues: [],
  bookings: [],
  isLoading: false,
  error: null,
  success: null,
};

// ─── Owner venues yuklash ───
export const fetchOwnerVenues = createAsyncThunk(
  "owner/fetchVenues",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/owner/venues");
      return res.data.venues;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Venuelarni yuklashda xatolik");
    }
  }
);

// ─── Yangi venue yaratish (rasmsiz) ───
export const createVenue = createAsyncThunk(
  "owner/createVenue",
  async (data: any, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.post("/owner/new-venue", data);
      await dispatch(fetchOwnerVenues());
      return res.data.venue;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Venue qo'shishda xatolik");
    }
  }
);

// ─── Rasm yuklash (alohida endpoint) ───
export const uploadVenueImages = createAsyncThunk(
  "owner/uploadImages",
  async ({ venueId, images }: { venueId: number; images: File[] }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      images.forEach((img) => {
        formData.append("images", img);
      });
      formData.append("venue_id", venueId.toString());
      
      const res = await api.post("/owner/upload-images", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Rasm yuklashda xatolik");
    }
  }
);

// ─── Owner bookings yuklash ───
export const fetchOwnerBookings = createAsyncThunk(
  "owner/fetchBookings",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/owner/bookings");
      return res.data.bookings;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Bronlarni yuklashda xatolik");
    }
  }
);

// ─── Bron holatini o'zgartirish ───
export const updateBookingStatus = createAsyncThunk(
  "owner/updateBookingStatus",
  async ({ bookingId, status }: { bookingId: number; status: string }, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.put(`/owner/bookings/${bookingId}`, { status });
      await dispatch(fetchOwnerBookings());
      return res.data.booking;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Holat o'zgartirishda xatolik");
    }
  }
);

// ─── Venue tahrirlash ───
export const updateOwnerVenue = createAsyncThunk(
  "owner/updateVenue",
  async ({ venueId, data }: { venueId: number; data: any }, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.put(`/owner/venues/${venueId}`, data);
      await dispatch(fetchOwnerVenues());
      return res.data.venue;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Yangilashda xatolik");
    }
  }
);

const ownerSlice = createSlice({
  name: "owner",
  initialState,
  reducers: {
    clearOwnerError: (state) => {
      state.error = null;
    },
    clearOwnerSuccess: (state) => {
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch venues
      .addCase(fetchOwnerVenues.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOwnerVenues.fulfilled, (state, action) => {
        state.isLoading = false;
        state.venues = action.payload;
      })
      .addCase(fetchOwnerVenues.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create venue
      .addCase(createVenue.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createVenue.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = "To'yxona muvaffaqiyatli qo'shildi!";
      })
      .addCase(createVenue.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Upload images
      .addCase(uploadVenueImages.fulfilled, (state) => {
        state.success = "Rasmlar muvaffaqiyatli yuklandi!";
      })
      .addCase(uploadVenueImages.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Fetch bookings
      .addCase(fetchOwnerBookings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOwnerBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bookings = action.payload;
      })
      .addCase(fetchOwnerBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update booking status
      .addCase(updateBookingStatus.fulfilled, (state) => {
        state.success = "Bron holati yangilandi!";
      })
      .addCase(updateBookingStatus.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Update venue
      .addCase(updateOwnerVenue.fulfilled, (state) => {
        state.success = "To'yxona ma'lumotlari yangilandi!";
      })
      .addCase(updateOwnerVenue.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearOwnerError, clearOwnerSuccess } = ownerSlice.actions;
export default ownerSlice.reducer;