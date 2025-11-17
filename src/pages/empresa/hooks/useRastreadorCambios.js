export const useRastreadorCambios = (empresaOriginal, formData) => {
    const hasCambiado = (campo) => {
        if (!empresaOriginal) return false;
        return formData[campo] !== empresaOriginal[campo];
    };

    const hayCambiosPendientes = () => {
        if (!empresaOriginal) return false;
        return Object.keys(formData).some(key => hasCambiado(key));
    };

    return {
        hasCambiado,
        hayCambiosPendientes
    };
};