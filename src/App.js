import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/auth/Login';
import Dashboard from './components/Dashboard';
import Admin from './pages/admin/admin';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import Empresa from './pages/empresa/empresa';
import AdminLogin from './pages/AdminLogin';
import Register from './pages/auth/register';
import ForgotPassword from './pages/ForgotPassword';
import GerenteDashboard from './pages/gerente/containers/GerenteDashboard';
import ActualizarEmpresa from './pages/empresa/ActualizarEmpresa';
import AfiliacionesAprobadas from './pages/admin/components/sections/AfiliacionesAprobadasSection';
import AfiliacionesPendientes from './pages/admin/components/sections/AfiliacionesPendientesSection';
import AfiliacionesRechazadas from './pages/admin/components/sections/AfiliacionesRechazadasSection';
import EventosContainer from './pages/gerente/containers/EventosContainer';
import CrearOrganizadorContainer from './pages/gerente/containers/CrearOrganizadorContainer';
import UbicacionesContainer from './pages/gerente/containers/UbicacionesContainer';
import LugaresContainer from './pages/gerente/containers/LugaresContainer';
import EditarEventoPage from './pages/organizador/EditarEventoPage';
import Asistente from './pages/asistente/asistente';

import OrganizerDashboard from './pages/organizador/OrganizerDashboard';
import CrearEventoPage from './pages/organizador/CrearEventoPage';
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Ruta pública */}
          <Route path="/login" element={<Login />} />

          {/* Ruta protegida */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login-admin" element={<AdminLogin />} />

          {/* Ruta del panel de administración */}
          <Route
            path="/admin*"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />

          <Route
            path="/gerente"
            element={
              <PrivateRoute>
                <GerenteDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/gerente/crear-organizador"
            element={
              <PrivateRoute>
                <CrearOrganizadorContainer />
              </PrivateRoute>
            }
          />
          <Route
            path="/gerente/ubicaciones"
            element={
              <PrivateRoute>
                <UbicacionesContainer />
              </PrivateRoute>
            }
          />
          <Route
            path="/gerente/lugares"
            element={
              <PrivateRoute>
                <LugaresContainer />
              </PrivateRoute>
            }
          />
          <Route
            path="/gerente/eventos"
            element={
              <PrivateRoute>
                <EventosContainer />
              </PrivateRoute>
            }
          />
          <Route
            path="/gerente/actualizar-empresa"
            element={
              <PrivateRoute>
                <ActualizarEmpresa />
              </PrivateRoute>
            }
          />

          {/* Ruta para asistentes */}
          <Route path="/asistente" element={<Asistente />} />
          <Route path="/asistente/eventos" element={<Asistente />} />



          {/*Ruta para gestión de empresa*/}
          <Route
            path="/empresa"
            element={
              <PrivateRoute>
                <Empresa />
              </PrivateRoute>
            }
          />

          {/*Rutas para gestión de afiliaciones*/}
          <Route
            path="/empresa/afiliaciones-aprobadas"
            element={
              <PrivateRoute>
                <AfiliacionesAprobadas />
              </PrivateRoute>
            }
          />
          <Route
            path="/empresa/afiliaciones-pendientes"
            element={
              <PrivateRoute>
                <AfiliacionesPendientes />
              </PrivateRoute>
            }
          />
          <Route
            path="/empresa/afiliaciones-rechazadas"
            element={
              <PrivateRoute>
                <AfiliacionesRechazadas />
              </PrivateRoute>
            }
          />

          {/*Rutas Organizador)*/}
          <Route
            path="/organizador"
            element={
              <PrivateRoute>
                <OrganizerDashboard />
              </PrivateRoute>
            }
          />
          <Route path="/eventos/crear" element={<CrearEventoPage />} />
          <Route path="/eventos/editar/:id" element={<EditarEventoPage />} />

          {/*Gestion de roles (subruta de asistente)*/}

          <Route
            path="/"
            element={<Navigate to="/login" replace />}
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>

  );
}

export default App;