import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Heart, X, ChevronDown } from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

interface Person {
  person_id: number;
  name: string;
  birth_date: string;
  status: string;
  health_status: string;
  camp_id: number;
  profession_name?: string;
}

const HEALTH_STATUSES = [
  { value: "healthy", label: "Sano", color: "#00ff41", emoji: "💚" },
  { value: "injured", label: "Herido", color: "#ffaa00", emoji: "🩹" },
  { value: "sick", label: "Enfermo", color: "#ff6600", emoji: "🤒" },
  { value: "away", label: "Fuera del campamento", color: "#888", emoji: "🚶" },
];

const STATUS_LABELS: Record<string, string> = {
  active: "Activo",
  pending: "Pendiente",
  inactive: "Inactivo",
};

function getActiveCampId(userCampId?: number | null): number | null {
  const savedCamp = localStorage.getItem("selected_camp");
  if (savedCamp) return JSON.parse(savedCamp).camp_id;
  return userCampId ?? null;
}

export default function Persons() {
  const { user } = useAuth();
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Person | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [filterHealth, setFilterHealth] = useState("all");

  const canEdit =
    user?.role === "Admin" ||
    user?.role === "SuperAdmin" ||
    user?.role === "ExpeditionManager";

  const fetchPersons = () => {
    setLoading(true);
    const campId = getActiveCampId(user?.camp_id);
    api
      .get(`/persons${campId ? `?camp_id=${campId}` : ""}`)
      .then((res) => setPersons(res.data))
      .catch(() => setError("Error al cargar las personas"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPersons();
  }, []);

  const handleHealthUpdate = async (personId: number, health_status: string) => {
    setUpdatingId(personId);
    try {
      await api.put(`/persons/${personId}/health-status`, { health_status });
      setPersons((prev) =>
        prev.map((p) => (p.person_id === personId ? { ...p, health_status } : p))
      );
      if (selected?.person_id === personId) {
        setSelected((prev) => (prev ? { ...prev, health_status } : prev));
      }
    } catch {
      alert("Error al actualizar el estado de salud");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = persons.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchHealth = filterHealth === "all" || p.health_status === filterHealth;
    return matchSearch && matchHealth;
  });

  const healthInfo = (val: string) =>
    HEALTH_STATUSES.find((h) => h.value === val) ?? {
      value: val,
      label: val,
      color: "#888",
      emoji: "❓",
    };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", padding: "2rem" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ color: "#00ff41", fontFamily: "monospace" }}>
            🧍 Gestión de Personas
          </h1>
        </div>

        {/* Estadísticas clicables por estado */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          {HEALTH_STATUSES.map((hs) => (
            <motion.div
              key={hs.value}
              whileHover={{ scale: 1.03 }}
              onClick={() =>
                setFilterHealth(filterHealth === hs.value ? "all" : hs.value)
              }
              style={{
                background: "#1a1a1a",
                border: `1px solid ${filterHealth === hs.value ? hs.color : "#333"}`,
                borderRadius: "8px",
                padding: "1rem",
                cursor: "pointer",
                transition: "border-color 0.2s",
              }}
            >
              <p style={{ fontSize: "1.2rem", marginBottom: "0.25rem" }}>{hs.emoji}</p>
              <p style={{ color: "#888", fontSize: "0.8rem", fontFamily: "monospace" }}>
                {hs.label}
              </p>
              <p
                style={{
                  color: hs.color,
                  fontSize: "1.5rem",
                  fontFamily: "monospace",
                  fontWeight: "bold",
                }}
              >
                {persons.filter((p) => p.health_status === hs.value).length}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Búsqueda y filtro */}
        <div
          style={{
            marginBottom: "1.5rem",
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre..."
            style={{
              flex: 1,
              minWidth: "200px",
              background: "#1a1a1a",
              border: "1px solid #333",
              borderRadius: "8px",
              padding: "0.65rem 1rem",
              color: "#e0e0e0",
              fontFamily: "monospace",
            }}
          />
          <div style={{ position: "relative" }}>
            <select
              value={filterHealth}
              onChange={(e) => setFilterHealth(e.target.value)}
              style={{
                background: "#1a1a1a",
                border: "1px solid #333",
                borderRadius: "8px",
                padding: "0.65rem 2.5rem 0.65rem 1rem",
                color: "#e0e0e0",
                fontFamily: "monospace",
                appearance: "none",
                cursor: "pointer",
              }}
            >
              <option value="all">Todos los estados</option>
              {HEALTH_STATUSES.map((hs) => (
                <option key={hs.value} value={hs.value}>
                  {hs.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              color="#888"
              style={{
                position: "absolute",
                right: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            />
          </div>
        </div>

        {/* Lista */}
        <div
          style={{ background: "#1a1a1a", borderRadius: "12px", padding: "1.5rem" }}
        >
          <h2
            style={{
              color: "#e0e0e0",
              fontFamily: "monospace",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Users size={16} /> Personas del campamento
          </h2>

          {loading && (
            <p style={{ color: "#00ff41", fontFamily: "monospace" }}>Cargando...</p>
          )}
          {error && (
            <p style={{ color: "#ff3333", fontFamily: "monospace" }}>{error}</p>
          )}
          {!loading && !error && filtered.length === 0 && (
            <p style={{ color: "#666", fontFamily: "monospace" }}>
              No se encontraron personas.
            </p>
          )}

          {filtered.map((person, index) => {
            const hs = healthInfo(person.health_status);
            return (
              <motion.div
                key={person.person_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04 }}
                onClick={() => setSelected(person)}
                whileHover={{ background: "#222" }}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "1rem",
                  borderBottom: "1px solid #2a2a2a",
                  cursor: "pointer",
                  borderRadius: "6px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: "#0a0a0a",
                      border: `1px solid ${hs.color}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1rem",
                    }}
                  >
                    {hs.emoji}
                  </div>
                  <div>
                    <p
                      style={{
                        color: "#e0e0e0",
                        fontFamily: "monospace",
                        marginBottom: "0.1rem",
                      }}
                    >
                      {person.name}
                    </p>
                    <p
                      style={{
                        color: "#666",
                        fontSize: "0.78rem",
                        fontFamily: "monospace",
                      }}
                    >
                      {person.profession_name ?? "Sin profesión"} —{" "}
                      {STATUS_LABELS[person.status] ?? person.status}
                    </p>
                  </div>
                </div>
                <span
                  style={{
                    color: hs.color,
                    fontFamily: "monospace",
                    fontSize: "0.8rem",
                  }}
                >
                  {hs.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Modal detalle / edición */}
      <AnimatePresence>
        {selected && (
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
                border: `1px solid ${healthInfo(selected.health_status).color}`,
                borderRadius: "12px",
                padding: "2rem",
                width: "100%",
                maxWidth: "480px",
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
                <h2 style={{ color: "#e0e0e0", fontFamily: "monospace" }}>
                  {healthInfo(selected.health_status).emoji} {selected.name}
                </h2>
                <button
                  onClick={() => setSelected(null)}
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

              {/* Info */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.6rem",
                  marginBottom: "1.5rem",
                }}
              >
                {[
                  {
                    label: "Profesión",
                    value: selected.profession_name ?? "Sin asignar",
                  },
                  {
                    label: "Estado en campamento",
                    value: STATUS_LABELS[selected.status] ?? selected.status,
                  },
                  {
                    label: "Fecha de nacimiento",
                    value: selected.birth_date
                      ? new Date(selected.birth_date).toLocaleDateString()
                      : "—",
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      borderBottom: "1px solid #2a2a2a",
                      paddingBottom: "0.4rem",
                    }}
                  >
                    <span
                      style={{
                        color: "#888",
                        fontFamily: "monospace",
                        fontSize: "0.85rem",
                      }}
                    >
                      {label}
                    </span>
                    <span
                      style={{
                        color: "#e0e0e0",
                        fontFamily: "monospace",
                        fontSize: "0.85rem",
                      }}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Cambio de estado de salud */}
              {canEdit ? (
                <div>
                  <p
                    style={{
                      color: "#888",
                      fontFamily: "monospace",
                      fontSize: "0.85rem",
                      marginBottom: "0.75rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                    }}
                  >
                    <Heart size={14} /> Estado de salud
                  </p>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "0.5rem",
                    }}
                  >
                    {HEALTH_STATUSES.map((hs) => {
                      const isActive = selected.health_status === hs.value;
                      const isUpdating = updatingId === selected.person_id;
                      return (
                        <motion.button
                          key={hs.value}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          disabled={isUpdating}
                          onClick={() =>
                            handleHealthUpdate(selected.person_id, hs.value)
                          }
                          style={{
                            background: isActive ? hs.color + "22" : "transparent",
                            border: `1px solid ${isActive ? hs.color : "#333"}`,
                            borderRadius: "8px",
                            padding: "0.65rem",
                            cursor: isUpdating ? "not-allowed" : "pointer",
                            color: isActive ? hs.color : "#888",
                            fontFamily: "monospace",
                            fontSize: "0.8rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.4rem",
                            transition: "all 0.2s",
                          }}
                        >
                          {hs.emoji}{" "}
                          {isUpdating && isActive ? "Guardando..." : hs.label}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    background: "#0a0a0a",
                    border: `1px solid ${healthInfo(selected.health_status).color}`,
                    borderRadius: "8px",
                    padding: "1rem",
                    textAlign: "center",
                  }}
                >
                  <span style={{ fontSize: "1.5rem" }}>
                    {healthInfo(selected.health_status).emoji}
                  </span>
                  <p
                    style={{
                      color: healthInfo(selected.health_status).color,
                      fontFamily: "monospace",
                      marginTop: "0.4rem",
                    }}
                  >
                    {healthInfo(selected.health_status).label}
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
