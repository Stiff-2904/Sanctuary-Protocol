import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import CampSelector from "./pages/CampSelector";
import SuperAdminDashboard from "./pages/dashboards/SuperAdminDashboard";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import ResourceManagerDashboard from "./pages/dashboards/ResourceManagerDashboard";
import ExpeditionManagerDashboard from "./pages/dashboards/ExpeditionManagerDashboard";
import WorkerDashboard from "./pages/dashboards/WorkerDashboard";
import Admission from "./pages/admission/Admission";
import Inventory from "./pages/Inventory/Inventory";
import Expeditions from "./pages/expeditions/Expeditions";
import Requests from "./pages/request/Request";
import Persons from "./pages/persons/Persons";
import TemporaryAssignments from "./pages/persons/TemporaryAssignments";
import PrivateRoute from "./components/PrivateRoute";

// Redirige al dashboard correcto según el rol
function RoleRedirect() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case "SuperAdmin":
      return <Navigate to="/camp-selector" replace />;
    case "Admin":
      return <Navigate to="/dashboard/admin" replace />;
    case "ResourceManager":
      return <Navigate to="/dashboard/resource-manager" replace />;
    case "ExpeditionManager":
      return <Navigate to="/dashboard/expedition-manager" replace />;
    case "Worker":
      return <Navigate to="/dashboard/worker" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Pública */}
          <Route path="/login" element={<Login />} />

          {/* Redirección por rol luego del login */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <RoleRedirect />
              </PrivateRoute>
            }
          />

          {/* SuperAdmin */}
          <Route
            path="/camp-selector"
            element={
              <PrivateRoute allowedRoles={["SuperAdmin"]}>
                <CampSelector />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard/super-admin"
            element={
              <PrivateRoute allowedRoles={["SuperAdmin"]}>
                <SuperAdminDashboard />
              </PrivateRoute>
            }
          />

          {/* Admin */}
          <Route
            path="/dashboard/admin"
            element={
              <PrivateRoute allowedRoles={["Admin", "SuperAdmin"]}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />

          {/* ResourceManager */}
          <Route
            path="/dashboard/resource-manager"
            element={
              <PrivateRoute allowedRoles={["ResourceManager", "SuperAdmin"]}>
                <ResourceManagerDashboard />
              </PrivateRoute>
            }
          />

          {/* ExpeditionManager */}
          <Route
            path="/dashboard/expedition-manager"
            element={
              <PrivateRoute allowedRoles={["ExpeditionManager", "SuperAdmin"]}>
                <ExpeditionManagerDashboard />
              </PrivateRoute>
            }
          />

          {/* Worker */}
          <Route
            path="/dashboard/worker"
            element={
              <PrivateRoute allowedRoles={["Worker", "SuperAdmin"]}>
                <WorkerDashboard />
              </PrivateRoute>
            }
          />

          {/* Secciones */}
          <Route
            path="/admission"
            element={
              <PrivateRoute allowedRoles={["Admin", "SuperAdmin"]}>
                <Admission />
              </PrivateRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <PrivateRoute
                allowedRoles={["Worker", "ResourceManager", "SuperAdmin"]}
              >
                <Inventory />
              </PrivateRoute>
            }
          />
          <Route
            path="/expeditions"
            element={
              <PrivateRoute allowedRoles={["ExpeditionManager", "SuperAdmin"]}>
                <Expeditions />
              </PrivateRoute>
            }
          />
          <Route
            path="/requests"
            element={
              <PrivateRoute allowedRoles={["ExpeditionManager", "SuperAdmin"]}>
                <Requests />
              </PrivateRoute>
            }
          />
          <Route
            path="/persons"
            element={
              <PrivateRoute allowedRoles={["Admin", "SuperAdmin"]}>
                <Persons />
              </PrivateRoute>
            }
          />
          <Route
            path="/temporary-assignments"
            element={
              <PrivateRoute allowedRoles={["Admin", "SuperAdmin"]}>
                <TemporaryAssignments />
              </PrivateRoute>
            }
          />

          {/* Defaults */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
