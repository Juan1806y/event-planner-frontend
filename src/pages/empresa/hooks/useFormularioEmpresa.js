import { useState, useCallback } from 'react';
import { empresaAPI } from '../../../services/api/apiEmpresa';

export const useFormularioEmpresa = (empresaOriginal) => {
    const [formData, setFormData] = useState({
        nombreEmpresa: '',
        nit: '',
        direccion: '',
        ciudad: '',
        pais: '',
        telefono: '',
        correo: ''
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const inicializarFormulario = useCallback((datosEmpresa) => {
        setFormData(datosEmpresa);
    }, []);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    }, [errors]); 

    const validateForm = () => {
        const newErrors = {};
        const camposRequeridos = [
            'nombreEmpresa', 'nit', 'direccion', 'ciudad', 'pais', 'telefono', 'correo'
        ];

        camposRequeridos.forEach(campo => {
            if (!formData[campo]?.trim()) {
                newErrors[campo] = `El ${campo.replace(/([A-Z])/g, ' $1').toLowerCase()} es requerido`;
            }
        });

        if (formData.correo && !/\S+@\S+\.\S+/.test(formData.correo)) {
            newErrors.correo = 'El correo electrónico no es válido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const enviarFormulario = async () => {
        if (!validateForm()) {
            throw new Error('Por favor corrige los errores del formulario');
        }

        setIsSubmitting(true);

        try {
            const ciudadResponse = await empresaAPI.obtenerTodasCiudades();
            const ciudadEncontrada = ciudadResponse.data.find(
                (c) => c.nombre.toLowerCase() === formData.ciudad.toLowerCase()
            );

            if (!ciudadEncontrada) {
                throw new Error("La ciudad seleccionada no existe en la base de datos.");
            }

            const datosActualizados = {
                nombre: formData.nombreEmpresa,
                nit: formData.nit,
                direccion: formData.direccion,
                id_ciudad: ciudadEncontrada.id,
                telefono: formData.telefono,
                correo: formData.correo
            };

            const resultado = await empresaAPI.actualizarEmpresa(empresaOriginal.id, datosActualizados);
            return resultado;
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        formData,
        errors,
        isSubmitting,
        handleChange,
        validateForm,
        enviarFormulario,
        inicializarFormulario
    };
};