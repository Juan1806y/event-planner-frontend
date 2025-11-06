import React, { useState, useEffect } from 'react';
import styles from './asistentePanel.module.css';
import Sidebar from './sidebar';
import Header from '../../layouts/Header/header';
import Calendar from '../../assets/calendar.png';
import Cupos from '../../assets/cupos.png';
import Edificio from '../../assets/edificio.png';
import Lugar from '../../assets/lugar.png';
import Codigo from '../../assets/codigo.png';
import Footer from '../../layouts/FooterAsistente/footer';

const Asistente = () => {
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

			const response = await fetch('http://localhost:3000/api/inscripciones/eventos-disponibles', {
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
						estado: 1
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

			const response = await fetch('http://localhost:3000/api/inscripciones/mis-inscripciones', {
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
				setSnackbar({
					open: true,
					message: `${inscripcionesConAsistencias.length} inscripciones cargadas`,
					severity: 'success'
				});
			} else {
				setMisInscripciones([]);
			}

		} catch (error) {
			setSnackbar({
				open: true,
				message: `Error al cargar inscripciones: ${error.message}`,
				severity: 'error'
			});
			setMisInscripciones([]);
		} finally {
			setLoadingInscripciones(false);
		}
	};

	const handleRegistrarAsistencia = async (inscripcion) => {
		try {
			setRegistrandoAsistencia(true);
			const token = localStorage.getItem('access_token');

			if (!token) {
				throw new Error('No se encontró token de autenticación');
			}
			
			const response = await fetch('http://localhost:3000/api/asistencias/codigo', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					codigo: inscripcion.codigo 
				})
			});

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

			await cargarMisInscripciones();

			setSnackbar({
				open: true,
				message: result.message || 'Asistencia registrada exitosamente',
				severity: 'success'
			});

		} catch (error) {
			setSnackbar({
				open: true,
				message: error.message,
				severity: 'error'
			});
		} finally {
			setRegistrandoAsistencia(false);
		}
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
		const user = JSON.parse(localStorage.getItem('user') || '{}');
		setFormData({
			nombre: user.nombre || user.username || '',
			email: user.email || user.correo || '',
			telefono: user.telefono || '',
			institucion: user.institucion || ''
		});
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

			const response = await fetch('http://localhost:3000/api/inscripciones', {
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
			await cargarEventosDisponibles();

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
		return hora;
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
		const hoy = new Date().toISOString().split('T')[0];
		return inscripcion.asistencias?.some(asistencia =>
			asistencia.fecha === hoy && asistencia.estado === 'Presente'
		);
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
			</div>
		);
	}

	return (
		<div className={styles.asistenteContainer}>
			<Header />
			<Sidebar />
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
							{eventosFiltrados.map((evento) => {
								const estado = getEstadoEvento(evento);

								return (
									<div className={styles.eventCard} key={evento.id}>
										<div className={styles.eventHeader}>
											<h3 className={styles.eventTitle}>{evento.titulo || evento.nombre}</h3>
											<span className={`${styles.eventStatus} ${estado.clase}`}>
												{estado.texto}
											</span>
										</div>

										<p className={styles.eventDescription}>
											{evento.descripcion || 'Sin descripción disponible'}
										</p>

										<div className={styles.eventDetails}>
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
												<span className={styles.detailIcon}>
													<img src={Cupos} alt="Cupos" className={styles.iconImage} />
												</span>
												<span>
													{evento.cupos_disponibles !== undefined ? evento.cupos_disponibles : 'N/A'} /
													{evento.cupo_total !== undefined ? evento.cupo_total : 'N/A'} cupos disponibles
												</span>
											</div>

											{evento.empresa && (
												<div className={styles.detailItem}>
													<span className={styles.detailIcon}>
														<img src={Edificio} alt="Empresa" className={styles.iconImage} />
													</span>
													<span>{evento.empresa}</span>
												</div>
											)}

											{evento.modalidad && (
												<span className={styles.eventCategory}>
													{evento.modalidad}
												</span>
											)}
										</div>

										<button
											className={`${styles.btnInscribirse} ${estado.texto !== 'DISPONIBLE' ? styles.btnDisabled : ''}`}
											onClick={() => handleInscribirse(evento)}
											disabled={estado.texto !== 'DISPONIBLE'}
										>
											{estado.texto === 'DISPONIBLE' ? 'Inscribirse' : estado.texto}
										</button>
									</div>
								);
							})}
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
											{puedeRegistrar && (
												<button
													className={styles.btnRegistrarAsistencia}
													onClick={() => handleRegistrarAsistencia(inscripcion)}
													disabled={registrandoAsistencia}
												>
													{registrandoAsistencia ? 'Registrando...' : ' Registrar Asistencia'}
												</button>
											)}
											{yaRegistroHoy && (
												<span className={styles.asistenciaRegistrada}>
													Asistencia registrada hoy
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
							<h2>Confirmar Inscripción</h2>
							<button
								className={styles.closeButton}
								onClick={() => setDialogOpen(false)}
								disabled={inscribiendo}
							>
								×
							</button>
						</div>

						<div className={styles.modalBody}>
							<div className={styles.eventInfo}>
								<h3>{selectedEvento.titulo}</h3>
								<p><strong>Fecha:</strong> {formatFecha(selectedEvento.fecha_inicio)}</p>
								<p><strong>Modalidad:</strong> {getModalidadTexto(selectedEvento)}</p>
								<p><strong>Lugar:</strong> {getLugarTexto(selectedEvento)}</p>
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