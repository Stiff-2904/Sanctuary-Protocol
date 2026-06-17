import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import type { User, AuthContextType } from "../types/auth";
import { SESSION_TIMEOUT, STORAGE_KEYS } from "../constants/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(STORAGE_KEYS.TOKEN),
  );

  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    return saved ? JSON.parse(saved) : null;
  });

  const [lastActivity, setLastActivity] = useState<Date>(new Date());

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    navigate("/login");
  }, [navigate]);

  useEffect(() => {
    const handleActivity = () => setLastActivity(new Date());

    const checkTimeout = setInterval(() => {
      const now = new Date();
      const diff = now.getTime() - lastActivity.getTime();

      if (diff > SESSION_TIMEOUT && user) {
        logout();
        alert("⚠️ Sesión expirada por inactividad (20 minutos)");
      }
    }, 60000);

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("click", handleActivity);

    return () => {
      clearInterval(checkTimeout);
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("click", handleActivity);
    };
  }, [lastActivity, user, logout]);

const login = useCallback(async (username: string, password: string) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }), 
    });

    if (!response.ok) throw new Error("Credenciales inválidas");

    const data = await response.json();
    setToken(data.data.token);
    setUser(data.data.user);

    localStorage.setItem(STORAGE_KEYS.TOKEN, data.data.token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.data.user));
    navigate("/dashboard");

    
  }, [navigate]);

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
}