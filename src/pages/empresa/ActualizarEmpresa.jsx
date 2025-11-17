import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GerenteSidebar from '../../layouts/Sidebar/sidebarGerente/GerenteSidebar';
import Header from '../../layouts/Header/header';
import { useDatosEmpresa } from '../../pages/empresa/hooks/useDatosEmpresa';
import { useFormularioEmpresa } from '../../pages/empresa/hooks/useFormularioEmpresa';
import { useRastreadorCambios } from '../../pages/empresa/hooks/useRastreadorCambios';
import { EstadoCargando } from '../../pages/empresa/components/EstadoCargando/EstadoCargando';
import { EstadoError } from '../../pages/empresa/components/EstadoError/EstadoError';
import { FormularioEmpresa } from '../../pages/empresa/components/FormularioEmpresa/FormularioEmpresa';
import { ModalConfirmacion } from '../../pages/empresa/components/Modales/ModalConfirmacion';
import { ModalExito } from '../../pages/empresa/components/Modales/ModalExito';
import '../../pages/empresa/ActualizarEmpresa.css';

const ActualizarEmpresa = () => {
    const navigate = useNavigate();

    const { user, empresaOriginal, isLoading, loadError, cargarEmpresa } = useDatosEmpresa();
    const { formData, errors, isSubmitting, handleChange, enviarFormulario, inicializarFormulario } = useFormularioEmpresa(empresaOriginal);
    const { hasCambiado, hayCambiosPendientes } = useRastreadorCambios(empresaOriginal, formData);

    const [showModalExito, setShowModalExito] = useState(false);
    const [showModalCancelar, setShowModalCancelar] = useState(false);
    const [mensajeModal, setMensajeModal] = useState('');

    useEffect(() => {
        if (empresaOriginal && formData.nombreEmpresa === '') {
            const datosIniciales = {
                nombreEmpresa: empresaOriginal.nombreEmpresa || '',
                nit: empresaOriginal.nit || '',
                direccion: empresaOriginal.direccion || '',
                ciudad: empresaOriginal.ciudad || '',
                pais: empresaOriginal.pais || '',
                telefono: empresaOriginal.telefono || '',
                correo: empresaOriginal.correo || ''
            };
            inicializarFormulario(datosIniciales);
        }
    }, [empresaOriginal, formData.nombreEmpresa, inicializarFormulario]);

    const handleSubmit = async () => {
        try {
            await enviarFormulario();
            setMensajeModal("Solicitud de actualización fue registrada correctamente. Será revisada por el equipo de administración.");
            setShowModalExito(true);
        } catch (error) {
            setMensajeModal("❌ Ocurrió un error al actualizar la empresa");
            setShowModalExito(true);
        }
    };

    const handleCancel = () => {
        if (hayCambiosPendientes()) {
            setShowModalCancelar(true);
        } else {
            navigate('/gerente');
        }
    };

    const handleConfirmarCancelar = () => {
        setShowModalCancelar(false);
        navigate('/gerente');
    };

    const handleCerrarModalExito = () => {
        setShowModalExito(false);
        navigate('/gerente');
    };

    if (isLoading) {
        return <EstadoCargando />;
    }

    if (loadError) {
        return (
            <EstadoError
                error={loadError}
                onReintentar={cargarEmpresa}
                onVolver={() => navigate('/gerente')}
            />
        );
    }

    return (
        <div className="gerente-layout">
            <GerenteSidebar />

            <div className="gerente-content">
                <Header />

                <main className="gerente-main">
                    <FormularioEmpresa
                        formData={formData}
                        errors={errors}
                        isSubmitting={isSubmitting}
                        hasCambiado={hasCambiado}
                        onFieldChange={handleChange}
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                    />
                </main>
            </div>

            <ModalExito
                show={showModalExito}
                mensaje={mensajeModal}
                onClose={handleCerrarModalExito}
            />

            <ModalConfirmacion
                show={showModalCancelar}
                mensaje="¿Está seguro que desea cancelar? Se perderán los cambios no guardados."
                onConfirm={handleConfirmarCancelar}
                onCancel={() => setShowModalCancelar(false)}
            />
        </div>
    );
};

export default ActualizarEmpresa;