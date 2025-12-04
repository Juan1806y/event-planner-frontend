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
                endpoint = `/encuestas?evento_id=${eventoId}`;
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

                console.log('📊 Encuestas filtradas:', encuestasFiltradas.length);

                const encuestasConEstadoVerificado = encuestasFiltradas.map(encuesta => {
                    const userId = getUserId();
                    if (!userId) return encuesta;

                    // Verificar localStorage específico del usuario
                    const estadoGuardado = localStorage.getItem(`encuesta_${encuesta.id}_estado_${userId}`);

                    if (estadoGuardado === 'completada') {
                        console.log(`🔄 Encuesta ${encuesta.id} marcada como completada en localStorage para usuario ${userId}`);

                        // Buscar si ya existe una respuesta de este usuario
                        const respuestasExistentes = encuesta.respuestas || [];
                        const respuestaExistenteIndex = respuestasExistentes.findIndex(
                            r => r.id_asistente == userId
                        );

                        if (respuestaExistenteIndex >= 0) {
                            // Actualizar respuesta existente
                            const nuevasRespuestas = [...respuestasExistentes];
                            nuevasRespuestas[respuestaExistenteIndex] = {
                                ...nuevasRespuestas[respuestaExistenteIndex],
                                estado: 'completada'
                            };
                            return {
                                ...encuesta,
                                respuestas: nuevasRespuestas
                            };
                        } else {
                            // Agregar nueva respuesta para este usuario
                            return {
                                ...encuesta,
                                respuestas: [
                                    ...respuestasExistentes,
                                    {
                                        estado: 'completada',
                                        fecha_completado: new Date().toISOString(),
                                        id_encuesta: encuesta.id,
                                        id_asistente: userId
                                    }
                                ]
                            };
                        }
                    }

                    return encuesta;
                });

                setEncuestas(encuestasConEstadoVerificado);
                return encuestasConEstadoVerificado;
            } else {
                throw new Error(response.message || 'Error al obtener encuestas');
            }
        } catch (error) {
            setError(error.message || 'Error al cargar encuestas');
            throw error;
        } finally {
            setLoading(false);
        }
    }, [getUserId]);

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

            console.log('🔍 Intentando marcar encuesta como completada:', {
                idEncuesta,
                userId
            });

            try {
                // Intentar marcar como completada
                const response = await encuestaService.completarEncuesta(idEncuesta, userId);

                console.log('✅ Encuesta marcada como completada:', response);

                if (!response.success) {
                    throw new Error(response.message || 'Error al completar encuesta');
                }

            } catch (error) {
                console.log('⚠️ Error al marcar como completada:', error.message);

                // Si el error es 409 (ya completada), no lanzar error
                // sino actualizar el estado localmente
                if (error.status === 409 || error.message.includes('ya ha sido completada')) {
                    console.log('🔄 Encuesta ya estaba completada, actualizando estado local...');
                } else {
                    throw error;
                }
            }

            // Actualizar estado local para este asistente específico
            setEncuestas(prevEncuestas =>
                prevEncuestas.map(encuesta => {
                    if (encuesta.id === idEncuesta) {
                        console.log('🔄 Actualizando estado de encuesta ID:', idEncuesta);

                        // Buscar si ya existe una respuesta de este asistente
                        const respuestasExistentes = encuesta.respuestas || [];
                        const respuestaExistenteIndex = respuestasExistentes.findIndex(
                            r => r.id_asistente == userId
                        );

                        const nuevaRespuesta = {
                            estado: 'completada',
                            fecha_completado: new Date().toISOString(),
                            id_encuesta: idEncuesta,
                            id_asistente: userId
                        };

                        let nuevasRespuestas;
                        if (respuestaExistenteIndex >= 0) {
                            // Actualizar respuesta existente
                            nuevasRespuestas = [...respuestasExistentes];
                            nuevasRespuestas[respuestaExistenteIndex] = {
                                ...nuevasRespuestas[respuestaExistenteIndex],
                                ...nuevaRespuesta
                            };
                        } else {
                            // Agregar nueva respuesta
                            nuevasRespuestas = [...respuestasExistentes, nuevaRespuesta];
                        }

                        return {
                            ...encuesta,
                            respuestas: nuevasRespuestas
                        };
                    }
                    return encuesta;
                })
            );

            // Guardar en localStorage específico del usuario
            localStorage.setItem(`encuesta_${idEncuesta}_estado_${userId}`, 'completada');

            return {
                success: true,
                message: 'Estado de encuesta actualizado'
            };

        } catch (error) {
            console.error('❌ Error en marcarComoCompletada:', error);
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
        console.log('🔍 Obteniendo estado para encuesta:', {
            id: encuesta.id,
            tieneRespuestas: !!encuesta.respuestas,
            respuestas: encuesta.respuestas
        });

        // Obtener ID del asistente actual
        const userId = getUserId();
        if (!userId) {
            console.log('❌ No se pudo obtener ID del asistente');
            return { estado: 'no_enviada', texto: 'No enviada' };
        }

        // Verificar localStorage con clave específica del usuario
        const estadoGuardado = localStorage.getItem(`encuesta_${encuesta.id}_estado_${userId}`);

        if (estadoGuardado) {
            console.log('💾 Estado guardado en localStorage:', estadoGuardado);
            return {
                estado: estadoGuardado,
                texto: estadoGuardado === 'completada' ? 'Completada' : 'Pendiente'
            };
        }

        // Si no hay respuestas, devolver "no_enviada"
        if (!encuesta.respuestas || encuesta.respuestas.length === 0) {
            console.log('📝 Sin respuestas, estado: no_enviada');
            return { estado: 'no_enviada', texto: 'No enviada' };
        }

        // Buscar la respuesta específica de este asistente
        const respuestaAsistente = encuesta.respuestas.find(
            respuesta => respuesta.id_asistente == userId
        );

        console.log('👤 Respuesta encontrada para el asistente:', {
            userId,
            respuesta: respuestaAsistente
        });

        if (!respuestaAsistente) {
            console.log('📝 No hay respuesta de este asistente, estado: no_enviada');
            return { estado: 'no_enviada', texto: 'No enviada' };
        }

        if (respuestaAsistente.estado === 'completada') {
            // Guardar en localStorage para persistencia
            localStorage.setItem(`encuesta_${encuesta.id}_estado_${userId}`, 'completada');
            return { estado: 'completada', texto: 'Completada' };
        } else if (respuestaAsistente.estado === 'pendiente') {
            return { estado: 'pendiente', texto: 'Pendiente' };
        }

        // Si no tiene estado definido pero tiene fecha_completado, considerarla completada
        if (respuestaAsistente.fecha_completado) {
            localStorage.setItem(`encuesta_${encuesta.id}_estado_${userId}`, 'completada');
            return { estado: 'completada', texto: 'Completada' };
        }

        console.log('❓ Estado indeterminado, usando pendiente');
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