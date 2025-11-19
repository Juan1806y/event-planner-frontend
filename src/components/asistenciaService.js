// File: asistenciaService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

class AsistenciaService {
    /**
     * Obtener todas las asistencias de un evento
     * @param {string} idEvento
     */
    async obtenerAsistenciasEvento(idEvento) {
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('access_token');
            const response = await axios.get(`${API_URL}/asistencias/evento/${idEvento}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Asistencias obtenidas:', response.data);

            // La respuesta ya tiene la estructura correcta en response.data
            return response.data;
        } catch (error) {
            console.error('Error al obtener asistencias:', error);
            throw error;
        }
    }

    /**
     * Obtener todos los eventos
     */
    async obtenerEventos() {
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('access_token');
            const response = await axios.get(`${API_URL}/eventos`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log('Eventos obtenidos:', response.data);
            if (response.data && response.data.data) return response.data.data;
            return response.data;
        } catch (error) {
            console.error('Error al obtener eventos:', error);
            throw error;
        }
    }
}

export default new AsistenciaService();