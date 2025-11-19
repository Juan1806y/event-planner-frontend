const API_BASE = 'http://localhost:3000/api';

export const attendanceService = {
    async registerAttendance(code, token) {
        const response = await fetch(`${API_BASE}/asistencias/codigo`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ codigo: code })
        });

        if (!response.ok) {
            const result = await response.json();

            if (response.status === 409) {
                throw new Error('Ya has registrado tu asistencia para hoy.');
            } else if (response.status === 400) {
                throw new Error(result.message || 'No puedes registrar asistencia en este momento.');
            } else if (response.status === 403) {
                throw new Error('Este código no te pertenece.');
            } else if (response.status === 404) {
                throw new Error('Código de inscripción no válido.');
            }
            throw new Error(result.message || 'Error al registrar asistencia');
        }

        return await response.json();
    },

    async getMyAttendances(token) {
        const response = await fetch(`${API_BASE}/asistencias/mis-asistencias`, {
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

    formatAttendanceData(asistencia) {
        return {
            id: asistencia.id,
            fecha: asistencia.fecha,
            estado: asistencia.estado,
            hora_registro: asistencia.hora_registro,
            inscripcion: asistencia.inscripcion ? {
                id: asistencia.inscripcion.id,
                codigo: asistencia.inscripcion.codigo,
                evento: asistencia.inscripcion.evento
            } : null
        };
    }
};