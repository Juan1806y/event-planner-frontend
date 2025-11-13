import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, Search, Edit, Eye, Trash2, X, MapPin, Users, Clock, FileText } from 'lucide-react';
import {
    obtenerEventos,
    eliminarEvento,
} from "../../components/eventosService";
import './EventosPage.css';

const ESTADOS_EVENTO = {
    0: { texto: 'Borrador', clase: 'inactivo' },
    1: { texto: 'Publicado', clase: 'publicado' },
    2: { texto: 'Cancelado', clase: 'terminado' },
    3: { texto: 'Finalizado', clase: 'cancelado' },
};

const EventosPage = () => {
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
            const data = await obtenerEventos();
            setEventos(data.data);
        } catch (error) {
            console.error("Error al cargar eventos:", error.message);
            if (error.message?.includes("Token inválido")) {
                alert("Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.");
            }
        }
    };

    useEffect(() => {
        cargarEventos();
    }, []);

    // 🟡 Mostrar modal de confirmación eliminar
    const confirmarEliminar = (evento) => {
        setEventoAEliminar(evento);
        setModalVisible(true);
    };

    // 👁️ Mostrar modal de visualización
    const verEvento = (evento) => {
        setEventoAVer(evento);
        setModalVerVisible(true);
    };

    // 🔴 Ejecutar eliminación
    const handleEliminar = async () => {
        if (!eventoAEliminar) return;

        try {
            setLoadingEliminar(true);
            console.log('🗑️ Eliminando evento ID:', eventoAEliminar.id);

            const resultado = await eliminarEvento(eventoAEliminar.id);
            console.log('📥 Respuesta del servidor:', resultado);

            setModalVisible(false);
            setEventoAEliminar(null);

            console.log('🔄 Recargando lista de eventos...');
            const eventosActualizados = await obtenerEventos();
            console.log('📋 Eventos después de eliminar:', eventosActualizados.data.length);

            const eventoEliminado = eventosActualizados.data.find(e => e.id === eventoAEliminar.id);

            setEventos(eventosActualizados.data);

        } catch (error) {
            console.error("❌ Error al eliminar evento:", error);
            console.error("Detalles completos:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            alert('Error al eliminar: ' + (error.message || 'Error desconocido'));
        } finally {
            setLoadingEliminar(false);
        }
    };

    const eventosFiltrados = eventos.filter(evento =>
        evento.titulo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="eventos-page">
            <div className="eventos-container">
                {/* Header */}
                <div className="page-header">
                    <div className="header-content">
                        <div className="header-left">
                            <Calendar size={24} className="header-icon" />
                            <h1 className="page-title">Gestionar Eventos</h1>
                        </div>
                    </div>
                </div>

                {/* Search and Actions Bar */}
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
                        onClick={() => navigate('/eventos/crear')}
                        className="btn-crear-evento"
                    >
                        <Plus size={20} />
                        Crear Evento
                    </button>
                </div>

                {/* Tabla */}
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
                            {eventosFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="empty-state">
                                        <Calendar size={48} className="empty-icon" />
                                        <p>No hay eventos registrados</p>
                                        <button
                                            onClick={() => navigate('/eventos/crear')}
                                            className="btn-crear-primero"
                                        >
                                            Crear tu primer evento
                                        </button>
                                    </td>
                                </tr>
                            ) : (
                                eventosFiltrados.map((evento) => (
                                    <tr key={evento.id}>
                                        <td className="evento-nombre">{evento.titulo}</td>
                                        <td>{new Date(evento.fecha_inicio).toLocaleDateString('es-ES')}</td>
                                        <td>{new Date(evento.fecha_fin).toLocaleDateString('es-ES')}</td>
                                        <td>{evento.modalidad}</td>
                                        <td>
                                            <span className="inscritos-badge">
                                                0/{evento.cupos}
                                            </span>
                                        </td>
                                        <td>
                                            {(() => {
                                                const estadoInfo = ESTADOS_EVENTO[evento.estado] || { texto: 'Desconocido', clase: 'desconocido' };
                                                return (
                                                    <span className={`estado-badge estado-${estadoInfo.clase}`}>
                                                        {estadoInfo.texto}
                                                    </span>
                                                );
                                            })()}
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    onClick={() => navigate(`/eventos/editar/${evento.id}`)}
                                                    className="btn-action btn-editar"
                                                    title="Editar"
                                                >
                                                    <Edit size={16} />
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => verEvento(evento)}
                                                    className="btn-action btn-ver"
                                                    title="Ver"
                                                >
                                                    <Eye size={16} />
                                                    Ver
                                                </button>
                                                <button
                                                    onClick={() => confirmarEliminar(evento)}
                                                    className="btn-action btn-eliminar"
                                                    title="Eliminar"
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

            {/* 🧩 Modal de confirmación eliminar */}
            {modalVisible && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button
                            onClick={() => setModalVisible(false)}
                            className="modal-close"
                        >
                            <X size={20} />
                        </button>
                        <h2 className="modal-title">Confirmar eliminación</h2>
                        <p className="modal-text">
                            ¿Estás seguro de que deseas eliminar el evento{" "}
                            <strong>{eventoAEliminar?.titulo}</strong>? Esta acción no se puede deshacer.
                        </p>
                        <div className="modal-actions">
                            <button
                                onClick={() => setModalVisible(false)}
                                className="btn-cancelar"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleEliminar}
                                className="btn-confirmar"
                                disabled={loadingEliminar}
                            >
                                {loadingEliminar ? "Eliminando..." : "Sí, eliminar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {modalVerVisible && eventoAVer && (
                <div className="modal-overlay">
                    <div className="modal-content modal-ver-evento">
                        <button
                            onClick={() => setModalVerVisible(false)}
                            className="modal-close"
                        >
                            <X size={20} />
                        </button>

                        <div className="modal-header-ver">
                            <h2 className="modal-title-ver">{eventoAVer.titulo}</h2>
                            <span className={`estado-badge-modal estado-${ESTADOS_EVENTO[eventoAVer.estado]?.clase || 'desconocido'}`}>
                                {ESTADOS_EVENTO[eventoAVer.estado]?.texto || 'Desconocido'}
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
                                    navigate(`/eventos/editar/${eventoAVer.id}`);
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

export default EventosPage;