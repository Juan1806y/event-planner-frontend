import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import styles from './admin.module.css';
import Menu from '../../layouts/Sidebar/sidebarAdmin/menu';
import Header from '../../layouts/Header/header';
import Roles from './components/sections/RoleSection';
import Usuarios from './components/sections/UsuariosSection';
import AfiliacionesPendientes from './components/sections/AfiliacionesPendientesSection';
import AfiliacionesAprobadas from './components/sections/AfiliacionesAprobadasSection';
import AfiliacionesRechazadas from './components/sections/AfiliacionesRechazadasSection';
import AdminDashboard from './components/dashboard/AdminDashboard';
import ConfigurationSection from './ConfiguracionSection';

const Admin = () => {
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);

  return (
    <div className={styles.adminLayout}>
      <div className={styles.sidebar}>
        <Menu onToggle={setIsMenuCollapsed} />
      </div>

      <div className={`${styles.mainContent} ${isMenuCollapsed ? styles.menuCollapsed : ''}`}>
        <Header isSidebarCollapsed={isMenuCollapsed} />
        <div className={styles.dashboardContent}>
          <Routes>
            {/* Ruta para /admin */}
            <Route index element={<Navigate to="dashboard" replace />} />
            
            {/* Ruta para /admin/dashboard */}
            <Route path="dashboard" element={<AdminDashboard />} />
            
            {/* Ruta para /admin/roles */}
            <Route path="roles" element={<Roles />} />
            
            {/* Ruta para /admin/usuarios */}
            <Route path="usuarios" element={<Usuarios />} />
            
            {/* Rutas para afiliaciones */}
            <Route path="afiliaciones-pendientes" element={<AfiliacionesPendientes />} />
            <Route path="afiliaciones-aprobadas" element={<AfiliacionesAprobadas />} />
            <Route path="afiliaciones-rechazadas" element={<AfiliacionesRechazadas />} />
            
            {/* Ruta de fallback */}
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Admin;