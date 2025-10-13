import api from "../services/api";

export interface TipoComponente {
  Id?: number;
  Nombre?: string;
  Descripcion?: string;
}

export interface ApiRespuesta<T> {
  Entidad?: T;
  Entidades?: T[];
  Respuesta?: string;
  Error?: string;
  Fecha?: string;
}

// Listar
export async function listarTiposComponentes(): Promise<ApiRespuesta<TipoComponente>> {
  const res = await api.post("/TiposComponentes/Listar", {});
  return res.data;
}

// Guardar
export async function guardarTipoComponente(entidad: TipoComponente): Promise<ApiRespuesta<TipoComponente>> {
  const res = await api.post("/TiposComponentes/Guardar", { Entidad: entidad });
  return res.data;
}

// Modificar
export async function modificarTipoComponente(entidad: TipoComponente): Promise<ApiRespuesta<TipoComponente>> {
  const res = await api.post("/TiposComponentes/Modificar", { Entidad: entidad });
  return res.data;
}
