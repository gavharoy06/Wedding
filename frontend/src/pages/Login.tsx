import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";

import { loginUser, verifyOtp, clearError } from "../store/authSlice";
import type { AppDispatch, RootState } from "../store/store";
import { loginSchema, type LoginFormData } from "../schemas/authSchema";

type OtpFormData = { code: string };

export default function LoginPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [isOtpStep, setIsOtpStep] = useState(false);
  const [emailForOtp, setEmailForOtp] = useState("");

  const { isLoading, error, user, otpRequired, tempEmail } = useSelector(
    (state: RootState) => state.auth
  );

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const otpForm = useForm<OtpFormData>({
    defaultValues: { code: "" },
  });

  const onLoginSubmit = (data: LoginFormData) => {
    dispatch(loginUser(data));
  };

  const onOtpSubmit = (data: OtpFormData) => {
    const email = tempEmail || emailForOtp;
    if (email) dispatch(verifyOtp({ email, code: data.code }));
  };

  useEffect(() => {
    if (otpRequired && tempEmail) {
      setIsOtpStep(true);
      setEmailForOtp(tempEmail);
      otpForm.reset();
    }
  }, [otpRequired, tempEmail, otpForm]);

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => dispatch(clearError()), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // auth-page body class
  useEffect(() => {
    document.body.classList.add("auth-page");
    return () => document.body.classList.remove("auth-page");
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
      }}
    >
      {/* Ambient glow */}
      <div
        className="glow"
        style={{ width: 500, height: 500, top: -100, right: -100, opacity: 0.5 }}
      />
      <div
        className="glow"
        style={{ width: 300, height: 300, bottom: -50, left: -50, opacity: 0.3, animationDelay: "4s" }}
      />

      <div
        className="animate-fade-in"
        style={{
          width: "100%",
          maxWidth: 420,
          background: "rgba(255,251,255,0.08)",
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          border: "1px solid rgba(255,255,255,0.14)",
          borderRadius: 24,
          padding: "44px 40px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.25)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <p
          className="font-display text-center mb-2"
          style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, letterSpacing: "0.12em" }}
        >
          AURA WEDDINGS
        </p>

        {/* Title */}
        <h1
          className="font-display text-center mb-8"
          style={{
            fontSize: 30,
            fontWeight: 600,
            color: "#fff",
            letterSpacing: "0.01em",
          }}
        >
          {isOtpStep ? "Verify Your Identity" : "Start Dreaming"}
        </h1>

        {/* Error */}
        {error && (
          <div
            style={{
              background: "rgba(186,26,26,0.25)",
              border: "1px solid rgba(255,180,171,0.25)",
              borderRadius: 12,
              padding: "10px 16px",
              color: "#ffb4ab",
              fontSize: 13,
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            {error}
          </div>
        )}

        {!isOtpStep ? (
          /* ── Login Form ── */
          <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
            {/* Email */}
            <div style={{ marginBottom: 24 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "rgba(200,185,220,0.8)",
                  marginBottom: 8,
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                placeholder="example@domain.com"
                {...loginForm.register("email")}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  borderBottom: "1.5px solid rgba(200,185,220,0.35)",
                  color: "#fff",
                  fontSize: 14,
                  padding: "8px 2px",
                  outline: "none",
                  fontFamily: "inherit",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderBottomColor = "rgba(200,185,220,0.9)")}
                onBlur={(e) => (e.target.style.borderBottomColor = "rgba(200,185,220,0.35)")}
              />
              {loginForm.formState.errors.email && (
                <p style={{ color: "#ffb4ab", fontSize: 11, marginTop: 6, fontWeight: 600 }}>
                  {loginForm.formState.errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div style={{ marginBottom: 36 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "rgba(200,185,220,0.8)",
                  marginBottom: 8,
                }}
              >
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                {...loginForm.register("password")}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  borderBottom: "1.5px solid rgba(200,185,220,0.35)",
                  color: "#fff",
                  fontSize: 14,
                  padding: "8px 2px",
                  outline: "none",
                  fontFamily: "inherit",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderBottomColor = "rgba(200,185,220,0.9)")}
                onBlur={(e) => (e.target.style.borderBottomColor = "rgba(200,185,220,0.35)")}
              />
              {loginForm.formState.errors.password && (
                <p style={{ color: "#ffb4ab", fontSize: 11, marginTop: 6, fontWeight: 600 }}>
                  {loginForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: 12,
                background: isLoading ? "rgba(108,74,178,0.5)" : "rgba(108,74,178,0.85)",
                border: "1px solid rgba(200,185,220,0.2)",
                color: "#fff",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                cursor: isLoading ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                transition: "background 0.2s, transform 0.15s",
                backdropFilter: "blur(8px)",
              }}
              onMouseEnter={(e) => { if (!isLoading) (e.currentTarget.style.background = "rgba(108,74,178,1)"); }}
              onMouseLeave={(e) => { if (!isLoading) (e.currentTarget.style.background = "rgba(108,74,178,0.85)"); }}
            >
              {isLoading ? "Connecting..." : "Continue →"}
            </button>
          </form>
        ) : (
          /* ── OTP Form ── */
          <form onSubmit={otpForm.handleSubmit(onOtpSubmit)}>
            <p
              style={{
                textAlign: "center",
                fontSize: 13,
                color: "rgba(200,185,220,0.8)",
                lineHeight: 1.65,
                marginBottom: 28,
              }}
            >
              Enter the 6-digit code sent to{" "}
              <br />
              <span style={{ color: "#d8bafa", fontWeight: 600 }}>{emailForOtp}</span>
            </p>

            {/* OTP boxes */}
            <input
              type="text"
              maxLength={6}
              placeholder="000000"
              {...otpForm.register("code", {
                required: "Kodni kiriting",
                minLength: { value: 6, message: "Kod 6 ta belgidan iborat bo'lishi kerak" },
              })}
              className="otp-box"
              style={{ width: "100%", marginBottom: 8 }}
            />
            {otpForm.formState.errors.code && (
              <p style={{ color: "#ffb4ab", fontSize: 11, textAlign: "center", marginBottom: 4, fontWeight: 600 }}>
                {otpForm.formState.errors.code.message}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "14px",
                marginTop: 20,
                borderRadius: 12,
                background: isLoading ? "rgba(108,74,178,0.5)" : "rgba(108,74,178,0.85)",
                border: "1px solid rgba(200,185,220,0.2)",
                color: "#fff",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                cursor: isLoading ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                transition: "background 0.2s",
              }}
            >
              {isLoading ? "Confirming..." : "Confirm Verification"}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOtpStep(false);
                setEmailForOtp("");
                dispatch(clearError());
              }}
              style={{
                width: "100%",
                marginTop: 14,
                background: "transparent",
                border: "none",
                color: "rgba(200,185,220,0.6)",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                cursor: "pointer",
                fontFamily: "inherit",
                padding: "8px",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#d8bafa")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(200,185,220,0.6)")}
            >
              ← Back to Login
            </button>
          </form>
        )}

        {!isOtpStep && (
          <p
            style={{
              marginTop: 32,
              textAlign: "center",
              fontSize: 12,
              color: "rgba(200,185,220,0.6)",
              letterSpacing: "0.02em",
            }}
          >
            Don't have an account?{" "}
            <Link
              to="/register"
              style={{
                color: "#d8bafa",
                fontWeight: 700,
                textDecoration: "none",
                marginLeft: 4,
              }}
            >
              Register Now
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}