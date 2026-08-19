import React from 'react';
import { ActiveTab } from '../types';
import { 
  Home,
  Key,
  Settings,
  Flame,
  ShieldCheck,
  Lock,
  Cpu,
  Server
} from 'lucide-react';
import { LicenseSession } from './AccessGate';
import { useSettings } from '../utils/settingsContext';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  licenseSession?: LicenseSession | null;
  onLock?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  licenseSession,
  onLock,
}) => {
  const { theme } = useSettings();

  return (
    <>
      {/* Top Header - iOS Style */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/80 text-slate-100 shadow-md">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Brand Logo & Name */}
            <div 
              className="flex items-center space-x-2.5 cursor-pointer active:scale-95 transition-transform" 
              onClick={() => setActiveTab('home')}
            >
              <div
                className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${theme.gradient} flex items-center justify-center shadow-md border border-white/20 text-white shrink-0`}
              >
                <Flame className="w-4 h-4" />
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="font-mono font-black text-lg text-white tracking-tight">
                  XIT<span style={{ color: theme.hex }}>FORGE</span>
                </span>
                <span
                  className="text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold"
                  style={{ backgroundColor: `${theme.hex}20`, color: theme.hex, borderColor: `${theme.hex}40` }}
                >
                  PRO
                </span>
              </div>
            </div>

            {/* Top Right Actions: PANEL PC BUTTON + Status */}
            <div className="flex items-center space-x-2">
              {/* BOTÓN DIRECTO: PANEL PC (ADMIN) */}
              <button
                onClick={() => setActiveTab(activeTab === 'admin' ? 'home' : 'admin')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all active:scale-95 shadow-md border ${
                  activeTab === 'admin'
                    ? 'bg-blue-600 text-white border-blue-400 shadow-blue-500/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-blue-400 border-slate-700 hover:border-blue-500/40'
                }`}
                title="Abrir Panel de Control PC (Creador / Admin)"
              >
                <Server className="w-3.5 h-3.5" />
                <span>Panel PC</span>
              </button>

              {licenseSession && (
                <button
                  onClick={() => setActiveTab('license')}
                  className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold transition-all active:scale-95"
                  title="Ver Licencia y Tiempo"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="max-w-[80px] truncate">{licenseSession.tier}</span>
                </button>
              )}

              {onLock && (
                <button
                  onClick={onLock}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-300 border border-slate-700 text-xs font-mono transition-all active:scale-95"
                  title="Bloquear"
                >
                  <Lock className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* iOS Mobile & Tablet Fixed Bottom Navigation Bar (Inicio, Licencia & Ajustes) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-2xl border-t border-slate-800/90 pb-[max(env(safe-area-inset-bottom),10px)] pt-1.5 shadow-2xl shadow-black">
        <div className="max-w-md mx-auto grid grid-cols-3 h-13 px-4 gap-2 items-center">
          {/* 1. Inicio (Casita) */}
          <button
            id="tab-btn-home"
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center py-1 relative rounded-2xl transition-all active:scale-95 ${
              activeTab === 'home'
                ? 'font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            style={{ color: activeTab === 'home' ? theme.hex : undefined }}
          >
            <div className="relative">
              <Home className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform ${activeTab === 'home' ? 'scale-110' : ''}`} />
            </div>
            <span className="text-[11px] mt-1 tracking-tight font-medium">
              Inicio
            </span>

            {activeTab === 'home' && (
              <span
                className="absolute -bottom-1 w-8 h-1 rounded-full shadow-md"
                style={{ backgroundColor: theme.hex, boxShadow: `0 0 10px ${theme.hex}` }}
              />
            )}
          </button>

          {/* 2. Licencia / Key */}
          <button
            id="tab-btn-license"
            onClick={() => setActiveTab('license')}
            className={`flex flex-col items-center justify-center py-1 relative rounded-2xl transition-all active:scale-95 ${
              activeTab === 'license'
                ? 'font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            style={{ color: activeTab === 'license' ? theme.hex : undefined }}
          >
            <div className="relative">
              <Key className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform ${activeTab === 'license' ? 'scale-110' : ''}`} />
            </div>
            <span className="text-[11px] mt-1 tracking-tight font-medium">
              Licencia
            </span>

            {activeTab === 'license' && (
              <span
                className="absolute -bottom-1 w-8 h-1 rounded-full shadow-md"
                style={{ backgroundColor: theme.hex, boxShadow: `0 0 10px ${theme.hex}` }}
              />
            )}
          </button>

          {/* 3. Ajustes (Rueda) */}
          <button
            id="tab-btn-settings"
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center justify-center py-1 relative rounded-2xl transition-all active:scale-95 ${
              activeTab === 'settings'
                ? 'font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            style={{ color: activeTab === 'settings' ? theme.hex : undefined }}
          >
            <div className="relative">
              <Settings className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform ${activeTab === 'settings' ? 'scale-110 animate-spin-slow' : ''}`} />
            </div>
            <span className="text-[11px] mt-1 tracking-tight font-medium">
              Ajustes
            </span>

            {activeTab === 'settings' && (
              <span
                className="absolute -bottom-1 w-8 h-1 rounded-full shadow-md"
                style={{ backgroundColor: theme.hex, boxShadow: `0 0 10px ${theme.hex}` }}
              />
            )}
          </button>
        </div>
      </nav>
    </>
  );
};
