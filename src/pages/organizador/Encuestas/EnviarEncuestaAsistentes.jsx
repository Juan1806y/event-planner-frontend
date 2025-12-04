// File: EnviarEncuestaAsistentes.jsx
import React, { useState, useEffect } from 'react';
import asistenciaService from '../../../components/asistenciaService';
import encuestaService from '../../../components/encuestaService';
import './EnviarEncuestaAsistentes.css';

const EnviarEncuestaAsistentes = ({ encuesta, eventoId, onCerrar, onEnvioExitoso }) => {
    const [asistentes, setAsistentes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingAsistentes, setLoadingAsistentes] = useState(true);
    const [error, setError] = useState(null);
    const [resultado, setResultado] = useState(null);
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

    // Cargar asistentes al montar el componente
    useEffect(() => {
        cargarAsistentes();
    }, [eventoId]);

    const cargarAsistentes = async () => {
        try {
            setLoadingAsistentes(true);
            setError(null);

            const response = await asistenciaService.obtenerAsistenciasEvento(eventoId);
            console.log(response)

            // Los datos están en response.data.inscripciones
            const inscripciones = response.data?.inscripciones || [];

            // Filtrar solo asistentes confirmados
            const asistentesInscritos = inscripciones.filter(
                inscripcion => inscripcion.estado?.toLowerCase() === 'confirmada'
            );

            setAsistentes(asistentesInscritos);
        } catch (err) {
            setError('Error al cargar los asistentes: ' + (err.message || 'Error desconocido'));
            console.error('Error cargando asistentes:', err);
        } finally {
            setLoadingAsistentes(false);
        }
    };

    const handleEnviarEncuestas = async () => {
        if (asistentes.length === 0) {
            setError('No hay asistentes inscritos para enviar encuestas');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setResultado(null);
            setMostrarConfirmacion(false);

            const response = await encuestaService.enviarEncuestaMasiva(encuesta.id);

            if (response.success) {
                setResultado({
                    tipo: 'success',
                    mensaje: response.message,
                    totalEnviadas: response.data.total_enviadas,
                    asistentes: response.data.asistentes
                });

                // Notificar al componente padre
                if (onEnvioExitoso) {
                    onEnvioExitoso(response.data);
                }

                // Cerrar automáticamente después de 3 segundos
                setTimeout(() => {
                    if (onCerrar) onCerrar();
                }, 3000);
            }
        } catch (err) {
            setError(err.message || 'Error al enviar las encuestas');
            console.error('Error enviando encuestas:', err);
        } finally {
            setLoading(false);
        }
    };

    const confirmarEnvio = () => {
        setMostrarConfirmacion(true);
    };

    const cancelarEnvio = () => {
        setMostrarConfirmacion(false);
    };

    if (loadingAsistentes) {
        return (
            <div className="enviar-encuesta-modal">
                <div className="modal-overlay" onClick={onCerrar}></div>
                <div className="modal-content">
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                        <p>Cargando asistentes...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="enviar-encuesta-modal">
            <div className="modal-overlay" onClick={onCerrar}></div>
            <div className="modal-content">
                <div className="encuesta-card">
                    <div className="card-header">
                        <div>
                            <h2>Enviar Encuesta a Asistentes</h2>
                            <p className="subtitle">{encuesta.titulo}</p>
                        </div>
                        <button className="btn-close-modal" onClick={onCerrar}>✕</button>
                    </div>

                    <div className="card-body">
                        {/* Información de asistentes */}
                        <div className="info-section">
                            <div className="info-item">
                                <span className="info-label">Total de asistentes inscritos:</span>
                                <span className="info-value">{asistentes.length}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Encuesta:</span>
                                <span className="info-value">{encuesta.titulo}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Estado:</span>
                                <span className={`badge badge-${encuesta.estado}`}>
                                    {encuesta.estado}
                                </span>
                            </div>
                        </div>

                        {/* Lista de asistentes */}
                        {asistentes.length > 0 && (
                            <div className="asistentes-preview">
                                <h3>Vista previa de asistentes que recibirán la encuesta</h3>
                                <div className="asistentes-list">
                                    {asistentes.slice(0, 5).map((inscripcion, index) => (
                                        <div key={index} className="asistente-item">
                                            <span className="asistente-nombre">
                                                {inscripcion.asistente?.usuario?.nombre || 'Sin nombre'}
                                            </span>
                                            <span className="asistente-correo">
                                                {inscripcion.asistente?.usuario?.correo || 'Sin correo'}
                                            </span>
                                        </div>
                                    ))}
                                    {asistentes.length > 5 && (
                                        <p className="asistentes-mas">
                                            + {asistentes.length - 5} asistentes más...
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Mensajes de error */}
                        {error && (
                            <div className="alert alert-error">
                                <svg className="alert-icon" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Resultado exitoso */}
                        {resultado && resultado.tipo === 'success' && (
                            <div className="alert alert-success">
                                <svg className="alert-icon" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <div>
                                    <p className="alert-title">{resultado.mensaje}</p>
                                    <p className="alert-subtitle">
                                        Total de encuestas enviadas: <strong>{resultado.totalEnviadas}</strong>
                                    </p>
                                    <p className="alert-subtitle-small">Esta ventana se cerrará automáticamente...</p>
                                </div>
                            </div>
                        )}

                        {/* Modal de confirmación */}
                        {mostrarConfirmacion && (
                            <div className="confirmacion-overlay">
                                <div className="confirmacion-content">
                                    <h3>⚠️ Confirmar envío</h3>
                                    <p>
                                        ¿Estás seguro de enviar la encuesta a <strong>{asistentes.length}</strong> asistentes?
                                    </p>
                                    <p className="confirmacion-descripcion">
                                        Esta acción enviará un correo electrónico personalizado a cada asistente inscrito
                                        con un enlace único para responder la encuesta.
                                    </p>
                                    <div className="confirmacion-actions">
                                        <button
                                            className="btn btn-secondary"
                                            onClick={cancelarEnvio}
                                            disabled={loading}
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            className="btn btn-primary"
                                            onClick={handleEnviarEncuestas}
                                            disabled={loading}
                                        >
                                            {loading ? 'Enviando...' : 'Confirmar envío'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Botón principal */}
                        <div className="actions-section">
                            <button
                                className="btn btn-enviar"
                                onClick={confirmarEnvio}
                                disabled={loading || asistentes.length === 0 || mostrarConfirmacion || resultado}
                            >
                                {loading ? (
                                    <>
                                        <div className="btn-spinner"></div>
                                        <span>Enviando encuestas...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <span>Enviar encuestas</span>
                                    </>
                                )}
                            </button>

                            {asistentes.length === 0 && (
                                <p className="no-asistentes-message">
                                    No hay asistentes inscritos en este evento
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnviarEncuestaAsistentes;