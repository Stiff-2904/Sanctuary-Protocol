import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Map, Plus, X, Users, Package, ChevronDown, ChevronUp,
  CheckCircle, ClipboardList, AlertTriangle, ArrowRight, Trash2,
} from "lucide-react";
import api from "../../services/api";

// ─── Types ────────────────────────────────────────────────────────────────────

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
  status: string;
}

interface Resource {
  resource_id: number;
  name: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  active: "#00ff41",
  completed: "#00aaff",
  cancelled: "#ff3333",
};

const STATUS_LABEL: Record<string, string> = {
  active: "En curso",
  completed: "Completada",
  cancelled: "Cancelada",
};

const fmt = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("es-CR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const isExpeditionDue = (exp: Exploration) => {
  if (!exp.end_date || exp.status !== "active") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(exp.end_date);
  end.setHours(0, 0, 0, 0);
  return end <= today;
};

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  background: "#0a0a0a",
  border: "1px solid #333",
  borderRadius: "6px",
  padding: "0.5rem 0.75rem",
  color: "#e0e0e0",
  fontFamily: "monospace",
  fontSize: "0.85rem",
  width: "100%",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  color: "#888",
  fontFamily: "monospace",
  fontSize: "0.8rem",
  display: "block",
  marginBottom: "0.3rem",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function Expeditions() {
  const [explorations, setExplorations] = useState<Exploration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Creation wizard
  const [showForm, setShowForm] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2>(1);
  const [form, setForm] = useState({ start_date: "", end_date: "" });
  const [formError, setFormError] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<number | null>(null);
  const [selectedPersonIds, setSelectedPersonIds] = useState<number[]>([]);
  const [submittingDates, setSubmittingDates] = useState(false);
  const [submittingPersons, setSubmittingPersons] = useState(false);

  // Expanded detail
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<ExplorationDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Recount / complete
  const [recountMode, setRecountMode] = useState<number | null>(null);
  const [addResourceId, setAddResourceId] = useState("");
  const [addQuantity, setAddQuantity] = useState("");
  const [addingResource, setAddingResource] = useState(false);
  const [completing, setCompleting] = useState(false);

  // Catalogs
  const [persons, setPersons] = useState<Person[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);

  const savedCamp = localStorage.getItem("selected_camp");
  const campId = savedCamp ? JSON.parse(savedCamp).camp_id : 1;

  // Only active persons can go on expeditions
  const availablePersons = persons.filter((p) => p.status === "active");

  // ── Fetchers ────────────────────────────────────────────────────────────────

  const fetchExplorations = () => {
    setLoading(true);
    api
      .get(`/explorations?camp_id=${campId}`)
      .then((res) => setExplorations(res.data))
      .catch(() => setError("Error al cargar las expediciones"))
      .finally(() => setLoading(false));
  };

  const fetchCatalogs = () => {
    api.get(`/persons?camp_id=${campId}`).then((res) => setPersons(res.data));
    api.get("/resources").then((res) => setResources(res.data));
  };

  const fetchDetail = async (id: number) => {
    setDetailLoading(true);
    try {
      const res = await api.get(`/explorations/${id}`);
      setDetail(res.data);
    } catch {
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchExplorations();
    fetchCatalogs();
  }, []);

  // ── Expand / collapse ───────────────────────────────────────────────────────

  const handleExpand = (id: number) => {
    if (expandedId === id) {
      setExpandedId(null);
      setDetail(null);
      setRecountMode(null);
      return;
    }
    setExpandedId(id);
    fetchDetail(id);
  };

  // ── Wizard: Step 1 — dates ──────────────────────────────────────────────────

  const openForm = () => {
    setForm({ start_date: "", end_date: "" });
    setSelectedPersonIds([]);
    setFormError(null);
    setCreatedId(null);
    setWizardStep(1);
    setShowForm(true);
  };

  const handleCreateDates = async () => {
    setFormError(null);
    if (!form.start_date || !form.end_date) {
      setFormError("Ambas fechas son obligatorias.");
      return;
    }
    if (form.end_date < form.start_date) {
      setFormError("La fecha de regreso no puede ser anterior a la de salida.");
      return;
    }
    setSubmittingDates(true);
    try {
      const res = await api.post("/explorations", {
        camp_id: campId,
        start_date: form.start_date,
        end_date: form.end_date,
        status: "active",
      });
      setCreatedId(res.data.exploration_id);
      setWizardStep(2);
    } catch {
      setFormError("Error al crear la expedición. Intente de nuevo.");
    } finally {
      setSubmittingDates(false);
    }
  };

  // ── Wizard: Step 2 — participants ───────────────────────────────────────────

  const togglePerson = (id: number) => {
    setSelectedPersonIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleConfirmParticipants = async () => {
    if (!createdId) return;
    if (selectedPersonIds.length === 0) {
      // Allow finishing with no participants
      closeFormAndRefresh();
      return;
    }
    setSubmittingPersons(true);
    const errors: string[] = [];
    for (const pid of selectedPersonIds) {
      try {
        await api.post(`/explorations/${createdId}/persons`, { person_id: pid });
      } catch (err: unknown) {
        const msg =
          err && typeof err === "object" && "response" in err
            ? (err as { response: { data: { message: string } } }).response?.data?.message
            : null;
        const personName = persons.find((p) => p.person_id === pid)?.name ?? `#${pid}`;
        errors.push(`${personName}: ${msg ?? "error desconocido"}`);
      }
    }
    setSubmittingPersons(false);
    if (errors.length > 0) {
      setFormError(`Algunos participantes no pudieron asignarse:\n${errors.join("\n")}`);
      // Still close & refresh so partial assignments are visible
      setTimeout(closeFormAndRefresh, 3000);
    } else {
      closeFormAndRefresh();
    }
  };

  const closeFormAndRefresh = () => {
    setShowForm(false);
    setCreatedId(null);
    setSelectedPersonIds([]);
    fetchExplorations();
    fetchCatalogs(); // refresh so assigned persons no longer show as available
  };

  // ── Recount: add resource ───────────────────────────────────────────────────

  const handleAddResource = async (explorationId: number) => {
    if (!addResourceId || !addQuantity || Number(addQuantity) <= 0) {
      alert("Seleccioná un recurso y una cantidad válida.");
      return;
    }
    setAddingResource(true);
    try {
      await api.post(`/explorations/${explorationId}/resources`, {
        resource_id: parseInt(addResourceId),
        quantity_obtained: parseFloat(addQuantity),
      });
      setAddResourceId("");
      setAddQuantity("");
      await fetchDetail(explorationId);
    } catch {
      alert("Error al registrar el recurso.");
    } finally {
      setAddingResource(false);
    }
  };

  // ── Complete exploration ────────────────────────────────────────────────────

  const handleComplete = async (explorationId: number) => {
    if (
      !window.confirm(
        "¿Confirmar el regreso? Los recursos del recuento se agregarán al inventario y los participantes volverán al campamento."
      )
    )
      return;
    setCompleting(true);
    try {
      await api.post(`/explorations/${explorationId}/complete`);
      setRecountMode(null);
      fetchExplorations();
      fetchCatalogs();
      await fetchDetail(explorationId);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response: { data: { message: string } } }).response?.data?.message
          : null;
      alert(msg ?? "Error al completar la expedición.");
    } finally {
      setCompleting(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  const stats = [
    { label: "Total", value: explorations.length, color: "#008f11" },
    { label: "En curso", value: explorations.filter((e) => e.status === "active").length, color: "#00ff41" },
    { label: "Completadas", value: explorations.filter((e) => e.status === "completed").length, color: "#00aaff" },
    { label: "Canceladas", value: explorations.filter((e) => e.status === "cancelled").length, color: "#ff3333" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", padding: "2rem" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <h1 style={{ color: "#008f11", fontFamily: "monospace", margin: 0 }}>🗺️ Expediciones</h1>
          <button
            onClick={openForm}
            style={{
              background: "#008f11", color: "#fff", border: "none",
              padding: "0.75rem 1.5rem", borderRadius: "8px", cursor: "pointer",
              fontFamily: "monospace", fontWeight: "bold",
              display: "flex", alignItems: "center", gap: "0.5rem",
            }}
          >
            <Plus size={16} /> Nueva Expedición
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          {stats.map((s) => (
            <div key={s.label} style={{ background: "#1a1a1a", padding: "1rem", borderRadius: "8px", border: `1px solid ${s.color}33` }}>
              <p style={{ color: "#888", fontSize: "0.8rem", margin: "0 0 0.25rem" }}>{s.label}</p>
              <p style={{ color: s.color, fontSize: "1.6rem", fontFamily: "monospace", margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* List */}
        <div style={{ background: "#1a1a1a", borderRadius: "12px", padding: "1.5rem" }}>
          <h2 style={{ color: "#e0e0e0", fontFamily: "monospace", marginTop: 0, marginBottom: "1rem" }}>📋 Registro</h2>

          {loading && <p style={{ color: "#008f11", fontFamily: "monospace" }}>Cargando...</p>}
          {error && <p style={{ color: "#ff3333", fontFamily: "monospace" }}>{error}</p>}
          {!loading && !error && explorations.length === 0 && (
            <p style={{ color: "#666", fontFamily: "monospace" }}>No hay expediciones registradas.</p>
          )}

          {explorations.map((exp, index) => {
            const due = isExpeditionDue(exp);
            const isExpanded = expandedId === exp.exploration_id;

            return (
              <motion.div
                key={exp.exploration_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04 }}
                style={{ borderBottom: "1px solid #2a2a2a" }}
              >
                {/* Row */}
                <div
                  onClick={() => handleExpand(exp.exploration_id)}
                  style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "1rem", gap: "1rem", flexWrap: "wrap", cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <Map size={20} color={STATUS_COLOR[exp.status] ?? "#888"} />
                    <div>
                      <p style={{ color: "#e0e0e0", fontFamily: "monospace", margin: "0 0 0.2rem" }}>
                        {exp.camp_name}
                        {due && (
                          <span style={{ marginLeft: "0.75rem", color: "#ffaa00", fontSize: "0.75rem" }}>
                            ⚠ Regreso pendiente
                          </span>
                        )}
                      </p>
                      <p style={{ color: "#888", fontSize: "0.78rem", margin: 0 }}>
                        {exp.start_date ? fmt(exp.start_date) : "—"}
                        {" → "}
                        {exp.end_date ? fmt(exp.end_date) : "Sin fecha fin"}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                    <span style={{ color: STATUS_COLOR[exp.status] ?? "#888", fontFamily: "monospace", fontSize: "0.8rem" }}>
                      ● {STATUS_LABEL[exp.status] ?? exp.status}
                    </span>
                    {isExpanded ? <ChevronUp size={16} color="#888" /> : <ChevronDown size={16} color="#888" />}
                  </div>
                </div>

                {/* Detail panel */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      key="detail"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ background: "#0f0f0f", borderTop: "1px solid #222", overflow: "hidden" }}
                    >
                      {detailLoading ? (
                        <p style={{ color: "#666", fontFamily: "monospace", padding: "1rem", fontSize: "0.85rem" }}>Cargando detalle...</p>
                      ) : detail ? (
                        <div style={{ padding: "1.25rem" }}>

                          {/* Persons */}
                          <Section icon={<Users size={15} color="#00ff41" />} title="Participantes" titleColor="#00ff41">
                            {detail.persons.length === 0 ? (
                              <p style={{ color: "#555", fontFamily: "monospace", fontSize: "0.8rem" }}>Sin personas asignadas</p>
                            ) : (
                              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 0.5rem" }}>
                                {detail.persons.map((p) => (
                                  <li key={p.person_id} style={{ color: "#ccc", fontFamily: "monospace", fontSize: "0.8rem", marginBottom: "0.2rem" }}>
                                    • {p.name}{" "}
                                    <span style={{ color: p.status === "out_of_camp" ? "#ffaa00" : "#555", fontSize: "0.75rem" }}>
                                      ({p.status === "out_of_camp" ? "fuera del campamento" : p.status})
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </Section>

                          {/* Recount — active expeditions */}
                          {exp.status === "active" && (
                            <Section icon={<ClipboardList size={15} color="#ffaa00" />} title="Recuento de recursos al regreso" titleColor="#ffaa00">
                              {(due || recountMode === exp.exploration_id) ? (
                                <>
                                  {due && (
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                                      <AlertTriangle size={14} color="#ffaa00" />
                                      <p style={{ color: "#ffaa00", fontFamily: "monospace", fontSize: "0.8rem", margin: 0 }}>
                                        La expedición llegó a su fecha de regreso. Registrá los recursos recolectados y confirmá el regreso.
                                      </p>
                                    </div>
                                  )}

                                  {detail.resources.length > 0 && (
                                    <ul style={{ listStyle: "none", padding: 0, margin: "0 0 0.75rem" }}>
                                      {detail.resources.map((r) => (
                                        <li key={r.resource_id} style={{ color: "#ccc", fontFamily: "monospace", fontSize: "0.8rem", marginBottom: "0.2rem" }}>
                                          • {r.resource_name}:{" "}
                                          <span style={{ color: "#ffaa00" }}>{r.quantity_obtained}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}

                                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                                    <select
                                      value={addResourceId}
                                      onChange={(e) => setAddResourceId(e.target.value)}
                                      style={{ ...inputStyle, width: "auto", flex: 1, minWidth: "150px" }}
                                    >
                                      <option value="">Seleccionar recurso</option>
                                      {resources.map((r) => (
                                        <option key={r.resource_id} value={r.resource_id}>{r.name}</option>
                                      ))}
                                    </select>
                                    <input
                                      type="number"
                                      min="1"
                                      placeholder="Cantidad"
                                      value={addQuantity}
                                      onChange={(e) => setAddQuantity(e.target.value)}
                                      style={{ ...inputStyle, width: "90px" }}
                                    />
                                    <SmallBtn color="#ffaa00" textColor="#0a0a0a" disabled={addingResource} onClick={() => handleAddResource(exp.exploration_id)}>
                                      {addingResource ? "..." : "Agregar"}
                                    </SmallBtn>
                                  </div>

                                  <button
                                    disabled={completing}
                                    onClick={() => handleComplete(exp.exploration_id)}
                                    style={{
                                      display: "flex", alignItems: "center", gap: "0.5rem",
                                      background: completing ? "#333" : "#008f11",
                                      color: "#fff", border: "none",
                                      padding: "0.6rem 1.25rem", borderRadius: "6px",
                                      cursor: completing ? "not-allowed" : "pointer",
                                      fontFamily: "monospace", fontWeight: "bold", fontSize: "0.85rem",
                                    }}
                                  >
                                    <CheckCircle size={15} />
                                    {completing ? "Procesando..." : "Confirmar regreso y cerrar expedición"}
                                  </button>
                                </>
                              ) : (
                                <div>
                                  <p style={{ color: "#555", fontFamily: "monospace", fontSize: "0.8rem", marginBottom: "0.75rem" }}>
                                    La expedición está en curso. El recuento se habilita automáticamente al llegar la fecha de regreso.
                                  </p>
                                  <SmallBtn color="#ffaa00" textColor="#0a0a0a" onClick={() => setRecountMode(exp.exploration_id)}>
                                    Registrar regreso anticipado
                                  </SmallBtn>
                                </div>
                              )}
                            </Section>
                          )}

                          {/* Completed summary */}
                          {exp.status === "completed" && (
                            <Section icon={<Package size={15} color="#00aaff" />} title="Recursos recolectados" titleColor="#00aaff">
                              {detail.resources.length === 0 ? (
                                <p style={{ color: "#555", fontFamily: "monospace", fontSize: "0.8rem" }}>No se registraron recursos.</p>
                              ) : (
                                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                                  {detail.resources.map((r) => (
                                    <li key={r.resource_id} style={{ color: "#ccc", fontFamily: "monospace", fontSize: "0.8rem", marginBottom: "0.25rem" }}>
                                      • {r.resource_name}: <span style={{ color: "#00aaff" }}>{r.quantity_obtained}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                              <p style={{ color: "#444", fontFamily: "monospace", fontSize: "0.75rem", marginTop: "0.75rem" }}>
                                ✅ Recursos ya sumados al inventario del campamento.
                              </p>
                            </Section>
                          )}

                        </div>
                      ) : (
                        <p style={{ color: "#ff3333", fontFamily: "monospace", padding: "1rem", fontSize: "0.85rem" }}>
                          Error al cargar el detalle.
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* ── Creation wizard modal ── */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)",
                display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 100, padding: "1rem",
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                style={{
                  background: "#1a1a1a", border: "1px solid #008f11",
                  borderRadius: "12px", padding: "2rem",
                  width: "100%", maxWidth: "460px",
                }}
              >
                {/* Modal header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <h2 style={{ color: "#008f11", fontFamily: "monospace", margin: 0 }}>
                    🗺️ Nueva Expedición
                  </h2>
                  <button onClick={() => setShowForm(false)} style={{ background: "transparent", border: "none", color: "#888", cursor: "pointer" }}>
                    <X size={20} />
                  </button>
                </div>

                {/* Step indicator */}
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
                  {[1, 2].map((s) => (
                    <div
                      key={s}
                      style={{
                        flex: 1, height: "3px", borderRadius: "2px",
                        background: wizardStep >= s ? "#008f11" : "#333",
                        transition: "background 0.3s",
                      }}
                    />
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {/* ── Step 1: Dates ── */}
                  {wizardStep === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <p style={{ color: "#888", fontFamily: "monospace", fontSize: "0.8rem", marginTop: 0, marginBottom: "1.25rem" }}>
                        Paso 1 de 2 — Fechas de la expedición
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div>
                          <label style={labelStyle}>Fecha de salida *</label>
                          <input
                            type="date"
                            value={form.start_date}
                            onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                            style={inputStyle}
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>Fecha de regreso *</label>
                          <input
                            type="date"
                            value={form.end_date}
                            min={form.start_date || undefined}
                            onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                            style={inputStyle}
                          />
                        </div>
                        {formError && (
                          <p style={{ color: "#ff3333", fontFamily: "monospace", fontSize: "0.8rem", margin: 0 }}>⚠ {formError}</p>
                        )}
                        <button
                          onClick={handleCreateDates}
                          disabled={submittingDates}
                          style={{
                            background: submittingDates ? "#333" : "#008f11", color: "#fff", border: "none",
                            padding: "0.75rem", borderRadius: "8px",
                            cursor: submittingDates ? "not-allowed" : "pointer",
                            fontFamily: "monospace", fontWeight: "bold", fontSize: "0.95rem",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                          }}
                        >
                          {submittingDates ? "Creando..." : (<>Siguiente <ArrowRight size={16} /></>)}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* ── Step 2: Participants ── */}
                  {wizardStep === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <p style={{ color: "#888", fontFamily: "monospace", fontSize: "0.8rem", marginTop: 0, marginBottom: "1rem" }}>
                        Paso 2 de 2 — Seleccioná los participantes
                      </p>

                      {availablePersons.length === 0 ? (
                        <p style={{ color: "#555", fontFamily: "monospace", fontSize: "0.85rem", marginBottom: "1rem" }}>
                          No hay personas disponibles en el campamento.
                        </p>
                      ) : (
                        <div style={{ maxHeight: "240px", overflowY: "auto", marginBottom: "1rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                          {availablePersons.map((p) => {
                            const selected = selectedPersonIds.includes(p.person_id);
                            return (
                              <div
                                key={p.person_id}
                                onClick={() => togglePerson(p.person_id)}
                                style={{
                                  display: "flex", justifyContent: "space-between", alignItems: "center",
                                  padding: "0.6rem 0.75rem", borderRadius: "6px", cursor: "pointer",
                                  background: selected ? "#002200" : "#111",
                                  border: `1px solid ${selected ? "#008f11" : "#2a2a2a"}`,
                                  transition: "all 0.15s",
                                }}
                              >
                                <span style={{ color: selected ? "#00ff41" : "#ccc", fontFamily: "monospace", fontSize: "0.85rem" }}>
                                  {p.name}
                                </span>
                                {selected && <CheckCircle size={14} color="#00ff41" />}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {selectedPersonIds.length > 0 && (
                        <p style={{ color: "#008f11", fontFamily: "monospace", fontSize: "0.78rem", margin: "0 0 0.75rem" }}>
                          {selectedPersonIds.length} participante{selectedPersonIds.length !== 1 ? "s" : ""} seleccionado{selectedPersonIds.length !== 1 ? "s" : ""}
                        </p>
                      )}

                      {formError && (
                        <p style={{ color: "#ff3333", fontFamily: "monospace", fontSize: "0.78rem", margin: "0 0 0.75rem", whiteSpace: "pre-line" }}>
                          ⚠ {formError}
                        </p>
                      )}

                      <div style={{ display: "flex", gap: "0.75rem" }}>
                        <button
                          onClick={closeFormAndRefresh}
                          style={{
                            flex: 1, background: "transparent", color: "#888",
                            border: "1px solid #333", padding: "0.65rem", borderRadius: "8px",
                            cursor: "pointer", fontFamily: "monospace", fontSize: "0.85rem",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem",
                          }}
                        >
                          <Trash2 size={14} /> Sin participantes
                        </button>
                        <button
                          onClick={handleConfirmParticipants}
                          disabled={submittingPersons || selectedPersonIds.length === 0}
                          style={{
                            flex: 2,
                            background: submittingPersons || selectedPersonIds.length === 0 ? "#333" : "#008f11",
                            color: submittingPersons || selectedPersonIds.length === 0 ? "#666" : "#fff",
                            border: "none", padding: "0.65rem", borderRadius: "8px",
                            cursor: submittingPersons || selectedPersonIds.length === 0 ? "not-allowed" : "pointer",
                            fontFamily: "monospace", fontWeight: "bold", fontSize: "0.9rem",
                          }}
                        >
                          {submittingPersons ? "Asignando..." : "Confirmar expedición"}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({ icon, title, titleColor, children }: {
  icon: React.ReactNode; title: string; titleColor: string; children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
        {icon}
        <p style={{ color: titleColor, fontFamily: "monospace", fontSize: "0.82rem", margin: 0, fontWeight: "bold" }}>
          {title}
        </p>
      </div>
      {children}
    </div>
  );
}

function SmallBtn({ children, color, textColor, onClick, disabled }: {
  children: React.ReactNode; color: string; textColor: string; onClick?: () => void; disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? "#333" : color,
        color: disabled ? "#888" : textColor,
        border: "none", padding: "0.35rem 0.9rem", borderRadius: "4px",
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "monospace", fontSize: "0.8rem", fontWeight: "bold", whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}
