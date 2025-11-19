export const formatFecha = (fecha) => {
    if (!fecha) return 'Fecha no definida';
    try {
        // Para evitar problemas de zona horaria, usar UTC
        const fechaObj = new Date(fecha + 'T00:00:00'); // Agregar tiempo para evitar ajuste de zona horaria
        return fechaObj.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'UTC' // Especificar UTC para consistencia
        });
    } catch (e) {
        console.error('Error formateando fecha:', fecha, e);
        return fecha;
    }
};

export const formatHora = (hora) => {
    if (!hora) return '';
    // Asegurar formato HH:MM
    if (hora.includes(':')) {
        return hora.substring(0, 5);
    }
    return hora;
};

export const formatFechaCompleta = (fecha) => {
    if (!fecha) return 'Fecha no definida';
    try {
        const fechaObj = new Date(fecha);
        return fechaObj.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'UTC'
        });
    } catch (e) {
        console.error('Error formateando fecha completa:', fecha, e);
        return fecha;
    }
};

// Función MEJORADA para mostrar rango de fechas
export const formatRangoFechas = (fechaInicio, fechaFin) => {
    if (!fechaInicio || !fechaFin) return 'Fechas no disponibles';

    try {
        const inicio = new Date(fechaInicio + 'T00:00:00');
        const fin = new Date(fechaFin + 'T00:00:00');

        const opciones = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'UTC'
        };

        const fechaInicioStr = inicio.toLocaleDateString('es-ES', opciones);
        const fechaFinStr = fin.toLocaleDateString('es-ES', opciones);

        if (fechaInicio === fechaFin) {
            return fechaInicioStr;
        }

        return `${fechaInicioStr} al ${fechaFinStr}`;
    } catch (e) {
        console.error('Error formateando rango de fechas:', e);
        return `${fechaInicio} al ${fechaFin}`;
    }
};

// Función para debug de fechas
export const debugFecha = (fecha, label = 'Fecha') => {
    if (!fecha) {
        console.log(`🔍 ${label}: null/undefined`);
        return;
    }

    try {
        const fechaObj = new Date(fecha + 'T00:00:00');
        console.log(`🔍 ${label}:`, {
            original: fecha,
            fechaObj: fechaObj,
            local: fechaObj.toLocaleDateString('es-ES'),
            iso: fechaObj.toISOString(),
            utc: fechaObj.toUTCString()
        });
    } catch (e) {
        console.log(`🔍 ${label}: ERROR -`, fecha, e);
    }
};