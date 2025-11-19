export const safeRender = (value, defaultValue = 'No disponible') => {
    if (value === undefined || value === null) return defaultValue;

    // Si es string, número o booleano, devolverlo
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value ? 'Sí' : 'No';

    // Si es objeto, extraer el valor más útil
    if (typeof value === 'object') {
        // Para objetos de usuario/organizador
        if (value.nombre) return value.nombre;
        if (value.nombre_completo) return value.nombre_completo;
        if (value.correo) return value.correo;
        if (value.email) return value.email;
        if (value.razon_social) return value.razon_social;

        // Para fechas en objetos
        if (value.fecha) return value.fecha;
        if (value.createdAt) return value.createdAt;
        if (value.updatedAt) return value.updatedAt;

        // Si es array, mostrar count
        if (Array.isArray(value)) return `${value.length} elementos`;

        // Si no se puede extraer, mostrar un mensaje genérico
        return `[Objeto]`;
    }

    // Para cualquier otro tipo
    return String(value);
};