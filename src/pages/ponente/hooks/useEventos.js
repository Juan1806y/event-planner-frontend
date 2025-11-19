import { useState, useEffect, useCallback } from 'react';
import { ponenteEventosService } from '../../../services/ponenteEventosService';

export const useEventos = () => {
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getToken = () => {
        return localStorage.getItem('access_token');
    };

    const cargarEventos = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const token = getToken();
            if (!token) {
                throw new Error('No hay token de autenticación');
            }

            const data = await ponenteEventosService.obtenerEventosDisponibles(token);
            console.log('📅 Eventos cargados para ponente:', data);
            setEventos(data);
        } catch (err) {
            console.error('❌ Error cargando eventos:', err);
            setError(err.message);
            setEventos([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarEventos();
    }, [cargarEventos]);

    return {
        eventos,
        loading,
        error,
        refetch: cargarEventos
    };
};