import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, UserCheck, UserX, Heart, Shield } from "lucide-react";
import api from "../../services/api";

interface Person {
  person_id: number;
  full_name: string;
  profession_name: string;
  status: string;
  health_status: string;
}

export default function Admission() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get("/persons")
      .then((res) => setPersons(res.data))
      .catch(() => setError("Error al cargar las personas"))
      .finally(() => setLoading(false));
  }, []);

  const statusColor: Record<string, string> = {
    active: "#00ff41",
    outside: "#ffaa00",
    inactive: "#ff3333",
  };

  const healthColor: Record<string, string> = {
    healthy: "#00ff41",
    injured: "#ffaa00",
    sick: "#ff3333",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", padding: "2rem" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 style={{ color: "#00ff41", fontFamily: "monospace", marginBottom: "2rem" }}>
          👥 Gestión de Personas
        </h1>

        {/* Estadísticas */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          <div style={{ background: "#1a1a1a", padding: "1rem", borderRadius: "8px", border: "1px solid #00ff41" }}>
            <Users color="#00ff41" style={{ marginBottom: "0.5rem" }} />
            <p style={{ color: "#888", fontSize: "0.9rem" }}>Total</p>
            <p style={{ color: "#00ff41", fontSize: "1.5rem", fontFamily: "monospace" }}>
              {persons.length}
            </p>
          </div>
          <div style={{ background: "#1a1a1a", padding: "1rem", borderRadius: "8px", border: "1px solid #00ff41" }}>
            <UserCheck color="#00ff41" style={{ marginBottom: "0.5rem" }} />
            <p style={{ color: "#888", fontSize: "0.9rem" }}>Activos</p>
            <p style={{ color: "#00ff41", fontSize: "1.5rem", fontFamily: "monospace" }}>
              {persons.filter((p) => p.status === "active").length}
            </p>
          </div>
          <div style={{ background: "#1a1a1a", padding: "1rem", borderRadius: "8px", border: "1px solid #ff3333" }}>
            <UserX color="#ff3333" style={{ marginBottom: "0.5rem" }} />
            <p style={{ color: "#888", fontSize: "0.9rem" }}>Enfermos/Heridos</p>
            <p style={{ color: "#ff3333", fontSize: "1.5rem", fontFamily: "monospace" }}>
              {persons.filter((p) => p.health_status !== "healthy").length}
            </p>
          </div>
        </div>

        {/* Lista */}
        <div style={{ background: "#1a1a1a", borderRadius: "12px", padding: "1.5rem" }}>
          <h2 style={{ color: "#e0e0e0", fontFamily: "monospace", marginBottom: "1rem" }}>
            📋 Supervivientes del Campamento
          </h2>

          {loading && (
            <p style={{ color: "#00ff41", fontFamily: "monospace" }}>Cargando personas...</p>
          )}

          {error && (
            <p style={{ color: "#ff3333", fontFamily: "monospace" }}>{error}</p>
          )}

          {!loading && !error && persons.length === 0 && (
            <p style={{ color: "#666", fontFamily: "monospace" }}>
              No hay personas registradas en este campamento.
            </p>
          )}

          {persons.map((person, index) => (
            <motion.div
              key={person.person_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1rem",
                borderBottom: "1px solid #333",
                gap: "1rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <Shield size={20} color="#00ff41" />
                <div>
                  <p style={{ color: "#e0e0e0", fontFamily: "monospace" }}>{person.full_name}</p>
                  <p style={{ color: "#888", fontSize: "0.8rem" }}>{person.profession_name}</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "1rem" }}>
                <span style={{ color: statusColor[person.status] ?? "#888", fontFamily: "monospace", fontSize: "0.8rem" }}>
                  ● {person.status}
                </span>
                <span style={{ color: healthColor[person.health_status] ?? "#888", fontFamily: "monospace", fontSize: "0.8rem" }}>
                  <Heart size={14} style={{ verticalAlign: "middle" }} /> {person.health_status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}