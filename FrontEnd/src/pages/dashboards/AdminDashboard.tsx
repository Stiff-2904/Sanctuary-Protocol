import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Users, LogOut, UserCheck, Shuffle, Sun, Droplets, Wheat, Loader2, CheckCircle, AlertTriangle, FileSearch } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

interface Metrics {
  active_persons: number;
  pending_admissions: number;
  active_explorations: number;
  total_resources: number;
  critical_inventory: number;
}

interface ProductionResult {
  camp_id: number;
  active_people: number;
  water_consumed: number;
  food_consumed: number;
  water_produced: number;
  food_produced: number;
  net_water: number;
  net_food: number;
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  const [processing, setProcessing] = useState(false);
  const [productionResult, setProductionResult] = useState<ProductionResult | null>(null);
  const [productionError, setProductionError] = useState("");

  const savedCamp = localStorage.getItem("selected_camp");
  const campId = savedCamp ? JSON.parse(savedCamp).camp_id : user?.camp_id;

  const fetchMetrics = () => {
    api.get(`/metrics/dashboard${campId ? `?camp_id=${campId}` : ""}`)
      .then((res) => setMetrics(res.data))
      .catch(() => setMetrics(null));
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleProcessDay = async () => {
    setProcessing(true);
    setProductionError("");
    setProductionResult(null);
    try {
      const res = await api.post(`/production/process-daily/${campId}`);
      setProductionResult(res.data);
      fetchMetrics(); // refrescar métricas con el nuevo inventario
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setProductionError(
        err.response?.data?.error || "Error al procesar la producción diaria"
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a" }}>
      <header style={{ background: "#1a1a1a", padding: "1rem 2rem", borderBottom: "1px solid #00ff41", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ color: "#00ff41", fontFamily: "monospace", fontSize: "1.5rem" }}>🧟 Sanctuary Protocol</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ color: "#888", fontFamily: "monospace" }}>{user?.username} — Admin</span>
          <button onClick={logout} style={{ background: "#ff3333", color: "#fff", border: "none", padding: "0.5rem 1rem", borderRadius: "6px", cursor: "pointer", fontFamily: "monospace", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <LogOut size={16} /> Salir
          </button>
        </div>
      </header>

      <main style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h2 style={{ color: "#e0e0e0", fontFamily: "monospace", marginBottom: "0.5rem" }}>👤 Panel de Administración</h2>
          <p style={{ color: "#888", fontFamily: "monospace", marginBottom: "2rem" }}>
            Bienvenido, {user?.username}. Gestiona el ingreso de personas al campamento.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
            {[
              { label: "Personas activas", value: metrics?.active_persons ?? "—", color: "#00ff41" },
              { label: "Solicitudes pendientes", value: metrics?.pending_admissions ?? "—", color: "#ffaa00" },
              { label: "Alertas de inventario", value: metrics?.critical_inventory ?? "—", color: "#ff3333" },
            ].map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                style={{ background: "#1a1a1a", border: `1px solid ${metric.color}`, borderRadius: "10px", padding: "1.5rem" }}
              >
                <p style={{ color: "#888", fontFamily: "monospace", fontSize: "0.8rem", marginBottom: "0.5rem" }}>{metric.label}</p>
                <p style={{ color: metric.color, fontFamily: "monospace", fontSize: "2rem", fontWeight: "bold" }}>{metric.value}</p>
              </motion.div>
            ))}
          </div>

          {metrics && metrics.critical_inventory > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ background: "rgba(255,51,51,0.1)", border: "1px solid #ff3333", borderRadius: "8px", padding: "1rem", marginBottom: "2rem", color: "#ff3333", fontFamily: "monospace", fontSize: "0.85rem" }}
            >
              ⚠️ {metrics.critical_inventory} recurso(s) por debajo del mínimo
            </motion.div>
          )}

          {/* PROCESAR DÍA */}
          <motion.div
            style={{ background: "#1a1a1a", border: "1px solid #00aaff", borderRadius: "12px", padding: "1.5rem", marginBottom: "1rem" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
              <Sun size={32} color="#00aaff" />
              <div style={{ flex: 1 }}>
                <h3 style={{ color: "#00aaff", fontFamily: "monospace", marginBottom: "0.25rem" }}>
                  Producción y Consumo Diario
                </h3>
                <p style={{ color: "#888", fontFamily: "monospace", fontSize: "0.85rem" }}>
                  Procesa la producción de agricultores/recolectores y el consumo de raciones de todas las personas activas.
                </p>
              </div>
              <button
                onClick={handleProcessDay}
                disabled={processing}
                style={{
                  background: processing ? "#333" : "#00aaff",
                  color: processing ? "#888" : "#0a0a0a",
                  border: "none",
                  padding: "0.65rem 1.25rem",
                  borderRadius: "8px",
                  cursor: processing ? "not-allowed" : "pointer",
                  fontFamily: "monospace",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  whiteSpace: "nowrap",
                }}
              >
                {processing ? (
                  <>
                    <Loader2 size={16} className="spin" /> Procesando...
                  </>
                ) : (
                  "Procesar día"
                )}
              </button>
            </div>

            <AnimatePresence>
              {productionError && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    background: "rgba(255,51,51,0.08)",
                    border: "1px solid #ff3333",
                    borderRadius: "6px",
                    padding: "0.75rem 1rem",
                    color: "#ff3333",
                    fontFamily: "monospace",
                    fontSize: "0.85rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <AlertTriangle size={16} />
                  {productionError === "Daily production already processed today"
                    ? "Ya se procesó la producción de hoy para este campamento."
                    : productionError === "Insufficient water for daily consumption"
                    ? "No hay suficiente agua para el consumo de hoy."
                    : productionError === "Insufficient food for daily consumption"
                    ? "No hay suficiente comida para el consumo de hoy."
                    : productionError}
                </motion.div>
              )}

              {productionResult && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    background: "rgba(0,255,65,0.06)",
                    border: "1px solid #00ff41",
                    borderRadius: "8px",
                    padding: "1rem",
                    marginTop: "0.5rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                    <CheckCircle size={16} color="#00ff41" />
                    <span style={{ color: "#00ff41", fontFamily: "monospace", fontSize: "0.9rem", fontWeight: "bold" }}>
                      Día procesado — {productionResult.active_people} personas activas
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.75rem" }}>
                    <div style={{ background: "#0f0f0f", borderRadius: "6px", padding: "0.75rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.4rem" }}>
                        <Wheat size={14} color="#ffaa00" />
                        <span style={{ color: "#ffaa00", fontFamily: "monospace", fontSize: "0.75rem" }}>Comida</span>
                      </div>
                      <p style={{ color: "#e0e0e0", fontFamily: "monospace", fontSize: "0.8rem" }}>
                        +{productionResult.food_produced} producida
                      </p>
                      <p style={{ color: "#e0e0e0", fontFamily: "monospace", fontSize: "0.8rem" }}>
                        -{productionResult.food_consumed} consumida
                      </p>
                      <p style={{
                        color: productionResult.net_food >= 0 ? "#00ff41" : "#ff3333",
                        fontFamily: "monospace",
                        fontSize: "0.9rem",
                        fontWeight: "bold",
                        marginTop: "0.25rem",
                      }}>
                        Neto: {productionResult.net_food >= 0 ? "+" : ""}{productionResult.net_food}
                      </p>
                    </div>

                    <div style={{ background: "#0f0f0f", borderRadius: "6px", padding: "0.75rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.4rem" }}>
                        <Droplets size={14} color="#4da6ff" />
                        <span style={{ color: "#4da6ff", fontFamily: "monospace", fontSize: "0.75rem" }}>Agua</span>
                      </div>
                      <p style={{ color: "#e0e0e0", fontFamily: "monospace", fontSize: "0.8rem" }}>
                        +{productionResult.water_produced} producida
                      </p>
                      <p style={{ color: "#e0e0e0", fontFamily: "monospace", fontSize: "0.8rem" }}>
                        -{productionResult.water_consumed} consumida
                      </p>
                      <p style={{
                        color: productionResult.net_water >= 0 ? "#00ff41" : "#ff3333",
                        fontFamily: "monospace",
                        fontSize: "0.9rem",
                        fontWeight: "bold",
                        marginTop: "0.25rem",
                      }}>
                        Neto: {productionResult.net_water >= 0 ? "+" : ""}{productionResult.net_water}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(0,255,65,0.3)" }}
            onClick={() => navigate("/admission")}
            style={{ background: "#1a1a1a", border: "1px solid #00ff41", borderRadius: "12px", padding: "2rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "1.5rem" }}
          >
            <Users size={48} color="#00ff41" />
            <div>
              <h3 style={{ color: "#00ff41", fontFamily: "monospace", marginBottom: "0.25rem" }}>Admisión de Personas</h3>
              <p style={{ color: "#888", fontFamily: "monospace", fontSize: "0.85rem" }}>
                Revisar solicitudes, evaluaciones de IA y aprobar o rechazar ingresos
              </p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(0,170,255,0.3)" }}
            onClick={() => navigate("/admission-requests")}
            style={{ background: "#1a1a1a", border: "1px solid #00aaff", borderRadius: "12px", padding: "2rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "1.5rem", marginTop: "1rem" }}
          >
            <FileSearch size={48} color="#00aaff" />
            <div>
              <h3 style={{ color: "#00aaff", fontFamily: "monospace", marginBottom: "0.25rem" }}>Solicitudes de Admisión</h3>
              <p style={{ color: "#888", fontFamily: "monospace", fontSize: "0.85rem" }}>
                Ver el reporte de la IA y aprobar o rechazar cada solicitud pendiente
              </p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(0,255,65,0.3)" }}
            onClick={() => navigate("/persons")}
            style={{ background: "#1a1a1a", border: "1px solid #00ff41", borderRadius: "12px", padding: "2rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "1.5rem", marginTop: "1rem" }}
          >
            <UserCheck size={48} color="#00ff41" />
            <div>
              <h3 style={{ color: "#00ff41", fontFamily: "monospace", marginBottom: "0.25rem" }}>Personas del Campamento</h3>
              <p style={{ color: "#888", fontFamily: "monospace", fontSize: "0.85rem" }}>
                Gestionar el estado de salud y condición de los miembros
              </p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(255,170,0,0.2)" }}
            onClick={() => navigate("/temporary-assignments")}
            style={{ background: "#1a1a1a", border: "1px solid #ffaa00", borderRadius: "12px", padding: "2rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "1.5rem", marginTop: "1rem" }}
          >
            <Shuffle size={48} color="#ffaa00" />
            <div>
              <h3 style={{ color: "#ffaa00", fontFamily: "monospace", marginBottom: "0.25rem" }}>Reasignaciones Temporales</h3>
              <p style={{ color: "#888", fontFamily: "monospace", fontSize: "0.85rem" }}>
                Mover trabajadores entre profesiones cuando una queda sin personal
              </p>
            </div>
          </motion.div>
        </motion.div>
      </main>

      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
