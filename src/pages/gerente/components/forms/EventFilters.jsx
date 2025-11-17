import React from 'react';
import { Search } from 'lucide-react';
import styles from '../../styles/eventosPage.module.css';

const EventFilters = ({
    searchTerm,
    filtroOrganizador,
    organizadores,
    eventosCount,
    totalEventos,
    onSearchChange,
    onOrganizadorChange,
    onClearFilters,
    hasActiveFilters
}) => {
    return (
        <div className={styles.filtersSection}>
            <div className={styles.filtersRow}>
                <div className={styles.searchContainer}>
                    <div className={styles.searchWrapper}>
                        <Search size={20} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Buscar eventos por nombre..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>
                </div>

                <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>
                        Filtrar por Organizador:
                    </label>
                    <select
                        value={filtroOrganizador}
                        onChange={(e) => onOrganizadorChange(e.target.value)}
                        className={styles.filterSelect}
                    >
                        <option value="">Todos los organizadores</option>
                        {organizadores.map((org) => (
                            <option key={org.id} value={org.nombre}>
                                {org.nombre}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className={styles.filterInfo}>
                <span className={styles.resultCount}>
                    Mostrando <strong>{eventosCount}</strong> de {totalEventos} eventos
                    {filtroOrganizador && ` para ${filtroOrganizador}`}
                </span>

                {hasActiveFilters && (
                    <button className={styles.btnClearFilter} onClick={onClearFilters}>
                        Limpiar Filtros
                    </button>
                )}
            </div>
        </div>
    );
};

export default EventFilters;