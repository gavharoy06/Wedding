import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";
import type { Booking, CreateBookingPayload } from "../types/booking";

interface BookingState {
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: BookingState = {
  bookings: [],
  isLoading: false,
  error: null,
  success: false,
};

export const createBooking = createAsyncThunk(
  "bookings/create",
  async (data: CreateBookingPayload, { rejectWithValue }) => {
    try {
      const res = await api.post("/bookings", data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Xatolik yuz berdi");
    }
  }
);

export const fetchMyBookings = createAsyncThunk(
  "bookings/fetchMy",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/bookings/my");
      return res.data.bookings as Booking[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Xatolik yuz berdi");
    }
  }
);

export const cancelBooking = createAsyncThunk(
  "bookings/cancel",
  async (id: number, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/bookings/${id}/cancel`);
      return res.data.booking as Booking;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Xatolik yuz berdi");
    }
  }
);

const bookingSlice = createSlice({
  name: "bookings",
  initialState,
  reducers: {
    resetBookingSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createBooking.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createBooking.fulfilled, (state) => {
        state.isLoading = false;
        state.success = true;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchMyBookings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bookings = action.payload;
      })
      .addCase(fetchMyBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        const idx = state.bookings.findIndex(
          (b) => b.booking_id === action.payload.booking_id
        );
        if (idx !== -1) state.bookings[idx] = action.payload;
      });
  },
});

export const { resetBookingSuccess } = bookingSlice.actions;
export default bookingSlice.reducer;