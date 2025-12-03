import { useState, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import encuestaService from '../../../services/encuestaService';

export const useEncuestas = () => {
    const [encuestas, setEncuestas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [completando, setCompletando] = useState(false);

    const { user } = useAuth();

    const getUserId = () => {
        if (user) {
            if (user.rolData && user.rolData.id_asistente) {
                return user.rolData.id_asistente;
            }

            const posiblesIds = {
                'id_asistente': user.id_asistente,
                'asistente_id': user.asistente_id,
                'idAsistente': user.idAsistente,
                'id': user.id,
            };

            for (const [key, value] of Object.entries(posiblesIds)) {
                if (value !== undefined && value !== null) {
                    return value;
                }
            }
        }

        try {
            const token = localStorage.getItem('access_token');
            if (token) {
                const payload = JSON.parse(atob(token.split('.')[1]));

                if (payload.rolData && payload.rolData.id_asistente) {
                    return payload.rolData.id_asistente;
                }

                return payload.id;
            }
        } catch (error) {
        }

        return null;
    };

    const obtenerEncuestas = useCallback(async (opciones = {}) => {
        const { actividadId, eventoId, tipoEncuesta } = opciones;

        setLoading(true);
        setError(null);

        try {
            let endpoint = '';

            if (eventoId) {
                endpoint = `/api/encuestas?evento_id=${eventoId}`;
            } else {
                throw new Error('Se requiere eventoId');
            }

            const response = await encuestaService.fetch(endpoint);

            if (response.success) {
                let todasLasEncuestas = response.data || [];

                let encuestasFiltradas = todasLasEncuestas.filter(encuesta => {
                    if (tipoEncuesta === 'satisfaccion_evento') {
                        return encuesta.tipo_encuesta === 'satisfaccion_evento' &&
                            encuesta.id_evento == eventoId &&
                            encuesta.id_actividad === null;
                    }

                    if (tipoEncuesta && tipoEncuesta !== 'satisfaccion_evento') {
                        if (actividadId) {
                            return encuesta.tipo_encuesta === tipoEncuesta &&
                                encuesta.id_actividad == actividadId;
                        } else {
                            return encuesta.tipo_encuesta === tipoEncuesta;
                        }
                    }

                    if (actividadId) {
                        return encuesta.id_actividad == actividadId;
                    }

                    return true;
                });

                setEncuestas(encuestasFiltradas);
                return encuestasFiltradas;
            } else {
                throw new Error(response.message || 'Error al obtener encuestas');
            }
        } catch (error) {
            setError(error.message || 'Error al cargar encuestas');
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const obtenerEncuestasPorActividad = useCallback(async (actividadId, tipoEncuesta = null) => {
        throw new Error('Este método requiere eventoId. Usa obtenerEncuestas({ actividadId, eventoId, tipoEncuesta })');
    }, []);

    const marcarComoCompletada = async (idEncuesta) => {
        try {
            const userId = getUserId();

            if (!userId) {
                throw new Error('No se pudo obtener el ID del asistente');
            }

            setCompletando(true);

            const response = await encuestaService.completarEncuesta(idEncuesta, userId);

            if (!response.success) {
                throw new Error(response.message || 'Error al completar encuesta');
            }

            setEncuestas(prevEncuestas =>
                prevEncuestas.map(encuesta => {
                    if (encuesta.id === idEncuesta) {
                        if (encuesta.respuestas && encuesta.respuestas.length > 0) {
                            return {
                                ...encuesta,
                                respuestas: [{
                                    ...encuesta.respuestas[0],
                                    estado: 'completada',
                                    fecha_completado: new Date().toISOString()
                                }]
                            };
                        } else {
                            return {
                                ...encuesta,
                                respuestas: [{
                                    estado: 'completada',
                                    fecha_completado: new Date().toISOString(),
                                    id_encuesta: idEncuesta,
                                    id_asistente: userId
                                }]
                            };
                        }
                    }
                    return encuesta;
                })
            );

            return response;
        } catch (error) {
            throw error;
        } finally {
            setCompletando(false);
        }
    };

    const filtrarPorTipo = useCallback((tipo) => {
        if (!tipo) return encuestas;
        return encuestas.filter(encuesta => encuesta.tipo_encuesta === tipo);
    }, [encuestas]);

    const obtenerEstadoEncuesta = useCallback((encuesta) => {
        if (!encuesta.respuestas || encuesta.respuestas.length === 0) {
            return { estado: 'no_enviada', texto: 'No enviada' };
        }

        const respuesta = encuesta.respuestas[0];
        if (respuesta.estado === 'completada') {
            return { estado: 'completada', texto: 'Completada' };
        } else if (respuesta.estado === 'pendiente') {
            return { estado: 'pendiente', texto: 'Pendiente' };
        }

        return { estado: 'pendiente', texto: 'Pendiente' };
    }, []);

    return {
        encuestas,
        loading,
        error,
        completando,
        obtenerEncuestas,
        obtenerEncuestasPorActividad,
        marcarComoCompletada,
        filtrarPorTipo,
        obtenerEstadoEncuesta,
        setEncuestas
    };
};