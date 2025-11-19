import { useState, useCallback } from 'react';
import notificacionService from '../services/notificacionService';

export const useNotificaciones = () => {
    const [notificaciones, setNotificaciones] = useState([]);
    const [noLeidasCount, setNoLeidasCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getToken = () => {
        console.log('🕵️‍♂️ BUSCANDO TOKEN...');

        // Buscar access_token (con guión bajo) que es como se guarda
        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');

        console.log('📁 Tokens encontrados:', {
            access_token: accessToken,
            refresh_token: refreshToken
        });

        // Devolver el access_token
        if (accessToken) {
            console.log('✅ Token encontrado:', accessToken.substring(0, 20) + '...');
            return accessToken;
        }

        console.log('❌ No se encontró access_token');
        return null;
    };

    // Cargar notificaciones
    const cargarNotificaciones = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('🔄 INICIANDO CARGA DE NOTIFICACIONES...');
            const token = getToken();

            if (!token) {
                console.log('❌ NO SE ENCONTRÓ TOKEN');
                const errorMsg = 'No se encontró token de autenticación. Por favor, inicia sesión.';
                setError(errorMsg);
                throw new Error(errorMsg);
            }

            console.log('✅ TOKEN ENCONTRADO, CARGANDO NOTIFICACIONES...');
            const resultado = await notificacionService.obtenerMisNotificaciones(token);

            const notificacionesFormateadas = notificacionService.formatearNotificaciones(resultado.notificaciones);
            setNotificaciones(notificacionesFormateadas);

            // Contar no leídas
            const count = notificacionesFormateadas.filter(n => n.estado === 'no_leida').length;
            setNoLeidasCount(count);

            console.log(`✅ Notificaciones cargadas: ${notificacionesFormateadas.length}, No leídas: ${count}`);

        } catch (err) {
            console.error('❌ Error cargando notificaciones:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Marcar como leída
    const marcarComoLeida = async (notificacionId) => {
        try {
            const token = getToken();
            if (!token) {
                throw new Error('No hay token disponible');
            }

            await notificacionService.marcarComoLeida(notificacionId, token);

            // Actualizar estado local
            setNotificaciones(prev =>
                prev.map(notif =>
                    notif.id === notificacionId
                        ? { ...notif, estado: 'leida', fechaLeida: new Date() }
                        : notif
                )
            );

            setNoLeidasCount(prev => Math.max(0, prev - 1));

        } catch (err) {
            console.error('Error marcando como leída:', err);
            throw err;
        }
    };

    // Eliminar notificación
    const eliminarNotificacion = async (notificacionId) => {
        try {
            const token = getToken();
            if (!token) {
                throw new Error('No hay token disponible');
            }

            await notificacionService.eliminarNotificacion(notificacionId, token);

            // Remover del estado local
            const notificacion = notificaciones.find(n => n.id === notificacionId);
            setNotificaciones(prev => prev.filter(n => n.id !== notificacionId));

            // Actualizar contador si no estaba leída
            if (notificacion && notificacion.estado === 'no_leida') {
                setNoLeidasCount(prev => Math.max(0, prev - 1));
            }

        } catch (err) {
            console.error('Error eliminando notificación:', err);
            throw err;
        }
    };

    // Marcar todas como leídas
    const marcarTodasComoLeidas = async () => {
        try {
            const token = getToken();
            if (!token) {
                throw new Error('No hay token disponible');
            }

            const promesas = notificaciones
                .filter(notif => notif.estado === 'no_leida')
                .map(notif => notificacionService.marcarComoLeida(notif.id, token));

            await Promise.all(promesas);

            // Actualizar estado local
            setNotificaciones(prev =>
                prev.map(notif =>
                    notif.estado === 'no_leida'
                        ? { ...notif, estado: 'leida', fechaLeida: new Date() }
                        : notif
                )
            );

            setNoLeidasCount(0);

        } catch (err) {
            console.error('Error marcando todas como leídas:', err);
            throw err;
        }
    };

    return {
        notificaciones,
        noLeidasCount,
        loading,
        error,
        cargarNotificaciones,
        marcarComoLeida,
        eliminarNotificacion,
        marcarTodasComoLeidas
    };
};