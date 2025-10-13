import api from "../services/api";

export interface Compatibilidad {
  Id?: number;
  ComponenteId?: number;
  CompatibleConId?: number;
  Detalles?: string;
}

export interface ApiRespuesta<T> {
  Entidad?: T;
  Entidades?: T[];
  Respuesta?: string;
  Error?: string;
  Fecha?: string;
}

// Listar compatibilidades
export async function listarCompatibilidad(): Promise<ApiRespuesta<Compatibilidad>> {
  const res = await api.post("/Compatibilidad/Listar", {});
  return res.data;
}

// Guardar
export async function guardarCompatibilidad(entidad: Compatibilidad): Promise<ApiRespuesta<Compatibilidad>> {
  const res = await api.post("/Compatibilidad/Guardar", { Entidad: entidad });
  return res.data;
}

// Modificar
export async function modificarCompatibilidad(entidad: Compatibilidad): Promise<ApiRespuesta<Compatibilidad>> {
  const res = await api.post("/Compatibilidad/Modificar", { Entidad: entidad });
  return res.data;
}

// Borrar
export async function borrarCompatibilidad(entidad: Compatibilidad): Promise<ApiRespuesta<Compatibilidad>> {
  const res = await api.post("/Compatibilidad/Borrar", { Entidad: entidad });
  return res.data;
}

// Obtener compatibilidad por componente
export async function obtenerCompatibilidadPorComponente(componenteId: number): Promise<ApiRespuesta<Compatibilidad>> {
  const res = await api.post("/Compatibilidad/ObtenerCompatibilidadPorComponente", { ComponenteId: componenteId });
  return res.data;
}
