import { useState } from 'react'
import type { Usuario } from '../services/usuarios'
import UsuariosList from './UsuariosList'
import CatalogoComponentes from './CatalogoComponentes'
import AdminComponentes from './AdminComponentes'
import AdminTipos from './AdminTipos'
import ConstructorPC from './ConstructorPC'
import MisBuilds from './MisBuilds'

interface DashboardProps {
  usuario: Usuario
  onCerrarSesion: () => void
}

type Vista = 
  | 'inicio' 
  | 'catalogo' 
  | 'constructor' 
  | 'misbuilds' 
  | 'usuarios' 
  | 'componentes'
  | 'tipos'
  | 'estadisticas' 
  | 'configuracion'

function Dashboard({ usuario, onCerrarSesion }: DashboardProps) {
  const [vistaActual, setVistaActual] = useState<Vista>('inicio')
  const [menuAbierto, setMenuAbierto] = useState(true)

  const esAdmin = usuario._RolId?.Id === 1 || usuario._RolId?.Nombre?.toLowerCase() === 'administrador';

const menuItems = esAdmin ? [
  { id: 'inicio', icon: '🏠', label: 'Inicio', badge: null },
  { id: 'componentes', icon: '⚙️', label: 'Componentes', badge: null },
  { id: 'tipos', icon: '🏷️', label: 'Tipos', badge: null },
  { id: 'usuarios', icon: '👥', label: 'Usuarios', badge: null },
  { id: 'estadisticas', icon: '📊', label: 'Estadísticas', badge: null },
  { id: 'configuracion', icon: '⚙️', label: 'Configuración', badge: null },
] : [
  { id: 'inicio', icon: '🏠', label: 'Inicio', badge: null },
  { id: 'catalogo', icon: '🛒', label: 'Catálogo', badge: null },
  { id: 'constructor', icon: '🔧', label: 'Constructor', badge: null },
  { id: 'misbuilds', icon: '💾', label: 'Mis Builds', badge: '2' },
  { id: 'configuracion', icon: '⚙️', label: 'Configuración', badge: null },
];

  const renderContenido = () => {
  switch (vistaActual) {
    case 'inicio':
      return <ContenidoInicio usuario={usuario} />
    
    // Vistas de Usuario
    case 'catalogo':
      return <CatalogoComponentes />
    
    case 'constructor':
      return <ConstructorPC usuarioId={usuario.Id!} />
    
    case 'misbuilds':
      return <MisBuilds usuarioId={usuario.Id!} />
    
    // Vistas de Admin
    case 'componentes':
      return <AdminComponentes />
    
    case 'tipos':
      return <AdminTipos />
    
    case 'usuarios':
      return <UsuariosList />
    
    case 'estadisticas':
      return <ContenidoEstadisticas />
    
    case 'configuracion':
      return <ContenidoConfiguracion usuario={usuario} />
    
    default:
      return <ContenidoInicio usuario={usuario} />
  }
}

  return (
    <div className="min-h-screen flex bg-pc-dark text-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          menuAbierto ? 'w-64' : 'w-20'
        } bg-pc-panel border-r border-gray-700 transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="bg-pc-accent w-10 h-10 rounded-xl flex items-center justify-center text-black font-bold text-xl shadow-lg shadow-pc-accent/30">
              PC
            </div>
            {menuAbierto && (
              <span className="font-bold text-xl text-pc-accent">Builder</span>
            )}
          </div>
        </div>

        {/* Menú */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setVistaActual(item.id as Vista)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                vistaActual === item.id
                  ? 'bg-pc-accent/20 text-pc-accent'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              {menuAbierto && (
                <>
                  <span className="flex-1 text-left font-medium">
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className="bg-pc-accent text-black text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </nav>

        {/* Usuario y toggle */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-all mb-2 text-gray-400"
          >
            <span className="text-2xl">{menuAbierto ? '◀' : '▶'}</span>
            {menuAbierto && (
              <span className="font-medium">Contraer</span>
            )}
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-pc-panel border-b border-gray-700 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {menuItems.find((m) => m.id === vistaActual)?.label || 'Dashboard'}
              </h1>
              <p className="text-gray-500 text-sm">
                Bienvenido, {usuario.Nombre}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-gray-800 rounded-lg transition">
                <span className="text-2xl">🔔</span>
                <span className="absolute top-1 right-1 w-2 h-2 bg-pc-accent rounded-full"></span>
              </button>

              <div className="flex items-center gap-3 pl-4 border-l border-gray-700">
                <div className="bg-gradient-to-br from-pc-accent to-pc-accent-hover w-10 h-10 rounded-full flex items-center justify-center text-black font-bold">
                  {usuario.Nombre?.charAt(0).toUpperCase()}
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-100 text-sm">
                    {usuario.Nombre}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {usuario._RolId?.Nombre || 'Usuario'}
                  </p>
                </div>
                <button
                  onClick={onCerrarSesion}
                  className="ml-2 p-2 hover:bg-red-900/30 rounded-lg transition text-red-400"
                  title="Cerrar sesión"
                >
                  🚪
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Contenido */}
        <main className="flex-1 p-8 overflow-auto">{renderContenido()}</main>
      </div>
    </div>
  )
}

// === CONTENIDO PRINCIPAL ===

function ContenidoInicio({ usuario }: { usuario: Usuario }) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-pc-accent to-pc-accent-hover rounded-2xl p-8 text-black shadow-lg shadow-pc-accent/20">
        <h2 className="text-3xl font-bold mb-2">
          ¡Hola, {usuario.Nombre}! 👋
        </h2>
        <p className="text-black/80">
          Bienvenido a tu panel de control personalizado
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: '🧩', label: 'Builds creadas', value: 4 },
          { icon: '⚙️', label: 'Componentes guardados', value: 12 },
          { icon: '💰', label: 'Ahorro estimado', value: '$320' },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-pc-panel rounded-xl p-6 border border-gray-700 hover:border-pc-accent transition"
          >
            <div className="text-3xl mb-3">{stat.icon}</div>
            <p className="text-gray-400 text-sm">{stat.label}</p>
            <p className="text-2xl font-bold text-pc-accent">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function ContenidoEstadisticas() {
  return (
    <div className="bg-pc-panel rounded-xl p-6 border border-gray-700 text-gray-300">
      <h3 className="text-xl font-bold mb-4 text-pc-accent">📊 Estadísticas</h3>
      <p>Próximamente: gráficos de builds, precios y rendimiento.</p>
    </div>
  )
}

function ContenidoConfiguracion({ usuario }: { usuario: Usuario }) {
  return (
    <div className="bg-pc-panel rounded-xl p-6 border border-gray-700 text-gray-300">
      <h3 className="text-xl font-bold text-pc-accent mb-4">
        ⚙️ Configuración de perfil
      </h3>
      <div className="space-y-4">
        <input
          type="text"
          defaultValue={usuario.Nombre}
          className="w-full bg-pc-dark border border-gray-700 px-4 py-2 rounded-lg text-gray-100 focus:ring-2 focus:ring-pc-accent focus:border-transparent"
        />
        <input
          type="email"
          defaultValue={usuario.Correo}
          className="w-full bg-pc-dark border border-gray-700 px-4 py-2 rounded-lg text-gray-100 focus:ring-2 focus:ring-pc-accent focus:border-transparent"
        />
        <button className="bg-gradient-to-r from-pc-accent to-pc-accent-hover text-black px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition">
          Guardar cambios
        </button>
      </div>
    </div>
  )
}

export default Dashboard