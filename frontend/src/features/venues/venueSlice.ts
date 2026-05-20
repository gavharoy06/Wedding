import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { venueService } from '../../services/venue.service';
import type { Venue } from '../../types';

interface VenueState {
  venues: Venue[];
  selectedVenue: Venue | null;
  bookedDates: string[];
  loading: boolean;
  error: string | null;
}

const initialState: VenueState = {
  venues: [],
  selectedVenue: null,
  bookedDates: [],
  loading: false,
  error: null,
};

export const fetchVenues = createAsyncThunk(
  'venues/fetchAll',
  async (filters: { search?: string; region?: string; sort?: 'asc' | 'desc' } = {}, thunkAPI) => {
    try {
      const res = await venueService.getAll(filters);
      return res.venues;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Xato');
    }
  }
);

export const fetchVenueById = createAsyncThunk(
  'venues/fetchById',
  async (id: number, thunkAPI) => {
    try {
      const res = await venueService.getById(id);
      return res;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Xato');
    }
  }
);

const venueSlice = createSlice({
  name: 'venues',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVenues.pending,   (state) => { state.loading = true; })
      .addCase(fetchVenues.fulfilled, (state, action) => { state.loading = false; state.venues = action.payload; })
      .addCase(fetchVenues.rejected,  (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(fetchVenueById.fulfilled, (state, action) => {
        state.selectedVenue = action.payload.venue;
        state.bookedDates   = action.payload.bookedDates;
      });
  },
});

export default venueSlice.reducer;