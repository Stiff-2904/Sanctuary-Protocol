import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

interface Camp {
  camp_id: number;
  name: string;
  location: string;
  status: string;
}

export default function SuperAdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [camp, setCamp] = useState<Camp | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("selected_camp");
    if (saved) setCamp(JSON.parse(saved));
    else navigate("/camp-selector");
  }, [navigate]);

  const metrics = [
    { label: "Personas activas", value: "—", color: "#00ff41" },
    { label: "Recursos en bodega", value: "—", color: "#ffaa00" },
    { label: "Exploraciones activas", value: "—", color: "#008f11" },
    { label: "Solicitudes pendientes", value: "—", color: "#00aaff" },
  ];

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
            onClick={() => navigate("/camp-selector")}
            style={{
              background: "#1a1a1a",
              color: "#00ff41",
              border: "1px solid #00ff41",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              cursor: "pointer",
              fontFamily: "monospace",
            }}
          >
            Cambiar campamento
          </button>
          <button
            onClick={logout}
            style={{
              background: "#ff3333",
              color: "#fff",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              cursor: "pointer",
              fontFamily: "monospace",
            }}
          >
            Salir
          </button>
        </div>
      </header>

      {/* Contenido */}
      <main style={{ padding: "2rem", maxWidth: "1100px", margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Info del campamento */}
          <div style={{ marginBottom: "2rem" }}>
            <h2 style={{ color: "#e0e0e0", fontFamily: "monospace", marginBottom: "0.25rem" }}>
              🏕️ {camp?.name ?? "Cargando..."}
            </h2>
            <p style={{ color: "#888", fontFamily: "monospace", fontSize: "0.85rem" }}>
              📍 {camp?.location} — Estado: {camp?.status}
            </p>
          </div>

          {/* Métricas */}
          <h3 style={{ color: "#e0e0e0", fontFamily: "monospace", marginBottom: "1rem" }}>
            📊 Resumen del campamento
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1rem",
              marginBottom: "2.5rem",
            }}
          >
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                style={{
                  background: "#1a1a1a",
                  border: `1px solid ${metric.color}`,
                  borderRadius: "10px",
                  padding: "1.5rem",
                }}
              >
                <p style={{ color: "#888", fontFamily: "monospace", fontSize: "0.8rem", marginBottom: "0.5rem" }}>
                  {metric.label}
                </p>
                <p style={{ color: metric.color, fontFamily: "monospace", fontSize: "2rem", fontWeight: "bold" }}>
                  {metric.value}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Botón al dashboard completo */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            onClick={() => navigate("/dashboard/admin")}
            style={{
              background: "#00ff41",
              color: "#0a0a0a",
              border: "none",
              padding: "1rem 2rem",
              borderRadius: "8px",
              cursor: "pointer",
              fontFamily: "monospace",
              fontSize: "1rem",
              fontWeight: "bold",
            }}
          >
            Ir al panel de gestión →
          </motion.button>
        </motion.div>
      </main>
    </div>
  );
}