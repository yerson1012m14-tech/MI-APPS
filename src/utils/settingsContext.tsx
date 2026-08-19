import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'es' | 'en' | 'pt';
export type ThemeColor = 'blue' | 'red' | 'green' | 'purple' | 'amber' | 'cyan';
export type BgEffect = 'hybrid' | 'lightning' | 'orbs' | 'matrix' | 'none';

export interface ThemeConfig {
  id: ThemeColor;
  name: string;
  primary: string;
  accentClass: string;
  gradient: string;
  borderGlow: string;
  bgButton: string;
  hoverButton: string;
  textColor: string;
  ringColor: string;
  hex: string;
}

export const THEME_CONFIGS: Record<ThemeColor, ThemeConfig> = {
  blue: {
    id: 'blue',
    name: 'Azul Forge (Default)',
    primary: 'blue',
    accentClass: 'text-blue-400',
    gradient: 'from-blue-600 via-indigo-600 to-cyan-400',
    borderGlow: 'border-blue-500/30',
    bgButton: 'bg-blue-600',
    hoverButton: 'hover:bg-blue-500',
    textColor: 'text-blue-500',
    ringColor: 'focus:ring-blue-500/20',
    hex: '#3B82F6',
  },
  red: {
    id: 'red',
    name: 'Rojo Fuego (Crimson)',
    primary: 'red',
    accentClass: 'text-red-400',
    gradient: 'from-red-600 via-rose-600 to-amber-500',
    borderGlow: 'border-red-500/30',
    bgButton: 'bg-red-600',
    hoverButton: 'hover:bg-red-500',
    textColor: 'text-red-500',
    ringColor: 'focus:ring-red-500/20',
    hex: '#EF4444',
  },
  green: {
    id: 'green',
    name: 'Verde Matrix (Emerald)',
    primary: 'emerald',
    accentClass: 'text-emerald-400',
    gradient: 'from-emerald-600 via-teal-600 to-green-400',
    borderGlow: 'border-emerald-500/30',
    bgButton: 'bg-emerald-600',
    hoverButton: 'hover:bg-emerald-500',
    textColor: 'text-emerald-500',
    ringColor: 'focus:ring-emerald-500/20',
    hex: '#10B981',
  },
  purple: {
    id: 'purple',
    name: 'Púrpura Neón (Cyber)',
    primary: 'purple',
    accentClass: 'text-purple-400',
    gradient: 'from-purple-600 via-fuchsia-600 to-indigo-400',
    borderGlow: 'border-purple-500/30',
    bgButton: 'bg-purple-600',
    hoverButton: 'hover:bg-purple-500',
    textColor: 'text-purple-500',
    ringColor: 'focus:ring-purple-500/20',
    hex: '#A855F7',
  },
  amber: {
    id: 'amber',
    name: 'Oro Ámbar (Cyber Gold)',
    primary: 'amber',
    accentClass: 'text-amber-400',
    gradient: 'from-amber-600 via-orange-600 to-yellow-400',
    borderGlow: 'border-amber-500/30',
    bgButton: 'bg-amber-600',
    hoverButton: 'hover:bg-amber-500',
    textColor: 'text-amber-500',
    ringColor: 'focus:ring-amber-500/20',
    hex: '#F59E0B',
  },
  cyan: {
    id: 'cyan',
    name: 'Cian Hielo (Aqua)',
    primary: 'cyan',
    accentClass: 'text-cyan-400',
    gradient: 'from-cyan-600 via-blue-600 to-teal-400',
    borderGlow: 'border-cyan-500/30',
    bgButton: 'bg-cyan-600',
    hoverButton: 'hover:bg-cyan-500',
    textColor: 'text-cyan-500',
    ringColor: 'focus:ring-cyan-500/20',
    hex: '#06B6D4',
  },
};

