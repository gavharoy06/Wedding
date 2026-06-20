import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import type { AppDispatch, RootState } from "../store/store";
import { fetchVenues } from "../store/venueSlice";
import { fetchDistricts } from "../store/districtSlice";
import weddingVideo from "../assets/wedding-day.mp4";
import "../styles/dropdwon.css";

export default function HomePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { venues, isLoading, error } = useSelector(
    (state: RootState) => state.venues,
  );
  const { districts } = useSelector((state: RootState) => state.districts);

  const [search, setSearch] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [sort, setSort] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);


  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        !(e.target as HTMLElement).closest("button") &&
        !(e.target as HTMLElement).closest('[style*="position: absolute"]')
      ) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const filters: any = {};
    if (debouncedSearch) filters.search = debouncedSearch;
    if (selectedDistrict) filters.district_id = selectedDistrict;
    if (sort) filters.sort = sort;
    dispatch(fetchVenues(filters));
  }, [debouncedSearch, selectedDistrict, sort, dispatch]);

  useEffect(() => {
    dispatch(fetchDistricts());
  }, [dispatch]);

  const handleReset = () => {
    setSearch("");
    setSelectedDistrict("");
    setSort("");
  };

  return (
    
    <section className="relative w-full min-h-screen overflow-hidden">
      {/* Orqa fondagi video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover -z-10"
      >
        <source src={weddingVideo} type="video/mp4" />
        Sizning brauzeringiz videoni qo'llab-quvvatlamaydi.
      </video>
      <div
        className="relative z-10"
        style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px 64px" }}
      >
        {/* Hero section */}
        <div className="hero-section">
          <div className="hero-diamond" />
          <p className="hero-subtitle">
            Mamlakatimiz bo'ylab eng sara ziyofat zallari
          </p>
          <h1 className="font-display hero-title">
            O'z Orzuingizdagi Koshonalar
          </h1>
          <p className="hero-description">
            Umrbod davom etadigan lahzalar uchun tanlangan...
          </p>
        </div>

        {/* ── Search / Filter Bar ── */}
        <div className="glass search-bar">
          <div className="search-input-container ">
            {/* <span className="mi search-icon">search</span> */}
            <input
              type="text"
              placeholder="Search venues in Toshkent..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input search-input"
            />
          </div>

          {/* District filter */}
          <div className="dropdown-container">
            <button
              type="button"
              onClick={() =>
                setOpenDropdown(openDropdown === "district" ? null : "district")
              }
              className={`dropdown-button ${!selectedDistrict ? "placeholder" : ""}`}
            >
              {selectedDistrict
                ? districts.find(
                    (d) => d.district_id === Number(selectedDistrict),
                  )?.district_name
                : "Barcha tumanlar"}
              <span className="mi dropdown-icon">
                {openDropdown === "district" ? "expand_less" : "expand_more"}
              </span>
            </button>

            {openDropdown === "district" && (
              <div className="dropdown-menu">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDistrict("");
                    setOpenDropdown(null);
                  }}
                  className={`dropdown-item ${!selectedDistrict ? "active" : ""}`}
                >
                  Barcha tumanlar
                </button>
                {districts.map((d) => (
                  <button
                    key={d.district_id}
                    type="button"
                    onClick={() => {
                      setSelectedDistrict(String(d.district_id));
                      setOpenDropdown(null);
                    }}
                    className={`dropdown-item ${selectedDistrict === String(d.district_id) ? "active" : ""}`}
                  >
                    {d.district_name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort */}
          
          <div style={{ flex: 1, minWidth: 160, position: "relative" }}>
            <button
              type="button"
              onClick={() =>
                setOpenDropdown(openDropdown === "sort" ? null : "sort")
              }
              style={{
                width: "100%",
                padding: "10px 36px 10px 14px",
                borderRadius: 10,
                border: "1px solid rgba(200,185,220,0.3)",
                background: "rgba(255,255,255,0.9)",
                backdropFilter: "blur(10px)",
                fontSize: 13,
                color: sort ? "var(--on-surface)" : "var(--outline)",
                textAlign: "left",
                cursor: "pointer",
                position: "relative",
              }}
            >
              {sort === "price_asc"
                ? "Narx: Arzon → Qimmat"
                : sort === "price_desc"
                  ? "Narx: Qimmat → Arzon"
                  : sort === "seats_asc"
                    ? "Sig'im: Kichik → Katta"
                    : sort === "seats_desc"
                      ? "Sig'im: Katta → Kichik"
                      : "Sort by: Most Elegant"}
              <span
                className="mi"
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 19,
                  color: "var(--outline)",
                }}
              >
                {openDropdown === "sort" ? "expand_less" : "expand_more"}
              </span>
            </button>

            {/* Dropdown menu */}
            {openDropdown === "sort" && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  marginTop: 4,
                  background: "rgba(255,255,255,0.95)",
                  backdropFilter: "blur(10px)",
                  borderRadius: 10,
                  border: "1px solid rgba(200,185,220,0.3)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  zIndex: 100,
                }}
              >
                {[
                  { value: "", label: "Sort by: Most Elegant" },
                  { value: "price_asc", label: "Narx: Arzon → Qimmat" },
                  { value: "price_desc", label: "Narx: Qimmat → Arzon" },
                  { value: "seats_asc", label: "Sig'im: Kichik → Katta" },
                  { value: "seats_desc", label: "Sig'im: Katta → Kichik" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setSort(option.value);
                      setOpenDropdown(null);
                    }}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "none",
                      background:
                        sort === option.value
                          ? "rgba(108,74,178,0.1)"
                          : "transparent",
                      color:
                        sort === option.value
                          ? "var(--secondary)"
                          : "var(--on-surface)",
                      fontSize: 13,
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(108,74,178,0.05)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background =
                        sort === option.value
                          ? "rgba(108,74,178,0.1)"
                          : "transparent")
                    }
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search button */}
          <button
            onClick={handleReset}
            className="btn-primary"
            style={{ padding: "10px 28px", fontSize: 13, flexShrink: 0 }}
          >
            <span className="mi" style={{ fontSize: 17 }}>
              tune
            </span>
            Search
          </button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="loading-container">
            <div className="loading-spinner" />
            <p className="loading-text">Yuklanmoqda...</p>
          </div>
        )}

        {/* Error */}
        {error && <div className="error-message">{error}</div>}

        {/* ── Venues Grid ── */}
        {!isLoading && !error && (
          <>
            {/* Empty state */}
            {venues.length === 0 ? (
              <div className="empty-state">
                <span className="mi empty-icon">search_off</span>
                <p className="empty-text">Hech qanday to'yxona topilmadi.</p>
              </div>
            ) : (
              <>
                <p className="results-count">
                  <span className="results-count-number">{venues.length}</span>{" "}
                  ta to'yxona topildi
                </p>
                <div className="venue-grid">
                  {venues.map((venue) => (
                    <Link
                      key={venue.venue_id}
                      to={`/venues/${venue.venue_id}`}
                      className="venue-card glass"
                    >
                      <div className="venue-image-container">
                        {venue.primary_image ? (
                          <img
                            src={`http://localhost:5000${venue.primary_image}`}
                            alt={venue.name}
                            className="venue-image"
                          />
                        ) : (
                          <div className="venue-image-placeholder">
                            <span className="mi venue-image-placeholder-icon">
                              photo_camera
                            </span>
                          </div>
                        )}
                        <span className="district-badge">
                          {venue.district_name}
                        </span>
                      </div>
                      <div className="venue-card-body">
                        <h3 className="font-display venue-card-title">
                          {venue.name}
                        </h3>
                        <div className="venue-card-guests">
                          <span className="venue-card-guests-item">
                            <span className="mi venue-card-guests-icon">
                              group
                            </span>
                            Up to {venue.seats} Guests
                          </span>
                        </div>
                        <div className="venue-card-footer">
                          <div>
                            <p className="venue-card-price-label">
                              Starting from
                            </p>
                            <p className="venue-card-price">
                              {venue.price.toLocaleString()}
                              <span className="venue-card-price-unit">
                                UZS / seat
                              </span>
                            </p>
                          </div>
                          <div className="venue-card-arrow">
                            <span className="mi venue-card-arrow-icon">
                              arrow_forward
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}
