// asistenciaService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

class AsistenciaService {
    /**
     * Obtener todas las asistencias de un evento
     * @param {string} idEvento - ID del evento
     * @returns {Promise} Lista de asistencias
     */
    async obtenerAsistenciasEvento(idEvento) {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${API_URL}/asistencias/evento/${idEvento}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error al obtener asistencias:', error);
            throw error;
        }
    }

    /**
     * Registrar asistencia
     * @param {Object} data - Datos de la asistencia
     * @returns {Promise}
     */
    async registrarAsistencia(data) {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_URL}/asistencias`,
                data,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error al registrar asistencia:', error);
            throw error;
        }
    }

    /**
     * Registrar asistencia por código
     * @param {Object} data - Datos con código
     * @returns {Promise}
     */
    async registrarAsistenciaPorCodigo(data) {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_URL}/asistencias/codigo`,
                data,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error al registrar asistencia por código:', error);
            throw error;
        }
    }
}

export default new AsistenciaService();