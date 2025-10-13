import { useState } from 'react';
import Login from './components/Login';
import Registro from './components/Registro';
import Dashboard from './components/Dashboard';
import type { Usuario } from './services/usuarios';

function App() {
  const [usuarioActual, setUsuarioActual] = useState<Usuario | null>(null);
  const [vistaActual, setVistaActual] = useState<'login' | 'registro'>('login');

  const handleLoginSuccess = (usuario: Usuario) => {
    setUsuarioActual(usuario);
  };

  const handleRegistroSuccess = (usuario: Usuario) => {
    setUsuarioActual(usuario);
  };

  const handleCerrarSesion = () => {
    setUsuarioActual(null);
    setVistaActual('login');
  };

  // Si no hay usuario logueado, mostrar login o registro
  if (!usuarioActual) {
    if (vistaActual === 'login') {
      return (
        <Login
          onLoginSuccess={handleLoginSuccess}
          onCambiarARegistro={() => setVistaActual('registro')}
        />
      );
    } else {
      return (
        <Registro
          onRegistroSuccess={handleRegistroSuccess}
          onCambiarALogin={() => setVistaActual('login')}
        />
      );
    }
  }

  // Usuario logueado - Mostrar Dashboard completo
  return (
    <Dashboard
      usuario={usuarioActual}
      onCerrarSesion={handleCerrarSesion}
    />
  );
}

export default App;