import React, { useState, useEffect } from 'react';
import { getStoredToken, setStoredToken, checkRateLimit, RateLimitInfo } from '../utils/githubApi';
import { Key, ShieldCheck, ExternalLink, RefreshCw, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

interface TokenModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TokenModal: React.FC<TokenModalProps> = ({ isOpen, onClose }) => {
  const [token, setToken] = useState('');
  const [rateInfo, setRateInfo] = useState<RateLimitInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setToken(getStoredToken());
      loadRateInfo();
    }
  }, [isOpen]);

  const loadRateInfo = async () => {
    setLoading(true);
    const info = await checkRateLimit();
    setRateInfo(info);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStoredToken(token);
    setStatusMessage({ type: 'success', text: 'Token guardado en tu navegador.' });
    await loadRateInfo();
    setTimeout(() => {
      setStatusMessage(null);
      onClose();
    }, 1200);
  };

  const handleRemove = async () => {
    setStoredToken('');
    setToken('');
    setStatusMessage({ type: 'success', text: 'Token eliminado.' });
    await loadRateInfo();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Configurar GitHub Token</h3>
              <p className="text-xs text-slate-400">Aumenta el límite de consultas a la API de GitHub</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-xs font-bold"
          >
            ✕
          </button>
        </div>

        {/* Current Rate Limit Status */}
        <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
          <div>
            <p className="text-slate-400">Límite de peticiones actual:</p>
            <p className="font-bold text-white text-sm mt-0.5">
              {rateInfo ? `${rateInfo.remaining} / ${rateInfo.limit} disponibles` : 'Consultando...'}
            </p>
          </div>

          <button
            onClick={loadRateInfo}
            disabled={loading}
            className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
            title="Actualizar estado"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              GitHub Personal Access Token (Clásico o Fine-Grained):
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-600 font-mono text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                  : 'bg-red-500/10 text-red-300 border border-red-500/30'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{statusMessage.text}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            {token ? (
              <button
                type="button"
                onClick={handleRemove}
                className="px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Quitar Token</span>
              </button>
            ) : <div />}

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20"
              >
                Guardar Token
              </button>
            </div>
          </div>
        </form>

        {/* Security & Info Notice */}
        <div className="p-3 bg-slate-950/50 border border-slate-800/80 rounded-xl text-[11px] text-slate-400 space-y-1">
          <div className="flex items-center space-x-1.5 text-slate-300 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Almacenamiento 100% Local</span>
          </div>
          <p>
            Tu token se guarda exclusivamente en el almacenamiento local (<code className="text-slate-300">localStorage</code>) de tu navegador para autenticar las peticiones a la API de GitHub y permitir hasta <strong>5,000 peticiones/hora</strong>.
          </p>
          <a
            href="https://github.com/settings/tokens/new"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center space-x-1 text-blue-400 hover:underline pt-1"
          >
            <span>Crear nuevo token en GitHub</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
