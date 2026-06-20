import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

export interface District {
  district_id: number;
  district_name: string;
}

interface DistrictState {
  districts: District[];
  isLoading: boolean;
  error: string | null;
}

const initialState: DistrictState = {
  districts: [],
  isLoading: false,
  error: null,
};

export const fetchDistricts = createAsyncThunk(
  "districts/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/venues/districts");
      return res.data.districts as District[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Xatolik yuz berdi");
    }
  }
);

const districtSlice = createSlice({
  name: "districts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDistricts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDistricts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.districts = action.payload;
      })
      .addCase(fetchDistricts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default districtSlice.reducer;