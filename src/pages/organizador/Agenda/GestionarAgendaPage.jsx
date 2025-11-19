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
} from 'lucide-react';
import {
    obtenerEventoPorId,
    obtenerActividadesEvento,
    eliminarActividad
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

    const cargarDatos = useCallback(async () => {
        try {
            setLoading(true);

            const eventoData = await obtenerEventoPorId(eventoId);
            setEvento(eventoData.data);

            const actividadesData = await obtenerActividadesEvento(eventoId);
            const acts = Array.isArray(actividadesData.data)
                ? actividadesData.data
                : [actividadesData.data];
            setActividades(acts);
            agruparActividadesPorFecha(acts);
        } catch (error) {
            console.error('Error al cargar datos:', error);
        } finally {
            setLoading(false);
        }
    }, [eventoId]);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    const agruparActividadesPorFecha = (acts) => {
        const agrupadas = acts.reduce((acc, actividad) => {
            // Extraer la fecha sin conversión de zona horaria
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

            // Recargar los datos después de eliminar
            await cargarDatos();
        } catch (error) {
            console.error('Error completo:', error);
            console.error('Error response:', error.response);
            console.error('Error data:', error.response?.data);
            console.error('Error status:', error.response?.status);
            alert(`Error al eliminar: ${error.response?.data?.message || error.message}`);
        }
    };

    const formatearHora = (hora) => {
        if (!hora) return '';
        return hora.substring(0, 5);
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
                    <h2>{evento?.titulo}</h2>
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
                                <div className="col-tipo">TIPO</div>
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
                                            <span>{actividad.ponente || 'Sin ponente'}</span>
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
        </div>
    );
};

export default GestionarAgendaPage;