import React from 'react'
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <div>
      <footer
      className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl shadow-black/5 ring-1 ring-white/10"
       style={{
      // background: "rgba(29, 26, 32, 0.95)",
      backdropFilter: "blur(10px)",
      color: "var(--outlne)",
      padding: "48px 32px 24px",
      marginTop: 64,
    }}>
      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 32,
        marginBottom: 32,
      }}>
        {/* Logo va tavsif */}
        <div>
          <h3 className="font-display" style={{
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 12,
            color: "var(--secondary)",
          }}>
            Aura Weddings
          </h3>
          <p style={{
            fontSize: 13,
            color: "var(--outline-variant)",
            lineHeight: 1.6,
          }}>
            O'zbekiston bo'ylab eng sara to'yxona va ziyofat zallarini toping.
            Orzuingizdagi koshonani biz bilan kashf eting.
          </p>
        </div>

        {/* Tezkor havolalar */}
        <div>
          <h4 style={{
            fontSize: 14,
            fontWeight: 700,
            marginBottom: 16,
            color: "var(--outline-variant)",
          }}>
            Tezkor havolalar
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Link to="/" style={{
              color: "var(--outline-variant)",
              textDecoration: "none",
              fontSize: 13,
              transition: "color 0.18s",
            }}
              onMouseEnter={(e) => e.currentTarget.style.color = "var(--secondary)"}
              onMouseLeave={(e) => e.currentTarget.style.color = "var(--outline-variant)"}
            >
              Bosh sahifa
            </Link>
            <Link to="/venues" style={{
              color: "var(--outline-variant)",
              textDecoration: "none",
              fontSize: 13,
              transition: "color 0.18s",
            }}
              onMouseEnter={(e) => e.currentTarget.style.color = "var(--secondary)"}
              onMouseLeave={(e) => e.currentTarget.style.color = "var(--outline-variant)"}
            >
              To'yxonalar
            </Link>
            <Link to="/my-bookings" style={{
              color: "var(--outline-variant)",
              textDecoration: "none",
              fontSize: 13,
              transition: "color 0.18s",
            }}
              onMouseEnter={(e) => e.currentTarget.style.color = "var(--secondary)"}
              onMouseLeave={(e) => e.currentTarget.style.color = "var(--outline-variant)"}
            >
              Mening bronlarim
            </Link>
          </div>
        </div>

        {/* Aloqa */}
        <div>
          <h4 style={{
            fontSize: 14,
            fontWeight: 700,
            marginBottom: 16,
            color: "var(--outline-variant)",
          }}>
            Aloqa
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13, color: "var(--outline-variant)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="mi" style={{ fontSize: 16 }}>phone</span>
              +998 97 280 53 39
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="mi" style={{ fontSize: 16 }}>email</span>
              info@auraweddings.uz
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="mi" style={{ fontSize: 16 }}>place</span>
              Toshkent, O'zbekiston
            </div>
          </div>
        </div>

        {/* Ijtimoiy tarmoqlar */}
        <div>
          <h4 style={{
            fontSize: 14,
            fontWeight: 700,
            marginBottom: 16,
            color: "var(--outline-variant)",
          }}>
            Bizni kuzating
          </h4>
          <div style={{ display: "flex", gap: 12 }}>
            {['instagram', 'facebook', 'telegram'].map((social) => (
              <button
                key={social}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 9,
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "transparent",
                  color: "var(--outline-variant)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.18s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--surface)";
                  e.currentTarget.style.borderColor = "rgba(220, 208, 255, 0.5)";
                  e.currentTarget.style.boxShadow = "0px 4px 15px rgba(220, 208, 255, 0.5)";

                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                }}
              >
                <span className="mi" style={{ fontSize: 18 }}>
                  {social === 'instagram' ? 'photo_camera' : social === 'facebook' ? 'facebook' : 'send'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pastki qism */}
      <div style={{
        paddingTop: 24,
        borderTop: "1px solid rgba(255,255,255,0.1)",
        textAlign: "center",
        fontSize: 12,
        color: "rgba(255,255,255,0.5)",
      }}>
        <p>© 2026 Aura Weddings. Barcha huquqlar himoyalangan.</p>
      </div>
    </footer>
    </div>
  )
}

export default Footer
