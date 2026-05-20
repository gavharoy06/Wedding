import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import venueReducer from '../features/venues/venueSlice';
import bookingReducer from '../features/bookings/bookingSlice';

export const store = configureStore({
  reducer: {
    auth:     authReducer,
    venues:   venueReducer,
    bookings: bookingReducer,
  },
});

export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;