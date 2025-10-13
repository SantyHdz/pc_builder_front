import api from "./api";
import axios from "axios";

export interface Rol {
  Id?: number;
  Nombre?: string;
}

export interface Usuario {
  Id?: number;
  Nombre?: string;
  Correo?: string;
  ContrasenaHash?: string;
  Direccion?: string;
  RolId?: number;
  _RolId?: Rol;
}

export interface ApiRespuesta<T> {
  Entidad?: T;
  Entidades?: T[];
  Respuesta?: string;
  Error?: string;
  Fecha?: string;
}

// Listar todos los usuarios
export async function listarUsuarios(): Promise<ApiRespuesta<Usuario>> {
  const res = await api.post("/Usuarios/Listar", {});
  return res.data;
}

// Buscar usuario por correo
export async function usuariosPorCorreo(correo: string): Promise<ApiRespuesta<Usuario>> {
  const res = await api.post("/Usuarios/PorCorreo", {
    Entidad: { Correo: correo },
  });
  return res.data;
}

// Guardar (insertar nuevo)
export async function guardarUsuario(usuario: Usuario): Promise<ApiRespuesta<Usuario>> {
  const res = await api.post("/Usuarios/Guardar", { Entidad: usuario });
  return res.data;
}

// Modificar existente
export async function modificarUsuario(usuario: Usuario): Promise<ApiRespuesta<Usuario>> {
  const res = await api.post("/Usuarios/Modificar", { Entidad: usuario });
  return res.data;
}

// Borrar usuario
export async function borrarUsuario(usuario: Usuario): Promise<ApiRespuesta<Usuario>> {
  const res = await api.post("/Usuarios/Borrar", { Entidad: usuario });
  return res.data;
}

// Login (sin token)
export async function loginUsuario(correo: string, contrasena: string): Promise<ApiRespuesta<Usuario>> {
  const res = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL}/Usuarios/Login`,
    { Correo: correo, Contrasena: contrasena }
  );
  return typeof res.data === "string" ? JSON.parse(res.data) : res.data;
}

// Registrar (sin token)
export async function registrarUsuario(usuario: Usuario): Promise<ApiRespuesta<Usuario>> {
  const res = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL}/Usuarios/Registrar`,
    { Entidad: usuario }
  );
  return typeof res.data === "string" ? JSON.parse(res.data) : res.data;
}

//Recuperar contraseña
export async function recuperarContrasena(
  correo: string,
  nuevaContrasena: string
): Promise<ApiRespuesta<Usuario>> {
  try {
    const body = {
      Correo: correo,
      NuevaContrasena: nuevaContrasena,
    };
    const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const resp = await fetch(`${VITE_API_BASE_URL}/Usuarios/RecuperarContrasena`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await resp.json();
    return data;
  } catch (error: any) {
    return { Error: error.message || "Error al recuperar contraseña" };
  }
}