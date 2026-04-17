import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Recursos from "./pages/Recursos";
import Personas from "./pages/Personas";
import Exploraciones from "./pages/Exploraciones";
import Solicitudes from "./pages/Solicitudes";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />

          {/* Todos los roles autenticados */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          {/* Admin y SuperAdmin */}
          <Route
            path="/personas"
            element={
              <PrivateRoute allowedRoles={["Admin", "SuperAdmin"]}>
                <Personas />
              </PrivateRoute>
            }
          />

          {/* Worker, ResourceManager y SuperAdmin */}
          <Route
            path="/recursos"
            element={
              <PrivateRoute allowedRoles={["Worker", "ResourceManager", "SuperAdmin"]}>
                <Recursos />
              </PrivateRoute>
            }
          />

          {/* ExpeditionManager y SuperAdmin */}
          <Route
            path="/exploraciones"
            element={
              <PrivateRoute allowedRoles={["ExpeditionManager", "SuperAdmin"]}>
                <Exploraciones />
              </PrivateRoute>
            }
          />

          {/* ExpeditionManager y SuperAdmin */}
          <Route
            path="/solicitudes"
            element={
              <PrivateRoute allowedRoles={["ExpeditionManager", "SuperAdmin"]}>
                <Solicitudes />
              </PrivateRoute>
            }
          />

          {/* Redirección por defecto */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;