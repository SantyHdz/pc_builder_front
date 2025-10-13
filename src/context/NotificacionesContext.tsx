// src/context/NotificacionesContext.tsx
import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';


export type TipoNotificacion = 'exito' | 'error' | 'info';

export interface Notificacion {
  id: number;
  mensaje: string;
  tipo: TipoNotificacion;
  fecha: string; // ISO
  visto?: boolean;
}

interface NotificacionesContextType {
  notificaciones: Notificacion[];
  agregarNotificacion: (mensaje: string, tipo?: TipoNotificacion, autoCerrarMs?: number) => number;
  eliminarNotificacion: (id: number) => void;
  marcarComoVisto: (id: number) => void;
  marcarTodasVistas: () => void;
}

const NotificacionesContext = createContext<NotificacionesContextType | null>(null);

export function NotificacionesProvider({ children }: { children: ReactNode }) {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);

  const agregarNotificacion = (
    mensaje: string,
    tipo: TipoNotificacion = 'info',
    autoCerrarMs = 4000
  ) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const nueva: Notificacion = {
      id,
      mensaje,
      tipo,
      fecha: new Date().toISOString(),
      visto: false,
    };
    setNotificaciones(prev => [nueva, ...prev]);

    if (autoCerrarMs && autoCerrarMs > 0) {
      setTimeout(() => {
        setNotificaciones(prev => prev.filter(n => n.id !== id));
      }, autoCerrarMs);
    }

    return id;
  };

  const eliminarNotificacion = (id: number) => {
    setNotificaciones(prev => prev.filter(n => n.id !== id));
  };

  const marcarComoVisto = (id: number) => {
    setNotificaciones(prev => prev.map(n => (n.id === id ? { ...n, visto: true } : n)));
  };

  const marcarTodasVistas = () => {
    setNotificaciones(prev => prev.map(n => ({ ...n, visto: true })));
  };

  return (
    <NotificacionesContext.Provider
      value={{ notificaciones, agregarNotificacion, eliminarNotificacion, marcarComoVisto, marcarTodasVistas }}
    >
      {children}
    </NotificacionesContext.Provider>
  );
}

export function useNotificaciones() {
  const ctx = useContext(NotificacionesContext);
  if (!ctx) {
    throw new Error('useNotificaciones debe ser usado dentro de NotificacionesProvider');
  }
  return ctx;
}
