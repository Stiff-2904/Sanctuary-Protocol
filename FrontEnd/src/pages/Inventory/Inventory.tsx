import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package, AlertTriangle } from "lucide-react";
import api from "../../services/api";

interface InventoryItem {
  inventory_id: number;
  resource_name: string;
  quantity: number;
  unit: string;
  min_quantity: number;
  camp_name: string;
}

export default function Inventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get("/inventory/me")
      .then((res) => setItems(res.data))
      .catch(() => setError("Error al cargar el inventario"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", padding: "2rem" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 style={{ color: "#ffaa00", fontFamily: "monospace", marginBottom: "2rem" }}>
          📦 Inventario del Campamento
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
          <div style={{ background: "#1a1a1a", padding: "1rem", borderRadius: "8px", border: "1px solid #ffaa00" }}>
            <Package color="#ffaa00" style={{ marginBottom: "0.5rem" }} />
            <p style={{ color: "#888", fontSize: "0.9rem" }}>Total recursos</p>
            <p style={{ color: "#ffaa00", fontSize: "1.5rem", fontFamily: "monospace" }}>
              {items.length}
            </p>
          </div>
          <div style={{ background: "#1a1a1a", padding: "1rem", borderRadius: "8px", border: "1px solid #ff3333" }}>
            <AlertTriangle color="#ff3333" style={{ marginBottom: "0.5rem" }} />
            <p style={{ color: "#888", fontSize: "0.9rem" }}>Alertas</p>
            <p style={{ color: "#ff3333", fontSize: "1.5rem", fontFamily: "monospace" }}>
              {items.filter((i) => i.quantity <= i.min_quantity).length}
            </p>
          </div>
        </div>

        {/* Lista */}
        <div style={{ background: "#1a1a1a", borderRadius: "12px", padding: "1.5rem" }}>
          <h2 style={{ color: "#e0e0e0", fontFamily: "monospace", marginBottom: "1rem" }}>
            🗃️ Recursos en Bodega
          </h2>

          {loading && (
            <p style={{ color: "#ffaa00", fontFamily: "monospace" }}>Cargando inventario...</p>
          )}

          {error && (
            <p style={{ color: "#ff3333", fontFamily: "monospace" }}>{error}</p>
          )}

          {!loading && !error && items.length === 0 && (
            <p style={{ color: "#666", fontFamily: "monospace" }}>
              No hay recursos registrados en este campamento.
            </p>
          )}

          {items.map((item, index) => (
            <motion.div
              key={item.inventory_id}
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
                <Package size={20} color="#ffaa00" />
                <div>
                  <p style={{ color: "#e0e0e0", fontFamily: "monospace" }}>{item.resource_name}</p>
                  <p style={{ color: "#888", fontSize: "0.8rem" }}>{item.camp_name}</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <span style={{ color: item.quantity <= item.min_quantity ? "#ff3333" : "#00ff41", fontFamily: "monospace" }}>
                  {item.quantity} {item.unit}
                </span>
                {item.quantity <= item.min_quantity && (
                  <AlertTriangle size={16} color="#ff3333" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}