import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, Search, Edit, Eye, Trash2, X, MapPin, Users, FileText } from 'lucide-react';
import { obtenerEventos, eliminarEvento, obtenerPerfil } from "../../../components/eventosService";
import './EventosPage.css';
import Sidebar from '../Sidebar';

const ESTADOS_EVENTO = {
    0: { texto: 'Borrador', clase: 'inactivo' },
    1: { texto: 'Publicado', clase: 'publicado' },
    2: { texto: 'Cancelado', clase: 'terminado' },
    3: { texto: 'Finalizado', clase: 'cancelado' },
};

const EventosPageOrganizador = () => {
    const navigate = useNavigate();
    const [eventos, setEventos] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [modalVerVisible, setModalVerVisible] = useState(false);
    const [eventoAEliminar, setEventoAEliminar] = useState(null);
    const [eventoAVer, setEventoAVer] = useState(null);
    const [loadingEliminar, setLoadingEliminar] = useState(false);

    const cargarEventos = async () => {
        try {
            const perfil = await obtenerPerfil();
            // Obtener id del creador desde distintas formas según la respuesta del endpoint
            const idCreador = perfil?.data?.usuario?.id
                || perfil?.data?.id
                || perfil?.usuario?.id
                || perfil?.id
                || perfil?.usuario_id
                || null;

            const data = await obtenerEventos();
            const listaEventos = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);

            // Normalizar y filtrar por posibles campos de creador
            const eventosDelCreador = listaEventos.filter((e) => {
                if (!idCreador) return false;
                const creadorFields = [
                    e.id_creador,
                    e.creador?.id,
                    e.creador_id,
                    e.usuario?.id,
                    e.usuario_id,
                    e.idCreador,
                    e.owner_id,
                    e.owner?.id
                ];

                return creadorFields.some(field => String(field) === String(idCreador));
            });

            setEventos(eventosDelCreador);
        } catch (error) {
            alert("Error al cargar eventos.");
        }
    };

    useEffect(() => {
        cargarEventos();
    }, []);

    const confirmarEliminar = (evento) => {
        setEventoAEliminar(evento);
        setModalVisible(true);
    };

    const verEvento = (evento) => {
        setEventoAVer(evento);
        console.log(evento)
        setModalVerVisible(true);
    };

    const handleEliminar = async () => {
        if (!eventoAEliminar) return;

        try {
            setLoadingEliminar(true);
            await eliminarEvento(eventoAEliminar.id);

            setModalVisible(false);
            setEventoAEliminar(null);

            const eventosActualizados = await obtenerEventos();
            setEventos(eventosActualizados.data);
        } catch {
            alert('Error al eliminar el evento.');
        } finally {
            setLoadingEliminar(false);
        }
    };

    const eventosVisibles = eventos.filter(evento =>
        evento.titulo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="eventos-page">
            <Sidebar />
            <div className="eventos-container">

                <div className="page-header">
                    <div className="header-content">
                        <div className="header-left">
                            <Calendar size={24} className="header-icon" />
                            <h1 className="page-title">Gestionar Eventos</h1>
                        </div>
                    </div>
                </div>

                <div className="action-bar">
                    <div className="search-container">
                        <Search size={20} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Buscar eventos por nombre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    <button
                        onClick={() => navigate('/organizador/eventos/crear')}
                        className="btn-crear-evento"
                    >
                        <Plus size={20} />
                        Crear Evento
                    </button>
                </div>

                <div className="table-container">
                    <table className="eventos-table">
                        <thead>
                            <tr>
                                <th>EVENTO</th>
                                <th>FECHA INICIO</th>
                                <th>FECHA FIN</th>
                                <th>MODALIDAD</th>
                                <th>INSCRITOS</th>
                                <th>ESTADO</th>
                                <th>ACCIONES</th>
                            </tr>
                        </thead>
                        <tbody>
                            {eventosVisibles.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="empty-state">
                                        <Calendar size={48} className="empty-icon" />
                                        <p>No hay eventos registrados</p>
                                        <button
                                            onClick={() => navigate('/organizador/eventos/crear')}
                                            className="btn-crear-primero"
                                        >
                                            Crear tu primer evento
                                        </button>
                                    </td>
                                </tr>
                            ) : (
                                eventosVisibles.map((evento) => (
                                    <tr key={evento.id}>
                                        <td className="evento-nombre">{evento.titulo}</td>
                                        <td>{new Date(evento.fecha_inicio).toLocaleDateString('es-ES')}</td>
                                        <td>{new Date(evento.fecha_fin).toLocaleDateString('es-ES')}</td>
                                        <td>{evento.modalidad}</td>
                                        <td>
                                            <span className="inscritos-badge">0/{evento.cupos}</span>
                                        </td>
                                        <td>
                                            <span className={`estado-badge estado-${ESTADOS_EVENTO[evento.estado]?.clase}`}>
                                                {ESTADOS_EVENTO[evento.estado]?.texto || 'Desconocido'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    onClick={() => navigate(`/organizador/eventos/editar/${evento.id}`)}
                                                    className="btn-action btn-editar"
                                                >
                                                    <Edit size={16} />
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => verEvento(evento)}
                                                    className="btn-action btn-ver"
                                                >
                                                    <Eye size={16} />
                                                    Ver
                                                </button>
                                                <button
                                                    onClick={() => confirmarEliminar(evento)}
                                                    className="btn-action btn-eliminar"
                                                >
                                                    <Trash2 size={16} />
                                                    Cancelar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal eliminar */}
            {modalVisible && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button onClick={() => setModalVisible(false)} className="modal-close">
                            <X size={20} />
                        </button>

                        <h2 className="modal-title">Confirmar eliminación</h2>
                        <p className="modal-text">
                            ¿Deseas eliminar el evento <strong>{eventoAEliminar?.titulo}</strong>? Esta acción no se puede deshacer.
                        </p>

                        <div className="modal-actions">
                            <button onClick={() => setModalVisible(false)} className="btn-cancelar">
                                Cancelar
                            </button>
                            <button onClick={handleEliminar} className="btn-confirmar" disabled={loadingEliminar}>
                                {loadingEliminar ? "Eliminando..." : "Sí, eliminar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal ver evento */}
            {modalVerVisible && eventoAVer && (
                <div className="modal-overlay">
                    <div className="modal-content modal-ver-evento">
                        <button onClick={() => setModalVerVisible(false)} className="modal-close">
                            <X size={20} />
                        </button>

                        <div className="modal-header-ver">
                            <h2 className="modal-title-ver">{eventoAVer.titulo}</h2>
                            <span className={`estado-badge-modal estado-${ESTADOS_EVENTO[eventoAVer.estado]?.clase}`}>
                                {ESTADOS_EVENTO[eventoAVer.estado]?.texto}
                            </span>
                        </div>

                        <div className="modal-body-ver">
                            {eventoAVer.descripcion && (
                                <div className="detalle-card">
                                    <div className="detalle-header">
                                        <div className="icon-circle blue">
                                            <FileText size={18} />
                                        </div>
                                        <h3>Descripción</h3>
                                    </div>
                                    <p className="detalle-text">{eventoAVer.descripcion}</p>
                                </div>
                            )}

                            <div className="detalle-card">
                                <div className="detalle-header">
                                    <div className="icon-circle yellow">
                                        <Calendar size={18} />
                                    </div>
                                    <h3>Fechas del Evento</h3>
                                </div>

                                <div className="detalle-grid-two">
                                    <div className="info-box">
                                        <span className="info-label">Inicio</span>
                                        <span className="info-value">
                                            {new Date(eventoAVer.fecha_inicio).toLocaleDateString('es-ES', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>

                                    <div className="info-box">
                                        <span className="info-label">Fin</span>
                                        <span className="info-value">
                                            {new Date(eventoAVer.fecha_fin).toLocaleDateString('es-ES', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>

                                    <div className="info-box">
                                        <span className="info-label">Hora</span>
                                        <span className="info-value">
                                            {eventoAVer.hora
                                                ? new Date(`1970-01-01T${eventoAVer.hora}`).toLocaleTimeString('es-ES', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })
                                                : "Sin hora"}
                                        </span>
                                    </div>

                                </div>
                            </div>

                            <div className="detalle-card">
                                <div className="detalle-header">
                                    <div className="icon-circle blue">
                                        <Users size={18} />
                                    </div>
                                    <h3>Información de Asistencia</h3>
                                </div>

                                <div className="detalle-grid-three">
                                    <div className="info-box">
                                        <span className="info-label">Modalidad</span>
                                        <span className="info-badge">{eventoAVer.modalidad}</span>
                                    </div>

                                    <div className="info-box">
                                        <span className="info-label">Cupos totales</span>
                                        <span className="info-value">{eventoAVer.cupos}</span>
                                    </div>

                                    <div className="info-box">
                                        <span className="info-label">Inscritos</span>
                                        <span className="info-value">0/{eventoAVer.cupos}</span>
                                    </div>
                                </div>
                            </div>

                            {eventoAVer.modalidad !== 'Virtual' && eventoAVer.lugar && (
                                <div className="detalle-card">
                                    <div className="detalle-header">
                                        <div className="icon-circle yellow">
                                            <MapPin size={18} />
                                        </div>
                                        <h3>Ubicación</h3>
                                    </div>

                                    <p className="detalle-text location-text">
                                        <MapPin size={16} />
                                        {eventoAVer.lugar.nombre} - {eventoAVer.lugar.ubicacion?.direccion || 'Sin dirección'}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="modal-footer-ver">
                            <button
                                onClick={() => {
                                    setModalVerVisible(false);
                                    navigate(`/organizador/eventos/editar/${eventoAVer.id}`);
                                }}
                                className="btn-editar-modal"
                            >
                                <Edit size={16} />
                                Editar Evento
                            </button>

                            <button
                                onClick={() => setModalVerVisible(false)}
                                className="btn-cerrar-modal"
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

export default EventosPageOrganizador;
