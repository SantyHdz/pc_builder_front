import { useState, useEffect } from 'react'
import { loginUsuario, recuperarContrasena } from '../services/usuarios'
import type { Usuario } from '../services/usuarios'

interface LoginProps {
  onLoginSuccess: (usuario: Usuario) => void
  onCambiarARegistro: () => void
}

// 🔑 Claves para localStorage
const STORAGE_KEY_EMAIL = 'pcbuilder_email_recordado'
const STORAGE_KEY_PASSWORD = 'pcbuilder_password_recordada'
const STORAGE_KEY_RECORDAR = 'pcbuilder_recordar'

function Login({ onLoginSuccess, onCambiarARegistro }: LoginProps) {
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [recordarme, setRecordarme] = useState(false)
  
  // 🆕 Estados para recuperar contraseña
  const [mostrarRecuperacion, setMostrarRecuperacion] = useState(false)
  const [correoRecuperacion, setCorreoRecuperacion] = useState('')
  const [nuevaContrasena, setNuevaContrasena] = useState('')
  const [confirmarContrasena, setConfirmarContrasena] = useState('')
  const [cargandoRecuperacion, setCargandoRecuperacion] = useState(false)
  const [mensajeExito, setMensajeExito] = useState<string | null>(null)

  // 🆕 Cargar credenciales guardadas al montar el componente
  useEffect(() => {
    const emailGuardado = localStorage.getItem(STORAGE_KEY_EMAIL)
    const passwordGuardada = localStorage.getItem(STORAGE_KEY_PASSWORD)
    const debeRecordar = localStorage.getItem(STORAGE_KEY_RECORDAR) === 'true'

    if (debeRecordar && emailGuardado && passwordGuardada) {
      setCorreo(emailGuardado)
      setContrasena(passwordGuardada)
      setRecordarme(true)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!correo || !contrasena) return setError('Por favor completa todos los campos')

    try {
      setCargando(true)
      setError(null)
      const respuesta = await loginUsuario(correo, contrasena)
      
      if (respuesta.Error) return setError(respuesta.Error)
      
      if (respuesta.Entidad) {
        // 🆕 Guardar credenciales si "Recordarme" está activado
        if (recordarme) {
          localStorage.setItem(STORAGE_KEY_EMAIL, correo)
          localStorage.setItem(STORAGE_KEY_PASSWORD, contrasena)
          localStorage.setItem(STORAGE_KEY_RECORDAR, 'true')
        } else {
          // Limpiar credenciales guardadas si no quiere ser recordado
          localStorage.removeItem(STORAGE_KEY_EMAIL)
          localStorage.removeItem(STORAGE_KEY_PASSWORD)
          localStorage.removeItem(STORAGE_KEY_RECORDAR)
        }
        
        onLoginSuccess(respuesta.Entidad)
      } else {
        setError('Error al iniciar sesión')
      }
    } catch (err) {
      console.error('Error en login:', err)
      setError('Error de conexión con el servidor')
    } finally {
      setCargando(false)
    }
  }

  // 🆕 Función para recuperar contraseña
  const handleRecuperarContrasena = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validaciones
    if (!correoRecuperacion.trim()) {
      setError('Por favor ingresa tu correo electrónico')
      return
    }
    
    if (!nuevaContrasena.trim()) {
      setError('Por favor ingresa una nueva contraseña')
      return
    }
    
    if (nuevaContrasena.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    
    if (nuevaContrasena !== confirmarContrasena) {
      setError('Las contraseñas no coinciden')
      return
    }

    try {
      setCargandoRecuperacion(true)
      setError(null)
      setMensajeExito(null)
      
      const respuesta = await recuperarContrasena(correoRecuperacion, nuevaContrasena)
      
      if (respuesta.Error) {
        setError(respuesta.Error)
        return
      }
      
      // Éxito
      setMensajeExito('✅ Contraseña actualizada exitosamente. Ya puedes iniciar sesión.')
      
      // Limpiar formulario
      setCorreoRecuperacion('')
      setNuevaContrasena('')
      setConfirmarContrasena('')
      
      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        setMostrarRecuperacion(false)
        setMensajeExito(null)
      }, 2000)
      
    } catch (err: any) {
      setError(err.message || 'Error al recuperar contraseña')
    } finally {
      setCargandoRecuperacion(false)
    }
  }

  // 🆕 Función para abrir modal de recuperación
  const abrirModalRecuperacion = () => {
    setMostrarRecuperacion(true)
    setError(null)
    setMensajeExito(null)
    setCorreoRecuperacion('')
    setNuevaContrasena('')
    setConfirmarContrasena('')
  }

  return (
    <div className="min-h-screen flex bg-pc-dark text-gray-100">
      {/* Panel izquierdo con branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-pc-panel to-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_bottom_left,#00bcd4,transparent_70%)]" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="bg-pc-accent w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-pc-accent/30">
              <span className="font-bold text-xl text-black">
                <img 
                  src="/logo.png" 
                  alt="PC Builder" 
                  className="w-full h-full object-contain p-1.5"
                /></span>
            </div>
            <span className="font-bold text-2xl text-pc-accent">PC Builder</span>
          </div>

          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Bienvenido de nuevo 👋
          </h1>
          <p className="text-gray-400 max-w-md">
            Accede a tu cuenta para continuar diseñando y optimizando tus configuraciones personalizadas.
          </p>
        </div>

        <div className="relative z-10 mt-10 space-y-4">
          {[
            { icon: '⚙️', text: 'Sincroniza tus builds guardadas' },
            { icon: '🧩', text: 'Revisa compatibilidad en tiempo real' },
            { icon: '💰', text: 'Optimiza precio y rendimiento' },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3 text-gray-300">
              <div className="bg-pc-panel w-10 h-10 rounded-lg flex items-center justify-center text-lg text-pc-accent">
                {f.icon}
              </div>
              <span>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Panel derecho - Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-pc-panel">
        <div className="w-full max-w-md">
          {/* Header móvil */}
          <div className="lg:hidden mb-8 text-center">
            <div className="bg-pc-accent w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-pc-accent/40">
              <span className="font-bold text-2xl text-black"><img 
            src="/logo.png" 
            alt="PC Builder" 
            className="w-full h-full object-contain p-1.5"
          /></span>
            </div>
            <h2 className="text-2xl font-bold text-pc-accent">PC Builder</h2>
          </div>

          {/* Título */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Iniciar sesión</h2>
            <p className="text-gray-400">Ingresa tus credenciales para acceder a tu cuenta</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 bg-red-900/30 border-l-4 border-red-500 p-4 rounded-lg">
              <p className="text-red-400 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">📧</span>
                <input
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-pc-dark border border-gray-700 focus:ring-2 focus:ring-pc-accent focus:border-transparent transition text-gray-100 placeholder-gray-500"
                  placeholder="tu@email.com"
                  disabled={cargando}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">🔒</span>
                <input
                  type={mostrarPassword ? 'text' : 'password'}
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 rounded-xl bg-pc-dark border border-gray-700 focus:ring-2 focus:ring-pc-accent focus:border-transparent transition text-gray-100"
                  placeholder="••••••••"
                  disabled={cargando}
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {mostrarPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-400">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={recordarme}
                  onChange={(e) => setRecordarme(e.target.checked)}
                  className="w-4 h-4 text-pc-accent rounded focus:ring-2 focus:ring-pc-accent" 
                />
                <span>Recordarme</span>
              </label>
              <button 
                type="button" 
                onClick={abrirModalRecuperacion}
                className="text-pc-accent hover:text-pc-accent-hover font-medium"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-gradient-to-r from-pc-accent to-pc-accent-hover text-black py-3 rounded-xl font-semibold hover:opacity-90 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-pc-accent/30 mt-4"
            >
              {cargando ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span> Iniciando sesión...
                </span>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-700"></div>
            <span className="text-gray-500 text-sm">o</span>
            <div className="flex-1 h-px bg-gray-700"></div>
          </div>

          {/* Registro */}
          <div className="text-center">
            <p className="text-gray-400 mb-4">¿No tienes una cuenta?</p>
            <button
              onClick={onCambiarARegistro}
              className="text-pc-accent font-semibold hover:text-pc-accent-hover transition border-2 border-pc-accent px-6 py-2 rounded-xl hover:bg-pc-dark"
            >
              Crear cuenta →
            </button>
          </div>
        </div>
      </div>

      {/* 🆕 MODAL DE RECUPERACIÓN DE CONTRASEÑA */}
      {mostrarRecuperacion && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-pc-panel rounded-xl border border-gray-700 max-w-md w-full">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-2xl font-bold text-white">
                🔑 Recuperar Contraseña
              </h3>
            </div>

            <form onSubmit={handleRecuperarContrasena} className="p-6 space-y-4">
              {/* Mensaje de éxito */}
              {mensajeExito && (
                <div className="bg-green-900/30 border-l-4 border-green-500 p-4 rounded-lg">
                  <p className="text-green-400 text-sm font-medium">{mensajeExito}</p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="bg-red-900/30 border-l-4 border-red-500 p-4 rounded-lg">
                  <p className="text-red-400 text-sm font-medium">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Correo electrónico *
                </label>
                <input
                  type="email"
                  value={correoRecuperacion}
                  onChange={(e) => setCorreoRecuperacion(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full px-4 py-3 bg-pc-dark border border-gray-700 rounded-lg text-gray-100 focus:ring-2 focus:ring-pc-accent"
                  disabled={cargandoRecuperacion}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Nueva contraseña *
                </label>
                <input
                  type="password"
                  value={nuevaContrasena}
                  onChange={(e) => setNuevaContrasena(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-4 py-3 bg-pc-dark border border-gray-700 rounded-lg text-gray-100 focus:ring-2 focus:ring-pc-accent"
                  disabled={cargandoRecuperacion}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Confirmar contraseña *
                </label>
                <input
                  type="password"
                  value={confirmarContrasena}
                  onChange={(e) => setConfirmarContrasena(e.target.value)}
                  placeholder="Repite la contraseña"
                  className="w-full px-4 py-3 bg-pc-dark border border-gray-700 rounded-lg text-gray-100 focus:ring-2 focus:ring-pc-accent"
                  disabled={cargandoRecuperacion}
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={cargandoRecuperacion}
                  className="flex-1 bg-gradient-to-r from-pc-accent to-pc-accent-hover text-black py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
                >
                  {cargandoRecuperacion ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span> Actualizando...
                    </span>
                  ) : (
                    '💾 Cambiar Contraseña'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setMostrarRecuperacion(false)}
                  disabled={cargandoRecuperacion}
                  className="px-6 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Login