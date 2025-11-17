import { useState } from 'react';
import styles from './evento.module.css';

const Evento = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [formData, setFormData] = useState({
        nombreCompleto: '',
        correo: '',
        telefono: '',
        institucion: ''
    });

    const eventos = [
        {
            id: 1,
            nombre: 'Conferencia Anual de Tecnología 2025',
            fecha: '15 de Noviembre, 2025',
            lugar: 'Centro de Convenciones, Bogotá',
            cupos: 250,
            cuposDisponibles: 70,
            tipo: 'Presencial',
            estado: 'Abierto',
            imagen: ''
        },
        {
            id: 2,
            nombre: 'Festival de Música en Vivo - Edición Primavera',
            fecha: '22 de Noviembre, 2025',
            lugar: 'Parque Simón Bolívar, Bogotá',
            cupos: 500,
            tipo: 'Presencial',
            estado: 'Abierto'
        },
        {
            id: 3,
            nombre: 'Reunión Estratégica de Negocios',
            fecha: '28 de Octubre, 2025',
            lugar: 'Hotel Hilton, Medellín',
            cupos: 50,
            tipo: 'Presencial',
            estado: 'En Curso'
        },
        {
            id: 4,
            nombre: 'Taller de Desarrollo de Liderazgo',
            fecha: '05 de Diciembre, 2025',
            lugar: 'Universidad Nacional, Bogotá',
            cupos: 80,
            tipo: 'Presencial',
            estado: 'Abierto'
        },
        {
            id: 5,
            nombre: 'Evento de Networking Empresarial',
            fecha: '12 de Diciembre, 2025',
            lugar: 'Club El Nogal, Bogotá',
            cupos: 120,
            tipo: 'Presencial',
            estado: 'Abierto'
        },
        {
            id: 6,
            nombre: 'Webinar: Tendencias Digitales 2025',
            fecha: '20 de Noviembre, 2025',
            lugar: 'Plataforma Zoom',
            cupos: 300,
            tipo: 'Virtual',
            estado: 'Abierto'
        },
        {
            id: 7,
            nombre: 'Seminario de Marketing Digital',
            fecha: '10 de Octubre, 2025',
            lugar: 'Auditorio Central, Cali',
            cupos: 150,
            tipo: 'Presencial',
            estado: 'Finalizado'
        }
    ];

    const handleEventClick = (evento) => {
        setSelectedEvent(evento);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedEvent(null);
        setFormData({
            nombreCompleto: '',
            correo: '',
            telefono: '',
            institucion: ''
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Inscripción:', { evento: selectedEvent, datos: formData });
        // Aquí harías la llamada al backend
        alert('Inscripción enviada correctamente');
        handleCloseModal();
    };

    return (
        <>
            <div className={styles.container}>
                <div className={styles.container2}>
                    <div className={styles.paragraph}>
                        <b className={styles.catlogoDeEventos}>Catálogo de Eventos</b>
                    </div>
                </div>
                <div className={styles.container3}>
                    <img className={styles.alertcircleIcon} alt="" />
                    <div className={styles.container4}>
                        <div className={styles.paragraph2}>
                            <b className={styles.instrucciones}>Instrucciones</b>
                        </div>
                        <div className={styles.paragraph3}>
                            <div className={styles.exploreTodosLos}>Explore todos los eventos disponibles y activos. Utilice los filtros para encontrar eventos según fecha, tipo o estado.</div>
                        </div>
                    </div>
                </div>
                <div className={styles.container5}>
                    <div className={styles.container6}>
                        <img className={styles.icon} alt="" />
                        <div className={styles.paragraph4}>
                            <div className={styles.filtrosDeBsqueda}>Filtros de Búsqueda</div>
                        </div>
                    </div>
                    <div className={styles.container7}>
                        <div className={styles.primitivebutton}>
                            <div className={styles.primitivespan}>
                                <div className={styles.todosLosEstados}>Todos los estados</div>
                            </div>
                            <img className={styles.icon2} alt="" />
                        </div>
                        <div className={styles.primitivebutton2}>
                            <div className={styles.primitivespan2}>
                                <div className={styles.todosLosTipos}>Todos los tipos</div>
                            </div>
                            <img className={styles.icon2} alt="" />
                        </div>
                        <div className={styles.container8}>
                            <div className={styles.input}>
                                <div className={styles.buscarEvento}>Buscar evento...</div>
                            </div>
                            <img className={styles.icon4} alt="" />
                        </div>
                    </div>
                    <div className={styles.label}>
                        <div className={styles.checkbox} />
                        <div className={styles.text}>
                            <div className={styles.mostrarEventosCancelados}>Mostrar eventos cancelados</div>
                        </div>
                    </div>
                    <div className={styles.containerChild} />
                    <div className={styles.misInscripciones}>Mis Inscripciones</div>
                </div>
                <div className={styles.container9}>
                    {eventos.map((evento, index) => (
                        <div
                            key={evento.id}
                            className={styles[`eventcard${index === 0 ? '' : index + 1}`]}
                            onClick={() => handleEventClick(evento)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className={styles.container10}>
                                <img className={styles.imagewithfallbackIcon} alt="" />
                                <div className={styles[evento.estado === 'Abierto' ? 'badge' : evento.estado === 'En Curso' ? 'badge3' : 'badge7']}>
                                    <div className={evento.estado === 'Finalizado' ? styles.enCurso : styles.abierto}>{evento.estado}</div>
                                </div>
                            </div>
                            <div className={styles.container11}>
                                <div className={styles.heading3}>
                                    <div className={styles.conferenciaAnualDe}>{evento.nombre}</div>
                                </div>
                                <div className={styles.container12}>
                                    <div className={styles.container13}>
                                        <img className={styles.checkbox} alt="" />
                                        <div className={styles.text2}>
                                            <div className={styles.deNoviembre2025}>{evento.fecha}</div>
                                        </div>
                                    </div>
                                    <div className={styles.container13}>
                                        <img className={styles.checkbox} alt="" />
                                        <div className={styles.text3}>
                                            <div className={styles.centroDeConvenciones}>{evento.lugar}</div>
                                        </div>
                                    </div>
                                    <div className={styles.container15}>
                                        <div className={styles.text4}>
                                            <div className={styles.presencial}>{evento.tipo}</div>
                                        </div>
                                        <div className={styles.container16}>
                                            <img className={styles.checkbox} alt="" />
                                            <div className={styles.text5}>
                                                <div className={styles.presencial}>{evento.cupos}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal de Inscripción */}
            {isModalOpen && selectedEvent && (
                <div className={styles.modalOverlay} onClick={handleCloseModal}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.closeButton} onClick={handleCloseModal}>×</button>

                        <h2 className={styles.modalTitle}>{selectedEvent.nombre}</h2>
                        <p className={styles.modalSubtitle}>Inscríbete ahora para participar en este evento</p>

                        <div className={styles.eventImage}>
                            <img
                                src={selectedEvent.imagen || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop'}
                                alt={selectedEvent.nombre}
                                style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }}
                            />
                        </div>

                        <div className={styles.eventDetails} style={{ margin: '20px 0', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                <span>{selectedEvent.fecha}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                <span>{selectedEvent.lugar}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                <span>{selectedEvent.cuposDisponibles || selectedEvent.cupos} cupos disponibles de {selectedEvent.cupos}</span>
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <span><strong>Tipo:</strong> {selectedEvent.tipo}</span>
                            </div>
                            <div>
                                <span><strong>Estado:</strong> <span style={{
                                    padding: '4px 12px',
                                    borderRadius: '12px',
                                    backgroundColor: selectedEvent.estado === 'Abierto' ? '#4CAF50' : selectedEvent.estado === 'En Curso' ? '#FF9800' : '#9E9E9E',
                                    color: 'white',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                }}>{selectedEvent.estado}</span></span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className={styles.inscriptionForm}>
                            <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>Formulario de Inscripción</h3>

                            <div style={{ marginBottom: '15px' }}>
                                <label htmlFor="nombreCompleto" style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>Nombre completo *</label>
                                <input
                                    type="text"
                                    id="nombreCompleto"
                                    name="nombreCompleto"
                                    placeholder="Ingresa tu nombre completo"
                                    value={formData.nombreCompleto}
                                    onChange={handleInputChange}
                                    required
                                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                                />
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label htmlFor="correo" style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>Correo electrónico *</label>
                                <input
                                    type="email"
                                    id="correo"
                                    name="correo"
                                    placeholder="tu@email.com"
                                    value={formData.correo}
                                    onChange={handleInputChange}
                                    required
                                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                                />
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label htmlFor="telefono" style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>Teléfono *</label>
                                <input
                                    type="tel"
                                    id="telefono"
                                    name="telefono"
                                    placeholder="+57 300 123 4567"
                                    value={formData.telefono}
                                    onChange={handleInputChange}
                                    required
                                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label htmlFor="institucion" style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>Institución *</label>
                                <input
                                    type="text"
                                    id="institucion"
                                    name="institucion"
                                    placeholder="Nombre de tu institución"
                                    value={formData.institucion}
                                    onChange={handleInputChange}
                                    required
                                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
                                <button
                                    type="submit"
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        backgroundColor: '#0EA5E9',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Inscribirse al evento
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        backgroundColor: '#E5E7EB',
                                        color: '#374151',
                                        border: 'none',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Evento;