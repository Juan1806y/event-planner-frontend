import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, Search, Edit, Eye, Trash2 } from 'lucide-react';
import {
    obtenerEventos,
    eliminarEvento,
} from "../../components/eventosService";
import './EventosPage.css';

// Diccionario de estados
const ESTADOS_EVENTO = {
    0: { texto: 'Borrador', clase: 'inactivo' },
    1: { texto: 'Publicado', clase: 'publicado' },
    2: { texto: 'Cancelado', clase: 'terminado' },
    3: { texto: 'Finalizado', clase: 'cancelado' },
};

// Componente principal EventosPage
const EventosPage = () => {
    const navigate = useNavigate();
    const [eventos, setEventos] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

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

    const handleEliminar = async (id) => {
        if (window.confirm("¿Seguro que deseas eliminar este evento?")) {
            await eliminarEvento(id);
            cargarEventos();
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

                {/* Table */}
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
                                                <button className="btn-action btn-editar" title="Editar">
                                                    <Edit size={16} />
                                                    Editar
                                                </button>
                                                <button className="btn-action btn-ver" title="Ver">
                                                    <Eye size={16} />
                                                    Ver
                                                </button>
                                                <button
                                                    onClick={() => handleEliminar(evento.id)}
                                                    className="btn-action btn-eliminar"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={16} />
                                                    Eliminar
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
        </div>
    );
};

export default EventosPage;