import React from 'react';
import { useLocations } from '../hooks/useLocations';
import GerenteSidebar from '../../../layouts/Sidebar/sidebarGerente/GerenteSidebar';
import Header from '../../../layouts/Header/header';
import SearchBar from '../components/shared/SearchBar';
import LocationsList from '../components/lists/LocationsList';
import LocationForm from '../components/forms/LocationForm';
import EditLocationModal from '../components/modals/EditLocationModal';
import DeleteConfirmationModal from '../components/modals/DeleteConfirmationModal';
import NotificationSystem from '../components/shared/NotificationSystem';
import LoadingState from '../components/shared/LoadingState';
import styles from '../styles/ubicaciones.module.css';

const UbicacionesContainer = () => {
    const {
        ubicaciones,
        filteredUbicaciones,
        empresa,
        ciudades,
        searchTerm,
        loading,
        sidebarCollapsed,
        showModal,
        showEditModal,
        showDeleteModal,
        editingUbicacion,
        deletingUbicacion,
        formData,
        handleCreate,
        handleUpdate,
        handleDelete,
        openCreateModal,
        openEditModal,
        openDeleteModal,
        closeAllModals,
        handleInputChange,
        handleSearchChange,
        handleSidebarToggle,
        notifications,
        closeNotification
    } = useLocations();

    return (
        <>
            {/* NOTIFICATION SYSTEM FUERA DEL APP CONTAINER - NIVEL SUPERIOR */}
            <NotificationSystem
                notifications={Array.isArray(notifications) ? notifications : []}
                onClose={closeNotification}
            />
            
            <div className={styles.appContainer}>
                <GerenteSidebar onToggle={handleSidebarToggle} />
                
                <div className={`${styles.mainLayout} ${sidebarCollapsed ? styles.sidebarCollapsed : styles.sidebarExpanded}`}>
                    <div className={styles.mainContent}>
                        <Header />

                        <div className={styles.ubicacionesContainer}>
                            <div className={styles.ubicacionesHeader}>
                                <div className={styles.headerText}>
                                    <h1>Ubicaciones</h1>
                                    <p className={styles.subtitle}>
                                        Empresa: {empresa?.nombre || 'Cargando...'}
                                    </p>
                                </div>
                                <div className={styles.headerActions}>
                                    <button
                                        className={styles.btnCreate}
                                        onClick={openCreateModal}
                                        disabled={!empresa}
                                    >
                                        <span>+</span> Crear Ubicación
                                    </button>
                                </div>
                            </div>

                            <div className={styles.ubicacionesContent}>
                                <SearchBar
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    placeholder="Buscar por nombre o dirección..."
                                />

                                <LocationsList
                                    ubicaciones={filteredUbicaciones}
                                    onEdit={openEditModal}
                                    onDelete={openDeleteModal}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {showModal && (
                    <LocationForm
                        title="Crear Nueva Ubicación"
                        formData={formData}
                        ciudades={ciudades}
                        empresa={empresa}
                        onSubmit={handleCreate}
                        onClose={closeAllModals}
                        onInputChange={handleInputChange}
                    />
                )}

                {showEditModal && editingUbicacion && (
                    <EditLocationModal
                        ubicacion={editingUbicacion}
                        formData={formData}
                        ciudades={ciudades}
                        empresa={empresa}
                        onSubmit={handleUpdate}
                        onClose={closeAllModals}
                        onInputChange={handleInputChange}
                    />
                )}

                {showDeleteModal && deletingUbicacion && (
                    <DeleteConfirmationModal
                        item={deletingUbicacion}
                        itemType="ubicación"
                        itemName={deletingUbicacion.lugar}
                        onConfirm={handleDelete}
                        onClose={closeAllModals}
                    />
                )}
            </div>
        </>
    );
};

export default UbicacionesContainer;