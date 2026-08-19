import React, { useState, useEffect } from 'react';
import { CURATED_IPA_REPOS } from '../data/curatedRepos';
import { CuratedIPARepo, GitHubRelease, GitHubRepo } from '../types';
import { 
  fetchRepoDetails, 
  fetchRepoReleases, 
  searchGitHubRepos, 
  filterIpaAssets, 
  formatBytes 
} from '../utils/githubApi';
import { 
  Search, 
  Star, 
  Download, 
  ExternalLink, 
  Layers, 
  Sparkles, 
  Tag, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  FileBox, 
  Copy, 
  Check, 
  Bookmark, 
  BookmarkCheck,
  ChevronRight,
  Info,
  Smartphone,
  ArrowDownToLine,
  RefreshCw,
  Eye
} from 'lucide-react';

interface RepoExplorerProps {
  onSelectIpaForInspection?: (url: string, fileName: string) => void;
  savedRepos: string[];
  onToggleSaveRepo: (repoFullName: string) => void;
  onAddToSourceList?: (app: { name: string; bundleId: string; version: string; downloadUrl: string; size?: number }) => void;
}

export const RepoExplorer: React.FC<RepoExplorerProps> = ({
  onSelectIpaForInspection,
  savedRepos,
  onToggleSaveRepo,
  onAddToSourceList,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchingGitHub, setIsSearchingGitHub] = useState(false);
  const [searchResults, setSearchResults] = useState<GitHubRepo[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Active selected repo for modal/drawer
  const [activeRepo, setActiveRepo] = useState<{ name: string; fullName: string; description?: string } | null>(null);
  const [releases, setReleases] = useState<GitHubRelease[]>([]);
  const [loadingReleases, setLoadingReleases] = useState(false);
  const [releasesError, setReleasesError] = useState<string | null>(null);

  // Copy URL state helper
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const categories = [
    { id: 'all', label: '⭐ Destacados' },
    { id: 'sideloading', label: '🚀 Sideloading' },
    { id: 'emulators', label: '🎮 Emuladores' },
    { id: 'media', label: '🎵 Multimedia' },
    { id: 'tweaks', label: '🧩 Tweaks' },
    { id: 'utilities', label: '🛠️ Utilidades' },
  ];

  // Filter curated repos
  const filteredCurated = CURATED_IPA_REPOS.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.repo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Handle direct GitHub Search
  const handleGitHubSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    // If query is an exact user/repo (e.g. opa334/TrollStore)
    if (searchQuery.includes('/') && !searchQuery.includes(' ')) {
      openRepoReleases({
        name: searchQuery.split('/')[1] || searchQuery,
        fullName: searchQuery.trim(),
        description: 'Repositorio directo de GitHub',
      });
      return;
    }

    setIsSearchingGitHub(true);
    setSearchError(null);
    try {
      const results = await searchGitHubRepos(`${searchQuery} ipa`);
      setSearchResults(results);
      if (results.length === 0) {
        setSearchError('No se encontraron repositorios de iOS IPA con esa búsqueda.');
      }
    } catch (err: any) {
      setSearchError(err.message || 'Error al buscar en GitHub.');
    } finally {
      setIsSearchingGitHub(false);
    }
  };

  const openRepoReleases = async (repo: { name: string; fullName: string; description?: string }) => {
    setActiveRepo(repo);
    setLoadingReleases(true);
    setReleasesError(null);
    try {
      const rels = await fetchRepoReleases(repo.fullName, 12);
      setReleases(rels);
      if (rels.length === 0) {
        setReleasesError('Este repositorio no tiene versiones (Releases) publicadas en GitHub.');
      }
    } catch (err: any) {
      setReleasesError(err.message || 'Error al cargar versiones de GitHub.');
    } finally {
      setLoadingReleases(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-3xl">
          <div className="flex items-center space-x-2 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Directorio de IPAs Open-Source</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Descubre y Descarga Aplicaciones IPA para iOS
          </h1>
          <p className="text-slate-400 text-sm sm:text-base mt-2">
            Explora las mejores aplicaciones de código abierto alojadas en GitHub. Descarga directamente los archivos <code className="text-blue-300 bg-slate-800 px-1 py-0.5 rounded text-xs">.ipa</code>, inspeciona su firma o genera enlaces para TrollStore y AltStore.
          </p>

          {/* Search bar */}
          <form onSubmit={handleGitHubSearch} className="mt-5 flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="search-ipa-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar app, tweak (ej. uYou, Delta, TrollStore) o usuario/repo..."
                className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm transition-all"
              />
            </div>
            <button
              id="search-github-btn"
              type="submit"
              disabled={isSearchingGitHub}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl text-sm flex items-center justify-center space-x-2 transition-all shadow-md shadow-blue-600/20 disabled:opacity-50"
            >
              {isSearchingGitHub ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Buscando...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Buscar en GitHub</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setSearchResults([]);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                selectedCategory === cat.id && searchResults.length === 0
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-850 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {searchResults.length > 0 && (
          <button
            onClick={() => {
              setSearchResults([]);
              setSearchError(null);
            }}
            className="text-xs text-blue-400 hover:underline flex items-center space-x-1"
          >
            <span>Volver a Apps Destacadas</span>
          </button>
        )}
      </div>

      {/* Search Error if any */}
      {searchError && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-amber-200 text-sm flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Aviso de búsqueda</p>
            <p className="text-xs text-amber-300 mt-1">{searchError}</p>
          </div>
        </div>
      )}

      {/* Custom GitHub Search Results List */}
      {searchResults.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Resultados de GitHub ({searchResults.length})</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.map((repo) => {
              const isSaved = savedRepos.includes(repo.full_name);
              return (
                <div
                  key={repo.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 flex flex-col justify-between transition-all group hover:shadow-lg hover:shadow-black/40"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={repo.owner.avatar_url}
                          alt={repo.owner.login}
                          className="w-9 h-9 rounded-lg border border-slate-700"
                        />
                        <div>
                          <h3 className="font-bold text-slate-100 text-sm group-hover:text-blue-400 transition-colors">
                            {repo.name}
                          </h3>
                          <p className="text-xs text-slate-400">{repo.owner.login}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => onToggleSaveRepo(repo.full_name)}
                        className={`p-1.5 rounded-lg border transition-all ${
                          isSaved
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                            : 'bg-slate-850 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                        title={isSaved ? 'Guardado en Favoritos' : 'Guardar en Favoritos'}
                      >
                        {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                      </button>
                    </div>

                    <p className="text-xs text-slate-400 mt-3 line-clamp-2">
                      {repo.description || 'Sin descripción en GitHub.'}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3 text-slate-400">
                      <span className="flex items-center space-x-1">
                        <Star className="w-3.5 h-3.5 text-amber-400" />
                        <span>{repo.stargazers_count}</span>
                      </span>
                      {repo.language && <span className="text-blue-400">{repo.language}</span>}
                    </div>

                    <button
                      onClick={() =>
                        openRepoReleases({
                          name: repo.name,
                          fullName: repo.full_name,
                          description: repo.description || '',
                        })
                      }
                      className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600 border border-blue-500/30 text-blue-300 hover:text-white rounded-lg font-medium transition-all flex items-center space-x-1"
                    >
                      <span>Releases</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Curated Grid (Default View) */}
      {searchResults.length === 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              {selectedCategory === 'all'
                ? 'Aplicaciones IPA Destacadas'
                : categories.find((c) => c.id === selectedCategory)?.label}
              <span className="text-xs font-normal text-slate-400 ml-2">({filteredCurated.length} apps)</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCurated.map((item) => {
              const isSaved = savedRepos.includes(item.repo);
              return (
                <div
                  key={item.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-xl p-5 flex flex-col justify-between transition-all group hover:shadow-xl hover:shadow-black/30"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 font-bold text-base shadow-inner">
                          {item.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-100 text-sm group-hover:text-blue-400 transition-colors">
                            {item.name}
                          </h3>
                          <a
                            href={`https://github.com/${item.repo}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-slate-400 hover:text-blue-300 flex items-center space-x-1"
                          >
                            <span>{item.repo}</span>
                            <ExternalLink className="w-3 h-3 opacity-60" />
                          </a>
                        </div>
                      </div>

                      <button
                        onClick={() => onToggleSaveRepo(item.repo)}
                        className={`p-1.5 rounded-lg border transition-all ${
                          isSaved
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                            : 'bg-slate-850 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                        title={isSaved ? 'Guardado en Favoritos' : 'Guardar en Favoritos'}
                      >
                        {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-300 mt-3 line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60 text-[11px]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer with Sideload suggestion and Release CTA */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="text-[11px] text-slate-400 truncate max-w-[140px]" title={item.recommendedSideload}>
                      <span className="text-slate-500">Método: </span>
                      {item.recommendedSideload}
                    </div>

                    <button
                      onClick={() =>
                        openRepoReleases({
                          name: item.name,
                          fullName: item.repo,
                          description: item.description,
                        })
                      }
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all flex items-center space-x-1.5 shadow-sm shadow-blue-600/20"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Descargar IPA</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Releases Modal / Sheet */}
      {activeRepo && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-bold text-white">{activeRepo.name}</h3>
                  <a
                    href={`https://github.com/${activeRepo.fullName}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-400 hover:underline flex items-center space-x-0.5"
                  >
                    <span>{activeRepo.fullName}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{activeRepo.description}</p>
              </div>

              <button
                onClick={() => setActiveRepo(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm font-semibold transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              {loadingReleases ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-3">
                  <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
                  <p className="text-sm">Consultando versiones y archivos IPA en GitHub...</p>
                </div>
              ) : releasesError ? (
                <div className="p-6 bg-slate-850 border border-slate-800 rounded-xl text-center space-y-3">
                  <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                  <p className="text-sm text-slate-300">{releasesError}</p>
                  <a
                    href={`https://github.com/${activeRepo.fullName}/releases`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1 text-xs text-blue-400 hover:underline"
                  >
                    <span>Ver página de Releases en GitHub</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : releases.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">No se encontraron versiones disponibles.</p>
              ) : (
                <div className="space-y-4">
                  {releases.map((release) => {
                    const ipaAssets = filterIpaAssets(release);
                    const allAssets = release.assets;
                    const displayAssets = ipaAssets.length > 0 ? ipaAssets : allAssets;

                    return (
                      <div
                        key={release.id}
                        className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3"
                      >
                        {/* Release Header */}
                        <div className="flex items-start justify-between flex-wrap gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-white text-base">
                                {release.name || release.tag_name}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono">
                                {release.tag_name}
                              </span>
                              {release.prerelease && (
                                <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px]">
                                  Pre-release
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-slate-400">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>Publicado: {new Date(release.published_at).toLocaleDateString()}</span>
                            </div>
                          </div>

                          <a
                            href={release.html_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
                          >
                            <span>Ver en GitHub</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>

                        {/* Assets List */}
                        <div className="space-y-2 pt-2 border-t border-slate-800/80">
                          <p className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                            <FileBox className="w-4 h-4 text-blue-400" />
                            <span>Archivos descargables ({displayAssets.length}):</span>
                          </p>

                          {displayAssets.length === 0 ? (
                            <p className="text-xs text-slate-500 italic">Esta versión no contiene binarios adjuntos.</p>
                          ) : (
                            <div className="space-y-2">
                              {displayAssets.map((asset) => {
                                const isIpa = asset.name.toLowerCase().endsWith('.ipa');
                                const trollStoreUrl = `apple-magnifier://enable-install-trollstore?url=${encodeURIComponent(asset.browser_download_url)}`;

                                return (
                                  <div
                                    key={asset.id}
                                    className={`p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                      isIpa
                                        ? 'bg-blue-950/20 border-blue-900/40 text-blue-200'
                                        : 'bg-slate-900 border-slate-800 text-slate-300'
                                    }`}
                                  >
                                    <div className="space-y-0.5 overflow-hidden">
                                      <div className="flex items-center space-x-2">
                                        <span className="font-semibold text-xs sm:text-sm text-slate-100 truncate block">
                                          {asset.name}
                                        </span>
                                        {isIpa && (
                                          <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                                            IPA
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center space-x-3 text-xs text-slate-400">
                                        <span>{formatBytes(asset.size)}</span>
                                        <span>•</span>
                                        <span>{asset.download_count.toLocaleString()} descargas</span>
                                      </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center space-x-1.5 shrink-0 flex-wrap">
                                      {/* Direct Download */}
                                      <a
                                        href={asset.browser_download_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        download
                                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all shadow-sm"
                                      >
                                        <Download className="w-3.5 h-3.5" />
                                        <span>Descargar</span>
                                      </a>

                                      {/* Copy Link */}
                                      <button
                                        onClick={() => handleCopyUrl(asset.browser_download_url)}
                                        className="p-1.5 bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
                                        title="Copiar enlace directo"
                                      >
                                        {copiedUrl === asset.browser_download_url ? (
                                          <Check className="w-4 h-4 text-emerald-400" />
                                        ) : (
                                          <Copy className="w-4 h-4" />
                                        )}
                                      </button>

                                      {/* Add to AltStore Source list */}
                                      {onAddToSourceList && (
                                        <button
                                          onClick={() => {
                                            onAddToSourceList({
                                              name: activeRepo.name,
                                              bundleId: `com.${activeRepo.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
                                              version: release.tag_name,
                                              downloadUrl: asset.browser_download_url,
                                              size: asset.size,
                                            });
                                            alert(`"${asset.name}" se ha añadido a la lista del generador de fuentes AltStore/OTA.`);
                                          }}
                                          className="p-1.5 bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
                                          title="Añadir a generador de fuentes AltStore / OTA"
                                        >
                                          <Layers className="w-4 h-4 text-indigo-400" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Changelog body if available */}
                        {release.body && (
                          <div className="mt-2 text-xs text-slate-400 bg-slate-900/80 p-3 rounded-lg border border-slate-800/60 max-h-36 overflow-y-auto whitespace-pre-line font-mono">
                            {release.body}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-850 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center space-x-2">
                <Info className="w-4 h-4 text-blue-400" />
                <span>Las descargas provienen directamente de los servidores seguros de GitHub Releases.</span>
              </div>
              <button
                onClick={() => setActiveRepo(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
