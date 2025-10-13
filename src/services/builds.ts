import api from "../services/api";

export interface Build {
  Id?: number;
  UsuarioId?: number;
  Nombre?: string;
  Version?: string;
  Estado?: string;
  Fecha?: string;
}

export interface ApiRespuesta<T> {
  Entidad?: T;
  Entidades?: T[];
  Respuesta?: string;
  Error?: string;
  Fecha?: string;
}

// Listar builds
export async function listarBuilds(): Promise<ApiRespuesta<Build>> {
  const res = await api.post("/Builds/Listar", {});
  return res.data;
}

// Guardar nueva build
export async function guardarBuild(build: Build): Promise<ApiRespuesta<Build>> {
  const res = await api.post("/Builds/Guardar", { Entidad: build });
  return res.data;
}

// Modificar build existente
export async function modificarBuild(build: Build): Promise<ApiRespuesta<Build>> {
  const res = await api.post("/Builds/Modificar", { Entidad: build });
  return res.data;
}

// Borrar build
export async function borrarBuild(build: Build): Promise<ApiRespuesta<Build>> {
  const res = await api.post("/Builds/Borrar", { Entidad: build });
  return res.data;
}

// Obtener builds de un usuario
export async function obtenerBuildsPorUsuario(usuarioId: number): Promise<ApiRespuesta<Build>> {
  const res = await api.post("/Builds/ObtenerPorUsuario", { UsuarioId: usuarioId });
  return res.data;
}
