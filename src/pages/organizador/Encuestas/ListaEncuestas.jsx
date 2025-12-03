// ListaEncuestas.jsx
import React from 'react';

const ListaEncuestas = ({
    encuestas,
    onVerResultados,
    onEditar,
    onActivar,
    onEliminar,
    onCrearPrimera
}) => {
    if (encuestas.length === 0) {
        return (
            <div className="empty-state">
                <span className="empty-icon">📝</span>
                <h3>No hay encuestas para este evento</h3>
                <p>Crea la primera encuesta para obtener feedback de los asistentes</p>
                <button className="btn-crear-primera" onClick={onCrearPrimera}>
                    Crear Primera Encuesta
                </button>
            </div>
        );
    }

    return (
        <div className="encuestas-lista">
            {encuestas.map(encuesta => (
                <div key={encuesta.id} className="encuesta-card">
                    <div className="encuesta-header-card">
                        <div className="encuesta-info">
                            <h3>{encuesta.titulo}</h3>
                            <div className="encuesta-meta">
                                <span className={`badge badge-${encuesta.estado}`}>
                                    {encuesta.estado === 'activa' ? 'Activa' :
                                        encuesta.estado === 'borrador' ? 'Borrador' : 'Cerrada'}
                                </span>
                                <span className="tipo-badge">
                                    {encuesta.tipo_encuesta === 'pre_actividad' ? 'Pre-Actividad' :
                                        encuesta.tipo_encuesta === 'durante_actividad' ? 'Durante la Actividad' :
                                            encuesta.tipo_encuesta === 'post_actividad' ? 'Post-Actividad' :
                                                encuesta.tipo_encuesta === 'satisfaccion_evento' ? 'Satisfacción de Evento' :
                                                    'General'}
                                </span>

                            </div>
                            <div className="encuesta-detalles">
                                {encuesta.actividad_nombre && (
                                    <span>🎯 Actividad: {encuesta.actividad_nombre}</span>
                                )}
                                <span>
                                    ⏰ {encuesta.momento === 'antes' ? 'Antes' :
                                        encuesta.momento === 'durante' ? 'Durante' : 'Después'} del evento
                                </span>
                            </div>
                        </div>
                        <div className="encuesta-acciones">
                            <div className="estadisticas-mini">
                                <span className="stat-icon">📊</span>
                                <span className="stat-number">{encuesta.respuestas_count || 0}</span>
                                <span className="stat-label">respuestas</span>
                            </div>
                            <button
                                className="btn-icon"
                                onClick={() => onVerResultados(encuesta)}
                                title="Ver Estadísticas"
                            >
                                📊
                            </button>
                            <button
                                className="btn-icon"
                                onClick={() => onEditar(encuesta)}
                                title="Editar"
                            >
                                ✏️
                            </button>
                            {encuesta.estado === 'borrador' && (
                                <button
                                    className="btn-icon btn-activar"
                                    onClick={() => onActivar(encuesta.id)}
                                    title="Activar"
                                >
                                    ▶️
                                </button>
                            )}
                            <button
                                className="btn-icon btn-eliminar"
                                onClick={() => onEliminar(encuesta.id)}
                                title="Eliminar"
                            >
                                🗑️
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ListaEncuestas;