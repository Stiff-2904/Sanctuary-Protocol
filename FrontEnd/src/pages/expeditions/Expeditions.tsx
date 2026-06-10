import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Map, Plus, X, Users, Package, ChevronDown, ChevronUp } from "lucide-react";
import api from "../../services/api";

interface Exploration {
  exploration_id: number;
  camp_id: number;
  camp_name: string;
  start_date: string;
  end_date: string | null;
  status: string;
}

interface ExplorationDetail {
  exploration: Exploration;
  persons: { person_id: number; name: string; status: string }[];
  resources: { resource_id: number; resource_name: string; quantity_obtained: number }[];
}

interface Person {
  person_id: number;
  name: string;
}

interface Resource {
  resource_id: number;
  name: string;
}

export default function Expeditions() {
  const [explorations, setExplorations] = useState<Exploration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<ExplorationDetail | null>(null);
  const [persons, setPersons] = useState<Person[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [form, setForm] = useState({ start_date: "", end_date: "", status: "active" });
  const [submitting, setSubmitting] = useState(false);
  const [assignPersonId, setAssignPersonId] = useState("");
  const [addResourceId, setAddResourceId] = useState("");
  const [addQuantity, setAddQuantity] = useState("");

  const savedCamp = localStorage.getItem("selected_camp");
  const campId = savedCamp ? JSON.parse(savedCamp).camp_id : 1;

  const fetchExplorations = () => {
    setLoading(true);
    api.get("/explorations")
      .then((res) => setExplorations(res.data))
      .catch(() => setError("Error al cargar las expediciones"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchExplorations();
    api.get(`/persons?camp_id=${campId}`).then((res) => setPersons(res.data));
    api.get("/resources").then((res) => setResources(res.data));
  }, []);

  const handleExpand = async (id: number) => {
    if (expandedId === id) {
      setExpandedId(null);
      setDetail(null);
      return;
    }
    setExpandedId(id);
    try {
      const res = await api.get(`/explorations/${id}`);
      setDetail(res.data);
    } catch {
      setDetail(null);
    }
  };

  const handleCreate = async () => {
    if (!form.start_date) {
      alert("La fecha de inicio es obligatoria");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/explorations", { ...form, camp_id: campId });
      setShowForm(false);
      setForm({ start_date: "", end_date: "", status: "active" });
      fetchExplorations();
    } catch {
      alert("Error al crear la expedición");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await api.put(`/explorations/${id}`, { status });
      fetchExplorations();
      if (expandedId === id) handleExpand(id);
    } catch {
      alert("Error al actualizar el estado");
    }
  };

  const handleAssignPerson = async (explorationId: number) => {
    if (!assignPersonId) return;
    try {
      await api.post(`/explorations/${explorationId}/persons`, { person_id: parseInt(assignPersonId) });
      setAssignPersonId("");
      handleExpand(explorationId);
    } catch {
      alert("Error al asignar persona");
    }
  };

  const handleAddResource = async (explorationId: number) => {
    if (!addResourceId || !addQuantity) return;
    try {
      await api.post(`/explorations/${explorationId}/resources`, {
        resource_id: parseInt(addResourceId),
        quantity_obtained: parseFloat(addQuantity),
      });
      setAddResourceId("");
      setAddQuantity("");
      handleExpand(explorationId);
    } catch {
      alert("Error al registrar recurso");
    }
  };

  const statusColor: Record<string, string> = {
    active: "#00ff41",
    completed: "#00aaff",
    cancelled: "#ff3333",
  };

  const statusLabel: Record<string, string> = {
    active: "Activa",
    completed: "Completada",
    cancelled: "Cancelada",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", padding: "2rem" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <h1 style={{ color: "#008f11", fontFamily: "monospace" }}>🗺️ Expediciones</h1>
          <button
            onClick={() => setShowForm(true)}
            style={{
              background: "#008f11", color: "#fff", border: "none",
              padding: "0.75rem 1.5rem", borderRadius: "8px", cursor: "pointer",
              fontFamily: "monospace", fontWeight: "bold",
              display: "flex", alignItems: "center", gap: "0.5rem"
            }}
          >
            <Plus size={16} /> Nueva Expedición
          </button>
        </div>

        {/* Estadísticas */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          {[
            { label: "Total", value: explorations.length, color: "#008f11" },
            { label: "Activas", value: explorations.filter(e => e.status === "active").length, color: "#00ff41" },
            { label: "Completadas", value: explorations.filter(e => e.status === "completed").length, color: "#00aaff" },
            { label: "Canceladas", value: explorations.filter(e => e.status === "cancelled").length, color: "#ff3333" },
          ].map((stat) => (
            <div key={stat.label} style={{ background: "#1a1a1a", padding: "1rem", borderRadius: "8px", border: `1px solid ${stat.color}` }}>
              <p style={{ color: "#888", fontSize: "0.9rem" }}>{stat.label}</p>
              <p style={{ color: stat.color, fontSize: "1.5rem", fontFamily: "monospace" }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Lista */}
        <div style={{ background: "#1a1a1a", borderRadius: "12px", padding: "1.5rem" }}>
          <h2 style={{ color: "#e0e0e0", fontFamily: "monospace", marginBottom: "1rem" }}>📋 Expediciones</h2>

          {loading && <p style={{ color: "#008f11", fontFamily: "monospace" }}>Cargando...</p>}
          {error && <p style={{ color: "#ff3333", fontFamily: "monospace" }}>{error}</p>}
          {!loading && !error && explorations.length === 0 && (
            <p style={{ color: "#666", fontFamily: "monospace" }}>No hay expediciones registradas.</p>
          )}

          {explorations.map((exp, index) => (
            <motion.div
              key={exp.exploration_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              style={{ borderBottom: "1px solid #333" }}
            >
              {/* Fila principal */}
              <div
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "1rem", gap: "1rem", flexWrap: "wrap", cursor: "pointer"
                }}
                onClick={() => handleExpand(exp.exploration_id)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <Map size={20} color="#008f11" />
                  <div>
                    <p style={{ color: "#e0e0e0", fontFamily: "monospace" }}>{exp.camp_name}</p>
                    <p style={{ color: "#888", fontSize: "0.8rem" }}>
                      Inicio: {new Date(exp.start_date).toLocaleDateString()}
                      {exp.end_date ? ` — Fin: ${new Date(exp.end_date).toLocaleDateString()}` : ""}
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                  <span style={{ color: statusColor[exp.status] ?? "#888", fontFamily: "monospace", fontSize: "0.8rem" }}>
                    ● {statusLabel[exp.status] ?? exp.status}
                  </span>
                  {exp.status === "active" && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleUpdateStatus(exp.exploration_id, "completed"); }}
                      style={{ background: "transparent", border: "1px solid #00aaff", color: "#00aaff", padding: "0.25rem 0.75rem", borderRadius: "4px", cursor: "pointer", fontFamily: "monospace", fontSize: "0.8rem" }}
                    >
                      Completar
                    </button>
                  )}
                  {expandedId === exp.exploration_id ? <ChevronUp size={16} color="#888" /> : <ChevronDown size={16} color="#888" />}
                </div>
              </div>

              {/* Detalle expandible */}
              <AnimatePresence>
                {expandedId === exp.exploration_id && detail && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ padding: "1rem", background: "#0f0f0f", borderTop: "1px solid #222" }}
                  >
                    {/* Personas */}
                    <div style={{ marginBottom: "1.5rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                        <Users size={16} color="#00ff41" />
                        <p style={{ color: "#00ff41", fontFamily: "monospace", fontSize: "0.85rem" }}>Personas asignadas</p>
                      </div>
                      {detail.persons.length === 0 ? (
                        <p style={{ color: "#666", fontFamily: "monospace", fontSize: "0.8rem" }}>Sin personas asignadas</p>
                      ) : (
                        detail.persons.map(p => (
                          <p key={p.person_id} style={{ color: "#e0e0e0", fontFamily: "monospace", fontSize: "0.8rem", marginBottom: "0.25rem" }}>
                            • {p.name} — {p.status}
                          </p>
                        ))
                      )}
                      {exp.status === "active" && (
                        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                          <select
                            value={assignPersonId}
                            onChange={(e) => setAssignPersonId(e.target.value)}
                            style={{ background: "#0a0a0a", border: "1px solid #333", borderRadius: "4px", padding: "0.25rem 0.5rem", color: "#e0e0e0", fontFamily: "monospace", fontSize: "0.8rem" }}
                          >
                            <option value="">Seleccionar persona</option>
                            {persons.map(p => <option key={p.person_id} value={p.person_id}>{p.name}</option>)}
                          </select>
                          <button
                            onClick={() => handleAssignPerson(exp.exploration_id)}
                            style={{ background: "#00ff41", color: "#0a0a0a", border: "none", padding: "0.25rem 0.75rem", borderRadius: "4px", cursor: "pointer", fontFamily: "monospace", fontSize: "0.8rem" }}
                          >
                            Asignar
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Recursos */}
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                        <Package size={16} color="#ffaa00" />
                        <p style={{ color: "#ffaa00", fontFamily: "monospace", fontSize: "0.85rem" }}>Recursos obtenidos</p>
                      </div>
                      {detail.resources.length === 0 ? (
                        <p style={{ color: "#666", fontFamily: "monospace", fontSize: "0.8rem" }}>Sin recursos registrados</p>
                      ) : (
                        detail.resources.map(r => (
                          <p key={r.resource_id} style={{ color: "#e0e0e0", fontFamily: "monospace", fontSize: "0.8rem", marginBottom: "0.25rem" }}>
                            • {r.resource_name}: {r.quantity_obtained}
                          </p>
                        ))
                      )}
                      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                        <select
                          value={addResourceId}
                          onChange={(e) => setAddResourceId(e.target.value)}
                          style={{ background: "#0a0a0a", border: "1px solid #333", borderRadius: "4px", padding: "0.25rem 0.5rem", color: "#e0e0e0", fontFamily: "monospace", fontSize: "0.8rem" }}
                        >
                          <option value="">Seleccionar recurso</option>
                          {resources.map(r => <option key={r.resource_id} value={r.resource_id}>{r.name}</option>)}
                        </select>
                        <input
                          type="number"
                          placeholder="Cantidad"
                          value={addQuantity}
                          onChange={(e) => setAddQuantity(e.target.value)}
                          style={{ background: "#0a0a0a", border: "1px solid #333", borderRadius: "4px", padding: "0.25rem 0.5rem", color: "#e0e0e0", fontFamily: "monospace", fontSize: "0.8rem", width: "80px" }}
                        />
                        <button
                          onClick={() => handleAddResource(exp.exploration_id)}
                          style={{ background: "#ffaa00", color: "#0a0a0a", border: "none", padding: "0.25rem 0.75rem", borderRadius: "4px", cursor: "pointer", fontFamily: "monospace", fontSize: "0.8rem" }}
                        >
                          Agregar
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Modal nueva expedición */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                style={{ background: "#1a1a1a", border: "1px solid #008f11", borderRadius: "12px", padding: "2rem", width: "100%", maxWidth: "400px" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                  <h2 style={{ color: "#008f11", fontFamily: "monospace" }}>🗺️ Nueva Expedición</h2>
                  <button onClick={() => setShowForm(false)} style={{ background: "transparent", border: "none", color: "#888", cursor: "pointer" }}>
                    <X size={20} />
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div>
                    <label style={{ color: "#888", fontFamily: "monospace", fontSize: "0.85rem" }}>Fecha de inicio *</label>
                    <input
                      type="date"
                      value={form.start_date}
                      onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                      style={{ width: "100%", background: "#0a0a0a", border: "1px solid #333", borderRadius: "6px", padding: "0.5rem", color: "#e0e0e0", fontFamily: "monospace", marginTop: "0.25rem", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ color: "#888", fontFamily: "monospace", fontSize: "0.85rem" }}>Fecha estimada de regreso</label>
                    <input
                      type="date"
                      value={form.end_date}
                      onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                      style={{ width: "100%", background: "#0a0a0a", border: "1px solid #333", borderRadius: "6px", padding: "0.5rem", color: "#e0e0e0", fontFamily: "monospace", marginTop: "0.25rem", boxSizing: "border-box" }}
                    />
                  </div>
                  <button
                    onClick={handleCreate}
                    disabled={submitting}
                    style={{
                      background: submitting ? "#333" : "#008f11", color: "#fff", border: "none",
                      padding: "0.75rem", borderRadius: "8px", cursor: submitting ? "not-allowed" : "pointer",
                      fontFamily: "monospace", fontWeight: "bold", fontSize: "1rem"
                    }}
                  >
                    {submitting ? "Creando..." : "Crear Expedición"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}