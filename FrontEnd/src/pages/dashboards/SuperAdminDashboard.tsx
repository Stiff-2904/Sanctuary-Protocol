import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

interface Camp {
  camp_id: number;
  name: string;
  location: string;
  status: string;
}

interface Metrics {
  active_persons: number;
  pending_admissions: number;
  active_explorations: number;
  total_resources: number;
  critical_inventory: number;
}

export default function SuperAdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [camp, setCamp] = useState<Camp | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  const savedCamp = localStorage.getItem("selected_camp");
  const campId = savedCamp ? JSON.parse(savedCamp).camp_id : null;

  useEffect(() => {
    if (savedCamp) setCamp(JSON.parse(savedCamp));
    else navigate("/camp-selector");

    api.get(`/metrics/dashboard${campId ? `?camp_id=${campId}` : ""}`)
      .then((res) => setMetrics(res.data))
      .catch(() => setMetrics(null));
  }, [navigate]);

  const metricCards = [
    { label: "Personas activas", value: metrics?.active_persons ?? "—", color: "#00ff41" },
    { label: "Recursos en bodega", value: metrics?.total_resources ?? "—", color: "#ffaa00" },
    { label: "Exploraciones activas", value: metrics?.active_explorations ?? "—", color: "#008f11" },
    { label: "Solicitudes pendientes", value: metrics?.pending_admissions ?? "—", color: "#00aaff" },
  ];

  const modules = [
    { label: "Admisión de Personas", path: "/admission", color: "#00ff41", emoji: "👥" },
    { label: "Personas", path: "/persons", color: "#00ff41", emoji: "🧍" },
    { label: "Reasignaciones Temporales", path: "/temporary-assignments", color: "#ffaa00", emoji: "🔄" },
    { label: "Inventario", path: "/inventory", color: "#ffaa00", emoji: "📦" },
    { label: "Solicitudes", path: "/requests", color: "#00aaff", emoji: "📡" },
    { label: "Expediciones", path: "/expeditions", color: "#008f11", emoji: "🗺️" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a" }}>
      <header style={{ background: "#1a1a1a", padding: "1rem 2rem", borderBottom: "1px solid #00ff41", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ color: "#00ff41", fontFamily: "monospace", fontSize: "1.5rem" }}>🧟 Sanctuary Protocol</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ color: "#888", fontFamily: "monospace" }}>{user?.username} — SuperAdmin</span>
          <button onClick={() => navigate("/camp-selector")} style={{ background: "#1a1a1a", color: "#00ff41", border: "1px solid #00ff41", padding: "0.5rem 1rem", borderRadius: "6px", cursor: "pointer", fontFamily: "monospace" }}>
            Cambiar campamento
          </button>
          <button onClick={logout} style={{ background: "#ff3333", color: "#fff", border: "none", padding: "0.5rem 1rem", borderRadius: "6px", cursor: "pointer", fontFamily: "monospace" }}>
            Salir
          </button>
        </div>
      </header>

      <main style={{ padding: "2rem", maxWidth: "1100px", margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

          <div style={{ marginBottom: "2rem" }}>
            <h2 style={{ color: "#e0e0e0", fontFamily: "monospace", marginBottom: "0.25rem" }}>
              🏕️ {camp?.name ?? "Cargando..."}
            </h2>
            <p style={{ color: "#888", fontFamily: "monospace", fontSize: "0.85rem" }}>
              📍 {camp?.location} — Estado: {camp?.status}
            </p>
          </div>

          <h3 style={{ color: "#e0e0e0", fontFamily: "monospace", marginBottom: "1rem" }}>📊 Resumen del campamento</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "2.5rem" }}>
            {metricCards.map((metric, index) => (
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

          {metrics?.critical_inventory > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ background: "rgba(255,51,51,0.1)", border: "1px solid #ff3333", borderRadius: "8px", padding: "1rem", marginBottom: "2rem", color: "#ff3333", fontFamily: "monospace", fontSize: "0.85rem" }}
            >
              ⚠️ {metrics.critical_inventory} recurso(s) por debajo del mínimo
            </motion.div>
          )}

          <h3 style={{ color: "#e0e0e0", fontFamily: "monospace", marginBottom: "1rem" }}>🗂️ Módulos del sistema</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
            {modules.map((item) => (
              <motion.div
                key={item.path}
                whileHover={{ scale: 1.03, boxShadow: `0 0 20px ${item.color}44` }}
                onClick={() => navigate(item.path)}
                style={{ background: "#1a1a1a", border: `1px solid ${item.color}`, borderRadius: "12px", padding: "1.5rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "1rem" }}
              >
                <span style={{ fontSize: "2rem" }}>{item.emoji}</span>
                <h3 style={{ color: item.color, fontFamily: "monospace" }}>{item.label}</h3>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}