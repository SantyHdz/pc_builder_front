import { useState, useEffect } from 'react';
import {
  listarComponentes,
  guardarComponente,
  modificarComponente,
  borrarComponente,
  type Componente
} from '../services/componentes';
import {
  listarTiposComponentes,
  type TipoComponente
} from '../services/tiposComponentes';

function AdminComponentes() {
  const [componentes, setComponentes] = useState<Componente[]>([]);
  const [tipos, setTipos] = useState<TipoComponente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [componenteEditando, setComponenteEditando] = useState<Componente | null>(null);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError(null);
      
      const [respComp, respTipos] = await Promise.all([
        listarComponentes(),
        listarTiposComponentes()
      ]);

      if (respComp.Error) throw new Error(respComp.Error);
      if (respTipos.Error) throw new Error(respTipos.Error);

      setComponentes(respComp.Entidades || []);
      setTipos(respTipos.Entidades || []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos');
    } finally {
      setCargando(false);
    }
  };

  const abrirModalNuevo = () => {
    setComponenteEditando(null);
    setModalAbierto(true);
  };

  const abrirModalEditar = (componente: Componente) => {
    setComponenteEditando(componente);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setComponenteEditando(null);
  };

  // Agrega esto temporalmente en tu AdminComponentes.tsx para debug
// Colócalo justo antes de handleGuardar

const handleGuardarConDebug = async (componente: Componente) => {
  console.group('🔍 DEBUG: Guardando Componente');
  console.log('Datos a enviar:', componente);
  console.log('TipoId:', componente.TipoId, typeof componente.TipoId);
  console.log('Nombre:', componente.Nombre);
  console.log('Es edición?', !!componente.Id);
  
  try {
    console.log('📤 Llamando al backend...');
    
    const resp = componente.Id
      ? await modificarComponente(componente)
      : await guardarComponente(componente);

    console.log('📥 Respuesta del backend:', resp);

    if (resp.Error) {
      console.error('❌ Error del backend:', resp.Error);
      throw new Error(resp.Error);
    }

    console.log('✅ Guardado exitoso');
    console.groupEnd();
    
    await cargarDatos();
    cerrarModal();
  } catch (err: any) {
    console.error('❌ Error capturado:', err);
    console.error('Stack:', err.stack);
    console.groupEnd();
    alert('Error: ' + err.message);
  }
};

