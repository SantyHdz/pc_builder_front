import { useState, useEffect } from 'react';
import { 
  listarComponentes, 
  filtrarComponentesPorTipo,
  type Componente 
} from '../services/componentes';
import { 
  listarTiposComponentes,
  type TipoComponente 
} from '../services/tiposComponentes';

function CatalogoComponentes() {
  const [componentes, setComponentes] = useState<Componente[]>([]);
  const [tipos, setTipos] = useState<TipoComponente[]>([]);
  const [tipoSeleccionado, setTipoSeleccionado] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    cargarTipos();
    cargarComponentes();
  }, []);

  const cargarTipos = async () => {
    try {
      const resp = await listarTiposComponentes();
      if (resp.Error) {
        console.error('Error cargando tipos:', resp.Error);
        return;
      }
      setTipos(resp.Entidades || []);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const cargarComponentes = async (tipoId?: number) => {
    try {
      setCargando(true);
      setError(null);
      
      const resp = tipoId 
        ? await filtrarComponentesPorTipo(tipoId)
        : await listarComponentes();
      
      if (resp.Error) {
        setError(resp.Error);
        return;
      }
      
      setComponentes(resp.Entidades || []);
    } catch (err) {
      setError('Error al cargar componentes');
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const handleFiltroTipo = (tipoId: number | null) => {
    setTipoSeleccionado(tipoId);
    if (tipoId === null) {
      cargarComponentes();
    } else {
      cargarComponentes(tipoId);
    }
  };

  // Filtrar por búsqueda en el frontend
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
          <p className="text-gray-400">Cargando catálogo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con búsqueda */}
      <div className="bg-pc-panel rounded-xl p-6 border border-gray-700">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              🛒 Catálogo de Componentes
            </h2>
            <p className="text-gray-400 text-sm">
              {componentesFiltrados.length} componente(s) disponible(s)
            </p>
          </div>
          
          {/* Barra de búsqueda */}
          <div className="relative w-full md:w-96">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
              🔍
            </span>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, marca o modelo..."
              className="w-full pl-12 pr-4 py-3 bg-pc-dark border border-gray-700 rounded-lg text-gray-100 focus:ring-2 focus:ring-pc-accent focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Filtros por tipo */}
      <div className="bg-pc-panel rounded-xl p-6 border border-gray-700">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">
          FILTRAR POR CATEGORÍA
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleFiltroTipo(null)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              tipoSeleccionado === null
                ? 'bg-pc-accent text-black'
                : 'bg-pc-dark text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            🔷 Todos
          </button>
          {tipos.map((tipo) => (
            <button
              key={tipo.Id}
              onClick={() => handleFiltroTipo(tipo.Id!)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                tipoSeleccionado === tipo.Id
                  ? 'bg-pc-accent text-black'
                  : 'bg-pc-dark text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {tipo.Nombre}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900/30 border-l-4 border-red-500 p-4 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Grid de componentes */}
      {componentesFiltrados.length === 0 ? (
        <div className="bg-pc-panel rounded-xl p-12 border border-gray-700 text-center">
          <p className="text-gray-500 text-lg">
            {busqueda 
              ? '🔍 No se encontraron componentes con ese criterio'
              : '📦 No hay componentes disponibles'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {componentesFiltrados.map((componente) => (
            <ComponenteCard key={componente.Id} componente={componente} />
          ))}
        </div>
      )}
    </div>
  );
}

// Tarjeta individual de componente
function ComponenteCard({ componente }: { componente: Componente }) {
  const [mostrarDetalles, setMostrarDetalles] = useState(false);

  return (
    <div className="bg-pc-panel rounded-xl border border-gray-700 hover:border-pc-accent transition-all overflow-hidden group">
      {/* Imagen placeholder */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 h-48 flex items-center justify-center">
        <span className="text-6xl opacity-50">⚙️</span>
      </div>

      <div className="p-5">
        {/* Título */}
        <h3 className="font-bold text-lg text-white mb-1 line-clamp-2">
          {componente.Nombre || 'Sin nombre'}
        </h3>
        
        {/* Marca y Modelo */}
        <div className="flex gap-2 mb-3">
          {componente.Marca && (
            <span className="text-xs bg-pc-dark px-2 py-1 rounded text-gray-400">
              {componente.Marca}
            </span>
          )}
          {componente.Modelo && (
            <span className="text-xs bg-pc-dark px-2 py-1 rounded text-gray-400">
              {componente.Modelo}
            </span>
          )}
        </div>

        {/* Especificaciones */}
        {componente.Especificaciones && (
          <div className="mb-4">
            <p className={`text-sm text-gray-400 ${
              mostrarDetalles ? '' : 'line-clamp-2'
            }`}>
              {componente.Especificaciones}
            </p>
            <button
              onClick={() => setMostrarDetalles(!mostrarDetalles)}
              className="text-pc-accent text-xs mt-1 hover:underline"
            >
              {mostrarDetalles ? 'Ver menos' : 'Ver más'}
            </button>
          </div>
        )}

        {/* Acciones */}
        <div className="flex gap-2 mt-4">
          <button className="flex-1 bg-pc-accent hover:bg-pc-accent-hover text-black font-semibold py-2 rounded-lg transition">
            ➕ Agregar
          </button>
          <button className="px-4 bg-pc-dark hover:bg-gray-700 text-gray-300 rounded-lg transition">
            ℹ️
          </button>
        </div>
      </div>
    </div>
  );
}

export default CatalogoComponentes;