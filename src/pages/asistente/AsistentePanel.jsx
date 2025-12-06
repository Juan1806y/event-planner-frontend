import React, { useState, useEffect } from 'react';
import styles from './asistentePanel.module.css';
import Sidebar from '../../layouts/Sidebar/sidebarAsistente/sidebar';
import Header from '../../layouts/Header/header';
import EventCard from './components/EventCard/EventCard';
import EventModal from './components/EventModal/EventModal';
import InscriptionModal from './components/InscriptionModal/InscriptionModal';
import InscriptionsList from './components/InscriptionsList/InscriptionsList';
import Dashboard from './components/Dashboard/Dashboard';
import Agenda from './components/Agenda/Agenda';
import AttendanceModal from './components/AttendanceModal/AttendanceModal';
import eventService from '../../services/eventService';
import Encuestas from '../asistente/components/Encuestas/Encuestas'
import { useEvents } from './hooks/useEvents';
import { useInscriptions } from './hooks/useInscriptions';
import { formatFecha, formatHora, formatFechaCompleta } from './utils/dateUtils';
import { getEventStatus, validarFormularioInscripcion } from './utils/eventUtils';

const AsistentePanel = () => {
    const [vistaActual, setVistaActual] = useState('dashboard');
    const [selectedEvento, setSelectedEvento] = useState(null);
    const [selectedInscripcion, setSelectedInscripcion] = useState(null);
    const [selectedActividad, setSelectedActividad] = useState('');
    const [actividadesDisponibles, setActividadesDisponibles] = useState([]);
    const [cargandoActividades, setCargandoActividades] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [modalType, setModalType] = useState('details');
    const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [inscribiendo, setInscribiendo] = useState(false);
    const [cargandoDetalles, setCargandoDetalles] = useState(false);
    const [userData, setUserData] = useState(null);
    const [busqueda, setBusqueda] = useState('');

    const getUserData = () => {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                return {
                    nombre: user.nombre || user.name || '',
                    email: user.email || user.correo || '',
                    telefono: user.telefono || user.phone || ''
                };
            }
            return null;
        } catch (error) {
            return null;
        }
    };

    useEffect(() => {
        const userData = getUserData();
        setUserData(userData);
    }, []);

    const {
        eventos,
        eventosFiltrados,
        categorias,
        loading: loadingEventos,
        filtroCategoria,
        setFiltroCategoria,
        cargarEventosDisponibles,
        actualizarCuposEvento
    } = useEvents();

    const {
        misInscripciones,
        eventosInscritos,
        asistenciasRegistradas,
        loading: loadingInscripciones,
        registrandoAsistencia,
        inscripcionRegistrando,
        cargarMisInscripciones,
        inscribirseEnEvento,
        handleRegistrarAsistencia,
        puedeRegistrarAsistencia
    } = useInscriptions();

    const filtrarEventosPorBusqueda = (eventos) => {
        if (!busqueda.trim()) return eventos;

        const terminoBusqueda = busqueda.toLowerCase().trim();
        return eventos.filter(evento =>
            evento.titulo?.toLowerCase().includes(terminoBusqueda) ||
            evento.descripcion?.toLowerCase().includes(terminoBusqueda) ||
            evento.lugar?.toLowerCase().includes(terminoBusqueda)
        );
    };

    const eventosFiltradosFinal = filtrarEventosPorBusqueda(eventosFiltrados);

    useEffect(() => {
        const checkAuth = () => {
            const accessToken = localStorage.getItem('access_token');
            const token = localStorage.getItem('token');
            const authToken = localStorage.getItem('auth_token');

            const hasToken = accessToken || token || authToken;

            if (!hasToken) {
                window.location.href = '/login';
                return;
            }
        };

        checkAuth();
        cargarEventosDisponibles();
        cargarMisInscripciones();
    }, []);

    useEffect(() => {
        if (misInscripciones.length > 0 && !selectedActividad) {
            const primeraActividad = misInscripciones.find(inscripcion =>
                inscripcion.evento?.actividades?.[0]
            )?.evento?.actividades?.[0];

            if (primeraActividad) {
                setSelectedActividad(primeraActividad.id_actividad);
            }
        }
    }, [misInscripciones, selectedActividad]);

    useEffect(() => {
        if (vistaActual === 'encuestas' && misInscripciones && misInscripciones.length > 0) {
            cargarActividadesDisponibles();
        } else if (vistaActual !== 'encuestas') {
            setActividadesDisponibles([]);
        }
    }, [vistaActual, misInscripciones]);

    const handleSidebarToggle = (isCollapsed) => {
        setSidebarCollapsed(isCollapsed);
    };

    const handleNavigation = (view) => {
        setVistaActual(view);
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const closeSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const handleViewDetails = async (evento) => {
        setCargandoDetalles(true);
        try {
            const token = localStorage.getItem('access_token') || localStorage.getItem('token');
            if (!token) {
                throw new Error('No hay token disponible');
            }

            const eventoCompleto = await eventService.getEventDetails(evento.id, token);
            setSelectedEvento(eventoCompleto);
            setModalType('details');
            setDialogOpen(true);
        } catch (error) {
            setSelectedEvento(evento);
            setModalType('details');
            setDialogOpen(true);
            showSnackbar('No se pudieron cargar todos los detalles del evento', 'warning');
        } finally {
            setCargandoDetalles(false);
        }
    };

    const handleInscribe = (evento) => {
        if (eventosInscritos.has(evento.id)) {
            showSnackbar('Ya estás inscrito en este evento.', 'info');
            return;
        }

        const estado = getEventStatus(evento, eventosInscritos);
        if (estado.texto !== 'DISPONIBLE') {
            showSnackbar('No es posible inscribirse en este evento porque está lleno o cerrado.', 'warning');
            return;
        }

        setSelectedEvento(evento);
        setModalType('inscription');
        setDialogOpen(true);
    };

    const handleConfirmInscription = async (formDataInscripcion) => {
        if (!selectedEvento) return;

        const validacion = validarFormularioInscripcion(formDataInscripcion);
        if (!validacion.isValid) {
            const primerError = Object.values(validacion.errors)[0];
            showSnackbar(primerError, 'error');
            return;
        }

        setInscribiendo(true);

        try {
            await inscribirseEnEvento(selectedEvento.id);

            showSnackbar('Tu inscripción al evento se ha realizado exitosamente. Recibirás un correo de confirmación.', 'success');
            setDialogOpen(false);

            await cargarEventosDisponibles();
            await cargarMisInscripciones();
        } catch (error) {
            showSnackbar(error.message, 'error');
        } finally {
            setInscribiendo(false);
        }
    };

    const handleOpenAttendanceModal = (inscripcion) => {
        setSelectedInscripcion(inscripcion);
        setAttendanceModalOpen(true);
    };

    const handleConfirmAttendance = async (codigoAsistencia) => {
        if (!selectedInscripcion) return;

        try {
            await handleRegistrarAsistencia(selectedInscripcion);
            showSnackbar('Asistencia registrada exitosamente', 'success');
            setAttendanceModalOpen(false);
            await cargarMisInscripciones();
        } catch (error) {
            showSnackbar(error.message, 'error');
        }
    };

    const handleRegistrarAsistenciaDirecta = async (inscripcion) => {
        try {
            await handleRegistrarAsistencia(inscripcion);
            showSnackbar('Asistencia registrada exitosamente', 'success');
        } catch (error) {
            showSnackbar(error.message, 'error');
        }
    };

    const limpiarBusqueda = () => {
        setBusqueda('');
    };

    const cargarActividadesDisponibles = async () => {
        if (misInscripciones.length === 0) {
            setActividadesDisponibles([]);
            return;
        }

        setCargandoActividades(true);
        try {
            const token = localStorage.getItem('access_token') || localStorage.getItem('token');
            if (!token) {
                throw new Error('No hay token disponible');
            }

            const actividades = [];

            for (const inscripcion of misInscripciones) {
                try {
                    const eventId = inscripcion.id_evento || inscripcion.evento?.id;

                    if (!eventId) {
                        continue;
                    }

                    const eventoDetalle = await eventService.getEventDetails(eventId, token);

                    if (eventoDetalle.actividades && eventoDetalle.actividades.length > 0) {
                        eventoDetalle.actividades.forEach(actividad => {
                            const actividadInfo = {
                                id_actividad: actividad.id_actividad,
                                titulo: actividad.titulo,
                                fecha_actividad: actividad.fecha_actividad,
                                hora_inicio: actividad.hora_inicio,
                                hora_fin: actividad.hora_fin,
                                descripcion: actividad.descripcion,
                                id_evento: eventoDetalle.id,
                                evento_titulo: eventoDetalle.titulo,
                                evento_fecha_inicio: eventoDetalle.fecha_inicio,
                                evento_fecha_fin: eventoDetalle.fecha_fin,
                                lugares: actividad.lugares || []
                            };
                            actividades.push(actividadInfo);
                        });
                    }
                } catch (error) {
                    continue;
                }
            }

            setActividadesDisponibles(actividades);

            if (actividades.length > 0 && !selectedActividad) {
                const primeraActividadId = actividades[0].id_actividad.toString();
                setSelectedActividad(primeraActividadId);
            }
        } catch (error) {
            showSnackbar('Error al cargar las actividades disponibles', 'error');
        } finally {
            setCargandoActividades(false);
        }
    };

    const renderVista = () => {
        switch (vistaActual) {
            case 'dashboard':
                return (
                    <Dashboard
                        misInscripciones={misInscripciones}
                        eventosDisponibles={eventos}
                        onViewEvents={() => setVistaActual('eventos')}
                        onViewInscriptions={() => setVistaActual('misInscripciones')}
                    />
                );

            case 'eventos':
                return (
                    <div className={styles.mainContent}>
                        <div className={styles.headerSection}>
                            <h1 className={styles.mainTitle}>Eventos Disponibles para Inscripción</h1>
                            <p className={styles.subtitle}>Explora los eventos disponibles e inscribete según tus intereses.</p>
                        </div>

                        <div className={styles.filtersSection}>
                            <div className={styles.searchBar}>
                                <input
                                    type="text"
                                    placeholder="Buscar eventos por nombre, descripción o lugar..."
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                    className={styles.searchInput}
                                />
                                {busqueda && (
                                    <button
                                        className={styles.clearSearchButton}
                                        onClick={limpiarBusqueda}
                                        title="Limpiar búsqueda"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>

                            <div className={styles.filterGroup}>
                                <select
                                    value={filtroCategoria}
                                    onChange={(e) => setFiltroCategoria(e.target.value)}
                                    className={styles.filterSelect}
                                >
                                    <option value="">Todas las modalidades</option>
                                    {categorias.map((categoria) => (
                                        <option key={categoria} value={categoria}>
                                            {categoria}
                                        </option>
                                    ))}
                                </select>

                                <button
                                    className={`${styles.tabButton} ${vistaActual === 'misInscripciones' ? styles.tabButtonActive : ''}`}
                                    onClick={() => setVistaActual('misInscripciones')}
                                >
                                    Mis Inscripciones
                                </button>
                            </div>
                        </div>

                        {loadingEventos ? (
                            <div className={styles.loadingContainer}>
                                <div className={styles.spinner}></div>
                                <p>Cargando eventos disponibles...</p>
                            </div>
                        ) : eventosFiltradosFinal.length === 0 ? (
                            <div className={styles.noEventsCard}>
                                <h3>
                                    {eventos.length === 0
                                        ? "Actualmente no hay eventos disponibles para inscripción."
                                        : busqueda || filtroCategoria
                                            ? "No se encontraron eventos con los filtros aplicados."
                                            : "No hay eventos disponibles."}
                                </h3>
                                {(busqueda || filtroCategoria) && (
                                    <button
                                        className={styles.btnShowAll}
                                        onClick={() => {
                                            setBusqueda('');
                                            setFiltroCategoria('');
                                        }}
                                    >
                                        Ver todos los eventos
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className={styles.eventsGrid}>
                                    {eventosFiltradosFinal.map((evento) => (
                                        <EventCard
                                            key={evento.id}
                                            evento={evento}
                                            estado={getEventStatus(evento, eventosInscritos)}
                                            onViewDetails={handleViewDetails}
                                            onInscribe={handleInscribe}
                                            formatFecha={formatFecha}
                                            formatHora={formatHora}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                );

            case 'agenda':
                return (
                    <Agenda
                        misInscripciones={misInscripciones}
                        onRegisterAttendance={handleOpenAttendanceModal}
                    />
                );

            case 'misInscripciones':
                return (
                    <InscriptionsList
                        misInscripciones={misInscripciones}
                        loading={loadingInscripciones}
                        asistenciasRegistradas={asistenciasRegistradas}
                        registrandoAsistencia={registrandoAsistencia}
                        inscripcionRegistrando={inscripcionRegistrando}
                        handleRegistrarAsistencia={handleRegistrarAsistenciaDirecta}
                        puedeRegistrarAsistencia={puedeRegistrarAsistencia}
                        formatFecha={formatFecha}
                        formatHora={formatHora}
                        onViewEvents={() => setVistaActual('eventos')}
                    />
                );

            case 'encuestas':
                return (
                    <div className={styles.mainContent}>

                        {cargandoActividades ? (
                            <div className={styles.loadingContainer}>
                                <div className={styles.spinner}></div>
                                <p>Cargando actividades disponibles...</p>
                            </div>
                        ) : actividadesDisponibles.length === 0 ? (
                            <div className={styles.noSelection}>
                                <h3>No hay actividades disponibles</h3>
                                <p>
                                    {misInscripciones.length === 0
                                        ? "No estás inscrito en ningún evento. Inscríbete en un evento primero."
                                        : "Los eventos en los que estás inscrito no tienen actividades asignadas o no se pudieron cargar."
                                    }
                                </p>
                                {misInscripciones.length === 0 && (
                                    <button
                                        className={styles.btnShowAll}
                                        onClick={() => setVistaActual('eventos')}
                                    >
                                        Ver eventos disponibles
                                    </button>
                                )}
                            </div>
                        ) : (
                            <Encuestas
                                actividadesDisponibles={actividadesDisponibles}
                                cargandoActividades={cargandoActividades}
                            />
                        )}
                    </div>
                );

            default:
                return <Dashboard misInscripciones={misInscripciones} />;
        }
    };

    return (
        <div className={styles.asistenteContainer}>
            <Sidebar
                onToggle={handleSidebarToggle}
                onNavigate={handleNavigation}
                currentView={vistaActual}
            />

            <div className={`${styles.mainPanel} ${sidebarCollapsed ? styles.mainPanelExpanded : ''}`}>
                <Header
                    userEmail={userData ? `${userData.nombre} (${userData.email})` : "Cargando..."}
                    userRole="Asistente"
                />

                {renderVista()}
            </div>

            {dialogOpen && selectedEvento && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h2>
                                {modalType === 'details'
                                    ? 'Detalles Completos del Evento'
                                    : 'Confirmar Inscripción'
                                }
                            </h2>
                            <button
                                className={styles.closeButton}
                                onClick={() => setDialogOpen(false)}
                                disabled={inscribiendo}
                            >
                                ×
                            </button>
                        </div>

                        {modalType === 'details' ? (
                            <EventModal
                                evento={selectedEvento}
                                onClose={() => setDialogOpen(false)}
                                formatFecha={formatFecha}
                                formatFechaCompleta={formatFechaCompleta}
                            />
                        ) : (
                            <InscriptionModal
                                evento={selectedEvento}
                                onClose={() => setDialogOpen(false)}
                                onConfirm={handleConfirmInscription}
                                formatFecha={formatFecha}
                                loading={inscribiendo}
                                userData={userData}
                            />
                        )}
                    </div>
                </div>
            )}

            {attendanceModalOpen && selectedInscripcion && (
                <AttendanceModal
                    inscripcion={selectedInscripcion}
                    onClose={() => setAttendanceModalOpen(false)}
                    onConfirm={handleConfirmAttendance}
                    loading={registrandoAsistencia}
                />
            )}

            {snackbar.open && (
                <div className={`${styles.snackbar} ${styles[snackbar.severity]}`}>
                    <span>{snackbar.message}</span>
                    <button onClick={closeSnackbar} className={styles.snackbarClose}>
                        ×
                    </button>
                </div>
            )}
        </div>
    );
};

export default AsistentePanel;