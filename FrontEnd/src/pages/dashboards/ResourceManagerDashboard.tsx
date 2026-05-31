import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function ResourceManagerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a" }}>
      {/* Header */}
      <header
        style={{
          background: "#1a1a1a",
          padding: "1rem 2rem",
          borderBottom: "1px solid #ffaa00",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={{ color: "#ffaa00", fontFamily: "monospace", fontSize: "1.5rem" }}>
          🧟 Sanctuary Protocol
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ color: "#888", fontFamily: "monospace" }}>
            {user?.username} — Resource Manager
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
            📦 Panel de Recursos
          </h2>
          <p style={{ color: "#888", fontFamily: "monospace", marginBottom: "2rem" }}>
            Bienvenido, {user?.username}. Gestiona el inventario y recursos del campamento.
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
              { label: "Recursos en bodega", value: "—", color: "#ffaa00" },
              { label: "Alertas activas", value: "—", color: "#ff3333" },
              { label: "Transferencias hoy", value: "—", color: "#00aaff" },
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

          {/* Botón al módulo de inventario */}
          <motion.div
            whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(255,170,0,0.3)" }}
            onClick={() => navigate("/inventory")}
            style={{
              background: "#1a1a1a",
              border: "1px solid #ffaa00",
              borderRadius: "12px",
              padding: "2rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "1.5rem",
            }}
          >
            <Package size={48} color="#ffaa00" />
            <div>
              <h3 style={{ color: "#ffaa00", fontFamily: "monospace", marginBottom: "0.25rem" }}>
                Gestión de Inventario
              </h3>
              <p style={{ color: "#888", fontFamily: "monospace", fontSize: "0.85rem" }}>
                Consultar, agregar y actualizar recursos en la bodega del campamento
              </p>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}