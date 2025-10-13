import { useState, useEffect } from 'react';
import {
  listarTiposComponentes,
  guardarTipoComponente,
  modificarTipoComponente,
  type TipoComponente
} from '../services/tiposComponentes';

function AdminTipos() {
  const [tipos, setTipos] = useState<TipoComponente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [tipoEditando, setTipoEditando] = useState<TipoComponente | null>(null);

  useEffect(() => {
    cargarTipos();
  }, []);

  const cargarTipos = async () => {
    try {
      setCargando(true);
      setError(null);
      const resp = await listarTiposComponentes();
      if (resp.Error) throw new Error(resp.Error);
      setTipos(resp.Entidades || []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar tipos');
    } finally {
      setCargando(false);
    }
  };

  const abrirModalNuevo = () => {
    setTipoEditando(null);
    setModalAbierto(true);
  };

  const abrirModalEditar = (tipo: TipoComponente) => {
    setTipoEditando(tipo);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setTipoEditando(null);
  };

  const handleGuardar = async (tipo: TipoComponente) => {
    try {
      const resp = tipo.Id
        ? await modificarTipoComponente(tipo)
        : await guardarTipoComponente(tipo);

      if (resp.Error) throw new Error(resp.Error);
      await cargarTipos();
      cerrarModal();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pc-accent mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando tipos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-pc-panel rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              🏷️ Tipos de Componentes
            </h2>
            <p className="text-gray-400 text-sm">
              Gestiona las categorías disponibles
            </p>
          </div>
          <button
            onClick={abrirModalNuevo}
            className="bg-gradient-to-r from-pc-accent to-pc-accent-hover text-black px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition flex items-center gap-2 shadow-lg shadow-pc-accent/30"
          >
            <span>➕</span>
            Nuevo Tipo
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 border-l-4 border-red-500 p-4 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Grid de tipos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tipos.map((tipo) => (
          <div
            key={tipo.Id}
            className="bg-pc-panel border border-gray-700 rounded-xl p-6 hover:border-pc-accent transition"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="bg-pc-accent/20 w-12 h-12 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
              <button
                onClick={() => abrirModalEditar(tipo)}
                className="text-blue-400 hover:text-blue-300 transition"
              >
                ✏️
              </button>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              {tipo.Nombre}
            </h3>
            <p className="text-gray-400 text-sm">
              {tipo.Descripcion || 'Sin descripción'}
            </p>
            <div className="mt-4 pt-4 border-t border-gray-700">
              <span className="text-xs text-gray-500">ID: {tipo.Id}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalAbierto && (
        <ModalTipo
          tipo={tipoEditando}
          onGuardar={handleGuardar}
          onCerrar={cerrarModal}
        />
      )}
    </div>
  );
}

// Modal para crear/editar tipo
interface ModalProps {
  tipo: TipoComponente | null;
  onGuardar: (tipo: TipoComponente) => void;
  onCerrar: () => void;
}

function ModalTipo({ tipo, onGuardar, onCerrar }: ModalProps) {
  const [form, setForm] = useState<TipoComponente>(
    tipo || {
      Nombre: '',
      Descripcion: '',
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.Nombre) {
      alert('El nombre es obligatorio');
      return;
    }
    onGuardar(form);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-pc-panel rounded-xl border border-gray-700 max-w-lg w-full">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-2xl font-bold text-white">
            {tipo ? '✏️ Editar Tipo' : '➕ Nuevo Tipo'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Nombre *
            </label>
            <input
              type="text"
              name="Nombre"
              value={form.Nombre || ''}
              onChange={handleChange}
              required
              placeholder="Ej: Procesador, Tarjeta Gráfica"
              className="w-full px-4 py-3 bg-pc-dark border border-gray-700 rounded-lg text-gray-100 focus:ring-2 focus:ring-pc-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Descripción
            </label>
            <textarea
              name="Descripcion"
              value={form.Descripcion || ''}
              onChange={handleChange}
              rows={3}
              placeholder="Describe este tipo de componente..."
              className="w-full px-4 py-3 bg-pc-dark border border-gray-700 rounded-lg text-gray-100 focus:ring-2 focus:ring-pc-accent resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-pc-accent to-pc-accent-hover text-black py-3 rounded-lg font-semibold hover:opacity-90 transition"
            >
              💾 Guardar
            </button>
            <button
              type="button"
              onClick={onCerrar}
              className="px-6 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminTipos;