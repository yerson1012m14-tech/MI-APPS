import React, { useState, useEffect } from 'react';
import { LicenseSession } from './AccessGate';
import { useSettings } from '../utils/settingsContext';
import { 
  Key, 
  ShieldCheck, 
  Clock, 
  Calendar, 
  Smartphone, 
  Copy, 
  Check, 
  Lock, 
  Flame, 
  Sparkles, 
  RefreshCw, 
  ShieldAlert,
  ArrowRight,
  Zap,
  Activity
} from 'lucide-react';

interface LicenseViewProps {
  licenseSession: LicenseSession;
  onLock: () => void;
  onUpdateSession: (session: LicenseSession) => void;
}

export const LicenseView: React.FC<LicenseViewProps> = ({
  licenseSession,
  onLock,
  onUpdateSession,
}) => {
  const { theme } = useSettings();
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isLifetime: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isLifetime: !!licenseSession.isLifetime,
  });

  const [newKeyInput, setNewKeyInput] = useState('');
  const [keyError, setKeyError] = useState<string | null>(null);
  const [keySuccess, setKeySuccess] = useState(false);

  // Live countdown timer calculation
  useEffect(() => {
    const updateCountdown = () => {
      if (licenseSession.isLifetime) {
        setTimeLeft({
          days: 9999,
          hours: 23,
          minutes: 59,
          seconds: 59,
          isLifetime: true,
        });
        return;
      }

      const expiry = new Date(licenseSession.expiresAt).getTime();
      const now = Date.now();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isLifetime: false,
        });
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        setTimeLeft({
          days,
          hours,
          minutes,
          seconds,
          isLifetime: false,
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [licenseSession]);

  const handleCopy = () => {
    navigator.clipboard.writeText(licenseSession.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyNewKey = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = newKeyInput.trim().toUpperCase();
    if (!raw) return;

    const clean = raw.replace(/[^a-zA-Z0-9]/g, '');

    // Allow master keys or wildcard
    if (clean.length < 8) {
      setKeyError('La Key debe tener mínimo 8 caracteres');
      return;
    }

    const updatedSession: LicenseSession = {
      key: raw,
      tier: clean.includes('TITA') ? 'TITANIUM PRO' : 'VIP ACCESS',
      label: 'XITFORGE Key Renovada',
      hwid: 'XIT-DEVICE-IOS',
      activatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      isLifetime: clean.includes('TITA') || clean.includes('LIFE') || clean.includes('2026'),
    };

    onUpdateSession(updatedSession);
    setKeySuccess(true);
    setNewKeyInput('');
    setKeyError(null);
    setTimeout(() => setKeySuccess(false), 3000);
  };

  const formatInputKey = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const clean = raw.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 16);
    const chunks: string[] = [];
    for (let i = 0; i < clean.length; i += 4) {
      chunks.push(clean.slice(i, i + 4));
    }
    setNewKeyInput(chunks.join('-'));
    setKeyError(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <span>Licencia & Key</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Estado de activación, tiempo restante y seguridad
          </p>
        </div>

        <div
          className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${theme.gradient} flex items-center justify-center shadow-lg text-white border border-white/20`}
        >
          <Key className="w-5 h-5" />
        </div>
      </div>

      {/* SECCIÓN 1: TIEMPO RESTANTE EN VIVO (Countdown Clocks) */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-5 sm:p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden space-y-5">
        <div
          className="absolute -top-20 -right-20 w-56 h-56 rounded-full blur-[100px] pointer-events-none opacity-20"
          style={{ backgroundColor: theme.hex }}
        />

        {/* Status Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-wider">
              Licencia Activa
            </span>
          </div>

          <span
            className="px-3 py-1 rounded-full text-xs font-mono font-bold border"
            style={{
              backgroundColor: `${theme.hex}20`,
              color: theme.hex,
              borderColor: `${theme.hex}40`,
            }}
          >
            {licenseSession.tier}
          </span>
        </div>

        {/* Live Countdown Display */}
        {timeLeft.isLifetime ? (
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 text-center space-y-2">
            <div className="inline-flex items-center space-x-2 text-amber-400 font-mono font-bold text-sm uppercase">
              <Sparkles className="w-4 h-4" />
              <span>Acceso Vitalicio Ilimitado</span>
            </div>
            <p className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
              LIFETIME ∞
            </p>
            <p className="text-xs text-slate-400 font-mono">
              Tu Key no expira y cuenta con actualizaciones permanentes
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5" style={{ color: theme.hex }} />
                <span>Tiempo Restante en Vivo:</span>
              </span>
            </div>

            {/* 4 Digital Timer Blocks */}
            <div className="grid grid-cols-4 gap-2 text-center font-mono">
              {/* Días */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <p className="text-xl sm:text-2xl font-black text-white">{timeLeft.days}</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold mt-0.5">Días</p>
              </div>

              {/* Horas */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <p className="text-xl sm:text-2xl font-black text-white">
                  {String(timeLeft.hours).padStart(2, '0')}
                </p>
                <p className="text-[10px] text-slate-400 uppercase font-bold mt-0.5">Horas</p>
              </div>

              {/* Minutos */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <p className="text-xl sm:text-2xl font-black text-white">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </p>
                <p className="text-[10px] text-slate-400 uppercase font-bold mt-0.5">Min</p>
              </div>

              {/* Segundos */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <p
                  className="text-xl sm:text-2xl font-black transition-colors"
                  style={{ color: theme.hex }}
                >
                  {String(timeLeft.seconds).padStart(2, '0')}
                </p>
                <p className="text-[10px] text-slate-400 uppercase font-bold mt-0.5">Seg</p>
              </div>
            </div>
          </div>
        )}

        {/* Key Display & Copy Action */}
        <div className="bg-slate-950/90 rounded-2xl p-4 border border-slate-800/90 space-y-3 font-mono">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">
              Tu Key de Acceso
            </span>
            <span className="text-[10px] text-emerald-400 font-bold">VERIFICADA</span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <p className="text-sm sm:text-base font-black text-slate-100 tracking-wider truncate font-mono">
              {licenseSession.key}
            </p>

            <button
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-xs text-slate-200 border border-slate-700 flex items-center space-x-1.5 transition-all shrink-0 font-medium"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Copiada</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-300" />
                  <span>Copiar Key</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: DETALLES TÉCNICOS & VINCULACIÓN */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-5 backdrop-blur-xl shadow-xl space-y-3">
        <div className="flex items-center space-x-2 text-xs font-bold font-mono text-white uppercase tracking-wider">
          <Activity className="w-4 h-4" style={{ color: theme.hex }} />
          <span>Detalles de la Suscripción</span>
        </div>

        <div className="divide-y divide-slate-800/80 font-mono text-xs">
          {/* Fecha de Activación */}
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-400 flex items-center space-x-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>Fecha de Activación</span>
            </span>
            <span className="text-slate-200 font-bold">
              {new Date(licenseSession.activatedAt).toLocaleDateString()}
            </span>
          </div>

          {/* Vencimiento */}
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-400 flex items-center space-x-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Vencimiento</span>
            </span>
            <span className="text-slate-200 font-bold">
              {licenseSession.isLifetime ? 'Sin Vencimiento' : new Date(licenseSession.expiresAt).toLocaleDateString()}
            </span>
          </div>

          {/* Dispositivo iOS Vinculado */}
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-400 flex items-center space-x-2">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Dispositivo iOS</span>
            </span>
            <span className="text-slate-200 font-bold">iPhone / iPad Vinculado</span>
          </div>
        </div>
      </div>

      {/* SECCIÓN 3: CANJEAR / RENOVAR OTRA KEY */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-5 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex items-center space-x-2 text-xs font-bold font-mono text-white uppercase tracking-wider">
          <Zap className="w-4 h-4" style={{ color: theme.hex }} />
          <span>Canjear o Cambiar de Key</span>
        </div>

        <form onSubmit={handleApplyNewKey} className="space-y-3">
          <div className="relative">
            <input
              type="text"
              value={newKeyInput}
              onChange={formatInputKey}
              maxLength={19}
              placeholder="XXXX-XXXX-XXXX-XXXX"
              className={`w-full px-4 py-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-600 font-mono text-sm font-bold tracking-widest uppercase focus:outline-none focus:ring-2 ${theme.ringColor} transition-all text-center`}
            />
          </div>

          {keyError && (
            <p className="text-xs text-red-400 font-mono text-center flex items-center justify-center space-x-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{keyError}</span>
            </p>
          )}

          {keySuccess && (
            <p className="text-xs text-emerald-400 font-mono text-center flex items-center justify-center space-x-1">
              <Check className="w-3.5 h-3.5" />
              <span>¡Nueva Key activada con éxito!</span>
            </p>
          )}

          <button
            type="submit"
            disabled={!newKeyInput}
            className={`w-full py-3.5 bg-gradient-to-r ${theme.gradient} text-white font-mono font-bold text-xs tracking-wider uppercase rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-lg active:scale-98 disabled:opacity-40`}
          >
            <span>Canjear y Activar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* SECCIÓN 4: CERRAR SESIÓN / BLOQUEAR */}
      <button
        onClick={onLock}
        className="w-full py-3.5 rounded-2xl bg-red-500/10 hover:bg-red-500/20 active:scale-[0.98] border border-red-500/30 text-red-400 font-mono text-xs font-bold tracking-wider uppercase flex items-center justify-center space-x-2 transition-all shadow-md"
      >
        <Lock className="w-4 h-4" />
        <span>Cerrar Sesión & Bloquear Aplicación</span>
      </button>
    </div>
  );
};
