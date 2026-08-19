import React, { useState } from 'react';
import { 
  Bookmark, 
  Trash2, 
  Plus, 
  ExternalLink, 
  Download, 
  Sparkles, 
  Search, 
  FileBox, 
  ArrowRight,
  Layers
} from 'lucide-react';

interface SavedBookmarksProps {
  savedRepos: string[];
  onRemoveSavedRepo: (fullName: string) => void;
  onAddCustomRepo: (fullName: string) => void;
  onOpenRepo: (fullName: string) => void;
}

export const SavedBookmarks: React.FC<SavedBookmarksProps> = ({
  savedRepos,
  onRemoveSavedRepo,
  onAddCustomRepo,
  onOpenRepo,
}) => {
  const [customInput, setCustomInput] = useState('');
  const [filterQuery, setFilterQuery] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customInput
      .trim()
      .replace(/^https?:\/\/github\.com\//, '')
      .replace(/\/$/, '');

    if (clean && clean.includes('/')) {
      onAddCustomRepo(clean);
      setCustomInput('');
    } else {
      alert('Introduce un formato válido de repositorio de GitHub (ejemplo: usuario/repositorio)');
    }
  };

  const filtered = savedRepos.filter((r) => r.toLowerCase().includes(filterQuery.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <Bookmark className="w-4 h-4" />
          <span>Repositorios Seguidos y Marcadores</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Mis Repositorios de IPAs Guardados
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Guarda y haz seguimiento de tus proyectos favoritos de GitHub para acceder rápidamente a sus nuevas versiones y descargas directas.
        </p>

        {/* Add custom repo form */}
        <form onSubmit={handleAdd} className="mt-5 flex flex-col sm:flex-row gap-2 max-w-xl">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Añadir repositorio custom (ej. autor/nombre-del-repo)"
            className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-amber-500 font-mono"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center space-x-1.5 transition-all shadow-md shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir</span>
          </button>
        </form>
      </div>

      {/* List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-base font-bold text-white">
            Repositorios Guardados ({savedRepos.length})
          </h2>

          {savedRepos.length > 3 && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Filtrar guardados..."
                className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          )}
        </div>

        {savedRepos.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center space-y-3">
            <Bookmark className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="font-semibold text-slate-300 text-sm">Aún no tienes repositorios guardados</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Puedes marcar repositorios como favoritos desde la pestaña Explorador o escribir el nombre de cualquier repositorio de GitHub arriba.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((repoFullName) => (
              <div
                key={repoFullName}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex items-center justify-between transition-all group"
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                    {repoFullName.split('/')[1]?.substring(0, 2).toUpperCase() || 'GH'}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold text-slate-100 text-xs sm:text-sm group-hover:text-amber-400 transition-colors truncate">
                      {repoFullName.split('/')[1] || repoFullName}
                    </p>
                    <p className="text-[11px] font-mono text-slate-400 truncate">
                      {repoFullName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1 shrink-0 ml-2">
                  <button
                    onClick={() => onOpenRepo(repoFullName)}
                    className="p-2 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white rounded-lg text-xs transition-all flex items-center space-x-1"
                    title="Ver releases"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onRemoveSavedRepo(repoFullName)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg text-xs transition-colors"
                    title="Eliminar de favoritos"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
