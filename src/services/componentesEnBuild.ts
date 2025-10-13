import api from "../services/api";

export interface ComponenteEnBuild {
  Id?: number;
  BuildId?: number;
  ComponenteId?: number;
  Cantidad?: number;
}

export interface ApiRespuesta<T> {
  Entidad?: T;
  Entidades?: T[];
  Respuesta?: string;
  Error?: string;
  Fecha?: string;
}

// Listar
export async function listarComponentesEnBuild(): Promise<ApiRespuesta<ComponenteEnBuild>> {
  const res = await api.post("/ComponentesEnBuild/Listar", {});
  return res.data;
}

// Guardar
export async function guardarComponenteEnBuild(entidad: ComponenteEnBuild): Promise<ApiRespuesta<ComponenteEnBuild>> {
  const res = await api.post("/ComponentesEnBuild/Guardar", { Entidad: entidad });
  return res.data;
}

// Modificar
export async function modificarComponenteEnBuild(entidad: ComponenteEnBuild): Promise<ApiRespuesta<ComponenteEnBuild>> {
  const res = await api.post("/ComponentesEnBuild/Modificar", { Entidad: entidad });
  return res.data;
}

// Borrar
export async function borrarComponenteEnBuild(entidad: ComponenteEnBuild): Promise<ApiRespuesta<ComponenteEnBuild>> {
  const res = await api.post("/ComponentesEnBuild/Borrar", { Entidad: entidad });
  return res.data;
}

// Obtener por build
export async function obtenerComponentesPorBuild(buildId: number): Promise<ApiRespuesta<ComponenteEnBuild>> {
  const res = await api.post("/ComponentesEnBuild/ObtenerPorBuild", { BuildId: buildId });
  return res.data;
}