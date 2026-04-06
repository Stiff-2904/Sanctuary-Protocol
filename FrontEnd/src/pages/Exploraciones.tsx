import { motion } from "framer-motion";
import { Map, Calendar, Users, Package, AlertTriangle } from "lucide-react";

export default function Exploraciones() {
  const exploracionesDummy = [
    {
      id: 1,
      destino: "Zona Industrial",
      estado: "en_curso",
      diasRestantes: 3,
      miembros: 4,
      raciones: 20,
    },
    {
      id: 2,
      destino: "Hospital Abandonado",
      estado: "planificada",
      diasRestantes: 0,
      miembros: 6,
      raciones: 30,
    },
    {
      id: 3,
      destino: "Supermercado Norte",
      estado: "completada",
      diasRestantes: 0,
      miembros: 3,
      raciones: 15,
    },
  ];

  const estadosColor: Record<string, string> = {
    en_curso: "#ffaa00",
    planificada: "#00ff41",
    completada: "#008f11",
    fallida: "#ff3333",
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
          🗺️ Exploraciones y Expediciones
        </h1>

        {exploracionesDummy.filter((e) => e.estado === "en_curso").length >
          0 && (
          <div
            style={{
              background: "rgba(255, 170, 0, 0.2)",
              border: "1px solid #ffaa00",
              padding: "1rem",
              borderRadius: "8px",
              marginBottom: "2rem",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <AlertTriangle color="#ffaa00" />
            <span style={{ color: "#ffaa00", fontFamily: "monospace" }}>
              ⚠️{" "}
              {exploracionesDummy.filter((e) => e.estado === "en_curso").length}{" "}
              exploración(es) en curso
            </span>
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {exploracionesDummy.map((exploracion, index) => (
            <motion.div
              key={exploracion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              style={{
                background: "#1a1a1a",
                padding: "1.5rem",
                borderRadius: "12px",
                border: `1px solid ${estadosColor[exploracion.estado]}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <Map color={estadosColor[exploracion.estado]} />
                <span
                  style={{
                    color: estadosColor[exploracion.estado],
                    fontFamily: "monospace",
                    fontSize: "0.8rem",
                    padding: "0.25rem 0.5rem",
                    background: "rgba(0,0,0,0.5)",
                    borderRadius: "4px",
                    textTransform: "uppercase",
                  }}
                >
                  {exploracion.estado.replace("_", " ")}
                </span>
              </div>

              <h3
                style={{
                  color: "#e0e0e0",
                  fontFamily: "monospace",
                  marginBottom: "1rem",
                }}
              >
                {exploracion.destino}
              </h3>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    color: "#888",
                    fontSize: "0.9rem",
                  }}
                >
                  <Users size={16} />
                  <span>{exploracion.miembros} miembros</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    color: "#888",
                    fontSize: "0.9rem",
                  }}
                >
                  <Package size={16} />
                  <span>{exploracion.raciones} raciones</span>
                </div>
                {exploracion.estado === "en_curso" && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      color: "#ffaa00",
                      fontSize: "0.9rem",
                    }}
                  >
                    <Calendar size={16} />
                    <span>{exploracion.diasRestantes} días restantes</span>
                  </div>
                )}
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
          🔜 Próximamente: Agendamiento, consumo de raciones, registro de
          recursos encontrados
        </p>
      </motion.div>
    </div>
  );
}
