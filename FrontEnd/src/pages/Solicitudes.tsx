import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Inbox } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Solicitudes() {
  const { user } = useAuth();
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
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            background: "transparent",
            border: "1px solid #00ff41",
            color: "#00ff41",
            padding: "0.5rem",
            borderRadius: "6px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
        >
          <ArrowLeft size={18} />
        </button>
        <h1
          style={{
            color: "#00ff41",
            fontFamily: "monospace",
            fontSize: "1.5rem",
          }}
        >
          📡 Solicitudes entre Campamentos
        </h1>
      </header>

      {/* Contenido */}
      <main style={{ padding: "2rem" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Info del usuario */}
          <p style={{ color: "#888", fontFamily: "monospace", marginBottom: "2rem" }}>
            Sesión: {user?.username} — Rol: {user?.role}
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {/* Enviar solicitud */}
            <motion.div
              whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(0, 255, 65, 0.2)" }}
              style={{
                background: "#1a1a1a",
                border: "1px solid #00ff41",
                borderRadius: "12px",
                padding: "2rem",
              }}
            >
              <Send size={36} color="#00ff41" style={{ marginBottom: "1rem" }} />
              <h2 style={{ color: "#e0e0e0", fontFamily: "monospace", marginBottom: "0.5rem" }}>
                Enviar Solicitud
              </h2>
              <p style={{ color: "#888", fontFamily: "monospace", fontSize: "0.85rem" }}>
                Solicitar recursos o ayuda a otro campamento vecino.
              </p>
              <button
                disabled
                style={{
                  marginTop: "1.5rem",
                  background: "#0a0a0a",
                  border: "1px solid #444",
                  color: "#444",
                  padding: "0.5rem 1rem",
                  borderRadius: "6px",
                  fontFamily: "monospace",
                  cursor: "not-allowed",
                }}
              >
                Próximamente
              </button>
            </motion.div>

            {/* Solicitudes recibidas */}
            <motion.div
              whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(0, 255, 65, 0.2)" }}
              style={{
                background: "#1a1a1a",
                border: "1px solid #ffaa00",
                borderRadius: "12px",
                padding: "2rem",
              }}
            >
              <Inbox size={36} color="#ffaa00" style={{ marginBottom: "1rem" }} />
              <h2 style={{ color: "#e0e0e0", fontFamily: "monospace", marginBottom: "0.5rem" }}>
                Solicitudes Recibidas
              </h2>
              <p style={{ color: "#888", fontFamily: "monospace", fontSize: "0.85rem" }}>
                Revisar y responder solicitudes de otros campamentos.
              </p>
              <button
                disabled
                style={{
                  marginTop: "1.5rem",
                  background: "#0a0a0a",
                  border: "1px solid #444",
                  color: "#444",
                  padding: "0.5rem 1rem",
                  borderRadius: "6px",
                  fontFamily: "monospace",
                  cursor: "not-allowed",
                }}
              >
                Próximamente
              </button>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}