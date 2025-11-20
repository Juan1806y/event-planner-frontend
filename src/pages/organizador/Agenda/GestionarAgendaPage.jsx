import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Calendar,
    ArrowLeft,
    Plus,
    Edit,
    Trash2,
    User,
    Clock,
    MapPin,
    Eye,
    X,
} from 'lucide-react';
import {
    obtenerEventoPorId,
    obtenerActividadesEvento,
    eliminarActividad,
    obtenerPonenteAsignado
} from '../../../components/eventosService';
import './GestionarAgendaPage.css';
import Sidebar from '../Sidebar';

const GestionarAgendaPage = () => {
    const navigate = useNavigate();
    const { eventoId } = useParams();
    const [evento, setEvento] = useState(null);
    const [actividades, setActividades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actividadesPorFecha, setActividadesPorFecha] = useState({});
    const [ponentesAsignados, setPonentesAsignados] = useState({});
    const [modalAbierto, setModalAbierto] = useState(false);
    const [actividadSeleccionada, setActividadSeleccionada] = useState(null);

    const cargarDatos = useCallback(async () => {
        try {
            setLoading(true);

            const eventoData = await obtenerEventoPorId(eventoId);
            setEvento(eventoData.data);

            const actividadesData = await obtenerActividadesEvento(eventoId);
            console.log(actividadesData);
            const acts = Array.isArray(actividadesData.data)
                ? actividadesData.data
                : [actividadesData.data];
            setActividades(acts);
            agruparActividadesPorFecha(acts);

            await cargarPonentesAsignados(acts);
        } catch (error) {
            console.error('Error al cargar datos:', error);
        } finally {
            setLoading(false);
        }
    }, [eventoId]);

    const cargarPonentesAsignados = async (actividades) => {
        const ponentesMap = {};

        for (const actividad of actividades) {
            try {
                const response = await obtenerPonenteAsignado(actividad.id_actividad);
                if (response.success && response.data.length > 0) {
                    const asignacion = response.data[0];
                    ponentesMap[actividad.id_actividad] = asignacion.ponente?.usuario?.nombre || 'Pendiente';
                } else {
                    ponentesMap[actividad.id_actividad] = 'Pendiente';
                }
            } catch (error) {
                console.error(`Error cargando ponente para actividad ${actividad.id_actividad}:`, error);
                ponentesMap[actividad.id_actividad] = 'Pendiente';
            }
        }

        setPonentesAsignados(ponentesMap);
    };

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    const agruparActividadesPorFecha = (acts) => {
        const agrupadas = acts.reduce((acc, actividad) => {
            const fecha = actividad.fecha_actividad.split('T')[0];
            const [year, month, day] = fecha.split('-');
            const fechaFormateada = `${day}/${month}/${year}`;

            if (!acc[fechaFormateada]) {
                acc[fechaFormateada] = [];
            }
            acc[fechaFormateada].push(actividad);
            return acc;
        }, {});
        setActividadesPorFecha(agrupadas);
    };

    const handleEliminar = async (actividadId) => {
        if (!window.confirm('¿Estás seguro de eliminar esta actividad?')) return;

        try {
            console.log('Eliminando actividad con ID:', actividadId);
            const resultado = await eliminarActividad(actividadId);
            console.log('Resultado de eliminación:', resultado);

            await cargarDatos();
        } catch (error) {
            console.error('Error completo:', error);
            console.error('Error response:', error.response);
            console.error('Error data:', error.response?.data);
            console.error('Error status:', error.response?.status);
            alert(`Error al eliminar: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleVerActividad = (actividad) => {
        setActividadSeleccionada(actividad);
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setActividadSeleccionada(null);
    };

    const formatearHora = (hora) => {
        if (!hora) return '';
        return hora.substring(0, 5);
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return '';
        const [year, month, day] = fecha.split('T')[0].split('-');
        return `${day}/${month}/${year}`;
    };

    if (loading) {
        return (
            <div className="gestionar-agenda-page">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Cargando agenda...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="gestionar-agenda-page">
            <Sidebar />
            <div className="agenda-container">
                <div className="page-header-agenda">
                    <Calendar size={28} className="header-icon-agenda" />
                    <h1>Gestionar Agenda</h1>
                </div>

                <div className="evento-info-card">
                    <h3>{evento?.titulo}</h3>
                    <p className="evento-fechas">
                        {evento?.fecha_inicio?.split('T')[0].split('-').reverse().join('/')} - {evento?.fecha_fin?.split('T')[0].split('-').reverse().join('/')}
                    </p>
                </div>

                <div className="acciones-header">
                    <button
                        onClick={() => navigate('/organizador')}
                        className="btn-volver"
                    >
                        <ArrowLeft size={18} />
                        Volver a Eventos
                    </button>
                    <button
                        onClick={() => navigate(`/organizador/eventos/${eventoId}/actividades/crear`)}
                        className="btn-crear-actividad"
                    >
                        <Plus size={18} />
                        Crear Actividad
                    </button>
                </div>

                <div className="estadisticas-grid">
                    <div className="estadistica-card">
                        <div className="estadistica-icon blue">
                            <Calendar size={24} />
                        </div>
                        <div className="estadistica-content">
                            <p className="estadistica-label">Total Actividades</p>
                            <p className="estadistica-valor">{actividades.length}</p>
                        </div>
                    </div>
                </div>

                {Object.entries(actividadesPorFecha).map(([fecha, acts]) => (
                    <div key={fecha} className="fecha-seccion">
                        <div className="fecha-header">
                            <Calendar size={20} />
                            <h3>{fecha}</h3>
                        </div>

                        <div className="actividades-tabla">
                            <div className="tabla-header">
                                <div className="col-titulo">TÍTULO</div>
                                <div className="col-ponente">PONENTE</div>
                                <div className="col-horario">HORARIO</div>
                                <div className="col-sala">SALA</div>
                                <div className="col-acciones">ACCIONES</div>
                            </div>

                            {acts.map((actividad) => (
                                <div key={actividad.id_actividad} className="tabla-row">
                                    <div className="col-titulo">
                                        <div className="actividad-titulo-info">
                                            <h4>{actividad.titulo}</h4>
                                            <p>{actividad.descripcion}</p>
                                        </div>
                                    </div>

                                    <div className="col-ponente">
                                        <div className="ponente-info">
                                            <User size={16} />
                                            <span>
                                                {ponentesAsignados[actividad.id_actividad] || 'Cargando...'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="col-horario">
                                        <div className="horario-info">
                                            <Clock size={16} />
                                            <span>
                                                {formatearHora(actividad.hora_inicio)} - {formatearHora(actividad.hora_fin)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="col-sala">
                                        <div className="sala-info">
                                            <MapPin size={16} />
                                            <span>{actividad.lugares?.[0]?.nombre || 'Sin sala'}</span>
                                        </div>
                                    </div>

                                    <div className="col-acciones">
                                        <button
                                            onClick={() => handleVerActividad(actividad)}
                                            className="btn-accion btn-ver-accion"
                                            title="Ver detalles"
                                        >
                                            <Eye size={16} />
                                            Ver
                                        </button>
                                        <button
                                            onClick={() => {
                                                sessionStorage.setItem('currentEventoId', eventoId);
                                                console.log("ID del evento:", eventoId);
                                                console.log("ID de la actividad:", actividad.id_actividad);
                                                navigate(`/organizador/actividades/${actividad.id_actividad}/editar`);
                                            }}
                                            className="btn-accion btn-editar-accion"
                                            title="Editar"
                                        >
                                            <Edit size={16} />
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleEliminar(actividad.id_actividad)}
                                            className="btn-accion btn-eliminar-accion"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={16} />
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {actividades.length === 0 && (
                    <div className="empty-actividades">
                        <Calendar size={64} className="empty-icon" />
                        <h3>No hay actividades programadas</h3>
                        <p>Crea tu primera actividad para comenzar a gestionar la agenda</p>
                        <button
                            onClick={() => navigate(`/organizador/eventos/${eventoId}/actividades/crear`)}
                            className="btn-crear-actividad"
                        >
                            <Plus size={18} />
                            Crear Primera Actividad
                        </button>
                    </div>
                )}
            </div>

            {/* Modal de Detalles de Actividad */}
            {modalAbierto && actividadSeleccionada && (
                <div className="modal-overlay" onClick={cerrarModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-header-content">
                                <div className="modal-icon-wrapper">
                                    <Calendar size={28} />
                                </div>
                                <div>
                                    <h2>Detalles de la Actividad</h2>
                                </div>
                            </div>
                            <button onClick={cerrarModal} className="modal-close-btn">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="modal-card">
                                <div className="modal-card-header">
                                    <div className="card-icon blue">
                                        <Calendar size={18} />
                                    </div>
                                    <h3>Información General</h3>
                                </div>
                                <div className="modal-card-content">
                                    <div className="info-row">
                                        <span className="info-label">Título</span>
                                        <span className="info-value">{actividadSeleccionada.titulo}</span>
                                    </div>
                                    <div className="info-row full-width">
                                        <span className="info-label">Descripción</span>
                                        <span className="info-value description">{actividadSeleccionada.descripcion || 'Sin descripción disponible'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-cards-row">
                                <div className="modal-card">
                                    <div className="modal-card-header">
                                        <div className="card-icon purple">
                                            <Clock size={18} />
                                        </div>
                                        <h3>Fecha y Horario</h3>
                                    </div>
                                    <div className="modal-card-content">
                                        <div className="info-item">
                                            <Calendar size={16} className="item-icon" />
                                            <div>
                                                <span className="item-label">Fecha</span>
                                                <span className="item-value">{formatearFecha(actividadSeleccionada.fecha_actividad)}</span>
                                            </div>
                                        </div>
                                        <div className="info-item">
                                            <Clock size={16} className="item-icon" />
                                            <div>
                                                <span className="item-label">Horario</span>
                                                <span className="item-value">
                                                    {formatearHora(actividadSeleccionada.hora_inicio)} - {formatearHora(actividadSeleccionada.hora_fin)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="modal-card">
                                    <div className="modal-card-header">
                                        <div className="card-icon green">
                                            <MapPin size={18} />
                                        </div>
                                        <h3>Ubicación</h3>
                                    </div>
                                    <div className="modal-card-content">
                                        <div className="info-item">
                                            <MapPin size={16} className="item-icon" />
                                            <div>
                                                <span className="item-label">Sala/Lugar</span>
                                                <span className="item-value">{actividadSeleccionada.lugares?.[0]?.nombre || 'Sin sala asignada'}</span>
                                            </div>
                                        </div>
                                        {actividadSeleccionada.lugares?.[0]?.direccion && (
                                            <div className="info-item">
                                                <MapPin size={16} className="item-icon" />
                                                <div>
                                                    <span className="item-label">Dirección</span>
                                                    <span className="item-value small">{actividadSeleccionada.lugares[0].direccion}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="modal-card">
                                <div className="modal-card-header">
                                    <div className="card-icon orange">
                                        <User size={18} />
                                    </div>
                                    <h3>Ponente Asignado</h3>
                                </div>
                                <div className="modal-card-content">
                                    <div className="ponente-card">
                                        <div className="ponente-avatar">
                                            <User size={24} />
                                        </div>
                                        <div className="ponente-info-modal">
                                            <span className="ponente-name">{ponentesAsignados[actividadSeleccionada.id_actividad] || 'Pendiente de asignación'}</span>
                                            <span className="ponente-role">Ponente principal</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                onClick={cerrarModal}
                                className="btn-modal btn-secondary"
                            >
                                Cerrar
                            </button>
                            <button
                                onClick={() => {
                                    sessionStorage.setItem('currentEventoId', eventoId);
                                    navigate(`/organizador/actividades/${actividadSeleccionada.id_actividad}/editar`);
                                }}
                                className="btn-modal btn-primary"
                            >
                                <Edit size={18} />
                                Editar Actividad
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionarAgendaPage;