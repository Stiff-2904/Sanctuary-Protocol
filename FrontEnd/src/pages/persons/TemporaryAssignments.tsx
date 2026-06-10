import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shuffle, Plus, X, Clock, History, CheckCircle } from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

interface Assignment {
  assignment_id: number;
  person_id: number;
  person_name: string;
  original_profession_id: number;
  original_profession: string;
  temporary_profession_id: number;
  temporary_profession: string;
  start_date: string;
  end_date: string | null;
}

interface Person {
  person_id: number;
  name: string;
  profession_name?: string;
  health_status: string;
  status: string;
}

interface Profession {
  profession_id: number;
  name: string;
}

function getActiveCampId(userCampId?: number | null): number | null {
  const savedCamp = localStorage.getItem("selected_camp");
  if (savedCamp) return JSON.parse(savedCamp).camp_id;
  return userCampId ?? null;
}

export default function TemporaryAssignments() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [history, setHistory] = useState<Assignment[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [professions, setProfessions] = useState<Profession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ person_id: "", temporary_profession_id: "" });
  const [submitting, setSubmitting] = useState(false);
  const [endingId, setEndingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const campId = getActiveCampId(user?.camp_id);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [assignRes, historyRes, personRes, profRes] = await Promise.all([
        api.get("/temporary-assignments"),
        api.get("/temporary-assignments/history"),
        api.get(`/persons${campId ? `?camp_id=${campId}` : ""}`),
        api.get("/professions"),
      ]);
      setAssignments(assignRes.data);
      setHistory(historyRes.data);
      setPersons(personRes.data);
      setProfessions(profRes.data);
    } catch {
      setError("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async () => {
    if (!form.person_id || !form.temporary_profession_id) {
      alert("Selecciona una persona y una profesión temporal");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/temporary-assignments", {
        person_id: parseInt(form.person_id),
        temporary_profession_id: parseInt(form.temporary_profession_id),
      });
      setShowForm(false);
      setForm({ person_id: "", temporary_profession_id: "" });
      fetchData();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Error al crear la asignación";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEnd = async (assignmentId: number) => {
    setEndingId(assignmentId);
    try {
      await api.patch(`/temporary-assignments/${assignmentId}/end`);
      fetchData();
    } catch {
      alert("Error al finalizar la asignación");
    } finally {
      setEndingId(null);
    }
  };

  // Personas sin asignación activa
  const activeAssignedPersonIds = assignments.map((a) => a.person_id);
  const availablePersons = persons.filter(
    (p) =>
      !activeAssignedPersonIds.includes(p.person_id) &&
      p.health_status === "healthy" &&
      p.status === "active"
  );

  const selectedPerson = persons.find(
    (p) => p.person_id === parseInt(form.person_id)
  );
  const availableProfessions = professions.filter(
    (pr) => pr.name !== selectedPerson?.profession_name
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", padding: "2rem" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <h1 style={{ color: "#ffaa00", fontFamily: "monospace" }}>
            🔄 Reasignaciones Temporales
          </h1>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              onClick={() => setShowHistory(!showHistory)}
              style={{
                background: "transparent",
                border: "1px solid #444",
                color: "#888",
                padding: "0.6rem 1rem",
                borderRadius: "8px",
                cursor: "pointer",
                fontFamily: "monospace",
                fontSize: "0.85rem",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              <History size={14} />
              {showHistory ? "Ver activas" : "Ver historial"}
            </button>
            <button
              onClick={() => setShowForm(true)}
              style={{
                background: "#ffaa00",
                color: "#0a0a0a",
                border: "none",
                padding: "0.6rem 1.2rem",
                borderRadius: "8px",
                cursor: "pointer",
                fontFamily: "monospace",
                fontWeight: "bold",
                fontSize: "0.9rem",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              <Plus size={16} /> Nueva Reasignación
            </button>
          </div>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          {[
            {
              label: "Activas",
              value: assignments.length,
              color: "#ffaa00",
              emoji: "🔄",
            },
            {
              label: "Historial total",
              value: history.length,
              color: "#00aaff",
              emoji: "📋",
            },
            {
              label: "Completadas",
              value: history.filter((h) => h.end_date !== null).length,
              color: "#00ff41",
              emoji: "✅",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "#1a1a1a",
                border: `1px solid ${stat.color}33`,
                borderRadius: "8px",
                padding: "1rem",
              }}
            >
              <p style={{ fontSize: "1.2rem", marginBottom: "0.2rem" }}>
                {stat.emoji}
              </p>
              <p
                style={{
                  color: "#888",
                  fontSize: "0.8rem",
                  fontFamily: "monospace",
                }}
              >
                {stat.label}
              </p>
              <p
                style={{
                  color: stat.color,
                  fontSize: "1.5rem",
                  fontFamily: "monospace",
                  fontWeight: "bold",
                }}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Lista */}
        <div
          style={{
            background: "#1a1a1a",
            borderRadius: "12px",
            padding: "1.5rem",
          }}
        >
          <h2
            style={{
              color: "#e0e0e0",
              fontFamily: "monospace",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "1rem",
            }}
          >
            {showHistory ? (
              <>
                <History size={16} color="#00aaff" /> Historial de reasignaciones
              </>
            ) : (
              <>
                <Shuffle size={16} color="#ffaa00" /> Reasignaciones activas
              </>
            )}
          </h2>

          {loading && (
            <p style={{ color: "#ffaa00", fontFamily: "monospace" }}>
              Cargando...
            </p>
          )}
          {error && (
            <p style={{ color: "#ff3333", fontFamily: "monospace" }}>{error}</p>
          )}

          {!loading && !error && (showHistory ? history : assignments).length === 0 && (
            <p style={{ color: "#666", fontFamily: "monospace" }}>
              {showHistory
                ? "No hay historial de reasignaciones."
                : "No hay reasignaciones activas en este momento."}
            </p>
          )}

          {(showHistory ? history : assignments).map((a, index) => (
            <motion.div
              key={a.assignment_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04 }}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1rem",
                borderBottom: "1px solid #2a2a2a",
                flexWrap: "wrap",
                gap: "0.75rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "#0a0a0a",
                    border: `1px solid ${a.end_date ? "#444" : "#ffaa00"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1rem",
                    flexShrink: 0,
                  }}
                >
                  {a.end_date ? "✅" : "🔄"}
                </div>
                <div>
                  <p
                    style={{
                      color: "#e0e0e0",
                      fontFamily: "monospace",
                      marginBottom: "0.2rem",
                    }}
                  >
                    {a.person_name}
                  </p>
                  <p
                    style={{
                      color: "#888",
                      fontSize: "0.78rem",
                      fontFamily: "monospace",
                    }}
                  >
                    <span style={{ color: "#666" }}>{a.original_profession}</span>
                    {" → "}
                    <span style={{ color: "#ffaa00" }}>{a.temporary_profession}</span>
                  </p>
                  <p
                    style={{
                      color: "#555",
                      fontSize: "0.72rem",
                      fontFamily: "monospace",
                      marginTop: "0.1rem",
                    }}
                  >
                    <Clock size={10} style={{ display: "inline", marginRight: "0.25rem" }} />
                    Desde: {new Date(a.start_date).toLocaleDateString()}
                    {a.end_date
                      ? ` — Hasta: ${new Date(a.end_date).toLocaleDateString()}`
                      : ""}
                  </p>
                </div>
              </div>

              {!a.end_date && !showHistory && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleEnd(a.assignment_id)}
                  disabled={endingId === a.assignment_id}
                  style={{
                    background: "transparent",
                    border: "1px solid #00ff41",
                    color: "#00ff41",
                    padding: "0.4rem 0.9rem",
                    borderRadius: "6px",
                    cursor: endingId === a.assignment_id ? "not-allowed" : "pointer",
                    fontFamily: "monospace",
                    fontSize: "0.8rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    opacity: endingId === a.assignment_id ? 0.5 : 1,
                  }}
                >
                  <CheckCircle size={12} />
                  {endingId === a.assignment_id ? "Finalizando..." : "Finalizar"}
                </motion.button>
              )}

              {a.end_date && (
                <span
                  style={{
                    color: "#444",
                    fontFamily: "monospace",
                    fontSize: "0.78rem",
                  }}
                >
                  Completada
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Modal nueva reasignación */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.85)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 100,
              padding: "1rem",
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                background: "#1a1a1a",
                border: "1px solid #ffaa00",
                borderRadius: "12px",
                padding: "2rem",
                width: "100%",
                maxWidth: "460px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1.5rem",
                }}
              >
                <h2 style={{ color: "#ffaa00", fontFamily: "monospace" }}>
                  🔄 Nueva Reasignación
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setForm({ person_id: "", temporary_profession_id: "" });
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#888",
                    cursor: "pointer",
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              <p
                style={{
                  color: "#666",
                  fontFamily: "monospace",
                  fontSize: "0.8rem",
                  marginBottom: "1.5rem",
                  borderLeft: "2px solid #ffaa00",
                  paddingLeft: "0.75rem",
                }}
              >
                Solo personas activas y saludables sin asignación activa están disponibles.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {/* Persona */}
                <div>
                  <label
                    style={{
                      color: "#888",
                      fontFamily: "monospace",
                      fontSize: "0.85rem",
                      display: "block",
                      marginBottom: "0.4rem",
                    }}
                  >
                    Persona a reasignar *
                  </label>
                  <select
                    value={form.person_id}
                    onChange={(e) =>
                      setForm({ ...form, person_id: e.target.value, temporary_profession_id: "" })
                    }
                    style={{
                      width: "100%",
                      background: "#0a0a0a",
                      border: "1px solid #333",
                      borderRadius: "6px",
                      padding: "0.6rem 0.8rem",
                      color: "#e0e0e0",
                      fontFamily: "monospace",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="">— Seleccionar persona —</option>
                    {availablePersons.map((p) => (
                      <option key={p.person_id} value={p.person_id}>
                        {p.name} ({p.profession_name ?? "Sin profesión"})
                      </option>
                    ))}
                  </select>
                  {availablePersons.length === 0 && (
                    <p
                      style={{
                        color: "#ff6600",
                        fontFamily: "monospace",
                        fontSize: "0.75rem",
                        marginTop: "0.4rem",
                      }}
                    >
                      No hay personas disponibles para reasignar.
                    </p>
                  )}
                </div>

                {/* Profesión temporal */}
                <div>
                  <label
                    style={{
                      color: "#888",
                      fontFamily: "monospace",
                      fontSize: "0.85rem",
                      display: "block",
                      marginBottom: "0.4rem",
                    }}
                  >
                    Profesión temporal *
                  </label>
                  <select
                    value={form.temporary_profession_id}
                    onChange={(e) =>
                      setForm({ ...form, temporary_profession_id: e.target.value })
                    }
                    disabled={!form.person_id}
                    style={{
                      width: "100%",
                      background: "#0a0a0a",
                      border: "1px solid #333",
                      borderRadius: "6px",
                      padding: "0.6rem 0.8rem",
                      color: form.person_id ? "#e0e0e0" : "#555",
                      fontFamily: "monospace",
                      boxSizing: "border-box",
                      cursor: form.person_id ? "pointer" : "not-allowed",
                    }}
                  >
                    <option value="">— Seleccionar profesión —</option>
                    {availableProfessions.map((pr) => (
                      <option key={pr.profession_id} value={pr.profession_id}>
                        {pr.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Preview */}
                {selectedPerson && form.temporary_profession_id && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: "#0a0a0a",
                      border: "1px solid #ffaa0044",
                      borderRadius: "8px",
                      padding: "0.75rem 1rem",
                      fontFamily: "monospace",
                      fontSize: "0.82rem",
                    }}
                  >
                    <p style={{ color: "#888", marginBottom: "0.3rem" }}>Vista previa del cambio:</p>
                    <p style={{ color: "#e0e0e0" }}>
                      <span style={{ color: "#666" }}>{selectedPerson.profession_name ?? "Sin profesión"}</span>
                      {" "}→{" "}
                      <span style={{ color: "#ffaa00" }}>
                        {professions.find(
                          (pr) => pr.profession_id === parseInt(form.temporary_profession_id)
                        )?.name}
                      </span>
                    </p>
                  </motion.div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreate}
                  disabled={submitting}
                  style={{
                    background: submitting ? "#333" : "#ffaa00",
                    color: "#0a0a0a",
                    border: "none",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    cursor: submitting ? "not-allowed" : "pointer",
                    fontFamily: "monospace",
                    fontWeight: "bold",
                    fontSize: "1rem",
                  }}
                >
                  {submitting ? "Reasignando..." : "Confirmar Reasignación"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
