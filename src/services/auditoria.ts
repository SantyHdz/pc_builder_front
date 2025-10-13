import api from "../services/api";

export interface Auditoria {
  Id?: number;
  UsuarioId?: number;
  Accion?: string;
  Fecha?: string;
  Detalles?: string;
}

export interface ApiRespuesta<T> {
  Entidad?: T;
  Entidades?: T[];
  Respuesta?: string;
  Error?: string;
  Fecha?: string;
}

// Listar auditorías
export async function listarAuditoria(): Promise<ApiRespuesta<Auditoria>> {
  const res = await api.post("/Auditoria/Listar", {});
  return res.data;
}

// Obtener auditoría por ID
export async function obtenerAuditoriaPorId(id: number): Promise<ApiRespuesta<Auditoria>> {
  const res = await api.post("/Auditoria/ObtenerPorId", { Id: id });
  return res.data;
}
