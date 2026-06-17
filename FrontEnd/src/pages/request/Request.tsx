import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radio,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
  Package,
  AlertTriangle,
  RefreshCw,
  Trash2,
} from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

interface CampRequest {
  request_id: number;
  source_camp_id: number;
  target_camp_id: number;
  source_camp: string;
  target_camp: string;
  type: string;
  status: "pending" | "approved" | "rejected";
  request_date: string;
}

interface Camp {
  camp_id: number;
  name: string;
}

interface Resource {
  resource_id: number;
  name: string;
}

interface InventoryItem {
  inventory_id: number;
  camp_id: number;
  resource_id: number;
  resource_name: string;
  quantity: string;
}

interface ResourceLine {
  resource_id: number;
  resource_name: string;
  quantity: number;
  available: number;
}

const STATUS_CONFIG = {
  pending: { color: "#ffaa00", icon: Clock, label: "Pendiente" },
  approved: { color: "#00ff41", icon: CheckCircle, label: "Aprobada" },
  rejected: { color: "#ff3333", icon: XCircle, label: "Rechazada" },
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-CR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function NewRequestModal({
  camps,
  onClose,
  onCreated,
}: {
  camps: Camp[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [targetCampId, setTargetCampId] = useState("");
  const [resources, setResources] = useState<Resource[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [lines, setLines] = useState<ResourceLine[]>([]);
  const [selectedResourceId, setSelectedResourceId] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingResources, setLoadingResources] = useState(false);
  const [error, setError] = useState("");

  const savedCamp = localStorage.getItem("selected_camp");
  const campId = savedCamp ? JSON.parse(savedCamp).camp_id : null;

  // Carga el catálogo de recursos una sola vez al montar
  useEffect(() => {
    api.get("/resources").then((res) => setResources(res.data));
  }, []);

  // Cuando se selecciona un campamento destino, carga SU inventario
  useEffect(() => {
    if (!targetCampId) return;
    setLoadingResources(true);
    setLines([]); // limpiar selección previa si cambia el destino
    setSelectedResourceId("");
    api
      .get(`/inventory/me?camp_id=${targetCampId}`)
      .then((res) => setInventory(res.data))
      .catch(() => setError("Error al cargar inventario del campamento destino"))
      .finally(() => setLoadingResources(false));
  }, [targetCampId]);

  // Recursos disponibles en el destino que aún no fueron agregados a la solicitud
  const availableToAdd = resources.filter(
    (r) =>
      !lines.find((l) => l.resource_id === r.resource_id) &&
      inventory.find((i) => i.resource_id === r.resource_id)
  );

  const handleAddResource = () => {
    if (!selectedResourceId) return;
    const res = resources.find((r) => r.resource_id === Number(selectedResourceId));
    const inv = inventory.find((i) => i.resource_id === Number(selectedResourceId));
    if (!res || !inv) return;
    setLines((prev) => [
      ...prev,
      {
        resource_id: res.resource_id,
        resource_name: res.name,
        quantity: 1,
        available: Number(inv.quantity),
      },
    ]);
    setSelectedResourceId("");
  };

  const handleQuantityChange = (resource_id: number, delta: number) => {
    setLines((prev) =>
      prev.map((l) =>
        l.resource_id === resource_id
          ? { ...l, quantity: Math.max(1, Math.min(l.available, l.quantity + delta)) }
          : l
      )
    );
  };

  const handleRemoveLine = (resource_id: number) => {
    setLines((prev) => prev.filter((l) => l.resource_id !== resource_id));
  };

  const handleNext = () => {
    if (!targetCampId) {
      setError("Seleccioná un campamento destino");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleSubmit = async () => {
    if (lines.length === 0) {
      setError("Agregá al menos un recurso");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/camp-requests", {
        target_camp_id: Number(targetCampId),
        type: "resources",
        source_camp_id: campId,
      });
      const requestId = res.data.request_id;

      for (const line of lines) {
        await api.post(`/camp-requests/${requestId}/resources`, {
          resource_id: line.resource_id,
          quantity: line.quantity,
        });
      }

      onCreated();
      onClose();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al crear la solicitud");
    } finally {
      setLoading(false);
    }
  };

  const targetCampName = camps.find((c) => c.camp_id === Number(targetCampId))?.name ?? "";

  return (
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
        zIndex: 999,
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 20 }}
        style={{
          background: "#111",
          border: "1px solid #4da6ff",
          borderRadius: "12px",
          padding: "2rem",
          width: "100%",
          maxWidth: "500px",
          boxShadow: "0 0 40px rgba(77,166,255,0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Radio size={22} color="#4da6ff" />
            <h2 style={{ color: "#4da6ff", fontFamily: "monospace", fontSize: "1.1rem", margin: 0 }}>
              NUEVA SOLICITUD
            </h2>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {[1, 2].map((s) => (
              <div
                key={s}
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: step >= s ? "rgba(77,166,255,0.2)" : "#1a1a1a",
                  border: `1px solid ${step >= s ? "#4da6ff" : "#333"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: step >= s ? "#4da6ff" : "#555",
                  fontFamily: "monospace",
                  fontSize: "0.75rem",
                }}
              >
                {s}
              </div>
            ))}
          </div>
        </div>

        {step === 1 && (
          <div>
            <label style={{ color: "#888", fontFamily: "monospace", fontSize: "0.8rem", display: "block", marginBottom: "0.5rem" }}>
              CAMPAMENTO DESTINO
            </label>
            <select
              value={targetCampId}
              onChange={(e) => setTargetCampId(e.target.value)}
              style={{
                width: "100%",
                background: "#1a1a1a",
                border: "1px solid #333",
                borderRadius: "6px",
                color: "#e0e0e0",
                padding: "0.65rem 0.75rem",
                fontFamily: "monospace",
                fontSize: "0.9rem",
                outline: "none",
                cursor: "pointer",
                marginBottom: "1.5rem",
              }}
            >
              <option value="">-- Seleccionar --</option>
              {camps.map((c) => (
                <option key={c.camp_id} value={c.camp_id}>
                  {c.name}
                </option>
              ))}
            </select>

            {error && (
              <div style={{ color: "#ff3333", fontFamily: "monospace", fontSize: "0.8rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <AlertTriangle size={14} /> {error}
              </div>
            )}

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={onClose} style={{ flex: 1, padding: "0.75rem", background: "transparent", border: "1px solid #333", borderRadius: "6px", color: "#888", fontFamily: "monospace", cursor: "pointer" }}>
                CANCELAR
              </button>
              <button onClick={handleNext} style={{ flex: 1, padding: "0.75rem", background: "rgba(77,166,255,0.15)", border: "1px solid #4da6ff", borderRadius: "6px", color: "#4da6ff", fontFamily: "monospace", cursor: "pointer" }}>
                SIGUIENTE →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <p style={{ color: "#888", fontFamily: "monospace", fontSize: "0.8rem", marginBottom: "1rem" }}>
              RECURSOS DISPONIBLES EN {targetCampName.toUpperCase()}
            </p>

            {loadingResources ? (
              <p style={{ color: "#555", fontFamily: "monospace", fontSize: "0.85rem", marginBottom: "1rem" }}>Cargando inventario del destino...</p>
            ) : (
              <>
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                  <select
                    value={selectedResourceId}
                    onChange={(e) => setSelectedResourceId(e.target.value)}
                    style={{
                      flex: 1,
                      background: "#1a1a1a",
                      border: "1px solid #333",
                      borderRadius: "6px",
                      color: availableToAdd.length === 0 ? "#555" : "#e0e0e0",
                      padding: "0.6rem 0.75rem",
                      fontFamily: "monospace",
                      fontSize: "0.85rem",
                      outline: "none",
                    }}
                    disabled={availableToAdd.length === 0}
                  >
                    <option value="">
                      {availableToAdd.length === 0 ? "Sin recursos disponibles en el destino" : "-- Seleccionar recurso --"}
                    </option>
                    {availableToAdd.map((r) => {
                      const inv = inventory.find((i) => i.resource_id === r.resource_id);
                      return (
                        <option key={r.resource_id} value={r.resource_id}>
                          {r.name} (disponible: {Number(inv?.quantity ?? 0)})
                        </option>
                      );
                    })}
                  </select>
                  <button
                    onClick={handleAddResource}
                    disabled={!selectedResourceId}
                    style={{
                      padding: "0.6rem 0.9rem",
                      background: selectedResourceId ? "rgba(77,166,255,0.15)" : "#1a1a1a",
                      border: `1px solid ${selectedResourceId ? "#4da6ff" : "#333"}`,
                      borderRadius: "6px",
                      color: selectedResourceId ? "#4da6ff" : "#555",
                      cursor: selectedResourceId ? "pointer" : "not-allowed",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {lines.length === 0 ? (
                  <div style={{ background: "#1a1a1a", border: "1px dashed #333", borderRadius: "6px", padding: "1.5rem", textAlign: "center", color: "#555", fontFamily: "monospace", fontSize: "0.85rem", marginBottom: "1rem" }}>
                    <Package size={24} style={{ marginBottom: "0.5rem", opacity: 0.3 }} />
                    <p>Seleccioná los recursos que querés solicitar</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
                    {lines.map((line) => (
                      <div
                        key={line.resource_id}
                        style={{
                          background: "#1a1a1a",
                          border: "1px solid #2a2a2a",
                          borderRadius: "6px",
                          padding: "0.75rem 1rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                        }}
                      >
                        <Package size={15} color="#4da6ff" />
                        <span style={{ flex: 1, color: "#e0e0e0", fontFamily: "monospace", fontSize: "0.85rem" }}>
                          {line.resource_name}
                        </span>
                        <span style={{ color: "#555", fontFamily: "monospace", fontSize: "0.75rem" }}>
                          max {line.available}
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <button
                            onClick={() => handleQuantityChange(line.resource_id, -1)}
                            style={{ background: "#222", border: "1px solid #333", borderRadius: "4px", color: "#888", cursor: "pointer", width: "26px", height: "26px", display: "flex", alignItems: "center", justifyContent: "center" }}
                          >
                            <Minus size={12} />
                          </button>
                          <span style={{ color: "#4da6ff", fontFamily: "monospace", fontSize: "0.95rem", minWidth: "28px", textAlign: "center" }}>
                            {line.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(line.resource_id, 1)}
                            style={{ background: "#222", border: "1px solid #333", borderRadius: "4px", color: "#888", cursor: "pointer", width: "26px", height: "26px", display: "flex", alignItems: "center", justifyContent: "center" }}
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemoveLine(line.resource_id)}
                          style={{ background: "transparent", border: "none", color: "#ff3333", cursor: "pointer", padding: "4px" }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {error && (
              <div style={{ color: "#ff3333", fontFamily: "monospace", fontSize: "0.8rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <AlertTriangle size={14} /> {error}
              </div>
            )}

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={() => { setStep(1); setError(""); }} style={{ flex: 1, padding: "0.75rem", background: "transparent", border: "1px solid #333", borderRadius: "6px", color: "#888", fontFamily: "monospace", cursor: "pointer" }}>
                ← ATRÁS
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || lines.length === 0}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  background: loading || lines.length === 0 ? "#1a1a1a" : "rgba(0,255,65,0.12)",
                  border: `1px solid ${loading || lines.length === 0 ? "#333" : "#00ff41"}`,
                  borderRadius: "6px",
                  color: loading || lines.length === 0 ? "#555" : "#00ff41",
                  fontFamily: "monospace",
                  cursor: loading || lines.length === 0 ? "not-allowed" : "pointer",
                  fontSize: "0.9rem",
                }}
              >
                {loading ? "ENVIANDO..." : "CREAR SOLICITUD"}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function RequestRow({
  req,
  onApprove,
  onReject,
}: {
  req: CampRequest;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [actionLoading, setActionLoading] = useState<"approve" | "reject" | null>(null);
  const cfg = STATUS_CONFIG[req.status];
  const StatusIcon = cfg.icon;

  const handleApprove = async () => {
    setActionLoading("approve");
    await onApprove(req.request_id);
    setActionLoading(null);
  };

  const handleReject = async () => {
    setActionLoading("reject");
    await onReject(req.request_id);
    setActionLoading(null);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -15 }}
      animate={{ opacity: 1, x: 0 }}
      style={{
        background: "#111",
        border: `1px solid ${expanded ? cfg.color : "#222"}`,
        borderRadius: "8px",
        overflow: "hidden",
        transition: "border-color 0.2s",
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", padding: "1rem 1.25rem", gap: "1rem", cursor: "pointer" }}
        onClick={() => setExpanded(!expanded)}
      >
        <span style={{ color: "#555", fontFamily: "monospace", fontSize: "0.75rem", minWidth: "40px" }}>
          #{req.request_id}
        </span>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
          <span style={{ color: "#e0e0e0", fontFamily: "monospace", fontSize: "0.9rem" }}>{req.source_camp}</span>
          <span style={{ color: "#555", fontSize: "0.8rem" }}>→</span>
          <span style={{ color: "#e0e0e0", fontFamily: "monospace", fontSize: "0.9rem" }}>{req.target_camp}</span>
        </div>
        <span style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: "4px", padding: "0.2rem 0.5rem", color: "#888", fontFamily: "monospace", fontSize: "0.75rem", whiteSpace: "nowrap" }}>
          {req.type}
        </span>
        <span style={{ color: "#555", fontFamily: "monospace", fontSize: "0.75rem", whiteSpace: "nowrap" }}>
          {formatDate(req.request_date)}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", minWidth: "100px", justifyContent: "flex-end" }}>
          <StatusIcon size={14} color={cfg.color} />
          <span style={{ color: cfg.color, fontFamily: "monospace", fontSize: "0.8rem" }}>{cfg.label}</span>
        </div>
        {expanded ? <ChevronUp size={16} color="#555" /> : <ChevronDown size={16} color="#555" />}
      </div>

      <AnimatePresence>
        {expanded && req.status === "pending" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ borderTop: "1px solid #222", padding: "1rem 1.25rem", display: "flex", gap: "0.75rem", alignItems: "center" }}>
              <span style={{ color: "#555", fontFamily: "monospace", fontSize: "0.8rem", flex: 1 }}>
                ¿Qué hacemos con esta solicitud?
              </span>
              <button
                onClick={handleReject}
                disabled={!!actionLoading}
                style={{ padding: "0.5rem 1.25rem", background: actionLoading === "reject" ? "#1a1a1a" : "rgba(255,51,51,0.1)", border: "1px solid #ff3333", borderRadius: "6px", color: actionLoading === "reject" ? "#555" : "#ff3333", fontFamily: "monospace", fontSize: "0.85rem", cursor: actionLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "0.4rem" }}
              >
                <XCircle size={14} />
                {actionLoading === "reject" ? "..." : "RECHAZAR"}
              </button>
              <button
                onClick={handleApprove}
                disabled={!!actionLoading}
                style={{ padding: "0.5rem 1.25rem", background: actionLoading === "approve" ? "#1a1a1a" : "rgba(0,255,65,0.1)", border: "1px solid #00ff41", borderRadius: "6px", color: actionLoading === "approve" ? "#555" : "#00ff41", fontFamily: "monospace", fontSize: "0.85rem", cursor: actionLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "0.4rem" }}
              >
                <CheckCircle size={14} />
                {actionLoading === "approve" ? "..." : "APROBAR"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Requests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<CampRequest[]>([]);
  const [camps, setCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [actionError, setActionError] = useState("");

  const savedCamp = localStorage.getItem("selected_camp");
  const campId = savedCamp ? JSON.parse(savedCamp).camp_id : null;

  const fetchRequests = async () => {
    try {
      setError("");
      const res = await api.get(`/camp-requests${campId ? `?camp_id=${campId}` : ""}`);
      setRequests(res.data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al cargar solicitudes");
    } finally {
      setLoading(false);
    }
  };

  const fetchCamps = async () => {
    try {
      const res = await api.get("/camps");
      setCamps(res.data?.data || res.data || []);
    } catch {
      // silencioso
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchCamps();
  }, []);

  const handleApprove = async (id: number) => {
    try {
      setActionError("");
      await api.put(`/camp-requests/${id}/approve`);
      await fetchRequests();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setActionError(err.response?.data?.message || "Error al aprobar");
    }
  };

  const handleReject = async (id: number) => {
    try {
      setActionError("");
      await api.put(`/camp-requests/${id}/reject`);
      await fetchRequests();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setActionError(err.response?.data?.message || "Error al rechazar");
    }
  };

  const filtered = filterStatus === "all"
    ? requests
    : requests.filter((r) => r.status === filterStatus);

  const counts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", padding: "2rem" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Radio size={26} color="#4da6ff" />
            <h1 style={{ color: "#4da6ff", fontFamily: "monospace", fontSize: "1.4rem", margin: 0 }}>
              Solicitudes de Campamento
            </h1>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              onClick={fetchRequests}
              style={{ padding: "0.6rem 0.9rem", background: "transparent", border: "1px solid #333", borderRadius: "6px", color: "#888", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", fontFamily: "monospace", fontSize: "0.85rem" }}
            >
              <RefreshCw size={14} /> Actualizar
            </button>
            {(user?.role === "ExpeditionManager" || user?.role === "SuperAdmin") && (
              <button
                onClick={() => setShowModal(true)}
                style={{ padding: "0.6rem 1.2rem", background: "rgba(77,166,255,0.12)", border: "1px solid #4da6ff", borderRadius: "6px", color: "#4da6ff", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", fontFamily: "monospace", fontSize: "0.85rem" }}
              >
                <Plus size={15} /> Nueva Solicitud
              </button>
            )}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem", marginBottom: "1.75rem" }}>
          {[
            { key: "all", label: "Total", color: "#4da6ff" },
            { key: "pending", label: "Pendientes", color: "#ffaa00" },
            { key: "approved", label: "Aprobadas", color: "#00ff41" },
            { key: "rejected", label: "Rechazadas", color: "#ff3333" },
          ].map(({ key, label, color }) => (
            <motion.div
              key={key}
              whileHover={{ scale: 1.02 }}
              onClick={() => setFilterStatus(key)}
              style={{
                background: filterStatus === key ? "#161616" : "#111",
                border: `1px solid ${filterStatus === key ? color : "#222"}`,
                borderRadius: "8px",
                padding: "1rem",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <p style={{ color: "#666", fontFamily: "monospace", fontSize: "0.75rem", marginBottom: "0.4rem" }}>{label}</p>
              <p style={{ color, fontFamily: "monospace", fontSize: "1.6rem", margin: 0 }}>
                {counts[key as keyof typeof counts]}
              </p>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {actionError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ background: "rgba(255,51,51,0.1)", border: "1px solid #ff3333", borderRadius: "6px", padding: "0.75rem 1rem", color: "#ff3333", fontFamily: "monospace", fontSize: "0.85rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <AlertTriangle size={15} /> {actionError}
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#555", fontFamily: "monospace" }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ display: "inline-block", marginBottom: "1rem" }}>
              <RefreshCw size={24} />
            </motion.div>
            <p>Cargando solicitudes...</p>
          </div>
        ) : error ? (
          <div style={{ background: "rgba(255,51,51,0.08)", border: "1px solid #ff3333", borderRadius: "8px", padding: "2rem", textAlign: "center", color: "#ff3333", fontFamily: "monospace" }}>
            <AlertTriangle size={28} style={{ marginBottom: "0.75rem" }} />
            <p>{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ background: "#111", border: "1px solid #222", borderRadius: "8px", padding: "3rem", textAlign: "center", color: "#555", fontFamily: "monospace" }}>
            <Radio size={32} style={{ marginBottom: "0.75rem", opacity: 0.3 }} />
            <p>No hay solicitudes {filterStatus !== "all" ? `con estado "${filterStatus}"` : "registradas"}.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            <AnimatePresence>
              {filtered.map((req, i) => (
                <motion.div key={req.request_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <RequestRow req={req} onApprove={handleApprove} onReject={handleReject} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <NewRequestModal camps={camps} onClose={() => setShowModal(false)} onCreated={fetchRequests} />
        )}
      </AnimatePresence>
    </div>
  );
}
