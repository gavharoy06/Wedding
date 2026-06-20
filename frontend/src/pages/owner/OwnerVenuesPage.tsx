import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import { 
  fetchOwnerVenues, 
  createVenue, 
  uploadVenueImages,
  updateOwnerVenue,
  clearOwnerError,
  clearOwnerSuccess 
} from "../../store/ownerSlice";
import axios from "../../api/axios";

interface District {
  district_id: number;
  district_name: string;
}

interface EditingVenue {
  venue_id: number;
  name: string;
  seats: number;
  price: number;
  address: string;
  description: string;
  phone: string;
}

export default function OwnerVenuesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { venues, isLoading, error, success } = useSelector((state: RootState) => state.owner);

  const [showForm, setShowForm] = useState(false);
  const [editingVenue, setEditingVenue] = useState<EditingVenue | null>(null);
  const [districts, setDistricts] = useState<District[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);
  const [uploadRef, setUploadRef] = useState<HTMLInputElement | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    district_id: "",
    seats: "",
    price: "",
    address: "",
    description: "",
    phone: "",
  });

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
    dispatch(fetchOwnerVenues());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => dispatch(clearOwnerSuccess()), 3000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.district_id || !formData.seats || !formData.price) {
      alert("Iltimos, majburiy maydonlarni to'ldiring!");
      return;
    }

    try {
      const result = await dispatch(createVenue({
        name: formData.name,
        district_id: Number(formData.district_id),
        seats: Number(formData.seats),
        price: Number(formData.price),
        address: formData.address || null,
        description: formData.description || null,
        phone: formData.phone || null,
      })).unwrap();
      
      if (result?.venue_id && images.length > 0) {
        setUploading(true);
        await dispatch(uploadVenueImages({
          venueId: result.venue_id,
          images: images
        })).unwrap();
        setUploading(false);
      }
      
      setFormData({ name: "", district_id: "", seats: "", price: "", address: "", description: "", phone: "" });
      setImages([]);
      setShowForm(false);
      
    } catch (err) {
      console.error("Xatolik:", err);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVenue) return;

    try {
      await dispatch(updateOwnerVenue({
        venueId: editingVenue.venue_id,
        data: {
          name: editingVenue.name,
          seats: editingVenue.seats,
          price: editingVenue.price,
          address: editingVenue.address || null,
          description: editingVenue.description || null,
          phone: editingVenue.phone || null,
        }
      })).unwrap();
      
      setEditingVenue(null);
    } catch (err) {
      console.error("Yangilash xatosi:", err);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImages(prev => [...prev, ...files]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const getStatusDot = (status: string) => {
    const map: Record<string, string> = { APPROVED: "approved", PENDING: "pending", REJECTED: "rejected" };
    const labels: Record<string, string> = { APPROVED: "Tasdiqlangan", PENDING: "Kutilmoqda", REJECTED: "Rad etilgan" };
    return <span className={`status-dot ${map[status] || "pending"}`}>{labels[status] || status}</span>;
  };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--on-surface)" }}>Mening To'yxonalarim</h1>
          <p style={{ fontSize: 12, color: "var(--outline)", marginTop: 3 }}>Sizning barcha to'yxonalaringiz va ularning holati</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditingVenue(null); }}
          className="btn-primary"
          style={{ padding: "10px 22px", fontSize: 12 }}
        >
          <span className="mi" style={{ fontSize: 17 }}>{showForm ? "close" : "add"}</span>
          {showForm ? "Yopish" : "Yangi To'yxona"}
        </button>
      </div>

      {/* ── Alerts ── */}
      {error && (
        <div style={{ marginBottom: 16, padding: "12px 16px", borderRadius: 12, background: "rgba(186,26,26,0.06)", border: "1px solid rgba(186,26,26,0.15)", color: "var(--error)", fontSize: 13, display: "flex", justifyContent: "space-between" }}>
          {error}
          <button onClick={() => dispatch(clearOwnerError())} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--error)" }}>
            <span className="mi" style={{ fontSize: 16 }}>close</span>
          </button>
        </div>
      )}
      {success && (
        <div style={{ marginBottom: 16, padding: "12px 16px", borderRadius: 12, background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)", color: "#059669", fontSize: 13, display: "flex", gap: 8, alignItems: "center" }}>
          <span className="mi" style={{ fontSize: 16 }}>check_circle</span>
          {success}
        </div>
      )}

      {/* ── Create Form ── */}
      {showForm && (
        <div className="admin-form-card">
          <h2 className="admin-form-title">Yangi To'yxona Qo'shish</h2>
          <p className="admin-form-subtitle">To'yxona haqidagi ma'lumotlarni kiriting va rasmlarini yuklang.</p>

          <form onSubmit={handleSubmit}>
            <div className="admin-form-grid">
              {/* Left */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label className="form-label">To'yxona Nomi</label>
                  <input
                    type="text"
                    placeholder="Masalan: Ethereal Grand Hall"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Tuman (Toshkent)</label>
                  <div style={{ position: "relative" }}>
                    <select
                      value={formData.district_id}
                      onChange={(e) => setFormData({ ...formData, district_id: e.target.value })}
                      className="form-input"
                      style={{ appearance: "none", paddingRight: 40 }}
                      required
                    >
                      <option value="">Tumanni tanlang</option>
                      {districts.map((d) => (
                        <option key={d.district_id} value={d.district_id}>{d.district_name}</option>
                      ))}
                    </select>
                    <span className="mi" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 20, color: "var(--outline)", pointerEvents: "none" }}>expand_more</span>
                  </div>
                </div>
                <div>
                  <label className="form-label">Manzil</label>
                  <input
                    type="text"
                    placeholder="To'liq manzilni kiriting"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label className="form-label">O'rinlar soni (Sig'im)</label>
                    <input
                      type="number"
                      placeholder="Masalan: 500"
                      value={formData.seats}
                      onChange={(e) => setFormData({ ...formData, seats: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Bir kishi uchun narx (so'm)</label>
                    <input
                      type="number"
                      placeholder="Masalan: 250000"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Right */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label className="form-label">Asosiy Rasm Yuklash</label>
                  <div className="admin-image-upload-area" onClick={() => uploadRef?.click()}>
                    <span className="mi admin-upload-icon">cloud_upload</span>
                    <p className="admin-upload-text">
                      Rasmni shu yerga tortib olib keling yoki{" "}
                      <a onClick={(e) => { e.stopPropagation(); uploadRef?.click(); }}>fayl tanlash</a>{" "}
                      tugmasini bosing
                    </p>
                    <p className="admin-upload-hint">JPG, PNG formatlari (Maks 5MB)</p>
                    <input
                      ref={(el) => setUploadRef(el)}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: "none" }}
                    />
                  </div>
                  {images.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                      {images.map((img, idx) => (
                        <div key={idx} style={{ position: "relative" }}>
                          <img src={URL.createObjectURL(img)} alt="" style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8 }} />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            style={{ position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: "50%", background: "var(--error)", color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                          >
                            <span className="mi" style={{ fontSize: 12 }}>close</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Services / description dropdown */}
                <div>
                  <div className="services-dropdown" onClick={() => setShowServicesDropdown(!showServicesDropdown)}>
                    <span>Qo'shimcha Xizmatlar va Tavsif</span>
                    <span className="mi" style={{ fontSize: 20 }}>{showServicesDropdown ? "expand_less" : "expand_more"}</span>
                  </div>
                  {showServicesDropdown && (
                    <div style={{ marginTop: 8, padding: "12px 16px", border: "1.5px solid var(--outline-variant)", borderRadius: 12, background: "var(--surface)" }}>
                      <textarea
                        placeholder="Qisqacha tavsif yoki qo'shimcha xizmatlar haqida ma'lumot..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="form-input"
                        style={{ resize: "vertical", lineHeight: 1.6, minHeight: 80 }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 28, paddingTop: 20, borderTop: "1px solid rgba(200,185,220,0.2)" }}>
              <button type="button" onClick={() => setShowForm(false)} className="btn-glass" style={{ padding: "11px 24px", fontSize: 13 }}>
                Bekor qilish
              </button>
              <button type="submit" disabled={uploading} className="btn-primary" style={{ padding: "11px 28px", fontSize: 13 }}>
                <span className="mi" style={{ fontSize: 17 }}>{uploading ? "hourglass_empty" : "save"}</span>
                {uploading ? "Rasmlar yuklanmoqda..." : "Arizani Yuborish"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editingVenue && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(30,16,48,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, backdropFilter: "blur(4px)" }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 32, maxWidth: 480, width: "100%", margin: "0 16px", boxShadow: "0 24px 64px rgba(30,16,48,0.25)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--on-surface)" }}>To'yxonani Tahrirlash</h2>
              <button onClick={() => setEditingVenue(null)} className="icon-btn">
                <span className="mi" style={{ fontSize: 20 }}>close</span>
              </button>
            </div>
            <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div><label className="form-label">To'yxona nomi</label>
                <input type="text" value={editingVenue.name} onChange={(e) => setEditingVenue({ ...editingVenue, name: e.target.value })} className="form-input" required />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div><label className="form-label">Sig'imi</label>
                  <input type="number" value={editingVenue.seats} onChange={(e) => setEditingVenue({ ...editingVenue, seats: Number(e.target.value) })} className="form-input" required />
                </div>
                <div><label className="form-label">Narxi</label>
                  <input type="number" value={editingVenue.price} onChange={(e) => setEditingVenue({ ...editingVenue, price: Number(e.target.value) })} className="form-input" required />
                </div>
              </div>
              <div><label className="form-label">Manzil</label>
                <input type="text" value={editingVenue.address} onChange={(e) => setEditingVenue({ ...editingVenue, address: e.target.value })} className="form-input" />
              </div>
              <div><label className="form-label">Telefon</label>
                <input type="tel" value={editingVenue.phone} onChange={(e) => setEditingVenue({ ...editingVenue, phone: e.target.value })} className="form-input" />
              </div>
              <div><label className="form-label">Tavsif</label>
                <textarea value={editingVenue.description} onChange={(e) => setEditingVenue({ ...editingVenue, description: e.target.value })} className="form-input" style={{ resize: "vertical" }} rows={2} />
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: "center", padding: "11px 0", fontSize: 13 }}>
                  <span className="mi" style={{ fontSize: 16 }}>save</span>Saqlash
                </button>
                <button type="button" onClick={() => setEditingVenue(null)} className="btn-glass" style={{ flex: 1, justifyContent: "center", padding: "11px 0", fontSize: 13 }}>
                  Bekor qilish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Venues Grid ── */}
      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "60px 0", gap: 12 }}>
          <div style={{ width: 24, height: 24, borderRadius: "50%", border: "2px solid transparent", borderTopColor: "var(--secondary)", animation: "spin 0.8s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : venues.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", background: "#fff", borderRadius: 16, border: "1px solid rgba(200,185,220,0.2)" }}>
          <span className="mi" style={{ fontSize: 48, color: "var(--outline-variant)", display: "block", marginBottom: 12 }}>domain_disabled</span>
          <p style={{ color: "var(--outline)", fontSize: 14, marginBottom: 12 }}>Hali hech qanday to'yxona qo'shilmagan</p>
          <button onClick={() => setShowForm(true)} className="btn-glass" style={{ fontSize: 13, padding: "9px 20px" }}>
            <span className="mi" style={{ fontSize: 16 }}>add</span>
            Birinchi to'yxonani qo'shing
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {venues.map((v: any) => (
            <div key={v.venue_id} className="venue-list-card">
              {/* Image */}
              <div style={{ height: 160, background: "linear-gradient(135deg,#f3eeff,#ede3f7)", position: "relative", overflow: "hidden" }}>
                {v.primary_image ? (
                  <img src={`http://localhost:5000${v.primary_image}`} alt={v.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span className="mi" style={{ fontSize: 44, color: "#c4b5d9" }}>domain</span>
                  </div>
                )}
                <div style={{ position: "absolute", top: 10, right: 10 }}>{getStatusDot(v.status)}</div>
              </div>

              <div style={{ padding: 16 }}>
                <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{v.name}</h3>
                <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                  <span style={{ fontSize: 12, color: "var(--outline)", display: "flex", alignItems: "center", gap: 4 }}>
                    <span className="mi" style={{ fontSize: 14 }}>place</span>{v.district_name}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--outline)", display: "flex", alignItems: "center", gap: 4 }}>
                    <span className="mi" style={{ fontSize: 14 }}>group</span>{v.seats} kishi
                  </span>
                </div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "var(--secondary)", marginBottom: 12 }}>
                  {Number(v.price).toLocaleString()} so'm
                  <span style={{ fontSize: 11, fontWeight: 400, color: "var(--outline)", marginLeft: 3 }}>/ o'rin</span>
                </p>
                <div style={{ display: "flex", gap: 8, borderTop: "1px solid rgba(200,185,220,0.2)", paddingTop: 12 }}>
                  <button
                    onClick={() => setEditingVenue({ venue_id: v.venue_id, name: v.name, seats: v.seats, price: v.price, address: v.address || '', description: v.description || '', phone: v.phone || '' })}
                    style={{ flex: 1, padding: "8px 0", borderRadius: 9, background: "rgba(108,74,178,0.08)", color: "var(--secondary)", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}
                  >
                    <span className="mi" style={{ fontSize: 15 }}>edit</span>Tahrirlash
                  </button>
                  <button
                    onClick={() => window.location.href = `/owner/bookings?venue=${v.venue_id}`}
                    style={{ flex: 1, padding: "8px 0", borderRadius: 9, background: "rgba(106,81,136,0.06)", color: "var(--on-surface-variant)", border: "1px solid rgba(200,185,220,0.3)", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}
                  >
                    <span className="mi" style={{ fontSize: 15 }}>event_note</span>Bronlar
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