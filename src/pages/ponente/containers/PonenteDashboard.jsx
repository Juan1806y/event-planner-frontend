import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { usePonenteAgenda } from '../hooks/usePonenteAgenda';
import { useEventosActividadesAceptadas } from '../hooks/useEventosActividadesAceptadas';
import Sidebar from '../../../layouts/Sidebar/sidebarPonente/sidebar';
import Header from '../../../layouts/Header/header';
import DashboardSection from '../components/sections/DashboardSection';
import EventosSection from '../components/sections/EventosSection';
import AgendaSection from '../components/sections/AgendaSection';
import MisActividadesSection from '../components/sections/MisActividadesSection';
import EncuestasSection from '../components/sections/EncuestasSection';
import styles from '../components/styles/PonenteDashboard.module.css';

const PonenteDashboard = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState(null);

  const { user } = useAuth();

  const { actividades, loading, error, refetch } = usePonenteAgenda();

  const {
    eventos: eventosAceptados,
    loading: loadingEventos,
    error: errorEventos
  } = useEventosActividadesAceptadas();

  const handleNavigate = (view) => {
    setCurrentView(view);
  };

  const handleToggleSidebar = (collapsed) => {
    setIsMenuCollapsed(collapsed);
  };

  const obtenerIdPonente = () => {
    if (!user) return null;

    if (user.rol === 'ponente' && user.rolData?.id_ponente) {
      return user.rolData.id_ponente;
    }

    return null;
  };

  const ponenteId = obtenerIdPonente();

  const renderSection = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardSection actividades={actividades} loading={loading} />;
      case 'eventos':
        return <EventosSection onEventoSelect={setSelectedEvento} />;
      case 'agenda':
        return <AgendaSection evento={selectedEvento} />;
      case 'actividades':
        return <MisActividadesSection actividades={actividades} onSolicitudEnviada={refetch} error={error} />;
      case 'encuestas':
        return <EncuestasSection
          eventos={eventosAceptados || []}
          loadingEventos={loadingEventos}
          errorEventos={errorEventos}
          ponenteId={ponenteId}
        />;
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