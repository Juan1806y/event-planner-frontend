import React, { useState, useEffect } from 'react';
import styles from './Agenda.module.css';
import Calendar from '../../../../assets/calendar.png';
import Clock from '../../../../assets/clock.png';
import Location from '../../../../assets/lugar.png';
import EventIcon from '../../../../assets/evento.png';
import SpeakerIcon from '../../../../assets/information.png';
import { formatFecha, formatHora } from '../../utils/dateUtils';
import agendaService from '../../../../services/agendaService';

const Agenda = ({ misInscripciones, onRegisterAttendance }) => {
    const [actividades, setActividades] = useState([]);
    const [actividadesFiltradas, setActividadesFiltradas] = useState([]);
    const [eventosInscritos, setEventosInscritos] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [cargandoEventos, setCargandoEventos] = useState(false);
    const [filtro, setFiltro] = useState('proximas');
    const [filtroEvento, setFiltroEvento] = useState('todos');
    const [modalDetallesAbierto, setModalDetallesAbierto] = useState(false);
    const [actividadSeleccionada, setActividadSeleccionada] = useState(null);
    const [detallesCompletos, setDetallesCompletos] = useState(null);
    const [cargandoDetalles, setCargandoDetalles] = useState(false);
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

    const obtenerEventosInscritos = async () => {
        setCargandoEventos(true);
        try {
            const token = localStorage.getItem('access_token') || localStorage.getItem('token');
            if (!token) {
                throw new Error('No hay token disponible');
            }

            const response = await fetch(`${API_URL}/asistencias/mis-asistencias`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (result.success && result.data) {
                const eventosMap = new Map();
                result.data.forEach(item => {
                    if (item.evento && !eventosMap.has(item.evento.id)) {
                        eventosMap.set(item.evento.id, {
                            id: item.evento.id,
                            titulo: item.evento.titulo,
                            empresa: item.evento.empresa,
                            modalidad: item.evento.modalidad
                        });
                    }
                });

                setEventosInscritos(Array.from(eventosMap.values()));
            } else {
                setEventosInscritos([]);
            }
        } catch (error) {
            setEventosInscritos([]);
        } finally {
            setCargandoEventos(false);
        }
    };

    const obtenerActividadesAgenda = async () => {
        if (misInscripciones.length === 0) {
            setActividades([]);
            setActividadesFiltradas([]);
            return;
        }

        setCargando(true);
        try {
            const token = localStorage.getItem('access_token') || localStorage.getItem('token');
            if (!token) {
                throw new Error('No hay token disponible');
            }

            const actividadesData = await agendaService.obtenerActividadesPorFecha(
                misInscripciones,
                token,
                filtro
            );

            setActividades(actividadesData);
            aplicarFiltros(actividadesData, filtroEvento);
        } catch (error) {
            setActividades([]);
            setActividadesFiltradas([]);
        } finally {
            setCargando(false);
        }
    };

    const aplicarFiltros = (actividadesData, eventoFiltro) => {
        let actividadesFiltradas = actividadesData;

        if (eventoFiltro !== 'todos') {
            actividadesFiltradas = actividadesFiltradas.filter(
                actividad => actividad.evento.id.toString() === eventoFiltro
            );
        }

        setActividadesFiltradas(actividadesFiltradas);
    };

    useEffect(() => {
        if (actividades.length > 0) {
            aplicarFiltros(actividades, filtroEvento);
        }
    }, [filtroEvento, actividades]);

    useEffect(() => {
        obtenerEventosInscritos();
        obtenerActividadesAgenda();
    }, [misInscripciones, filtro]);

    const handleFiltroEventoChange = (event) => {
        setFiltroEvento(event.target.value);
    };

    const limpiarFiltroEvento = () => {
        setFiltroEvento('todos');
    };

    const cargarDetallesCompletos = async (actividad) => {
        setCargandoDetalles(true);
        try {
            const token = localStorage.getItem('access_token') || localStorage.getItem('token');
            if (!token) {
                throw new Error('No hay token disponible');
            }

            const [detallesActividad, ponentesResponse, detallesEvento] = await Promise.all([
                fetch(`${API_URL}/actividades/${actividad.id_actividad}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }).then(r => r.json()),

                fetch(`${API_URL}/ponente-actividad/actividad/${actividad.id_actividad}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }).then(r => r.json()),

                fetch(`${API_URL}/eventos/${actividad.evento.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }).then(r => r.json())
            ]);

            let ponentesProcesados = [];
            if (ponentesResponse.success && ponentesResponse.data && Array.isArray(ponentesResponse.data)) {
                ponentesProcesados = ponentesResponse.data.map((item) => {
                    try {
                        let nombre = 'Ponente por confirmar';
                        let especialidad = '';
                        let descripcion = '';
                        let correo = '';

                        if (item.ponente && item.ponente.usuario) {
                            nombre = item.ponente.usuario.nombre || nombre;
                            correo = item.ponente.usuario.correo || correo;
                            especialidad = item.ponente.especialidad || especialidad;
                            descripcion = item.ponente.descripcion || descripcion;
                        }
                        else if (item.usuario) {
                            nombre = item.usuario.nombre || nombre;
                            correo = item.usuario.correo || correo;
                            especialidad = item.especialidad || especialidad;
                            descripcion = item.descripcion || descripcion;
                        }
                        else {
                            nombre = item.nombre || nombre;
                            correo = item.correo || correo;
                            especialidad = item.especialidad || especialidad;
                            descripcion = item.descripcion || descripcion;
                        }

                        return {
                            nombre,
                            especialidad,
                            descripcion,
                            correo
                        };
                    } catch (error) {
                        return {
                            nombre: 'Ponente por confirmar',
                            especialidad: '',
                            descripcion: '',
                            correo: ''
                        };
                    }
                });
            }

            setDetallesCompletos({
                actividad: detallesActividad.success ? detallesActividad.data : null,
                ponentes: ponentesProcesados,
                evento: detallesEvento.success ? detallesEvento.data : null
            });

        } catch (error) {
            setDetallesCompletos({
                actividad: null,
                ponentes: [],
                evento: null
            });
        } finally {
            setCargandoDetalles(false);
        }
    };

    const abrirModalDetalles = async (actividad) => {
        setActividadSeleccionada(actividad);
        setModalDetallesAbierto(true);
        await cargarDetallesCompletos(actividad);
    };

    const cerrarModalDetalles = () => {
        setModalDetallesAbierto(false);
        setActividadSeleccionada(null);
        setDetallesCompletos(null);
    };

    const formatRangoHoras = (horaInicio, horaFin) => {
        const inicio = formatHora(horaInicio);
        const fin = formatHora(horaFin);
        return `${inicio} - ${fin}`;
    };

    const obtenerLugaresTexto = (lugares) => {
        if (!lugares || lugares.length === 0) return 'Virtual';
        return lugares.map(lugar => lugar.nombre).join(', ');
    };

    const getEstadoActividad = (actividad) => {
        if (agendaService.estaEnCurso(actividad)) {
            return styles.enCurso;
        }
        if (agendaService.esProxima(actividad)) {
            return styles.proxima;
        }
        return styles.pasada;
    };

    const getTextoEstado = (actividad) => {
        if (agendaService.estaEnCurso(actividad)) {
            return 'En curso';
        }
        if (agendaService.esProxima(actividad)) {
            return 'Próxima';
        }
        return 'Finalizada';
    };

    if (misInscripciones.length === 0) {
        return (
            <div className={styles.agendaContainer}>
                <div className={styles.headerSection}>
                    <h1 className={styles.mainTitle}>Mi Agenda</h1>
                    <p className={styles.subtitle}>Consulta las actividades de tus eventos inscritos</p>
                </div>
                <div className={styles.noEvents}>
                    <h3>No tienes eventos en tu agenda</h3>
                    <p>Inscríbete en eventos para ver las actividades programadas</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.agendaContainer}>
            <div className={styles.headerSection}>
                <h1 className={styles.mainTitle}>Mi Agenda</h1>
                <p className={styles.subtitle}>Consulta las actividades de tus eventos inscritos</p>
            </div>

            <div className={styles.filtersSection}>
                <div className={styles.filterGroup}>
                    <button
                        className={`${styles.filterButton} ${filtro === 'proximas' ? styles.filterActive : ''}`}
                        onClick={() => setFiltro('proximas')}
                    >
                        Próximas
                    </button>
                    <button
                        className={`${styles.filterButton} ${filtro === 'semana' ? styles.filterActive : ''}`}
                        onClick={() => setFiltro('semana')}
                    >
                        Esta semana
                    </button>
                    <button
                        className={`${styles.filterButton} ${filtro === 'mes' ? styles.filterActive : ''}`}
                        onClick={() => setFiltro('mes')}
                    >
                        Este mes
                    </button>
                    <button
                        className={`${styles.filterButton} ${filtro === 'todas' ? styles.filterActive : ''}`}
                        onClick={() => setFiltro('todas')}
                    >
                        Todas
                    </button>
                </div>

                <div className={styles.filtersRight}>
                    <div className={styles.eventFilterGroup}>
                        <label htmlFor="filtroEvento" className={styles.filterLabel}>
                            Filtrar por evento:
                        </label>
                        <select
                            id="filtroEvento"
                            value={filtroEvento}
                            onChange={handleFiltroEventoChange}
                            className={styles.eventFilterSelect}
                            disabled={cargandoEventos}
                        >
                            <option value="todos">Todos los eventos</option>
                            {eventosInscritos.map(evento => (
                                <option key={evento.id} value={evento.id}>
                                    {evento.titulo}
                                </option>
                            ))}
                        </select>
                        {filtroEvento !== 'todos' && (
                            <button
                                className={styles.clearEventFilter}
                                onClick={limpiarFiltroEvento}
                                title="Limpiar filtro de evento"
                            >
                                ×
                            </button>
                        )}
                    </div>

                    <div className={styles.activitiesCount}>
                        {actividadesFiltradas.length} actividad(es)
                        {filtroEvento !== 'todos' && actividades.length > 0 && (
                            <span className={styles.filteredCount}>
                                de {actividades.length} totales
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {cargando ? (
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p>Cargando actividades...</p>
                </div>
            ) : actividadesFiltradas.length === 0 ? (
                <div className={styles.noEvents}>
                    <h3>No hay actividades {filtro !== 'todas' ? `para ${filtro}` : 'disponibles'}</h3>
                    <p>
                        {filtroEvento !== 'todos'
                            ? `No se encontraron actividades para el evento seleccionado`
                            : 'No se encontraron actividades con los filtros aplicados'
                        }
                    </p>
                    {filtroEvento !== 'todos' && (
                        <button
                            className={styles.btnShowAll}
                            onClick={limpiarFiltroEvento}
                        >
                            Ver todos los eventos
                        </button>
                    )}
                </div>
            ) : (
                <div className={styles.agendaGrid}>
                    {actividadesFiltradas.map((actividad, index) => {
                        const estadoActividad = getEstadoActividad(actividad);
                        const textoEstado = getTextoEstado(actividad);
                        const lugaresTexto = obtenerLugaresTexto(actividad.lugares);

                        return (
                            <div key={`${actividad.id_actividad}-${index}`} className={styles.agendaCard}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.eventTitleSection}>
                                        <h3 className={styles.eventTitle}>
                                            {actividad.titulo}
                                        </h3>
                                    </div>
                                    <div className={styles.headerRight}>
                                        <span className={`${styles.eventModality} ${styles[actividad.evento.modalidad?.toLowerCase()]}`}>
                                            {actividad.evento.modalidad}
                                        </span>
                                        <span className={`${styles.estadoActividad} ${estadoActividad}`}>
                                            {textoEstado}
                                        </span>
                                    </div>
                                </div>

                                <div className={styles.cardContent}>
                                    <div className={styles.eventDetails}>
                                        <div className={styles.detailItem}>
                                            <span className={styles.detailIcon}>
                                                <img src={Calendar} alt="Fecha" className={styles.iconImage} />
                                            </span>
                                            <div className={styles.detailContent}>
                                                <span className={styles.detailLabel}>Fecha</span>
                                                <span className={styles.detailValue}>
                                                    {formatFecha(actividad.fecha_actividad)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className={styles.detailItem}>
                                            <span className={styles.detailIcon}>
                                                <img src={Clock} alt="Hora" className={styles.iconImage} />
                                            </span>
                                            <div className={styles.detailContent}>
                                                <span className={styles.detailLabel}>Horario</span>
                                                <span className={styles.detailValue}>
                                                    {formatRangoHoras(actividad.hora_inicio, actividad.hora_fin)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className={styles.detailItem}>
                                            <span className={styles.detailIcon}>
                                                <img src={Location} alt="Lugar" className={styles.iconImage} />
                                            </span>
                                            <div className={styles.detailContent}>
                                                <span className={styles.detailLabel}>Lugar</span>
                                                <span className={styles.detailValue}>
                                                    {lugaresTexto}
                                                </span>
                                            </div>
                                        </div>

                                        {actividad.evento.empresa && (
                                            <div className={styles.detailItem}>
                                                <span className={styles.detailIcon}>
                                                    <img src={EventIcon} alt="Empresa" className={styles.iconImage} />
                                                </span>
                                                <div className={styles.detailContent}>
                                                    <span className={styles.detailLabel}>Empresa</span>
                                                    <span className={styles.detailValue}>
                                                        {actividad.evento.empresa}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className={styles.detallesActions}>
                                        <button
                                            className={styles.btnVerDetalles}
                                            onClick={() => abrirModalDetalles(actividad)}
                                        >
                                            Ver detalles completos
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {modalDetallesAbierto && actividadSeleccionada && (
                <div className={styles.modalOverlay}>
                    <div className={`${styles.modalContent} ${styles.large}`}>
                        <div className={styles.modalHeader}>
                            <h2>Detalles de la Actividad</h2>
                            <button
                                className={styles.closeButton}
                                onClick={cerrarModalDetalles}
                            >
                                ×
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            {cargandoDetalles ? (
                                <div className={styles.cargandoDetalles}>
                                    <div className={styles.spinner}></div>
                                    <p>Cargando información detallada...</p>
                                </div>
                            ) : (
                                <div className={styles.detallesCompletos}>
                                    <div className={styles.infoSection}>
                                        <h3>Información General</h3>
                                        <div className={styles.infoGrid}>
                                            <div className={styles.infoItem}>
                                                <strong>Empresa:</strong>
                                                <span>
                                                    {detallesCompletos?.evento?.empresa?.nombre ||
                                                        detallesCompletos?.evento?.empresa ||
                                                        actividadSeleccionada.evento.empresa ||
                                                        'No especificada'}
                                                </span>
                                            </div>

                                            <div className={styles.infoItem}>
                                                <strong>Evento:</strong>
                                                <span>{actividadSeleccionada.evento.titulo}</span>
                                            </div>

                                            <div className={styles.infoItem}>
                                                <strong>Actividad:</strong>
                                                <span>{actividadSeleccionada.titulo}</span>
                                            </div>

                                            <div className={styles.infoItem}>
                                                <strong>Modalidad:</strong>
                                                <span>
                                                    {detallesCompletos?.actividad?.evento?.modalidad ||
                                                        actividadSeleccionada.evento.modalidad ||
                                                        'No especificada'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {actividadSeleccionada.descripcion && (
                                        <div className={styles.infoSection}>
                                            <h3>Descripción</h3>
                                            <p className={styles.descripcionTexto}>
                                                {actividadSeleccionada.descripcion}
                                            </p>
                                        </div>
                                    )}

                                    <div className={styles.infoSection}>
                                        <h3>Lugares</h3>
                                        {actividadSeleccionada.lugares && actividadSeleccionada.lugares.length > 0 ? (
                                            <div className={styles.lugaresLista}>
                                                {actividadSeleccionada.lugares.map((lugar, index) => (
                                                    <div key={lugar.id || index} className={styles.lugarItem}>
                                                        <h4 className={styles.lugarNombre}>{lugar.nombre}</h4>
                                                        {lugar.descripcion && (
                                                            <p className={styles.lugarDescripcion}>{lugar.descripcion}</p>
                                                        )}
                                                        <div className={styles.lugarDetalles}>
                                                            {lugar.capacidad && (
                                                                <span><strong>Capacidad:</strong> {lugar.capacidad}</span>
                                                            )}
                                                            {lugar.equipamiento && (
                                                                <span><strong>Equipamiento:</strong> {lugar.equipamiento}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p>Actividad virtual - Sin lugar físico asignado</p>
                                        )}
                                    </div>

                                    <div className={styles.infoSection}>
                                        <h3>Organizador</h3>
                                        <div className={styles.infoGrid}>
                                            <div className={styles.infoItem}>
                                                <strong>Nombre:</strong>
                                                <span>{detallesCompletos?.evento?.creador?.nombre || 'No especificado'}</span>
                                            </div>
                                            <div className={styles.infoItem}>
                                                <strong>Email:</strong>
                                                <span>{detallesCompletos?.evento?.creador?.correo || 'No especificado'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.infoSection}>
                                        <h3>Ponentes</h3>
                                        {detallesCompletos?.ponentes && detallesCompletos.ponentes.length > 0 ? (
                                            <div className={styles.ponentesLista}>
                                                {detallesCompletos.ponentes.map((ponente, index) => (
                                                    <div key={index} className={styles.ponenteCard}>
                                                        <div className={styles.ponenteHeader}>
                                                            <div className={styles.ponenteInfo}>
                                                                <h4 className={styles.ponenteNombre}>
                                                                    {ponente.nombre}
                                                                </h4>
                                                                {ponente.especialidad && (
                                                                    <p className={styles.ponenteEspecialidad}>
                                                                        {ponente.especialidad}
                                                                    </p>
                                                                )}
                                                                {ponente.correo && (
                                                                    <p className={styles.ponenteCorreo}>
                                                                        {ponente.correo}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {ponente.descripcion && (
                                                            <p className={styles.ponenteDescripcion}>
                                                                {ponente.descripcion}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p>No hay ponentes asignados para esta actividad</p>
                                        )}
                                    </div>

                                    <div className={styles.infoSection}>
                                        <h3>Horario</h3>
                                        <div className={styles.horarioInfo}>
                                            <div className={styles.horarioItem}>
                                                <strong>Fecha:</strong> {formatFecha(actividadSeleccionada.fecha_actividad)}
                                            </div>
                                            <div className={styles.horarioItem}>
                                                <strong>Horario:</strong> {formatRangoHoras(actividadSeleccionada.hora_inicio, actividadSeleccionada.hora_fin)}
                                            </div>
                                        </div>
                                    </div>

                                    {actividadSeleccionada.url && (
                                        <div className={styles.infoSection}>
                                            <h3>Enlace de la Actividad</h3>
                                            <a
                                                href={actividadSeleccionada.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={styles.enlaceActividad}
                                            >
                                                🔗 Acceder a la actividad
                                            </a>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className={styles.modalActions}>
                            <button
                                className={styles.btnCerrar}
                                onClick={cerrarModalDetalles}
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Agenda;