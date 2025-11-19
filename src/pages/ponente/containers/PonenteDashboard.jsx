import { useState } from 'react';
import { usePonenteAgenda } from '../hooks/usePonenteAgenda';
import Sidebar from '../../../layouts/Sidebar/sidebarPonente/sidebar';
import Header from '../../../layouts/Header/header';
import DashboardSection from '../components/sections/DashboardSection';
import EventosSection from '../components/sections/EventosSection';
import AgendaSection from '../components/sections/AgendaSection';
import MisActividadesSection from '../components/sections/MisActividadesSection';
import styles from '../components/styles/PonenteDashboard.module.css';

const PonenteDashboard = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState(null);
  
  const { actividades, loading, error, refetch } = usePonenteAgenda();

  console.log('🔍 PonenteDashboard - Estado actual:', {
    currentView,
    actividadesCount: actividades?.length,
    loading,
    error
  });

  const handleNavigate = (view) => {
    console.log('🔄 Navegando a:', view);
    setCurrentView(view);
  };

  const handleToggleSidebar = (collapsed) => {
    setIsMenuCollapsed(collapsed);
  };

  const renderSection = () => {
    console.log('🎯 Renderizando sección:', currentView);
    
    switch (currentView) {
      case 'dashboard':
        return <DashboardSection actividades={actividades} loading={loading} />;
      case 'eventos':
        return <EventosSection onEventoSelect={setSelectedEvento} />;
      case 'agenda':
        return <AgendaSection evento={selectedEvento} />;
      case 'actividades':
        return <MisActividadesSection actividades={actividades} onSolicitudEnviada={refetch} />;
      default:
        return <DashboardSection actividades={actividades} loading={loading} />;
    }
  };

  return (
    <div className={styles.dashboard}>
      <Sidebar 
        onToggle={handleToggleSidebar}
        onNavigate={handleNavigate}
        currentView={currentView}
      />
      <div className={`${styles.mainContent} ${isMenuCollapsed ? styles.menuCollapsed : ''}`}>
        <Header isMenuCollapsed={isMenuCollapsed} />
        <div className={styles.content}>
          {renderSection()}
        </div>
      </div>
    </div>
  );
};

export default PonenteDashboard;