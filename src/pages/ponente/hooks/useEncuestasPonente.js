import { useState, useCallback } from 'react';

export const useEncuestasPonente = (ponenteIdProp) => {
    const [encuestas, setEncuestas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [enviando, setEnviando] = useState(false);

    const obtenerIdPonente = () => {
        if (ponenteIdProp) {
            return ponenteIdProp;
        }

        try {
            const userData = localStorage.getItem('user');
            if (userData) {
                const user = JSON.parse(userData);

                if (user.rol === 'ponente' && user.rolData?.id_ponente) {
                    return user.rolData.id_ponente;
                }
            }

            const token = localStorage.getItem('access_token');
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    if (payload.id_ponente) {
                        return payload.id_ponente;
                    }
                } catch (e) {
                    return null;
                }
            }

            return null;

        } catch (error) {
            return null;
        }
    };

    const fetchConAuth = async (url, options = {}) => {
        const token = localStorage.getItem('access_token');

        if (!token) {
            throw new Error('No hay token de autenticación disponible');
        }

        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            ...options
        };

        const response = await fetch(url, defaultOptions);

        if (response.status === 401 || response.status === 403) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error ${response.status}: Acceso denegado`);
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error ${response.status}`);
        }

        return await response.json();
    };

    const obtenerEncuestasPorEvento = useCallback(async (eventoId) => {
        if (!eventoId) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const ponenteId = obtenerIdPonente();

            if (!ponenteId) {
                throw new Error('No se pudo identificar al ponente. Por favor, inicia sesión nuevamente.');
            }

            const data = await fetchConAuth(
                `http://localhost:3000/api/encuestas?ponente_id=${ponenteId}&evento_id=${eventoId}`
            );

            const encuestasData = data.data || data.encuestas || [];
            setEncuestas(encuestasData);
            return encuestasData;

        } catch (error) {
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [ponenteIdProp]);

    const obtenerEncuestasPorActividad = useCallback(async (actividadId) => {
        if (!actividadId) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const ponenteId = obtenerIdPonente();

            if (!ponenteId) {
                throw new Error('No se pudo identificar al ponente.');
            }

            const data = await fetchConAuth(
                `http://localhost:3000/api/encuestas?ponente_id=${ponenteId}&actividad_id=${actividadId}`
            );

            const encuestasData = data.data || data.encuestas || [];
            setEncuestas(encuestasData);
            return encuestasData;

        } catch (error) {
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [ponenteIdProp]);

    const obtenerTodasEncuestas = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await fetchConAuth(
                `http://localhost:3000/api/encuestas/ponente`
            );

            const encuestasData = data.data || data.encuestas || [];
            setEncuestas(encuestasData);
            return encuestasData;

        } catch (error) {
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const crearEncuesta = useCallback(async (encuestaData) => {
        setLoading(true);
        setError(null);

        try {
            const data = await fetchConAuth('http://localhost:3000/api/encuestas', {
                method: 'POST',
                body: JSON.stringify(encuestaData)
            });

            if (data.success || data.exito) {
                const nuevaEncuesta = data.data || data.encuesta;
                setEncuestas(prev => [...prev, nuevaEncuesta]);
                return { success: true, data: nuevaEncuesta };
            } else {
                throw new Error(data.message || 'Error al crear encuesta');
            }
        } catch (error) {
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const actualizarEncuesta = useCallback(async (encuestaId, datos) => {
        setLoading(true);
        setError(null);

        try {
            const data = await fetchConAuth(`http://localhost:3000/api/encuestas/${encuestaId}`, {
                method: 'PUT',
                body: JSON.stringify(datos)
            });

            if (data.success || data.exito) {
                const encuestaActualizada = data.data || data.encuesta;
                setEncuestas(prev =>
                    prev.map(encuesta =>
                        encuesta.id === encuestaId
                            ? { ...encuesta, ...encuestaActualizada }
                            : encuesta
                    )
                );
                return { success: true, data: encuestaActualizada };
            } else {
                throw new Error(data.message || 'Error al actualizar encuesta');
            }
        } catch (error) {
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const eliminarEncuesta = useCallback(async (encuestaId) => {
        setLoading(true);
        setError(null);

        try {
            const data = await fetchConAuth(`http://localhost:3000/api/encuestas/${encuestaId}`, {
                method: 'DELETE'
            });

            if (data.success || data.exito) {
                setEncuestas(prev => prev.filter(encuesta => encuesta.id !== encuestaId));
                return { success: true, message: data.message };
            } else {
                throw new Error(data.message || 'Error al eliminar encuesta');
            }
        } catch (error) {
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const enviarEncuestaMasiva = useCallback(async (encuestaId) => {
        setEnviando(true);
        setError(null);

        try {
            const response = await fetchConAuth(`http://localhost:3000/api/encuestas/${encuestaId}/enviar`, {
                method: 'POST'
            });

            return {
                success: response.success || response.exito || false,
                data: response,
                message: response.message || 'Encuesta enviada'
            };

        } catch (error) {
            throw error;
        } finally {
            setEnviando(false);
        }
    }, []);

    const obtenerEstadisticas = useCallback(async (encuestaId) => {
        setLoading(true);
        setError(null);

        try {
            const data = await fetchConAuth(`http://localhost:3000/api/encuestas/${encuestaId}/estadisticas`);

            if (data.success || data.exito) {
                return data.data || data.estadisticas;
            } else {
                throw new Error(data.message || 'Error al obtener estadísticas');
            }
        } catch (error) {
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const verificarEncuestaExistente = useCallback(async (tipo, id, titulo) => {
        try {
            const data = await fetchConAuth(
                `http://localhost:3000/api/encuestas/verificar-existente?tipo=${tipo}&id=${id}&titulo=${encodeURIComponent(titulo)}`
            );

            return { existe: data.existe || false, encuesta: data.encuesta || null };
        } catch (error) {
            return { existe: false, encuesta: null };
        }
    }, []);

    const filtrarPorTipo = useCallback((tipo) => {
        if (tipo === 'todos') return encuestas;
        return encuestas.filter(encuesta => encuesta.tipo_encuesta === tipo);
    }, [encuestas]);

    const filtrarPorEstado = useCallback((estado) => {
        if (estado === 'todos') return encuestas;
        return encuestas.filter(encuesta => encuesta.estado === estado);
    }, [encuestas]);

    const obtenerEstadisticasGenerales = useCallback(() => {
        const total = encuestas.length;
        const borrador = encuestas.filter(e => e.estado === 'borrador').length;
        const activa = encuestas.filter(e => e.estado === 'activa').length;
        const cerrada = encuestas.filter(e => e.estado === 'cerrada').length;

        return {
            total,
            borrador,
            activa,
            cerrada
        };
    }, [encuestas]);

    return {
        encuestas,
        loading,
        error,
        enviando,
        obtenerEncuestasPorEvento,
        obtenerEncuestasPorActividad,
        obtenerTodasEncuestas,
        crearEncuesta,
        actualizarEncuesta,
        eliminarEncuesta,
        enviarEncuestaMasiva,
        obtenerEstadisticas,
        verificarEncuestaExistente,
        filtrarPorTipo,
        filtrarPorEstado,
        obtenerEstadisticasGenerales,
        setEncuestas
    };
};