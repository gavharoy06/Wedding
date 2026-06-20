import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store/store";
import { fetchVenueById, clearVenueDetail } from "../store/venueSlice";
import BookingForm from "../components/BookingForm";
import venueBg from "../assets/dedding-1.jpg";

export default function VenueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { venueDetail, isLoading, error } = useSelector(
    (state: RootState) => state.venues,
  );
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    if (id) dispatch(fetchVenueById(id));
    return () => {
      dispatch(clearVenueDetail());
    };
  }, [id, dispatch]);

  if (isLoading)
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            border: "2.5px solid transparent",
            borderTopColor: "var(--secondary)",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <p style={{ fontSize: 14, color: "var(--outline)" }}>Yuklanmoqda...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );

  if (error)
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ color: "var(--error)" }}>{error}</p>
      </div>
    );

  if (!venueDetail) return null;

  const { venue, images, services, bookedDates } = venueDetail;

  const serviceIcon = (type: string) => {
    const icons: Record<string, string> = {
      SINGER: "mic",
      KARNAY: "music_note",
      MENU: "restaurant",
      CAR: "directions_car",
    };
    return icons[type] || "auto_awesome";
  };

  return (
    <section
      className="bg-cover bg-center bg-no-repeat bg-fixed w-full min-h-screen"
      style={{ backgroundImage: `url(${venueBg})` }}
    >
      <div className="backdrop-blur-xl bg-white/10 border border-white/22 shadow-2xl shadow-black/5 ring-1 ring-white/10">
        {/* ── Breadcrumb ── */}
        <div
          style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 24px 0" }}
        >
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              color: "var(--outline-variant)",
            }}
          >
            <Link
              to="/"
              style={{
                color: "var(--outline-variant)",
                textDecoration: "none",
              }}
            >
              Bosh sahifa
            </Link>
            <span className="mi" style={{ fontSize: 14 }}>
              chevron_right
            </span>
            <Link
              to="/"
              style={{
                color: "var(--outline-variant)",
                textDecoration: "none",
              }}
            >
              Zallar
            </Link>
            <span className="mi" style={{ fontSize: 14 }}>
              chevron_right
            </span>
            <span style={{ color: "var(--secondary)", fontWeight: 600 }}>
              {venue.name}
            </span>
          </nav>
        </div>

        {/* ── Hero Title ── */}
        <div
          style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 24px 0" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
              <h1
                className="font-display"
                style={{
                  fontSize: 38,
                  fontWeight: 700,
                  color: "var(--on-surface)",
                  marginBottom: 8,
                }}
              >
                {venue.name}
              </h1>
              {(venue.district_name || venue.address) && (
                <p
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 13,
                    color: "var(--on-surface-variant)",
                  }}
                >
                  <span className="mi" style={{ fontSize: 16 }}>
                    place
                  </span>
                  {venue.district_name}
                  {venue.address ? `, ${venue.address}` : ""}
                </p>
              )}
            </div>
            {/* Action buttons */}
            <div style={{ display: "flex", gap: 10 }}>
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "9px 18px",
                  borderRadius: 10,
                  border: "1.5px solid rgba(200,185,220,0.4)",
                  background: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  color: "var(--on-surface-variant)",
                  fontFamily: "inherit",
                }}
              >
                <span className="mi" style={{ fontSize: 17 }}>
                  favorite_border
                </span>
                Saqlash
              </button>
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "9px 18px",
                  borderRadius: 10,
                  border: "1.5px solid rgba(200,185,220,0.4)",
                  background: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  color: "var(--on-surface-variant)",
                  fontFamily: "inherit",
                }}
              >
                <span className="mi" style={{ fontSize: 17 }}>
                  share
                </span>
                Ulashish
              </button>
            </div>
          </div>
        </div>

        {/* ── Main Content ── */}
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "20px 24px 64px",
            display: "grid",
            gridTemplateColumns: "1fr 380px",
            gap: 32,
          }}
        >
          {/* ── LEFT: Gallery + Services ── */}
          <div>
            {/* Gallery grid */}
            {images.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                {images.length === 1 ? (
                  <div
                    style={{
                      borderRadius: 16,
                      overflow: "hidden",
                      height: 420,
                    }}
                  >
                    <img
                      src={`http://localhost:5000${images[0]?.image_url}`}
                      alt={venue.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.6fr 1fr",
                      gridTemplateRows: "210px 210px",
                      gap: 8,
                    }}
                  >
                    {/* Big left image */}
                    <div
                      style={{
                        gridRow: "1 / 3",
                        borderRadius: 16,
                        overflow: "hidden",
                        cursor: "pointer",
                      }}
                      onClick={() => setActiveImg(0)}
                    >
                      <img
                        src={`http://localhost:5000${images[activeImg]?.image_url}`}
                        alt={venue.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transition: "transform 0.3s",
                        }}
                      />
                    </div>
                    {/* Right thumbnails */}
                    {images.slice(1, 3).map((img, i) => (
                      <div
                        key={img.image_id}
                        style={{
                          borderRadius: i === 1 ? "0 0 16px 0" : "0 16px 0 0",
                          overflow: "hidden",
                          cursor: "pointer",
                          position: "relative",
                        }}
                        onClick={() => setActiveImg(i + 1)}
                      >
                        <img
                          src={`http://localhost:5000${img.image_url}`}
                          alt=""
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                        {/* "Barcha rasmlar" overlay on last thumb if more images */}
                        {i === 1 && images.length > 3 && (
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              background: "rgba(30,10,60,0.5)",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 4,
                            }}
                          >
                            <span
                              className="mi"
                              style={{ fontSize: 22, color: "#fff" }}
                            >
                              photo_library
                            </span>
                            <span
                              style={{
                                fontSize: 12,
                                fontWeight: 700,
                                color: "#fff",
                              }}
                            >
                              Barcha rasmlar ({images.length})
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Thumbnail strip */}
                {images.length > 3 && (
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      marginTop: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    {images.map((img, i) => (
                      <button
                        key={img.image_id}
                        onClick={() => setActiveImg(i)}
                        style={{
                          width: 72,
                          height: 52,
                          borderRadius: 9,
                          overflow: "hidden",
                          border: `2px solid ${activeImg === i ? "var(--secondary)" : "transparent"}`,
                          padding: 0,
                          cursor: "pointer",
                          opacity: activeImg === i ? 1 : 0.65,
                          transition: "all 0.15s",
                          flexShrink: 0,
                        }}
                      >
                        <img
                          src={`http://localhost:5000${img.image_url}`}
                          alt=""
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Asosiy ma'lumotlar */}
            <div
              className="backdrop-blur-xl bg-white/10 border border-white/22 shadow-2xl shadow-black/5 ring-1 ring-white/10"
              style={{
                borderRadius: 16,
                padding: 24,
                marginBottom: 24,
                border: "1px solid rgba(200,185,220,0.2)",
                boxShadow: "0 2px 12px rgba(80,50,130,0.06)",
              }}
            >
              <h2
                className="font-display"
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "var(--secondary)",
                  marginBottom: 16,
                }}
              >
                Asosiy ma'lumotlar
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 16,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: "rgba(108,74,178,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      className="mi"
                      style={{ fontSize: 20, color: "var(--secondary)" }}
                    >
                      payments
                    </span>
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: 11,
                        color: "var(--outline)",
                        marginBottom: 2,
                      }}
                    >
                      Boshlang'ich narx
                    </p>
                    <p
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "var(--on-surface)",
                      }}
                    >
                      {Number(venue.price).toLocaleString()} UZS
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: "rgba(108,74,178,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      className="mi"
                      style={{ fontSize: 20, color: "var(--secondary)" }}
                    >
                      group
                    </span>
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: 11,
                        color: "var(--outline)",
                        marginBottom: 2,
                      }}
                    >
                      Sig'im
                    </p>
                    <p
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "var(--on-surface)",
                      }}
                    >
                      {venue.seats} kishi
                    </p>
                  </div>
                </div>
                {venue.phone && (
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: "rgba(108,74,178,0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span
                        className="mi"
                        style={{ fontSize: 20, color: "var(--secondary)" }}
                      >
                        phone
                      </span>
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: 11,
                          color: "var(--outline)",
                          marginBottom: 2,
                        }}
                      >
                        Telefon
                      </p>
                      <p
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: "var(--on-surface)",
                        }}
                      >
                        {venue.phone}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Services */}
            {services.length > 0 && (
              <div
              className="backdrop-blur-xl bg-white/10 border border-white/22 shadow-2xl shadow-black/5 ring-1 ring-white/10"
                style={{
                  borderRadius: 16,
                  padding: 24,
                  border: "1px solid rgba(200,185,220,0.2)",
                  boxShadow: "0 2px 12px rgba(80,50,130,0.06)",
                }}
              >
                <h2
                  className="font-display"
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "var(--secondary)",
                    marginBottom: 16,
                  }}
                >
                  Xizmatlar va qulayliklar
                </h2>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  {services.map((s) => (
                    <div
                    className="backdrop-blur-xl bg-white/10 border border-white/22 shadow-2xl shadow-black/5 ring-1 ring-white/10"
                      key={s.extra_service_id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 16px",
                        borderRadius: 12,
                        border: `1.5px solid ${s.is_available ? "rgba(200,185,220,0.3)" : "rgba(200,185,220,0.15)"}`,
                        background: s.is_available
                          ? "#fff"
                          : "rgba(200,185,220,0.05)",
                        opacity: s.is_available ? 1 : 0.5,
                        transition: "border-color 0.18s",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <span
                          className="mi"
                          style={{ fontSize: 18, color: "var(--secondary)" }}
                        >
                          {serviceIcon(s.service_type)}
                        </span>
                        <div>
                          <p
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: "var(--on-surface)",
                            }}
                          >
                            {s.service_name}
                          </p>
                          {!s.is_available && (
                            <p
                              style={{ fontSize: 11, color: "var(--outline)" }}
                            >
                              Mavjud emas
                            </p>
                          )}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "var(--secondary)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {Number(s.service_price).toLocaleString()} so'm
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: Booking Panel ── */}
          <div style={{ position: "sticky", top: 20, alignSelf: "start" }}>
            {/* Venue info card */}
            <div
            className="backdrop-blur-xl bg-white/50 border border-white/22 shadow-2xl shadow-black/5 ring-1 ring-white/10"
              style={{
                background: "#fff",
                borderRadius: 18,
                border: "1px solid rgba(200,185,220,0.25)",
                padding: "20px",
                marginBottom: 12,
                boxShadow: "0 4px 24px rgba(80,50,130,0.08)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 13,
                  color: "var(--on-surface-variant)",
                  marginBottom: 14,
                }}
              >
                <span className="mi" style={{ fontSize: 16 }}>
                  place
                </span>
                {venue.district_name}
                {venue.address ? ` · ${venue.address}` : ""}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: 26,
                      fontWeight: 800,
                      color: "var(--on-surface)",
                    }}
                  >
                    {Number(venue.price).toLocaleString()}
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 400,
                        color: "var(--outline)",
                        marginLeft: 5,
                      }}
                    >
                      so'm
                    </span>
                  </p>
                  <p style={{ fontSize: 12, color: "var(--outline)" }}>
                    bir kishi uchun
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      color: "var(--on-surface)",
                    }}
                  >
                    {venue.seats}
                  </p>
                  <p style={{ fontSize: 12, color: "var(--outline)" }}>
                    kishilik
                  </p>
                </div>
              </div>
            </div>

            {/* Booking form or Login prompt */}
            {user && user.role === "client" ? (
              <div
                style={{
                  background: "#fff",
                  borderRadius: 18,
                  border: "1px solid rgba(200,185,220,0.25)",
                  padding: "20px",
                  boxShadow: "0 4px 24px rgba(80,50,130,0.08)",
                }}
              >
                <BookingForm
                  venueId={venueDetail.venue.venue_id}
                  services={venueDetail.services}
                  bookedDates={venueDetail.bookedDates || []}
                  venuePrice={venueDetail.venue.price || 0} // ← Muhim!
                />
              </div>
            ) : !user ? (
              <div
                style={{
                  background: "linear-gradient(135deg, #ede3f7, #ddd0f5)",
                  borderRadius: 18,
                  padding: "28px 24px",
                  textAlign: "center",
                  border: "1px solid rgba(200,185,220,0.25)",
                }}
              >
                <span
                  className="mi"
                  style={{
                    fontSize: 40,
                    color: "var(--secondary)",
                    display: "block",
                    marginBottom: 10,
                  }}
                >
                  lock_open
                </span>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--on-surface)",
                    marginBottom: 6,
                  }}
                >
                  Bron qilish uchun tizimga kiring
                </p>
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--on-surface-variant)",
                    marginBottom: 18,
                  }}
                >
                  Ro'yxatdan o'tish bepul va tez amalga oshiriladi.
                </p>
                <Link
                  to="/login"
                  className="btn-primary"
                  style={{
                    textDecoration: "none",
                    justifyContent: "center",
                    display: "flex",
                    padding: "12px 24px",
                  }}
                >
                  <span className="mi" style={{ fontSize: 17 }}>
                    login
                  </span>
                  Kirish
                </Link>
              </div>
            ) : null}

            {/* Booked dates summary */}
            {bookedDates.length > 0 && (
              <div
                style={{
                  marginTop: 12,
                  background: "#fff",
                  borderRadius: 16,
                  border: "1px solid rgba(200,185,220,0.2)",
                  padding: "16px 20px",
                }}
              >
                <h3
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--on-surface)",
                    marginBottom: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span
                    className="mi"
                    style={{ fontSize: 16, color: "var(--error)" }}
                  >
                    event_busy
                  </span>
                  Band sanalar
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {bookedDates.map((date) => (
                    <span
                      key={date}
                      style={{
                        fontSize: 11,
                        background: "rgba(186,26,26,0.08)",
                        color: "var(--error)",
                        padding: "3px 10px",
                        borderRadius: 6,
                        fontWeight: 600,
                      }}
                    >
                      {new Date(date).toLocaleDateString("uz-UZ")}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
