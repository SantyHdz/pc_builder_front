// src/components/NotificacionesButton.tsx
import { useState, useRef, useEffect } from 'react';
import { Bell, X, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotificaciones } from '../context/NotificacionesContext';
import type { Notificacion } from '../context/NotificacionesContext';

export default function NotificacionesButton() {
  const { notificaciones, eliminarNotificacion, marcarComoVisto, marcarTodasVistas } = useNotificaciones();
  const [abierto, setAbierto] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const noVistos = notificaciones.filter(n => !n.visto).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    // Cuando se abre, marcar visibles (opcional: quitar si quieres "marcar manualmente")
    if (abierto && notificaciones.length > 0) {
      marcarTodasVistas();
    }
  }, [abierto]);

  const formatoFechaCorta = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="relative" ref={ref}>
      <motion.button
        onClick={() => setAbierto(v => !v)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative p-2 rounded-full hover:bg-gray-800 transition"
        title="Notificaciones"
      >
        <Bell />
        {noVistos > 0 && (
          <span className="absolute top-0 right-0 -mt-1 -mr-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-black bg-pc-accent rounded-full">
            {noVistos}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {abierto && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 mt-3 w-80 bg-pc-panel rounded-xl shadow-lg border border-gray-700 p-3 z-50"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-200">Notificaciones</h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setAbierto(false);
                  }}
                  title="Cerrar"
                  className="p-1 hover:bg-gray-800 rounded"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="max-h-[34vh] overflow-y-auto space-y-2">
              {notificaciones.length === 0 ? (
                <div className="text-center text-sm text-gray-400 py-6">No hay notificaciones</div>
              ) : (
                notificaciones.map((n: Notificacion) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-lg border ${
                      n.visto ? 'bg-pc-dark border-gray-700' : 'bg-gradient-to-r from-pc-accent/5 border-pc-accent/30'
                    } flex items-start justify-between`}
                  >
                    <div className="flex-1">
                      <p className="text-sm text-gray-100">{n.mensaje}</p>
                      <div className="text-xs text-gray-500 mt-1">{formatoFechaCorta(n.fecha)}</div>
                    </div>

                    <div className="ml-3 flex flex-col items-end gap-2">
                      <button
                        onClick={() => eliminarNotificacion(n.id)}
                        title="Eliminar"
                        className="p-1 rounded hover:bg-gray-800"
                      >
                        <Trash2 className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {notificaciones.length > 0 && (
              <div className="mt-3 flex items-center justify-between">
                <button
                  onClick={() => notificaciones.forEach(n => marcarComoVisto(n.id))}
                  className="text-xs text-gray-300 hover:text-white"
                >
                  Marcar todos vistos
                </button>
                <button
                  onClick={() => notificaciones.forEach(n => eliminarNotificacion(n.id))}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Borrar todo
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
