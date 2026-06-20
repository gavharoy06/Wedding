import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";
import type { Venue, VenueDetail } from "../types/venue";

type VenueState ={
  venues: Venue[];
  venueDetail: VenueDetail | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: VenueState = {
  venues: [],
  venueDetail: null,
  isLoading: false,
  error: null,
};

// ─── Filter parametrlari uchun tip ───
type VenueFilters = {
  search?: string;
  district_id?: number;
  sort?: string;
}

// ─── Barcha venues (filter bilan) ───
export const fetchVenues = createAsyncThunk(
  "venues/fetchAll",
  async (filters: VenueFilters, { rejectWithValue }) => {
    try {
      const res = await api.get("/venues", { params: filters });
      return res.data.venues as Venue[];
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Xatolik yuz berdi",
      );
    }
  },
);

// ─── Bitta venue (id bo'yicha) ───
export const fetchVenueById = createAsyncThunk(
  "venues/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(`/venues/${id}`);
      return res.data as VenueDetail;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Xatolik yuz berdi",
      );
    }
  },
);

const venueSlice = createSlice({
  name: "venues",
  initialState,
  reducers: {
    clearVenueDetail: (state) => {
      state.venueDetail = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVenues.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchVenues.fulfilled, (state, action) => {
        state.isLoading = false;
        state.venues = action.payload;
      })
      .addCase(fetchVenues.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchVenueById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchVenueById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.venueDetail = action.payload;
      })
      .addCase(fetchVenueById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearVenueDetail } = venueSlice.actions;
export default venueSlice.reducer;
