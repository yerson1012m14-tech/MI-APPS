import React, { useState } from 'react';
import { 
  Flame, 
  ArrowRight, 
  KeyRound, 
  ShieldAlert, 
  Activity,
  Settings
} from 'lucide-react';
import { useSettings } from '../utils/settingsContext';
import { SettingsModal } from './SettingsModal';
import { CyberBackground } from './CyberBackground';

export interface LicenseSession {
  key: string;
  tier: string;
  label: string;
  hwid: string;
  activatedAt: string;
  expiresAt: string;
  isLifetime?: boolean;
}

interface AccessGateProps {
  onUnlock: (session: LicenseSession) => void;
}

// 16-character Master Keys in XXXX-XXXX-XXXX-XXXX format
const AUTHORIZED_SECRET_KEYS: Record<
  string,
  { label: string; tier: string; days: number; isLifetime?: boolean }
> = {
  'XITF-2026-TITA-NIUM': {
    label: 'XITFORGE Titanium 2026',
    tier: 'TITANIUM PRO',
    days: 9999,
    isLifetime: true,
  },
  'XITF-VIP6-GOLD-2026': {
    label: 'XITFORGE VIP 2026',
    tier: 'VIP ACCESS',
    days: 365,
    isLifetime: true,
  },
  'XITF-VIP6-ORO2-026': {
    label: 'XITFORGE VIP Oro',
    tier: 'VIP ACCESS',
    days: 365,
    isLifetime: true,
  },
  'XITF-VIP6-ORO2-2026': {
    label: 'XITFORGE VIP Oro',
    tier: 'VIP ACCESS',
    days: 365,
    isLifetime: true,
  },
  'XITF-PRO7-FREE-2026': {
    label: 'XITFORGE Pro 2026',
    tier: 'PRO',
    days: 365,
    isLifetime: true,
  },
  'XITF-IOS2-SIDE-LOAD': {
    label: 'XITFORGE Sideload',
    tier: 'DEVELOPER',
    days: 180,
    isLifetime: false,
  },
  'FJSA-9872-KPLM-2026': {
    label: 'XITFORGE Titanium',
    tier: 'TITANIUM',
    days: 9999,
    isLifetime: true,
  },
  // Legacy compatibility
  'XIT-TITANIUM-2026': {
    label: 'XITFORGE Titanium',
    tier: 'TITANIUM',
    days: 9999,
    isLifetime: true,
  },
  'XIT-VIP-2026': {
    label: 'XITFORGE VIP',
    tier: 'VIP',
    days: 365,
    isLifetime: true,
  },
  'XITFORGE-PRO': {
    label: 'XITFORGE Pro',
    tier: 'PRO',
    days: 365,
    isLifetime: true,
  },
};

