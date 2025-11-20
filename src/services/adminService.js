import { BaseService } from '../services/api/baseService';
import { authService } from './api/authService';

export class AdminService extends BaseService {
  // Método helper para obtener el token decodificado
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

  async promoverAGerente(idUsuario, idEmpresa) {
    return authService.promoverGerente(idUsuario, idEmpresa);
  }

  async aprobarEmpresaYPromover(id, data) {
    // Ejecutar la aprobación primero
    const aprobarResp = await this.request(`/api/empresas/${id}/aprobar`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });

    // Extraer id del creador desde la respuesta (soporte para varias claves)
    const payload = aprobarResp?.data || {};
    const requesterId = payload?.creador?.id || payload?.creador_id || payload?.id_creador || payload?.usuario?.id || payload?.usuario_id || null;

    let promoteResult = null;
    if (requesterId) {
      // Llamar al endpoint de promoción con el orden correcto: (id_usuario, id_empresa)
      promoteResult = await authService.promoverGerente(String(requesterId), String(id));
    } else {
      console.warn('adminService.aprobarEmpresaYPromover: no requesterId found, skipping promotion');
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