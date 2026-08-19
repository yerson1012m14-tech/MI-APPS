import React, { useState, useEffect } from 'react';
import { useSettings } from '../utils/settingsContext';
import { 
  Plus, 
  Trash2, 
  Flame, 
  Sparkles, 
  Globe, 
  Code2, 
  Copy, 
  Check, 
  Radio, 
  Sliders, 
  ToggleLeft, 
  Layers, 
  Save, 
  RefreshCw, 
  ShieldCheck, 
  Server,
  Terminal,
  Cpu
} from 'lucide-react';

export interface OptionItem {
  id: string;
  game: 'normal' | 'max' | 'all';
  name: string;
  category: string;
  type: 'switch' | 'slider' | 'select' | 'button';
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

interface AdminPanelProps {
  onClose?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const { theme } = useSettings();
  const [options, setOptions] = useState<OptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [showJsonView, setShowJsonView] = useState(false);
  const [filterGame, setFilterGame] = useState<'all' | 'normal' | 'max'>('all');

  // Form states for new option
  const [formGame, setFormGame] = useState<'all' | 'normal' | 'max'>('all');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Sensibilidad');
  const [customCategory, setCustomCategory] = useState('');
  const [formType, setFormType] = useState<'switch' | 'slider' | 'select' | 'button'>('switch');
  const [formBadge, setFormBadge] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formDefaultValue, setFormDefaultValue] = useState(90);
  const [formSelectOptions, setFormSelectOptions] = useState('Opción 1, Opción 2, Opción 3');

