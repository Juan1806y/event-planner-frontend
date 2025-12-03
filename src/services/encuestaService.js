import { BaseService } from './api/baseService';

class EncuestaService extends BaseService {
    constructor() {
        super();
        this.endpoint = '/api/encuestas';
    }

    // Obtener encuestas por actividad
    async obtenerPorActividad(actividadId) {
        try {
            const response = await this.fetch(`${this.endpoint}?actividad_id=${actividadId}`);
            return response;
        } catch (error) {
            console.error('Error al obtener encuestas por actividad:', error);
            throw error;
        }
    }

    // Marcar encuesta como completada
    async completarEncuesta(idEncuesta, idAsistente) {
        try {
            console.log('🔍 encuestaService.completarEncuesta - Iniciando');
            console.log('🔍 Parámetros:', { idEncuesta, idAsistente });

            // Verifica que los parámetros sean válidos
            if (!idEncuesta || !idAsistente) {
                console.error('❌ Parámetros inválidos:', { idEncuesta, idAsistente });
                throw new Error('id_encuesta e id_asistente son requeridos');
            }

            const endpoint = `${this.endpoint}/completar`;
            console.log('🔍 Endpoint completo:', `${this.baseURL}${endpoint}`);

            const body = JSON.stringify({
                id_encuesta: idEncuesta,
                id_asistente: idAsistente
            });
            console.log('🔍 Body a enviar:', body);

            const response = await this.fetch(endpoint, {
                method: 'POST',
                body: body
            });

            console.log('✅ encuestaService.completarEncuesta - Éxito:', response);
            return response;
        } catch (error) {
            console.error('❌ encuestaService.completarEncuesta - Error completo:', {
                message: error.message,
                status: error.status,
                stack: error.stack
            });
            throw error;
        }
    }

    // Obtener encuesta por ID
    async obtenerPorId(encuestaId) {
        try {
            const response = await this.fetch(`${this.endpoint}/${encuestaId}`);
            return response;
        } catch (error) {
            console.error('Error al obtener encuesta por ID:', error);
            throw error;
        }
    }
}

export default new EncuestaService();