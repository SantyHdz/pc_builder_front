import { useState, useEffect } from 'react';
import {
  obtenerBuildsPorUsuario,
  borrarBuild,
  type Build
} from '../services/builds';
import {
  obtenerComponentesPorBuild,
  type ComponenteEnBuild
} from '../services/componentesEnBuild';
import {
  listarComponentes,
  type Componente
} from '../services/componentes';

interface BuildConComponentes extends Build {
  componentes?: Componente[];
}

function MisBuilds({ usuarioId }: { usuarioId: number }) {
  const [builds, setBuilds] = useState<Build[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [buildSeleccionada, setBuildSeleccionada] = useState<Build | null>(null);

  useEffect(() => {
    cargarBuilds();
  }, []);
  

  useEffect(() => {
    cargarBuilds();
  }, []);

  const cargarBuilds = async () => {
    try {
      setCargando(true);
      setError(null);
      
      const resp = await obtenerBuildsPorUsuario(usuarioId);
      
      if (resp.Error) throw new Error(resp.Error);
      
      setBuilds(resp.Entidades || []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar builds');
    } finally {
      setCargando(false);
    }
  };

  const handleEliminar = async (build: Build) => {
    if (!confirm(`¿Eliminar la build "${build.Nombre}"?`)) return;

    try {
      const resp = await borrarBuild(build);
      if (resp.Error) throw new Error(resp.Error);
      
      await cargarBuilds();
      setBuildSeleccionada(null);
    } catch (err: any) {
      alert('Error al eliminar: ' + err.message);
    }
  };

  const formatearFecha = (fecha?: string) => {
    if (!fecha) return 'Sin fecha';
    try {
      return new Date(fecha).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return fecha;
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pc-accent mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando tus builds...</p>
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
              💾 Mis Configuraciones
            </h2>
            <p className="text-gray-400 text-sm">
              {builds.length} build{builds.length !== 1 ? 's' : ''} guardada{builds.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 border-l-4 border-red-500 p-4 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {builds.length === 0 ? (
        <div className="bg-pc-panel rounded-xl p-12 border border-gray-700 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-bold text-white mb-2">
            Aún no tienes builds guardadas
          </h3>
          <p className="text-gray-400 mb-6">
            Crea tu primera configuración usando el constructor
          </p>
          <button className="bg-gradient-to-r from-pc-accent to-pc-accent-hover text-black px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition">
            🔧 Ir al Constructor
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de builds */}
          <div className="lg:col-span-2 space-y-4">
            {builds.map((build) => (
              <div
                key={build.Id}
                className={`bg-pc-panel rounded-xl border transition cursor-pointer ${
                  buildSeleccionada?.Id === build.Id
                    ? 'border-pc-accent'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
                onClick={() => setBuildSeleccionada(build)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">
                        {build.Nombre}
                      </h3>
                      <div className="flex gap-3 text-sm">
                        <span className="text-gray-500">
                          📅 {formatearFecha(build.Fecha)}
                        </span>
                        <span className="text-gray-500">
                          • v{build.Version || '1.0'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        build.Estado === 'Activa'
                          ? 'bg-green-900/30 text-green-400'
                          : 'bg-gray-700 text-gray-400'
                      }`}>
                        {build.Estado || 'Activa'}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setBuildSeleccionada(build);
                      }}
                      className="text-pc-accent hover:text-pc-accent-hover text-sm font-medium transition"
                    >
                      👁️ Ver detalles
                    </button>
                    <span className="text-gray-700">•</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        alert('Función de compartir próximamente');
                      }}
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium transition"
                    >
                      🔗 Compartir
                    </button>
                    <span className="text-gray-700">•</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        alert('Exportar a PDF próximamente');
                      }}
                      className="text-purple-400 hover:text-purple-300 text-sm font-medium transition"
                    >
                      📄 Exportar PDF
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Panel de detalles */}
          <div className="lg:col-span-1">
            {buildSeleccionada ? (
              <div className="bg-pc-panel rounded-xl border border-gray-700 p-6 sticky top-6">
                <h3 className="text-lg font-bold text-white mb-4">
                  📋 Detalles
                </h3>

                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">NOMBRE</p>
                    <p className="text-white font-medium">{buildSeleccionada.Nombre}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">ESTADO</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      buildSeleccionada.Estado === 'Activa'
                        ? 'bg-green-900/30 text-green-400'
                        : 'bg-gray-700 text-gray-400'
                    }`}>
                      {buildSeleccionada.Estado || 'Activa'}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">FECHA DE CREACIÓN</p>
                    <p className="text-white">{formatearFecha(buildSeleccionada.Fecha)}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">VERSIÓN</p>
                    <p className="text-white">v{buildSeleccionada.Version || '1.0'}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">ID</p>
                    <p className="text-gray-400 text-sm">#{buildSeleccionada.Id}</p>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-gray-700">
                  <button
                    onClick={() => alert('Función de editar próximamente')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => alert('Función de duplicar próximamente')}
                    className="w-full bg-pc-dark hover:bg-gray-700 text-gray-300 py-2 rounded-lg font-medium transition"
                  >
                    📋 Duplicar
                  </button>
                  <button
                    onClick={() => handleEliminar(buildSeleccionada)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium transition"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-pc-panel rounded-xl border border-gray-700 p-12 text-center sticky top-6">
                <div className="text-4xl mb-3">👈</div>
                <p className="text-gray-400 text-sm">
                  Selecciona una build para ver los detalles
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MisBuilds;