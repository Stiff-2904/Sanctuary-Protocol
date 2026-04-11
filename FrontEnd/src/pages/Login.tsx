import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { Skull, Lock, User } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      console.error("Error en login:", err);
      setError("🧟 Credenciales inválidas. ¡Los zombies no entran!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)",
        padding: "2rem",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: "#1a1a1a",
          padding: "3rem",
          borderRadius: "12px",
          boxShadow: "0 0 40px rgba(0, 255, 65, 0.2)",
          maxWidth: "400px",
          width: "100%",
          border: "1px solid #00ff41",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <Skull size={64} color="#00ff41" style={{ margin: "0 auto 1rem" }} />
          <h1
            style={{
              color: "#00ff41",
              fontFamily: "monospace",
              fontSize: "1.5rem",
            }}
          >
            🧟 Sanctuary Protocol
          </h1>
          <p style={{ color: "#888", fontSize: "0.9rem" }}>
            Sistema de Gestión de Supervivencia
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              background: "rgba(255, 51, 51, 0.2)",
              border: "1px solid #ff3333",
              color: "#ff3333",
              padding: "1rem",
              borderRadius: "8px",
              marginBottom: "1rem",
              fontSize: "0.9rem",
            }}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                color: "#00ff41",
                marginBottom: "0.5rem",
                fontFamily: "monospace",
              }}
            >
              <User
                size={16}
                style={{ verticalAlign: "middle", marginRight: "0.5rem" }}
              />
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "#0a0a0a",
                border: "1px solid #333",
                borderRadius: "8px",
                color: "#e0e0e0",
                fontFamily: "monospace",
                outline: "none",
              }}
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                color: "#00ff41",
                marginBottom: "0.5rem",
                fontFamily: "monospace",
              }}
            >
              <Lock
                size={16}
                style={{ verticalAlign: "middle", marginRight: "0.5rem" }}
              />
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "#0a0a0a",
                border: "1px solid #333",
                borderRadius: "8px",
                color: "#e0e0e0",
                fontFamily: "monospace",
                outline: "none",
              }}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "1rem",
              background: loading ? "#333" : "#00ff41",
              color: loading ? "#888" : "#0a0a0a",
              border: "none",
              borderRadius: "8px",
              fontWeight: "bold",
              fontFamily: "monospace",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.3s",
            }}
          >
            {loading ? "🧟 Verificando..." : "🔐 Ingresar al Santuario"}
          </motion.button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "2rem",
            color: "#666",
            fontSize: "0.8rem",
          }}
        >
          ⚠️ Sesión expira después de 20 minutos de inactividad
        </p>
      </motion.div>
    </div>
  );
}
