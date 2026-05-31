import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

interface Camp {
  camp_id: number;
  name: string;
  location: string;
  status: string;
}

export default function CampSelector() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [camps, setCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get("/camps")
      .then((res) => setCamps(res.data))
      .catch(() => setError("Error al cargar los campamentos"))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (camp: Camp) => {
    // Guardar campamento seleccionado en localStorage
    localStorage.setItem("selected_camp", JSON.stringify(camp));
    navigate("/dashboard/super-admin");
  };

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
      <main style={{ padding: "3rem 2rem", maxWidth: "900px", margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 style={{ color: "#e0e0e0", fontFamily: "monospace", marginBottom: "0.5rem" }}>
            🏕️ Selecciona un Campamento
          </h2>
          <p style={{ color: "#888", fontFamily: "monospace", marginBottom: "2rem" }}>
            Elige el campamento que deseas gestionar
          </p>

          {loading && (
            <p style={{ color: "#00ff41", fontFamily: "monospace" }}>
              Cargando campamentos...
            </p>
          )}

          {error && (
            <p style={{ color: "#ff3333", fontFamily: "monospace" }}>{error}</p>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {camps.map((camp, index) => (
              <motion.div
                key={camp.camp_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.04, boxShadow: "0 0 20px rgba(0,255,65,0.3)" }}
                onClick={() => handleSelect(camp)}
                style={{
                  background: "#1a1a1a",
                  border: "1px solid #00ff41",
                  borderRadius: "12px",
                  padding: "2rem",
                  cursor: "pointer",
                }}
              >
                <h3 style={{ color: "#00ff41", fontFamily: "monospace", marginBottom: "0.5rem" }}>
                  {camp.name}
                </h3>
                <p style={{ color: "#888", fontFamily: "monospace", fontSize: "0.85rem" }}>
                  📍 {camp.location}
                </p>
                <p style={{ color: "#555", fontFamily: "monospace", fontSize: "0.75rem", marginTop: "0.5rem" }}>
                  Estado: {camp.status}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}