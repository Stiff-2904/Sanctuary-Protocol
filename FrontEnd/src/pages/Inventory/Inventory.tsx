import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, AlertTriangle, Plus, X } from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

interface InventoryItem {
  inventory_id: number;
  resource_name: string;
  quantity: number;
  unit: string;
  min_quantity: number;
  camp_name: string;
}

interface Resource {
  resource_id: number;
  name: string;
}

export default function Inventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ resource_id: "", quantity: "" });
  const [submitting, setSubmitting] = useState(false);

  const { user } = useAuth();
  const canEdit = user?.role !== "Worker";

  const savedCamp = localStorage.getItem("selected_camp");
  const campId = savedCamp ? JSON.parse(savedCamp).camp_id : null;

  const fetchInventory = () => {
    setLoading(true);
    api
      .get(`/inventory/me${campId ? `?camp_id=${campId}` : ""}`)
      .then((res) => setItems(res.data))
      .catch(() => setError("Error al cargar el inventario"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInventory();
    api.get("/resources").then((res) => setResources(res.data));
  }, []);

  const handleSubmit = async () => {
    if (!form.resource_id || !form.quantity) {
      alert("Selecciona un recurso e ingresa la cantidad");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/inventory", {
        camp_id: campId || 1,
        resource_id: parseInt(form.resource_id),
        quantity: parseFloat(form.quantity),
      });
      setShowForm(false);
      setForm({ resource_id: "", quantity: "" });
      fetchInventory();
    } catch {
      alert("Error al agregar recurso");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", padding: "2rem" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
          }}
        >
          <h1 style={{ color: "#ffaa00", fontFamily: "monospace" }}>
            📦 Inventario del Campamento
          </h1>
          {canEdit && (
            <button
              onClick={() => setShowForm(true)}
              style={{
                background: "#ffaa00",
                color: "#0a0a0a",
                border: "none",
                padding: "0.75rem 1.5rem",
                borderRadius: "8px",
                cursor: "pointer",
                fontFamily: "monospace",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <Plus size={16} /> Agregar Recurso
            </button>
          )}
        </div>

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
              border: "1px solid #ffaa00",
            }}
          >
            <Package color="#ffaa00" style={{ marginBottom: "0.5rem" }} />
            <p style={{ color: "#888", fontSize: "0.9rem" }}>Total recursos</p>
            <p
              style={{
                color: "#ffaa00",
                fontSize: "1.5rem",
                fontFamily: "monospace",
              }}
            >
              {items.length}
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
            <AlertTriangle color="#ff3333" style={{ marginBottom: "0.5rem" }} />
            <p style={{ color: "#888", fontSize: "0.9rem" }}>Alertas</p>
            <p
              style={{
                color: "#ff3333",
                fontSize: "1.5rem",
                fontFamily: "monospace",
              }}
            >
              {items.filter((i) => i.quantity <= i.min_quantity).length}
            </p>
          </div>
        </div>

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
            🗃️ Recursos en Bodega
          </h2>

          {loading && (
            <p style={{ color: "#ffaa00", fontFamily: "monospace" }}>
              Cargando inventario...
            </p>
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
              <div
                style={{ display: "flex", alignItems: "center", gap: "1rem" }}
              >
                <Package size={20} color="#ffaa00" />
                <div>
                  <p style={{ color: "#e0e0e0", fontFamily: "monospace" }}>
                    {item.resource_name}
                  </p>
                  <p style={{ color: "#888", fontSize: "0.8rem" }}>
                    {item.camp_name}
                  </p>
                </div>
              </div>
              <div
                style={{ display: "flex", gap: "1rem", alignItems: "center" }}
              >
                <span
                  style={{
                    color:
                      item.quantity <= item.min_quantity
                        ? "#ff3333"
                        : "#00ff41",
                    fontFamily: "monospace",
                  }}
                >
                  {item.quantity} {item.unit}
                </span>
                {item.quantity <= item.min_quantity && (
                  <AlertTriangle size={16} color="#ff3333" />
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.85)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 100,
                padding: "1rem",
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                style={{
                  background: "#1a1a1a",
                  border: "1px solid #ffaa00",
                  borderRadius: "12px",
                  padding: "2rem",
                  width: "100%",
                  maxWidth: "400px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1.5rem",
                  }}
                >
                  <h2 style={{ color: "#ffaa00", fontFamily: "monospace" }}>
                    📦 Agregar Recurso
                  </h2>
                  <button
                    onClick={() => setShowForm(false)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#888",
                      cursor: "pointer",
                    }}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <label
                      style={{
                        color: "#888",
                        fontFamily: "monospace",
                        fontSize: "0.85rem",
                      }}
                    >
                      Recurso *
                    </label>
                    <select
                      value={form.resource_id}
                      onChange={(e) =>
                        setForm({ ...form, resource_id: e.target.value })
                      }
                      style={{
                        width: "100%",
                        background: "#0a0a0a",
                        border: "1px solid #333",
                        borderRadius: "6px",
                        padding: "0.5rem",
                        color: "#e0e0e0",
                        fontFamily: "monospace",
                        marginTop: "0.25rem",
                      }}
                    >
                      <option value="">Selecciona un recurso</option>
                      {resources.map((r) => (
                        <option key={r.resource_id} value={r.resource_id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      style={{
                        color: "#888",
                        fontFamily: "monospace",
                        fontSize: "0.85rem",
                      }}
                    >
                      Cantidad *
                    </label>
                    <input
                      type="number"
                      value={form.quantity}
                      onChange={(e) =>
                        setForm({ ...form, quantity: e.target.value })
                      }
                      min="1"
                      style={{
                        width: "100%",
                        background: "#0a0a0a",
                        border: "1px solid #333",
                        borderRadius: "6px",
                        padding: "0.5rem",
                        color: "#e0e0e0",
                        fontFamily: "monospace",
                        marginTop: "0.25rem",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    style={{
                      background: submitting ? "#333" : "#ffaa00",
                      color: "#0a0a0a",
                      border: "none",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      cursor: submitting ? "not-allowed" : "pointer",
                      fontFamily: "monospace",
                      fontWeight: "bold",
                      fontSize: "1rem",
                    }}
                  >
                    {submitting ? "Guardando..." : "Agregar al inventario"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
