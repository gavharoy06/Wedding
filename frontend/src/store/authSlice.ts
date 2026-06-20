import {
  createSlice,
  createAsyncThunk,
  isPending,
  isRejected,
  isFulfilled,
} from "@reduxjs/toolkit";
import api from "../api/axios";
import type { AuthState, User } from "../types/auth";

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
  otpRequired: false,
  tempEmail: null,
};

// ─── REGISTER (Client) ───
export const registerUser = createAsyncThunk(
  "auth/register",
  async (
    data: { name: string; email: string; password: string },
    { rejectWithValue }
    // dispatch o'chirildi ↑
  ) => {
    try {
      const res = await api.post("/auth/register", data);
      return res.data.user as User;
      // fetchMe chaqirilmaydi — register cookie qo'yadi, user qaytaradi, shu yetarli
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Xatolik yuz berdi");
    }
  }
);

// ─── REGISTER OWNER ───
export const registerOwner = createAsyncThunk(
  "auth/registerOwner",
  async (
    data: { name: string; email: string; password: string; phone?: string },
    { rejectWithValue }
    // dispatch o'chirildi ↑
  ) => {
    try {
      const res = await api.post("/auth/register/owner", data);
      return res.data;
      // fetchMe chaqirilmaydi — owner cookie olmaydi, login kerak
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Xatolik yuz berdi");
    }
  }
);

// ─── LOGIN ───
export const loginUser = createAsyncThunk(
  "auth/login",
  async (data: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/login", data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Xatolik yuz berdi",
      );
    }
  },
);

// ─── VERIFY OTP ───
export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async (data: { email: string; code: string }, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/verify-otp", data);
      return res.data.user as User;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Kod noto'g'ri yoki muddati tugagan",
      );
    }
  },
);

// ─── FETCH ME ───
export const fetchMe = createAsyncThunk(
  "auth/fetchMe",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/auth/me");
      return res.data.user as User;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Login qilinmagan");
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.otpRequired = false;
      state.tempEmail = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetOtpState: (state) => {
      state.otpRequired = false;
      state.tempEmail = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ─── REGISTER CLIENT ───
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // ─── REGISTER OWNER ───
      .addCase(registerOwner.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerOwner.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(registerOwner.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // ─── LOGIN ───
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.otpRequired) {
          state.otpRequired = true;
          state.tempEmail = action.payload.email;
        } else {
          state.user = action.payload.user;
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // ─── VERIFY OTP ───
      .addCase(verifyOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.otpRequired = false;
        state.tempEmail = null;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // ─── FETCH ME ───
      .addCase(fetchMe.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(fetchMe.rejected, (state) => {
        // error ko'rsatmaymiz — shunchaki login qilinmagan
        state.isLoading = false;
        state.user = null;
        state.error = null;
      });
  },
});

export const { logout, clearError, resetOtpState } = authSlice.actions;
export default authSlice.reducer;
