import axios from "axios";
import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";


const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});


const AUTH_USER = import.meta.env.VITE_AUTH_USER as string;
const TOKEN_KEY = "accessToken";


function getJwtExp(token?: string | null): number | null {
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    const json = JSON.parse(atob(payload));
    return typeof json.exp === "number" ? json.exp : null;
  } catch {
    return null;
  }
}

async function login(): Promise<string> {
  const res = await api.post("/Token/Autenticar", { Usuario: AUTH_USER });
  const data = typeof res.data === "string" ? JSON.parse(res.data) : res.data;
  const token: string = data.Token;
  localStorage.setItem(TOKEN_KEY, token);
  return token;
}

async function ensureToken(): Promise<string> {
  let token = localStorage.getItem(TOKEN_KEY);
  const exp = getJwtExp(token);

  //tiemppo a refrescar menos 30s
  const now = Math.floor(Date.now() / 1000);
  if (!token || !exp || exp - now < 30) {
    token = await login();
  }
  return token!;
}


api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (config.url?.includes("/Token/Autenticar")) return config;

    const method = (config.method || "get").toLowerCase();
    if (["post", "put", "patch"].includes(method)) {
      const token = await ensureToken();

      let body: any = config.data;
      if (body == null || typeof body !== "object") body = {};
      body.Bearer = token;

      config.data = body;
    }

    return config;
  }
);


let isRefreshing = false;
let pendingQueue: Array<() => void> = [];

api.interceptors.response.use(
  (response: AxiosResponse) => {
    if (typeof response.data === "string") {
      try {
        return { ...response, data: JSON.parse(response.data) };
      } catch {
        return response;
      }
    }
    return response;
  },
  async (error) => {
    if (error?.response?.status === 401) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          await login();
          pendingQueue.forEach((cb) => cb());
          pendingQueue = [];
        } finally {
          isRefreshing = false;
        }
      }
      await new Promise<void>((resolve) => pendingQueue.push(resolve));

      const config = error.config;
      const token = localStorage.getItem(TOKEN_KEY);
      let body: any = config.data;
      if (body == null || typeof body !== "object") body = {};
      body.Bearer = token;
      config.data = body;
      return api.request(config);
    }

    return Promise.reject(error);
  }
);

export default api;
