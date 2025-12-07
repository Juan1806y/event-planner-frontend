import React, { useState, useEffect } from 'react';
import styles from './asistentePanel.module.css';
import Sidebar from './sidebar'
import Header from '../../layouts/Header/header';
import Calendar from '../../assets/calendar.png';
import Cupos from '../../assets/cupos.png';
import Edificio from '../../assets/edificio.png';
import Lugar from '../../assets/lugar.png';
import Codigo from '../../assets/codigo.png';
import Footer from '../../layouts/FooterAsistente/footer';

import Footer from '../../layouts/FooterAsistente/footer';

const Asistente = () => {
	const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

	const [eventos, setEventos] = useState([]);
	const [eventosFiltrados, setEventosFiltrados] = useState([]);
	const [misInscripciones, setMisInscripciones] = useState([]);
	const [loading, setLoading] = useState(true);
	const [loadingInscripciones, setLoadingInscripciones] = useState(false);
	const [selectedEvento, setSelectedEvento] = useState(null);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
	const [filtroCategoria, setFiltroCategoria] = useState('');
	const [categorias, setCategorias] = useState([]);
	const [inscribiendo, setInscribiendo] = useState(false);
	const [registrandoAsistencia, setRegistrandoAsistencia] = useState(false);
	const [vistaActual, setVistaActual] = useState('eventos');
	const [formData, setFormData] = useState({
		nombre: '',
		email: '',
		telefono: '',
		institucion: ''
	});
	const [eventosInscritos, setEventosInscritos] = useState(new Set());
	const [modalType, setModalType] = useState('details');
	const [asistenciasRegistradas, setAsistenciasRegistradas] = useState(new Set());
	const [inscripcionRegistrando, setInscripcionRegistrando] = useState(null);
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

	useEffect(() => {
		const token = localStorage.getItem('access_token');
		if (!token) {
			setSnackbar({
				open: true,
				message: 'Sesión no válida. Redirigiendo al login...',
				severity: 'error'
			});
			setLoading(false);
			setTimeout(() => {
				window.location.href = '/login';
			}, 2000);
			return;
		}
		cargarEventosDisponibles();
		cargarMisInscripciones();
	}, []);

	const cargarEventosDisponibles = async () => {
		try {
			const token = localStorage.getItem('access_token');
			if (!token) {
				setSnackbar({
					open: true,
					message: 'No se encontró token de autenticación. Por favor, inicia sesión.',
					severity: 'error'
				});
				setLoading(false);
				return;
			}

			const response = await fetch(`${API_URL}/inscripciones/eventos-disponibles`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json'
				}
			});

			if (!response.ok) {
				throw new Error(`Error ${response.status}: ${response.statusText}`);
			}

			const result = await response.json();

			if (result.success && result.data) {
				const eventosData = result.data.map(evento => {
					const cupoTotal = evento.cupo_total || evento.cupos || 0;
					const inscritos = evento.inscritos || 0;
					const cuposDisponibles = Math.max(0, cupoTotal - inscritos);

					let lugar = evento.lugar;
					if (!lugar && evento.actividades && evento.actividades[0] && evento.actividades[0].lugares) {
						lugar = evento.actividades[0].lugares[0]?.nombre;
					}

					return {
						id: evento.id,
						titulo: evento.titulo,
						descripcion: evento.descripcion || 'Sin descripción disponible',
						modalidad: evento.modalidad,
						hora: evento.hora,
						fecha_inicio: evento.fecha_inicio,
						fecha_fin: evento.fecha_fin,
						lugar: lugar,
						cupo_total: cupoTotal,
						cupos_disponibles: cuposDisponibles,
						estado_evento: cuposDisponibles > 0 ? 'Disponible' : 'Lleno',
						empresa: evento.empresa,
						estado: 1,
						actividades: evento.actividades || [],
						creador: evento.creador || {},
						fecha_creacion: evento.fecha_creacion,
						fecha_actualizacion: evento.fecha_actualizacion
					};
				});

				setEventos(eventosData);
				setEventosFiltrados(eventosData);

				const cats = [...new Set(eventosData.map(evento => evento.modalidad))].filter(Boolean);
				setCategorias(cats);

			} else {
				throw new Error(result.message || 'Respuesta del servidor en formato inesperado');
			}

		} catch (error) {
			setSnackbar({
				open: true,
				message: `Error al cargar eventos: ${error.message}`,
				severity: 'error'
			});
			setEventos([]);
			setEventosFiltrados([]);
		} finally {
			setLoading(false);
		}
	};

	const cargarMisInscripciones = async () => {
		try {
			setLoadingInscripciones(true);
			const token = localStorage.getItem('access_token');

			if (!token) {
				throw new Error('No se encontró token de autenticación');
			}

			const response = await fetch(`${API_URL}/inscripciones/mis-inscripciones`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json'
				}
			});

			if (!response.ok) {
				throw new Error(`Error ${response.status}: ${response.statusText}`);
			}

			const result = await response.json();

			if (result.success && result.data) {
				const inscripcionesConAsistencias = result.data.map(inscripcion => {
					return {
						...inscripcion,
					};
				});

				setMisInscripciones(inscripcionesConAsistencias);

				const eventosInscritosIds = new Set(inscripcionesConAsistencias.map(insc => insc.evento?.id).filter(Boolean));
				setEventosInscritos(eventosInscritosIds);

				// Actualizar asistencias registradas
				const nuevasAsistencias = new Set();
				inscripcionesConAsistencias.forEach(inscripcion => {
					if (inscripcion.asistencias && Array.isArray(inscripcion.asistencias)) {
						const hoy = new Date().toISOString().split('T')[0];
						const asistenciaHoy = inscripcion.asistencias.some(asistencia =>
							asistencia.fecha === hoy && asistencia.estado === 'Presente'
						);
						if (asistenciaHoy) {
							nuevasAsistencias.add(inscripcion.id);
						}
					}
				});
				setAsistenciasRegistradas(nuevasAsistencias);

				setSnackbar({
					open: true,
					message: `${inscripcionesConAsistencias.length} inscripciones cargadas`,
					severity: 'success'
				});
			} else {
				setMisInscripciones([]);
				setEventosInscritos(new Set());
				setAsistenciasRegistradas(new Set());
			}

		} catch (error) {
			setSnackbar({
				open: true,
				message: `Error al cargar inscripciones: ${error.message}`,
				severity: 'error'
			});
			setMisInscripciones([]);
			setEventosInscritos(new Set());
			setAsistenciasRegistradas(new Set());
		} finally {
			setLoadingInscripciones(false);
		}
	};

	const handleRegistrarAsistencia = async (inscripcion) => {
		try {
			setRegistrandoAsistencia(true);
			setInscripcionRegistrando(inscripcion.id);
			const token = localStorage.getItem('access_token');

			if (!token) {
				throw new Error('No se encontró token de autenticación');
			}

			let response;
			try {
				response = await fetch(`${API_URL}/asistencias/codigo`, {
					method: 'POST',
					headers: {
						'Authorization': `Bearer ${token}`,
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						codigo: inscripcion.codigo
					})
				});
			} catch (networkError) {
				// Error de red (servidor no disponible)
				throw new Error('No se pudo conectar con el servidor.');
			}

			// Si llegamos aquí, la conexión fue exitosa
			const result = await response.json();

			if (!response.ok) {
				if (response.status === 409) {
					throw new Error('Ya has registrado tu asistencia para hoy.');
				} else if (response.status === 400) {
					throw new Error(result.message || 'No puedes registrar asistencia en este momento.');
				} else if (response.status === 403) {
					throw new Error('Este código no te pertenece.');
				} else if (response.status === 404) {
					throw new Error('Código de inscripción no válido.');
				}
				throw new Error(result.message || 'Error al registrar asistencia');
			}

			// Éxito
			setAsistenciasRegistradas(prev => new Set([...prev, inscripcion.id]));

			setSnackbar({
				open: true,
				message: result.message || 'Asistencia registrada exitosamente',
				severity: 'success'
			});

			setTimeout(() => {
				cargarMisInscripciones();
			}, 500);

		} catch (error) {
			setSnackbar({
				open: true,
				message: error.message,
				severity: 'error'
			});
		} finally {
			setRegistrandoAsistencia(false);
			setInscripcionRegistrando(null);
		}
	};

	const handleSidebarToggle = (isCollapsed) => {
		setSidebarCollapsed(isCollapsed);
	};

	const handleMisInscripcionesClick = () => {
		setVistaActual('misInscripciones');
		cargarMisInscripciones();
	};

	const handleEventosDisponiblesClick = () => {
		setVistaActual('eventos');
	};

	const aplicarFiltros = () => {
		let filtered = eventos;
		if (filtroCategoria) {
			filtered = filtered.filter(evento => evento.modalidad === filtroCategoria);
		}
		setEventosFiltrados(filtered);
	};

	useEffect(() => {
		aplicarFiltros();
	}, [filtroCategoria, eventos]);

	const handleInscribirse = (evento) => {
		if (eventosInscritos.has(evento.id)) {
			setSnackbar({
				open: true,
				message: 'Ya estás inscrito en este evento.',
				severity: 'info'
			});
			return;
		}

		const estado = getEstadoEvento(evento);
		if (estado.texto !== 'DISPONIBLE') {
			setSnackbar({
				open: true,
				message: 'No es posible inscribirse en este evento porque está lleno o cerrado.',
				severity: 'warning'
			});
			return;
		}

		setSelectedEvento(evento);
		setModalType('inscription');
		const user = JSON.parse(localStorage.getItem('user') || '{}');
		setFormData({
			nombre: user.nombre || user.username || '',
			email: user.email || user.correo || '',
			telefono: user.telefono || '',
			institucion: user.institucion || ''
		});
		setDialogOpen(true);
	};

	const handleVerDetalles = (evento) => {
		setSelectedEvento(evento);
		setModalType('details');
		setDialogOpen(true);
	};

	const validarFormulario = () => {
		if (!formData.nombre || !formData.email) {
			setSnackbar({
				open: true,
				message: 'Por favor complete todos los campos obligatorios (Nombre y Email)',
				severity: 'error'
			});
			return false;
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(formData.email)) {
			setSnackbar({
				open: true,
				message: 'Por favor ingrese un email válido',
				severity: 'error'
			});
			return false;
		}

		return true;
	};

	const handleConfirmarInscripcion = async () => {
		if (!validarFormulario()) {
			return;
		}

		setInscribiendo(true);

		try {
			const token = localStorage.getItem('access_token');
			if (!token) {
				throw new Error('No se encontró token de autenticación');
			}

			const estado = getEstadoEvento(selectedEvento);
			if (estado.texto !== 'DISPONIBLE') {
				throw new Error('No es posible inscribirse. El evento está lleno o cerrado.');
			}

			const datosInscripcion = {
				id_evento: selectedEvento.id
			};

			const response = await fetch(`${API_URL}/inscripciones`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(datosInscripcion)
			});

			let result;
			const contentType = response.headers.get('content-type');

			if (contentType && contentType.includes('application/json')) {
				result = await response.json();
			} else {
				const text = await response.text();
				try {
					result = JSON.parse(text);
				} catch (e) {
					throw new Error(`Respuesta del servidor no válida: ${text.substring(0, 200)}`);
				}
			}

			if (!response.ok) {
				if (response.status === 409 || result.message?.includes('duplicada') || result.message?.includes('ya inscrito')) {
					throw new Error('Ya estás inscrito en este evento. No se permite la inscripción duplicada.');
				} else if (response.status === 400 && result.message?.includes('lleno')) {
					throw new Error('No es posible la inscripción porque el evento está lleno.');
				}
				throw new Error(result.message || result.error || 'Error al realizar la inscripción');
			}

			setSnackbar({
				open: true,
				message: result.message || 'Tu inscripción al evento se ha realizado exitosamente. Recibirás un correo de confirmación.',
				severity: 'success'
			});

			setDialogOpen(false);
			setEventosInscritos(prev => new Set([...prev, selectedEvento.id]));
			await cargarEventosDisponibles();
			await cargarMisInscripciones();

		} catch (error) {
			setSnackbar({
				open: true,
				message: error.message,
				severity: 'error'
			});
		} finally {
			setInscribiendo(false);
		}
	};

	const getEstadoEvento = (evento) => {
		if (eventosInscritos.has(evento.id)) {
			return { texto: 'INSCRITO', clase: styles.estadoInscrito };
		}
		if (evento.estado_evento === 'Lleno' || evento.cupos_disponibles <= 0) {
			return { texto: 'LLENO', clase: styles.estadoLleno };
		}
		if (evento.estado !== 1) {
			return { texto: 'CERRADO', clase: styles.estadoCerrado };
		}
		return { texto: 'DISPONIBLE', clase: styles.estadoDisponible };
	};

	const formatFecha = (fecha) => {
		if (!fecha) return 'Fecha no definida';
		try {
			return new Date(fecha).toLocaleDateString('es-ES', {
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			});
		} catch (e) {
			return fecha;
		}
	};

	const formatHora = (hora) => {
		if (!hora) return '';
		return hora.substring(0, 5);
	};

	const formatFechaCompleta = (fecha) => {
		if (!fecha) return 'Fecha no definida';
		try {
			return new Date(fecha).toLocaleDateString('es-ES', {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			});
		} catch (e) {
			return fecha;
		}
	};

	const getModalidadTexto = (evento) => {
		return evento.modalidad || 'Presencial';
	};

	const getLugarTexto = (evento) => {
		if (evento.lugar) return evento.lugar;
		if (evento.modalidad === 'virtual' || evento.modalidad === 'Virtual') return 'Virtual';
		return 'Por definir';
	};

	const closeSnackbar = () => {
		setSnackbar({ ...snackbar, open: false });
	};

	const puedeRegistrarAsistencia = (inscripcion) => {
		// Si ya registró asistencia hoy, no puede registrar de nuevo
		if (asistenciasRegistradas.has(inscripcion.id)) {
			return false;
		}

		const hoy = new Date().toISOString().split('T')[0];
		const yaRegistroHoy = inscripcion.asistencias?.some(asistencia =>
			asistencia.fecha === hoy && asistencia.estado === 'Presente'
		);

		const evento = inscripcion.evento;
		if (evento) {
			const fechaInicio = evento.fecha_inicio;
			const fechaFin = evento.fecha_fin;

			if (hoy < fechaInicio || hoy > fechaFin) {
				return false;
			}
		}

		return inscripcion.estado === 'Confirmada' && !yaRegistroHoy;
	};

	const tieneAsistenciaHoy = (inscripcion) => {
		return asistenciasRegistradas.has(inscripcion.id) ||
			inscripcion.asistencias?.some(asistencia => {
				const hoy = new Date().toISOString().split('T')[0];
				return asistencia.fecha === hoy && asistencia.estado === 'Presente';
			});
	};

	const getAsistenciasDelEvento = (inscripcion) => {
		if (!inscripcion.asistencias || !Array.isArray(inscripcion.asistencias)) {
			return [];
		}
		return inscripcion.asistencias;
	};

	if (loading && vistaActual === 'eventos') {
		return (
			<div className={styles.loadingContainer}>
				<div className={styles.spinner}></div>
				<p>Cargando eventos disponibles...</p>
			{/* ...existing code... */}
			<Footer />
		);
	}

	const EventoCard = ({ evento }) => {
		const estado = getEstadoEvento(evento);
		const fechaInicio = formatFecha(evento.fecha_inicio || evento.fecha);
		const hora = formatHora(evento.hora);

		return (
			<div className={styles.eventCard}>
				<div className={styles.eventCardHeader}>
					<div className={styles.eventHeader}>
						<div className={styles.eventTitleSection}>
							<h3 className={styles.eventTitle}>
								{evento.titulo || evento.nombre || 'Evento sin título'}
							</h3>
							<span className={styles.eventCategory}>
								{evento.modalidad || 'Presencial'}
							</span>
						</div>
						<span className={`${styles.eventStatus} ${estado.clase}`}>
							{estado.texto}
						</span>
					</div>
				</div>

				<div className={styles.eventCardContent}>
					{evento.cupos_disponibles !== undefined && (
						<div className={styles.cuposProgress}>
							<div className={styles.progressHeader}>
								<span className={styles.progressLabel}>Cupos disponibles</span>
								<span className={styles.progressPercentage}>
									{evento.cupo_total > 0 ? Math.round((evento.cupos_disponibles / evento.cupo_total) * 100) : 0}%
								</span>
							</div>
							<div className={styles.progressBar}>
								<div
									className={`${styles.progressFill} ${estado.clase}`}
									style={{
										width: `${evento.cupo_total > 0 ? Math.round((evento.cupos_disponibles / evento.cupo_total) * 100) : 0}%`
									}}
								/>
							</div>
							<span className={styles.progressText}>
								{evento.cupos_disponibles} de {evento.cupo_total} cupos disponibles
							</span>
						</div>
					)}

					{evento.descripcion && evento.descripcion !== 'Sin descripción disponible' && (
						<p className={styles.eventDescription}>
							{evento.descripcion}
						</p>
					)}

					<div className={styles.eventDetails}>
						<div className={styles.detailItem}>
							<span className={styles.detailIcon}>
								<img src={Calendar} alt="Fecha" className={styles.iconImage} />
							</span>
							<div className={styles.detailContent}>
								<span className={styles.detailLabel}>Fecha y hora</span>
								<span className={styles.detailValue}>
									{fechaInicio}{hora ? ` - ${hora}` : ''}
								</span>
							</div>
						</div>

						<div className={styles.detailItem}>
							<span className={styles.detailIcon}>
								<img src={Lugar} alt="Ubicación" className={styles.iconImage} />
							</span>
							<div className={styles.detailContent}>
								<span className={styles.detailLabel}>Ubicación</span>
								<span className={styles.detailValue}>{getLugarTexto(evento)}</span>
							</div>
						</div>

						<div className={styles.detailItem}>
							<span className={styles.detailIcon}>
								<img src={Cupos} alt="Cupos" className={styles.iconImage} />
							</span>
							<div className={styles.detailContent}>
								<span className={styles.detailLabel}>Capacidad</span>
								<span className={styles.detailValue}>
									{evento.cupo_total || 'N/A'} cupos totales
								</span>
							</div>
						</div>

						{evento.empresa && (
							<div className={styles.detailItem}>
								<span className={styles.detailIcon}>
									<img src={Edificio} alt="Empresa" className={styles.iconImage} />
								</span>
								<div className={styles.detailContent}>
									<span className={styles.detailLabel}>Organizador</span>
									<span className={styles.detailValue}>{evento.empresa}</span>
								</div>
							</div>
						)}
					</div>

					<div className={styles.eventActions}>
						<button
							className={styles.btnVerDetalles}
							onClick={() => handleVerDetalles(evento)}
						>
							Ver Detalles Completos
						</button>
						<button
							className={`${styles.btnInscribirse} ${estado.texto === 'INSCRITO' ? styles.btnInscrito :
								estado.texto !== 'DISPONIBLE' ? styles.btnDisabled : ''
								}`}
							onClick={() => handleInscribirse(evento)}
							disabled={estado.texto !== 'DISPONIBLE'}
						>
							{estado.texto === 'INSCRITO' ? 'Inscrito' :
								estado.texto === 'DISPONIBLE' ? 'Inscribirse' : estado.texto}
						</button>
					</div>
				</div>
			</div>
		);
	};

	const DetallesCompletosModal = ({ evento }) => {
		return (
			<div className={styles.modalBody}>
				<div className={styles.eventInfoGrid}>
					<div className={styles.infoSection}>
						<h4>Información General</h4>
						<div className={styles.infoItem}>
							<label>Título:</label>
							<span>{evento.titulo}</span>
						</div>
						<div className={styles.infoItem}>
							<label>Descripción:</label>
							<p>{evento.descripcion || 'No disponible'}</p>
						</div>
						<div className={styles.infoItem}>
							<label>Modalidad:</label>
							<span>{evento.modalidad || 'No especificado'}</span>
						</div>
						<div className={styles.infoItem}>
							<label>Estado:</label>
							<span>{evento.estado === 1 ? 'Activo' : 'Inactivo'}</span>
						</div>
					</div>

					<div className={styles.infoSection}>
						<h4>Fechas y Horarios</h4>
						<div className={styles.infoItem}>
							<label>Fecha de inicio:</label>
							<span>{formatFecha(evento.fecha_inicio)}</span>
						</div>
						<div className={styles.infoItem}>
							<label>Fecha de fin:</label>
							<span>{formatFecha(evento.fecha_fin)}</span>
						</div>
						<div className={styles.infoItem}>
							<label>Hora:</label>
							<span>{formatHora(evento.hora) || 'No especificada'}</span>
						</div>
					</div>

					<div className={styles.infoSection}>
						<h4>Ubicación</h4>
						<div className={styles.infoItem}>
							<label>Lugar:</label>
							<span>{getLugarTexto(evento)}</span>
						</div>
					</div>

					<div className={styles.infoSection}>
						<h4>Capacidad y Organización</h4>
						<div className={styles.infoItem}>
							<label>Cupos totales:</label>
							<span>{evento.cupo_total || 'No definido'}</span>
						</div>
						<div className={styles.infoItem}>
							<label>Cupos disponibles:</label>
							<span>{evento.cupos_disponibles || 'N/A'}</span>
						</div>
						<div className={styles.infoItem}>
							<label>Organizador:</label>
							<span>{evento.creador?.nombre || 'No especificado'}</span>
						</div>
						<div className={styles.infoItem}>
							<label>Empresa:</label>
							<span>{evento.empresa?.nombre || evento.empresa || 'No especificado'}</span>
						</div>
					</div>

					{evento.actividades && evento.actividades.length > 0 && (
						<div className={styles.infoSection}>
							<h4>Actividades</h4>
							{evento.actividades.map((actividad, index) => (
								<div key={actividad.id_actividad || index} className={styles.actividadItem}>
									<div className={styles.actividadTitle}>{actividad.titulo}</div>
									<div className={styles.actividadFecha}>
										{formatFecha(actividad.fecha_actividad)}
									</div>
								</div>
							))}
						</div>
					)}

					<div className={styles.infoSection}>
						<h4>Información Adicional</h4>
						<div className={styles.infoItem}>
							<label>Fecha de creación:</label>
							<span>{formatFechaCompleta(evento.fecha_creacion)}</span>
						</div>
						<div className={styles.infoItem}>
							<label>Última actualización:</label>
							<span>{formatFechaCompleta(evento.fecha_actualizacion)}</span>
						</div>
					</div>
				</div>

				<div className={styles.modalActions}>
					<button
						className={styles.btnCancel}
						onClick={() => setDialogOpen(false)}
					>
						Cerrar
					</button>
				</div>
			</div>
		);
	};

	const FormularioInscripcionModal = ({ evento }) => {
		return (
			<div className={styles.modalBody}>
				<div className={styles.eventInfo}>
					<h3>{evento.titulo}</h3>
					<p><strong>Fecha:</strong> {formatFecha(evento.fecha_inicio)}</p>
					<p><strong>Modalidad:</strong> {getModalidadTexto(evento)}</p>
					<p><strong>Lugar:</strong> {getLugarTexto(evento)}</p>
					<p><strong>Cupos disponibles:</strong> {evento.cupos_disponibles} de {evento.cupo_total}</p>
					{evento.descripcion && evento.descripcion !== 'Sin descripción disponible' && (
						<div className={styles.eventDescriptionModal}>
							<strong>Descripción:</strong>
							<p>{evento.descripcion}</p>
						</div>
					)}
				</div>

				<div className={styles.formSection}>
					<h4>Datos de Contacto</h4>
					<div className={styles.formGroup}>
						<label>Nombre completo *</label>
						<input
							type="text"
							value={formData.nombre}
							onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
							className={styles.formInput}
							placeholder="Ingresa tu nombre completo"
							disabled={inscribiendo}
						/>
					</div>

					<div className={styles.formGroup}>
						<label>Email *</label>
						<input
							type="email"
							value={formData.email}
							onChange={(e) => setFormData({ ...formData, email: e.target.value })}
							className={styles.formInput}
							placeholder="Ingresa tu email"
							disabled={inscribiendo}
						/>
					</div>

					<div className={styles.formGroup}>
						<label>Teléfono</label>
						<input
							type="tel"
							value={formData.telefono}
							onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
							className={styles.formInput}
							placeholder="Ingresa tu teléfono"
							disabled={inscribiendo}
						/>
					</div>

					<div className={styles.formGroup}>
						<label>Institución/Organización</label>
						<input
							type="text"
							value={formData.institucion}
							onChange={(e) => setFormData({ ...formData, institucion: e.target.value })}
							className={styles.formInput}
							placeholder="Ingresa tu institución"
							disabled={inscribiendo}
						/>
					</div>
				</div>

				<div className={styles.modalActions}>
					<button
						className={styles.btnCancel}
						onClick={() => setDialogOpen(false)}
						disabled={inscribiendo}
					>
						Cancelar
					</button>
					<button
						className={styles.btnConfirm}
						onClick={handleConfirmarInscripcion}
						disabled={inscribiendo}
					>
						{inscribiendo ? 'Inscribiendo...' : 'Confirmar Inscripción'}
					</button>
				</div>
			</div>
		);
	};

	return (
		<div className={`${styles.asistenteContainer} ${sidebarCollapsed ? styles.sidebarCollapsed : styles.sidebarExpanded}`}>
			<Header />
			<Sidebar onToggle={handleSidebarToggle} />
			<h1 className={styles.pageTitle}>
				{vistaActual === 'eventos'
					? 'Eventos Disponibles para Inscripción'
					: 'Mis Inscripciones'
				}
			</h1>

			<p className={styles.pageSubtitle}>
				{vistaActual === 'eventos'
					? 'Explora los eventos disponibles e inscríbete según tus intereses.'
					: 'Gestiona tus inscripciones y registra tu asistencia a los eventos.'
				}
			</p>

			<div className={styles.filtersCard}>
				<div className={styles.navigationButtons}>
					<button
						className={`${styles.navButton} ${vistaActual === 'eventos' ? styles.navButtonActive : ''}`}
						onClick={handleEventosDisponiblesClick}
					>
						Eventos Disponibles
					</button>
					<button
						className={`${styles.navButton} ${vistaActual === 'misInscripciones' ? styles.navButtonActive : ''}`}
						onClick={handleMisInscripcionesClick}
					>
						Mis Inscripciones
					</button>
				</div>

				{vistaActual === 'eventos' && (
					<div className={styles.filterGroup}>
						<select
							value={filtroCategoria}
							onChange={(e) => setFiltroCategoria(e.target.value)}
							className={styles.filterSelect}
						>
							<option value="">Todas las modalidades</option>
							{categorias.map((categoria) => (
								<option key={categoria} value={categoria}>
									{categoria}
								</option>
							))}
						</select>
					</div>
				)}
			</div>

			{vistaActual === 'eventos' && (
				<>
					{eventosFiltrados.length === 0 ? (
						<div className={styles.noEventsCard}>
							<h3>
								{eventos.length === 0
									? "Actualmente no hay eventos disponibles para inscripción."
									: "No se encontraron eventos con los filtros aplicados."}
							</h3>
							{eventos.length > 0 && filtroCategoria && (
								<button
									className={styles.btnShowAll}
									onClick={() => setFiltroCategoria('')}
								>
									Ver todos los eventos
								</button>
							)}
						</div>
					) : (
						<div className={styles.eventsGrid}>
							{eventosFiltrados.map((evento) => (
								<EventoCard key={evento.id} evento={evento} />
							))}
						</div>
					)}
				</>
			)}

			{vistaActual === 'misInscripciones' && (
				<>
					{loadingInscripciones ? (
						<div className={styles.loadingContainer}>
							<div className={styles.spinner}></div>
							<p>Cargando mis inscripciones...</p>
						</div>
					) : misInscripciones.length === 0 ? (
						<div className={styles.noEventsCard}>
							<h3>No tienes inscripciones activas.</h3>
							<button
								className={styles.btnShowAll}
								onClick={handleEventosDisponiblesClick}
							>
								Ver eventos disponibles
							</button>
						</div>
					) : (
						<div className={styles.inscripcionesGrid}>
							{misInscripciones.map((inscripcion) => {
								const evento = inscripcion.evento;
								const puedeRegistrar = puedeRegistrarAsistencia(inscripcion);
								const yaRegistroHoy = tieneAsistenciaHoy(inscripcion);
								const asistencias = getAsistenciasDelEvento(inscripcion);
								const estaRegistrando = registrandoAsistencia && inscripcionRegistrando === inscripcion.id;

								return (
									<div className={styles.inscripcionCard} key={inscripcion.id}>
										<div className={styles.inscripcionHeader}>
											<h3 className={styles.inscripcionTitle}>
												{evento?.titulo || 'Evento no disponible'}
											</h3>
											<span className={`${styles.inscripcionStatus} ${inscripcion.estado === 'Confirmada'
												? styles.statusConfirmed
												: styles.statusPending
												}`}>
												{inscripcion.estado}
											</span>
										</div>

										{evento && (
											<div className={styles.inscripcionDetails}>
												<div className={styles.detailItem}>
													<span className={styles.detailIcon}>
														<img src={Calendar} alt="Fecha" className={styles.iconImage} />
													</span>
													<span>
														{formatFecha(evento.fecha_inicio || evento.fecha)}
														{evento.hora && ` - ${formatHora(evento.hora)}`}
													</span>
												</div>

												<div className={styles.detailItem}>
													<span className={styles.detailIcon}>
														<img src={Lugar} alt="Ubicación" className={styles.iconImage} />
													</span>
													<span>{getLugarTexto(evento)}</span>
												</div>

												<div className={styles.detailItem}>
													<img src={Codigo} alt="Código" className={styles.iconImage} />
													<span>{inscripcion.codigo}</span>
												</div>

												{asistencias.length > 0 && (
													<div className={styles.asistenciasSection}>
														<h4>Asistencias registradas:</h4>
														{asistencias.map((asistencia) => (
															<div key={asistencia.id} className={styles.asistenciaItem}>
																<span>{asistencia.fecha}</span>
																<span className={`${styles.asistenciaStatus} ${asistencia.estado === 'Presente'
																	? styles.asistenciaPresent
																	: styles.asistenciaAbsent
																	}`}>
																	{asistencia.estado}
																</span>
															</div>
														))}
													</div>
												)}
											</div>
										)}

										<div className={styles.inscripcionActions}>
											{puedeRegistrar && !yaRegistroHoy && (
												<button
													className={`${styles.btnRegistrarAsistencia} ${estaRegistrando ? styles.btnRegistrando : ''
														}`}
													onClick={() => handleRegistrarAsistencia(inscripcion)}
													disabled={registrandoAsistencia}
												>
													{estaRegistrando ? 'Registrando...' : 'Registrar Asistencia'}
												</button>
											)}
											{yaRegistroHoy && (
												<span className={styles.asistenciaRegistrada}>
													✓ Asistencia Registrada
												</span>
											)}
											{!puedeRegistrar && inscripcion.estado === 'Confirmada' && !yaRegistroHoy && (
												<span className={styles.fueraDeFechas}>
													Fuera del rango de fechas del evento
												</span>
											)}
											{!puedeRegistrar && inscripcion.estado !== 'Confirmada' && (
												<span className={styles.inscripcionNotConfirmed}>
													Esperando confirmación
												</span>
											)}
										</div>
									</div>
								);
							})}
						</div>
					)}
				</>
			)}

			{dialogOpen && selectedEvento && (
				<div className={styles.modalOverlay}>
					<div className={styles.modalContent}>
						<div className={styles.modalHeader}>
							<h2>
								{modalType === 'details'
									? 'Detalles Completos del Evento'
									: 'Confirmar Inscripción'
								}
							</h2>
							<button
								className={styles.closeButton}
								onClick={() => setDialogOpen(false)}
								disabled={inscribiendo}
							>
								×
							</button>
						</div>

						{modalType === 'details' ? (
							<DetallesCompletosModal evento={selectedEvento} />
						) : (
							<FormularioInscripcionModal evento={selectedEvento} />
						)}
					</div>
					<Footer />
				</div>
			)}

			{snackbar.open && (
				<div className={`${styles.snackbar} ${styles[snackbar.severity]}`}>
					<span>{snackbar.message}</span>
					<button onClick={closeSnackbar} className={styles.snackbarClose}>
						×
					</button>
				</div>
			)}
		</div>
	);
};

export default Asistente;