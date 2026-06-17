import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileSearch,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import api from "../../services/api";

interface AiResult {
  decision: string;
  confidence: number;
  reasoning: string;
  rules_applied: string[];
  risk_factors: string[];
  suggested_profession: string;
  profession_justification: string;
}

interface AdmissionRequest {
  request_id: number;
  person_id: number;
  camp_id: number;
  name: string;
  birth_date: string | null;
  request_date: string;
  status: string;
  skills: string;
  ai_result: string | null;
  justification: string | null;
  suggested_profession: string | null;
}

const STATUS_CONFIG: Record<string, { color: string; icon: typeof Clock; label: string }> = {
  pending_ai_review: { color: "#ffaa00", icon: Clock, label: "Pendiente de revisión" },
  approved: { color: "#00ff41", icon: CheckCircle, label: "Aprobada" },
  rejected: { color: "#ff3333", icon: XCircle, label: "Rechazada" },
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("es-CR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function parseAiResult(raw: string | null): AiResult | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function ConfidenceBar({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100);
  const color = pct >= 70 ? "#00ff41" : pct >= 50 ? "#ffaa00" : "#ff3333";
  return (
    <div style={{ marginTop: "0.5rem" }}>
      <p style={{ color: "#888", fontFamily: "monospace", fontSize: "0.75rem", marginBottom: "0.25rem" }}>
        Confianza de la IA: {pct}%
      </p>
      <div style={{ width: "100%", height: "6px", background: "#1a1a1a", borderRadius: "3px", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color }} />
      </div>
    </div>
  );
}

function RequestCard({
  req,
  onDecide,
}: {
  req: AdmissionRequest;
  onDecide: (id: number, decision: "approved" | "rejected", reason: string) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [overrideReason, setOverrideReason] = useState("");
  const [actionLoading, setActionLoading] = useState<"approved" | "rejected" | null>(null);

  const cfg = STATUS_CONFIG[req.status] ?? { color: "#888", icon: Clock, label: req.status };
  const StatusIcon = cfg.icon;
  const ai = parseAiResult(req.ai_result);

  const aiSaysApprove = ai?.decision === "APROBADO";
  const isPending = req.status === "pending_ai_review";

  const handleAction = async (decision: "approved" | "rejected") => {
    const isOverride = ai && (decision === "approved") !== aiSaysApprove;
    if (isOverride && !overrideReason.trim()) {
      alert("Como esto contradice la recomendación de la IA, indicá una razón para el override.");
      return;
    }
    setActionLoading(decision);
    await onDecide(req.request_id, decision, overrideReason);
    setActionLoading(null);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: "#111",
        border: `1px solid ${expanded ? cfg.color : "#222"}`,
        borderRadius: "8px",
        overflow: "hidden",
        marginBottom: "0.75rem",
      }}
    >
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          padding: "1rem 1.25rem",
          cursor: "pointer",
          flexWrap: "wrap",
        }}
      >
        <span style={{ color: "#555", fontFamily: "monospace", fontSize: "0.75rem", minWidth: "40px" }}>
          #{req.request_id}
        </span>
        <span style={{ color: "#e0e0e0", fontFamily: "monospace", fontSize: "0.9rem", flex: 1 }}>
          {req.name}
        </span>
        {ai && (
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "0.75rem",
              color: aiSaysApprove ? "#00ff41" : "#ff3333",
              border: `1px solid ${aiSaysApprove ? "#00ff41" : "#ff3333"}`,
              borderRadius: "4px",
              padding: "0.15rem 0.5rem",
            }}
          >
            IA: {ai.decision}
          </span>
        )}
        <span style={{ color: "#555", fontFamily: "monospace", fontSize: "0.75rem" }}>
          {formatDate(req.request_date)}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", minWidth: "150px", justifyContent: "flex-end" }}>
          <StatusIcon size={14} color={cfg.color} />
          <span style={{ color: cfg.color, fontFamily: "monospace", fontSize: "0.8rem" }}>{cfg.label}</span>
        </div>
        {expanded ? <ChevronUp size={16} color="#555" /> : <ChevronDown size={16} color="#555" />}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: "hidden", borderTop: "1px solid #222" }}
          >
            <div style={{ padding: "1.25rem" }}>
              {!ai && (
                <p style={{ color: "#666", fontFamily: "monospace", fontSize: "0.85rem" }}>
                  Esta solicitud no tiene un reporte de IA disponible.
                </p>
              )}

              {ai && (
                <>
                  <p style={{ color: "#888", fontFamily: "monospace", fontSize: "0.8rem", marginBottom: "0.5rem" }}>
                    Profesión sugerida: <span style={{ color: "#e0e0e0" }}>{ai.suggested_profession ?? "—"}</span>
                  </p>

                  <ConfidenceBar confidence={ai.confidence ?? 0} />

                  <p style={{ color: "#888", fontFamily: "monospace", fontSize: "0.8rem", marginTop: "0.75rem" }}>
                    Razonamiento: {ai.reasoning ?? "—"}
                  </p>

                  {ai.profession_justification && (
                    <p style={{ color: "#888", fontFamily: "monospace", fontSize: "0.8rem", marginTop: "0.5rem" }}>
                      Justificación de profesión: {ai.profession_justification}
                    </p>
                  )}

                  {Array.isArray(ai.rules_applied) && ai.rules_applied.length > 0 && (
                    <div style={{ marginTop: "0.75rem" }}>
                      <p style={{ color: "#00aaff", fontFamily: "monospace", fontSize: "0.75rem", marginBottom: "0.4rem" }}>
                        Criterios evaluados:
                      </p>
                      {ai.rules_applied.map((rule, i) => (
                        <p key={i} style={{ color: "#e0e0e0", fontFamily: "monospace", fontSize: "0.75rem", marginBottom: "0.2rem" }}>
                          {rule}
                        </p>
                      ))}
                    </div>
                  )}

                  {Array.isArray(ai.risk_factors) && ai.risk_factors.length > 0 && (
                    <div style={{ marginTop: "0.75rem" }}>
                      <p style={{ color: "#ff3333", fontFamily: "monospace", fontSize: "0.75rem", marginBottom: "0.4rem" }}>
                        ⚠️ Factores de riesgo detectados:
                      </p>
                      {ai.risk_factors.map((risk, i) => (
                        <p key={i} style={{ color: "#ff8888", fontFamily: "monospace", fontSize: "0.75rem", marginBottom: "0.2rem" }}>
                          • {risk}
                        </p>
                      ))}
                    </div>
                  )}
                </>
              )}

              {req.justification && req.justification.includes("Override:") && (
                <div
                  style={{
                    marginTop: "1rem",
                    background: "rgba(255,170,0,0.06)",
                    border: "1px solid #ffaa00",
                    borderRadius: "6px",
                    padding: "0.75rem",
                  }}
                >
                  <p style={{ color: "#ffaa00", fontFamily: "monospace", fontSize: "0.75rem" }}>
                    📝 {req.justification}
                  </p>
                </div>
              )}

              {isPending && (
                <div style={{ marginTop: "1.25rem", borderTop: "1px solid #222", paddingTop: "1rem" }}>
                  <label style={{ color: "#888", fontFamily: "monospace", fontSize: "0.75rem", display: "block", marginBottom: "0.4rem" }}>
                    Razón (obligatoria solo si tu decisión contradice a la IA)
                  </label>
                  <input
                    type="text"
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    placeholder="Ej: La entrevista presencial reveló información adicional..."
                    style={{
                      width: "100%",
                      background: "#0a0a0a",
                      border: "1px solid #333",
                      borderRadius: "6px",
                      padding: "0.5rem 0.75rem",
                      color: "#e0e0e0",
                      fontFamily: "monospace",
                      fontSize: "0.8rem",
                      marginBottom: "1rem",
                      boxSizing: "border-box",
                    }}
                  />
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <button
                      onClick={() => handleAction("rejected")}
                      disabled={!!actionLoading}
                      style={{
                        flex: 1,
                        padding: "0.6rem",
                        background: actionLoading === "rejected" ? "#1a1a1a" : "rgba(255,51,51,0.1)",
                        border: "1px solid #ff3333",
                        borderRadius: "6px",
                        color: actionLoading === "rejected" ? "#555" : "#ff3333",
                        fontFamily: "monospace",
                        fontSize: "0.85rem",
                        cursor: actionLoading ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.4rem",
                      }}
                    >
                      <XCircle size={14} />
                      {actionLoading === "rejected" ? "..." : "Rechazar"}
                    </button>
                    <button
                      onClick={() => handleAction("approved")}
                      disabled={!!actionLoading}
                      style={{
                        flex: 1,
                        padding: "0.6rem",
                        background: actionLoading === "approved" ? "#1a1a1a" : "rgba(0,255,65,0.1)",
                        border: "1px solid #00ff41",
                        borderRadius: "6px",
                        color: actionLoading === "approved" ? "#555" : "#00ff41",
                        fontFamily: "monospace",
                        fontSize: "0.85rem",
                        cursor: actionLoading ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.4rem",
                      }}
                    >
                      <CheckCircle size={14} />
                      {actionLoading === "approved" ? "..." : "Aprobar"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function AdmissionRequests() {
  const [requests, setRequests] = useState<AdmissionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const savedCamp = localStorage.getItem("selected_camp");
  const campId = savedCamp ? JSON.parse(savedCamp).camp_id : null;

  const fetchRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/admissions${campId ? `?camp_id=${campId}` : ""}`);
      setRequests(res.data.data || []);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al cargar las solicitudes de admisión");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleDecide = async (id: number, decision: "approved" | "rejected", reason: string) => {
    try {
      await api.patch(`/admissions/${id}/decide`, {
        final_decision: decision,
        user_override_reason: reason || undefined,
      });
      await fetchRequests();
    } catch {
      alert("Error al registrar la decisión. Intentá de nuevo.");
    }
  };

  const filtered = filterStatus === "all" ? requests : requests.filter((r) => r.status === filterStatus);

  const counts = {
    all: requests.length,
    pending_ai_review: requests.filter((r) => r.status === "pending_ai_review").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", padding: "2rem" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <FileSearch size={26} color="#00ff41" />
            <h1 style={{ color: "#00ff41", fontFamily: "monospace", fontSize: "1.4rem", margin: 0 }}>
              Solicitudes de Admisión
            </h1>
          </div>
          <button
            onClick={fetchRequests}
            style={{
              padding: "0.6rem 0.9rem",
              background: "transparent",
              border: "1px solid #333",
              borderRadius: "6px",
              color: "#888",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              fontFamily: "monospace",
              fontSize: "0.85rem",
            }}
          >
            <RefreshCw size={14} /> Actualizar
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem", marginBottom: "1.75rem" }}>
          {[
            { key: "all", label: "Total", color: "#4da6ff" },
            { key: "pending_ai_review", label: "Pendientes", color: "#ffaa00" },
            { key: "approved", label: "Aprobadas", color: "#00ff41" },
            { key: "rejected", label: "Rechazadas", color: "#ff3333" },
          ].map(({ key, label, color }) => (
            <motion.div
              key={key}
              whileHover={{ scale: 1.02 }}
              onClick={() => setFilterStatus(key)}
              style={{
                background: filterStatus === key ? "#161616" : "#111",
                border: `1px solid ${filterStatus === key ? color : "#222"}`,
                borderRadius: "8px",
                padding: "1rem",
                cursor: "pointer",
              }}
            >
              <p style={{ color: "#666", fontFamily: "monospace", fontSize: "0.75rem", marginBottom: "0.4rem" }}>{label}</p>
              <p style={{ color, fontFamily: "monospace", fontSize: "1.6rem", margin: 0 }}>
                {counts[key as keyof typeof counts]}
              </p>
            </motion.div>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#555", fontFamily: "monospace" }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ display: "inline-block", marginBottom: "1rem" }}>
              <RefreshCw size={24} />
            </motion.div>
            <p>Cargando solicitudes...</p>
          </div>
        ) : error ? (
          <div style={{ background: "rgba(255,51,51,0.08)", border: "1px solid #ff3333", borderRadius: "8px", padding: "2rem", textAlign: "center", color: "#ff3333", fontFamily: "monospace" }}>
            <AlertTriangle size={28} style={{ marginBottom: "0.75rem" }} />
            <p>{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ background: "#111", border: "1px solid #222", borderRadius: "8px", padding: "3rem", textAlign: "center", color: "#555", fontFamily: "monospace" }}>
            <FileSearch size={32} style={{ marginBottom: "0.75rem", opacity: 0.3 }} />
            <p>No hay solicitudes {filterStatus !== "all" ? `con este estado` : "registradas"}.</p>
          </div>
        ) : (
          <div>
            {filtered.map((req) => (
              <RequestCard key={req.request_id} req={req} onDecide={handleDecide} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
