import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";

import type { RootState, AppDispatch } from "./store/store";
import { fetchMe } from "./store/authSlice";

import RegisterPage from "./pages/Register";
import LoginPage from "./pages/Login";
import HomePage from "./pages/Homepage";
import VenueDetailPage from "./pages/VenueDetailPage";
import MyBookingsPage from "./pages/MyBookingPage";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import OwnerVenuesPage from "./pages/owner/OwnerVenuesPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminVenuesPage from "./pages/admin/AdminVenuesPage";
import OwnerBookingsPage from "./pages/owner/OwnerBookingsPage";
import AdminBookingsPage from "./pages/admin/AdminBookingsPage";
import AdminLayout from "./pages/admin/AdminLayout";
import OwnerLayout from "./pages/owner/OwnerLayout";
import Footer from "./components/Footer";

export default function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [appReady, setAppReady] = useState(false);

  // Detect if current path is admin or owner panel
  const location = useLocation();
  const isAdminOrOwner =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/owner");

  useEffect(() => {
    // fetchMe tugagach (muvaffaqiyatli yoki xato) appReady = true
    dispatch(fetchMe()).finally(() => {
      setAppReady(true);
    });
  }, [dispatch]);

  if (!appReady) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          background: "var(--surface)",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "2.5px solid transparent",
            borderTopColor: "var(--secondary)",
            borderRightColor: "var(--secondary)",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <p style={{ fontSize: 14, color: "var(--outline)" }}>Yuklanmoqda...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      {!isAdminOrOwner && <Navbar />}
      <main style={{ flex: 1 }}>
        <Routes>
          {/* Public sahifalar */}
          <Route path="/" element={<HomePage />} />
          <Route path="/venues/:id" element={<VenueDetailPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          {/* Client sahifalari */}
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute allowedRoles={["client"]}>
                <MyBookingsPage />
              </ProtectedRoute>
            }
          />
          {/* Owner sahifalari */}
          // Owner route'larini yangilang:
          <Route
            path="/owner"
            element={
              <ProtectedRoute allowedRoles={["owner"]}>
                <OwnerLayout />
              </ProtectedRoute>
            }
          >
            <Route path="venues" element={<OwnerVenuesPage />} />
            <Route path="bookings" element={<OwnerBookingsPage />} />
          </Route>
          {/* Admin sahifalari */}
          // Admin route'larini o'zgartiring (LAYOUT ichiga oling):
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="venues" element={<AdminVenuesPage />} />
            <Route path="bookings" element={<AdminBookingsPage />} />
          </Route>
          {/* Dashboard — role ga qarab yo'naltirish */}
          <Route
            path="/dashboard"
            element={
              user ? (
                user.role === "admin" ? (
                  <Navigate to="/admin" replace />
                ) : user.role === "owner" ? (
                  <Navigate to="/owner/venues" replace />
                ) : (
                  <Navigate to="/my-bookings" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
