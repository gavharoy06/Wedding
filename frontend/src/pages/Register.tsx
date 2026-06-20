import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";

import { registerUser, registerOwner } from "../store/authSlice";
import type { AppDispatch, RootState } from "../store/store";
import { registerSchema, type RegisterFormData } from "../schemas/authSchema";

type OwnerRegisterData = RegisterFormData & { phone?: string };

// Inline style constants (shared)
const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "rgba(200,185,220,0.8)",
  marginBottom: 8,
};

const underlineInputStyle: React.CSSProperties = {
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
};

const errorStyle: React.CSSProperties = {
  color: "#ffb4ab",
  fontSize: 11,
  marginTop: 6,
  fontWeight: 600,
};

export default function RegisterPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [isOwner, setIsOwner] = useState(false);

  const { isLoading, error, user } = useSelector(
    (state: RootState) => state.auth
  );

  const form = useForm<OwnerRegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", phone: "" },
  });

  const onSubmit = async (data: OwnerRegisterData) => {
    if (isOwner) {
      const result = await dispatch(
        registerOwner({
          name: data.name,
          email: data.email,
          password: data.password,
          phone: data.phone,
        })
      );
      if (result.meta.requestStatus === "fulfilled") {
        navigate("/login");
      }
    } else {
      dispatch(registerUser({ name: data.name, email: data.email, password: data.password }));
    }
  };

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

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
        style={{ width: 500, height: 500, top: -100, left: -100, opacity: 0.4 }}
      />
      <div
        className="glow"
        style={{ width: 350, height: 350, bottom: -80, right: -80, opacity: 0.3, animationDelay: "3s" }}
      />

      <div
        className="animate-fade-in"
        style={{
          width: "100%",
          maxWidth: 440,
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
          className="font-display text-center"
          style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, letterSpacing: "0.14em", marginBottom: 8 }}
        >
          AURA WEDDINGS
        </p>

        {/* Title */}
        <h1
          className="font-display text-center"
          style={{ fontSize: 28, fontWeight: 600, color: "#fff", marginBottom: 28 }}
        >
          {isOwner ? "Become a Partner" : "Create Account"}
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

        {/* ── Role Toggle ── */}
        <div
          style={{
            display: "flex",
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 12,
            padding: 4,
            marginBottom: 32,
            gap: 4,
          }}
        >
          {[
            { label: "Foydalanuvchi", value: false },
            { label: "To'yxona Egasi", value: true },
          ].map((tab) => (
            <button
              key={String(tab.value)}
              type="button"
              onClick={() => setIsOwner(tab.value)}
              style={{
                flex: 1,
                padding: "9px 12px",
                borderRadius: 9,
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 700,
                fontFamily: "inherit",
                letterSpacing: "0.04em",
                transition: "all 0.2s",
                // Active state
                background: isOwner === tab.value
                  ? "rgba(108,74,178,0.85)"
                  : "transparent",
                color: isOwner === tab.value
                  ? "#fff"
                  : "rgba(200,185,220,0.6)",
                boxShadow: isOwner === tab.value
                  ? "0 2px 12px rgba(108,74,178,0.35)"
                  : "none",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Form ── */}
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Name */}
          <div style={{ marginBottom: 22 }}>
            <label style={labelStyle}>Ism</label>
            <input
              {...form.register("name")}
              placeholder="Ismingizni kiriting"
              style={underlineInputStyle}
              onFocus={(e) => (e.target.style.borderBottomColor = "rgba(200,185,220,0.9)")}
              onBlur={(e) => (e.target.style.borderBottomColor = "rgba(200,185,220,0.35)")}
            />
            {form.formState.errors.name && (
              <p style={errorStyle}>{form.formState.errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div style={{ marginBottom: 22 }}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              placeholder="example@domain.com"
              {...form.register("email")}
              style={underlineInputStyle}
              onFocus={(e) => (e.target.style.borderBottomColor = "rgba(200,185,220,0.9)")}
              onBlur={(e) => (e.target.style.borderBottomColor = "rgba(200,185,220,0.35)")}
            />
            {form.formState.errors.email && (
              <p style={errorStyle}>{form.formState.errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div style={{ marginBottom: isOwner ? 22 : 36 }}>
            <label style={labelStyle}>Parol</label>
            <input
              type="password"
              placeholder="••••••••"
              {...form.register("password")}
              style={underlineInputStyle}
              onFocus={(e) => (e.target.style.borderBottomColor = "rgba(200,185,220,0.9)")}
              onBlur={(e) => (e.target.style.borderBottomColor = "rgba(200,185,220,0.35)")}
            />
            {form.formState.errors.password && (
              <p style={errorStyle}>{form.formState.errors.password.message}</p>
            )}
          </div>

          {/* Phone — only Owner */}
          {isOwner && (
            <div style={{ marginBottom: 36 }}>
              <label style={labelStyle}>
                Telefon raqam{" "}
                <span style={{ color: "rgba(200,185,220,0.4)", fontWeight: 400 }}>
                  (ixtiyoriy)
                </span>
              </label>
              <input
                type="tel"
                placeholder="+998 XX XXX XX XX"
                {...form.register("phone")}
                style={underlineInputStyle}
                onFocus={(e) => (e.target.style.borderBottomColor = "rgba(200,185,220,0.9)")}
                onBlur={(e) => (e.target.style.borderBottomColor = "rgba(200,185,220,0.35)")}
              />
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: 12,
              background: isLoading ? "rgba(108,74,178,0.45)" : "rgba(108,74,178,0.85)",
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
            onMouseEnter={(e) => { if (!isLoading) (e.currentTarget.style.background = "rgba(108,74,178,1)"); }}
            onMouseLeave={(e) => { if (!isLoading) (e.currentTarget.style.background = "rgba(108,74,178,0.85)"); }}
          >
            {isLoading
              ? "Yuborilmoqda..."
              : isOwner
              ? "Partner sifatida ro'yxatdan o'tish"
              : "Ro'yxatdan o'tish →"}
          </button>
        </form>

        <p
          style={{
            marginTop: 28,
            textAlign: "center",
            fontSize: 12,
            color: "rgba(200,185,220,0.6)",
          }}
        >
          Akkountingiz bormi?{" "}
          <Link
            to="/login"
            style={{ color: "#d8bafa", fontWeight: 700, textDecoration: "none", marginLeft: 4 }}
          >
            Tizimga kiring
          </Link>
        </p>
      </div>
    </div>
  );
}