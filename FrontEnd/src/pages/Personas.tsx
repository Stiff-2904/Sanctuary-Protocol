import { motion } from "framer-motion";
import { Users, UserCheck, UserX, Heart, Shield } from "lucide-react";

export default function Personas() {
  // Datos dummy para mostrar (luego vendrán de la API)
  const personasDummy = [
    { nombre: "Juan Pérez", rol: "Médico", estado: "activo", salud: "sano" },
    {
      nombre: "María González",
      rol: "Constructor",
      estado: "activo",
      salud: "herido",
    },
    {
      nombre: "Carlos Ruiz",
      rol: "Explorador",
      estado: "fuera",
      salud: "sano",
    },
    {
      nombre: "Ana López",
      rol: "Cocinero",
      estado: "activo",
      salud: "enfermo",
    },
  ];

  const estadosColor = {
    activo: "#00ff41",
    fuera: "#ffaa00",
    inactivo: "#ff3333",
  };

  const saludColor = {
    sano: "#00ff41",
    herido: "#ffaa00",
    enfermo: "#ff3333",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", padding: "2rem" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1
          style={{
            color: "#00ff41",
            fontFamily: "monospace",
            marginBottom: "2rem",
          }}
        >
          👥 Gestión de Personas
        </h1>

        {/* Estadísticas rápidas */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              background: "#1a1a1a",
              padding: "1rem",
              borderRadius: "8px",
              border: "1px solid #00ff41",
            }}
          >
            <Users color="#00ff41" style={{ marginBottom: "0.5rem" }} />
            <p style={{ color: "#888", fontSize: "0.9rem" }}>Total</p>
            <p
              style={{
                color: "#00ff41",
                fontSize: "1.5rem",
                fontFamily: "monospace",
              }}
            >
              {personasDummy.length}
            </p>
          </div>
          <div
            style={{
              background: "#1a1a1a",
              padding: "1rem",
              borderRadius: "8px",
              border: "1px solid #00ff41",
            }}
          >
            <UserCheck color="#00ff41" style={{ marginBottom: "0.5rem" }} />
            <p style={{ color: "#888", fontSize: "0.9rem" }}>Activos</p>
            <p
              style={{
                color: "#00ff41",
                fontSize: "1.5rem",
                fontFamily: "monospace",
              }}
            >
              {personasDummy.filter((p) => p.estado === "activo").length}
            </p>
          </div>
          <div
            style={{
              background: "#1a1a1a",
              padding: "1rem",
              borderRadius: "8px",
              border: "1px solid #ff3333",
            }}
          >
            <UserX color="#ff3333" style={{ marginBottom: "0.5rem" }} />
            <p style={{ color: "#888", fontSize: "0.9rem" }}>
              Enfermos/Heridos
            </p>
            <p
              style={{
                color: "#ff3333",
                fontSize: "1.5rem",
                fontFamily: "monospace",
              }}
            >
              {personasDummy.filter((p) => p.salud !== "sano").length}
            </p>
          </div>
        </div>

        {/* Lista de personas */}
        <div
          style={{
            background: "#1a1a1a",
            borderRadius: "12px",
            padding: "1.5rem",
          }}
        >
          <h2
            style={{
              color: "#e0e0e0",
              fontFamily: "monospace",
              marginBottom: "1rem",
            }}
          >
            📋 Supervivientes del Campamento
          </h2>
          {personasDummy.map((persona, index) => (
            <motion.div
              key={persona.nombre}
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
              <div
                style={{ display: "flex", alignItems: "center", gap: "1rem" }}
              >
                <Shield size={20} color="#00ff41" />
                <div>
                  <p style={{ color: "#e0e0e0", fontFamily: "monospace" }}>
                    {persona.nombre}
                  </p>
                  <p style={{ color: "#888", fontSize: "0.8rem" }}>
                    {persona.rol}
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "1rem" }}>
                <span
                  style={{
                    color:
                      estadosColor[persona.estado as keyof typeof estadosColor],
                    fontFamily: "monospace",
                    fontSize: "0.8rem",
                  }}
                >
                  ● {persona.estado}
                </span>
                <span
                  style={{
                    color: saludColor[persona.salud as keyof typeof saludColor],
                    fontFamily: "monospace",
                    fontSize: "0.8rem",
                  }}
                >
                  <Heart size={14} style={{ verticalAlign: "middle" }} />{" "}
                  {persona.salud}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <p
          style={{
            color: "#666",
            marginTop: "2rem",
            fontFamily: "monospace",
            fontSize: "0.8rem",
          }}
        >
          🔜 Próximamente: Ingreso con IA, asignación automática de roles,
          solicitudes de ingreso
        </p>
      </motion.div>
    </div>
  );
}
