import { useState, useEffect } from 'react';
import EventCard from '../ui/EventCard';
import EventModal from '../ui/EventModal';
import { useEventos } from '../../hooks/useEventos';
import { ponenteEventosService } from '../../../../services/ponenteEventosService';
import { formatFecha, formatHora, formatFechaCompleta } from '../../../asistente/utils/dateUtils';
import styles from '../../components/styles/EventosSection.module.css';

const EventosSection = ({ onEventoSelect }) => {
  const { eventos, loading, error } = useEventos();
  const [selectedEvento, setSelectedEvento] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalEvento, setModalEvento] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  useEffect(() => {
    if (eventos.length > 0 && !selectedEvento) {
      setSelectedEvento(eventos[0]);
      onEventoSelect(eventos[0]);
    }
  }, [eventos, selectedEvento, onEventoSelect]);

  const handleEventoSelect = (evento) => {
    setSelectedEvento(evento);
    onEventoSelect(evento);
  };

  const handleViewDetails = async (evento) => {
    try {
      setModalLoading(true);
      setModalError(null);
      
      console.log('🔍 Cargando detalles completos del evento:', evento.id);
      
      // Cargar detalles completos del evento
      const token = localStorage.getItem('access_token');
      const eventoCompleto = await ponenteEventosService.obtenerDetallesEvento(evento.id, token);
      
      console.log('📦 Detalles completos cargados:', eventoCompleto);
      setModalEvento(eventoCompleto);
      setShowModal(true);
    } catch (error) {
      console.error('❌ Error cargando detalles del evento:', error);
      setModalError('No se pudieron cargar los detalles completos del evento');
      // Mostrar modal con la información básica que tenemos
      setModalEvento(evento);
      setShowModal(true);
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalEvento(null);
    setModalError(null);
  };

  const determinarEstadoEvento = (evento) => {
    const ahora = new Date();
    const fechaInicio = new Date(evento.fecha_inicio);
    const fechaFin = new Date(evento.fecha_fin);

    if (ahora > fechaFin) {
      return { texto: 'FINALIZADO', disponible: false };
    }
    if (ahora >= fechaInicio && ahora <= fechaFin) {
      return { texto: 'EN CURSO', disponible: true };
    }
    if (evento.cupos_disponibles === 0) {
      return { texto: 'CUPOS AGOTADOS', disponible: false };
    }
    if (ahora < fechaInicio) {
      return { texto: 'POR COMENZAR', disponible: true };
    }
    return { texto: 'DISPONIBLE', disponible: true };
  };

  if (loading) {
    return (
      <div className={styles.eventos}>
        <div className={styles.loading}>Cargando eventos disponibles...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.eventos}>
        <div className={styles.error}>
          <p>Error al cargar eventos: {error}</p>
          <button onClick={() => window.location.reload()} className={styles.retryButton}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.eventos}>
      <h2>Eventos Disponibles</h2>
      <p className={styles.subtitle}>Consulta los eventos publicados</p>

      {eventos.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No hay eventos disponibles en este momento.</p>
          <p className={styles.emptySubtitle}>
            Los eventos aparecerán aquí cuando sean publicados por los organizadores.
          </p>
        </div>
      ) : (
        <>
          <div className={styles.eventosInfo}>
            <p className={styles.eventosCount}>
              Se encontraron {eventos.length} evento(s) disponible(s)
            </p>
          </div>
          <div className={styles.eventosGrid}>
            {eventos.map(evento => (
              <EventCard
                key={evento.id}
                evento={evento}
                estado={determinarEstadoEvento(evento)}
                onViewDetails={handleViewDetails}
                formatFecha={formatFecha}
                formatHora={formatHora}
              />
            ))}
          </div>
        </>
      )}

      {showModal && modalEvento && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            {modalLoading ? (
              <div className={styles.modalLoading}>
                <p>Cargando detalles del evento...</p>
              </div>
            ) : (
              <EventModal
                evento={modalEvento}
                onClose={closeModal}
                formatFecha={formatFecha}
                formatFechaCompleta={formatFechaCompleta}
                error={modalError}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventosSection;