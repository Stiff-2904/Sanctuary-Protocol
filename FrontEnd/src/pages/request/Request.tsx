import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Radio, CheckCircle, XCircle } from "lucide-react";
import api from "../../services/api";

interface CampRequest {
  request_id: number;
  requesting_camp: string;
  target_camp: string;
  status: string;
  created_at: string;
  notes: string;
}

export default function Requests() {
  const [requests, setRequests] = useState<CampRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get("/camp-requests")
      .then((res) => setRequests(res.data))
      .catch(() => setError("Error al cargar las solicitudes"))
      .finally(() => setLoading(false));
  }, []);

  const statusColor: Record<string, string> = {
    pending: "#ffaa00",
    approved: "#00ff41",
    rejected: "#ff3333",
  };

  const statusLabel: Record<string, string> = {
    pending: "Pendiente",
    approved: "Aprobada",
    rejected: "Rechazada",
  };

  const handleApprove = async (id: number) => {
    try {
      await api.put(`/camp-requests/${id}/approve`);
      setRequests((prev) =>
        prev.map((r) => (r.request_id === id ? { ...r, status: "approved" } : r))
      );
    } catch {
      alert("Error al aprobar la solicitud");
    }
  };

  const handleReject = async (id: number) => {
    try {
      await api.put(`/camp-requests/${id}/reject`);
      setRequests((prev) =>
        prev.map((r) => (r.request_id === id ? { ...r, status: "rejected" } : r))
      );
    } catch {
      alert("Error al rechazar la solicitud");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", padding: "2rem" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 style={{ color: "#00aaff", fontFamily: "monospace", marginBottom: "2rem" }}>
          📡 Solicitudes entre Campamentos
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
          {[
            { label: "Pendientes", status: "pending", color: "#ffaa00" },
            { label: "Aprobadas", status: "approved", color: "#00ff41" },
            { label: "Rechazadas", status: "rejected", color: "#ff3333" },
          ].map((stat) => (
            <div
              key={stat.status}
              style={{ background: "#1a1a1a", padding: "1rem", borderRadius: "8px", border: `1px solid ${stat.color}` }}
            >
              <Radio color={stat.color} style={{ marginBottom: "0.5rem" }} />
              <p style={{ color: "#888", fontSize: "0.9rem" }}>{stat.label}</p>
              <p style={{ color: stat.color, fontSize: "1.5rem", fontFamily: "monospace" }}>
                {requests.filter((r) => r.status === stat.status).length}
              </p>
            </div>
          ))}
        </div>

        {/* Lista */}
        <div style={{ background: "#1a1a1a", borderRadius: "12px", padding: "1.5rem" }}>
          <h2 style={{ color: "#e0e0e0", fontFamily: "monospace", marginBottom: "1rem" }}>
            📋 Solicitudes
          </h2>

          {loading && (
            <p style={{ color: "#00aaff", fontFamily: "monospace" }}>Cargando solicitudes...</p>
          )}

          {error && (
            <p style={{ color: "#ff3333", fontFamily: "monospace" }}>{error}</p>
          )}

          {!loading && !error && requests.length === 0 && (
            <p style={{ color: "#666", fontFamily: "monospace" }}>
              No hay solicitudes registradas.
            </p>
          )}

          {requests.map((request, index) => (
            <motion.div
              key={request.request_id}
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
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <Radio size={20} color="#00aaff" />
                <div>
                  <p style={{ color: "#e0e0e0", fontFamily: "monospace" }}>
                    {request.requesting_camp} → {request.target_camp}
                  </p>
                  <p style={{ color: "#888", fontSize: "0.8rem" }}>
                    {new Date(request.created_at).toLocaleDateString()} — {request.notes}
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                <span
                  style={{
                    color: statusColor[request.status] ?? "#888",
                    fontFamily: "monospace",
                    fontSize: "0.8rem",
                  }}
                >
                  ● {statusLabel[request.status] ?? request.status}
                </span>
                {request.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleApprove(request.request_id)}
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        color: "#00ff41",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        fontFamily: "monospace",
                        fontSize: "0.8rem",
                      }}
                    >
                      <CheckCircle size={16} /> Aprobar
                    </button>
                    <button
                      onClick={() => handleReject(request.request_id)}
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        color: "#ff3333",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        fontFamily: "monospace",
                        fontSize: "0.8rem",
                      }}
                    >
                      <XCircle size={16} /> Rechazar
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}