import React, { useState, useEffect } from 'react';
import './EstadisticasEncuesta.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';


const EstadisticasEncuesta = ({ encuestaId, onCerrar }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [exportando, setExportando] = useState(false);
    const [mostrarMenuExportar, setMostrarMenuExportar] = useState(false);

    const getAuthToken = () => {
        return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    };

    const getHeaders = () => ({
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
    });

    useEffect(() => {
        cargarEstadisticas();
    }, [encuestaId]);

    const cargarEstadisticas = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/encuestas/${encuestaId}/estadisticas`, {
                method: 'GET',
                headers: getHeaders()
            });

            if (!response.ok) {
                throw new Error(`Error al obtener estadísticas: ${response.status}`);
            }

            const result = await response.json();
            setData(result.data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return 'N/A';
        return new Date(fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const obtenerBadgeEstado = (estado) => {
        const badges = {
            'completada': { color: '#22c55e', texto: 'Completada' },
            'pendiente': { color: '#f59e0b', texto: 'Pendiente' },
            'enviada': { color: '#3b82f6', texto: 'Enviada' }
        };
        const badge = badges[estado] || { color: '#6b7280', texto: estado };
        return <span className="badge-estado" style={{ backgroundColor: badge.color }}>{badge.texto}</span>;
    };

    // ==================== FUNCIONES DE EXPORTACIÓN ====================

    const exportarCSV = () => {
        try {
            setExportando(true);
            const { encuesta, estadisticas, respuestas } = data;

            // Encabezados
            const headers = ['ID', 'Asistente', 'Correo', 'Estado', 'Fecha Envío', 'Fecha Completado'];

            // Construir el CSV
            let csvContent = '\uFEFF'; // BOM para UTF-8

            // Información de la encuesta
            csvContent += `Encuesta: ${encuesta.titulo}\n`;
            csvContent += `Tipo: ${encuesta.tipo_encuesta.replace('_', ' ')}\n`;
            csvContent += `Momento: ${encuesta.momento}\n`;
            csvContent += `Estado: ${encuesta.estado}\n`;
            csvContent += `Total Enviadas: ${estadisticas.total_enviadas}\n`;
            csvContent += `Total Completadas: ${estadisticas.total_completadas}\n`;
            csvContent += `Total Pendientes: ${estadisticas.total_pendientes}\n`;
            csvContent += `Tasa de Respuesta: ${estadisticas.tasa_respuesta}\n`;
            csvContent += '\n';

            // Encabezados de la tabla
            csvContent += headers.join(',') + '\n';

            // Datos de respuestas
            respuestas.forEach(respuesta => {
                const row = [
                    respuesta.id,
                    `"${respuesta.asistente.nombre}"`,
                    respuesta.asistente.correo,
                    respuesta.estado,
                    formatearFecha(respuesta.fecha_envio),
                    formatearFecha(respuesta.fecha_completado)
                ];
                csvContent += row.join(',') + '\n';
            });

            // Crear y descargar el archivo
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);

            link.setAttribute('href', url);
            link.setAttribute('download', `estadisticas_${encuesta.titulo.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setMostrarMenuExportar(false);
            alert('✅ CSV exportado correctamente');
        } catch (err) {
            alert('❌ Error al exportar CSV: ' + err.message);
        } finally {
            setExportando(false);
        }
    };

    const exportarExcel = async () => {
        try {
            setExportando(true);
            const { encuesta, estadisticas, respuestas } = data;

            // Importación dinámica de xlsx
            const XLSX = await import('xlsx');

            // Crear libro de trabajo
            const wb = XLSX.utils.book_new();

            // Hoja 1: Información de la encuesta
            const infoData = [
                ['Información de la Encuesta'],
                [''],
                ['Título', encuesta.titulo],
                ['Tipo', encuesta.tipo_encuesta.replace('_', ' ')],
                ['Momento', encuesta.momento],
                ['Estado', encuesta.estado],
                ['Obligatoria', encuesta.obligatoria ? 'Sí' : 'No'],
                ['Fecha Inicio', formatearFecha(encuesta.fecha_inicio)],
                ['Fecha Fin', formatearFecha(encuesta.fecha_fin)],
                [''],
                ['Estadísticas Generales'],
                [''],
                ['Total Enviadas', estadisticas.total_enviadas],
                ['Total Completadas', estadisticas.total_completadas],
                ['Total Pendientes', estadisticas.total_pendientes],
                ['Tasa de Respuesta', estadisticas.tasa_respuesta]
            ];

            if (encuesta.descripcion) {
                infoData.push(['Descripción', encuesta.descripcion]);
            }

            const wsInfo = XLSX.utils.aoa_to_sheet(infoData);
            XLSX.utils.book_append_sheet(wb, wsInfo, 'Información');

            // Hoja 2: Respuestas detalladas
            const respuestasData = [
                ['ID', 'Asistente', 'Correo', 'Estado', 'Fecha Envío', 'Fecha Completado']
            ];

            respuestas.forEach(respuesta => {
                respuestasData.push([
                    respuesta.id,
                    respuesta.asistente.nombre,
                    respuesta.asistente.correo,
                    respuesta.estado,
                    formatearFecha(respuesta.fecha_envio),
                    formatearFecha(respuesta.fecha_completado)
                ]);
            });

            const wsRespuestas = XLSX.utils.aoa_to_sheet(respuestasData);
            XLSX.utils.book_append_sheet(wb, wsRespuestas, 'Respuestas');

            // Descargar el archivo
            XLSX.writeFile(wb, `estadisticas_${encuesta.titulo.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.xlsx`);

            setMostrarMenuExportar(false);
            alert('✅ Excel exportado correctamente');
        } catch (err) {
            alert('❌ Error al exportar Excel: ' + err.message);
        } finally {
            setExportando(false);
        }
    };

    const exportarPDF = async () => {
        try {
            setExportando(true);
            const { encuesta, estadisticas, respuestas } = data;

            // Importación dinámica de jsPDF
            const { jsPDF } = await import('jspdf');
            await import('jspdf-autotable');

            // Crear documento PDF
            const doc = new jsPDF();

            // Título
            doc.setFontSize(18);
            doc.setFont(undefined, 'bold');
            doc.text('Estadísticas de Encuesta', 14, 20);

            // Información de la encuesta
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text('Información General', 14, 35);

            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            let yPos = 45;

            const info = [
                `Título: ${encuesta.titulo}`,
                `Tipo: ${encuesta.tipo_encuesta.replace('_', ' ')}`,
                `Momento: ${encuesta.momento}`,
                `Estado: ${encuesta.estado}`,
                `Obligatoria: ${encuesta.obligatoria ? 'Sí' : 'No'}`,
                `Fecha Inicio: ${formatearFecha(encuesta.fecha_inicio)}`,
                `Fecha Fin: ${formatearFecha(encuesta.fecha_fin)}`
            ];

            info.forEach(line => {
                doc.text(line, 14, yPos);
                yPos += 7;
            });

            if (encuesta.descripcion) {
                doc.text(`Descripción: ${encuesta.descripcion}`, 14, yPos);
                yPos += 7;
            }

            // Estadísticas generales
            yPos += 8;
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text('Estadísticas Generales', 14, yPos);

            yPos += 10;
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');

            const stats = [
                `Total Enviadas: ${estadisticas.total_enviadas}`,
                `Total Completadas: ${estadisticas.total_completadas}`,
                `Total Pendientes: ${estadisticas.total_pendientes}`,
                `Tasa de Respuesta: ${estadisticas.tasa_respuesta}`
            ];

            stats.forEach(stat => {
                doc.text(stat, 14, yPos);
                yPos += 7;
            });

            // Tabla de respuestas
            yPos += 8;
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text('Detalle de Respuestas', 14, yPos);

            const tableData = respuestas.map(respuesta => [
                respuesta.id.toString(),
                respuesta.asistente.nombre,
                respuesta.asistente.correo,
                respuesta.estado,
                formatearFecha(respuesta.fecha_envio),
                formatearFecha(respuesta.fecha_completado)
            ]);

            doc.autoTable({
                startY: yPos + 5,
                head: [['ID', 'Asistente', 'Correo', 'Estado', 'Fecha Envío', 'Fecha Completado']],
                body: tableData,
                styles: { fontSize: 8 },
                headStyles: { fillColor: [102, 126, 234] },
                alternateRowStyles: { fillColor: [245, 247, 250] },
                margin: { top: 10 }
            });

            // Descargar el PDF
            doc.save(`estadisticas_${encuesta.titulo.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.pdf`);

            setMostrarMenuExportar(false);
            alert('✅ PDF exportado correctamente');
        } catch (err) {
            alert('❌ Error al exportar PDF: ' + err.message);
        } finally {
            setExportando(false);
        }
    };

    // ==================== FIN FUNCIONES DE EXPORTACIÓN ====================

    if (loading) {
        return (
            <div className="estadisticas-modal-overlay">
                <div className="estadisticas-modal">
                    <div className="loading">
                        <div className="spinner"></div>
                        <p>Cargando estadísticas...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="estadisticas-modal-overlay">
                <div className="estadisticas-modal">
                    <div className="modal-header">
                        <h2>⚠️ Error</h2>
                        <button onClick={onCerrar} className="btn-cerrar-modal">✕</button>
                    </div>
                    <div className="error-message">
                        <p>{error}</p>
                        <button onClick={onCerrar} className="btn-volver-estadisticas">
                            Volver
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const { encuesta, estadisticas, respuestas } = data;

    return (
        <div className="estadisticas-modal-overlay">
            <div className="estadisticas-modal">
                <div className="modal-header">
                    <h2>📊 Estadísticas Detalladas</h2>
                    <div className="modal-header-actions">

                        <button
                            onClick={onCerrar}
                            className="btn-cerrar-modal"
                            type="button"
                        >
                            ✕
                        </button>
                    </div>
                </div>
                <div className="modal-content">
                    <div className="exportar-dropdown">
                        <button
                            className="btn-exportar-principal"
                            onClick={() => setMostrarMenuExportar(!mostrarMenuExportar)}
                            disabled={exportando}
                        >
                            {exportando ? '⏳ Exportando...' : '📥 Exportar'}
                        </button>

                        {mostrarMenuExportar && (
                            <div className="menu-exportar">
                                <button
                                    className="opcion-exportar"
                                    onClick={exportarCSV}
                                    disabled={exportando}
                                >
                                    📄 Exportar a CSV
                                </button>
                                <button
                                    className="opcion-exportar"
                                    onClick={exportarExcel}
                                    disabled={exportando}
                                >
                                    📊 Exportar a Excel
                                </button>
                                <button
                                    className="opcion-exportar"
                                    onClick={exportarPDF}
                                    disabled={exportando}
                                >
                                    📑 Exportar a PDF
                                </button>
                            </div>
                        )}
                    </div>
                    {/* Información de la encuesta */}
                    <div className="card-estadisticas info-encuesta">
                        <h3>{encuesta.titulo}</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <strong>Tipo:</strong>
                                <span>{encuesta.tipo_encuesta.replace('_', ' ')}</span>
                            </div>
                            <div className="info-item">
                                <strong>Momento:</strong>
                                <span>{encuesta.momento}</span>
                            </div>
                            <div className="info-item">
                                <strong>Estado:</strong>
                                {obtenerBadgeEstado(encuesta.estado)}
                            </div>
                            <div className="info-item">
                                <strong>Obligatoria:</strong>
                                <span>{encuesta.obligatoria ? 'Sí' : 'No'}</span>
                            </div>
                            <div className="info-item">
                                <strong>Fecha inicio:</strong>
                                <span>{formatearFecha(encuesta.fecha_inicio)}</span>
                            </div>
                            <div className="info-item">
                                <strong>Fecha fin:</strong>
                                <span>{formatearFecha(encuesta.fecha_fin)}</span>
                            </div>
                        </div>
                        {encuesta.descripcion && (
                            <div className="descripcion">
                                <strong>Descripción:</strong>
                                <p>{encuesta.descripcion}</p>
                            </div>
                        )}
                        {encuesta.evento && (
                            <div className="evento-info-estadisticas">
                                <strong>Evento:</strong> {encuesta.evento.titulo}
                            </div>
                        )}
                    </div>

                    {/* Estadísticas generales */}
                    <div className="estadisticas-grid-modal">
                        <div className="stat-card-modal">
                            <div className="stat-icon-modal">📊</div>
                            <div className="stat-content-modal">
                                <h3>{estadisticas.total_enviadas}</h3>
                                <p>Total Enviadas</p>
                            </div>
                        </div>
                        <div className="stat-card-modal completadas">
                            <div className="stat-icon-modal">✅</div>
                            <div className="stat-content-modal">
                                <h3>{estadisticas.total_completadas}</h3>
                                <p>Completadas</p>
                            </div>
                        </div>
                        <div className="stat-card-modal pendientes">
                            <div className="stat-icon-modal">⏳</div>
                            <div className="stat-content-modal">
                                <h3>{estadisticas.total_pendientes}</h3>
                                <p>Pendientes</p>
                            </div>
                        </div>
                        <div className="stat-card-modal tasa">
                            <div className="stat-icon-modal">📈</div>
                            <div className="stat-content-modal">
                                <h3>{estadisticas.tasa_respuesta}</h3>
                                <p>Tasa de Respuesta</p>
                            </div>
                        </div>
                    </div>

                    {/* Tabla de respuestas */}
                    <div className="card-estadisticas tabla-respuestas">
                        <h3>Detalle de Respuestas ({respuestas.length})</h3>
                        {respuestas.length === 0 ? (
                            <p className="sin-datos">No hay respuestas registradas</p>
                        ) : (
                            <div className="tabla-container-estadisticas">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Asistente</th>
                                            <th>Correo</th>
                                            <th>Estado</th>
                                            <th>Fecha Envío</th>
                                            <th>Fecha Completado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {respuestas.map((respuesta) => (
                                            <tr key={respuesta.id}>
                                                <td>{respuesta.id}</td>
                                                <td>{respuesta.asistente.nombre}</td>
                                                <td>{respuesta.asistente.correo}</td>
                                                <td>{obtenerBadgeEstado(respuesta.estado)}</td>
                                                <td>{formatearFecha(respuesta.fecha_envio)}</td>
                                                <td>{formatearFecha(respuesta.fecha_completado)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Enlaces a Google Forms */}
                    <div className="card-estadisticas enlaces-forms">
                        <h3>Enlaces</h3>
                        <div className="enlaces-grid-estadisticas">
                            <a
                                href={encuesta.url_google_form}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-link-estadisticas"
                            >
                                📝 Ver Formulario
                            </a>
                            <a
                                href={encuesta.url_respuestas || encuesta.url_google_form}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-link-estadisticas"
                            >
                                📊 Ver Respuestas en Google
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EstadisticasEncuesta;