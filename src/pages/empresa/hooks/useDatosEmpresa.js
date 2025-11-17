import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { empresaAPI } from '../../../services/api/apiEmpresa';

export const useDatosEmpresa = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [empresaOriginal, setEmpresaOriginal] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            navigate('/login');
            return;
        }

        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        cargarEmpresa();
    }, [navigate]);

    const cargarEmpresa = async () => {
        try {
            setIsLoading(true);
            setLoadError(null);

            const respuesta = await empresaAPI.obtenerEmpresaGerente();
            console.log('Empresa cargada exitosamente:', respuesta);

            const empresaData = respuesta?.data?.[0];
            if (!empresaData) throw new Error('No se encontraron datos de la empresa.');

            if (empresaData.id_ciudad) {
                const ciudad = await empresaAPI.obtenerCiudadPorId(empresaData.id_ciudad);
                const ciudadData = ciudad?.data;
                const ciudadNombre = ciudadData?.nombre || ciudadData?.nombre_ciudad || '';

                let paisNombre = '';
                if (ciudadData?.id_pais) {
                    const pais = await empresaAPI.obtenerPaisPorId(ciudadData.id_pais);
                    const paisData = pais?.data;
                    paisNombre = paisData?.nombre || paisData?.nombre_pais || '';
                }

                const datosEmpresaCompleta = {
                    ...empresaData,
                    ciudad: ciudadNombre,
                    pais: paisNombre,
                    nombreEmpresa: empresaData.nombre
                };

                setEmpresaOriginal(datosEmpresaCompleta);

                return {
                    nombreEmpresa: empresaData.nombre || '',
                    nit: empresaData.nit || '',
                    direccion: empresaData.direccion || '',
                    ciudad: ciudadNombre || '',
                    pais: paisNombre || '',
                    telefono: empresaData.telefono || '',
                    correo: empresaData.correo || ''
                };
            }
        } catch (error) {
            console.error('Error al cargar empresa:', error);
            setLoadError(error.message || 'No se pudieron cargar los datos de la empresa.');
        } finally {
            setIsLoading(false);
        }
    };

    return {
        user,
        empresaOriginal,
        isLoading,
        loadError,
        cargarEmpresa
    };
};