import { useState, useEffect } from 'react';
import { listarUsuarios } from '../services/usuarios';
import type { Usuario } from '../services/usuarios';

function UsuariosList() {
  // Estado para guardar los usuarios
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  
  // Estado para manejar la carga
  const [cargando, setCargando] = useState(true);
  
  // Estado para manejar errores
  const [error, setError] = useState<string | null>(null);

  // useEffect: se ejecuta cuando el componente se monta (aparece en pantalla)
  useEffect(() => {
    cargarUsuarios();
  }, []); // [] significa "solo ejecutar una vez al montar"

  // Función para cargar usuarios desde el backend
  const cargarUsuarios = async () => {
    try {
      setCargando(true);
      setError(null);
      
      // Llamada a tu API
      const respuesta = await listarUsuarios();
      
      // Verificar si hubo error del backend
      if (respuesta.Error) {
        setError(respuesta.Error);
        return;
      }
      
      // Guardar usuarios en el estado
      setUsuarios(respuesta.Entidades || []);
      
    } catch (err) {
      // Error de red o del servidor
      setError('Error al conectar con el servidor');
      console.error('Error cargando usuarios:', err);
    } finally {
      setCargando(false);
    }
  };

  // Mostrar loading mientras carga
  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  // Mostrar error si ocurrió
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg max-w-md">
          <div className="flex items-center mb-2">
            <span className="text-2xl mr-2">⚠️</span>
            <h2 className="text-xl font-bold text-red-800">Error</h2>
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={cargarUsuarios}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Mostrar lista de usuarios
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Usuarios</h1>
              <p className="text-gray-600 mt-1">
                Total: {usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={cargarUsuarios}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <span>🔄</span>
              Actualizar
            </button>
          </div>
        </div>

        {/* Lista de usuarios */}
        {usuarios.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">No hay usuarios registrados</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {usuarios.map((usuario) => (
              <div
                key={usuario.Id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">
                        {usuario.Nombre?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">
                          {usuario.Nombre || 'Sin nombre'}
                        </h3>
                        <p className="text-gray-500 text-sm">ID: {usuario.Id}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <span className="font-semibold">📧 Correo:</span>
                        <span>{usuario.Correo || 'No especificado'}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-700">
                        <span className="font-semibold">📍 Dirección:</span>
                        <span>{usuario.Direccion || 'No especificada'}</span>
                      </div>
                      
                      {usuario._RolId && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <span className="font-semibold">👤 Rol:</span>
                          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                            {usuario._RolId.Nombre || 'Sin rol'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default UsuariosList;