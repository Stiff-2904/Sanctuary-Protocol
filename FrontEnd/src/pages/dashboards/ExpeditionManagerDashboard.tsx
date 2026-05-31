import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Map, Radio, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function ExpeditionManagerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a" }}>
      {/* Header */}
      <header
        style={{
          background: "#1a1a1a",
          padding: "1rem 2rem",
          borderBottom: "1px solid #008f11",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={{ color: "#008f11", fontFamily: "monospace", fontSize: "1.5rem" }}>
          🧟 Sanctuary Protocol
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ color: "#888", fontFamily: "monospace" }}>
            {user?.username} — Expedition Manager
          </span>
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
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <LogOut size={16} /> Salir
          </button>
        </div>
      </header>

      {/* Contenido */}
      <main style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 style={{ color: "#e0e0e0", fontFamily: "monospace", marginBottom: "0.5rem" }}>
            🗺️ Panel de Expediciones
          </h2>
          <p style={{ color: "#888", fontFamily: "monospace", marginBottom: "2rem" }}>
            Bienvenido, {user?.username}. Gestiona expediciones y solicitudes entre campamentos.
          </p>

          {/* Métricas placeholder */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem",
              marginBottom: "2.5rem",
            }}
          >
            {[
              { label: "Expediciones activas", value: "—", color: "#008f11" },
              { label: "Solicitudes pendientes", value: "—", color: "#00aaff" },
              { label: "Expediciones completadas", value: "—", color: "#00ff41" },
            ].map((metric, index) => (
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

          {/* Botones a módulos */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
            <motion.div
              whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(0,143,17,0.3)" }}
              onClick={() => navigate("/expeditions")}
              style={{
                background: "#1a1a1a",
                border: "1px solid #008f11",
                borderRadius: "12px",
                padding: "2rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "1.5rem",
              }}
            >
              <Map size={48} color="#008f11" />
              <div>
                <h3 style={{ color: "#008f11", fontFamily: "monospace", marginBottom: "0.25rem" }}>
                  Expediciones
                </h3>
                <p style={{ color: "#888", fontFamily: "monospace", fontSize: "0.85rem" }}>
                  Agendar y gestionar salidas del campamento
                </p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(0,170,255,0.3)" }}
              onClick={() => navigate("/requests")}
              style={{
                background: "#1a1a1a",
                border: "1px solid #00aaff",
                borderRadius: "12px",
                padding: "2rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "1.5rem",
              }}
            >
              <Radio size={48} color="#00aaff" />
              <div>
                <h3 style={{ color: "#00aaff", fontFamily: "monospace", marginBottom: "0.25rem" }}>
                  Solicitudes
                </h3>
                <p style={{ color: "#888", fontFamily: "monospace", fontSize: "0.85rem" }}>
                  Gestionar solicitudes de recursos o personas entre campamentos
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}