import { useState } from 'react'
import { registrarUsuario } from '../services/usuarios'
import type { Usuario } from '../services/usuarios'

interface RegistroProps {
  onRegistroSuccess: (usuario: Usuario) => void
  onCambiarALogin: () => void
}

function Registro({ onRegistroSuccess, onCambiarALogin }: RegistroProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    contrasena: '',
    confirmarContrasena: '',
    direccion: '',
  })
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mostrarPassword, setMostrarPassword] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleRegistro = async () => {
    setError(null)
    if (!formData.nombre || !formData.correo || !formData.contrasena)
      return setError('Por favor completa todos los campos obligatorios')

    if (formData.contrasena !== formData.confirmarContrasena)
      return setError('Las contraseñas no coinciden')

    if (formData.contrasena.length < 6)
      return setError('La contraseña debe tener al menos 6 caracteres')

    try {
      setCargando(true)
      const nuevoUsuario: Usuario = {
        Nombre: formData.nombre,
        Correo: formData.correo,
        ContrasenaHash: formData.contrasena,
        Direccion: formData.direccion || '',
        RolId: 2,
      }
      const respuesta = await registrarUsuario(nuevoUsuario)
      if (respuesta.Error) return setError(respuesta.Error)
      if (respuesta.Entidad) onRegistroSuccess(respuesta.Entidad)
    } catch {
      setError('Error de conexión con el servidor')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-pc-dark text-gray-100">
      {/* Lado izquierdo con branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden bg-gradient-to-br from-pc-panel to-black">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,#00bcd4,transparent_70%)]" />
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
            <span className="font-bold text-2xl text-pc-accent">
              PC Builder
            </span>
          </div>

          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Arma tu PC como un profesional
          </h1>
          <p className="text-gray-400 max-w-md">
            Regístrate para crear configuraciones personalizadas, validar compatibilidades
            y descubrir el mejor rendimiento por cada componente.
          </p>
        </div>

        <div className="relative z-10 mt-10 space-y-4">
          {[
            { icon: '🧠', text: 'Validación de compatibilidad en tiempo real' },
            { icon: '⚙️', text: 'Más de 10 000 componentes actualizados' },
            { icon: '💡', text: 'Calcula costo y consumo energético' },
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

      {/* Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-pc-panel">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <div className="bg-pc-accent w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-pc-accent/40">
              <span className="font-bold text-2xl text-black">PC</span>
            </div>
            <h2 className="text-2xl font-bold text-pc-accent">PC Builder</h2>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Crear cuenta
            </h2>
            <p className="text-gray-400">
              Empieza a diseñar tu configuración personalizada
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-900/30 border-l-4 border-red-500 p-4 rounded-lg">
              <p className="text-red-400 text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {[
              { name: 'nombre', label: 'Nombre completo *', icon: '👤', type: 'text' },
              { name: 'correo', label: 'Correo electrónico *', icon: '📧', type: 'email' },
              { name: 'direccion', label: 'Dirección', icon: '📍', type: 'text' },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  {field.label}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
                    {field.icon}
                  </span>
                  <input
                    {...field}
                    value={(formData as any)[field.name]}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-pc-dark border border-gray-700 focus:ring-2 focus:ring-pc-accent focus:border-transparent transition text-gray-100 placeholder-gray-500"
                    disabled={cargando}
                    placeholder={field.label.replace('*', '')}
                  />
                </div>
              </div>
            ))}

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Contraseña *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
                  🔒
                </span>
                <input
                  type={mostrarPassword ? 'text' : 'password'}
                  name="contrasena"
                  value={formData.contrasena}
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-3 rounded-xl bg-pc-dark border border-gray-700 focus:ring-2 focus:ring-pc-accent text-gray-100"
                  placeholder="Mínimo 6 caracteres"
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

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Confirmar contraseña *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
                  🔒
                </span>
                <input
                  type={mostrarPassword ? 'text' : 'password'}
                  name="confirmarContrasena"
                  value={formData.confirmarContrasena}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-pc-dark border border-gray-700 focus:ring-2 focus:ring-pc-accent text-gray-100"
                  placeholder="Repite tu contraseña"
                  disabled={cargando}
                />
              </div>
            </div>

            <button
              onClick={handleRegistro}
              disabled={cargando}
              className="w-full bg-gradient-to-r from-pc-accent to-pc-accent-hover text-black py-3 rounded-xl font-semibold hover:opacity-90 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-pc-accent/30 mt-6"
            >
              {cargando ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span> Creando cuenta...
                </span>
              ) : (
                'Crear Cuenta'
              )}
            </button>
          </div>

          <div className="my-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-700"></div>
            <span className="text-gray-500 text-sm">o</span>
            <div className="flex-1 h-px bg-gray-700"></div>
          </div>

          <div className="text-center">
            <p className="text-gray-400 mb-4">¿Ya tienes una cuenta?</p>
            <button
              onClick={onCambiarALogin}
              className="text-pc-accent font-semibold hover:text-pc-accent-hover transition border-2 border-pc-accent px-6 py-2 rounded-xl hover:bg-pc-dark"
            >
              Iniciar sesión →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Registro