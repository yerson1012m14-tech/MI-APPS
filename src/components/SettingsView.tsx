import React, { useState } from 'react';
import { 
  useSettings, 
  Language, 
  THEME_CONFIGS, 
  BgEffect 
} from '../utils/settingsContext';
import { 
  Settings, 
  Palette, 
  Globe, 
  Zap, 
  Check, 
  Sparkles,
  Volume2,
  Vibrate,
  Trash2,
  CheckCircle2,
  HardDrive
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { 
    language, 
    setLanguage, 
    themeColor, 
    setThemeColor, 
    bgEffect, 
    setBgEffect, 
    theme 
  } = useSettings();

  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [interfaceSounds, setInterfaceSounds] = useState(true);
  const [fluidAnimations, setFluidAnimations] = useState(true);
  const [cacheCleared, setCacheCleared] = useState(false);

  const colors = Object.values(THEME_CONFIGS);

  const languages: { id: Language; label: string; flag: string; country: string }[] = [
    { id: 'es', label: 'Español', flag: '🇪🇸', country: 'Latinoamérica / España' },
    { id: 'en', label: 'English', flag: '🇺🇸', country: 'United States / Global' },
    { id: 'pt', label: 'Português', flag: '🇧🇷', country: 'Brasil / Portugal' },
  ];

  const effectOptions: { id: BgEffect; label: string; desc: string; icon: string }[] = [
    { id: 'hybrid', label: 'Rayos + Bolitas Neón', desc: 'Efecto completo con partículas y relámpagos', icon: '⚡🔮' },
    { id: 'lightning', label: 'Solo Rayos Eléctricos', desc: 'Descargas cibernéticas de energía', icon: '⚡' },
    { id: 'orbs', label: 'Solo Bolitas Flotantes', desc: 'Esferas luminosas interactivas', icon: '🔮' },
    { id: 'none', label: 'Desactivado (Ultra Rendimiento)', desc: 'Fondo limpio estático que ahorra batería', icon: '🔋' },
  ];

  const handleClearCache = () => {
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* iOS Settings Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <span>Configuración</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Ajustes generales, apariencia y preferencias del sistema
          </p>
        </div>

        <div
          className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${theme.gradient} flex items-center justify-center shadow-lg text-white border border-white/20`}
        >
          <Settings className="w-5 h-5 animate-spin-slow" />
        </div>
      </div>

      {/* SECCIÓN 1: APARIENCIA Y TEMAS */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2 px-1">
          <span className="text-[11px] font-bold font-mono text-slate-400 uppercase tracking-wider">
            Tema & Color de Acento
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-4 sm:p-5 backdrop-blur-xl shadow-xl space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {colors.map((c) => {
              const isSelected = themeColor === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setThemeColor(c.id)}
                  className={`p-3 rounded-2xl border text-left transition-all active:scale-95 flex items-center space-x-3 ${
                    isSelected
                      ? 'bg-slate-800 border-white/60 shadow-lg ring-2 ring-white/10'
                      : 'bg-slate-950/70 border-slate-800/80 hover:bg-slate-800/50'
                  }`}
                >
                  <span
                    className="w-5 h-5 rounded-full shadow-md border border-white/30 shrink-0"
                    style={{ backgroundColor: c.hex }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-200 truncate">{c.name}</p>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: EFECTOS VISUALES */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2 px-1">
          <span className="text-[11px] font-bold font-mono text-slate-400 uppercase tracking-wider">
            Efectos Visuales de Fondo
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-4 sm:p-5 backdrop-blur-xl shadow-xl space-y-2">
          {effectOptions.map((opt) => {
            const isSelected = bgEffect === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setBgEffect(opt.id)}
                className={`w-full p-3.5 rounded-2xl border text-left transition-all active:scale-98 flex items-center justify-between ${
                  isSelected
                    ? 'bg-slate-800/90 border-white/50 shadow-md ring-1 ring-white/20'
                    : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40 text-slate-300'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <span className="text-lg shrink-0">{opt.icon}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{opt.label}</p>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{opt.desc}</p>
                  </div>
                </div>

                {isSelected ? (
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0 ml-2"
                    style={{ backgroundColor: theme.hex }}
                  >
                    <Check className="w-3 h-3" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border border-slate-700 shrink-0 ml-2" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* SECCIÓN 3: IDIOMA */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2 px-1">
          <span className="text-[11px] font-bold font-mono text-slate-400 uppercase tracking-wider">
            Idioma del Sistema
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-4 sm:p-5 backdrop-blur-xl shadow-xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {languages.map((l) => {
              const isSelected = language === l.id;
              return (
                <button
                  key={l.id}
                  onClick={() => setLanguage(l.id)}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-slate-800 border-white/50 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/40 text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <span className="text-xl shrink-0">{l.flag}</span>
                    <div className="text-left min-w-0">
                      <p className="text-xs font-bold text-white truncate">{l.label}</p>
                      <p className="text-[10px] text-slate-400 truncate">{l.country}</p>
                    </div>
                  </div>

                  {isSelected && (
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center text-white shrink-0 ml-2"
                      style={{ backgroundColor: theme.hex }}
                    >
                      <Check className="w-2.5 h-2.5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECCIÓN 4: PREFERENCIAS DEL DISPOSITIVO (iOS) */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2 px-1">
          <span className="text-[11px] font-bold font-mono text-slate-400 uppercase tracking-wider">
            Preferencias de Interfaz iOS
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-4 sm:p-5 backdrop-blur-xl shadow-xl divide-y divide-slate-800/80">
          {/* Vibración háptica */}
          <div className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
                <Vibrate className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Respuesta Háptica</p>
                <p className="text-[10px] text-slate-400 font-mono">Vibración suave al pulsar botones</p>
              </div>
            </div>

            <button
              onClick={() => setHapticFeedback(!hapticFeedback)}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                hapticFeedback ? 'bg-emerald-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  hapticFeedback ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Sonidos */}
          <div className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Efectos de Audio</p>
                <p className="text-[10px] text-slate-400 font-mono">Sonidos de confirmación y clics</p>
              </div>
            </div>

            <button
              onClick={() => setInterfaceSounds(!interfaceSounds)}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                interfaceSounds ? 'bg-emerald-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  interfaceSounds ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Animaciones fluidas */}
          <div className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Animaciones Fluidas Pro</p>
                <p className="text-[10px] text-slate-400 font-mono">Transiciones a 60/120 FPS</p>
              </div>
            </div>

            <button
              onClick={() => setFluidAnimations(!fluidAnimations)}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                fluidAnimations ? 'bg-emerald-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  fluidAnimations ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* SECCIÓN 5: MEMORIA Y SISTEMA */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2 px-1">
          <span className="text-[11px] font-bold font-mono text-slate-400 uppercase tracking-wider">
            Almacenamiento & Diagnóstico
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-4 sm:p-5 backdrop-blur-xl shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
                <HardDrive className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Memoria Caché</p>
                <p className="text-[10px] text-slate-400 font-mono">
                  {cacheCleared ? 'Caché optimizada (0 KB)' : '14.2 MB almacenados'}
                </p>
              </div>
            </div>

            <button
              onClick={handleClearCache}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-xs font-mono text-slate-200 border border-slate-700 flex items-center space-x-1.5 transition-all"
            >
              {cacheCleared ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Limpio</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Limpiar</span>
                </>
              )}
            </button>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Versión del Motor</span>
            <span className="text-slate-200 font-bold">XITFORGE v2.8.4 iOS Suite</span>
          </div>
        </div>
      </div>
    </div>
  );
};
