import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, UserCheck, UserX, Plus, X, Brain } from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

interface Admission {
  request_id: number;
  name: string;
  birth_date: string;
  status: string;
  request_date: string;
}

interface AdmissionForm {
  name: string;
  birth_date: string;
  health_status: string;
  skills: string[];
  experience: string;
  physical_condition: string;
  medical_history: string;
  reason: string;
  camp_id: number;
}

const SKILLS_OPTIONS = [
  "Medicina",
  "Construcción",
  "Combate",
  "Cocina",
  "Mecánica",
  "Agricultura",
  "Comunicaciones",
  "Exploración",
];

function getActiveCampId(userId?: number | null): number {
  const savedCamp = localStorage.getItem("selected_camp");
  if (savedCamp) {
    try {
      return JSON.parse(savedCamp).camp_id;
    } catch {
      return 1;
    }
  }
  return userId ?? 1;
}

function buildInitialForm(campId: number): AdmissionForm {
  return {
    name: "",
    birth_date: "",
    health_status: "healthy",
    skills: [],
    experience: "",
    physical_condition: "",
    medical_history: "",
    reason: "",
    camp_id: campId,
  };
}

export default function Admission() {
  const { user } = useAuth();
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AdmissionForm>(() =>
    buildInitialForm(getActiveCampId(user?.camp_id)),
  );
  const [submitting, setSubmitting] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(
    null,
  );
  const [showAIDetails, setShowAIDetails] = useState(false);
  const [aiEvaluationDetails, setAiEvaluationDetails] = useState<any>(null);

  useEffect(() => {
    fetchAdmissions();
  }, []);

  const fetchAdmissions = () => {
    setLoading(true);
    const campId = getActiveCampId(user?.camp_id);
    api
      .get(`/admissions${campId ? `?camp_id=${campId}` : ""}`)
      .then((res) => setAdmissions(res.data.data ?? []))
      .catch(() => setError("Error al cargar las solicitudes"))
      .finally(() => setLoading(false));
  };

  const fetchAIEvaluation = async (requestId: number) => {
    try {
      const res = await api.get(`/admissions/${requestId}/evaluation`);
      setAiEvaluationDetails(res.data.data);
      setShowAIDetails(true);
    } catch (error) {
      console.error("Error al obtener evaluación de IA:", error);
      alert("No se pudo cargar la evaluación de IA");
    }
  };

  const openForm = () => {
    // Recalcular camp_id en el momento de abrir el formulario
    const campId = getActiveCampId(user?.camp_id);
    setForm(buildInitialForm(campId));
    setAiResult(null);
    setShowForm(true);
  };

  const toggleSkill = (skill: string) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.birth_date || !form.reason) {
      alert("Nombre, fecha de nacimiento y razón de ingreso son obligatorios");
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post("/admissions", form);
      setAiResult(res.data.data);
      fetchAdmissions();
    } catch {
      alert("Error al enviar la solicitud");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecide = async (
    id: number,
    decision: "approved" | "rejected",
  ) => {
    try {
      await api.patch(`/admissions/${id}/decide`, {
        final_decision: decision,
        user_override_reason:
          decision === "approved"
            ? "Aprobado por admin"
            : "Rechazado por admin",
      });
      fetchAdmissions();
    } catch {
      alert("Error al registrar la decisión");
    }
  };

  const statusColor: Record<string, string> = {
    pending_ai_review: "#ffaa00",
    approved: "#00ff41",
    rejected: "#ff3333",
  };

  const statusLabel: Record<string, string> = {
    pending_ai_review: "Pendiente revisión",
    approved: "Aprobado",
    rejected: "Rechazado",
  };

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
          }}
        >
          <h1 style={{ color: "#00ff41", fontFamily: "monospace" }}>
            👥 Admisión de Personas
          </h1>
          <button
            onClick={openForm}
            style={{
              background: "#00ff41",
              color: "#0a0a0a",
              border: "none",
              padding: "0.75rem 1.5rem",
              borderRadius: "8px",
              cursor: "pointer",
              fontFamily: "monospace",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Plus size={16} /> Nueva Solicitud
          </button>
        </div>

        {/* Estadísticas */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          {[
            {
              label: "Total",
              value: admissions.length,
              color: "#00ff41",
              icon: <Users size={20} color="#00ff41" />,
            },
            {
              label: "Aprobados",
              value: admissions.filter((a) => a.status === "approved").length,
              color: "#00ff41",
              icon: <UserCheck size={20} color="#00ff41" />,
            },
            {
              label: "Rechazados",
              value: admissions.filter((a) => a.status === "rejected").length,
              color: "#ff3333",
              icon: <UserX size={20} color="#ff3333" />,
            },
            {
              label: "Pendientes",
              value: admissions.filter((a) => a.status === "pending_ai_review")
                .length,
              color: "#ffaa00",
              icon: <Brain size={20} color="#ffaa00" />,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "#1a1a1a",
                padding: "1rem",
                borderRadius: "8px",
                border: `1px solid ${stat.color}`,
              }}
            >
              {stat.icon}
              <p
                style={{
                  color: "#888",
                  fontSize: "0.9rem",
                  marginTop: "0.5rem",
                }}
              >
                {stat.label}
              </p>
              <p
                style={{
                  color: stat.color,
                  fontSize: "1.5rem",
                  fontFamily: "monospace",
                }}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Lista de solicitudes */}
        <div
          style={{
            background: "#1a1a1a",
            borderRadius: "12px",
            padding: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          <h2
            style={{
              color: "#e0e0e0",
              fontFamily: "monospace",
              marginBottom: "1rem",
            }}
          >
            📋 Solicitudes
          </h2>

          {loading && (
            <p style={{ color: "#00ff41", fontFamily: "monospace" }}>
              Cargando...
            </p>
          )}
          {error && (
            <p style={{ color: "#ff3333", fontFamily: "monospace" }}>{error}</p>
          )}
          {!loading && !error && admissions.length === 0 && (
            <p style={{ color: "#666", fontFamily: "monospace" }}>
              No hay solicitudes registradas.
            </p>
          )}

          {admissions.map((admission, index) => (
            <motion.div
              key={admission.request_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1rem",
                borderBottom: "1px solid #333",
                gap: "1rem",
                flexWrap: "wrap",
              }}
            >
    <div>
      <p style={{ color: "#e0e0e0", fontFamily: "monospace" }}>
        {admission.name}
      </p>
      <p style={{ color: "#888", fontSize: "0.8rem" }}>
        {new Date(admission.birth_date).toLocaleDateString()} —{" "}
        {new Date(admission.request_date).toLocaleDateString()}
      </p>
    </div>
    <div
      style={{
        display: "flex",
        gap: "0.75rem",
        alignItems: "center",
      }}
    >
      <span
        style={{
          color: statusColor[admission.status] ?? "#888",
          fontFamily: "monospace",
          fontSize: "0.8rem",
        }}
      >
        ● {statusLabel[admission.status] ?? admission.status}
      </span>
      
      {/* NUEVO BOTÓN: Ver evaluación de IA */}
      <button
        onClick={() => fetchAIEvaluation(admission.request_id)}
        style={{
          background: "transparent",
          border: "1px solid #00aaff",
          color: "#00aaff",
          padding: "0.25rem 0.75rem",
          borderRadius: "4px",
          cursor: "pointer",
          fontFamily: "monospace",
          fontSize: "0.8rem",
          display: "flex",
          alignItems: "center",
          gap: "0.25rem",
        }}
        title="Ver evaluación completa de IA"
      >
        🤖 Ver IA
      </button>
      
      {admission.status === "pending_ai_review" && (
        <>
          <button
            onClick={() => handleDecide(admission.request_id, "approved")}
            style={{
              background: "transparent",
              border: "1px solid #00ff41",
              color: "#00ff41",
              padding: "0.25rem 0.75rem",
              borderRadius: "4px",
              cursor: "pointer",
              fontFamily: "monospace",
              fontSize: "0.8rem",
            }}
          >
            Aprobar
          </button>
          <button
            onClick={() => handleDecide(admission.request_id, "rejected")}
            style={{
              background: "transparent",
              border: "1px solid #ff3333",
              color: "#ff3333",
              padding: "0.25rem 0.75rem",
              borderRadius: "4px",
              cursor: "pointer",
              fontFamily: "monospace",
              fontSize: "0.8rem",
            }}
          >
            Rechazar
          </button>
        </>
      )}
    </div>
  </motion.div>
))}

        {/* Modal formulario */}
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
                  border: "1px solid #00ff41",
                  borderRadius: "12px",
                  padding: "2rem",
                  width: "100%",
                  maxWidth: "600px",
                  maxHeight: "90vh",
                  overflowY: "auto",
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
                  <h2 style={{ color: "#00ff41", fontFamily: "monospace" }}>
                    🧬 Nueva Solicitud de Admisión
                  </h2>
                  <button
                    onClick={() => setShowForm(false)}
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

                {aiResult && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: "#0a0a0a",
                      border: `1px solid ${
                        aiResult.ai_decision === "approved" ||
                        aiResult.ai_decision === "APROBADO"
                          ? "#00ff41"
                          : "#ff3333"
                      }`,
                      borderRadius: "8px",
                      padding: "1rem",
                      marginBottom: "1.5rem",
                    }}
                  >
                    <p
                      style={{
                        color: "#888",
                        fontFamily: "monospace",
                        fontSize: "0.8rem",
                        marginBottom: "0.5rem",
                      }}
                    >
                      🤖 Evaluación de IA
                    </p>
                    <p
                      style={{
                        color:
                          aiResult.ai_decision === "approved" ||
                          aiResult.ai_decision === "APROBADO"
                            ? "#00ff41"
                            : "#ff3333",
                        fontFamily: "monospace",
                        fontWeight: "bold",
                      }}
                    >
                      Decisión:{" "}
                      {aiResult.ai_decision === "approved" ||
                      aiResult.ai_decision === "APROBADO"
                        ? "✅ Aprobado"
                        : "❌ Rechazado"}
                    </p>
                    <p
                      style={{
                        color: "#888",
                        fontFamily: "monospace",
                        fontSize: "0.8rem",
                        marginTop: "0.25rem",
                      }}
                    >
                      Profesión sugerida: {aiResult.suggested_profession ?? "—"}
                    </p>
                    <p
                      style={{
                        color: "#888",
                        fontFamily: "monospace",
                        fontSize: "0.8rem",
                        marginTop: "0.25rem",
                      }}
                    >
                      Razonamiento: {aiResult.ai_reasoning ?? "—"}
                    </p>
                    <button
                      onClick={() => {
                        setShowForm(false);
                        setAiResult(null);
                      }}
                      style={{
                        marginTop: "1rem",
                        background: "#00ff41",
                        color: "#0a0a0a",
                        border: "none",
                        padding: "0.5rem 1rem",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontFamily: "monospace",
                        fontWeight: "bold",
                      }}
                    >
                      Ver en lista
                    </button>
                  </motion.div>
                )}

                {!aiResult && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          color: "#888",
                          fontFamily: "monospace",
                          fontSize: "0.85rem",
                        }}
                      >
                        Nombre completo *
                      </label>
                      <input
                        value={form.name}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                        style={{
                          width: "100%",
                          background: "#0a0a0a",
                          border: "1px solid #333",
                          borderRadius: "6px",
                          padding: "0.5rem",
                          color: "#e0e0e0",
                          fontFamily: "monospace",
                          marginTop: "0.25rem",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          color: "#888",
                          fontFamily: "monospace",
                          fontSize: "0.85rem",
                        }}
                      >
                        Fecha de nacimiento *
                      </label>
                      <input
                        type="date"
                        value={form.birth_date}
                        onChange={(e) =>
                          setForm({ ...form, birth_date: e.target.value })
                        }
                        style={{
                          width: "100%",
                          background: "#0a0a0a",
                          border: "1px solid #333",
                          borderRadius: "6px",
                          padding: "0.5rem",
                          color: "#e0e0e0",
                          fontFamily: "monospace",
                          marginTop: "0.25rem",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          color: "#888",
                          fontFamily: "monospace",
                          fontSize: "0.85rem",
                        }}
                      >
                        Estado de salud
                      </label>
                      <select
                        value={form.health_status}
                        onChange={(e) =>
                          setForm({ ...form, health_status: e.target.value })
                        }
                        style={{
                          width: "100%",
                          background: "#0a0a0a",
                          border: "1px solid #333",
                          borderRadius: "6px",
                          padding: "0.5rem",
                          color: "#e0e0e0",
                          fontFamily: "monospace",
                          marginTop: "0.25rem",
                        }}
                      >
                        <option value="">Selecciona un estado</option>
                        <option value="sano">🟢 Sano</option>
                        <option value="herido">
                          🟡 Herido (no infeccioso)
                        </option>
                        <option value="enfermo">
                          🟠 Enfermo (gripe, infección normal)
                        </option>
                        <option value="mordido">
                          🔴 Mordido / Sospechoso (Riesgo de infección)
                        </option>
                        <option value="infectado">
                          ☠️ Infectado (Zombie / Cuarentena)
                        </option>
                      </select>
                    </div>

                    <div>
                      <label
                        style={{
                          color: "#888",
                          fontFamily: "monospace",
                          fontSize: "0.85rem",
                        }}
                      >
                        Habilidades
                      </label>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "0.5rem",
                          marginTop: "0.5rem",
                        }}
                      >
                        {SKILLS_OPTIONS.map((skill) => (
                          <button
                            key={skill}
                            onClick={() => toggleSkill(skill)}
                            style={{
                              background: form.skills.includes(skill)
                                ? "#00ff41"
                                : "transparent",
                              color: form.skills.includes(skill)
                                ? "#0a0a0a"
                                : "#00ff41",
                              border: "1px solid #00ff41",
                              borderRadius: "4px",
                              padding: "0.25rem 0.75rem",
                              cursor: "pointer",
                              fontFamily: "monospace",
                              fontSize: "0.8rem",
                            }}
                          >
                            {skill}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label
                        style={{
                          color: "#888",
                          fontFamily: "monospace",
                          fontSize: "0.85rem",
                        }}
                      >
                        Experiencia
                      </label>
                      <textarea
                        value={form.experience}
                        onChange={(e) =>
                          setForm({ ...form, experience: e.target.value })
                        }
                        rows={2}
                        style={{
                          width: "100%",
                          background: "#0a0a0a",
                          border: "1px solid #333",
                          borderRadius: "6px",
                          padding: "0.5rem",
                          color: "#e0e0e0",
                          fontFamily: "monospace",
                          marginTop: "0.25rem",
                          resize: "vertical",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          color: "#888",
                          fontFamily: "monospace",
                          fontSize: "0.85rem",
                        }}
                      >
                        Condición física
                      </label>
                      <input
                        value={form.physical_condition}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            physical_condition: e.target.value,
                          })
                        }
                        style={{
                          width: "100%",
                          background: "#0a0a0a",
                          border: "1px solid #333",
                          borderRadius: "6px",
                          padding: "0.5rem",
                          color: "#e0e0e0",
                          fontFamily: "monospace",
                          marginTop: "0.25rem",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          color: "#888",
                          fontFamily: "monospace",
                          fontSize: "0.85rem",
                        }}
                      >
                        Historial médico
                      </label>
                      <textarea
                        value={form.medical_history}
                        onChange={(e) =>
                          setForm({ ...form, medical_history: e.target.value })
                        }
                        rows={2}
                        style={{
                          width: "100%",
                          background: "#0a0a0a",
                          border: "1px solid #333",
                          borderRadius: "6px",
                          padding: "0.5rem",
                          color: "#e0e0e0",
                          fontFamily: "monospace",
                          marginTop: "0.25rem",
                          resize: "vertical",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          color: "#888",
                          fontFamily: "monospace",
                          fontSize: "0.85rem",
                        }}
                      >
                        Razón de ingreso *
                      </label>
                      <textarea
                        value={form.reason}
                        onChange={(e) =>
                          setForm({ ...form, reason: e.target.value })
                        }
                        rows={3}
                        style={{
                          width: "100%",
                          background: "#0a0a0a",
                          border: "1px solid #333",
                          borderRadius: "6px",
                          padding: "0.5rem",
                          color: "#e0e0e0",
                          fontFamily: "monospace",
                          marginTop: "0.25rem",
                          resize: "vertical",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      style={{
                        background: submitting ? "#333" : "#00ff41",
                        color: "#0a0a0a",
                        border: "none",
                        padding: "0.75rem",
                        borderRadius: "8px",
                        cursor: submitting ? "not-allowed" : "pointer",
                        fontFamily: "monospace",
                        fontWeight: "bold",
                        fontSize: "1rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <Brain size={18} />
                      {submitting
                        ? "Evaluando con IA..."
                        : "Enviar a evaluación de IA"}
                    </button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Modal para ver detalles de la evaluación de IA */}
        <AnimatePresence>
          {showAIDetails && aiEvaluationDetails && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 200,
                padding: "1rem",
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                style={{
                  background: "#1a1a1a",
                  border: "1px solid #00ff41",
                  borderRadius: "12px",
                  padding: "2rem",
                  width: "100%",
                  maxWidth: "700px",
                  maxHeight: "90vh",
                  overflowY: "auto",
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
                  <h2 style={{ color: "#00ff41", fontFamily: "monospace" }}>
                    🤖 Evaluación Completa de IA
                  </h2>
                  <button
                    onClick={() => setShowAIDetails(false)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#888",
                      cursor: "pointer",
                    }}
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Decisión */}
                <div
                  style={{
                    background: "#0a0a0a",
                    border: `2px solid ${
                      aiEvaluationDetails.ai_decision === "APROBADO" ||
                      aiEvaluationDetails.ai_decision === "approved"
                        ? "#00ff41"
                        : "#ff3333"
                    }`,
                    borderRadius: "8px",
                    padding: "1rem",
                    marginBottom: "1.5rem",
                  }}
                >
                  <p
                    style={{
                      color: "#888",
                      fontSize: "0.85rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Decisión de la IA:
                  </p>
                  <p
                    style={{
                      color:
                        aiEvaluationDetails.ai_decision === "APROBADO" ||
                        aiEvaluationDetails.ai_decision === "approved"
                          ? "#00ff41"
                          : "#ff3333",
                      fontSize: "1.5rem",
                      fontFamily: "monospace",
                      fontWeight: "bold",
                    }}
                  >
                    {aiEvaluationDetails.ai_decision === "APROBADO" ||
                    aiEvaluationDetails.ai_decision === "approved"
                      ? "✅ APROBADO"
                      : "❌ RECHAZADO"}
                  </p>
                </div>

                {/* Nivel de confianza */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <p
                    style={{
                      color: "#888",
                      fontSize: "0.85rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Nivel de confianza:
                  </p>
                  <div
                    style={{
                      background: "#0a0a0a",
                      borderRadius: "4px",
                      padding: "0.5rem",
                      fontFamily: "monospace",
                      color: "#ffaa00",
                    }}
                  >
                    {aiEvaluationDetails.ai_confidence
                      ? `${(aiEvaluationDetails.ai_confidence * 100).toFixed(1)}%`
                      : "No disponible"}
                  </div>
                </div>

                {/* Profesión sugerida */}
                {aiEvaluationDetails.suggested_profession && (
                  <div style={{ marginBottom: "1.5rem" }}>
                    <p
                      style={{
                        color: "#888",
                        fontSize: "0.85rem",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Profesión sugerida:
                    </p>
                    <div
                      style={{
                        background: "#0a0a0a",
                        borderRadius: "4px",
                        padding: "0.5rem",
                        fontFamily: "monospace",
                        color: "#00ff41",
                      }}
                    >
                      {aiEvaluationDetails.suggested_profession}
                    </div>
                    {aiEvaluationDetails.profession_justification && (
                      <p
                        style={{
                          color: "#888",
                          fontSize: "0.8rem",
                          marginTop: "0.5rem",
                          fontStyle: "italic",
                        }}
                      >
                        {aiEvaluationDetails.profession_justification}
                      </p>
                    )}
                  </div>
                )}

                {/* Razonamiento */}
                {aiEvaluationDetails.ai_reasoning && (
                  <div style={{ marginBottom: "1.5rem" }}>
                    <p
                      style={{
                        color: "#888",
                        fontSize: "0.85rem",
                        marginBottom: "0.5rem",
                      }}
                    >
                      🧠 Razonamiento de la IA:
                    </p>
                    <div
                      style={{
                        background: "#0a0a0a",
                        borderRadius: "4px",
                        padding: "1rem",
                        color: "#e0e0e0",
                        lineHeight: "1.6",
                      }}
                    >
                      {aiEvaluationDetails.ai_reasoning}
                    </div>
                  </div>
                )}

                {/* Factores de riesgo */}
                {aiEvaluationDetails.risk_factors &&
                  aiEvaluationDetails.risk_factors.length > 0 && (
                    <div style={{ marginBottom: "1.5rem" }}>
                      <p
                        style={{
                          color: "#888",
                          fontSize: "0.85rem",
                          marginBottom: "0.5rem",
                        }}
                      >
                        ⚠️ Factores de riesgo identificados:
                      </p>
                      <ul
                        style={{
                          background: "#0a0a0a",
                          borderRadius: "4px",
                          padding: "1rem",
                          color: "#ff3333",
                          margin: 0,
                        }}
                      >
                        {aiEvaluationDetails.risk_factors.map(
                          (risk: string, i: number) => (
                            <li key={i} style={{ marginBottom: "0.25rem" }}>
                              {risk}
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}

                {/* Reglas aplicadas */}
                {aiEvaluationDetails.rules_applied &&
                  aiEvaluationDetails.rules_applied.length > 0 && (
                    <div style={{ marginBottom: "1.5rem" }}>
                      <p
                        style={{
                          color: "#888",
                          fontSize: "0.85rem",
                          marginBottom: "0.5rem",
                        }}
                      >
                        📋 Reglas aplicadas:
                      </p>
                      <ul
                        style={{
                          background: "#0a0a0a",
                          borderRadius: "4px",
                          padding: "1rem",
                          color: "#00ff41",
                          margin: 0,
                        }}
                      >
                        {aiEvaluationDetails.rules_applied.map(
                          (rule: string, i: number) => (
                            <li key={i} style={{ marginBottom: "0.25rem" }}>
                              {rule}
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}

                {/* Proveedor de IA */}
                {aiEvaluationDetails.ai_provider && (
                  <div style={{ marginBottom: "1.5rem" }}>
                    <p
                      style={{
                        color: "#888",
                        fontSize: "0.85rem",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Modelo de IA utilizado:
                    </p>
                    <div
                      style={{
                        background: "#0a0a0a",
                        borderRadius: "4px",
                        padding: "0.5rem",
                        fontFamily: "monospace",
                        color: "#00aaff",
                      }}
                    >
                      {aiEvaluationDetails.ai_provider}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setShowAIDetails(false)}
                  style={{
                    background: "#00ff41",
                    color: "#0a0a0a",
                    border: "none",
                    padding: "0.75rem 1.5rem",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontFamily: "monospace",
                    fontWeight: "bold",
                    width: "100%",
                  }}
                >
                  Cerrar
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
