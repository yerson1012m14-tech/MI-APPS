import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, RefreshCw, Save, Settings2 } from 'lucide-react';
import { useSettings } from '../utils/settingsContext';

export type OptionType = 'switch' | 'slider' | 'select' | 'button';
export type OptionGame = 'normal' | 'max' | 'all';

export interface AdminOption {
  id: string;
  game: OptionGame;
  name: string;
  category: string;
  type: OptionType;
  enabled?: boolean;
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  selectedOption?: string;
  description?: string;
  badge?: string;
  createdAt?: string;
}

interface ConfigResponse {
  categories: string[];
  options: AdminOption[];
}

const emptyForm = {
  game: 'all' as OptionGame,
  name: '',
  category: 'General',
  type: 'switch' as OptionType,
  description: '',
  badge: '',
  enabled: true,
  value: 50,
  min: 0,
  max: 100,
  step: 1,
  optionsText: '',
};

export const AdminView: React.FC = () => {
  const { theme } = useSettings();
  const [config, setConfig] = useState<ConfigResponse>({ categories: [], options: [] });
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [filterGame, setFilterGame] = useState<OptionGame>('all');

  const loadConfig = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/xitforge/config');
      if (!res.ok) throw new Error('No se pudo cargar la configuración');
      const data = await res.json();
      setConfig({ categories: data.categories || [], options: data.options || [] });
    } catch (error) {
      console.error(error);
      setMessage('No se pudo cargar el panel. Revisa que el servidor esté encendido.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const visibleOptions = useMemo(() => {
    if (filterGame === 'all') return config.options;
    return config.options.filter((option) => option.game === 'all' || option.game === filterGame);
  }, [config.options, filterGame]);

  const createOption = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setMessage('Escribe un nombre para la opción.');
      return;
    }

    setSaving(true);
    setMessage('');
    try {
      const payload: AdminOption = {
        id: `opt_${Date.now()}`,
        game: form.game,
        name: form.name.trim(),
        category: form.category.trim() || 'General',
        type: form.type,
        description: form.description.trim() || undefined,
        badge: form.badge.trim() || undefined,
        enabled: form.enabled,
      };

      if (form.type === 'slider') {
        payload.value = Number(form.value);
        payload.min = Number(form.min);
        payload.max = Number(form.max);
        payload.step = Number(form.step);
      }

      if (form.type === 'select') {
        const parsed = form.optionsText
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);
        if (!parsed.length) {
          setMessage('Para un Select debes poner al menos una opción.');
          return;
        }
        payload.options = parsed;
        payload.selectedOption = parsed[0];
      }

      const res = await fetch('/api/xitforge/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'No se pudo guardar');

      setMessage('✅ Opción agregada correctamente.');
      setForm(emptyForm);
      await loadConfig();
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : 'Error al guardar la opción.');
    } finally {
      setSaving(false);
    }
  };

  const deleteOption = async (id: string, name: string) => {
    if (!window.confirm(`¿Eliminar "${name}"?`)) return;
    try {
      const res = await fetch(`/api/xitforge/options/${encodeURIComponent(id)}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'No se pudo eliminar');
      setMessage('🗑️ Opción eliminada.');
      await loadConfig();
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : 'Error al eliminar.');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-5 py-2 pb-8 animate-in fade-in duration-200">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Settings2 className="w-5 h-5" style={{ color: theme.hex }} />
            Panel XITFORGE
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">Agrega y administra las opciones que luego consumirá la IPA.</p>
        </div>
        <button
          onClick={loadConfig}
          disabled={loading}
          className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white active:scale-95 transition-all"
          title="Actualizar"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <form onSubmit={createOption} className="rounded-3xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 space-y-4 shadow-xl">
        <div className="flex items-center gap-2">
          <Plus className="w-4 h-4" style={{ color: theme.hex }} />
          <h2 className="text-sm font-bold text-white font-mono">Nueva opción</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="space-y-1.5">
            <span className="text-[11px] text-slate-400 font-mono">Nombre</span>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej. Sensibilidad General" className="w-full px-3 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-slate-600" />
          </label>

          <label className="space-y-1.5">
            <span className="text-[11px] text-slate-400 font-mono">Juego</span>
            <select value={form.game} onChange={(e) => setForm({ ...form, game: e.target.value as OptionGame })} className="w-full px-3 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none">
              <option value="all">Todos</option>
              <option value="normal">Free Fire</option>
              <option value="max">Free Fire MAX</option>
            </select>
          </label>

          <label className="space-y-1.5">
            <span className="text-[11px] text-slate-400 font-mono">Categoría</span>
            <input list="xitforge-categories" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="General" className="w-full px-3 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-slate-600" />
            <datalist id="xitforge-categories">
              {config.categories.map((category) => <option key={category} value={category} />)}
            </datalist>
          </label>

          <label className="space-y-1.5">
            <span className="text-[11px] text-slate-400 font-mono">Tipo</span>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as OptionType })} className="w-full px-3 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none">
              <option value="switch">Switch</option>
              <option value="slider">Slider</option>
              <option value="select">Select</option>
              <option value="button">Botón</option>
            </select>
          </label>
        </div>

        {form.type === 'slider' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[['value', 'Valor', form.value], ['min', 'Mínimo', form.min], ['max', 'Máximo', form.max], ['step', 'Paso', form.step]].map(([key, label, value]) => (
              <label key={String(key)} className="space-y-1.5">
                <span className="text-[11px] text-slate-400 font-mono">{label}</span>
                <input type="number" value={Number(value)} onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) })} className="w-full px-3 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none" />
              </label>
            ))}
          </div>
        )}

        {form.type === 'select' && (
          <label className="space-y-1.5 block">
            <span className="text-[11px] text-slate-400 font-mono">Opciones (separadas por coma)</span>
            <input value={form.optionsText} onChange={(e) => setForm({ ...form, optionsText: e.target.value })} placeholder="2 Dedos, 3 Dedos, 4 Dedos" className="w-full px-3 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none" />
          </label>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="space-y-1.5">
            <span className="text-[11px] text-slate-400 font-mono">Badge</span>
            <input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="PRO" className="w-full px-3 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none" />
          </label>
          <label className="space-y-1.5">
            <span className="text-[11px] text-slate-400 font-mono">Descripción</span>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe la opción" className="w-full px-3 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none" />
          </label>
        </div>

        <label className="flex items-center gap-2 text-xs text-slate-300 font-mono cursor-pointer">
          <input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} />
          Activa al crear
        </label>

        <button disabled={saving} className={`w-full py-3.5 rounded-2xl bg-gradient-to-r ${theme.gradient} text-white font-mono font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] transition-all`}>
          <Save className="w-4 h-4" />
          {saving ? 'Guardando...' : 'Guardar opción'}
        </button>
      </form>

      {message && <div className="rounded-2xl bg-slate-900/90 border border-slate-800 px-4 py-3 text-xs text-slate-300 font-mono">{message}</div>}

      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-white font-mono">Opciones existentes ({visibleOptions.length})</h2>
          <select value={filterGame} onChange={(e) => setFilterGame(e.target.value as OptionGame)} className="px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200">
            <option value="all">Todos</option>
            <option value="normal">Free Fire</option>
            <option value="max">Free Fire MAX</option>
          </select>
        </div>

        {loading ? (
          <div className="text-xs text-slate-500 font-mono">Cargando...</div>
        ) : visibleOptions.length === 0 ? (
          <div className="text-xs text-slate-500 font-mono py-5 text-center">No hay opciones todavía.</div>
        ) : (
          <div className="space-y-2">
            {visibleOptions.map((option) => (
              <div key={option.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-white truncate">{option.name}</span>
                    {option.badge && <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/20 font-mono">{option.badge}</span>}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">{option.game.toUpperCase()} · {option.category} · {option.type}</div>
                </div>
                <button onClick={() => deleteOption(option.id, option.name)} className="shrink-0 p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20 active:scale-95 transition-all" title="Eliminar">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
