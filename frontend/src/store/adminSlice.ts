import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

export type AdminVenue = {
  venue_id: number;
  name: string;
  status: string;
  owner_name?: string;
  owner_email?: string;
  district_name?: string;
  seats: number;
  price: number;
  address?: string;
  phone?: string;
  images?:{image_id:number;image_url:string;is_primary:boolean}[]
  description?: string;
}

export type AdminBooking = {
  booking_id: number;
  venue_name: string;
  venue_district: string;
  booking_date: string;
  guest_count: number;
  total_price: number;
  prepayment: number;
  status: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  additional_info?: string;
}

type AdminState = {
  venues: AdminVenue[];
  bookings: AdminBooking[];
  isLoading: boolean;
  error: string | null;
  success: string | null;
}

const initialState: AdminState = {
  venues: [],
  bookings: [],
  isLoading: false,
  error: null,
  success: null,
};

// ─── VENUE FUNKSIYALARI ───

// Barcha venuelarni olish
export const fetchAllVenues = createAsyncThunk(
  "admin/fetchVenues",
  async (status: string | undefined = undefined, { rejectWithValue }) => {
    try {
      const url = status ? `/admin/venues?status=${status}` : "/admin/venues";
      const res = await api.get(url);
      return res.data.venues || res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Xatolik yuz berdi");
    }
  }
);

// Yangi venue qo'shish (owner bilan birga)

export const createVenue = createAsyncThunk(
  "admin/createVenue",
  async (data: {
    name: string;
    district_id: number;
    seats: number;
    price: number;
    description?: string;      // undefined bo'lishi mumkin
    address?: string;          // undefined bo'lishi mumkin
    phone?: string;            // undefined bo'lishi mumkin
    owner_name: string;
    owner_email: string;
    owner_password: string;
  }, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.post("/admin/venues", data);
      await dispatch(fetchAllVenues());
      return res.data.venue;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Venue qo'shishda xatolik");
    }
  }
);

// Venue status o'zgartirish
export const updateVenueStatus = createAsyncThunk(
  "admin/updateVenueStatus",
  async ({ id, status }: { id: number; status: string }, { dispatch, rejectWithValue }) => {
    try {
      await api.patch(`/admin/venues/${id}/status`, { status });
      await dispatch(fetchAllVenues());
      return { id, status };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Status o'zgartirishda xatolik");
    }
  }
);

// Venue tahrirlash
export const updateVenue = createAsyncThunk(
  "admin/updateVenue",
  async ({ id, data }: { id: number; data: any }, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.put(`/admin/venues/${id}`, data);
      await dispatch(fetchAllVenues());
      return res.data.venue;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Yangilashda xatolik");
    }
  }
);


// Venue o'chirish
export const deleteVenue = createAsyncThunk(
  "admin/deleteVenue",
  async (id:number,{rejectWithValue,dispatch}) =>{
    try{
      await api.delete(`/admin/venues/${id}`);
      return id;
    }catch(err:any){
      return rejectWithValue(err.response?.data?.message || "To'yxonani o'chirishda xatolik");
    }
  }
);

// Rasm yuklash
export const uploadVenueImages = createAsyncThunk(
  "admin/uploadVenueImages",
  async ({ venueId, files }: { venueId: number; files: File[] }, { rejectWithValue, dispatch }) => {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("images", file);
      });

      const res = await api.post(`/admin/venues/${venueId}/images`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await dispatch(fetchAllVenues());
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Rasm yuklashda xatolik");
    }
  }
);

// Rasm o'chirish
export const deleteVenueImage = createAsyncThunk(
  "admin/deleteVenueImage",
  async (imageId: number, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/admin/venues/images/${imageId}`);
      await dispatch(fetchAllVenues());
      return imageId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Rasm o'chirishda xatolik");
    }
  }
);


// ─── BOOKING FUNKSIYALARI ───

// Barcha bronlarni olish
export const fetchAllBookings = createAsyncThunk(
  "admin/fetchBookings",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/admin/bookings");
      return res.data.bookings;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Bronlarni yuklashda xatolik");
    }
  }
);

// YOKI dispatch ishlatilsa, uni saqlang va quyidagicha yozing:
export const cancelBooking = createAsyncThunk(
  "admin/cancelBooking",
  async (bookingId: number, { rejectWithValue, dispatch }) => {
    try {
      await api.put(`/owner/bookings/${bookingId}`, { status: "CANCELLED" });
      await dispatch(fetchAllBookings()); // fetchingni yangilash
      return bookingId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Bekor qilishda xatolik");
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
    clearAdminSuccess: (state) => {
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch venues
      .addCase(fetchAllVenues.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllVenues.fulfilled, (state, action) => {
        state.isLoading = false;
        state.venues = action.payload;
      })
      .addCase(fetchAllVenues.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create venue
      .addCase(createVenue.fulfilled, (state) => {
        state.success = "To'yxona muvaffaqiyatli qo'shildi!";
      })
      .addCase(createVenue.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Update venue status
      .addCase(updateVenueStatus.fulfilled, (state) => {
        state.success = "Holat yangilandi!";
      })
      // Delete venue
      // Delete venue logic
      .addCase(deleteVenue.pending, (state) => {
        state.isLoading = true; // Yuklanish indikatorini yoqish mumkin
      })
      .addCase(deleteVenue.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = "To'yxona muvaffaqiyatli o'chirildi!";
        // Ro'yxatdan darhol o'chirib tashlaymiz (UI tez ishlashi uchun)
        state.venues = state.venues.filter(v => v.venue_id !== action.payload);
      })
      .addCase(deleteVenue.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch bookings
      .addCase(fetchAllBookings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bookings = action.payload;
      })
      .addCase(fetchAllBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Cancel booking
      .addCase(cancelBooking.fulfilled, (state) => {
        state.success = "Bron bekor qilindi!";
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearAdminError, clearAdminSuccess } = adminSlice.actions;
export default adminSlice.reducer;