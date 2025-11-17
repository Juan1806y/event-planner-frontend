import React from 'react';
import { usePlaces } from '../hooks/usePlaces';
import GerenteSidebar from '../../../layouts/Sidebar/sidebarGerente/GerenteSidebar';
import Header from '../../../layouts/Header/header';
import PageHeader from '../components/shared/PageHeader';
import SearchBar from '../components/shared/SearchBar';
import PlacesList from '../components/lists/PlacesList';
import PlaceForm from '../components/forms/PlaceForm';
import EditPlaceModal from '../components/modals/EditPlaceModal';
import DeleteConfirmationModal from '../components/modals/DeleteConfirmationModal';
import NotificationSystem from '../components/shared/NotificationSystem';
import LoadingState from '../components/shared/LoadingState';
import styles from '../styles/lugares.module.css';

const LugaresContainer = () => {
    const {
        lugares,
        filteredLugares,
        empresas,
        ubicaciones,
        searchTerm,
        filterEmpresa,
        empresaSeleccionada,
        loading,
        sidebarCollapsed,
        showModal,
        showEditModal,
        showDeleteModal,
        editingLugar,
        deletingLugar,
        formData,
        handleCreate,
        handleUpdate,
        handleDelete,
        handleFilterChange,
        openCreateModal,
        openEditModal,
        openDeleteModal,
        closeAllModals,
        handleInputChange,
        handleSearchChange,
        handleSidebarToggle,
        notifications,
        closeNotification
    } = usePlaces();

    return (
        <div className={styles.lugaresPage}>
            <GerenteSidebar onToggle={handleSidebarToggle} />

            <NotificationSystem
                notifications={notifications}
                onClose={closeNotification}
            />

            <div className={`${styles.mainContent} ${sidebarCollapsed ? styles.sidebarCollapsed : styles.sidebarExpanded}`}>
                <Header />

                <div className={styles.lugaresContainer}>
                    <div className={styles.lugaresHeader}>
                        <div className={styles.headerTitle}>
                            <h1>Lugares</h1>
                            {empresaSeleccionada && (
                                <p className={styles.empresaInfo}>
                                    Empresa: {empresaSeleccionada.nombre}
                                </p>
                            )}
                        </div>
                        <button
                            className={styles.btnCreate}
                            onClick={openCreateModal}
                            disabled={!empresaSeleccionada}
                        >
                            + Crear Lugar
                        </button>
                    </div>

                    <div className={styles.lugaresContent}>
                        <div className={styles.filtersSection}>
                            <SearchBar
                                value={searchTerm}
                                onChange={handleSearchChange}
                                placeholder="Buscar por nombre o descripción..."
                            />
                        </div>

                        <PlacesList
                            lugares={filteredLugares}
                            onEdit={openEditModal}
                            onDelete={openDeleteModal}
                        />
                    </div>
                </div>
            </div>

            {showModal && empresaSeleccionada && (
                <PlaceForm
                    title="Crear Nuevo Lugar"
                    formData={formData}
                    ubicaciones={ubicaciones}
                    empresa={empresaSeleccionada}
                    onSubmit={handleCreate}
                    onClose={closeAllModals}
                    onInputChange={handleInputChange}
                />
            )}

            {showEditModal && editingLugar && empresaSeleccionada && (
                <EditPlaceModal
                    lugar={editingLugar}
                    formData={formData}
                    ubicaciones={ubicaciones}
                    empresa={empresaSeleccionada}
                    onSubmit={handleUpdate}
                    onClose={closeAllModals}
                    onInputChange={handleInputChange}
                />
            )}

            {showDeleteModal && deletingLugar && (
                <DeleteConfirmationModal
                    item={deletingLugar}
                    itemType="lugar"
                    itemName={deletingLugar.nombre}
                    onConfirm={handleDelete}
                    onClose={closeAllModals}
                />
            )}
        </div>
    );
};

export default LugaresContainer;