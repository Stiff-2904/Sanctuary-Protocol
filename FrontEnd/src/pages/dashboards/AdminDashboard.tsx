import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
            {user?.username} — Admin
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
            👤 Panel de Administración
          </h2>
          <p style={{ color: "#888", fontFamily: "monospace", marginBottom: "2rem" }}>
            Bienvenido, {user?.username}. Gestiona el ingreso de personas al campamento.
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
              { label: "Solicitudes pendientes", value: "—", color: "#ffaa00" },
              { label: "Aprobadas hoy", value: "—", color: "#00ff41" },
              { label: "Rechazadas hoy", value: "—", color: "#ff3333" },
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

          {/* Botón al módulo de admisión */}
          <motion.div
            whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(0,255,65,0.3)" }}
            onClick={() => navigate("/admission")}
            style={{
              background: "#1a1a1a",
              border: "1px solid #00ff41",
              borderRadius: "12px",
              padding: "2rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "1.5rem",
            }}
          >
            <Users size={48} color="#00ff41" />
            <div>
              <h3 style={{ color: "#00ff41", fontFamily: "monospace", marginBottom: "0.25rem" }}>
                Admisión de Personas
              </h3>
              <p style={{ color: "#888", fontFamily: "monospace", fontSize: "0.85rem" }}>
                Revisar solicitudes, evaluaciones de IA y aprobar o rechazar ingresos
              </p>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}