import { useState, useEffect, useCallback } from 'react';
import { ponenteAgendaService } from '../../../services/ponenteAgendaService';

export const usePonenteAgenda = () => {
    const [agenda, setAgenda] = useState({ actividades: [], eventos: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [estadisticas, setEstadisticas] = useState(null);

    const getToken = () => {
        const token = localStorage.getItem('access_token');
        return token;
    };

    const getPonenteId = () => {
        try {
            const userStr = localStorage.getItem('user');

            if (!userStr) {
                return null;
            }

            const user = JSON.parse(userStr);

            const ponenteId = user?.rolData?.id_ponente || user?.id_ponente;

            if (!ponenteId) {
                return null;
            }

            return ponenteId;
        } catch (error) {
            return null;
        }
    };

    const cargarAgenda = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const token = getToken();
            if (!token) {
                throw new Error('No hay token de autenticación');
            }

            const ponenteId = getPonenteId();
            if (!ponenteId) {
                throw new Error('No se pudo identificar al ponente. El usuario logueado no tiene un ID de ponente válido.');
            }

            const data = await ponenteAgendaService.obtenerAgendaPonente(ponenteId, token);

            setAgenda(data);

            return data;
        } catch (err) {
            setError(err.message);
            setAgenda({ actividades: [], eventos: [] });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarAgenda();
    }, [cargarAgenda]);

    return {
        actividades: agenda.actividades || [],
        eventos: agenda.eventos || [],
        estadisticas,
        loading,
        error,
        cargarAgenda,
        refetch: cargarAgenda
    };
};