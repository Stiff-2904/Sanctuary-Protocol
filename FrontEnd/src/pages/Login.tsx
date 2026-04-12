import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../Login.css"; 

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
      navigate("/dashboard"); //entra al campamento
    } catch (err) {
      console.error("Error en login:", err);
      setError(">  USUARIO NO RECONOCIDO. ACCESO DENEGADO.");
    } finally {
      setLoading(false);
    }
  };

  return (
     <div className="login-screen-wrapper"> 
      <div className="overlay"></div>

      <div className="login-container">
        <div className="scanner-line"></div>

        <header>
          <h1>SANCTUARY PROTOCOL</h1>
          <p className="subtitle">PROTOCOLO DE SUPERVIVENCIA ZOMBIE</p>
        </header>

        {error && (
          <div className="error-terminal-msg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">E-MAIL DE USUARIO</label>
            <input 
              type="email" 
              id="username" 
              placeholder="Correo electrónico..." 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">CÓDIGO DE ACCESO (Mín. 8 caracteres)</label>
            <input 
              type="password" 
              id="password" 
              required 
              value={password}
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
            />
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? "VERIFICANDO..." : "SOLICITAR ACCESO"}
          </button>
        </form>

        <footer>
            <span className="warning-text">ADVERTENCIA: LA SESIÓN SE BLOQUEARÁ TRAS 20 MIN DE INACTIVIDAD</span>
        </footer>
      </div>
    </div>
  );
}