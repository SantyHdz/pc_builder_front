import api from "./api";

export async function login(email: string, password: string) {
  // Requiere que tengas un endpoint que devuelva token.
  // Asumo /Token/Login (si no existe adáptalo)
  const res = await api.post("/Token/Login", { Correo: email, Contrasena: password });
  return res.data;
}

export function logout() {
  localStorage.removeItem("token");
  window.location.href = "/login";
}
