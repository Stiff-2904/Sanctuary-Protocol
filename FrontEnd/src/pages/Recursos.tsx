import { motion } from "framer-motion";
import { Package, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";

export default function Recursos() {
  // Datos dummy para mostrar (luego vendrán de la API)
  const recursosDummy = [
    { nombre: "Comida", cantidad: 150, minimo: 50, estado: "ok" },
    { nombre: "Agua", cantidad: 80, minimo: 100, estado: "bajo" },
    { nombre: "Munición", cantidad: 500, minimo: 200, estado: "ok" },
    { nombre: "Medicina", cantidad: 25, minimo: 30, estado: "bajo" },
  ];

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
          📦 Gestión de Recursos
        </h1>

        {/* Alertas de recursos bajos */}
        {recursosDummy.filter((r) => r.estado === "bajo").length > 0 && (
          <div
            style={{
              background: "rgba(255, 51, 51, 0.2)",
              border: "1px solid #ff3333",
              padding: "1rem",
              borderRadius: "8px",
              marginBottom: "2rem",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <AlertTriangle color="#ff3333" />
            <span style={{ color: "#ff3333", fontFamily: "monospace" }}>
              ⚠️ {recursosDummy.filter((r) => r.estado === "bajo").length}{" "}
              recurso(s) por debajo del mínimo
            </span>
          </div>
        )}

        {/* Lista de recursos */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {recursosDummy.map((recurso, index) => (
            <motion.div
              key={recurso.nombre}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              style={{
                background: "#1a1a1a",
                padding: "1.5rem",
                borderRadius: "12px",
                border: `1px solid ${recurso.estado === "bajo" ? "#ff3333" : "#00ff41"}`,
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
                <Package
                  color={recurso.estado === "bajo" ? "#ff3333" : "#00ff41"}
                />
                {recurso.estado === "bajo" ? (
                  <TrendingDown size={20} color="#ff3333" />
                ) : (
                  <TrendingUp size={20} color="#00ff41" />
                )}
              </div>
              <h3
                style={{
                  color: "#e0e0e0",
                  fontFamily: "monospace",
                  marginBottom: "0.5rem",
                }}
              >
                {recurso.nombre}
              </h3>
              <p style={{ color: "#888", fontSize: "0.9rem" }}>
                Cantidad:{" "}
                <span style={{ color: "#00ff41" }}>{recurso.cantidad}</span>
              </p>
              <p style={{ color: "#888", fontSize: "0.9rem" }}>
                Mínimo:{" "}
                <span style={{ color: "#ffaa00" }}>{recurso.minimo}</span>
              </p>
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
          🔜 Próximamente: Consumo diario automático, transferencias entre
          campamentos
        </p>
      </motion.div>
    </div>
  );
}