// Luego en tu componente, reemplaza handleGuardar con handleGuardarConDebug
// en el prop del modal:
// <ModalComponente
//   onGuardar={handleGuardarConDebug}  // 👈 Cambia esto temporalmente
// />

  const handleGuardar = async (componente: Componente) => {
    try {
      const resp = componente.Id
        ? await modificarComponente(componente)
        : await guardarComponente(componente);

      if (resp.Error) throw new Error(resp.Error);

      await cargarDatos();
      cerrarModal();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleEliminar = async (componente: Componente) => {
    if (!confirm(`¿Eliminar ${componente.Nombre}?`)) return;

    try {
      const resp = await borrarComponente(componente);
      if (resp.Error) throw new Error(resp.Error);
      await cargarDatos();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const componentesFiltrados = componentes.filter(c => {
    const termino = busqueda.toLowerCase();
    return (
      c.Nombre?.toLowerCase().includes(termino) ||
      c.Marca?.toLowerCase().includes(termino) ||
      c.Modelo?.toLowerCase().includes(termino)
    );
  });

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pc-accent mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando componentes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-pc-panel rounded-xl p-6 border border-gray-700">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              ⚙️ Gestión de Componentes
            </h2>
            <p className="text-gray-400 text-sm">
              {componentesFiltrados.length} componente(s) registrado(s)
            </p>
          </div>

          <button
            onClick={abrirModalNuevo}
            className="bg-gradient-to-r from-pc-accent to-pc-accent-hover text-black px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition flex items-center gap-2 shadow-lg shadow-pc-accent/30"
          >
            <span>➕</span>
            Nuevo Componente
          </button>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="bg-pc-panel rounded-xl p-4 border border-gray-700">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
            🔍
          </span>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar componente..."
            className="w-full pl-12 pr-4 py-3 bg-pc-dark border border-gray-700 rounded-lg text-gray-100 focus:ring-2 focus:ring-pc-accent"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900/30 border-l-4 border-red-500 p-4 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Tabla de componentes */}
      {componentesFiltrados.length === 0 ? (
        <div className="bg-pc-panel rounded-xl p-12 border border-gray-700 text-center">
          <p className="text-gray-500 text-lg">
            📦 No hay componentes registrados
          </p>
        </div>
      ) : (
        <div className="bg-pc-panel rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-pc-dark">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">
                    Nombre
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">
                    Marca
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">
                    Modelo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">
                    Tipo
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {componentesFiltrados.map((comp) => (
                  <tr key={comp.Id} className="hover:bg-pc-dark/50 transition">
                    <td className="px-6 py-4 text-sm text-gray-400">
                      #{comp.Id}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-white">
                      {comp.Nombre}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {comp.Marca || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {comp.Modelo || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="bg-pc-accent/20 text-pc-accent px-2 py-1 rounded text-xs">
                        {tipos.find(t => t.Id === comp.TipoId)?.Nombre || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => abrirModalEditar(comp)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition text-xs font-medium"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => handleEliminar(comp)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition text-xs font-medium"
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalAbierto && (
        <ModalComponente
          componente={componenteEditando}
          tipos={tipos}
          onGuardar={handleGuardarConDebug}
          onCerrar={cerrarModal}
        />
      )}
    </div>
  );
}

// Modal para crear/editar componente
interface ModalProps {
  componente: Componente | null;
  tipos: TipoComponente[];
  onGuardar: (componente: Componente) => void;
  onCerrar: () => void;
}

function ModalComponente({ componente, tipos, onGuardar, onCerrar }: ModalProps) {
  const [form, setForm] = useState<Componente>(
    componente || {
      TipoId: undefined,
      Nombre: '',
      Marca: '',
      Modelo: '',
      Especificaciones: '',
      ConsumoEnergetico: undefined,
      
      Precio: undefined,
    }
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === 'TipoId' || name === 'ConsumoEnergetico' || name === 'Precio'
          ? parseFloat(value)
          : value,
    }));
  };

  const handleSubmit = () => {
    if (!form.Nombre?.trim()) {
      alert('Por favor ingresa un nombre para el componente');
      return;
    }
    if (!form.TipoId) {
      alert('Por favor selecciona un tipo de componente');
      return;
    }
    if (!form.ConsumoEnergetico || form.ConsumoEnergetico <= 0) {
      alert('Por favor ingresa el consumo energético del componente (en vatios)');
      return;
    }
    if (form.Precio == null || form.Precio <= 0) {
      alert('Por favor ingresa un precio válido para el componente');
      return;
    }

    // Asegurar que los campos opcionales no sean undefined
    const componenteLimpio: Componente = {
      ...form,
      Marca: form.Marca?.trim() || (null as any),
      Modelo: form.Modelo?.trim() || (null as any),
      Especificaciones: form.Especificaciones?.trim() || (null as any),
    };

    onGuardar(componenteLimpio);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-pc-panel rounded-xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-2xl font-bold text-white">
            {componente ? '✏️ Editar Componente' : '➕ Nuevo Componente'}
          </h3>
        </div>

        <div className="p-6 space-y-4">
          {/* Tipo */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Tipo de Componente *
            </label>
            <select
              name="TipoId"
              value={form.TipoId || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-pc-dark border border-gray-700 rounded-lg text-gray-100 focus:ring-2 focus:ring-pc-accent"
            >
              <option value="">Seleccionar tipo...</option>
              {tipos.map((tipo) => (
                <option key={tipo.Id} value={tipo.Id}>
                  {tipo.Nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Nombre del Componente *
            </label>
            <input
              type="text"
              name="Nombre"
              value={form.Nombre || ''}
              onChange={handleChange}
              placeholder="Ej: Intel Core i9-13900K"
              className="w-full px-4 py-3 bg-pc-dark border border-gray-700 rounded-lg text-gray-100 focus:ring-2 focus:ring-pc-accent"
            />
          </div>

          {/* Marca */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Marca
            </label>
            <input
              type="text"
              name="Marca"
              value={form.Marca || ''}
              onChange={handleChange}
              placeholder="Ej: Intel, AMD, NVIDIA"
              className="w-full px-4 py-3 bg-pc-dark border border-gray-700 rounded-lg text-gray-100 focus:ring-2 focus:ring-pc-accent"
            />
          </div>

          {/* Modelo */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Modelo
            </label>
            <input
              type="text"
              name="Modelo"
              value={form.Modelo || ''}
              onChange={handleChange}
              placeholder="Ej: RTX 4090"
              className="w-full px-4 py-3 bg-pc-dark border border-gray-700 rounded-lg text-gray-100 focus:ring-2 focus:ring-pc-accent"
            />
          </div>

          {/* Consumo Energético */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Consumo Energético (W) *
            </label>
            <input
              type="number"
              name="ConsumoEnergetico"
              value={form.ConsumoEnergetico || ''}
              onChange={handleChange}
              placeholder="Ej: 125"
              className="w-full px-4 py-3 bg-pc-dark border border-gray-700 rounded-lg text-gray-100 focus:ring-2 focus:ring-pc-accent"
              min={1}
            />
          </div>

          {/* Precio */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Precio (USD) *
            </label>
            <input
              type="number"
              name="Precio"
              step="0.01"
              value={form.Precio ?? ''}
              onChange={handleChange}
              placeholder="Ej: 299.99"
              className="w-full px-4 py-3 bg-pc-dark border border-gray-700 rounded-lg text-gray-100 focus:ring-2 focus:ring-pc-accent"
              min={0.01}
            />
          </div>

          {/* Especificaciones */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Especificaciones Técnicas
            </label>
            <textarea
              name="Especificaciones"
              value={form.Especificaciones || ''}
              onChange={handleChange}
              rows={4}
              placeholder="Escribe las características técnicas del componente..."
              className="w-full px-4 py-3 bg-pc-dark border border-gray-700 rounded-lg text-gray-100 focus:ring-2 focus:ring-pc-accent resize-none"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSubmit}
              className="flex-1 bg-gradient-to-r from-pc-accent to-pc-accent-hover text-black py-3 rounded-lg font-semibold hover:opacity-90 transition"
            >
              💾 Guardar
            </button>
            <button
              onClick={onCerrar}
              className="px-6 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminComponentes;