import React, { useState } from 'react';
import { useSettings } from '../utils/settingsContext';
import { 
  Flame, 
  Sparkles, 
  Check, 
  Zap, 
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Gamepad2
} from 'lucide-react';

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

  // VISTA 2: PANTALLA PRINCIPAL DESPUÉS DE CONFIRMAR
  if (isConfirmed && selectedGame) {
    const isNormal = selectedGame === 'normal';

    return (
      <div className="w-full max-w-lg mx-auto space-y-6 py-2 animate-in fade-in zoom-in-95 duration-200">
        {/* Barra superior con Juego Seleccionado & Botón para Cambiar */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-lg font-mono">
          <div className="flex items-center space-x-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md ${
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
                  className="px-1.5 py-0.2 rounded text-[9px] font-bold"
                  style={{
                    backgroundColor: `${theme.hex}20`,
                    color: theme.hex,
                  }}
                >
                  ACTIVO
                </span>
              </div>
              <span className="text-[10px] text-slate-400">
                {isNormal ? 'Versión Clásica' : 'Versión Ultra HD'}
              </span>
            </div>
          </div>

          <button
            onClick={handleBackToSelect}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-xs text-slate-300 border border-slate-700 transition-all font-medium"
          >
            <RefreshCw className="w-3 h-3 text-slate-400" />
            <span>Cambiar</span>
          </button>
        </div>

        {/* Espacio limpio para agregar las nuevas funciones */}
        <div className="w-full min-h-[300px] rounded-3xl border border-dashed border-slate-800/80 bg-slate-900/40 p-6 flex flex-col items-center justify-center text-center space-y-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg border border-white/20 text-white"
            style={{ backgroundColor: `${theme.hex}30` }}
          >
            <Gamepad2 className="w-6 h-6" style={{ color: theme.hex }} />
          </div>

          <div className="space-y-1">
            <h2 className="text-base font-bold text-white font-mono">
              Panel de {isNormal ? 'Free Fire' : 'Free Fire MAX'}
            </h2>
            <p className="text-xs text-slate-400 font-mono max-w-xs">
              Listo para agregar las herramientas y funciones que me indiques.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // VISTA 1: SELECCIÓN DE JUEGO + BOTÓN DE CONFIRMAR
  return (
    <div className="w-full max-w-lg mx-auto space-y-5 py-2 animate-in fade-in duration-200">
      {/* Header - Solo el mensaje solicitado */}
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
          {/* Background glow on selected */}
          {selectedGame === 'normal' && (
            <div
              className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-[40px] pointer-events-none opacity-30"
              style={{ backgroundColor: theme.hex }}
            />
          )}

          <div className="space-y-2 relative z-10">
            <div className="flex items-center justify-between">
              {/* Game Icon */}
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white shadow-lg border border-white/20 shrink-0">
                <Flame className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>

              {/* Selection Check Circle */}
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
          {/* Background glow on selected */}
          {selectedGame === 'max' && (
            <div
              className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-[40px] pointer-events-none opacity-30"
              style={{ backgroundColor: theme.hex }}
            />
          )}

          <div className="space-y-2 relative z-10">
            <div className="flex items-center justify-between">
              {/* Game Icon */}
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-red-500 flex items-center justify-center text-white shadow-lg border border-white/20 shrink-0">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>

              {/* Selection Check Circle */}
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

      {/* BOTÓN DE CONFIRMAR (Aparece cuando seleccionas uno) */}
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
