const API_BASE = 'http://localhost:3000/api';

export const inscriptionService = {
    async getMyInscriptions(token) {
        const response = await fetch(`${API_BASE}/inscripciones/mis-inscripciones`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        return result.success ? result.data : [];
    },

    async createInscription(eventId, token) {
        const response = await fetch(`${API_BASE}/inscripciones`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id_evento: eventId })
        });

        const contentType = response.headers.get('content-type');
        let result;

        if (contentType && contentType.includes('application/json')) {
            result = await response.json();
        } else {
            const text = await response.text();
            try {
                result = JSON.parse(text);
            } catch (e) {
                throw new Error(`Respuesta del servidor no válida: ${text.substring(0, 200)}`);
            }
        }

        if (!response.ok) {
            if (response.status === 409 || result.message?.includes('duplicada') || result.message?.includes('ya inscrito')) {
                throw new Error('Ya estás inscrito en este evento. No se permite la inscripción duplicada.');
            } else if (response.status === 400 && result.message?.includes('lleno')) {
                throw new Error('No es posible la inscripción porque el evento está lleno.');
            }
            throw new Error(result.message || result.error || 'Error al realizar la inscripción');
        }

        return result;
    },

    formatInscriptionData(inscripcion) {
        return {
            id: inscripcion.id,
            codigo: inscripcion.codigo,
            estado: inscripcion.estado,
            fecha_inscripcion: inscripcion.fecha_inscripcion,
            evento: inscripcion.evento ? {
                id: inscripcion.evento.id,
                titulo: inscripcion.evento.titulo,
                modalidad: inscripcion.evento.modalidad,
                fecha_inicio: inscripcion.evento.fecha_inicio,
                fecha_fin: inscripcion.evento.fecha_fin,
                hora: inscripcion.evento.hora,
                lugar: inscripcion.evento.lugar,
                actividades: inscripcion.evento.actividades || []
            } : null,
            asistencias: inscripcion.asistencias || []
        };
    }
};