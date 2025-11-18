import { useState, useEffect } from 'react';
import { 
  listarComponentes,
  filtrarComponentesPorTipo,
  obtenerCompatibles,
  type Componente 
} from '../services/componentes';
import { 
  listarTiposComponentes,
  type TipoComponente 
} from '../services/tiposComponentes';
import { 
  guardarBuild,
  type Build 
} from '../services/builds';
import {
  guardarComponenteEnBuild,
  type ComponenteEnBuild
} from '../services/componentesEnBuild';

interface ComponenteSeleccionado {
  tipo: TipoComponente;
  componente: Componente | null;
}

function ConstructorPC({ usuarioId }: { usuarioId: number }) {
  const [tipos, setTipos] = useState<TipoComponente[]>([]);
  const [seleccion, setSeleccion] = useState<ComponenteSeleccionado[]>([]);
  const [pasoActual, setPasoActual] = useState(0);
  const [componentesDisponibles, setComponentesDisponibles] = useState<Componente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [nombreBuild, setNombreBuild] = useState('');
  const [modalGuardar, setModalGuardar] = useState(false);
  const [alertaCompatibilidad, setAlertaCompatibilidad] = useState<string | null>(null);

  useEffect(() => {
    cargarTipos();
  }, []);

  const cargarTipos = async () => {
    try {
      const resp = await listarTiposComponentes();
      if (resp.Error) throw new Error(resp.Error);
      
      const tiposData = resp.Entidades || [];
      
      const ordenPreferido = ['Motherboard', 'Placa Madre', 'Procesador', 'CPU', 'RAM', 'Memoria', 'GPU', 'Tarjeta Gráfica', 'Almacenamiento', 'Fuente', 'Gabinete'];
      
      const tiposOrdenados = tiposData.sort((a, b) => {
        const indexA = ordenPreferido.findIndex(nombre => 
          a.Nombre?.toLowerCase().includes(nombre.toLowerCase())
        );
        const indexB = ordenPreferido.findIndex(nombre => 
          b.Nombre?.toLowerCase().includes(nombre.toLowerCase())
        );
        
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
      
      setTipos(tiposOrdenados);
      setSeleccion(tiposOrdenados.map(tipo => ({
        tipo,
        componente: null
      })));
      
      if (tiposOrdenados.length > 0) {
        cargarComponentesPorPaso(0, tiposOrdenados);
      }
      
      setCargando(false);
    } catch (err) {
      console.error('Error cargando tipos:', err);
      setCargando(false);
    }
  };

  const cargarComponentesPorPaso = async (paso: number, tiposLista = tipos) => {
    if (paso >= tiposLista.length) return;
    
    setCargando(true);
    setAlertaCompatibilidad(null);
    
    try {
      const tipoActual = tiposLista[paso];
      
      if (paso === 0) {
        const resp = tipoActual.Id 
          ? await filtrarComponentesPorTipo(tipoActual.Id)
          : await listarComponentes();
        
        if (resp.Error) throw new Error(resp.Error);
        setComponentesDisponibles(resp.Entidades || []);
      } else {
        const componenteAnterior = seleccion[paso - 1]?.componente;
        
        if (!componenteAnterior || !componenteAnterior.Id) {
          const resp = tipoActual.Id 
            ? await filtrarComponentesPorTipo(tipoActual.Id)
            : await listarComponentes();
          
          if (resp.Error) throw new Error(resp.Error);
          setComponentesDisponibles(resp.Entidades || []);
          setAlertaCompatibilidad('ℹ️ Mostrando todos los componentes. Selecciona componentes previos para ver solo compatibles.');
        } else {
          const resp = await obtenerCompatibles(componenteAnterior.Id);
          
          if (resp.Error) throw new Error(resp.Error);
          
          const compatibles = resp.Entidades || [];
          const compatiblesPorTipo = compatibles.filter(c => c.TipoId === tipoActual.Id);
          
          if (compatiblesPorTipo.length === 0) {
            setAlertaCompatibilidad(`⚠️ No hay ${tipoActual.Nombre}s compatibles con "${componenteAnterior.Nombre}". Mostrando todos.`);
            
            const respTodos = tipoActual.Id 
              ? await filtrarComponentesPorTipo(tipoActual.Id)
              : await listarComponentes();
            
            setComponentesDisponibles(respTodos.Entidades || []);
          } else {
            setComponentesDisponibles(compatiblesPorTipo);
            setAlertaCompatibilidad(`✓ Mostrando ${compatiblesPorTipo.length} ${tipoActual.Nombre}(s) compatible(s) con "${componenteAnterior.Nombre}"`);
          }
        }
      }
    } catch (err) {
      console.error('Error cargando componentes:', err);
      setAlertaCompatibilidad('❌ Error al cargar componentes');
    } finally {
      setCargando(false);
    }
  };

  const seleccionarComponente = (componente: Componente) => {
    setSeleccion(prev => prev.map((item, idx) => 
      idx === pasoActual 
        ? { ...item, componente }
        : item
    ));
    
    if (pasoActual < tipos.length - 1) {
      const siguientePaso = pasoActual + 1;
      setPasoActual(siguientePaso);
      cargarComponentesPorPaso(siguientePaso);
    }
  };

  const cambiarPaso = (paso: number) => {
    if (paso < 0 || paso >= tipos.length) return;
    setPasoActual(paso);
    cargarComponentesPorPaso(paso);
  };

  const quitarComponente = (paso: number) => {
    setSeleccion(prev => prev.map((item, idx) => 
      idx === paso 
        ? { ...item, componente: null }
        : item
    ));
    
    if (paso < pasoActual) {
      setPasoActual(paso);
      cargarComponentesPorPaso(paso);
    }
  };

  // 🆕 FUNCIÓN ACTUALIZADA: Calcular precio total
  const calcularTotal = () => {
    return seleccion.reduce((total, item) => {
      const precio = item.componente?.Precio || 0;
      return total + precio;
    }, 0);
  };

  // 🆕 NUEVA FUNCIÓN: Calcular consumo energético total
  const calcularConsumoTotal = () => {
    return seleccion.reduce((total, item) => {
      const consumo = item.componente?.ConsumoEnergetico || 0;
      return total + consumo;
    }, 0);
  };

  const handleGuardar = async () => {
    if (!nombreBuild.trim()) {
      alert('Por favor ingresa un nombre para tu build');
      return;
    }

    const componentesSeleccionados = seleccion.filter(s => s.componente !== null);
    
    if (componentesSeleccionados.length === 0) {
      alert('Debes seleccionar al menos un componente');
      return;
    }

    try {
      setGuardando(true);
      
      const build: Build = {
        UsuarioId: usuarioId,
        Nombre: nombreBuild,
        Version: '1.0',
        Estado: 'Activa',
        Fecha: new Date().toISOString()
      };

      const respBuild = await guardarBuild(build);
      
      if (respBuild.Error) throw new Error(respBuild.Error);
      if (!respBuild.Entidad?.Id) throw new Error('No se obtuvo ID de la build');
      
      const buildId = respBuild.Entidad.Id;
      
      for (const item of componentesSeleccionados) {
        if (!item.componente?.Id) continue;
        
        const componenteEnBuild: ComponenteEnBuild = {
          BuildId: buildId,
          ComponenteId: item.componente.Id,
          Cantidad: 1
        };
        
        const respComp = await guardarComponenteEnBuild(componenteEnBuild);
        if (respComp.Error) {
          console.error('Error guardando componente:', respComp.Error);
        }
      }
      
      alert('¡Build guardada exitosamente!');
      setModalGuardar(false);
      limpiarBuild();
    } catch (err: any) {
      alert('Error al guardar: ' + err.message);
      console.error('Error completo:', err);
    } finally {
      setGuardando(false);
    }
  };

  const limpiarBuild = () => {
    setSeleccion(tipos.map(tipo => ({
      tipo,
      componente: null
    })));
    setNombreBuild('');
    setPasoActual(0);
    cargarComponentesPorPaso(0);
  };

  const componentesSeleccionados = seleccion.filter(s => s.componente !== null).length;
  const progreso = (componentesSeleccionados / tipos.length) * 100;
  const precioTotal = calcularTotal();
  const consumoTotal = calcularConsumoTotal();

  if (cargando && tipos.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pc-accent mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando constructor...</p>
        </div>
      </div>
    );
  }

  const tipoActual = tipos[pasoActual];

  return (
    <div className="space-y-6">
      {/* Header con progreso */}
      <div className="bg-gradient-to-r from-pc-panel to-pc-dark rounded-2xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              🔧 Constructor de PC
            </h2>
            <p className="text-gray-400 text-sm">
              Paso {pasoActual + 1} de {tipos.length}: {tipoActual?.Nombre || 'Cargando...'}
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={limpiarBuild}
              disabled={componentesSeleccionados === 0}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🗑️ Limpiar
            </button>
            <button
              onClick={() => setModalGuardar(true)}
              disabled={componentesSeleccionados === 0}
              className="bg-gradient-to-r from-pc-accent to-pc-accent-hover text-black px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-pc-accent/30"
            >
              💾 Guardar Build
            </button>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="bg-pc-dark rounded-full h-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-pc-accent to-pc-accent-hover h-full transition-all duration-500"
            style={{ width: `${progreso}%` }}
          />
        </div>
        
        <div className="mt-2 text-right text-sm text-gray-400">
          {componentesSeleccionados} / {tipos.length} componentes
        </div>
      </div>

      {/* Stepper de pasos */}
      <div className="bg-pc-panel rounded-xl p-4 border border-gray-700">
        <div className="flex items-center justify-between overflow-x-auto pb-2">
          {tipos.map((tipo, idx) => {
            const item = seleccion[idx];
            const completado = item?.componente !== null;
            const actual = idx === pasoActual;

            return (
              <div key={tipo.Id} className="flex items-center">
                <button
                  onClick={() => cambiarPaso(idx)}
                  className={`flex flex-col items-center min-w-[80px] px-2 py-2 rounded-lg transition ${
                    actual
                      ? 'bg-pc-accent text-black'
                      : completado
                      ? 'bg-green-900/30 text-green-400'
                      : 'bg-pc-dark text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                    actual
                      ? 'bg-black/20'
                      : completado
                      ? 'bg-green-700'
                      : 'bg-gray-700'
                  }`}>
                    {completado ? '✓' : idx + 1}
                  </div>
                  <span className="text-xs font-medium text-center">
                    {tipo.Nombre}
                  </span>
                </button>
                
                {idx < tipos.length - 1 && (
                  <div className="w-8 h-0.5 bg-gray-700 mx-1" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel izquierdo: Lista de selección */}
        <div className="lg:col-span-1">
          <div className="bg-pc-panel rounded-xl p-4 border border-gray-700">
            <h3 className="font-bold text-white mb-4">
              📋 Tu Configuración
            </h3>
            
            {componentesSeleccionados === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">Comienza seleccionando componentes</p>
              </div>
            ) : (
              <div className="space-y-2">
                {seleccion.map((item, idx) => (
                  item.componente && (
                    <div
                      key={item.tipo.Id}
                      className="bg-pc-dark rounded-lg p-3 border border-gray-700"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="text-xs text-pc-accent font-semibold mb-1">
                            {item.tipo.Nombre}
                          </div>
                          <div className="text-sm text-white font-medium">
                            {item.componente.Nombre}
                          </div>
                          {item.componente.Marca && (
                            <div className="text-xs text-gray-500 mt-1">
                              {item.componente.Marca}
                            </div>
                          )}
                          {/* 🆕 Mostrar precio y consumo individual */}
                          <div className="flex gap-3 mt-2 text-xs">
                            {item.componente.Precio !== undefined && item.componente.Precio !== null && (
                              <span className="text-green-400">
                                💰 ${item.componente.Precio.toFixed(2)}
                              </span>
                            )}
                            {item.componente.ConsumoEnergetico !== undefined && item.componente.ConsumoEnergetico !== null && (
                              <span className="text-yellow-400">
                                ⚡ {item.componente.ConsumoEnergetico}W
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => quitarComponente(idx)}
                          className="text-red-400 hover:text-red-300 transition ml-2"
                          title="Quitar"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}
            
            {/* 🆕 Resumen mejorado con totales */}
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="space-y-3 text-sm">
                {/* Precio Total */}
                <div className="flex justify-between items-center p-3 bg-green-900/20 rounded-lg border border-green-700">
                  <span className="text-gray-300 flex items-center gap-2">
                    <span className="text-lg">💰</span>
                    Precio Total:
                  </span>
                  <span className="font-bold text-xl text-green-400">
                    ${precioTotal.toFixed(2)}
                  </span>
                </div>

                {/* Consumo Total */}
                <div className="flex justify-between items-center p-3 bg-yellow-900/20 rounded-lg border border-yellow-700">
                  <span className="text-gray-300 flex items-center gap-2">
                    <span className="text-lg">⚡</span>
                    Consumo Total:
                  </span>
                  <span className="font-bold text-xl text-yellow-400">
                    {consumoTotal}W
                  </span>
                </div>

                {/* 🆕 Recomendación de fuente de poder */}
                {consumoTotal > 0 && (
                  <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-700">
                    <p className="text-xs text-blue-300">
                      💡 <strong>Recomendación:</strong> Fuente de poder de al menos {Math.ceil(consumoTotal * 1.2)}W
                      <br />
                      <span className="text-gray-400">(20% de margen de seguridad)</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Panel central: Selección de componentes */}
        <div className="lg:col-span-2">
          <div className="bg-pc-panel rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">
                Seleccionar {tipoActual?.Nombre}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => cambiarPaso(pasoActual - 1)}
                  disabled={pasoActual === 0}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Anterior
                </button>
                <button
                  onClick={() => cambiarPaso(pasoActual + 1)}
                  disabled={pasoActual >= tipos.length - 1}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente →
                </button>
              </div>
            </div>

            {/* Alerta de compatibilidad */}
            {alertaCompatibilidad && (
              <div className={`mb-4 p-3 rounded-lg border ${
                alertaCompatibilidad.includes('✓')
                  ? 'bg-green-900/20 border-green-700 text-green-400'
                  : alertaCompatibilidad.includes('⚠️')
                  ? 'bg-yellow-900/20 border-yellow-700 text-yellow-400'
                  : 'bg-blue-900/20 border-blue-700 text-blue-400'
              }`}>
                <p className="text-sm">{alertaCompatibilidad}</p>
              </div>
            )}

            {cargando ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-pc-accent mx-auto mb-3"></div>
                <p className="text-gray-400">Cargando componentes...</p>
              </div>
            ) : componentesDisponibles.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No hay componentes disponibles</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
                {componentesDisponibles.map((comp) => (
                  <button
                    key={comp.Id}
                    onClick={() => seleccionarComponente(comp)}
                    className="text-left bg-pc-dark hover:bg-gray-800 border border-gray-700 hover:border-pc-accent rounded-lg p-4 transition"
                  >
                    <h4 className="font-semibold text-white mb-2">
                      {comp.Nombre}
                    </h4>
                    <div className="flex gap-2 mb-2 flex-wrap">
                      {comp.Marca && (
                        <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-400">
                          {comp.Marca}
                        </span>
                      )}
                      {comp.Modelo && (
                        <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-400">
                          {comp.Modelo}
                        </span>
                      )}
                    </div>

                    {/* 🆕 Mostrar precio y consumo en tarjetas */}
                    <div className="flex gap-3 mb-2">
                      {comp.Precio !== undefined && comp.Precio !== null && (
                        <span className="text-sm text-green-400 font-semibold">
                          💰 ${comp.Precio.toFixed(2)}
                        </span>
                      )}
                      {comp.ConsumoEnergetico !== undefined && comp.ConsumoEnergetico !== null && (
                        <span className="text-sm text-yellow-400 font-semibold">
                          ⚡ {comp.ConsumoEnergetico}W
                        </span>
                      )}
                    </div>

                    {comp.Especificaciones && (
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {comp.Especificaciones}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal para guardar */}
      {modalGuardar && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-pc-panel rounded-xl border border-gray-700 max-w-md w-full">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-2xl font-bold text-white">
                💾 Guardar Build
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Nombre de la configuración *
                </label>
                <input
                  type="text"
                  value={nombreBuild}
                  onChange={(e) => setNombreBuild(e.target.value)}
                  placeholder="Ej: Mi PC Gaming 2025"
                  className="w-full px-4 py-3 bg-pc-dark border border-gray-700 rounded-lg text-gray-100 focus:ring-2 focus:ring-pc-accent"
                  autoFocus
                />
              </div>

              <div className="bg-pc-dark rounded-lg p-4 border border-gray-700">
                <p className="text-sm text-gray-400 mb-2">
                  Se guardarán {componentesSeleccionados} componentes:
                </p>
                <ul className="space-y-1 text-sm text-gray-300 max-h-48 overflow-y-auto">
                  {seleccion.filter(s => s.componente).map((item) => (
                    <li key={item.tipo.Id} className="flex items-start gap-2">
                      <span className="text-pc-accent">✓</span>
                      <span>
                        <strong>{item.tipo.Nombre}:</strong> {item.componente?.Nombre}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* 🆕 Resumen de totales en modal */}
                <div className="mt-4 pt-4 border-t border-gray-700 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">💰 Precio Total:</span>
                    <span className="font-bold text-green-400">${precioTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">⚡ Consumo Total:</span>
                    <span className="font-bold text-yellow-400">{consumoTotal}W</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleGuardar}
                  disabled={guardando}
                  className="flex-1 bg-gradient-to-r from-pc-accent to-pc-accent-hover text-black py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
                >
                  {guardando ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span> Guardando...
                    </span>
                  ) : (
                    '💾 Guardar'
                  )}
                </button>
                <button
                  onClick={() => setModalGuardar(false)}
                  disabled={guardando}
                  className="px-6 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ConstructorPC;