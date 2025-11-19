export const getEventStatus = (evento, eventosInscritos) => {
    const hoy = new Date();
    const fechaInicio = new Date(evento.fecha_inicio + 'T00:00:00');
    const fechaFin = new Date(evento.fecha_fin + 'T23:59:59');

    console.log(`📅 Estado evento "${evento.titulo}":`, {
        hoy: hoy.toISOString(),
        fechaInicio: fechaInicio.toISOString(),
        fechaFin: fechaFin.toISOString(),
        yaInscrito: eventosInscritos.has(evento.id),
        cuposDisponibles: evento.cupos_disponibles
    });

    // 1. Verificar si ya está inscrito
    if (eventosInscritos.has(evento.id)) {
        return { texto: 'INSCRITO', clase: 'inscrito' };
    }

    // 2. Verificar cupos
    const cuposDisponibles = evento.cupos_disponibles || 0;
    if (evento.cupo_total && cuposDisponibles <= 0) {
        return { texto: 'CUPOS AGOTADOS', clase: 'agotado' };
    }

    // 3. Verificar fechas
    if (fechaFin < hoy) {
        return { texto: 'FINALIZADO', clase: 'finalizado' };
    }

    if (fechaInicio > hoy) {
        return { texto: 'POR COMENZAR', clase: 'disponible' };
    }

    // 4. Evento en curso y disponible
    return { texto: 'DISPONIBLE', clase: 'disponible' };
};

export const getModalidadTexto = (evento) => {
    return evento.modalidad || 'Presencial';
};

export const getLugarTexto = (evento) => {
    if (evento.lugar) return evento.lugar;
    if (evento.modalidad === 'virtual' || evento.modalidad === 'Virtual') return 'Virtual';
    return 'Por definir';
};

export const validarFormularioInscripcion = (formData) => {
    const errors = {};

    if (!formData.nombre || formData.nombre.trim() === '') {
        errors.nombre = 'El nombre completo es obligatorio';
    }

    if (!formData.email || formData.email.trim() === '') {
        errors.email = 'El email es obligatorio';
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            errors.email = 'Por favor ingrese un email válido';
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

export const calcularPorcentajeCupos = (cuposDisponibles, cupoTotal) => {
    if (cupoTotal === 0) return 0;
    return Math.round((cuposDisponibles / cupoTotal) * 100);
};

export const filtrarEventosPorCategoria = (eventos, categoria) => {
    if (!categoria) return eventos;
    return eventos.filter(evento => evento.modalidad === categoria);
};