import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Map,
  Plus,
  X,
  Users,
  Package,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Clock,
  Trash2,
} from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { getServerTime } from "../../services/serverTime";

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
  health_status?: string;
}

interface Resource {
  resource_id: number;
  name: string;
}

interface RecountLine {
  resource_id: number;
  resource_name: string;
  quantity: number;
}

export default function Expeditions() {
  const { user } = useAuth();
  const [explorations, setExplorations] = useState<Exploration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<ExplorationDetail | null>(null);
  const [persons, setPersons] = useState<Person[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [form, setForm] = useState({ start_date: "", end_date: "" });
  const [submitting, setSubmitting] = useState(false);
  const [assignPersonId, setAssignPersonId] = useState("");
  const [serverDate, setServerDate] = useState<Date>(new Date());

  // Estado del recuento
  const [recountLines, setRecountLines] = useState<RecountLine[]>([]);
  const [recountResourceId, setRecountResourceId] = useState("");
  const [recountQuantity, setRecountQuantity] = useState("");
  const [completing, setCompleting] = useState(false);
  const [completeError, setCompleteError] = useState("");

  const savedCamp = localStorage.getItem("selected_camp");
  const campId = savedCamp ? JSON.parse(savedCamp).camp_id : 1;

  const canManage =
    user?.role === "ExpeditionManager" || user?.role === "SuperAdmin";

  // Hora del servidor para determinar si la expedición ya regresó
  useEffect(() => {
    getServerTime().then((date) => {
      date.setHours(0, 0, 0, 0);
      setServerDate(date);
    });
  }, []);

  const hasReturned = (exp: Exploration): boolean => {
    if (!exp.end_date || exp.status !== "active") return false;
    const endDate = new Date(exp.end_date);
    endDate.setHours(0, 0, 0, 0);
    return endDate <= serverDate;
  };

  const fetchExplorations = () => {
    setLoading(true);
    api
      .get(`/explorations${campId ? `?camp_id=${campId}` : ""}`)
      .then((res) => setExplorations(res.data))
      .catch(() => setError("Error al cargar las expediciones"))
      .finally(() => setLoading(false));
  };

  const fetchPersons = () => {
    api.get(`/persons?camp_id=${campId}`).then((res) => setPersons(res.data));
  };

  useEffect(() => {
    fetchExplorations();
    fetchPersons();
    api.get("/resources").then((res) => setResources(res.data));
  }, []);

  const handleExpand = async (id: number) => {
    if (expandedId === id) {
      setExpandedId(null);
      setDetail(null);
      setRecountLines([]);
      setCompleteError("");
      return;
    }
    setExpandedId(id);
    setRecountLines([]);
    setCompleteError("");
    try {
      const res = await api.get(`/explorations/${id}`);
      setDetail(res.data);
      fetchPersons();
    } catch {
      setDetail(null);
    }
  };

  const handleCreate = async () => {
    if (!form.start_date || !form.end_date) {
      alert("Las fechas de inicio y fin son obligatorias");
      return;
    }
    if (new Date(form.end_date) <= new Date(form.start_date)) {
      alert("La fecha de fin debe ser posterior a la de inicio");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/explorations", { ...form, camp_id: campId, status: "active" });
      setShowForm(false);
      setForm({ start_date: "", end_date: "" });
      fetchExplorations();
    } catch {
      alert("Error al crear la expedición");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignPerson = async (explorationId: number) => {
    if (!assignPersonId) return;
    try {
      await api.post(`/explorations/${explorationId}/persons`, {
        person_id: parseInt(assignPersonId),
      });
      setAssignPersonId("");
      const res = await api.get(`/explorations/${explorationId}`);
      setDetail(res.data);
      fetchPersons();
    } catch {
      alert("Esa persona ya no está disponible (puede estar enferma, herida o en otra expedición)");
    }
  };

  const handleAddRecountLine = () => {
    if (!recountResourceId || !recountQuantity || parseFloat(recountQuantity) <= 0) return;
    const res = resources.find((r) => r.resource_id === parseInt(recountResourceId));
    if (!res) return;
    setRecountLines((prev) => {
      const existing = prev.find((l) => l.resource_id === res.resource_id);
      if (existing) {
        return prev.map((l) =>
          l.resource_id === res.resource_id
            ? { ...l, quantity: l.quantity + parseFloat(recountQuantity) }
            : l
        );
      }
      return [...prev, { resource_id: res.resource_id, resource_name: res.name, quantity: parseFloat(recountQuantity) }];
    });
    setRecountResourceId("");
    setRecountQuantity("");
  };

  const handleRemoveRecountLine = (resource_id: number) => {
    setRecountLines((prev) => prev.filter((l) => l.resource_id !== resource_id));
  };

  const handleCompleteExpedition = async (explorationId: number) => {
    setCompleteError("");
    if (recountLines.length === 0) {
      setCompleteError("Agregá al menos un recurso encontrado antes de completar");
      return;
    }
    setCompleting(true);
    try {
      for (const line of recountLines) {
        await api.post(`/explorations/${explorationId}/resources`, {
          resource_id: line.resource_id,
          quantity_obtained: line.quantity,
        });
      }
      await api.post(`/explorations/${explorationId}/complete`);
      setRecountLines([]);
      fetchExplorations();
      fetchPersons();
      setExpandedId(null);
      setDetail(null);
    } catch {
      setCompleteError("Error al completar la expedición. Intentá de nuevo.");
    } finally {
      setCompleting(false);
    }
  };

  const statusColor: Record<string, string> = {
    active: "#00ff41",
    completed: "#00aaff",
    cancelled: "#ff3333",
  };

  const statusLabel: Record<string, string> = {
    active: "En curso",
    completed: "Completada",
    cancelled: "Cancelada",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", padding: "2rem" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <h1 style={{ color: "#008f11", fontFamily: "monospace" }}>🗺️ Expediciones</h1>
          {canManage && (
            <button
              onClick={() => setShowForm(true)}
              style={{ background: "#008f11", color: "#fff", border: "none", padding: "0.75rem 1.5rem", borderRadius: "8px", cursor: "pointer", fontFamily: "monospace", fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <Plus size={16} /> Nueva Expedición
            </button>
          )}
        </div>

        {/* Estadísticas */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          {[
            { label: "Total", value: explorations.length, color: "#008f11" },
            { label: "En curso", value: explorations.filter(e => e.status === "active").length, color: "#00ff41" },
            { label: "Completadas", value: explorations.filter(e => e.status === "completed").length, color: "#00aaff" },
            { label: "Pendientes de regreso", value: explorations.filter(e => hasReturned(e)).length, color: "#ffaa00" },
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

          {explorations.map((exp, index) => {
            const returned = hasReturned(exp);
            const borderColor = returned ? "#ffaa00" : statusColor[exp.status] ?? "#333";

            return (
              <motion.div
                key={exp.exploration_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                style={{ border: `1px solid ${borderColor}`, borderRadius: "8px", marginBottom: "0.75rem", overflow: "hidden" }}
              >
                {/* Fila principal */}
                <div
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", gap: "1rem", flexWrap: "wrap", cursor: "pointer", background: returned ? "rgba(255,170,0,0.05)" : "transparent" }}
                  onClick={() => handleExpand(exp.exploration_id)}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <Map size={20} color={borderColor} />
                    <div>
                      <p style={{ color: "#e0e0e0", fontFamily: "monospace" }}>{exp.camp_name}</p>
                      <p style={{ color: "#888", fontSize: "0.8rem" }}>
                        {new Date(exp.start_date).toLocaleDateString()} →{" "}
                        {exp.end_date ? new Date(exp.end_date).toLocaleDateString() : "Sin fecha de fin"}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                    {returned ? (
                      <span style={{ color: "#ffaa00", fontFamily: "monospace", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                        <Clock size={13} /> Pendiente de recuento
                      </span>
                    ) : (
                      <span style={{ color: statusColor[exp.status] ?? "#888", fontFamily: "monospace", fontSize: "0.8rem" }}>
                        ● {statusLabel[exp.status] ?? exp.status}
                      </span>
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
                      style={{ padding: "1.25rem", background: "#0f0f0f", borderTop: "1px solid #222" }}
                    >
                      {/* Personas asignadas */}
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
                              • {p.name} — <span style={{ color: "#888" }}>{p.status}</span>
                            </p>
                          ))
                        )}
                        {canManage && exp.status === "active" && !returned && (
                          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                            <select
                              value={assignPersonId}
                              onChange={(e) => setAssignPersonId(e.target.value)}
                              style={{ background: "#0a0a0a", border: "1px solid #333", borderRadius: "4px", padding: "0.25rem 0.5rem", color: "#e0e0e0", fontFamily: "monospace", fontSize: "0.8rem" }}
                            >
                              <option value="">Seleccionar persona</option>
                              {persons
                                .filter(
                                  (p) =>
                                    (p.health_status ?? "healthy") === "healthy" &&
                                    !detail.persons.some((dp) => dp.person_id === p.person_id)
                                )
                                .map((p) => (
                                  <option key={p.person_id} value={p.person_id}>{p.name}</option>
                                ))}
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

                      {/* Recursos ya registrados */}
                      {detail.resources.length > 0 && (
                        <div style={{ marginBottom: "1.5rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                            <Package size={16} color="#00aaff" />
                            <p style={{ color: "#00aaff", fontFamily: "monospace", fontSize: "0.85rem" }}>Recursos obtenidos (registrados)</p>
                          </div>
                          {detail.resources.map(r => (
                            <p key={r.resource_id} style={{ color: "#e0e0e0", fontFamily: "monospace", fontSize: "0.8rem", marginBottom: "0.25rem" }}>
                              • {r.resource_name}: {r.quantity_obtained}
                            </p>
                          ))}
                        </div>
                      )}

                      {/* Panel de recuento — solo cuando ya regresaron */}
                      {canManage && returned && (
                        <div style={{ background: "rgba(255,170,0,0.06)", border: "1px solid #ffaa00", borderRadius: "8px", padding: "1.25rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                            <Package size={16} color="#ffaa00" />
                            <p style={{ color: "#ffaa00", fontFamily: "monospace", fontSize: "0.9rem", fontWeight: "bold" }}>
                              Recuento de materiales encontrados
                            </p>
                          </div>
                          <p style={{ color: "#888", fontFamily: "monospace", fontSize: "0.8rem", marginBottom: "1rem" }}>
                            Registrá los recursos que trajo el grupo. Al completar, se sumarán al inventario del campamento.
                          </p>

                          {recountLines.length > 0 && (
                            <div style={{ marginBottom: "1rem" }}>
                              {recountLines.map((line) => (
                                <div key={line.resource_id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem 0.75rem", background: "#1a1a1a", borderRadius: "6px", marginBottom: "0.5rem" }}>
                                  <span style={{ flex: 1, color: "#e0e0e0", fontFamily: "monospace", fontSize: "0.85rem" }}>{line.resource_name}</span>
                                  <span style={{ color: "#ffaa00", fontFamily: "monospace", fontSize: "0.9rem", fontWeight: "bold" }}>+{line.quantity}</span>
                                  <button onClick={() => handleRemoveRecountLine(line.resource_id)} style={{ background: "transparent", border: "none", color: "#ff3333", cursor: "pointer", padding: "2px" }}>
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                            <select
                              value={recountResourceId}
                              onChange={(e) => setRecountResourceId(e.target.value)}
                              style={{ flex: 1, background: "#0a0a0a", border: "1px solid #444", borderRadius: "4px", padding: "0.4rem 0.5rem", color: "#e0e0e0", fontFamily: "monospace", fontSize: "0.8rem", minWidth: "140px" }}
                            >
                              <option value="">Seleccionar recurso</option>
                              {resources.map(r => (
                                <option key={r.resource_id} value={r.resource_id}>{r.name}</option>
                              ))}
                            </select>
                            <input
                              type="number"
                              placeholder="Cantidad"
                              value={recountQuantity}
                              min="1"
                              onChange={(e) => setRecountQuantity(e.target.value)}
                              style={{ background: "#0a0a0a", border: "1px solid #444", borderRadius: "4px", padding: "0.4rem 0.5rem", color: "#e0e0e0", fontFamily: "monospace", fontSize: "0.8rem", width: "90px" }}
                            />
                            <button
                              onClick={handleAddRecountLine}
                              disabled={!recountResourceId || !recountQuantity}
                              style={{ background: recountResourceId && recountQuantity ? "#ffaa00" : "#333", color: recountResourceId && recountQuantity ? "#0a0a0a" : "#666", border: "none", padding: "0.4rem 0.9rem", borderRadius: "4px", cursor: recountResourceId && recountQuantity ? "pointer" : "not-allowed", fontFamily: "monospace", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.3rem" }}
                            >
                              <Plus size={13} /> Agregar
                            </button>
                          </div>

                          {completeError && (
                            <p style={{ color: "#ff3333", fontFamily: "monospace", fontSize: "0.8rem", marginBottom: "0.75rem" }}>⚠️ {completeError}</p>
                          )}

                          <button
                            onClick={() => handleCompleteExpedition(exp.exploration_id)}
                            disabled={completing || recountLines.length === 0}
                            style={{ width: "100%", background: completing || recountLines.length === 0 ? "#1a1a1a" : "rgba(0,255,65,0.12)", border: `1px solid ${completing || recountLines.length === 0 ? "#333" : "#00ff41"}`, color: completing || recountLines.length === 0 ? "#555" : "#00ff41", padding: "0.75rem", borderRadius: "6px", cursor: completing || recountLines.length === 0 ? "not-allowed" : "pointer", fontFamily: "monospace", fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
                          >
                            <CheckCircle size={16} />
                            {completing ? "Completando expedición..." : "Completar expedición y sumar al inventario"}
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Modal nueva expedición */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
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
                    <label style={{ color: "#888", fontFamily: "monospace", fontSize: "0.85rem" }}>Fecha de salida *</label>
                    <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                      style={{ width: "100%", background: "#0a0a0a", border: "1px solid #333", borderRadius: "6px", padding: "0.5rem", color: "#e0e0e0", fontFamily: "monospace", marginTop: "0.25rem", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ color: "#888", fontFamily: "monospace", fontSize: "0.85rem" }}>Fecha estimada de regreso *</label>
                    <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                      style={{ width: "100%", background: "#0a0a0a", border: "1px solid #333", borderRadius: "6px", padding: "0.5rem", color: "#e0e0e0", fontFamily: "monospace", marginTop: "0.25rem", boxSizing: "border-box" }}
                    />
                  </div>
                  <p style={{ color: "#555", fontFamily: "monospace", fontSize: "0.75rem" }}>
                    El panel de recuento se habilitará automáticamente cuando llegue la fecha de regreso.
                  </p>
                  <button onClick={handleCreate} disabled={submitting}
                    style={{ background: submitting ? "#333" : "#008f11", color: "#fff", border: "none", padding: "0.75rem", borderRadius: "8px", cursor: submitting ? "not-allowed" : "pointer", fontFamily: "monospace", fontWeight: "bold", fontSize: "1rem" }}
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