export const AccessGate: React.FC<AccessGateProps> = ({ onUnlock }) => {
  const { theme, t } = useSettings();
  const [inputKey, setInputKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Auto-format input into 16 alphanumeric characters grouped by 4 (XXXX-XXXX-XXXX-XXXX)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    
    // Strip non-alphanumeric characters, max 16 chars
    const clean = raw.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 16);
    
    // Chunk into 4s separated by '-'
    const chunks: string[] = [];
    for (let i = 0; i < clean.length; i += 4) {
      chunks.push(clean.slice(i, i + 4));
    }
    
    const formatted = chunks.join('-');
    setInputKey(formatted);
    setError(null);
  };

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const key = inputKey.trim().toUpperCase();

    if (!key) {
      setError(t.enterKeyPrompt);
      return;
    }

    setIsVerifying(true);
    setError(null);

    setTimeout(() => {
      // Check preset secret whitelist (by exact key or normalized)
      const cleanInput = key.replace(/[^a-zA-Z0-9]/g, '');
      
      let matchedKey = key;
      let preset = AUTHORIZED_SECRET_KEYS[key];

      if (!preset) {
        // Try finding matching key by stripped alphanumeric
        const found = Object.keys(AUTHORIZED_SECRET_KEYS).find(
          (k) => k.replace(/[^a-zA-Z0-9]/g, '') === cleanInput
        );
        if (found) {
          matchedKey = found;
          preset = AUTHORIZED_SECRET_KEYS[found];
        }
      }

      // Check if key starts with XITF-, XIT-, or FJSA- (master wildcard pass for developer)
      const isDevWildcard = 
        cleanInput.startsWith('XITF') || 
        cleanInput.startsWith('XIT') || 
        cleanInput.startsWith('FJSA');

      // Check custom keys created in localStorage
      let customDb: Record<string, any> = {};
      try {
        customDb = JSON.parse(localStorage.getItem('xitforge_valid_keys_db') || '{}');
      } catch (err) {
        console.error(err);
      }
      const custom = customDb[key] || customDb[matchedKey];

      if (preset || custom || isDevWildcard) {
        const tier = preset?.tier || custom?.tier || (isDevWildcard ? 'TITANIUM VIP' : 'VIP');
        const label = preset?.label || custom?.label || (isDevWildcard ? 'XITFORGE Titanium 2026' : 'XITFORGE Key');
        const isLifetime = preset?.isLifetime || custom?.isLifetime || true;
        const days = preset?.days || custom?.days || 9999;

        const activatedAt = new Date().toISOString();
        const expiresAt = isLifetime
          ? new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString()
          : new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

        const session: LicenseSession = {
          key: matchedKey,
          tier,
          label,
          hwid: 'XIT-DEVICE',
          activatedAt,
          expiresAt,
          isLifetime,
        };

        onUnlock(session);
      } else {
        setIsVerifying(false);
        setError(t.invalidKey);
      }
    }, 350);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Dynamic Animated Cyber Background (Rayos & Bolitas) */}
      <CyberBackground />

      {/* Top Settings Gear Button (Arriba a la derecha) */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-all shadow-lg active:scale-95 flex items-center space-x-1.5"
          title={t.settingsTitle}
        >
          <Settings className="w-5 h-5 text-slate-300 animate-spin-slow" />
        </button>
      </div>

      {/* Dynamic background glow based on selected theme */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none opacity-20"
        style={{ backgroundColor: theme.hex }}
      />

      <div className="max-w-sm w-full relative z-10 space-y-6">
        {/* Sleek Forge Logo & Brand with dynamic gradient */}
        <div className="text-center space-y-3">
          <div
            className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${theme.gradient} mx-auto flex items-center justify-center shadow-xl border border-white/20`}
          >
            <Flame className="w-9 h-9 text-white" />
          </div>

          <h1 className="text-3xl font-black text-white tracking-tight uppercase font-mono">
            XIT<span style={{ color: theme.hex }}>FORGE</span>
          </h1>
        </div>

        {/* Clean Input Card */}
        <div className="bg-slate-900/90 border border-slate-800/90 backdrop-blur-xl rounded-3xl p-6 shadow-2xl shadow-black/80 space-y-4">
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <div className="flex items-center justify-center mb-2.5">
                <label className="text-xs font-bold font-mono text-slate-300 flex items-center space-x-1.5 uppercase tracking-wider">
                  <KeyRound className="w-3.5 h-3.5" style={{ color: theme.hex }} />
                  <span>{t.accessKey}</span>
                </label>
              </div>

              {/* Auto-masked 16-character input */}
              <input
                id="xitforge-key-input"
                type="text"
                value={inputKey}
                onChange={handleInputChange}
                maxLength={19} // 16 alphanumeric characters + 3 hyphens = 19 length
                placeholder="XXXX-XXXX-XXXX-XXXX"
                className={`w-full px-4 py-3.5 bg-slate-950 border border-slate-700/80 rounded-2xl text-slate-100 placeholder-slate-600 font-mono text-base font-bold tracking-widest uppercase focus:outline-none focus:ring-4 ${theme.ringColor} transition-all text-center`}
                style={{ borderColor: inputKey ? theme.hex : undefined }}
                autoFocus
                autoComplete="off"
                spellCheck="false"
              />

              {/* Visual Character Progress Dots (4 blocks of 4) */}
              <div className="flex justify-center items-center space-x-1.5 mt-2.5">
                {[0, 1, 2, 3].map((blockIndex) => {
                  const cleanLength = inputKey.replace(/-/g, '').length;
                  const isBlockFull = cleanLength >= (blockIndex + 1) * 4;
                  const isBlockActive = cleanLength > blockIndex * 4 && !isBlockFull;

                  return (
                    <div
                      key={blockIndex}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        isBlockFull
                          ? 'w-6'
                          : isBlockActive
                          ? 'w-4 opacity-80'
                          : 'w-2 bg-slate-800'
                      }`}
                      style={{
                        backgroundColor: isBlockFull || isBlockActive ? theme.hex : undefined,
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-300 text-xs font-mono flex items-center justify-center space-x-2 animate-in fade-in duration-200">
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              id="xitforge-submit-btn"
              type="submit"
              disabled={isVerifying}
              className={`w-full py-4 bg-gradient-to-r ${theme.gradient} text-white font-mono font-bold text-sm tracking-wider uppercase rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-black/40 disabled:opacity-50 active:scale-[0.98]`}
            >
              {isVerifying ? (
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 animate-spin text-white" />
                  <span>{t.verifying}</span>
                </div>
              ) : (
                <>
                  <span>{t.enter}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};
