import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import type { AppDispatch, RootState } from "../../store/store";
import {
  fetchAllVenues,
  updateVenueStatus,
  updateVenue,
  createVenue,
  uploadVenueImages,
  deleteVenue,
  clearAdminError,
  clearAdminSuccess,
  deleteVenueImage,
} from "../../store/adminSlice";
import axios from "../../api/axios";

type District = {
  district_id: number;
  district_name: string;
};

type EditFormData = {
  name: string;
  seats: string;
  price: string;
  address: string;
  description: string;
  phone: string;
};

const STATUS_FILTERS = ["ALL", "PENDING", "APPROVED", "REJECTED"];

export default function AdminVenuesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { venues, isLoading, error, success } = useSelector(
    (state: RootState) => state.admin,
  );
  const [searchParams, setSearchParams] = useSearchParams();

  const [filter, setFilter] = useState(searchParams.get("filter") || "ALL");
  const [showCreateForm, setShowCreateForm] = useState(
    searchParams.get("action") === "create",
  );
  const [districts, setDistricts] = useState<District[]>([]);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);
  const [uploadRef, setUploadRef] = useState<HTMLInputElement | null>(null);

  // ── Soft-delete: faqat frontda yashirish, DB ga request yuborilmaydi ──
  const [hiddenVenueIds, setHiddenVenueIds] = useState<Set<number>>(new Set());

  // ── Edit modal ──
  const [editingVenue, setEditingVenue] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<EditFormData>({
    name: "",
    seats: "",
    price: "",
    address: "",
    description: "",
    phone: "",
  });
  const [editLoading, setEditLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    district_id: "",
    seats: "",
    price: "",
    address: "",
    description: "",
    phone: "",
    owner_name: "",
    owner_email: "",
    owner_password: "",
  });

  useEffect(() => {
    dispatch(fetchAllVenues(filter === "ALL" ? undefined : filter));
  }, [dispatch, filter]);

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const res = await axios.get("/venues/districts");
        setDistricts(res.data.districts || []);
      } catch (err) {
        console.error("Districtlarni yuklashda xato:", err);
      }
    };
    fetchDistricts();
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => dispatch(clearAdminSuccess()), 3000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  // ── Delete venue handle
  const handleDeleteVenue = async (id: number, name: string) => {
    if (!window.confirm(`"${name}"To'yxona o'chirilsinmi?`)) {
      return;
    }
    try {
      await dispatch(deleteVenue(id)).unwrap();
    } catch (error) {
      console.error("To'yxonani ochirishda xatolik yuz berdi!", error);
    }
  };

  // ── Edit modal ──
  const openEditModal = (venue: any) => {
    setEditingVenue(venue);
    setEditForm({
      name: venue.name || "",
      seats: String(venue.seats || ""),
      price: String(venue.price || ""),
      address: venue.address || "",
      description: venue.description || "",
      phone: venue.phone || "",
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVenue) return;
    setEditLoading(true);
    try {
      await dispatch(
        updateVenue({
          id: editingVenue.venue_id,
          data: {
            name: editForm.name,
            seats: Number(editForm.seats),
            price: Number(editForm.price),
            address: editForm.address || undefined,
            description: editForm.description || undefined,
            phone: editForm.phone || undefined,
          },
        }),
      ).unwrap();
      setEditingVenue(null);
    } catch {
      // error redux-da ko'rinadi
    } finally {
      setEditLoading(false);
    }
  };

  const handleImageUpload = async (
    venueId: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingId(venueId);
    try {
      await dispatch(
        uploadVenueImages({ venueId, files: Array.from(files) }),
      ).unwrap();
    } catch {
      alert("Rasm yuklashda xatolik!");
    } finally {
      setUploadingId(null);
      e.target.value = "";
    }
  };

  const handleDeleteImage = async (image_id: number) => {
    if (!window.confirm("Ushbu suratini o'chirmoqchimisiz?")) return;
    try {
      await dispatch(deleteVenueImage(image_id)).unwrap();
    } catch (error) {
      console.error("Rasmni o'chirishda hatolik yuz beridi!", error);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.district_id ||
      !formData.seats ||
      !formData.price ||
      !formData.owner_name ||
      !formData.owner_email ||
      !formData.owner_password
    ) {
      alert("Iltimos, barcha majburiy maydonlarni to'ldiring!");
      return;
    }
    await dispatch(
      createVenue({
        name: formData.name,
        district_id: Number(formData.district_id),
        seats: Number(formData.seats),
        price: Number(formData.price),
        address: formData.address || undefined,
        description: formData.description || undefined,
        phone: formData.phone || undefined,
        owner_name: formData.owner_name,
        owner_email: formData.owner_email,
        owner_password: formData.owner_password,
      }),
    ).unwrap();
    setFormData({
      name: "",
      district_id: "",
      seats: "",
      price: "",
      address: "",
      description: "",
      phone: "",
      owner_name: "",
      owner_email: "",
      owner_password: "",
    });
    setShowCreateForm(false);
    setSearchParams({});
  };

  const getStatusDot = (status: string) => {
    const map: Record<string, string> = {
      APPROVED: "approved",
      PENDING: "pending",
      REJECTED: "rejected",
    };
    const labels: Record<string, string> = {
      APPROVED: "Tasdiqlangan",
      PENDING: "Kutilmoqda",
      REJECTED: "Rad etilgan",
    };
    return (
      <span className={`status-dot ${map[status] || "pending"}`}>
        {labels[status] || status}
      </span>
    );
  };

  const visibleVenues = venues.filter(
    (v: any) => !hiddenVenueIds.has(v.venue_id),
  );

  const inputFocus = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => (e.target.style.borderColor = "var(--secondary)");
  const inputBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => (e.target.style.borderColor = "var(--outline-variant)");

  const editInputStyle: React.CSSProperties = {
    width: "100%",
    padding: "11px 14px",
    borderRadius: 10,
    border: "1.5px solid var(--outline-variant)",
    background: "var(--surface)",
    color: "var(--on-surface)",
    fontSize: 13,
    fontFamily: "inherit",
    outline: "none",
    transition: "border-color 0.2s",
  };

  return (

    <div 

    style={{ maxWidth: 960, margin: "0 auto" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ══════════════════ EDIT MODAL ══════════════════ */}
      {editingVenue && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(29,26,32,0.5)",
            backdropFilter: "blur(8px)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingVenue(null);
          }}
        >
          <div
            className="animate-fade-in"
            style={{
              background: "var(--surface-low)",
              borderRadius: 20,
              padding: "32px 32px 28px",
              width: "100%",
              maxWidth: 520,
              border: "1px solid rgba(200,185,220,0.35)",
              boxShadow: "0 24px 64px rgba(80,50,130,0.2)",
            }}
          >
            {/* Modal header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 24,
              }}
            >
              <div>
                <h2
                  className="font-display"
                  style={{
                    fontSize: 20,
                    fontWeight: 600,
                    color: "var(--on-surface)",
                  }}
                >
                  To'yxonani Tahrirlash
                </h2>
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--outline)",
                    marginTop: 3,
                  }}
                >
                  #{editingVenue.venue_id} · {editingVenue.district_name}
                </p>
              </div>
              <button
                onClick={() => setEditingVenue(null)}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 9,
                  border: "1px solid var(--outline-variant)",
                  background: "transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--on-surface-variant)",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(106,81,136,0.07)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <span className="mi" style={{ fontSize: 18 }}>
                  close
                </span>
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                <div>
                  <label className="form-label">To'yxona Nomi</label>
                  <input
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    style={editInputStyle}
                    required
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  />
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
                  <div>
                    <label className="form-label">O'rinlar soni</label>
                    <input
                      type="number"
                      value={editForm.seats}
                      onChange={(e) =>
                        setEditForm({ ...editForm, seats: e.target.value })
                      }
                      style={editInputStyle}
                      required
                      onFocus={inputFocus}
                      onBlur={inputBlur}
                    />
                  </div>
                  <div>
                    <label className="form-label">Narx (so'm / kishi)</label>
                    <input
                      type="number"
                      value={editForm.price}
                      onChange={(e) =>
                        setEditForm({ ...editForm, price: e.target.value })
                      }
                      style={editInputStyle}
                      required
                      onFocus={inputFocus}
                      onBlur={inputBlur}
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label">Manzil</label>
                  <input
                    value={editForm.address}
                    placeholder="To'liq manzil..."
                    onChange={(e) =>
                      setEditForm({ ...editForm, address: e.target.value })
                    }
                    style={editInputStyle}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  />
                </div>
                <div>
                  <label className="form-label">Telefon</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    placeholder="+998 XX XXX XX XX"
                    onChange={(e) =>
                      setEditForm({ ...editForm, phone: e.target.value })
                    }
                    style={editInputStyle}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  />
                </div>
                <div>
                  <label className="form-label">Tavsif</label>
                  <textarea
                    value={editForm.description}
                    placeholder="Qisqacha tavsif..."
                    rows={3}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                    style={{
                      ...editInputStyle,
                      resize: "vertical",
                      lineHeight: 1.6,
                    }}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 10,
                  marginTop: 24,
                  paddingTop: 20,
                  borderTop: "1px solid rgba(200,185,220,0.2)",
                }}
              >
                <button
                  type="button"
                  onClick={() => setEditingVenue(null)}
                  className="btn-glass"
                  style={{ padding: "10px 22px", fontSize: 12 }}
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="btn-primary"
                  style={{
                    padding: "10px 26px",
                    fontSize: 12,
                    opacity: editLoading ? 0.7 : 1,
                    cursor: editLoading ? "not-allowed" : "pointer",
                  }}
                >
                  {editLoading ? (
                    <>
                      <span
                        className="mi"
                        style={{
                          fontSize: 15,
                          animation: "spin 0.8s linear infinite",
                        }}
                      >
                        autorenew
                      </span>{" "}
                      Saqlanmoqda...
                    </>
                  ) : (
                    <>
                      <span className="mi" style={{ fontSize: 15 }}>
                        save
                      </span>{" "}
                      Saqlash
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          
          
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: "var(--on-surface)",
            }}
          >
            To'yxonalarni Boshqarish
          </h1>
          <p style={{ fontSize: 12, color: "var(--outline)", marginTop: 3 }}>
            Barcha zallar va ularning holati
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn-primary"
          style={{ padding: "10px 22px", fontSize: 12 }}
        >
          <span className="mi" style={{ fontSize: 17 }}>
            {showCreateForm ? "close" : "add"}
          </span>
          {showCreateForm ? "Yopish" : "Yangi To'yxona"}
        </button>
      </div>

      {/* ── Alerts ── */}
      {error && (
        <div
          style={{
            marginBottom: 16,
            padding: "12px 16px",
            borderRadius: 12,
            background: "rgba(186,26,26,0.06)",
            border: "1px solid rgba(186,26,26,0.15)",
            color: "var(--error)",
            fontSize: 13,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {error}
          <button
            onClick={() => dispatch(clearAdminError())}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--error)",
            }}
          >
            <span className="mi" style={{ fontSize: 16 }}>
              close
            </span>
          </button>
        </div>
      )}
      {success && (
        <div
          style={{
            marginBottom: 16,
            padding: "12px 16px",
            borderRadius: 12,
            background: "rgba(16,185,129,0.06)",
            border: "1px solid rgba(16,185,129,0.2)",
            color: "#059669",
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span className="mi" style={{ fontSize: 16 }}>
            check_circle
          </span>
          {success}
        </div>
      )}

      {/* ── Create Form ── */}
      {showCreateForm && (
        <div className="admin-form-card">
          <h2 className="admin-form-title">Yangi To'yxona Qo'shish</h2>
          <p className="admin-form-subtitle">
            To'yxona haqidagi ma'lumotlarni kiriting va rasmlarini yuklang.
          </p>
          <form onSubmit={handleCreateSubmit}>
            <div className="admin-form-grid">
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <div>
                  <label className="form-label">To'yxona Nomi</label>
                  <input
                    type="text"
                    placeholder="Masalan: Ethereal Grand Hall"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Tuman (Toshkent)</label>
                  <div style={{ position: "relative" }}>
                    <select
                      value={formData.district_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          district_id: e.target.value,
                        })
                      }
                      className="form-input"
                      style={{ appearance: "none", paddingRight: 40 }}
                      required
                    >
                      <option value="">Tumanni tanlang</option>
                      {districts.map((d) => (
                        <option key={d.district_id} value={d.district_id}>
                          {d.district_name}
                        </option>
                      ))}
                    </select>
                    <span
                      className="mi"
                      style={{
                        position: "absolute",
                        right: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: 20,
                        color: "var(--outline)",
                        pointerEvents: "none",
                      }}
                    >
                      expand_more
                    </span>
                  </div>
                </div>
                <div>
                  <label className="form-label">Manzil</label>
                  <input
                    type="text"
                    placeholder="To'liq manzilni kiriting"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="form-input"
                  />
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
                  <div>
                    <label className="form-label">O'rinlar soni</label>
                    <input
                      type="number"
                      placeholder="500"
                      value={formData.seats}
                      onChange={(e) =>
                        setFormData({ ...formData, seats: e.target.value })
                      }
                      className="form-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Narx (so'm / kishi)</label>
                    <input
                      type="number"
                      placeholder="250000"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className="form-input"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label">Telefon Raqami</label>
                  <input
                    type="tel"
                    placeholder="+998"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="form-input"
                  />
                </div>
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <div>
                  <label className="form-label">Asosiy Rasm Yuklash</label>
                  <div
                    className="admin-image-upload-area"
                    onClick={() => uploadRef?.click()}
                  >
                    <span className="mi admin-upload-icon">cloud_upload</span>
                    <p className="admin-upload-text">
                      Rasmni shu yerga tortib olib keling yoki{" "}
                      <a
                        onClick={(e) => {
                          e.stopPropagation();
                          uploadRef?.click();
                        }}
                      >
                        fayl tanlash
                      </a>{" "}
                      tugmasini bosing
                    </p>
                    <p className="admin-upload-hint">
                      JPG, PNG formatlari (Maks 5MB)
                    </p>
                    <input
                      ref={(el) => setUploadRef(el)}
                      type="file"
                      multiple
                      accept="image/*"
                      style={{ display: "none" }}
                    />
                  </div>
                </div>
                <div
                  style={{
                    padding: 16,
                    background: "rgba(108,74,178,0.04)",
                    borderRadius: 12,
                    border: "1px solid rgba(108,74,178,0.12)",
                  }}
                >
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--on-surface-variant)",
                      marginBottom: 12,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    Owner Ma'lumotlari
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Owner ismi *"
                      value={formData.owner_name}
                      onChange={(e) =>
                        setFormData({ ...formData, owner_name: e.target.value })
                      }
                      className="form-input"
                      style={{ fontSize: 13, padding: "11px 14px" }}
                      required
                    />
                    <input
                      type="email"
                      placeholder="Owner email *"
                      value={formData.owner_email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          owner_email: e.target.value,
                        })
                      }
                      className="form-input"
                      style={{ fontSize: 13, padding: "11px 14px" }}
                      required
                    />
                    <input
                      type="password"
                      placeholder="Owner parol *"
                      value={formData.owner_password}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          owner_password: e.target.value,
                        })
                      }
                      className="form-input"
                      style={{ fontSize: 13, padding: "11px 14px" }}
                      required
                    />
                  </div>
                </div>
                <div>
                  <div
                    className="services-dropdown"
                    onClick={() =>
                      setShowServicesDropdown(!showServicesDropdown)
                    }
                  >
                    <span>Qo'shimcha Xizmatlar</span>
                    <span className="mi" style={{ fontSize: 20 }}>
                      {showServicesDropdown ? "expand_less" : "expand_more"}
                    </span>
                  </div>
                  {showServicesDropdown && (
                    <div
                      style={{
                        marginTop: 8,
                        padding: "12px 16px",
                        border: "1.5px solid var(--outline-variant)",
                        borderRadius: 12,
                        background: "var(--surface)",
                      }}
                    >
                      <textarea
                        placeholder="Qisqacha tavsif yoki qo'shimcha xizmatlar haqida ma'lumot..."
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        className="form-input"
                        style={{
                          resize: "vertical",
                          lineHeight: 1.6,
                          minHeight: 80,
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 12,
                marginTop: 28,
                paddingTop: 20,
                borderTop: "1px solid rgba(200,185,220,0.2)",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setSearchParams({});
                }}
                className="btn-glass"
                style={{ padding: "11px 24px", fontSize: 13 }}
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                className="btn-primary"
                style={{ padding: "11px 28px", fontSize: 13 }}
              >
                <span className="mi" style={{ fontSize: 17 }}>
                  save
                </span>
                To'yxonani Saqlash
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Filter Tabs ── */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 20,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => {
              setFilter(s);
              setSearchParams({ filter: s === "ALL" ? "" : s });
            }}
            style={{
              padding: "8px 18px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.18s",
              background:
                filter === s ? "var(--secondary)" : "rgba(106,81,136,0.08)",
              color: filter === s ? "#fff" : "var(--on-surface-variant)",
              letterSpacing: "0.04em",
            }}
          >
            {s === "ALL"
              ? "Barchasi"
              : s === "PENDING"
                ? "Kutilmoqda"
                : s === "APPROVED"
                  ? "Tasdiqlangan"
                  : "Rad etilgan"}
          </button>
        ))}
      </div>

      {/* ── Venues List ── */}
      {isLoading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "60px 0",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              border: "2px solid transparent",
              borderTopColor: "var(--secondary)",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <p style={{ fontSize: 13, color: "var(--outline)" }}>
            Yuklanmoqda...
          </p>
        </div>
      ) : visibleVenues.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
            background: "var(--surface)",
            borderRadius: 16,
            border: "1px solid rgba(200,185,220,0.2)",
          }}
        >
          <span
            className="mi"
            style={{
              fontSize: 48,
              color: "var(--outline-variant)",
              display: "block",
              marginBottom: 12,
            }}
          >
            search_off
          </span>
          <p style={{ color: "var(--outline)", fontSize: 14 }}>
            Hech qanday to'yxona topilmadi
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {visibleVenues.map((venue: any) => (
            <div key={venue.venue_id} className="venue-list-card">
              <div style={{ padding: "18px 20px" }}>
                {/* Top */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{ display: "flex", gap: 14, alignItems: "center" }}
                  >
                    <div className="admin-venue-thumb">
                      {venue.images ? (
                        <img
                          src={`http://localhost:5000${venue.images[0].image_url}`}
                          alt={venue.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <span
                          className="mi"
                          style={{ fontSize: 22, color: "#c4b5d9" }}
                        >
                          domain
                        </span>
                      )}
                    </div>
                    <div>
                      <h3
                        style={{
                          fontWeight: 700,
                          fontSize: 15,
                          color: "var(--on-surface)",
                        }}
                      >
                        {venue.name}
                      </h3>
                      <p
                        style={{
                          fontSize: 12,
                          color: "var(--outline)",
                          marginTop: 2,
                        }}
                      >
                        {venue.district_name} &bull; {venue.seats} kishi &bull;{" "}
                        {Number(venue.price).toLocaleString()} so'm
                      </p>
                      <p
                        style={{
                          fontSize: 11,
                          color: "var(--outline)",
                          marginTop: 1,
                        }}
                      >
                        Egasi: {venue.owner_name} ({venue.owner_email})
                      </p>
                    </div>
                  </div>
                  {getStatusDot(venue.status)}
                </div>
                {/* Mavjud rasmlar ro'yxati */}
                {venue.images && venue.images.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap",
                      marginTop: 12,
                    }}
                  >
                    {venue.images.map((img: any) => (
                      <div
                        key={img.image_id}
                        style={{ position: "relative", width: 60, height: 60 }}
                      >
                        <img
                          src={`http://localhost:5000${img.image_url}`}
                          alt="venue"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: 8,
                          }}
                        />
                        {/* O'chirish tugmasi (rasm ustida) */}
                        <button
                          onClick={() => handleDeleteImage(img.image_id)}
                          style={{
                            position: "absolute",
                            top: -5,
                            right: -5,
                            background: "red",
                            color: "white",
                            border: "none",
                            borderRadius: "50%",
                            width: 20,
                            height: 20,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                          }}
                          title="Rasmni o'chirish"
                        >
                          ×
                        </button>
                        {/* Agar asosiy rasm bo'lsa, belgi qo'yish */}
                        {img.is_primary && (
                          <span
                            style={{
                              position: "absolute",
                              bottom: 2,
                              left: 2,
                              background: "rgba(0,0,0,0.6)",
                              color: "white",
                              fontSize: 9,
                              padding: "2px 4px",
                              borderRadius: 4,
                            }}
                          >
                            Asosiy
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Image upload */}
                <div
                  style={{
                    paddingTop: 12,
                    borderTop: "1px solid rgba(200,185,220,0.15)",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--on-surface-variant)",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      cursor: "pointer",
                    }}
                  >
                    <span className="mi" style={{ fontSize: 16 }}>
                      photo_camera
                    </span>
                    Rasm yuklash
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleImageUpload(venue.venue_id, e)}
                      disabled={uploadingId === venue.venue_id}
                      style={{ display: "none" }}
                    />
                  </label>
                  {uploadingId === venue.venue_id && (
                    <span style={{ fontSize: 11, color: "var(--secondary)" }}>
                      Yuklanmoqda...
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginTop: 12,
                    flexWrap: "wrap",
                  }}
                >
                  {venue.status === "PENDING" && (
                    <>
                      <button
                        onClick={() =>
                          dispatch(
                            updateVenueStatus({
                              id: venue.venue_id,
                              status: "APPROVED",
                            }),
                          )
                        }
                        style={{
                          padding: "7px 16px",
                          borderRadius: 9,
                          background: "rgba(16,185,129,0.1)",
                          color: "#059669",
                          border: "1px solid rgba(16,185,129,0.25)",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          fontFamily: "inherit",
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <span className="mi" style={{ fontSize: 14 }}>
                          check_circle
                        </span>
                        Tasdiqlash
                      </button>
                      <button
                        onClick={() =>
                          dispatch(
                            updateVenueStatus({
                              id: venue.venue_id,
                              status: "REJECTED",
                            }),
                          )
                        }
                        style={{
                          padding: "7px 16px",
                          borderRadius: 9,
                          background: "rgba(186,26,26,0.06)",
                          color: "var(--error)",
                          border: "1px solid rgba(186,26,26,0.18)",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          fontFamily: "inherit",
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <span className="mi" style={{ fontSize: 14 }}>
                          cancel
                        </span>
                        Rad etish
                      </button>
                    </>
                  )}
                  {venue.status === "APPROVED" && (
                    <button
                      onClick={() =>
                        dispatch(
                          updateVenueStatus({
                            id: venue.venue_id,
                            status: "REJECTED",
                          }),
                        )
                      }
                      style={{
                        padding: "7px 16px",
                        borderRadius: 9,
                        background: "rgba(186,26,26,0.06)",
                        color: "var(--error)",
                        border: "1px solid rgba(186,26,26,0.18)",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <span className="mi" style={{ fontSize: 14 }}>
                        block
                      </span>
                      Bloklash
                    </button>
                  )}

                  {/* ── Tahrirlash tugmasi ── */}
                  <button
                    onClick={() => openEditModal(venue)}
                    style={{
                      padding: "7px 16px",
                      borderRadius: 9,
                      background: "rgba(108,74,178,0.07)",
                      color: "var(--secondary)",
                      border: "1px solid rgba(108,74,178,0.2)",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      transition: "background 0.18s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(108,74,178,0.13)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(108,74,178,0.07)")
                    }
                  >
                    <span className="mi" style={{ fontSize: 14 }}>
                      edit
                    </span>
                    Tahrirlash
                  </button>

                  {/* ── Yashirish (soft-delete) tugmasi ── */}
                  <button
                    onClick={() =>
                      handleDeleteVenue(venue.venue_id, venue.name)
                    }
                    style={{
                      padding: "7px 16px",
                      borderRadius: 9,
                      background: "rgba(186,26,26,0.06)", // Qizil rang (xavfli amal)
                      color: "var(--error)",
                      border: "1px solid rgba(186,26,26,0.2)",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      marginLeft: "auto",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(186,26,26,0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(186,26,26,0.06)";
                    }}
                  >
                    <span className="mi" style={{ fontSize: 14 }}>
                      delete_forever
                    </span>
                    O'chirish
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
