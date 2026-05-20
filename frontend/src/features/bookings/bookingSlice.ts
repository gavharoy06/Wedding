import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { bookingService } from '../../services/booking.service';
import type { Booking } from '../../types';

interface BookingState {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
}

const initialState: BookingState = {
  bookings: [],
  loading: false,
  error: null,
};

export const fetchMyBookings = createAsyncThunk(
  'bookings/fetchMy',
  async (_, thunkAPI) => {
    try {
      const res = await bookingService.getMyBookings();
      return res.bookings;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Xato');
    }
  }
);

export const createBooking = createAsyncThunk(
  'bookings/create',
  async (data: { venue_id: number; booking_date: string; additional_info?: string }, thunkAPI) => {
    try {
      const res = await bookingService.create(data);
      return res.booking;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Xato');
    }
  }
);

const bookingSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyBookings.pending,   (state) => { state.loading = true; })
      .addCase(fetchMyBookings.fulfilled, (state, action) => { state.loading = false; state.bookings = action.payload; })
      .addCase(fetchMyBookings.rejected,  (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(createBooking.fulfilled,   (state, action) => { state.bookings.unshift(action.payload); });
  },
});

export default bookingSlice.reducer;