import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/auth.service';
import type { User } from '../../types';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

// Async thunklar
export const registerUser = createAsyncThunk(
  'auth/register',
  async (data: { name: string; email: string; password: string }, thunkAPI) => {
    try {
      const res = await authService.register(data);
      return res.user;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Xato');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (data: { email: string; password: string }, thunkAPI) => {
    try {
      const res = await authService.login(data);
      return res.user;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Xato');
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await authService.logout();
});

export const fetchMe = createAsyncThunk('auth/me', async (_, thunkAPI) => {
  try {
    const res = await authService.getMe();
    return res.user;
  } catch {
    return thunkAPI.rejectWithValue(null);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending,  (state) => { state.loading = true; state.error = null; })
      .addCase(registerUser.fulfilled,(state, action) => { state.loading = false; state.user = action.payload; })
      .addCase(registerUser.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      // Login
      .addCase(loginUser.pending,  (state) => { state.loading = true; state.error = null; })
      .addCase(loginUser.fulfilled,(state, action) => { state.loading = false; state.user = action.payload; })
      .addCase(loginUser.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => { state.user = null; })
      // Me
      .addCase(fetchMe.fulfilled, (state, action) => { state.user = action.payload; })
      .addCase(fetchMe.rejected,  (state) => { state.user = null; });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;