import { BaseService } from '../services/api/baseService';

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
    return this.request('/empresas?incluir_pendientes=true');
  }

  async getAuditoria() {
    return this.request('/auditoria');
  }

  async getUsuarios() {
    return this.request('/gestion-usuarios/users');
  }

  async aprobarEmpresa(id, data) {
    return this.request(`/empresas/${id}/aprobar`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
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