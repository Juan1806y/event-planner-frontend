import { useState, useEffect, useCallback } from 'react';
import { ponenteAgendaService } from '../../../services/ponenteAgendaService';

export const useEventosActividadesAceptadas = () => {
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getToken = () => {
        return localStorage.getItem('access_token');
    };

    const getPonenteId = () => {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) return null;
            const user = JSON.parse(userStr);
            return user?.rolData?.id_ponente || user?.id_ponente;
        } catch (error) {
            return null;
        }
    };

    const cargarEventosConActividadesAceptadas = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const token = getToken();
            if (!token) {
                throw new Error('No hay token de autenticación');
            }

            const ponenteId = getPonenteId();
            if (!ponenteId) {
                throw new Error('No se pudo identificar al ponente');
            }

            const data = await ponenteAgendaService.obtenerAgendaPonente(ponenteId, token);

            if (!data || !data.actividades) {
                setEventos([]);
                return;
            }

            const actividadesAceptadas = data.actividades.filter(actividad => {
                const estado = actividad.estado;
                const estadoNormalizado = String(estado).toLowerCase().trim();

                return estadoNormalizado === 'aceptado' ||
                    estadoNormalizado === 'aceptada' ||
                    estadoNormalizado.includes('acept');
            });

            if (actividadesAceptadas.length === 0) {
                setEventos([]);
                return;
            }

            const eventosMap = new Map();

            actividadesAceptadas.forEach(asignacion => {
                const evento = asignacion.evento;
                const actividad = asignacion.actividad;

                if (!evento || !actividad) {
                    return;
                }

                const eventoId = evento.id || evento.id_evento;

                if (!eventoId) {
                    return;
                }

                let nombreEvento = evento.titulo || `Evento ${eventoId}`;

                if (nombreEvento === 'Evento undefined' || nombreEvento.includes('undefined')) {
                    nombreEvento = evento.nombre || evento.titulo_evento || `Evento ${eventoId}`;
                }

                if (!eventosMap.has(eventoId)) {
                    eventosMap.set(eventoId, {
                        id: eventoId,
                        titulo: nombreEvento,
                        descripcion: evento.descripcion || '',
                        fecha_inicio: evento.fecha_inicio || '',
                        fecha_fin: evento.fecha_fin || '',
                        modalidad: evento.modalidad || 'No definida',
                        actividades: []
                    });
                }

                const eventoEnMapa = eventosMap.get(eventoId);

                const actividadYaExiste = eventoEnMapa.actividades.some(
                    a => a.id_actividad === (actividad.id_actividad || actividad.id)
                );

                if (!actividadYaExiste) {
                    eventoEnMapa.actividades.push({
                        id: actividad.id || actividad.id_actividad,
                        id_actividad: actividad.id_actividad || actividad.id,
                        titulo: actividad.titulo || 'Sin título',
                        fecha_actividad: actividad.fecha_actividad || actividad.fecha || '',
                        id_evento: eventoId
                    });
                }
            });

            const eventosFormateados = Array.from(eventosMap.values());
            setEventos(eventosFormateados);

        } catch (err) {
            setError(err.message || 'Error al cargar eventos');
            setEventos([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarEventosConActividadesAceptadas();
    }, [cargarEventosConActividadesAceptadas]);

    return {
        eventos,
        loading,
        error,
        refetch: cargarEventosConActividadesAceptadas
    };
};