import api from "../services/api";

export interface Rol {
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
export async function listarRoles(): Promise<ApiRespuesta<Rol>> {
  const res = await api.post("/Roles/Listar", {});
  return res.data;
}

// PorId
export async function obtenerRolPorId(entidad: Rol): Promise<ApiRespuesta<Rol>> {
  const res = await api.post("/Roles/PorId", { Entidad: entidad });
  return res.data;
}

// Guardar
export async function guardarRol(entidad: Rol): Promise<ApiRespuesta<Rol>> {
  const res = await api.post("/Roles/Guardar", { Entidad: entidad });
  return res.data;
}

// Modificar
export async function modificarRol(entidad: Rol): Promise<ApiRespuesta<Rol>> {
  const res = await api.post("/Roles/Modificar", { Entidad: entidad });
  return res.data;
}

// Borrar
export async function borrarRol(entidad: Rol): Promise<ApiRespuesta<Rol>> {
  const res = await api.post("/Roles/Borrar", { Entidad: entidad });
  return res.data;
}
