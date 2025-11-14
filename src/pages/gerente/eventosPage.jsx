import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../gerente/eventosPage.module.css';
import Header from '../../layouts/Header/header';
import Calendar from '../../assets/calendar.png';
import Cupos from '../../assets/cupos.png';
import Edificio from '../../assets/edificio.png';
import Lugar from '../../assets/lugar.png';
import GerenteSidebar from './GerenteSidebar';
import { obtenerEventos } from "../../components/eventosService";

const EventosPage = () => {
    const navigate = useNavigate();
    const [eventos, setEventos] = useState([]);
    const [eventosFiltrados, setEventosFiltrados] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [organizadores, setOrganizadores] = useState([]);
    const [filtroOrganizador, setFiltroOrganizador] = useState('');
    const [loading, setLoading] = useState(true);
    const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const sanitizarEvento = useCallback((evento) => {
        const sanitizado = { ...evento };

        Object.keys(sanitizado).forEach(key => {
            let value = sanitizado[key];

            if (typeof value === 'object' && value !== null) {
                if (value.nombre !== undefined) {
                    value = value.nombre;
                } else if (value.texto !== undefined) {
                    value = value.texto;
                } else if (value.id !== undefined) {
                    value = value.id;
                } else {
                    const stringKeys = Object.keys(value).filter(k => typeof value[k] === 'string');
                    value = stringKeys.length > 0 ? value[stringKeys[0]] : JSON.stringify(value);
                }
                sanitizado[key] = value;
            }
        });

        return sanitizado;
    }, []);

    const cargarEventos = async () => {
        try {
            setLoading(true);
            const data = await obtenerEventos();

            const eventosSanitizados = data.data.map(sanitizarEvento);
            setEventos(eventosSanitizados);
            setEventosFiltrados(eventosSanitizados);

            const organizadoresUnicos = data.data.reduce((acc, evento) => {
                if (evento.creador?.nombre) {
                    const nombreOrganizador = evento.creador.nombre;
                    if (!acc.find(org => org.nombre === nombreOrganizador)) {
                        acc.push({
                            id: evento.creador.id,
                            nombre: nombreOrganizador,
                            correo: evento.creador.correo
                        });
                    }
                }
                return acc;
            }, []);

            setOrganizadores(organizadoresUnicos);

        } catch (error) {
            console.error("Error al cargar eventos:", error.message);
            if (error.message?.includes("Token inválido")) {
                alert("Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.");
            }
        } finally {
            setLoading(false);
        }
    };

    const aplicarFiltros = useCallback(() => {
        let filtered = eventos;

        if (searchTerm) {
            filtered = filtered.filter(evento =>
                evento.titulo?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filtroOrganizador) {
            filtered = filtered.filter(evento => evento.creador === filtroOrganizador);
        }

        setEventosFiltrados(filtered);
    }, [searchTerm, filtroOrganizador, eventos]);

    const verDetallesEvento = (evento) => {
        setEventoSeleccionado(evento);
        setShowModal(true);
    };

    const cerrarModal = () => {
        setShowModal(false);
        setEventoSeleccionado(null);
    };

    const handleSidebarToggle = (isCollapsed) => {
        setSidebarCollapsed(isCollapsed);
    };

    const limpiarFiltros = () => {
        setSearchTerm('');
        setFiltroOrganizador('');
    };

    const formatFecha = (fecha) => {
        if (!fecha) return 'Fecha no definida';
        return new Date(fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatHora = (hora) => {
        if (!hora || hora === '00:00:00') return '';
        return hora.substring(0, 5);
    };

    const getLugarTexto = (evento) => {
        return evento.lugar || evento.ubicacion || 'Lugar por definir';
    };

    const getEstadoEvento = (evento) => {
        const cuposDisponibles = evento.cupos_disponibles || evento.cupo_disponible || evento.cupos || 0;
        const cuposTotales = evento.cupos || cuposDisponibles;

        if (cuposDisponibles > 0) {
            const porcentaje = cuposTotales > 0 ? Math.round((cuposDisponibles / cuposTotales) * 100) : 0;
            return {
                texto: `${cuposDisponibles} CUPOS DISPONIBLES`,
                clase: 'statusAvailable',
                porcentaje
            };
        } else {
            return {
                texto: 'EVENTO LLENO',
                clase: 'statusFull',
                porcentaje: 0
            };
        }
    };

    useEffect(() => {
        cargarEventos();
    }, []);

    useEffect(() => {
        aplicarFiltros();
    }, [aplicarFiltros]);

    if (loading) {
        return (
            <div className={styles.asistenteContainer}>
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p>Cargando eventos...</p>
                </div>
            </div>
        );
    }

    const EventoCard = ({ evento }) => {
        const estado = getEstadoEvento(evento);
        const fechaInicio = formatFecha(evento.fecha_inicio || evento.fecha);
        const hora = formatHora(evento.hora);

        return (
            <div className={styles.eventCard}>
                <div className={styles.eventCardHeader}>
                    <div className={styles.eventHeader}>
                        <div className={styles.eventTitleSection}>
                            <h3 className={styles.eventTitle}>
                                {evento.titulo || evento.nombre || 'Evento sin título'}
                            </h3>
                            <span className={styles.eventCategory}>
                                {evento.modalidad || 'Presencial'}
                            </span>
                        </div>
                        <span className={`${styles.eventStatus} ${styles[estado.clase]}`}>
                            {estado.texto}
                        </span>
                    </div>
                </div>

                <div className={styles.eventCardContent}>
                    {estado.porcentaje !== undefined && (
                        <div className={styles.cuposProgress}>
                            <div className={styles.progressHeader}>
                                <span className={styles.progressLabel}>Cupos disponibles</span>
                                <span className={styles.progressPercentage}>{estado.porcentaje}%</span>
                            </div>
                            <div className={styles.progressBar}>
                                <div
                                    className={`${styles.progressFill} ${styles[estado.clase]}`}
                                    style={{ width: `${estado.porcentaje}%` }}
                                />
                            </div>
                            <span className={styles.progressText}>
                                {evento.cupos_disponibles || evento.cupo_disponible || 0} de {evento.cupos || 'N/A'} cupos disponibles
                            </span>
                        </div>
                    )}

                    {evento.descripcion && evento.descripcion !== 'null' && (
                        <p className={styles.eventDescription}>
                            {evento.descripcion}
                        </p>
                    )}

                    <div className={styles.eventDetails}>
                        <DetailItem
                            icon={Calendar}
                            label="Fecha y hora"
                            value={`${fechaInicio}${hora ? ` - ${hora}` : ''}`}
                        />
                        <DetailItem
                            icon={Lugar}
                            label="Ubicación"
                            value={getLugarTexto(evento)}
                        />
                        <DetailItem
                            icon={Cupos}
                            label="Capacidad total"
                            value={`${evento.cupos || evento.cupos_disponibles || evento.cupo_disponible || 'N/A'} cupos`}
                        />
                        {evento.creador && (
                            <DetailItem
                                icon={Edificio}
                                label="Organizador"
                                value={evento.creador}
                            />
                        )}
                    </div>

                    <div className={styles.eventActions}>
                        <button
                            className={styles.btnVerDetalles}
                            onClick={() => verDetallesEvento(evento)}
                        >
                            Ver Detalles Completos
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const DetailItem = ({ icon, label, value }) => (
        <div className={styles.detailItem}>
            <span className={styles.detailIcon}>
                <img src={icon} alt={label} className={styles.iconImage} />
            </span>
            <div className={styles.detailContent}>
                <span className={styles.detailLabel}>{label}</span>
                <span className={styles.detailValue}>{value}</span>
            </div>
        </div>
    );

    return (
        <div className={styles.asistenteContainer}>
            <Header />
            <div className={styles.mainLayout}>
                <GerenteSidebar onToggle={handleSidebarToggle} />

                <div className={`${styles.contentArea} ${sidebarCollapsed ? styles.sidebarCollapsed : styles.sidebarExpanded}`}>
                    <div className={styles.pageHeader}>
                        <h1 className={styles.pageTitle}>Eventos</h1>
                    </div>

                    <div className={styles.filtersSection}>
                        <div className={styles.searchContainer}>
                            <div className={styles.searchWrapper}>
                                <input
                                    type="text"
                                    placeholder="Buscar eventos por nombre..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
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
                                onChange={(e) => setFiltroOrganizador(e.target.value)}
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

                        <div className={styles.filterInfo}>
                            <span className={styles.resultCount}>
                                Mostrando <strong>{eventosFiltrados.length}</strong> de {eventos.length} eventos
                                {filtroOrganizador && ` para ${filtroOrganizador}`}
                            </span>
                        </div>

                        {(searchTerm || filtroOrganizador) && (
                            <button className={styles.btnClearFilter} onClick={limpiarFiltros}>
                                Limpiar Filtros
                            </button>
                        )}
                    </div>

                    {eventosFiltrados.length === 0 ? (
                        <div className={styles.noEventsCard}>
                            <h3>
                                {eventos.length === 0
                                    ? "No hay eventos disponibles en este momento."
                                    : "No se encontraron eventos con los filtros aplicados."}
                            </h3>
                            <p>Intenta ajustar tus filtros de búsqueda o verifica más tarde.</p>
                            {eventos.length > 0 && (searchTerm || filtroOrganizador) && (
                                <button className={styles.btnShowAll} onClick={limpiarFiltros}>
                                    Ver todos los eventos
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className={styles.eventsGrid}>
                            {eventosFiltrados.map((evento) => (
                                <EventoCard key={evento.id} evento={evento} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <EventoModal
                show={showModal}
                evento={eventoSeleccionado}
                onClose={cerrarModal}
                formatFecha={formatFecha}
                formatHora={formatHora}
                getLugarTexto={getLugarTexto}
                getEstadoEvento={getEstadoEvento}
            />
        </div>
    );
};

const EventoModal = ({ show, evento, onClose, formatFecha, formatHora, getLugarTexto, getEstadoEvento }) => {
    if (!show || !evento) return null;

    const estado = getEstadoEvento(evento);

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>Detalles del Evento</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        ×
                    </button>
                </div>

                <div className={styles.modalBody}>
                    <div className={styles.eventHeaderModal}>
                        <h3>{evento.titulo}</h3>
                        <span className={`${styles.eventStatus} ${styles[estado.clase]}`}>
                            {estado.texto}
                        </span>
                    </div>

                    <div className={styles.eventInfoGrid}>
                        <InfoSection title="Información General">
                            <InfoItem label="Descripción:" value={evento.descripcion || 'No disponible'} isParagraph />
                            <InfoItem label="Modalidad:" value={evento.modalidad || 'No especificado'} />
                            <InfoItem label="Estado:" value={evento.estado === 1 ? 'Activo' : 'Inactivo'} />
                        </InfoSection>

                        <InfoSection title="Fechas y Horarios">
                            <InfoItem label="Fecha de inicio:" value={formatFecha(evento.fecha_inicio)} />
                            <InfoItem label="Fecha de fin:" value={formatFecha(evento.fecha_fin)} />
                            <InfoItem label="Hora:" value={formatHora(evento.hora) || 'No especificada'} />
                        </InfoSection>

                        <InfoSection title="Ubicación">
                            <InfoItem label="Lugar:" value={getLugarTexto(evento)} />
                        </InfoSection>

                        <InfoSection title="Capacidad y Organización">
                            <InfoItem label="Cupos totales:" value={evento.cupos || 'No definido'} />
                            <InfoItem
                                label="Cupos disponibles:"
                                value={evento.cupos_disponibles ?? evento.cupo_disponible ?? 'N/A'}
                            />
                            <InfoItem label="Organizador:" value={evento.creador || 'No especificado'} />
                            <InfoItem label="Empresa:" value={evento.empresa || 'No especificado'} />
                        </InfoSection>
                    </div>

                    <div className={styles.modalActions}>
                        <button className={styles.btnCancel} onClick={onClose}>
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const InfoSection = ({ title, children }) => (
    <div className={styles.infoSection}>
        <h4>{title}</h4>
        {children}
    </div>
);

const InfoItem = ({ label, value, isParagraph = false }) => (
    <div className={styles.infoItem}>
        <label>{label}</label>
        {isParagraph ? (
            <p>{value}</p>
        ) : (
            <span>{value}</span>
        )}
    </div>
);

export default EventosPage;