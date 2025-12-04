import React, { useState, useEffect, useMemo } from 'react';
import styles from '../styles/EstadisticasModal.module.css';
import encuestaService from '../../../../services/encuestaService';

const EstadisticasModal = ({ encuestaId, onClose }) => {
    const [estadisticas, setEstadisticas] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tabActiva, setTabActiva] = useState('general');
    const [filtroRespuestas, setFiltroRespuestas] = useState('todas');
    const [descargando, setDescargando] = useState(false);
    const [mostrarMenuDescarga, setMostrarMenuDescarga] = useState(false);

    useEffect(() => {
        cargarEstadisticas();
    }, [encuestaId]);

    const cargarEstadisticas = async () => {
        try {
            setLoading(true);
            const response = await encuestaService.obtenerEstadisticas(encuestaId);

            if (response.success) {
                setEstadisticas(response.data);
            } else {
                setError(response.message || 'Error al cargar estadísticas');
            }
        } catch (err) {
            setError('Error al cargar estadísticas');
        } finally {
            setLoading(false);
        }
    };

    const respuestasFiltradas = useMemo(() => {
        if (!estadisticas?.respuestas) return [];

        const respuestas = estadisticas.respuestas;

        switch (filtroRespuestas) {
            case 'completadas':
                return respuestas.filter(r => r.estado === 'completada');
            case 'pendientes':
                return respuestas.filter(r => r.estado === 'pendiente');
            case 'todas':
            default:
                return respuestas;
        }
    }, [estadisticas, filtroRespuestas]);

    const descargarReporteExcel = async () => {
        try {
            setDescargando(true);
            setMostrarMenuDescarga(false);

            if (!estadisticas) {
                throw new Error('No hay datos disponibles para generar el reporte');
            }

            const { encuesta, estadisticas: stats } = estadisticas;

            const XLSX = await import('xlsx');

            const wb = XLSX.utils.book_new();

            const infoData = [
                ['REPORTE DE ENCUESTA'],
                [`Encuesta: ${encuesta.titulo}`],
                [''],
                ['INFORMACIÓN DE LA ENCUESTA'],
                ['Campo', 'Valor'],
                ['Título', encuesta.titulo],
                ['Tipo', getTipoTexto(encuesta.tipo_encuesta)],
                ['Estado', encuesta.estado === 'borrador' ? 'Borrador' : encuesta.estado === 'activa' ? 'Activa' : 'Cerrada'],
                ['Obligatoria', encuesta.obligatoria ? 'Sí' : 'No'],
                ['Fecha Creación', formatFecha(encuesta.fecha_creacion)],
                ['Período Vigencia', `${formatFecha(encuesta.fecha_inicio)} - ${formatFecha(encuesta.fecha_fin)}`],
                ['Descripción', encuesta.descripcion || 'Sin descripción'],
                [''],
                ['INFORMACIÓN DEL EVENTO'],
                ['Campo', 'Valor'],
            ];

            if (encuesta.evento) {
                infoData.push(['Evento', encuesta.evento.titulo]);
                infoData.push(['Período', `${formatFecha(encuesta.evento.fecha_inicio)} - ${formatFecha(encuesta.evento.fecha_fin)}`]);
            }

            infoData.push(['']);
            infoData.push(['INFORMACIÓN DE LA ACTIVIDAD']);
            infoData.push(['Campo', 'Valor']);

            if (encuesta.actividad) {
                infoData.push(['Actividad', encuesta.actividad.titulo]);
                infoData.push(['Fecha', formatFecha(encuesta.actividad.fecha_actividad)]);
                infoData.push(['Horario', `${formatHora(encuesta.actividad.hora_inicio)} - ${formatHora(encuesta.actividad.hora_fin)}`]);
            }

            infoData.push(['']);
            infoData.push(['ESTADÍSTICAS']);
            infoData.push(['Campo', 'Valor']);
            infoData.push(['Total Enviadas', stats.total_enviadas]);
            infoData.push(['Total Completadas', stats.total_completadas]);
            infoData.push(['Total Pendientes', stats.total_pendientes]);
            infoData.push(['Tasa de Respuesta', `${stats.tasa_respuesta}%`]);
            infoData.push(['']);
            infoData.push(['Reporte generado el', formatFecha(new Date().toISOString())]);
            infoData.push(['Filtro aplicado', filtroRespuestas === 'todas' ? 'Todas' : filtroRespuestas === 'completadas' ? 'Completadas' : 'Pendientes']);

            const infoSheet = XLSX.utils.aoa_to_sheet(infoData);
            XLSX.utils.book_append_sheet(wb, infoSheet, 'Información');

            if (respuestasFiltradas.length > 0) {
                const respuestasData = [
                    ['Asistente', 'Correo', 'Estado', 'Fecha Envío', 'Fecha Completado']
                ];

                respuestasFiltradas.forEach(respuesta => {
                    respuestasData.push([
                        respuesta.asistente?.nombre || 'N/A',
                        respuesta.asistente?.correo || 'N/A',
                        getTextoEstado(respuesta.estado),
                        respuesta.fecha_envio ? formatFecha(respuesta.fecha_envio) : 'N/A',
                        respuesta.fecha_completado ? formatFecha(respuesta.fecha_completado) : '-'
                    ]);
                });

                const respuestasSheet = XLSX.utils.aoa_to_sheet(respuestasData);
                XLSX.utils.book_append_sheet(wb, respuestasSheet, 'Respuestas');
            }

            const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

            const { saveAs } = await import('file-saver');
            saveAs(blob, `reporte_encuesta_${encuestaId}_${new Date().toISOString().split('T')[0]}.xlsx`);

        } catch (err) {
            alert('Error al generar el reporte en Excel');
        } finally {
            setDescargando(false);
        }
    };

    const descargarReportePDF = async () => {
        try {
            setDescargando(true);
            setMostrarMenuDescarga(false);

            if (!estadisticas) {
                throw new Error('No hay datos disponibles para generar el reporte');
            }

            const { encuesta, estadisticas: stats } = estadisticas;

            const { jsPDF } = await import('jspdf');
            const autoTable = (await import('jspdf-autotable')).default;

            const doc = new jsPDF('portrait', 'mm', 'a4');
            let yPos = 20;
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();

            doc.setFontSize(24);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(44, 95, 124);
            doc.text('Reporte de Estadísticas', pageWidth / 2, yPos, { align: 'center' });

            yPos += 12;
            doc.setFontSize(18);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(31, 41, 55);
            doc.text(encuesta.titulo, pageWidth / 2, yPos, { align: 'center' });

            yPos += 10;
            doc.setFontSize(11);
            doc.setTextColor(107, 114, 128);
            doc.text(`Fecha de generación: ${formatFecha(new Date().toISOString())}`, pageWidth / 2, yPos, { align: 'center' });

            yPos += 20;

            doc.setDrawColor(44, 95, 124);
            doc.setLineWidth(0.5);
            doc.line(20, yPos, pageWidth - 20, yPos);

            yPos += 15;

            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(44, 95, 124);
            doc.text('Estadísticas Principales', 20, yPos);

            yPos += 15;

            const cardWidth = (pageWidth - 60) / 4;
            const cardHeight = 50;

            doc.setFillColor(59, 130, 246);
            doc.roundedRect(15, yPos, cardWidth, cardHeight, 3, 3, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(9);
            doc.text('TOTAL', 15 + cardWidth / 2, yPos + 10, { align: 'center' });
            doc.text('ENVIADAS', 15 + cardWidth / 2, yPos + 16, { align: 'center' });
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.text(stats.total_enviadas.toString(), 15 + cardWidth / 2, yPos + 35, { align: 'center' });

            doc.setFillColor(16, 185, 129);
            doc.roundedRect(15 + cardWidth + 10, yPos, cardWidth, cardHeight, 3, 3, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(9);
            doc.text('COMPLETADAS', 15 + cardWidth + 10 + cardWidth / 2, yPos + 13, { align: 'center' });
            doc.setFontSize(20);
            doc.text(stats.total_completadas.toString(), 15 + cardWidth + 10 + cardWidth / 2, yPos + 35, { align: 'center' });

            doc.setFillColor(245, 158, 11);
            doc.roundedRect(15 + (cardWidth + 10) * 2, yPos, cardWidth, cardHeight, 3, 3, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(9);
            doc.text('PENDIENTES', 15 + (cardWidth + 10) * 2 + cardWidth / 2, yPos + 13, { align: 'center' });
            doc.setFontSize(20);
            doc.text(stats.total_pendientes.toString(), 15 + (cardWidth + 10) * 2 + cardWidth / 2, yPos + 35, { align: 'center' });

            doc.setFillColor(44, 95, 124);
            doc.roundedRect(15 + (cardWidth + 10) * 3, yPos, cardWidth, cardHeight, 3, 3, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(9);
            doc.text('TASA DE', 15 + (cardWidth + 10) * 3 + cardWidth / 2, yPos + 10, { align: 'center' });
            doc.text('RESPUESTA', 15 + (cardWidth + 10) * 3 + cardWidth / 2, yPos + 16, { align: 'center' });
            doc.setFontSize(18);
            doc.text(`${stats.tasa_respuesta}%`, 15 + (cardWidth + 10) * 3 + cardWidth / 2, yPos + 35, { align: 'center' });

            yPos += cardHeight + 25;

            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(44, 95, 124);
            doc.text('Distribución de Respuestas', 20, yPos);

            yPos += 15;

            const total = stats.total_enviadas;
            const completadasPorcentaje = total > 0 ? (stats.total_completadas / total) * 100 : 0;
            const pendientesPorcentaje = total > 0 ? (stats.total_pendientes / total) * 100 : 0;

            const barStartY = yPos;
            const barHeight = 15;
            const maxBarWidth = pageWidth - 100;

            const bar1Width = (completadasPorcentaje / 100) * maxBarWidth;
            doc.setFillColor(16, 185, 129);
            doc.rect(60, barStartY, bar1Width, barHeight, 'F');
            doc.setTextColor(16, 185, 129);
            doc.setFontSize(10);
            doc.text('COMPLETADAS', 20, barStartY + 10);
            doc.setTextColor(0, 0, 0);
            doc.text(`${stats.total_completadas} (${completadasPorcentaje.toFixed(1)}%)`, 65 + bar1Width, barStartY + 10);

            const bar2Width = (pendientesPorcentaje / 100) * maxBarWidth;
            doc.setFillColor(245, 158, 11);
            doc.rect(60, barStartY + 25, bar2Width, barHeight, 'F');
            doc.setTextColor(245, 158, 11);
            doc.text('PENDIENTES', 20, barStartY + 35);
            doc.setTextColor(0, 0, 0);
            doc.text(`${stats.total_pendientes} (${pendientesPorcentaje.toFixed(1)}%)`, 65 + bar2Width, barStartY + 35);

            yPos += 50;

            doc.setDrawColor(59, 130, 246);
            doc.setLineWidth(1);
            doc.line(60, barStartY + 50, 60 + maxBarWidth, barStartY + 50);

            doc.setTextColor(59, 130, 246);
            doc.setFontSize(10);
            doc.text('TOTAL ENVIADAS', 20, barStartY + 55);
            doc.setTextColor(59, 130, 246);
            doc.text(`${stats.total_enviadas} (100%)`, 65 + maxBarWidth, barStartY + 55);

            doc.setFillColor(59, 130, 246);
            doc.rect(60, barStartY + 45, maxBarWidth, barHeight, 'F');
            doc.setTextColor(59, 130, 246);
            doc.setFontSize(10);
            doc.text('TOTAL', 20, barStartY + 55);
            doc.text(`${stats.total_enviadas} (100%)`, 65 + maxBarWidth, barStartY + 55);

            doc.addPage();
            yPos = 20;

            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(44, 95, 124);
            doc.text('Información de la Encuesta', 20, yPos);

            yPos += 15;

            const infoData = [
                ['Campo', 'Valor'],
                ['Título', encuesta.titulo],
                ['Tipo', getTipoTexto(encuesta.tipo_encuesta)],
                ['Estado', encuesta.estado === 'borrador' ? 'Borrador' : encuesta.estado === 'activa' ? 'Activa' : 'Cerrada'],
                ['Obligatoria', encuesta.obligatoria ? 'Sí' : 'No'],
                ['Fecha Creación', formatFecha(encuesta.fecha_creacion)],
                ['Período Vigencia', `${formatFecha(encuesta.fecha_inicio)} - ${formatFecha(encuesta.fecha_fin)}`]
            ];

            autoTable(doc, {
                startY: yPos,
                head: [infoData[0]],
                body: infoData.slice(1),
                margin: { left: 20, right: 20 },
                theme: 'grid',
                headStyles: {
                    fillColor: [44, 95, 124],
                    textColor: 255,
                    fontSize: 11,
                    fontStyle: 'bold'
                },
                bodyStyles: {
                    fontSize: 10,
                    cellPadding: 6
                },
                styles: {
                    overflow: 'linebreak',
                    cellWidth: 'wrap'
                },
                columnStyles: {
                    0: { cellWidth: 60, fontStyle: 'bold' },
                    1: { cellWidth: 'auto' }
                },
                didParseCell: function (data) {
                    if (data.section === 'body' && data.column.index === 0) {
                        data.cell.styles.fontStyle = 'bold';
                        data.cell.styles.textColor = [75, 85, 99];
                    }
                }
            });

            yPos = doc.lastAutoTable.finalY + 15;

            if (encuesta.descripcion && encuesta.descripcion.trim() !== '') {
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(44, 95, 124);
                doc.text('Descripción:', 20, yPos);

                yPos += 8;
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(75, 85, 99);

                const descLines = doc.splitTextToSize(encuesta.descripcion, pageWidth - 40);
                descLines.forEach((line, index) => {
                    doc.text(line, 25, yPos + (index * 5));
                });

                yPos += (descLines.length * 5) + 15;
            }

            if (respuestasFiltradas.length > 0) {
                doc.addPage();
                yPos = 20;

                doc.setFontSize(16);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(44, 95, 124);
                doc.text(`Respuestas (${respuestasFiltradas.length})`, pageWidth / 2, yPos, { align: 'center' });

                yPos += 15;

                const respuestasData = [
                    ['Asistente', 'Correo', 'Estado', 'Fecha']
                ];

                respuestasFiltradas.forEach(respuesta => {
                    respuestasData.push([
                        respuesta.asistente?.nombre || 'N/A',
                        respuesta.asistente?.correo || 'N/A',
                        getTextoEstado(respuesta.estado),
                        respuesta.fecha_envio ? formatFecha(respuesta.fecha_envio) : 'N/A'
                    ]);
                });

                autoTable(doc, {
                    startY: yPos,
                    head: [respuestasData[0]],
                    body: respuestasData.slice(1),
                    margin: { left: 20, right: 20 },
                    theme: 'grid',
                    headStyles: {
                        fillColor: [44, 95, 124],
                        textColor: 255,
                        fontSize: 10,
                        fontStyle: 'bold'
                    },
                    bodyStyles: {
                        fontSize: 9,
                        cellPadding: 4
                    },
                    styles: {
                        overflow: 'linebreak',
                        cellWidth: 'wrap'
                    },
                    columnStyles: {
                        0: { cellWidth: 50 },
                        1: { cellWidth: 60 },
                        2: { cellWidth: 35, halign: 'center' },
                        3: { cellWidth: 35 }
                    },
                    didParseCell: function (data) {
                        if (data.section === 'body' && data.column.index === 2) {
                            if (data.cell.raw === 'Completada') {
                                data.cell.styles.textColor = [16, 185, 129];
                                data.cell.styles.fontStyle = 'bold';
                            } else if (data.cell.raw === 'Pendiente') {
                                data.cell.styles.textColor = [245, 158, 11];
                                data.cell.styles.fontStyle = 'bold';
                            }
                        }
                    }
                });
            }

            const totalPages = doc.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);

                doc.setDrawColor(44, 95, 124);
                doc.setLineWidth(0.5);
                doc.line(20, pageHeight - 20, pageWidth - 20, pageHeight - 20);

                doc.setFontSize(8);
                doc.setTextColor(107, 114, 128);
                doc.setFont('helvetica', 'italic');
                doc.text(
                    `Página ${i} de ${totalPages} | Reporte generado el ${formatFecha(new Date().toISOString())}`,
                    pageWidth / 2,
                    pageHeight - 10,
                    { align: 'center' }
                );
            }

            const { saveAs } = await import('file-saver');
            const nombreArchivo = `Reporte_Encuesta_${encuesta.titulo.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
            saveAs(doc.output('blob'), nombreArchivo);

        } catch (err) {
            alert('Error al generar el reporte en PDF');
        } finally {
            setDescargando(false);
        }
    };

    const getColorEstado = (estado) => {
        switch (estado) {
            case 'completada': return '#10B981';
            case 'pendiente': return '#F59E0B';
            default: return '#6B7280';
        }
    };

    const getTextoEstado = (estado) => {
        switch (estado) {
            case 'completada': return 'Completada';
            case 'pendiente': return 'Pendiente';
            default: return estado;
        }
    };

    const getTipoTexto = (tipo) => {
        switch (tipo) {
            case 'pre_actividad': return 'Pre-Actividad';
            case 'durante_actividad': return 'Durante Actividad';
            case 'post_actividad': return 'Post-Actividad';
            default: return tipo;
        }
    };

    const getMomentoTexto = (momento) => {
        switch (momento) {
            case 'antes': return 'Antes';
            case 'durante': return 'Durante';
            case 'despues': return 'Después';
            default: return momento;
        }
    };

    const formatFecha = (fecha) => {
        if (!fecha) return 'No especificada';
        return new Date(fecha).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatHora = (hora) => {
        if (!hora) return '';
        return hora.substring(0, 5);
    };

    if (loading) {
        return (
            <div className={styles.modalOverlay} onClick={onClose}>
                <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                    <div className={styles.loadingContainer}>
                        <div className={styles.spinner}></div>
                        <p>Cargando estadísticas...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !estadisticas) {
        return (
            <div className={styles.modalOverlay} onClick={onClose}>
                <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                    <div className={styles.errorContainer}>
                        <div className={styles.errorIcon}>⚠️</div>
                        <h3>Error</h3>
                        <p>{error || 'No se pudieron cargar las estadísticas'}</p>
                        <button className={styles.btnCerrar} onClick={onClose}>
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const { encuesta, estadisticas: stats } = estadisticas;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>
                        Estadísticas: {encuesta.titulo}
                    </h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        ×
                    </button>
                </div>

                <div className={styles.modalBody}>
                    <div className={styles.tabs}>
                        <button
                            className={`${styles.tab} ${tabActiva === 'general' ? styles.tabActiva : ''}`}
                            onClick={() => setTabActiva('general')}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M3 3V21H21M6 16L9 11L12 14L18 8"
                                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            General
                        </button>
                        <button
                            className={`${styles.tab} ${tabActiva === 'respuestas' ? styles.tabActiva : ''}`}
                            onClick={() => setTabActiva('respuestas')}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
                                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Respuestas ({estadisticas?.respuestas?.length || 0})
                        </button>
                    </div>

                    <div className={styles.tabContent}>
                        {tabActiva === 'general' ? (
                            <div className={styles.generalStats}>
                                <div className={styles.statsGrid}>
                                    <div className={styles.statCard}>
                                        <div className={styles.statNumber}>
                                            {stats.total_enviadas}
                                        </div>
                                        <div className={styles.statLabel}>
                                            Total Enviadas
                                        </div>
                                    </div>

                                    <div className={styles.statCard}>
                                        <div className={styles.statNumber} style={{ color: '#10B981' }}>
                                            {stats.total_completadas}
                                        </div>
                                        <div className={styles.statLabel}>
                                            Completadas
                                        </div>
                                    </div>

                                    <div className={styles.statCard}>
                                        <div className={styles.statNumber} style={{ color: '#F59E0B' }}>
                                            {stats.total_pendientes}
                                        </div>
                                        <div className={styles.statLabel}>
                                            Pendientes
                                        </div>
                                    </div>

                                    <div className={styles.statCard}>
                                        <div className={styles.statNumber} style={{ color: '#2C5F7C' }}>
                                            {stats.tasa_respuesta}
                                        </div>
                                        <div className={styles.statLabel}>
                                            Tasa de Respuesta
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.encuestaInfo}>
                                    <h3 className={styles.infoTitle}>
                                        Información de la Encuesta
                                    </h3>
                                    <div className={styles.infoGrid}>
                                        <div className={styles.infoItem}>
                                            <span className={styles.infoLabel}>Estado:</span>
                                            <span className={`${styles.infoValue} ${styles[encuesta.estado]}`}>
                                                {encuesta.estado === 'borrador' ? 'Borrador' :
                                                    encuesta.estado === 'activa' ? 'Activa' : 'Cerrada'}
                                            </span>
                                        </div>
                                        <div className={styles.infoItem}>
                                            <span className={styles.infoLabel}>Tipo:</span>
                                            <span className={styles.infoValue}>
                                                {getTipoTexto(encuesta.tipo_encuesta)}
                                            </span>
                                        </div>
                                        <div className={styles.infoItem}>
                                            <span className={styles.infoLabel}>Momento:</span>
                                            <span className={styles.infoValue}>
                                                {getMomentoTexto(encuesta.momento)}
                                            </span>
                                        </div>
                                        <div className={styles.infoItem}>
                                            <span className={styles.infoLabel}>Obligatoria:</span>
                                            <span className={styles.infoValue}>
                                                {encuesta.obligatoria ? 'Sí' : 'No'}
                                            </span>
                                        </div>
                                        <div className={styles.infoItem}>
                                            <span className={styles.infoLabel}>Fecha creación:</span>
                                            <span className={styles.infoValue}>
                                                {formatFecha(encuesta.fecha_creacion)}
                                            </span>
                                        </div>
                                        <div className={styles.infoItem}>
                                            <span className={styles.infoLabel}>Período vigencia:</span>
                                            <span className={styles.infoValue}>
                                                {formatFecha(encuesta.fecha_inicio)} - {formatFecha(encuesta.fecha_fin)}
                                            </span>
                                        </div>
                                    </div>

                                    {encuesta.descripcion && (
                                        <div className={styles.descripcionContainer}>
                                            <span className={styles.infoLabel}>Descripción:</span>
                                            <p className={styles.descripcionText}>{encuesta.descripcion}</p>
                                        </div>
                                    )}
                                </div>

                                <div className={styles.eventoInfo}>
                                    <h3 className={styles.infoTitle}>
                                        Información del Evento
                                    </h3>
                                    {encuesta.evento ? (
                                        <div className={styles.infoGrid}>
                                            <div className={styles.infoItem}>
                                                <span className={styles.infoLabel}>Evento:</span>
                                                <span className={styles.infoValue}>
                                                    {encuesta.evento.titulo}
                                                </span>
                                            </div>
                                            <div className={styles.infoItem}>
                                                <span className={styles.infoLabel}>Período del evento:</span>
                                                <span className={styles.infoValue}>
                                                    {formatFecha(encuesta.evento.fecha_inicio)} - {formatFecha(encuesta.evento.fecha_fin)}
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className={styles.sinInformacion}>
                                            <p>No hay información del evento disponible</p>
                                        </div>
                                    )}
                                </div>

                                <div className={styles.actividadInfo}>
                                    <h3 className={styles.infoTitle}>
                                        Información de la Actividad
                                    </h3>
                                    {encuesta.actividad ? (
                                        <div className={styles.infoGrid}>
                                            <div className={styles.infoItem}>
                                                <span className={styles.infoLabel}>Actividad:</span>
                                                <span className={styles.infoValue} style={{ fontWeight: 'bold', color: '#2C5F7C' }}>
                                                    {encuesta.actividad.titulo}
                                                </span>
                                            </div>
                                            <div className={styles.infoItem}>
                                                <span className={styles.infoLabel}>Fecha actividad:</span>
                                                <span className={styles.infoValue}>
                                                    {formatFecha(encuesta.actividad.fecha_actividad)}
                                                </span>
                                            </div>
                                            <div className={styles.infoItem}>
                                                <span className={styles.infoLabel}>Horario:</span>
                                                <span className={styles.infoValue}>
                                                    {encuesta.actividad.hora_inicio ? formatHora(encuesta.actividad.hora_inicio) : 'N/A'} -
                                                    {encuesta.actividad.hora_fin ? formatHora(encuesta.actividad.hora_fin) : 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className={styles.sinInformacion}>
                                            <p>No hay información de actividad disponible</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className={styles.respuestasList}>
                                <div className={styles.respuestasHeader}>
                                    <h3 className={styles.respuestasTitle}>
                                        Lista de Respuestas ({respuestasFiltradas.length})
                                        {filtroRespuestas !== 'todas' && (
                                            <span className={styles.filtroActivo}>
                                                ({filtroRespuestas === 'completadas' ? 'Completadas' : 'Pendientes'})
                                            </span>
                                        )}
                                    </h3>
                                    <div className={styles.respuestasFilters}>
                                        <button
                                            className={`${styles.filterBtn} ${filtroRespuestas === 'todas' ? styles.filterBtnActive : ''}`}
                                            onClick={() => setFiltroRespuestas('todas')}
                                        >
                                            Todas ({estadisticas?.respuestas?.length || 0})
                                        </button>
                                        <button
                                            className={`${styles.filterBtn} ${filtroRespuestas === 'completadas' ? styles.filterBtnActive : ''}`}
                                            onClick={() => setFiltroRespuestas('completadas')}
                                        >
                                            Completadas ({stats.total_completadas})
                                        </button>
                                        <button
                                            className={`${styles.filterBtn} ${filtroRespuestas === 'pendientes' ? styles.filterBtnActive : ''}`}
                                            onClick={() => setFiltroRespuestas('pendientes')}
                                        >
                                            Pendientes ({stats.total_pendientes})
                                        </button>
                                    </div>
                                </div>

                                {respuestasFiltradas.length === 0 ? (
                                    <div className={styles.sinRespuestas}>
                                        <div className={styles.emptyIcon}>
                                            {filtroRespuestas === 'completadas' ? '✅' :
                                                filtroRespuestas === 'pendientes' ? '⏳' : '📭'}
                                        </div>
                                        <p>
                                            {filtroRespuestas === 'todas'
                                                ? 'No hay respuestas registradas'
                                                : filtroRespuestas === 'completadas'
                                                    ? 'No hay respuestas completadas'
                                                    : 'No hay respuestas pendientes'
                                            }
                                        </p>
                                        {filtroRespuestas !== 'todas' && (
                                            <button
                                                className={styles.btnLimpiarFiltro}
                                                onClick={() => setFiltroRespuestas('todas')}
                                            >
                                                Mostrar todas las respuestas
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className={styles.respuestasTable}>
                                        <div className={styles.tableHeader}>
                                            <div className={styles.headerCell}>Asistente</div>
                                            <div className={styles.headerCell}>Correo</div>
                                            <div className={styles.headerCell}>Estado</div>
                                            <div className={styles.headerCell}>Fecha Envío</div>
                                            <div className={styles.headerCell}>Fecha Completado</div>
                                        </div>

                                        <div className={styles.tableBody}>
                                            {respuestasFiltradas.map((respuesta, index) => (
                                                <div key={index} className={styles.tableRow}>
                                                    <div className={styles.tableCell}>
                                                        {respuesta.asistente?.nombre || 'N/A'}
                                                    </div>
                                                    <div className={styles.tableCell}>
                                                        {respuesta.asistente?.correo || 'N/A'}
                                                    </div>
                                                    <div className={styles.tableCell}>
                                                        <span
                                                            className={styles.estadoBadge}
                                                            style={{ backgroundColor: getColorEstado(respuesta.estado) }}
                                                        >
                                                            {getTextoEstado(respuesta.estado)}
                                                        </span>
                                                    </div>
                                                    <div className={styles.tableCell}>
                                                        {respuesta.fecha_envio
                                                            ? new Date(respuesta.fecha_envio).toLocaleDateString()
                                                            : 'N/A'
                                                        }
                                                    </div>
                                                    <div className={styles.tableCell}>
                                                        {respuesta.fecha_completado
                                                            ? new Date(respuesta.fecha_completado).toLocaleDateString()
                                                            : '-'
                                                        }
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.modalFooter}>
                    <div className={styles.descargarContainer}>
                        <button
                            className={styles.btnDescargar}
                            onClick={() => setMostrarMenuDescarga(!mostrarMenuDescarga)}
                            disabled={descargando}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginRight: '8px' }}>
                                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 10L12 15M12 15L7 10M12 15V3"
                                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            {descargando ? 'Generando...' : 'Descargar Reporte'}
                            {descargando && <span className={styles.spinnerSmall}></span>}
                        </button>

                        {mostrarMenuDescarga && (
                            <div className={styles.menuDescarga}>
                                <button
                                    className={styles.menuItemDescarga}
                                    onClick={descargarReportePDF}
                                    disabled={descargando}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginRight: '8px' }}>
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" />
                                        <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" />
                                        <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" />
                                        <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" />
                                        <polyline points="10 9 9 9 8 9" stroke="currentColor" strokeWidth="2" />
                                    </svg>
                                    Descargar PDF
                                </button>
                                <button
                                    className={styles.menuItemDescarga}
                                    onClick={descargarReporteExcel}
                                    disabled={descargando}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginRight: '8px' }}>
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" />
                                        <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" />
                                        <path d="M8 13h8M8 17h8M8 9h1" stroke="currentColor" strokeWidth="2" />
                                    </svg>
                                    Descargar Excel
                                </button>
                            </div>
                        )}
                    </div>

                    <button className={styles.btnCerrar} onClick={onClose} disabled={descargando}>
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EstadisticasModal;