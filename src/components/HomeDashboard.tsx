import React, { useState, useEffect } from 'react';
import { useSettings } from '../utils/settingsContext';
import { 
  Flame, 
  Sparkles, 
  Check, 
  Zap, 
  ArrowRight,
  RefreshCw,
  Sliders,
  ShieldCheck,
  Radio,
  SlidersHorizontal,
  Server,
  Settings
} from 'lucide-react';
import { AdminPanel, OptionItem } from './AdminPanel';

export type FreeFireVersion = 'normal' | 'max';

export const HomeDashboard: React.FC = () => {
  const { theme } = useSettings();
  
  const [selectedGame, setSelectedGame] = useState<FreeFireVersion | null>(() => {
    try {
      return (localStorage.getItem('xitforge_selected_game') as FreeFireVersion) || null;
    } catch {
      return null;
    }
  });

  const [isConfirmed, setIsConfirmed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('xitforge_game_confirmed') === 'true';
    } catch {
      return false;
    }
  });

  const [isAdminMode, setIsAdminMode] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [options, setOptions] = useState<OptionItem[]>([]);
  const [categories, setCategories] = useState<string[]>(['Todos']);

  // Fetch Options automatically from the API / JSON
  const fetchGameOptions = async () => {
    if (!selectedGame) return;
    setLoadingOptions(true);
    try {
      const res = await fetch(`/api/xitforge/config?game=${selectedGame}`);
      if (res.ok) {
        const data = await res.json();
        const fetchedOptions: OptionItem[] = data.options || [];
        setOptions(fetchedOptions);

        // Derive unique categories
        const cats = Array.from(
          new Set(['Todos', ...fetchedOptions.map((o) => o.category)])
        );
        setCategories(cats);
      }
    } catch (e) {
      console.error('Error fetching API options:', e);
    } finally {
      setLoadingOptions(false);
    }
  };

  useEffect(() => {
    if (isConfirmed && selectedGame) {
      fetchGameOptions();
    }
  }, [isConfirmed, selectedGame]);

  const handleSelect = (version: FreeFireVersion) => {
    setSelectedGame(version);
    try {
      localStorage.setItem('xitforge_selected_game', version);
    } catch (e) {
      console.error(e);
    }
  };

  const handleConfirm = () => {
    if (!selectedGame) return;
    setIsConfirmed(true);
    try {
      localStorage.setItem('xitforge_game_confirmed', 'true');
    } catch (e) {
      console.error(e);
    }
  };

  const handleBackToSelect = () => {
    setIsConfirmed(false);
    try {
      localStorage.setItem('xitforge_game_confirmed', 'false');
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle Switch locally in the IPA client
  const handleToggleSwitch = (id: string) => {
    setOptions((prev) =>
      prev.map((opt) => (opt.id === id ? { ...opt, enabled: !opt.enabled } : opt))
    );
  };

  // Slider change locally
  const handleSliderChange = (id: string, value: number) => {
    setOptions((prev) =>
      prev.map((opt) => (opt.id === id ? { ...opt, value } : opt))
    );
  };

  // Select Option change locally
  const handleSelectOptionChange = (id: string, selectedOption: string) => {
    setOptions((prev) =>
      prev.map((opt) => (opt.id === id ? { ...opt, selectedOption } : opt))
    );
  };

  const filteredOptions = options.filter((opt) => {
    if (activeCategory === 'Todos') return true;
    return opt.category.toLowerCase() === activeCategory.toLowerCase();
  });

  // SI ESTÁ EN MODO PANEL XITFORGE (ADMIN / CREADOR)
  if (isAdminMode) {
    return (
      <div className="w-full max-w-lg mx-auto py-2 animate-in fade-in duration-200">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <button
            onClick={() => {
              setIsAdminMode(false);
              fetchGameOptions();
            }}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-xs font-mono text-slate-300 border border-slate-700 transition-all"
          >
            <span>← Volver a la App (IPA)</span>
          </button>

          <span className="text-[11px] font-mono text-emerald-400 font-bold flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Servidor API Conectado</span>
          </span>
        </div>

        <AdminPanel onClose={() => setIsAdminMode(false)} />
      </div>
    );
  }

  // VISTA 2: XITFORGE IPA (JUEGO / OPCIONES EN TIEMPO REAL DESDE LA API)
  if (isConfirmed && selectedGame) {
    const isNormal = selectedGame === 'normal';

    return (
      <div className="w-full max-w-lg mx-auto space-y-4 py-2 animate-in fade-in zoom-in-95 duration-200">
        {/* Barra superior: Juego Activo + Botón Admin Creador + Botón Cambiar */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-lg font-mono">
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md ${
                isNormal
                  ? 'bg-gradient-to-tr from-amber-600 to-orange-500'
                  : 'bg-gradient-to-tr from-purple-600 via-pink-600 to-red-500'
              }`}
            >
              {isNormal ? <Flame className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            </div>

            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xs sm:text-sm font-black text-white">
                  {isNormal ? 'FREE FIRE' : 'FREE FIRE MAX'}
                </span>
                <span
                  className="px-1.5 py-0.2 rounded text-[9px] font-bold flex items-center space-x-1"
                  style={{
                    backgroundColor: `${theme.hex}20`,
                    color: theme.hex,
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                  <span>ONLINE</span>
                </span>
              </div>
              <span className="text-[10px] text-slate-400">
                {isNormal ? 'Versión Clásica' : 'Versión Ultra HD'} • Sincronizado
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            {/* Botón de Acceso a PANEL XITFORGE (Para Gestionar Opciones en PC) */}
            <button
              onClick={() => setIsAdminMode(true)}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-[11px] text-blue-400 border border-slate-700 transition-all font-bold"
              title="Abrir Panel XITFORGE (Admin / Creador)"
            >
              <Server className="w-3 h-3 text-blue-400" />
              <span>Panel PC</span>
            </button>

            <button
              onClick={handleBackToSelect}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-[11px] text-slate-300 border border-slate-700 transition-all font-medium"
            >
              <RefreshCw className="w-3 h-3 text-slate-400" />
              <span>Cambiar</span>
            </button>
          </div>
        </div>

        {/* CATEGORÍAS EN TABS */}
        {categories.length > 1 && (
          <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none font-mono text-xs">
            {categories.map((cat) => {
              const isSelected = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all border shrink-0 ${
                    isSelected
                      ? 'bg-slate-800 border-white/60 text-white font-bold shadow-md'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                  style={{
                    borderColor: isSelected ? theme.hex : undefined,
                    color: isSelected ? theme.hex : undefined,
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}

        {/* RENDERIZADOR DINÁMICO DE LAS OPCIONES SINCRONIZADAS */}
        {loadingOptions ? (
          <div className="p-10 text-center space-y-2 bg-slate-900/50 rounded-3xl border border-slate-800 font-mono text-xs text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-400" />
            <p>Conectando con la API y cargando opciones...</p>
          </div>
        ) : filteredOptions.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/50 rounded-3xl border border-slate-800 text-xs font-mono text-slate-400 space-y-3">
            <p>Aún no has agregado opciones para este juego en el Panel XITFORGE.</p>
            <button
              onClick={() => setIsAdminMode(true)}
              className="px-4 py-2 rounded-xl text-white font-bold text-xs shadow-lg transition-all active:scale-95 inline-flex items-center space-x-1.5"
              style={{ backgroundColor: theme.hex }}
            >
              <Server className="w-3.5 h-3.5" />
              <span>Abrir Panel XITFORGE y Crear Opción</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredOptions.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 backdrop-blur-xl shadow-lg transition-all space-y-2.5"
              >
                {/* Encabezado del Control */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs sm:text-sm font-bold text-white font-mono">
                      {item.name}
                    </span>
                    {item.badge && (
                      <span
                        className="px-1.5 py-0.2 rounded text-[8px] font-mono font-bold uppercase"
                        style={{
                          backgroundColor: `${theme.hex}20`,
                          color: theme.hex,
                          border: `1px solid ${theme.hex}40`,
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>

                  {/* Switch Control */}
                  {item.type === 'switch' && (
                    <button
                      onClick={() => handleToggleSwitch(item.id)}
                      className={`w-12 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                        item.enabled ? 'bg-emerald-500' : 'bg-slate-800'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          item.enabled ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  )}

                  {/* Valor numérico Slider */}
                  {item.type === 'slider' && (
                    <span className="text-xs font-bold font-mono text-white px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                      {item.value}%
                    </span>
                  )}
                </div>

                {/* Descripción si existe */}
                {item.description && (
                  <p className="text-[11px] text-slate-400 font-mono">
                    {item.description}
                  </p>
                )}

                {/* Slider Táctil */}
                {item.type === 'slider' && (
                  <div className="pt-1">
                    <input
                      type="range"
                      min={item.min ?? 0}
                      max={item.max ?? 100}
                      step={item.step ?? 1}
                      value={item.value ?? 50}
                      onChange={(e) =>
                        handleSliderChange(item.id, Number(e.target.value))
                      }
                      className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      style={{ accentColor: theme.hex }}
                    />
                  </div>
                )}

                {/* Selector de Opciones */}
                {item.type === 'select' && item.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 pt-1 font-mono text-xs">
                    {item.options.map((opt) => {
                      const isOptionSelected = item.selectedOption === opt;
                      return (
                        <button
                          key={opt}
                          onClick={() => handleSelectOptionChange(item.id, opt)}
                          className={`px-2.5 py-1.5 rounded-xl border text-center transition-all ${
                            isOptionSelected
                              ? 'bg-slate-800 border-white/40 text-white font-bold'
                              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                          style={{
                            borderColor: isOptionSelected ? theme.hex : undefined,
                          }}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Botón de Acción Directa */}
                {item.type === 'button' && (
                  <button
                    onClick={() => alert(`Ajuste ejecutado: ${item.name}`)}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-98 text-xs font-mono font-bold text-slate-200 border border-slate-700 transition-all flex items-center justify-center space-x-1.5"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>{item.name}</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // VISTA 1: SELECCIÓN DE JUEGO + BOTÓN DE CONFIRMAR
  return (
    <div className="w-full max-w-lg mx-auto space-y-5 py-2 animate-in fade-in duration-200">
      {/* Header */}
      <div className="text-center pt-2">
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          ¿En cuál juegas?
        </h1>
      </div>

      {/* 2 Game Selection Cards - Lado a Lado (grid-cols-2) */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
        {/* Opción 1: FREE FIRE NORMAL */}
        <button
          onClick={() => handleSelect('normal')}
          className={`p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border text-left transition-all duration-200 relative overflow-hidden flex flex-col justify-between min-h-[160px] sm:min-h-[190px] active:scale-[0.97] ${
            selectedGame === 'normal'
              ? 'bg-slate-900/95 shadow-2xl ring-2'
              : 'bg-slate-900/70 border-slate-800/90 hover:bg-slate-800/60 hover:border-slate-700'
          }`}
          style={{
            borderColor: selectedGame === 'normal' ? theme.hex : undefined,
            boxShadow: selectedGame === 'normal' ? `0 10px 30px -10px ${theme.hex}50` : undefined,
          }}
        >
          {selectedGame === 'normal' && (
            <div
              className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-[40px] pointer-events-none opacity-30"
              style={{ backgroundColor: theme.hex }}
            />
          )}

          <div className="space-y-2 relative z-10">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white shadow-lg border border-white/20 shrink-0">
                <Flame className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>

              <div
                className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center transition-all shrink-0 ${
                  selectedGame === 'normal'
                    ? 'text-white shadow-md'
                    : 'border-2 border-slate-700 bg-slate-950/60'
                }`}
                style={{
                  backgroundColor: selectedGame === 'normal' ? theme.hex : undefined,
                }}
              >
                {selectedGame === 'normal' && <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-1 flex-wrap gap-y-1">
                <h3 className="text-xs sm:text-base font-black text-white tracking-tight">
                  FREE FIRE
                </h3>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  NORMAL
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 font-mono line-clamp-1">
                Estándar / Clásica
              </p>
            </div>
          </div>

          <div className="pt-2 sm:pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-slate-400 relative z-10">
            <span className="flex items-center space-x-1 truncate">
              <Zap className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="truncate">Optimizado</span>
            </span>
            {selectedGame === 'normal' && (
              <span className="font-bold shrink-0" style={{ color: theme.hex }}>
                Activo
              </span>
            )}
          </div>
        </button>

        {/* Opción 2: FREE FIRE MAX */}
        <button
          onClick={() => handleSelect('max')}
          className={`p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border text-left transition-all duration-200 relative overflow-hidden flex flex-col justify-between min-h-[160px] sm:min-h-[190px] active:scale-[0.97] ${
            selectedGame === 'max'
              ? 'bg-slate-900/95 shadow-2xl ring-2'
              : 'bg-slate-900/70 border-slate-800/90 hover:bg-slate-800/60 hover:border-slate-700'
          }`}
          style={{
            borderColor: selectedGame === 'max' ? theme.hex : undefined,
            boxShadow: selectedGame === 'max' ? `0 10px 30px -10px ${theme.hex}50` : undefined,
          }}
        >
          {selectedGame === 'max' && (
            <div
              className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-[40px] pointer-events-none opacity-30"
              style={{ backgroundColor: theme.hex }}
            />
          )}

          <div className="space-y-2 relative z-10">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-red-500 flex items-center justify-center text-white shadow-lg border border-white/20 shrink-0">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>

              <div
                className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center transition-all shrink-0 ${
                  selectedGame === 'max'
                    ? 'text-white shadow-md'
                    : 'border-2 border-slate-700 bg-slate-950/60'
                }`}
                style={{
                  backgroundColor: selectedGame === 'max' ? theme.hex : undefined,
                }}
              >
                {selectedGame === 'max' && <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-1 flex-wrap gap-y-1">
                <h3 className="text-xs sm:text-base font-black text-white tracking-tight">
                  FREE FIRE
                </h3>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  MAX HD
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 font-mono line-clamp-1">
                Ultra Gráficos HD
              </p>
            </div>
          </div>

          <div className="pt-2 sm:pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-slate-400 relative z-10">
            <span className="flex items-center space-x-1 truncate">
              <Zap className="w-3 h-3 text-purple-400 shrink-0" />
              <span className="truncate">Ultra FPS</span>
            </span>
            {selectedGame === 'max' && (
              <span className="font-bold shrink-0" style={{ color: theme.hex }}>
                Activo
              </span>
            )}
          </div>
        </button>
      </div>

      {/* BOTÓN DE CONFIRMAR */}
      {selectedGame && (
        <div className="pt-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <button
            onClick={handleConfirm}
            className={`w-full py-4 rounded-2xl bg-gradient-to-r ${theme.gradient} text-white font-mono font-bold text-sm tracking-wider uppercase flex items-center justify-center space-x-2 shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all`}
          >
            <span>Confirmar</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
