import React, { useState, useEffect } from 'react';
import styles from './Encuestas.module.css';
import { useEncuestas } from '../../hooks/useEncuestas';
import EncuestaCard from './EncuestaCard';
import EncuestaModal from './EncuestaModal';

const Encuestas = ({ actividadesDisponibles = [], cargandoActividades = false }) => {
    const {
        encuestas,
        loading,
        error,
        completando,
        obtenerEncuestas,
        marcarComoCompletada,
        filtrarPorTipo,
        obtenerEstadoEncuesta
    } = useEncuestas();

    const [eventosUnicos, setEventosUnicos] = useState([]);
    const [eventoSeleccionado, setEventoSeleccionado] = useState('');
    const [actividadesFiltradas, setActividadesFiltradas] = useState([]);
    const [actividadSeleccionada, setActividadSeleccionada] = useState('');
    const [actividadNombre, setActividadNombre] = useState('');
    const [eventoNombre, setEventoNombre] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('');
    const [encuestaSeleccionada, setEncuestaSeleccionada] = useState(null);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [confirmandoCompletar, setConfirmandoCompletar] = useState(false);
    const [mostrarAlerta, setMostrarAlerta] = useState(false);
    const [mensajeAlerta, setMensajeAlerta] = useState('');
    const [tipoAlerta, setTipoAlerta] = useState('success');
    const [idAsistente, setIdAsistente] = useState(null);

    // Función para obtener id_asistente del usuario actual
    const obtenerIdAsistente = () => {
        try {
            // 1. Obtener usuario del localStorage
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                console.log('❌ No se encontró objeto user en localStorage');
                return null;
            }

            const user = JSON.parse(userStr);
            console.log('👤 Usuario encontrado en localStorage:', user);

            // 2. Buscar id_asistente en diferentes propiedades
            const posiblesPropiedades = [
                'id_asistente',
                'asistente_id',
                'idAsistente',
                'rolData.id_asistente'
            ];

            for (const prop of posiblesPropiedades) {
                if (prop.includes('.')) {
                    // Para propiedades anidadas como 'rolData.id_asistente'
                    const parts = prop.split('.');
                    let value = user;
                    for (const part of parts) {
                        if (value && typeof value === 'object') {
                            value = value[part];
                        } else {
                            value = null;
                            break;
                        }
                    }

                    if (value) {
                        console.log(`✅ Encontrado id_asistente en ${prop}:`, value);
                        return value;
                    }
                } else {
                    // Para propiedades directas
                    if (user[prop]) {
                        console.log(`✅ Encontrado id_asistente en ${prop}:`, user[prop]);
                        return user[prop];
                    }
                }
            }

            // 3. Si no se encontró en las propiedades directas, intentar desde rolData
            if (user.rolData) {
                console.log('🔍 Buscando en rolData:', user.rolData);

                if (user.rolData.id_asistente) {
                    console.log('✅ Encontrado id_asistente en rolData:', user.rolData.id_asistente);
                    return user.rolData.id_asistente;
                }

                // También verificar otras posibles propiedades en rolData
                if (user.rolData.asistente_id) {
                    console.log('✅ Encontrado asistente_id en rolData:', user.rolData.asistente_id);
                    return user.rolData.asistente_id;
                }
            }

            // 4. Intentar desde el token como último recurso
            const token = localStorage.getItem('access_token');
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    console.log('🔍 Buscando en payload del token:', payload);

                    if (payload.rolData?.id_asistente) {
                        console.log('✅ Encontrado id_asistente en token payload:', payload.rolData.id_asistente);
                        return payload.rolData.id_asistente;
                    }

                    if (payload.id_asistente) {
                        console.log('✅ Encontrado id_asistente directo en token:', payload.id_asistente);
                        return payload.id_asistente;
                    }
                } catch (error) {
                    console.log('❌ Error parseando token:', error);
                }
            }

            console.log('⚠️ No se pudo encontrar id_asistente en ninguna propiedad conocida');
            console.log('📋 Propiedades disponibles en user:', Object.keys(user));
            if (user.rolData) {
                console.log('📋 Propiedades disponibles en rolData:', Object.keys(user.rolData));
            }

            return null;
        } catch (error) {
            console.error('❌ Error obteniendo id_asistente:', error);
            return null;
        }
    };

    // Obtener id_asistente al montar el componente
    useEffect(() => {
        const asistenteId = obtenerIdAsistente();
        setIdAsistente(asistenteId);

        if (!asistenteId) {
            console.warn('⚠️ IMPORTANTE: No se encontró id_asistente');
            mostrarAlertaError('No se pudo identificar tu cuenta. Por favor, cierra sesión y vuelve a iniciar.');
        }
    }, []);

    useEffect(() => {
        if (actividadesDisponibles.length > 0) {
            const eventosMap = new Map();

            actividadesDisponibles.forEach(actividad => {
                if (!eventosMap.has(actividad.id_evento)) {
                    eventosMap.set(actividad.id_evento, {
                        id: actividad.id_evento,
                        titulo: actividad.evento_titulo,
                        fecha_inicio: actividad.evento_fecha_inicio
                    });
                }
            });

            setEventosUnicos(Array.from(eventosMap.values()));

            if (eventosMap.size > 0 && !eventoSeleccionado) {
                const primerEvento = Array.from(eventosMap.values())[0];
                setEventoSeleccionado(primerEvento.id.toString());
                setEventoNombre(primerEvento.titulo);
            }
        } else {
            setEventosUnicos([]);
            setEventoSeleccionado('');
        }
    }, [actividadesDisponibles]);

    useEffect(() => {
        if (eventoSeleccionado && actividadesDisponibles.length > 0) {
            const actividadesDelEvento = actividadesDisponibles.filter(
                actividad => actividad.id_evento.toString() === eventoSeleccionado.toString()
            );

            setActividadesFiltradas(actividadesDelEvento);

            const evento = eventosUnicos.find(e => e.id.toString() === eventoSeleccionado.toString());
            if (evento) {
                setEventoNombre(evento.titulo);
            }

            if (actividadesDelEvento.length > 0 && !actividadSeleccionada) {
                const primeraActividadId = actividadesDelEvento[0].id_actividad.toString();
                setActividadSeleccionada(primeraActividadId);
            } else if (actividadesDelEvento.length === 0) {
                setActividadSeleccionada('');
            }
        } else {
            setActividadesFiltradas([]);
            setActividadSeleccionada('');
        }
    }, [eventoSeleccionado, actividadesDisponibles]);

    useEffect(() => {
        if (eventoSeleccionado) {
            cargarEncuestas();
        }
    }, [eventoSeleccionado, actividadSeleccionada, filtroTipo]);

    const cargarEncuestas = async () => {
        if (!eventoSeleccionado) return;

        try {
            const opcionesBusqueda = {
                eventoId: eventoSeleccionado,
                tipoEncuesta: filtroTipo || null
            };

            if (filtroTipo !== 'satisfaccion_evento' && actividadSeleccionada) {
                opcionesBusqueda.actividadId = actividadSeleccionada;
            }

            await obtenerEncuestas(opcionesBusqueda);

            const evento = eventosUnicos.find(e => e.id.toString() === eventoSeleccionado.toString());
            if (evento) {
                setEventoNombre(evento.titulo);
            }

            if (actividadSeleccionada && filtroTipo !== 'satisfaccion_evento') {
                const actividad = actividadesFiltradas.find(
                    a => a.id_actividad.toString() === actividadSeleccionada.toString()
                );
                if (actividad) {
                    setActividadNombre(actividad.titulo);
                }
            }
        } catch (error) {
            mostrarAlertaError(error.message || 'Error al cargar encuestas');
        }
    };

    const encuestasFiltradas = filtrarPorTipo(filtroTipo);

    const tiposEncuesta = [
        { value: '', label: 'Todos los tipos' },
        { value: 'pre_actividad', label: 'Pre Actividad' },
        { value: 'durante_actividad', label: 'Durante Actividad' },
        { value: 'post_actividad', label: 'Post Actividad' },
        { value: 'satisfaccion_evento', label: 'Satisfacción Evento' }
    ];

    const handleAccederEncuesta = (encuesta) => {
        setEncuestaSeleccionada(encuesta);
        setModalAbierto(true);
    };

    const handleCompletarEncuesta = async (encuesta) => {
        setConfirmandoCompletar(true);
    };

    const confirmarCompletar = async () => {
        try {
            if (!idAsistente) {
                throw new Error('No se pudo identificar tu cuenta. Por favor, recarga la página.');
            }

            await marcarComoCompletada(encuestaSeleccionada.id);
            mostrarAlertaExito('✅ Encuesta completada exitosamente');
            setModalAbierto(false);
            setConfirmandoCompletar(false);
            cargarEncuestas();
        } catch (error) {
            mostrarAlertaError(error.message || 'Error al completar la encuesta');
        }
    };

    const mostrarAlertaExito = (mensaje) => {
        setMensajeAlerta(mensaje);
        setTipoAlerta('success');
        setMostrarAlerta(true);
        setTimeout(() => setMostrarAlerta(false), 3000);
    };

    const mostrarAlertaError = (mensaje) => {
        setMensajeAlerta(mensaje);
        setTipoAlerta('error');
        setMostrarAlerta(true);
        setTimeout(() => setMostrarAlerta(false), 5000);
    };

    const cerrarAlerta = () => {
        setMostrarAlerta(false);
    };

    const resetearFiltros = () => {
        setEventoSeleccionado('');
        setActividadSeleccionada('');
        setFiltroTipo('');
        setActividadNombre('');
        setEventoNombre('');
    };

    const getColorPorTipo = (tipo) => {
        switch (tipo) {
            case 'pre_actividad': return '#3B82F6';
            case 'durante_actividad': return '#F59E0B';
            case 'post_actividad': return '#10B981';
            case 'satisfaccion_evento': return '#8B5CF6';
            default: return '#6B7280';
        }
    };

    const getTextoPorTipo = (tipo) => {
        switch (tipo) {
            case 'pre_actividad': return 'Pre Actividad';
            case 'durante_actividad': return 'Durante Actividad';
            case 'post_actividad': return 'Post Actividad';
            case 'satisfaccion_evento': return 'Satisfacción Evento';
            default: return tipo;
        }
    };

    const formatFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getTituloSeccion = () => {
        if (filtroTipo === 'satisfaccion_evento') {
            return `Encuestas de Satisfacción del Evento: ${eventoNombre}`;
        } else if (actividadSeleccionada && actividadNombre) {
            return `Encuestas de la Actividad: ${actividadNombre}`;
        } else if (eventoNombre) {
            return `Encuestas del Evento: ${eventoNombre}`;
        }
        return 'Encuestas';
    };

    if (actividadesDisponibles.length === 0) {
        return (
            <div className={styles.noActividad}>
                <h3>No hay actividades disponibles</h3>
                <p>No estás inscrito en ningún evento o los eventos no tienen actividades asignadas.</p>
            </div>
        );
    }

    return (
        <div className={styles.encuestasContainer}>
            {mostrarAlerta && (
                <div className={`${styles.alerta} ${styles[tipoAlerta]}`}>
                    <div className={styles.alertaContenido}>
                        <span>{mensajeAlerta}</span>
                        <button
                            onClick={cerrarAlerta}
                            className={styles.cerrarAlerta}
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            <div className={styles.header}>
                <div>
                    <h2 className={styles.title}>Encuestas</h2>
                    <p className={styles.subtitle}>Selecciona un evento y una actividad para ver las encuestas disponibles</p>
                </div>
            </div>

            <div className={styles.filtrosCascada}>
                <div className={styles.filtroGrupo}>
                    <label className={styles.filtroLabel}>Evento:</label>
                    <select
                        value={eventoSeleccionado}
                        onChange={(e) => {
                            setEventoSeleccionado(e.target.value);
                            setActividadSeleccionada('');
                            setFiltroTipo('');
                        }}
                        className={styles.filtroSelect}
                    >
                        <option value="">Seleccionar evento</option>
                        {eventosUnicos.map(evento => (
                            <option key={evento.id} value={evento.id}>
                                {evento.titulo} - {formatFecha(evento.fecha_inicio)}
                            </option>
                        ))}
                    </select>
                </div>

                {eventoSeleccionado && filtroTipo !== 'satisfaccion_evento' && (
                    <div className={styles.filtroGrupo}>
                        <label className={styles.filtroLabel}>Actividad:</label>
                        <select
                            value={actividadSeleccionada}
                            onChange={(e) => {
                                setActividadSeleccionada(e.target.value);
                                if (filtroTipo === 'satisfaccion_evento') {
                                    setFiltroTipo('');
                                }
                            }}
                            className={styles.filtroSelect}
                            disabled={actividadesFiltradas.length === 0}
                        >
                            <option value="">Seleccionar actividad</option>
                            {actividadesFiltradas.map(actividad => (
                                <option key={actividad.id_actividad} value={actividad.id_actividad}>
                                    {actividad.titulo} - {formatFecha(actividad.fecha_actividad || actividad.evento_fecha_inicio)}
                                </option>
                            ))}
                        </select>
                        {actividadesFiltradas.length === 0 && (
                            <div className={styles.sinActividades}>Este evento no tiene actividades</div>
                        )}
                    </div>
                )}

                {eventoSeleccionado && (
                    <div className={styles.filtroGrupo}>
                        <label className={styles.filtroLabel}>Tipo de encuesta:</label>
                        <select
                            value={filtroTipo}
                            onChange={(e) => {
                                const nuevoTipo = e.target.value;
                                setFiltroTipo(nuevoTipo);

                                if (nuevoTipo === 'satisfaccion_evento') {
                                    setActividadSeleccionada('');
                                }
                            }}
                            className={styles.filtroSelect}
                        >
                            {tiposEncuesta.map(tipo => (
                                <option key={tipo.value} value={tipo.value}>
                                    {tipo.label}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {(eventoSeleccionado || actividadSeleccionada || filtroTipo) && (
                    <button
                        className={styles.resetButton}
                        onClick={resetearFiltros}
                        title="Resetear filtros"
                    >
                        Limpiar filtros
                    </button>
                )}
            </div>

            {(eventoSeleccionado || actividadSeleccionada) && (
                <div className={styles.seccionTitulo}>
                    <h3>{getTituloSeccion()}</h3>
                </div>
            )}

            {!eventoSeleccionado ? (
                <div className={styles.noSeleccion}>
                    <div className={styles.infoIcon}>📅</div>
                    <h3>Selecciona un evento</h3>
                    <p>Elige un evento para ver las encuestas disponibles</p>
                </div>
            ) : loading ? (
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p>Cargando encuestas...</p>
                </div>
            ) : error ? (
                <div className={styles.errorContainer}>
                    <div className={styles.errorIcon}>⚠️</div>
                    <h3>Error al cargar encuestas</h3>
                    <p>{error}</p>
                    <button className={styles.retryButton} onClick={cargarEncuestas}>
                        Reintentar
                    </button>
                </div>
            ) : encuestasFiltradas.length === 0 ? (
                <div className={styles.noEncuestas}>
                    <h3>No hay encuestas disponibles</h3>
                    <p>
                        {filtroTipo
                            ? `No hay encuestas del tipo "${getTextoPorTipo(filtroTipo)}" para esta ${filtroTipo === 'satisfaccion_evento' ? 'evento' : 'actividad'}.`
                            : 'No hay encuestas asignadas.'
                        }
                    </p>
                </div>
            ) : (
                <>
                    <div className={styles.stats}>
                        <div className={styles.statCard}>
                            <span className={styles.statNumber}>{encuestasFiltradas.length}</span>
                            <span className={styles.statLabel}>Total</span>
                        </div>
                        <div className={styles.statCard}>
                            <span className={styles.statNumber}>
                                {encuestasFiltradas.filter(e => obtenerEstadoEncuesta(e).estado === 'completada').length}
                            </span>
                            <span className={styles.statLabel}>Completadas</span>
                        </div>
                        <div className={styles.statCard}>
                            <span className={styles.statNumber}>
                                {encuestasFiltradas.filter(e => obtenerEstadoEncuesta(e).estado === 'pendiente').length}
                            </span>
                            <span className={styles.statLabel}>Pendientes</span>
                        </div>
                    </div>

                    <div className={styles.encuestasGrid}>
                        {encuestasFiltradas.map((encuesta) => (
                            <EncuestaCard
                                key={encuesta.id}
                                encuesta={encuesta}
                                color={getColorPorTipo(encuesta.tipo_encuesta)}
                                tipoTexto={getTextoPorTipo(encuesta.tipo_encuesta)}
                                estado={obtenerEstadoEncuesta(encuesta)}
                                onAcceder={() => handleAccederEncuesta(encuesta)}
                                onCompletar={() => handleCompletarEncuesta(encuesta)}
                                loading={completando}
                                esEncuestaEvento={encuesta.tipo_encuesta === 'satisfaccion_evento'}
                                eventoNombre={eventoNombre}
                                idAsistente={idAsistente} // ← Pasar id_asistente como prop
                            />
                        ))}
                    </div>
                </>
            )}

            {modalAbierto && encuestaSeleccionada && (
                <EncuestaModal
                    encuesta={encuestaSeleccionada}
                    tipoTexto={getTextoPorTipo(encuestaSeleccionada.tipo_encuesta)}
                    estado={obtenerEstadoEncuesta(encuestaSeleccionada)}
                    onClose={() => {
                        setModalAbierto(false);
                        setConfirmandoCompletar(false);
                    }}
                    onCompletar={confirmarCompletar}
                    confirmandoCompletar={confirmandoCompletar}
                    color={getColorPorTipo(encuestaSeleccionada.tipo_encuesta)}
                    esEncuestaEvento={encuestaSeleccionada.tipo_encuesta === 'satisfaccion_evento'}
                    eventoNombre={eventoNombre}
                    idAsistente={idAsistente} // ← Pasar también aquí
                />
            )}
        </div>
    );
};

export default Encuestas;