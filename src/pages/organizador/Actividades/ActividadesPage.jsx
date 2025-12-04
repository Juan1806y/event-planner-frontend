import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, ChevronRight } from 'lucide-react';
import { obtenerPerfil, obtenerEventos, obtenerActividadesEvento } from '../../../components/eventosService';
import './ActividadesPage.css';
import Sidebar from '../Sidebar';

const ActividadesPage = () => {
    const navigate = useNavigate();
    const [eventosInscritos, setEventosInscritos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [usuario, setUsuario] = useState(null);

    const cargarDatos = useCallback(async () => {
        try {
            setLoading(true);

            const perfilData = await obtenerPerfil();
            const usuarioPerfil = perfilData?.data?.usuario || perfilData?.data;
            setUsuario(usuarioPerfil);

            const idCreador = usuarioPerfil?.id || null;

            const data = await obtenerEventos();

            const eventosDelCreador = Array.isArray(data.data)
                ? data.data.filter(e => String(e.id_creador) === String(idCreador))
                : [];

            setEventosInscritos(eventosDelCreador);
        } catch (error) {
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    const formatearFecha = (fecha) => {
        if (!fecha) return '';
        const [year, month, day] = fecha.split('T')[0].split('-');
        const fechaObj = new Date(year, month - 1, day);
        return fechaObj.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const verAgendaCompleta = async (eventoId) => {
        try {
            const actividades = await obtenerActividadesEvento(eventoId);
            navigate(`/organizador/eventos/${eventoId}/agenda`, { state: { actividades } });
        } catch (error) { }
    };

    if (loading) {
        return (
            <div className="actividades-page">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Cargando tu agenda...</p>
                </div>
            </div>
        );
    }

    console.log(usuario)
    return (
        <div className="actividades-page">
            <Sidebar />
            <div className="actividades-container">
                <div className="agenda-header">
                    <div className="header-icon-box">
                        <Calendar size={32} />
                    </div>
                    <div className="header-text">
                        <h1>Gestionar Agenda</h1>
                    </div>
                </div>

                <div className="eventos-section">
                    <p className="section-subtitle">
                        Selecciona un evento para gestionar su agenda de actividades
                    </p>

                    {eventosInscritos.length === 0 ? (
                        <div className="empty-agenda">
                            <Calendar size={64} className="empty-icon" />
                            <h3>No tienes eventos inscritos</h3>
                            <p>Explora los eventos disponibles y regístrate para ver tu agenda personalizada</p>
                        </div>
                    ) : (
                        <div className="eventos-grid">
                            {eventosInscritos.map((evento) => (
                                <div key={evento.id} className="evento-card-agenda">
                                    <div className="evento-card-header">
                                        <h3 className="evento-titulo-agenda">{evento.titulo}</h3>
                                    </div>

                                    <div className="evento-card-body">
                                        <div className="evento-info-item">
                                            <Calendar size={16} />
                                            <span>{formatearFecha(evento.fecha_inicio)}</span>
                                        </div>

                                        <div className="evento-info-item">
                                            <MapPin size={16} />
                                            <span>
                                                {evento.modalidad === 'Virtual'
                                                    ? 'Virtual'
                                                    : evento.lugar?.nombre || 'Presencial'}
                                            </span>
                                        </div>

                                        <div className="evento-info-item">
                                            <Users size={16} />
                                            <span>{evento.actividades?.length || 0} actividades</span>
                                        </div>
                                    </div>

                                    <button
                                        className="btn-ver-agenda"
                                        onClick={() => verAgendaCompleta(evento.id)}
                                    >
                                        Ver Agenda Completa
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActividadesPage;
