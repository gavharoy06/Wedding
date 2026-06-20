import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import venueReducer from "./venueSlice";
import bookingReducer from "./bookingSlice";
import ownerReducer from "./ownerSlice";
import adminReducer from "./adminSlice";
import districtReducer from "./districtSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    venues: venueReducer,
    bookings: bookingReducer,
    owner: ownerReducer,
    admin:adminReducer,
    districts: districtReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;