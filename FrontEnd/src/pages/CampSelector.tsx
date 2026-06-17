import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Edit2, MapPin } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

interface Camp {
  camp_id: number;
  name: string;
  location: string;
  status: string;
}

const STATUS_OPTIONS = [
  { value: "active",     label: "Activo",      color: "#00ff41", emoji: "🟢" },
  { value: "inactive",   label: "Inactivo",    color: "#ff3333", emoji: "🔴" },
  { value: "quarantine", label: "Cuarentena",  color: "#ffaa00", emoji: "⚠️" },
];

const emptyForm = { name: "", location: "", status: "active" };

export default function CampSelector() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [camps, setCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal
  const [showForm, setShowForm]       = useState(false);
  const [editingCamp, setEditingCamp] = useState<Camp | null>(null);
  const [form, setForm]               = useState(emptyForm);
  const [submitting, setSubmitting]   = useState(false);

  const fetchCamps = () => {
    setLoading(true);
    api
      .get("/camps")
      .then((res) => setCamps(res.data))
      .catch(() => setError("Error al cargar los campamentos"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCamps(); }, []);

  const handleSelect = (camp: Camp) => {
    localStorage.setItem("selected_camp", JSON.stringify(camp));
    navigate("/dashboard/super-admin");
  };

  const openCreate = () => {
    setEditingCamp(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (e: React.MouseEvent, camp: Camp) => {
    e.stopPropagation(); // evita que se active handleSelect
    setEditingCamp(camp);
    setForm({ name: camp.name, location: camp.location, status: camp.status });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.location.trim()) {
      alert("Nombre y ubicación son obligatorios");
      return;
    }
    setSubmitting(true);
    try {
      if (editingCamp) {
        await api.put(`/camps/${editingCamp.camp_id}`, form);
      } else {
        await api.post("/camps", form);
      }
      setShowForm(false);
      setEditingCamp(null);
      setForm(emptyForm);
      fetchCamps();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al guardar";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const statusInfo = (val: string) =>
    STATUS_OPTIONS.find((s) => s.value === val) ?? {
      value: val, label: val, color: "#888", emoji: "❓",
    };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a" }}>
      {/* Header */}
      <header
        style={{
          background: "#1a1a1a",
          padding: "1rem 2rem",
          borderBottom: "1px solid #00ff41",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={{ color: "#00ff41", fontFamily: "monospace", fontSize: "1.5rem" }}>
          🧟 Sanctuary Protocol
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ color: "#888", fontFamily: "monospace" }}>
            {user?.username} — SuperAdmin
          </span>
          <button
            onClick={logout}
            style={{
              background: "#ff3333", color: "#fff", border: "none",
              padding: "0.5rem 1rem", borderRadius: "6px",
              cursor: "pointer", fontFamily: "monospace",
            }}
          >
            Salir
          </button>
        </div>
      </header>

      {/* Contenido */}
      <main style={{ padding: "3rem 2rem", maxWidth: "960px", margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Título + botón nuevo */}
          <div
            style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem",
            }}
          >
            <div>
              <h2 style={{ color: "#e0e0e0", fontFamily: "monospace", marginBottom: "0.25rem" }}>
                🏕️ Campamentos
              </h2>
              <p style={{ color: "#888", fontFamily: "monospace", fontSize: "0.85rem" }}>
                Haz clic en una card para entrar · usa ✏️ para editar
              </p>
            </div>
            <button
              onClick={openCreate}
              style={{
                background: "#00ff41", color: "#0a0a0a", border: "none",
                padding: "0.6rem 1.2rem", borderRadius: "8px", cursor: "pointer",
                fontFamily: "monospace", fontWeight: "bold", fontSize: "0.9rem",
                display: "flex", alignItems: "center", gap: "0.4rem",
              }}
            >
              <Plus size={16} /> Nuevo Campamento
            </button>
          </div>

          {loading && (
            <p style={{ color: "#00ff41", fontFamily: "monospace" }}>Cargando campamentos...</p>
          )}
          {error && (
            <p style={{ color: "#ff3333", fontFamily: "monospace" }}>{error}</p>
          )}

          {/* Grid de cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {camps.map((camp, index) => {
              const si = statusInfo(camp.status);
              return (
                <motion.div
                  key={camp.camp_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  whileHover={{ scale: 1.03, boxShadow: `0 0 20px ${si.color}33` }}
                  onClick={() => handleSelect(camp)}
                  style={{
                    background: "#1a1a1a",
                    border: `1px solid ${si.color}66`,
                    borderRadius: "12px",
                    padding: "1.5rem",
                    cursor: "pointer",
                    position: "relative",
                  }}
                >
                  {/* Badge de estado */}
                  <span
                    style={{
                      position: "absolute", top: "0.75rem", right: "0.75rem",
                      background: si.color + "22", color: si.color,
                      fontFamily: "monospace", fontSize: "0.7rem",
                      padding: "0.2rem 0.5rem", borderRadius: "4px",
                      border: `1px solid ${si.color}44`,
                    }}
                  >
                    {si.emoji} {si.label}
                  </span>

                  <h3
                    style={{
                      color: "#00ff41", fontFamily: "monospace",
                      marginBottom: "0.4rem", paddingRight: "5.5rem",
                    }}
                  >
                    {camp.name}
                  </h3>
                  <p
                    style={{
                      color: "#888", fontFamily: "monospace", fontSize: "0.82rem",
                      display: "flex", alignItems: "center", gap: "0.3rem",
                      marginBottom: "1.25rem",
                    }}
                  >
                    <MapPin size={12} /> {camp.location}
                  </p>

                  {/* Botón editar — stopPropagation para no activar el select */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => openEdit(e, camp)}
                    style={{
                      background: "transparent", border: "1px solid #333",
                      color: "#888", padding: "0.35rem 0.8rem",
                      borderRadius: "6px", cursor: "pointer",
                      fontFamily: "monospace", fontSize: "0.78rem",
                      display: "flex", alignItems: "center", gap: "0.3rem",
                    }}
                  >
                    <Edit2 size={11} /> Editar
                  </motion.button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </main>

      {/* Modal crear / editar */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
              display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 100, padding: "1rem",
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                background: "#1a1a1a", border: "1px solid #00ff41",
                borderRadius: "12px", padding: "2rem",
                width: "100%", maxWidth: "420px",
              }}
            >
              {/* Cabecera modal */}
              <div
                style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "center", marginBottom: "1.5rem",
                }}
              >
                <h2 style={{ color: "#00ff41", fontFamily: "monospace" }}>
                  {editingCamp ? "✏️ Editar Campamento" : "🏕️ Nuevo Campamento"}
                </h2>
                <button
                  onClick={() => { setShowForm(false); setEditingCamp(null); }}
                  style={{ background: "transparent", border: "none", color: "#888", cursor: "pointer" }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {/* Nombre */}
                <div>
                  <label style={{ color: "#888", fontFamily: "monospace", fontSize: "0.85rem", display: "block", marginBottom: "0.4rem" }}>
                    Nombre *
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ej: Base Alpha"
                    style={{
                      width: "100%", background: "#0a0a0a", border: "1px solid #333",
                      borderRadius: "6px", padding: "0.6rem 0.8rem",
                      color: "#e0e0e0", fontFamily: "monospace", boxSizing: "border-box",
                    }}
                  />
                </div>

                {/* Ubicación */}
                <div>
                  <label style={{ color: "#888", fontFamily: "monospace", fontSize: "0.85rem", display: "block", marginBottom: "0.4rem" }}>
                    Ubicación *
                  </label>
                  <input
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Ej: Sector Norte, Km 12"
                    style={{
                      width: "100%", background: "#0a0a0a", border: "1px solid #333",
                      borderRadius: "6px", padding: "0.6rem 0.8rem",
                      color: "#e0e0e0", fontFamily: "monospace", boxSizing: "border-box",
                    }}
                  />
                </div>

                {/* Estado */}
                <div>
                  <label style={{ color: "#888", fontFamily: "monospace", fontSize: "0.85rem", display: "block", marginBottom: "0.6rem" }}>
                    Estado
                  </label>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    {STATUS_OPTIONS.map((s) => {
                      const active = form.status === s.value;
                      return (
                        <motion.button
                          key={s.value}
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => setForm({ ...form, status: s.value })}
                          style={{
                            flex: 1,
                            background: active ? s.color + "22" : "transparent",
                            border: `1px solid ${active ? s.color : "#333"}`,
                            borderRadius: "6px", padding: "0.5rem",
                            cursor: "pointer",
                            color: active ? s.color : "#666",
                            fontFamily: "monospace", fontSize: "0.75rem",
                            textAlign: "center", transition: "all 0.2s",
                          }}
                        >
                          {s.emoji}<br />{s.label}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={{
                    background: submitting ? "#333" : "#00ff41",
                    color: "#0a0a0a", border: "none", padding: "0.75rem",
                    borderRadius: "8px", cursor: submitting ? "not-allowed" : "pointer",
                    fontFamily: "monospace", fontWeight: "bold", fontSize: "1rem",
                  }}
                >
                  {submitting ? "Guardando..." : editingCamp ? "Guardar cambios" : "Crear Campamento"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
