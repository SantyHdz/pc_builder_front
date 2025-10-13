import api from "../services/api";

export interface Componente {
  Id?: number;
  TipoId?: number;
  Nombre?: string;
  Marca?: string;
  Modelo?: string;
  Especificaciones?: string;
}

export interface ApiRespuesta<T> {
  Entidad?: T;
  Entidades?: T[];
  Respuesta?: string;
  Error?: string;
  Fecha?: string;
}

// Listar
export async function listarComponentes(): Promise<ApiRespuesta<Componente>> {
  const res = await api.post("/Componentes/Listar", {});
  return res.data;
}

// Guardar
export async function guardarComponente(entidad: Componente): Promise<ApiRespuesta<Componente>> {
  const res = await api.post("/Componentes/Guardar", { Entidad: entidad });
  return res.data;
}

// Modificar
export async function modificarComponente(entidad: Componente): Promise<ApiRespuesta<Componente>> {
  const res = await api.post("/Componentes/Modificar", { Entidad: entidad });
  return res.data;
}

// Borrar
export async function borrarComponente(entidad: Componente): Promise<ApiRespuesta<Componente>> {
  const res = await api.post("/Componentes/Borrar", { Entidad: entidad });
  return res.data;
}

// Filtrar por tipo
export async function filtrarComponentesPorTipo(tipo: number): Promise<ApiRespuesta<Componente>> {
  const res = await api.post("/Componentes/FiltrarPorTipo", { Tipo: tipo });
  return res.data;
}

// Obtener compatibles
export async function obtenerCompatibles(componenteId: number): Promise<ApiRespuesta<Componente>> {
  const res = await api.post("/Componentes/ObtenerCompatibles", { ComponenteId: componenteId });
  return res.data;
}