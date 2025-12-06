import React from 'react';
import { useGerenteDashboard } from '../hooks/useGerenteDashboard';
import GerenteSidebar from '../../../layouts/Sidebar/sidebarGerente/GerenteSidebar';
import Header from '../../../layouts/Header/header';
import WelcomeCard from '../../gerente/components/dashboard/WelcomeCard';
import StatsCards from '../../gerente/components/dashboard/StatsCards';
import TeamCard from '../../gerente/components/dashboard/TeamCard';
import ActivitiesCard from '../../gerente/components/dashboard/ActivitiesCard';
import LoadingState from '../../gerente/components/shared/LoadingState';
import ErrorState from '../../gerente/components/shared/ErrorState';
import styles from '../styles/GerenteDashboard.module.css';
import Footer from '../../../layouts/FooterAsistente/footer'

const GerenteDashboard = () => {
  const {
    user,
    equipo,
    stats,
    loading,
    error,
    reloadTeam
  } = useGerenteDashboard();

  if (loading) {
    return <LoadingState message="Cargando dashboard..." />;
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={reloadTeam}
      />
    );
  }

  return (
    <div className={styles.gerenteLayout}>
      <GerenteSidebar />

      <div className={styles.gerenteContent}>
        <Header />

        <main className={styles.gerenteMain}>
          <WelcomeCard user={user} />

          <StatsCards stats={stats} />

          <div className={styles.dashboardGrid}>
            <TeamCard
              equipo={equipo}
              onReload={reloadTeam}
            />

            <ActivitiesCard />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default GerenteDashboard;