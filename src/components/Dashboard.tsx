import { useState } from 'react'
import type { Usuario } from '../services/usuarios'
import UsuariosList from './UsuariosList'
import CatalogoComponentes from './CatalogoComponentes'
import AdminComponentes from './AdminComponentes'
import AdminTipos from './AdminTipos'
import ConstructorPC from './ConstructorPC'
import MisBuilds from './MisBuilds'
import { motion } from 'framer-motion'

import {
  Home,
  Cpu,
  Wrench,
  ShoppingCart,
  Layers,
  Users,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  HardDrive,
  Rocket,
  X
} from 'lucide-react'

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
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false)

  const esAdmin =
    usuario._RolId?.Id === 1 ||
    usuario._RolId?.Nombre?.toLowerCase() === 'administrador'

  const menuItems = esAdmin
    ? [
        { id: 'inicio', icon: <Home size={20} />, label: 'Inicio' },
        { id: 'componentes', icon: <Cpu size={20} />, label: 'Componentes' },
        { id: 'tipos', icon: <Layers size={20} />, label: 'Tipos' },
        { id: 'usuarios', icon: <Users size={20} />, label: 'Usuarios' },
        { id: 'estadisticas', icon: <BarChart3 size={20} />, label: 'Estadísticas' },
        { id: 'configuracion', icon: <Settings size={20} />, label: 'Configuración' },
      ]
    : [
        { id: 'inicio', icon: <Home size={20} />, label: 'Inicio' },
        { id: 'catalogo', icon: <ShoppingCart size={20} />, label: 'Catálogo' },
        { id: 'constructor', icon: <Wrench size={20} />, label: 'Constructor' },
        { id: 'misbuilds', icon: <HardDrive size={20} />, label: 'Mis Builds' },
        { id: 'configuracion', icon: <Settings size={20} />, label: 'Configuración' },
      ]

  const renderContenido = () => {
    switch (vistaActual) {
      case 'inicio':
        return <ContenidoInicio usuario={usuario} />
      case 'catalogo':
        return <CatalogoComponentes />
      case 'constructor':
        return <ConstructorPC usuarioId={usuario.Id!} />
      case 'misbuilds':
        return <MisBuilds usuarioId={usuario.Id!} />
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
        <div className="p-6 border-b border-gray-700 flex items-center gap-3">
          <div className="bg-pc-accent w-10 h-10 rounded-xl flex items-center justify-center text-black font-bold text-xl shadow-lg shadow-pc-accent/30">
            <img 
              src="/logo.png" 
              alt="PC Builder" 
              className="w-full h-full object-contain p-1"
            />
          </div>
          {menuAbierto && (
            <span className="font-bold text-xl text-pc-accent">PC Builder</span>
          )}
        </div>

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
              {item.icon}
              {menuAbierto && (
                <span className="flex-1 text-left font-medium">
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-all mb-2 text-gray-400"
          >
            {menuAbierto ? <ChevronLeft /> : <ChevronRight />}
            {menuAbierto && <span className="font-medium">Contraer</span>}
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col relative">
        <header className="bg-pc-panel border-b border-gray-700 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {menuItems.find((m) => m.id === vistaActual)?.label || 'Dashboard'}
              </h1>
              <p className="text-gray-500 text-sm">Bienvenido, {usuario.Nombre}</p>
            </div>

            <div className="flex items-center gap-4 relative">
              {/* Botón de Notificaciones */}
              <button
                className="relative p-2 hover:bg-gray-800 rounded-lg transition"
                onClick={() => setNotificacionesAbiertas(!notificacionesAbiertas)}
              >
                <Bell />
                <span className="absolute top-1 right-1 w-2 h-2 bg-pc-accent rounded-full"></span>
              </button>

              {/* Panel flotante de notificaciones */}
              {notificacionesAbiertas && (
                <div className="absolute right-0 top-12 bg-pc-panel border border-gray-700 rounded-xl shadow-xl w-72 z-50 p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-gray-100">Notificaciones</h4>
                    <button
                      onClick={() => setNotificacionesAbiertas(false)}
                      className="text-gray-500 hover:text-pc-accent"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="p-2 bg-gray-800/50 rounded-lg border border-gray-700">
                      Nueva build guardada correctamente ✅
                    </li>
                    <li className="p-2 bg-gray-800/50 rounded-lg border border-gray-700">
                      Se añadió un nuevo componente a tu catálogo 🧩
                    </li>
                  </ul>
                </div>
              )}

              {/* Perfil */}
              <div className="flex items-center gap-3 pl-4 border-l border-gray-700">
                <div className="bg-gradient-to-br from-pc-accent to-pc-accent-hover w-10 h-10 rounded-full flex items-center justify-center text-black font-bold">
                  {usuario.Nombre?.charAt(0).toUpperCase()}
                </div>
                {menuAbierto && (
                  <div className="text-right">
                    <p className="font-semibold text-gray-100 text-sm">
                      {usuario.Nombre}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {usuario._RolId?.Nombre || 'Usuario'}
                    </p>
                  </div>
                )}
                <button
                  onClick={onCerrarSesion}
                  className="ml-2 p-2 hover:bg-red-900/30 rounded-lg transition text-red-400"
                  title="Cerrar sesión"
                >
                  <LogOut />
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-auto">{renderContenido()}</main>
      </div>
    </div>
  )
}

/* === SUBSECCIONES === */

function ContenidoInicio({ usuario }: { usuario: Usuario }) {
  const secciones = [
    {
      titulo: 'Arma tu PC soñada',
      descripcion:
        'Combina componentes y descubre si son compatibles en tiempo real.',
      imagen:
        'https://plus.unsplash.com/premium_photo-1749687932602-93068c7af537?auto=format&fit=crop&q=80&w=1169',
      icono: <Cpu className="text-pc-accent" size={24} />,
    },
    {
      titulo: 'Explora el catálogo',
      descripcion:
        'Más de 100 componentes actualizados con precios y especificaciones.',
      imagen:
        'https://images.unsplash.com/photo-1593642532871-8b12e02d091c?auto=format&fit=crop&w=800&q=80',
      icono: <ShoppingCart className="text-pc-accent" size={24} />,
    },
    {
      titulo: 'Optimiza tu rendimiento',
      descripcion:
        'Compara builds, analiza consumo y rendimiento antes de comprar.',
      imagen:
        'https://images.unsplash.com/photo-1674027001834-719c347d1eca?auto=format&fit=crop&q=80&w=1632',
      icono: <Rocket className="text-pc-accent" size={24} />,
    },
  ]

  return (
    <div className="space-y-12">
      <motion.div
        className="bg-gradient-to-r from-pc-accent to-pc-accent-hover rounded-2xl p-10 text-black shadow-lg shadow-pc-accent/20 flex flex-col md:flex-row items-center justify-between gap-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h2 className="text-4xl font-bold mb-3">
            ¡Bienvenido, {usuario.Nombre}! 👋
          </h2>
          <p className="text-black/80 text-lg">
            Arma, valida y comparte tus builds como un profesional del hardware.
          </p>
        </div>
      </motion.div>

      {/* Secciones destacadas */}
      <div className="grid md:grid-cols-3 gap-8">
        {secciones.map((sec, i) => (
          <motion.div
            key={i}
            className="bg-pc-panel rounded-2xl overflow-hidden border border-gray-700 hover:border-pc-accent transition group"
            whileHover={{ scale: 1.02 }}
          >
            <div className="h-48 overflow-hidden">
              <img
                src={sec.imagen}
                alt={sec.titulo}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                {sec.icono}
                <h3 className="text-lg font-bold text-gray-100">{sec.titulo}</h3>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                {sec.descripcion}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="bg-pc-panel border border-gray-700 rounded-2xl p-10 text-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-2xl font-bold mb-3 text-pc-accent">
          🚀 ¡Comienza a construir tu primera PC!
        </h3>
        <p className="text-gray-400 mb-6">
          Usa nuestro constructor interactivo y descubre la magia del hardware.
        </p>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-pc-accent to-pc-accent-hover text-black px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition"
          onClick={() => alert('¡Vamos al Constructor!')}
        >
          Ir al Constructor
        </motion.button>
      </motion.div>
    </div>
  )
}

function ContenidoEstadisticas() {
  return (
    <div className="bg-pc-panel rounded-xl p-6 border border-gray-700 text-gray-300">
      <h3 className="text-xl font-bold mb-4 text-pc-accent">📊 Estadísticas</h3>
      <p>Próximamente: gráficos interactivos sobre builds, precios y rendimiento.</p>
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