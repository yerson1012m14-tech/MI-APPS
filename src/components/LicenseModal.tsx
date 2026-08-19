import React, { useState } from 'react';
import { LicenseSession } from './AccessGate';
import { 
  ShieldCheck, 
  KeyRound, 
  Fingerprint, 
  Calendar, 
  Clock, 
  Layers, 
  Cpu, 
  Check, 
  Copy, 
  Lock, 
  ExternalLink,
  Sparkles,
  Zap
} from 'lucide-react';

interface LicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: LicenseSession | null;
  onLock: () => void;
}

export const LicenseModal: React.FC<LicenseModalProps> = ({
  isOpen,
  onClose,
  session,
  onLock,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !session) return null;

  const handleCopyKey = () => {
    navigator.clipboard.writeText(session.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const remainingDays = Math.max(
    0,
    Math.ceil(
      (new Date(session.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200 text-slate-100">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-lg text-white font-mono uppercase">
                  XIT<span className="text-blue-500">FORGE</span> License
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold">
                  {session.tier}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">Credenciales y estado de autenticación</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-xs font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* License Main Banner */}
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center space-x-1.5">
              <KeyRound className="w-4 h-4 text-blue-400" />
              <span>CLAVE DE LICENCIA:</span>
            </span>

            <button
              onClick={handleCopyKey}
              className="flex items-center space-x-1 text-blue-400 hover:text-blue-300"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado' : 'Copiar'}</span>
            </button>
          </div>

          <p className="text-base font-bold text-slate-100 tracking-wider bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 select-all">
            {session.key}
          </p>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/80">
              <p className="text-slate-500 text-[10px]">ESTADO</p>
              <p className="font-bold text-emerald-400 text-xs mt-0.5">✓ ACTIVA / AUTORIZADA</p>
            </div>

            <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/80">
              <p className="text-slate-500 text-[10px]">VIGENCIA</p>
              <p className="font-bold text-slate-200 text-xs mt-0.5">
                {session.isLifetime || remainingDays > 3000
                  ? 'ILIMITADO (LIFETIME)'
                  : `${remainingDays} Días restantes`}
              </p>
            </div>
          </div>
        </div>

        {/* Hardware & Security specs */}
        <div className="space-y-2 font-mono text-xs">
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400 flex items-center space-x-2">
              <Fingerprint className="w-4 h-4 text-indigo-400" />
              <span>Firma HWID:</span>
            </span>
            <span className="text-slate-200 text-[11px]">{session.hwid}</span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Activado el:</span>
            </span>
            <span className="text-slate-200 text-[11px]">
              {new Date(session.activatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onLock();
              onClose();
            }}
            className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-mono font-bold flex items-center space-x-2 transition-colors"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Bloquear / Cambiar Key</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-md shadow-blue-600/20"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
