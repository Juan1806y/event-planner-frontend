import { useState, useCallback } from 'react';
import { adminService } from '../services/adminService';
import { API_PREFIX } from '../config/apiConfig';

export const useEmpresas = () => {
    const [empresas, setEmpresas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const cleanErrorMessage = useCallback((message) => {
        if (!message) return 'Error en el sistema';

        return message
            .replace(/http:\/\/localhost:\d+/g, 'el sistema')
            .replace(/localhost:\d+/g, 'el servidor')
            .replace(/Error de conexión con el servidor/g, 'Error de conexión')
            .replace(/Error al cargar empresas/g, 'Error al cargar la información');
    }, []);

    const fetchEmpresas = useCallback(async (endpoint = 'empresas?incluir_pendientes=true') => {
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('access_token');

            if (!token) {
                setError('No hay sesión activa');
                return;
            }

            const response = await fetch(`${API_PREFIX}/${endpoint}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 401) {
                setError('Sesión expirada. Por favor inicia sesión nuevamente.');
                localStorage.removeItem('access_token');
                localStorage.removeItem('user');
                return;
            }

            if (response.ok) {
                const result = await response.json();

                if (result.success && result.data) {
                    setEmpresas(result.data);
                } else {
                    setEmpresas([]);
                }
            } else {
                const errorData = await response.json();
                const cleanError = cleanErrorMessage(errorData.message || 'Error al cargar empresas');
                setError(cleanError);
            }
        } catch (error) {
            console.error('Error al cargar empresas:', error);
            const cleanError = cleanErrorMessage('Error de conexión con el servidor');
            setError(cleanError);
            setEmpresas([]);
        } finally {
            setLoading(false);
        }
    }, [cleanErrorMessage]);

    const handleAprobarEmpresa = useCallback(async (id, nombre) => {
        // ✅ ELIMINAR el window.confirm - ya tienes tu modal personalizado
        try {
            const result = await adminService.aprobarEmpresaYPromover(id);

            // result.aprobar contiene la respuesta de aprobación; si hubo promoción, queda en result.promote
            if (!result || !result.aprobar) {
                throw new Error('No se pudo aprobar la empresa');
            }

            // Si el backend devolvió error dentro de aprobar, request wrapper lanzará error.
            return true;
        } catch (error) {
            console.error('Error:', error);
            const cleanError = cleanErrorMessage(error.message);
            throw new Error(cleanError);
        }
    }, [cleanErrorMessage]);

    const handleRechazarEmpresa = useCallback(async (id, nombre, motivo) => {
        if (!motivo?.trim()) {
            throw new Error('Debes proporcionar un motivo para el rechazo');
        }

        try {
            const token = localStorage.getItem('access_token');

            const response = await fetch(`${API_PREFIX}/empresas/${id}/aprobar`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    aprobar: false,
                    motivo: motivo
                })
            });

            if (response.ok) {
                return true;
            } else {
                const result = await response.json();
                const cleanError = cleanErrorMessage(result.message || 'Error al rechazar empresa');
                throw new Error(cleanError);
            }
        } catch (error) {
            console.error('Error:', error);
            const cleanError = cleanErrorMessage(error.message);
            throw new Error(cleanError);
        }
    }, [cleanErrorMessage]);

    return {
        empresas,
        loading,
        error,
        fetchEmpresas,
        handleAprobarEmpresa,
        handleRechazarEmpresa
    };
};