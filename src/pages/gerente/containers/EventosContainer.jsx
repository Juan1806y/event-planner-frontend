import React from 'react';
import { useEvents } from '../hooks/useEvents';
import GerenteSidebar from '../../../layouts/Sidebar/sidebarGerente/GerenteSidebar';
import Header from '../../../layouts/Header/header';
import PageHeader from '../components/shared/PageHeader';
import EventFilters from '../components/forms/EventFilters';
import EventsList from '../components/lists/EventsList';
import EventDetailsModal from '../components/modals/EventDetailsModal';
import NotificationSystem from '../components/shared/NotificationSystem';
import LoadingState from '../components/shared/LoadingState';
import styles from '../styles/eventosPage.module.css';

const EventosContainer = () => {
    const {
        eventos,
        eventosFiltrados,
        organizadores,
        searchTerm,
        filtroOrganizador,
        loading,
        sidebarCollapsed,
        showModal,
        eventoSeleccionado,
        verDetallesEvento,
        cerrarModal,
        handleSearchChange,
        handleOrganizadorFilterChange,
        handleSidebarToggle,
        limpiarFiltros,
        recargarEventos,
        formatFecha,
        formatHora,
        getLugarTexto,
        getEstadoEvento,
        notifications,
        closeNotification
    } = useEvents();

    if (loading) {
        return (
            <div className={styles.asistenteContainer}>
                <LoadingState message="Cargando eventos..." />
            </div>
        );
    }

    return (
        <div className={styles.asistenteContainer}>
            <GerenteSidebar onToggle={handleSidebarToggle} />

            <NotificationSystem
                notifications={notifications}
                onClose={closeNotification}
            />

            <div className={styles.mainLayout}>
                <div className={`${sidebarCollapsed ? styles.sidebarCollapsed : styles.sidebarExpanded}`}>
                    <Header />

                    <div className={styles.contentArea}>
                        <div className={styles.pageHeader}>
                            <PageHeader
                                title="Eventos"
                                subtitle={`Total: ${eventos.length} eventos`}
                            />
                        </div>

                        <div className={styles.filtersSection}>
                            <EventFilters
                                searchTerm={searchTerm}
                                filtroOrganizador={filtroOrganizador}
                                organizadores={organizadores}
                                eventosCount={eventosFiltrados.length}
                                totalEventos={eventos.length}
                                onSearchChange={handleSearchChange}
                                onOrganizadorChange={handleOrganizadorFilterChange}
                                onClearFilters={limpiarFiltros}
                                hasActiveFilters={!!(searchTerm || filtroOrganizador)}
                            />
                        </div>

                        <EventsList
                            eventos={eventosFiltrados}
                            onVerDetalles={verDetallesEvento}
                            formatFecha={formatFecha}
                            formatHora={formatHora}
                            getLugarTexto={getLugarTexto}
                            getEstadoEvento={getEstadoEvento}
                            sidebarCollapsed={sidebarCollapsed}
                        />
                    </div>
                </div>
            </div>

            {showModal && eventoSeleccionado && (
                <EventDetailsModal
                    evento={eventoSeleccionado}
                    onClose={cerrarModal}
                    formatFecha={formatFecha}
                    formatHora={formatHora}
                    getLugarTexto={getLugarTexto}
                    getEstadoEvento={getEstadoEvento}
                />
            )}
        </div>
    );
};

export default EventosContainer;