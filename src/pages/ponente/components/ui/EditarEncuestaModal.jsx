import React, { useState, useEffect } from 'react';
import CrearEncuestaModal from './CrearEncuestaModal';

const EditarEncuestaModal = ({
    encuesta,
    onClose,
    onConfirm,
    eventos = [],
    actividades = []
}) => {
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
    const [datosEditados, setDatosEditados] = useState(null);

    // Campos permitidos para edición según la documentación
    const camposEditables = [
        'titulo',
        'tipo_encuesta',
        'momento',
        'url_google_form',
        'url_respuestas',
        'estado',
        'fecha_inicio',
        'fecha_fin',
        'obligatoria',
        'descripcion'
    ];

    // Filtrar solo los campos editables de la encuesta
    const getDatosEditables = () => {
        if (!encuesta) return {};

        const datos = {};
        camposEditables.forEach(campo => {
            if (encuesta[campo] !== undefined) {
                datos[campo] = encuesta[campo];
            }
        });

        // Agregar IDs de evento y actividad si existen
        if (encuesta.id_evento) datos.id_evento = encuesta.id_evento;
        if (encuesta.id_actividad) datos.id_actividad = encuesta.id_actividad;

        return datos;
    };

    // Validar si se pueden editar ciertos campos según el estado
    const getCamposEditablesSegunEstado = () => {
        const camposDisponibles = [...camposEditables];

        if (encuesta?.estado === 'cerrada') {
            // Si está cerrada, algunos campos no se pueden editar
            return camposDisponibles.filter(campo =>
                !['estado', 'fecha_inicio', 'fecha_fin'].includes(campo)
            );
        }

        return camposDisponibles;
    };

    const handleConfirmarEdicion = async (datos) => {
        try {
            // Solo enviar los campos que han cambiado
            const cambios = {};
            Object.keys(datos).forEach(key => {
                if (datos[key] !== encuesta[key]) {
                    cambios[key] = datos[key];
                }
            });

            if (Object.keys(cambios).length === 0) {
                // No hay cambios
                onClose();
                return;
            }

            // Si se intenta cambiar de estado a "cerrada", mostrar confirmación
            if (cambios.estado === 'cerrada' && encuesta.estado !== 'cerrada') {
                setDatosEditados(cambios);
                setMostrarConfirmacion(true);
                return false;
            }

            const resultado = await onConfirm(encuesta.id, cambios);
            if (resultado) {
                onClose();
            }
            return resultado;
        } catch (error) {
            console.error('Error en edición:', error);
            return false;
        }
    };

    const handleConfirmarCierre = async () => {
        try {
            const resultado = await onConfirm(encuesta.id, datosEditados);
            if (resultado) {
                setMostrarConfirmacion(false);
                onClose();
            }
            return resultado;
        } catch (error) {
            console.error('Error al cerrar encuesta:', error);
            setMostrarConfirmacion(false);
            return false;
        }
    };

    const getActividadesFiltradas = () => {
        if (!encuesta.id_evento) return actividades;
        return actividades.filter(act => act.id_evento === encuesta.id_evento);
    };

    if (mostrarConfirmacion) {
        return (
            <div className="modalOverlay" onClick={() => setMostrarConfirmacion(false)}>
                <div className="modalContent" onClick={(e) => e.stopPropagation()}>
                    <div className="modalHeader">
                        <h2 className="modalTitle">Confirmar Cierre de Encuesta</h2>
                        <button
                            className="closeButton"
                            onClick={() => setMostrarConfirmacion(false)}
                        >
                            ×
                        </button>
                    </div>

                    <div className="modalBody">
                        <div className="confirmacionContainer">
                            <h3>¿Estás seguro de cerrar esta encuesta?</h3>
                            <p className="confirmacionTexto">
                                Al cerrar la encuesta:
                            </p>
                            <ul className="listaConfirmacion">
                                <li>No se podrán enviar más invitaciones</li>
                                <li>No se aceptarán nuevas respuestas</li>
                                <li>Los asistentes ya no podrán completar la encuesta</li>
                                <li>Las estadísticas quedarán fijadas</li>
                            </ul>
                            <p className="confirmacionTexto">
                                Esta acción no se puede deshacer.
                            </p>
                        </div>
                    </div>

                    <div className="modalFooter">
                        <button
                            className="btnCancelar"
                            onClick={() => setMostrarConfirmacion(false)}
                        >
                            Cancelar
                        </button>
                        <button
                            className="btnConfirmar"
                            onClick={handleConfirmarCierre}
                        >
                            Sí, Cerrar Encuesta
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <CrearEncuestaModal
            eventoId={encuesta?.id_evento || ''}
            actividadId={encuesta?.id_actividad || ''}
            onClose={onClose}
            onConfirm={handleConfirmarEdicion}
            eventos={eventos}
            actividades={getActividadesFiltradas()}
            encuestaEdit={getDatosEditables()}
        />
    );
};

export default EditarEncuestaModal;