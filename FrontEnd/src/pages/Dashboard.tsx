import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Users, Package, Map, Shield, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { icon: Users, label: "Personas", path: "/personas", color: "#00ff41" },
    { icon: Package, label: "Recursos", path: "/recursos", color: "#ffaa00" },
    {
      icon: Map,
      label: "Exploraciones",
      path: "/exploraciones",
      color: "#008f11",
    },
    { icon: Shield, label: "Seguridad", path: "/seguridad", color: "#ff3333" },
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
        <h1
          style={{
            color: "#00ff41",
            fontFamily: "monospace",
            fontSize: "1.5rem",
          }}
        >
          🧟 Sanctuary Protocol
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ color: "#888", fontFamily: "monospace" }}>
            {user?.nombre} ({user?.rol})
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
      <main style={{ padding: "2rem" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2
            style={{
              color: "#e0e0e0",
              marginBottom: "2rem",
              fontFamily: "monospace",
            }}
          >
            📊 Panel de Control
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {menuItems.map((item, index) => (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 20px rgba(0, 255, 65, 0.3)",
                }}
                onClick={() => navigate(item.path)}
                style={{
                  background: "#1a1a1a",
                  padding: "2rem",
                  borderRadius: "12px",
                  border: `1px solid ${item.color}`,
                  cursor: "pointer",
                  transition: "all 0.3s",
                }}
              >
                <item.icon
                  size={48}
                  color={item.color}
                  style={{ marginBottom: "1rem" }}
                />
                <h3 style={{ color: "#e0e0e0", fontFamily: "monospace" }}>
                  {item.label}
                </h3>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