export const TRANSLATIONS = {
  es: {
    settingsTitle: 'Configuración',
    themeColors: 'Color de Acento',
    languageSelect: 'Idioma del Sistema',
    effectsTitle: 'Efectos Visuales de Fondo',
    effectsHybrid: 'Rayos + Bolitas Neón',
    effectsLightning: 'Rayos Eléctricos',
    effectsOrbs: 'Bolitas & Orbes Flotantes',
    effectsMatrix: 'Lluvia Digital Matrix',
    effectsNone: 'Desactivado (Estático)',
    accessKey: 'Key de Acceso',
    enter: 'ENTRAR',
    verifying: 'VERIFICANDO...',
    invalidKey: 'Key inválida o expirada.',
    enterKeyPrompt: 'Introduce tu Key para acceder.',
    explorer: 'Explorador',
    inspector: 'Inspector IPA',
    sources: 'Fuentes AltStore',
    cicd: 'GitHub CI/CD',
    guide: 'Guía Sideload',
    saved: 'Favoritos',
    savedApps: 'Guardados',
    searchPlaceholder: 'Buscar repositorios de IPAs, emuladores, tweaks...',
    downloadIpa: 'Descargar IPA',
    releases: 'Releases',
    copy: 'Copiar',
    copied: 'Copiado',
    save: 'Guardar',
    close: 'Cerrar',
    applyChanges: 'Guardar Cambios',
  },
  en: {
    settingsTitle: 'Settings',
    themeColors: 'Accent Theme Color',
    languageSelect: 'System Language',
    effectsTitle: 'Background Visual Effects',
    effectsHybrid: 'Lightning + Neon Orbs',
    effectsLightning: 'Electric Lightning',
    effectsOrbs: 'Floating Orbs & Balls',
    effectsMatrix: 'Digital Matrix Rain',
    effectsNone: 'Disabled (Static)',
    accessKey: 'Access Key',
    enter: 'ENTER',
    verifying: 'VERIFYING...',
    invalidKey: 'Invalid or expired Key.',
    enterKeyPrompt: 'Enter your Key to access.',
    explorer: 'Explorer',
    inspector: 'IPA Inspector',
    sources: 'AltStore Sources',
    cicd: 'GitHub CI/CD',
    guide: 'Sideload Guide',
    saved: 'Bookmarks',
    savedApps: 'Saved',
    searchPlaceholder: 'Search IPA repos, emulators, tweaks...',
    downloadIpa: 'Download IPA',
    releases: 'Releases',
    copy: 'Copy',
    copied: 'Copied',
    save: 'Save',
    close: 'Close',
    applyChanges: 'Save Changes',
  },
  pt: {
    settingsTitle: 'Configurações',
    themeColors: 'Cor do Tema',
    languageSelect: 'Idioma do Sistema',
    effectsTitle: 'Efeitos Visuais de Fundo',
    effectsHybrid: 'Raios + Esferas Neon',
    effectsLightning: 'Raios Elétricos',
    effectsOrbs: 'Bolas & Esferas Flutuantes',
    effectsMatrix: 'Chuva Digital Matrix',
    effectsNone: 'Desativado (Estático)',
    accessKey: 'Chave de Acesso',
    enter: 'ENTRAR',
    verifying: 'VERIFICANDO...',
    invalidKey: 'Chave inválida ou expirada.',
    enterKeyPrompt: 'Digite sua chave para acessar.',
    explorer: 'Explorador',
    inspector: 'Inspetor IPA',
    sources: 'Fontes AltStore',
    cicd: 'GitHub CI/CD',
    guide: 'Guia Sideload',
    saved: 'Favoritos',
    savedApps: 'Salvos',
    searchPlaceholder: 'Pesquisar repositórios IPA, emuladores, tweaks...',
    downloadIpa: 'Baixar IPA',
    releases: 'Versões',
    copy: 'Copiar',
    copied: 'Copiado',
    save: 'Salvar',
    close: 'Fechar',
    applyChanges: 'Salvar Alterações',
  },
};

interface SettingsContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
  bgEffect: BgEffect;
  setBgEffect: (effect: BgEffect) => void;
  theme: ThemeConfig;
  t: typeof TRANSLATIONS['es'];
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem('xitforge_language') as Language;
      if (stored && ['es', 'en', 'pt'].includes(stored)) return stored;
    } catch {}
    return 'es';
  });

  const [themeColor, setThemeColorState] = useState<ThemeColor>(() => {
    try {
      const stored = localStorage.getItem('xitforge_theme_color') as ThemeColor;
      if (stored && THEME_CONFIGS[stored]) return stored;
    } catch {}
    return 'blue';
  });

  const [bgEffect, setBgEffectState] = useState<BgEffect>(() => {
    try {
      const stored = localStorage.getItem('xitforge_bg_effect') as BgEffect;
      if (stored && ['hybrid', 'lightning', 'orbs', 'matrix', 'none'].includes(stored)) return stored;
    } catch {}
    return 'hybrid'; // Enabled by default as requested!
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('xitforge_language', lang);
    } catch {}
  };

  const setThemeColor = (color: ThemeColor) => {
    setThemeColorState(color);
    try {
      localStorage.setItem('xitforge_theme_color', color);
    } catch {}
  };

  const setBgEffect = (effect: BgEffect) => {
    setBgEffectState(effect);
    try {
      localStorage.setItem('xitforge_bg_effect', effect);
    } catch {}
  };

  const theme = THEME_CONFIGS[themeColor] || THEME_CONFIGS.blue;
  const t = TRANSLATIONS[language] || TRANSLATIONS.es;

  return (
    <SettingsContext.Provider
      value={{
        language,
        setLanguage,
        themeColor,
        setThemeColor,
        bgEffect,
        setBgEffect,
        theme,
        t,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
