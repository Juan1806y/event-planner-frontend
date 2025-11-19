import { BaseService } from '../services/api/baseService';
import { authService } from './api/authService';

export class AdminService extends BaseService {
  async getDashboardData() {
    const [afiliaciones, auditoria] = await Promise.all([
      this.getAfiliaciones(),
      this.getAuditoria()
    ]);

    return {
      afiliaciones: this.processAfiliacionesData(afiliaciones),
      auditoria: this.processAuditoriaData(auditoria)
    };
  }

  async getAfiliaciones() {
    return this.request('/api/empresas?incluir_pendientes=true');
  }

  async getAuditoria() {
    return this.request('/api/auditoria');
  }

  async getUsuarios() {
    return this.request('/api/gestion-usuarios/users');
  }

  async aprobarEmpresa(id, data) {
    return this.request(`/api/empresas/${id}/aprobar`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  // Aprobar la empresa y, si es posible, promover al usuario que solicitó la afiliación.
  async aprobarEmpresaYPromover(id) {
    // Ejecutar la aprobación
    console.debug('adminService.aprobarEmpresaYPromover: aprobadando empresa', id);
    const aprobarResp = await this.request(`/api/empresas/${id}/aprobar`, {
      method: 'PATCH',
      body: JSON.stringify({ aprobar: true })
    });

    // Extraer id del solicitante desde la respuesta si viene
    const data = aprobarResp?.data || {};
    let requesterId = data.usuario?.id || data.usuario_id || data.id_usuario || data.creado_por || data.creador_id || data.solicitante?.id || data.solicitante_id || data.user_id || null;

    // Si no está en la respuesta, intentar obtener la empresa completa
    if (!requesterId) {
      try {
        const empresaFull = await this.request(`/api/empresas/${id}`);
        const empresaData = empresaFull?.data || empresaFull;
        requesterId = empresaData?.usuario?.id || empresaData?.usuario_id || empresaData?.id_usuario || empresaData?.creado_por || empresaData?.creador_id || empresaData?.solicitante?.id || empresaData?.solicitante_id || empresaData?.user_id || null;
        console.debug('adminService: requesterId obtained from GET empresa', requesterId, empresaData);
      } catch (err) {
        console.warn('adminService: failed to fetch empresa to obtain requesterId', err);
      }
    }

    let promoteResult = null;
    if (requesterId) {
      // Llamar al endpoint de promoción del authService
      console.debug('adminService: calling authService.promoverGerente', { requesterId, empresaId: id });
      promoteResult = await authService.promoverGerente(String(requesterId), String(id));
      console.debug('adminService: promoteResult', promoteResult);
    } else {
      console.warn('adminService: no requesterId found, skipping promotion');
    }

    return { aprobar: aprobarResp, promote: promoteResult };
  }

  processAfiliacionesData(data) {
    if (!data?.data) return { pendientes: 0, aprobadas: 0, rechazadas: 0 };

    let empresasData = Array.isArray(data.data) ? data.data : [data.data];
    
    const pendientes = empresasData.filter(e => 
      e.estado === 0 || e.estado === '0' || e.estado === 'pendiente'
    ).length;
    
    const aprobadas = empresasData.filter(e => 
      e.estado === 1 || e.estado === '1' || e.estado === 'aprobado'
    ).length;
    
    const rechazadas = empresasData.filter(e => 
      e.estado === 2 || e.estado === '2' || e.estado === 'rechazado'
    ).length;

    return { pendientes, aprobadas, rechazadas };
  }

  processAuditoriaData(data) {
    if (!data?.data) return [];
    
    let auditoriaData = Array.isArray(data.data) ? data.data : [data.data];
    return auditoriaData.sort((a, b) => b.id - a.id);
  }
}

export const adminService = new AdminService();