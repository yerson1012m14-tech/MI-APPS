import React from 'react';
import { useSettings, Language, ThemeColor, THEME_CONFIGS, BgEffect } from '../utils/settingsContext';
import { Settings, Palette, Globe, Check, X, Zap, Sparkles, CircleDot } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { language, setLanguage, themeColor, setThemeColor, bgEffect, setBgEffect, theme, t } = useSettings();

  if (!isOpen) return null;

  const languages: { id: Language; label: string; flag: string; nativeName: string }[] = [
    { id: 'es', label: 'Español', flag: '🇪🇸', nativeName: 'Español (Latino / España)' },
    { id: 'en', label: 'English', flag: '🇺🇸', nativeName: 'English (US / Global)' },
    { id: 'pt', label: 'Português', flag: '🇧🇷', nativeName: 'Português (Brasil)' },
  ];

  const effectOptions: { id: BgEffect; label: string; desc: string; icon: React.ReactNode }[] = [
    { id: 'hybrid', label: t.effectsHybrid, desc: 'Rayos eléctricos con bolitas de energía interactiva', icon: <Zap className="w-4 h-4 text-amber-400" /> },
    { id: 'lightning', label: t.effectsLightning, desc: 'Descargas de relámpagos cibernéticos dinámicos', icon: <Sparkles className="w-4 h-4 text-cyan-400" /> },
    { id: 'orbs', label: t.effectsOrbs, desc: 'Esferas flotantes conectadas con líneas de luz', icon: <CircleDot className="w-4 h-4 text-emerald-400" /> },
    { id: 'none', label: t.effectsNone, desc: 'Fondo limpio sin animaciones', icon: <X className="w-4 h-4 text-slate-500" /> },
  ];

  const colors = Object.values(THEME_CONFIGS);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${theme.gradient} flex items-center justify-center text-white shadow-md`}>
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">{t.settingsTitle}</h3>
              <p className="text-xs text-slate-400 font-mono">Personalización XITFORGE</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Background Visual Effects (Rayos & Bolitas) */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold font-mono text-slate-300 uppercase tracking-wider">
              <Zap className="w-4 h-4" style={{ color: theme.hex }} />
              <span>{t.effectsTitle}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {effectOptions.map((opt) => {
                const isSelected = bgEffect === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setBgEffect(opt.id)}
                    className={`p-3 rounded-2xl border text-left transition-all relative flex items-start space-x-2.5 ${
                      isSelected
                        ? 'bg-slate-800 border-white/40 shadow-md ring-2 ring-white/10'
                        : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">{opt.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-100">{opt.label}</p>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0 ml-1" />}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{opt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Theme Colors Section */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold font-mono text-slate-300 uppercase tracking-wider">
              <Palette className="w-4 h-4" style={{ color: theme.hex }} />
              <span>{t.themeColors}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {colors.map((c) => {
                const isSelected = themeColor === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setThemeColor(c.id)}
                    className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                      isSelected
                        ? 'bg-slate-800 border-white/40 shadow-lg ring-2 ring-white/20'
                        : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="w-5 h-5 rounded-full shadow-md border border-white/20"
                        style={{ backgroundColor: c.hex }}
                      />
                      {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <span className="text-xs font-bold text-slate-200 tracking-tight leading-tight">
                      {c.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Language Selection */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold font-mono text-slate-300 uppercase tracking-wider">
              <Globe className="w-4 h-4" style={{ color: theme.hex }} />
              <span>{t.languageSelect}</span>
            </div>

            <div className="space-y-2">
              {languages.map((l) => {
                const isSelected = language === l.id;
                return (
                  <button
                    key={l.id}
                    onClick={() => setLanguage(l.id)}
                    className={`w-full p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-slate-800 border-white/40 shadow-md'
                        : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/50 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{l.flag}</span>
                      <div className="text-left">
                        <p className="text-xs font-bold text-white">{l.label}</p>
                        <p className="text-[11px] text-slate-400">{l.nativeName}</p>
                      </div>
                    </div>

                    {isSelected && (
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: theme.hex }}
                      >
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className={`w-full py-3 bg-gradient-to-r ${theme.gradient} text-white font-bold text-xs rounded-xl transition-all shadow-lg active:scale-[0.98] uppercase tracking-wider`}
          >
            {t.applyChanges}
          </button>
        </div>
      </div>
    </div>
  );
};
