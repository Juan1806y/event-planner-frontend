import { useState, useCallback, useEffect } from 'react';
import notificacionService from '../services/notificacionService';

export const useNotificaciones = () => {
    const [notificaciones, setNotificaciones] = useState([]);
    const [noLeidasCount, setNoLeidasCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filtros, setFiltros] = useState({
        estado: null,
        entidad_tipo: null,
        limit: 50
    });
    const [cargaInicial, setCargaInicial] = useState(true);

    const getToken = () => {
        const accessToken = localStorage.getItem('access_token');
        if (accessToken) {
            return accessToken;
        }
        return null;
    };

    const cargarNotificaciones = useCallback(async (filtrosPersonalizados = null) => {
        try {
            setLoading(true);
            setError(null);

            const token = getToken();

            if (!token) {
                const errorMsg = 'No se encontró token de autenticación. Por favor, inicia sesión.';
                setError(errorMsg);
                throw new Error(errorMsg);
            }

            const filtrosActuales = filtrosPersonalizados || filtros;
            const resultado = await notificacionService.obtenerMisNotificaciones(token, filtrosActuales);

            const notificacionesFormateadas = notificacionService.formatearNotificaciones(resultado.notificaciones || resultado);
            setNotificaciones(notificacionesFormateadas);

            let count = 0;
            if (!filtrosActuales.estado) {
                count = notificacionesFormateadas.filter(n => n.estado === 'no_leida' || n.estado === 'pendiente').length;
            } else if (filtrosActuales.estado === 'no_leida' || filtrosActuales.estado === 'pendiente') {
                count = notificacionesFormateadas.length;
            }
            setNoLeidasCount(count);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [filtros]);

    const marcarComoLeida = async (notificacionId) => {
        try {
            const token = getToken();
            if (!token) {
                throw new Error('No hay token disponible');
            }

            await notificacionService.marcarComoLeida(notificacionId, token);

            setNotificaciones(prev =>
                prev.map(notif =>
                    notif.id === notificacionId
                        ? { ...notif, estado: 'leida', fechaLeida: new Date() }
                        : notif
                )
            );

            setNoLeidasCount(prev => Math.max(0, prev - 1));

        } catch (err) {
            throw err;
        }
    };

    const eliminarNotificacion = async (notificacionId) => {
        try {
            const token = getToken();
            if (!token) {
                throw new Error('No hay token disponible');
            }

            await notificacionService.eliminarNotificacion(notificacionId, token);

            const notificacion = notificaciones.find(n => n.id === notificacionId);
            setNotificaciones(prev => prev.filter(n => n.id !== notificacionId));

            if (notificacion && notificacion.estado === 'no_leida') {
                setNoLeidasCount(prev => Math.max(0, prev - 1));
            }

        } catch (err) {
            throw err;
        }
    };

    const marcarTodasComoLeidas = async () => {
        try {
            const token = getToken();
            if (!token) {
                throw new Error('No hay token disponible');
            }

            const promesas = notificaciones
                .filter(notif => notif.estado === 'no_leida' || notif.estado === 'pendiente')
                .map(notif => notificacionService.marcarComoLeida(notif.id, token));

            await Promise.all(promesas);

            setNotificaciones(prev =>
                prev.map(notif =>
                    (notif.estado === 'no_leida' || notif.estado === 'pendiente')
                        ? { ...notif, estado: 'leida', fechaLeida: new Date() }
                        : notif
                )
            );

            setNoLeidasCount(0);

        } catch (err) {
            throw err;
        }
    };

    const cambiarFiltros = useCallback((nuevosFiltros) => {
        const filtrosActualizados = { ...filtros, ...nuevosFiltros };
        setFiltros(filtrosActualizados);
        cargarNotificaciones(filtrosActualizados);
    }, [filtros, cargarNotificaciones]);

    const limpiarFiltros = useCallback(() => {
        const filtrosLimpios = { estado: null, entidad_tipo: null, limit: 50 };
        setFiltros(filtrosLimpios);
        cargarNotificaciones(filtrosLimpios);
    }, [cargarNotificaciones]);

    useEffect(() => {
        if (cargaInicial) {
            cargarNotificaciones({
                estado: 'no_leida',
                entidad_tipo: null,
                limit: 50
            });
            setCargaInicial(false);
        }
    }, [cargaInicial]);

    return {
        notificaciones,
        noLeidasCount,
        loading,
        error,
        filtros,
        cargarNotificaciones,
        marcarComoLeida,
        eliminarNotificacion,
        marcarTodasComoLeidas,
        cambiarFiltros,
        limpiarFiltros
    };
};