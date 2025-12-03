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
import EditarEventoPage from './pages/organizador/Eventos/EditarEventoPage';
import Asistente from './pages/asistente/AsistentePanel';

import OrganizerDashboard from './pages/organizador/OrganizerDashboard';
import PonenteDashboard from './pages/ponente/containers/PonenteDashboard';
import CrearEventoPage from './pages/organizador/Eventos/CrearEventoPage';
import GestionarAgendaPage from './pages/organizador/Agenda/GestionarAgendaPage';
import CrearActividadPage from './pages/organizador/Actividades/CrearActividadPage';
import EditarActividadPage from './pages/organizador/Actividades/EditarActividadPage';
import ActividadesPage from './pages/organizador/Actividades/ActividadesPage';
import EventosPageOrganizador from './pages/organizador/Eventos/EventosPageOrganizador';
import GestionAsistentes from './pages/organizador/asistencia';
import EstadisticasAsistencia from './pages/organizador/EstadisticasAsistencia';
import OrganizadorNotificaciones from './pages/organizador/Notificaciones/OrganizadorNotificaciones';
import EncuestasManager from './pages/organizador/Encuestas/EncuestasManager';

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
            path="/admin/*"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />

          {/* Rutas de Gerente */}
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

          {/* Rutas para Asistente - CORREGIDAS */}
          <Route
            path="/asistente/*"
            element={
              <PrivateRoute>
                <Asistente />
              </PrivateRoute>
            }
          />

          {/* Rutas específicas del asistente para mantener compatibilidad */}
          <Route
            path="/asistente/dashboard"
            element={
              <PrivateRoute>
                <Asistente />
              </PrivateRoute>
            }
          />
          <Route
            path="/asistente/eventos"
            element={
              <PrivateRoute>
                <Asistente />
              </PrivateRoute>
            }
          />
          <Route
            path="/asistente/agenda"
            element={
              <PrivateRoute>
                <Asistente />
              </PrivateRoute>
            }
          />
          <Route
            path="/asistente/inscripciones"
            element={
              <PrivateRoute>
                <Asistente />
              </PrivateRoute>
            }
          />

          {/* Ruta para gestión de empresa */}
          <Route
            path="/empresa"
            element={
              <PrivateRoute>
                <Empresa />
              </PrivateRoute>
            }
          />

          {/* Rutas para gestión de afiliaciones */}
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
          <Route path="/organizador/eventos" element={<EventosPageOrganizador />} />
          <Route path="/organizador/eventos/crear" element={<CrearEventoPage />} />
          <Route path="/organizador/eventos/editar/:id" element={<EditarEventoPage />} />
          <Route path="/organizador/eventos/:eventoId/agenda" element={<GestionarAgendaPage />} />
          <Route
            path="/organizador/eventos/:eventoId/actividades/crear"
            element={<CrearActividadPage />}
          />

          <Route
            path="/organizador/actividades/:idActividad/editar"
            element={<EditarActividadPage />}
          />


          <Route
            path="/organizador/agenda"
            element={<ActividadesPage />}
          />

          <Route
            path="/organizador/reportes"
            element={
              <PrivateRoute>
                <EstadisticasAsistencia />
              </PrivateRoute>
            }
          />

          <Route
            path="/organizador/encuestas"
            element={
              <PrivateRoute>
                <EncuestasManager />
              </PrivateRoute>
            }
          />

          <Route
            path="/organizador/asistentes"
            element={
              <PrivateRoute>
                <GestionAsistentes />
              </PrivateRoute>
            }
          />

          <Route
            path="/organizador/notificaciones"
            element={
              <PrivateRoute>
                <OrganizadorNotificaciones />
              </PrivateRoute>
            }
          />

          {/* Rutas Ponente */}
          <Route
            path="/ponente"
            element={
              <PrivateRoute>
                <PonenteDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/ponente/dashboard"
            element={
              <PrivateRoute>
                <PonenteDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/ponente/eventos"
            element={
              <PrivateRoute>
                <PonenteDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/ponente/agenda"
            element={
              <PrivateRoute>
                <PonenteDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/ponente/actividades"
            element={
              <PrivateRoute>
                <PonenteDashboard />
              </PrivateRoute>
            }
          />
          {/* Ruta por defecto */}
          <Route
            path="/"
            element={<Navigate to="/login" replace />}
          />

          {/* Ruta 404 - Página no encontrada */}
          <Route
            path="*"
            element={
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <h2>404 - Página no encontrada</h2>
                <p>La página que buscas no existe.</p>
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;