  // Load from API
  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/xitforge/config');
      if (res.ok) {
        const data = await res.json();
        setOptions(data.options || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  // Add new option
  const handleAddOption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    setSaving(true);
    const resolvedCategory = formCategory === 'CUSTOM' ? (customCategory.trim() || 'General') : formCategory;

    const newOpt: Partial<OptionItem> = {
      name: formName.trim(),
      game: formGame,
      category: resolvedCategory,
      type: formType,
      description: formDesc.trim() || undefined,
      badge: formBadge.trim() || undefined,
      enabled: formType === 'switch' ? true : undefined,
      value: formType === 'slider' ? Number(formDefaultValue) : undefined,
      min: formType === 'slider' ? 0 : undefined,
      max: formType === 'slider' ? 100 : undefined,
      step: formType === 'slider' ? 1 : undefined,
      options: formType === 'select' ? formSelectOptions.split(',').map(s => s.trim()).filter(Boolean) : undefined,
      selectedOption: formType === 'select' ? formSelectOptions.split(',')[0]?.trim() : undefined,
    };

    try {
      const res = await fetch('/api/xitforge/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOpt)
      });

      if (res.ok) {
        // Reset form
        setFormName('');
        setFormDesc('');
        setFormBadge('');
        setCustomCategory('');
        await fetchConfig();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Delete option
  const handleDeleteOption = async (id: string) => {
    try {
      const res = await fetch(`/api/xitforge/options/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setOptions(prev => prev.filter(o => o.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyApiUrl = () => {
    const fullUrl = `${window.location.origin}/api/xitforge/config`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const filteredList = options.filter(opt => {
    if (filterGame === 'all') return true;
    return opt.game === 'all' || opt.game === filterGame;
  });

  return (
    <div className="space-y-6 font-mono pb-8">
      {/* Header Panel XITFORGE */}
      <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg"
              style={{ backgroundColor: `${theme.hex}30`, borderColor: theme.hex, borderWidth: 1 }}
            >
              <Cpu className="w-5 h-5" style={{ color: theme.hex }} />
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-tight flex items-center space-x-2">
                <span>PANEL XITFORGE</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ADMIN PC
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Gestión en tiempo real de opciones para la IPA
              </p>
            </div>
          </div>

          <button
            onClick={fetchConfig}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 border border-slate-700 transition-all"
            title="Recargar datos"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Flujo Arquitectura Visual */}
        <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center space-x-1.5 text-blue-400 font-bold">
            <Server className="w-3.5 h-3.5" />
            <span>PANEL XITFORGE</span>
          </div>
          <span className="text-slate-500 hidden sm:inline">➔</span>
          <div className="flex items-center space-x-1.5 text-purple-400 font-bold">
            <Code2 className="w-3.5 h-3.5" />
            <span>API / JSON</span>
          </div>
          <span className="text-slate-500 hidden sm:inline">➔</span>
          <div className="flex items-center space-x-1.5 text-amber-400 font-bold">
            <Terminal className="w-3.5 h-3.5" />
            <span>XITFORGE IPA</span>
          </div>
          <span className="text-slate-500 hidden sm:inline">➔</span>
          <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>JUEGOS / OPCIONES</span>
          </div>
        </div>

        {/* API Endpoint & Acciones */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800 text-xs">
          <div className="flex items-center space-x-2 text-slate-400">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] text-slate-300 truncate max-w-[200px] sm:max-w-xs">
              /api/xitforge/config
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyApiUrl}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] border border-slate-700 active:scale-95 transition-all"
            >
              {copiedUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedUrl ? '¡Copiado!' : 'Copiar URL API'}</span>
            </button>

            <button
              onClick={() => setShowJsonView(!showJsonView)}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] border border-slate-700 active:scale-95 transition-all"
            >
              <Code2 className="w-3 h-3" />
              <span>{showJsonView ? 'Ocultar JSON' : 'Ver JSON'}</span>
            </button>
          </div>
        </div>

        {/* JSON Viewer */}
        {showJsonView && (
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] text-emerald-400 overflow-x-auto max-h-60">
            <pre>{JSON.stringify({ total: options.length, options }, null, 2)}</pre>
          </div>
        )}
      </div>

      {/* FORMULARIO: AGREGAR NUEVA OPCIÓN A LA IPA */}
      <form
        onSubmit={handleAddOption}
        className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-xl space-y-4"
      >
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-2.5">
          <Plus className="w-4 h-4" style={{ color: theme.hex }} />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Agregar Nueva Opción a la IPA
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Nombre de la Opción */}
          <div className="space-y-1 sm:col-span-2">
            <label className="text-[11px] text-slate-400">Nombre de la Opción *</label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Ej: Sensibilidad Pro V3, Modo 120FPS, etc."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Juego Destino */}
          <div className="space-y-1">
            <label className="text-[11px] text-slate-400">Juego Destino</label>
            <select
              value={formGame}
              onChange={(e) => setFormGame(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
            >
              <option value="all">Ambos Juegos (Normal & MAX)</option>
              <option value="normal">Solo Free Fire Normal</option>
              <option value="max">Solo Free Fire MAX</option>
            </select>
          </div>

          {/* Tipo de Control */}
          <div className="space-y-1">
            <label className="text-[11px] text-slate-400">Tipo de Control</label>
            <select
              value={formType}
              onChange={(e) => setFormType(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
            >
              <option value="switch">Interruptor (Switch On / Off)</option>
              <option value="slider">Barra Deslizante (Slider 0-100%)</option>
              <option value="select">Selector de Modos (Botones)</option>
              <option value="button">Botón de Acción Directa</option>
            </select>
          </div>

          {/* Categoría */}
          <div className="space-y-1">
            <label className="text-[11px] text-slate-400">Categoría</label>
            <select
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
            >
              <option value="Sensibilidad">Sensibilidad</option>
              <option value="Optimización">Optimización</option>
              <option value="Pantalla">Pantalla / HUD</option>
              <option value="General">General</option>
              <option value="Especiales">Especiales</option>
              <option value="CUSTOM">+ Nueva Categoría...</option>
            </select>
          </div>

          {/* Badge / Etiqueta Opcional */}
          <div className="space-y-1">
            <label className="text-[11px] text-slate-400">Etiqueta / Badge (Opcional)</label>
            <input
              type="text"
              value={formBadge}
              onChange={(e) => setFormBadge(e.target.value)}
              placeholder="Ej: NUEVO, PRO, 120HZ"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none"
            />
          </div>

          {/* Input para Nueva Categoría si eligió CUSTOM */}
          {formCategory === 'CUSTOM' && (
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[11px] text-slate-400">Escribe el nombre de la nueva categoría</label>
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Ej: Rendimiento, Calibración, etc."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
              />
            </div>
          )}

          {/* Campos específicos según el tipo */}
          {formType === 'slider' && (
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[11px] text-slate-400">Valor Inicial Predeterminado ({formDefaultValue}%)</label>
              <input
                type="range"
                min={0}
                max={100}
                value={formDefaultValue}
                onChange={(e) => setFormDefaultValue(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>
          )}

          {formType === 'select' && (
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[11px] text-slate-400">Opciones separadas por coma</label>
              <input
                type="text"
                value={formSelectOptions}
                onChange={(e) => setFormSelectOptions(e.target.value)}
                placeholder="Modo 1, Modo 2, Modo 3"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
              />
            </div>
          )}

          {/* Descripción */}
          <div className="space-y-1 sm:col-span-2">
            <label className="text-[11px] text-slate-400">Descripción Explicativa</label>
            <input
              type="text"
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              placeholder="Breve explicación de lo que hace esta opción..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving || !formName.trim()}
          className="w-full py-3 rounded-2xl text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg active:scale-98 transition-all disabled:opacity-50"
          style={{ backgroundColor: theme.hex }}
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Guardando en la Nube...' : 'Guardar y Publicar en la IPA'}</span>
        </button>
      </form>

      {/* LISTA DE OPCIONES ACTIVAS PUBLICADAS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-slate-400" />
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Opciones Activas ({filteredList.length})
            </h3>
          </div>

          {/* Filtro por juego */}
          <div className="flex space-x-1 bg-slate-900 p-0.5 rounded-xl border border-slate-800 text-[10px]">
            <button
              onClick={() => setFilterGame('all')}
              className={`px-2 py-1 rounded-lg ${filterGame === 'all' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400'}`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterGame('normal')}
              className={`px-2 py-1 rounded-lg ${filterGame === 'normal' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400'}`}
            >
              Normal
            </button>
            <button
              onClick={() => setFilterGame('max')}
              className={`px-2 py-1 rounded-lg ${filterGame === 'max' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400'}`}
            >
              MAX
            </button>
          </div>
        </div>

        {filteredList.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/50 rounded-3xl border border-slate-800 text-xs text-slate-500">
            No hay opciones creadas todavía. ¡Agrega la primera arriba!
          </div>
        ) : (
          <div className="space-y-2">
            {filteredList.map((opt) => (
              <div
                key={opt.id}
                className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center space-x-2 flex-wrap">
                    <span className="font-bold text-white truncate">{opt.name}</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-slate-800 text-slate-300 border border-slate-700">
                      {opt.category}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-blue-500/10 text-blue-300 border border-blue-500/20 uppercase">
                      {opt.type}
                    </span>
                    {opt.game !== 'all' && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        {opt.game === 'normal' ? 'Normal' : 'MAX'}
                      </span>
                    )}
                  </div>
                  {opt.description && (
                    <p className="text-[10px] text-slate-400 truncate">{opt.description}</p>
                  )}
                </div>

                <button
                  onClick={() => handleDeleteOption(opt.id)}
                  className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0"
                  title="Eliminar opción"
                >
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
