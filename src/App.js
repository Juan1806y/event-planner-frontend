import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
//import Login from './components/login';
import Login from './pages/Login';
import Dashboard from './components/Dashboard';
import Admin from './pages/admin/admin';
import Roles from './pages/admin/roles';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import Empresa from './pages/empresa/empresa';
import Usuarios from './pages/admin/usuarios';
import AdminLogin from './pages/AdminLogin';
import Register from './pages/register';
import ForgotPassword from './pages/ForgotPassword';
import GerenteDashboard from './pages/gerente/GerenteDashboard';
import ActualizarEmpresa from './pages/gerente/ActualizarEmpresa';
import AfiliacionesAprobadas from './pages/empresa/afiliacionesAprobadas';
import AfiliacionesPendientes from './pages/empresa/afiliacionesPendientes';
import AfiliacionesRechazadas from './pages/empresa/afiliacionesRechazadas';
import EventosPage from './pages/gerente/eventosPage';
import CrearOrganizador from './pages/gerente/CrearOrganizadorPage';
import Ubicaciones from './pages/gerente/ubicaciones';
import Lugares from './pages/gerente/lugares';
import EditarEventoPage from './pages/organizador/Eventos/EditarEventoPage';
import Asistente from './pages/asistente/asistente';

import OrganizerDashboard from './pages/organizador/OrganizerDashboard';
import CrearEventoPage from './pages/organizador/Eventos/CrearEventoPage';
import GestionarAgendaPage from './pages/organizador/Agenda/GestionarAgendaPage';
import CrearActividadPage from './pages/organizador/Actividades/CrearActividadPage';
import EditarActividadPage from './pages/organizador/Actividades/EditarActividadPage';
import ActividadesPage from './pages/organizador/Actividades/ActividadesPage';
import EventosPageOrganizador from './pages/organizador/Eventos/EventosPageOrganizador';
function App() {
  return (
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

        {/* Rutas de Gerente */}
        <Route path="/gerente" element={<GerenteDashboard />} />
        <Route path="/gerente/actualizar-empresa" element={<ActualizarEmpresa />} />
        <Route path="/gerente/ubicaciones" element={<Ubicaciones />} />
        <Route path="/gerente/lugares" element={<Lugares />} />
        {/*<Route path="/gerente/solicitudes" element={<GerenteSolicitudes />} />
        <Route path="/gerente/configuracion" element={<GerenteConfiguracion />} />*/}
        <Route path="/gerente/crear-organizador" element={<CrearOrganizador />} />
        <Route path="/gerente/eventos" element={<EventosPage />} />

        {/* Ruta del panel de administración */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />
        {/* Gestión de roles (subruta de admin) */}
        <Route
          path="/admin/roles"
          element={
            <AdminRoute>
              <Roles />
            </AdminRoute>
          }
        />

        {/*Gestión de usuarios (subruta de admin)*/}
        <Route
          path="/admin/usuarios"
          element={
            <AdminRoute>
              <Usuarios />
            </AdminRoute>
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
        <Route path="/eventos" element={<EventosPageOrganizador />} />
        <Route path="/eventos/crear" element={<CrearEventoPage />} />
        <Route path="/eventos/editar/:id" element={<EditarEventoPage />} />
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



        {/*Gestion de roles (subruta de asistente)*/}

        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>

  );
}

export default App;