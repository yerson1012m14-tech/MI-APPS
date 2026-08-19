import React, { useState } from 'react';
import { SourceAppEntry, generateAltStoreSource, generateScarletRepo, generateOtaManifestPlist } from '../utils/manifestGenerator';
import { 
  Layers, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  Sparkles, 
  Code, 
  HelpCircle, 
  Smartphone,
  Globe,
  Share2
} from 'lucide-react';

interface SourceBuilderProps {
  initialApps?: SourceAppEntry[];
}

export const SourceBuilder: React.FC<SourceBuilderProps> = ({ initialApps = [] }) => {
  const [sourceType, setSourceType] = useState<'altstore' | 'scarlet' | 'ota-manifest'>('altstore');
  const [sourceName, setSourceName] = useState('Mi Repositorio de IPAs GitHub');
  const [sourceId, setSourceId] = useState('com.github.user.ipasource');

  // App list
  const [apps, setApps] = useState<SourceAppEntry[]>(
    initialApps.length > 0
      ? initialApps
      : [
          {
            name: 'Delta Emulator',
            bundleIdentifier: 'com.rileytestut.Delta',
            developerName: 'Riley Testut',
            version: '1.6.1',
            versionDate: new Date().toISOString(),
            versionDescription: 'Emulador todo en uno para GBA, SNES, N64 y NDS.',
            downloadURL: 'https://github.com/rileytestut/Delta/releases/download/v1.6.1/Delta.ipa',
            localizedDescription: 'Emulador clásico con soporte para mandos y sincronización en la nube.',
            iconURL: 'https://raw.githubusercontent.com/rileytestut/Delta/master/Delta/Assets.xcassets/AppIcon.appiconset/AppIcon-60%402x.png',
            size: 45000000,
            minOSVersion: '14.0',
          },
          {
            name: 'uYouEnhanced',
            bundleIdentifier: 'com.google.ios.youtube.uyou',
            developerName: 'arichornlover',
            version: '19.08.2-3.0.4',
            versionDate: new Date().toISOString(),
            versionDescription: 'YouTube modificado con bloqueo de anuncios y descargas.',
            downloadURL: 'https://github.com/arichornlover/uYouEnhanced/releases/download/v19.08.2-3.0.4/uYouEnhanced_19.08.2-3.0.4.ipa',
            localizedDescription: 'Cliente enriquecido de YouTube sin publicidad.',
            iconURL: 'https://raw.githubusercontent.com/arichornlover/uYouEnhanced/main/Images/uYouEnhanced.png',
            size: 140000000,
            minOSVersion: '15.0',
          },
        ]
  );

  // New app form state
  const [newAppName, setNewAppName] = useState('');
  const [newBundleId, setNewBundleId] = useState('');
  const [newVersion, setNewVersion] = useState('1.0');
  const [newDownloadUrl, setNewDownloadUrl] = useState('');
  const [newDeveloper, setNewDeveloper] = useState('');
  const [newIconUrl, setNewIconUrl] = useState('');

  const [copied, setCopied] = useState(false);

  const handleAddApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppName.trim() || !newDownloadUrl.trim()) return;

    const newEntry: SourceAppEntry = {
      name: newAppName.trim(),
      bundleIdentifier: newBundleId.trim() || `com.app.${newAppName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      developerName: newDeveloper.trim() || 'GitHub Developer',
      version: newVersion.trim() || '1.0',
      versionDate: new Date().toISOString(),
      downloadURL: newDownloadUrl.trim(),
      iconURL: newIconUrl.trim() || undefined,
      size: 50000000,
    };

    setApps([...apps, newEntry]);
    setNewAppName('');
    setNewBundleId('');
    setNewVersion('1.0');
    setNewDownloadUrl('');
    setNewDeveloper('');
    setNewIconUrl('');
  };

  const handleRemoveApp = (index: number) => {
    setApps(apps.filter((_, i) => i !== index));
  };

  // Generate output content
  const generatedContent = (() => {
    if (sourceType === 'altstore') {
      return generateAltStoreSource(sourceName, sourceId, apps);
    }
    if (sourceType === 'scarlet') {
      return generateScarletRepo(sourceName, apps);
    }
    // OTA Manifest (uses the first app or a template)
    const targetApp = apps[0] || {
      name: 'Mi App iOS',
      bundleIdentifier: 'com.ejemplo.app',
      version: '1.0',
      downloadURL: 'https://mi-servidor.com/app.ipa',
    };
    return generateOtaManifestPlist(
      targetApp.downloadURL,
      targetApp.bundleIdentifier,
      targetApp.version,
      targetApp.name,
      targetApp.iconURL
    );
  })();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const isPlist = sourceType === 'ota-manifest';
    const filename = isPlist ? 'manifest.plist' : `${sourceId || 'source'}.json`;
    const mimeType = isPlist ? 'application/x-plist' : 'application/json';

    const blob = new Blob([generatedContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <Layers className="w-4 h-4" />
          <span>Generador de Fuentes y Manifiestos</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Crea Fuentes para AltStore, SideStore y Scarlet
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Genera repositorios en formato <code className="text-indigo-300 bg-slate-800 px-1 py-0.5 rounded text-xs">.json</code> para que los usuarios puedan agregar tus IPAs de GitHub directamente en AltStore/SideStore con 1 toque.
        </p>

        {/* Source Type Selector */}
        <div className="flex flex-wrap gap-2 mt-5">
          <button
            onClick={() => setSourceType('altstore')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center space-x-2 ${
              sourceType === 'altstore'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Fuente AltStore / SideStore (.json)</span>
          </button>

          <button
            onClick={() => setSourceType('scarlet')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center space-x-2 ${
              sourceType === 'scarlet'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Repositorio Scarlet (.json)</span>
          </button>

          <button
            onClick={() => setSourceType('ota-manifest')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center space-x-2 ${
              sourceType === 'ota-manifest'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>Manifiesto Apple OTA (manifest.plist)</span>
          </button>
        </div>
      </div>

      {/* Main Builder Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Configuration & Apps List */}
        <div className="lg:col-span-6 space-y-5">
          {/* Metadata Settings */}
          {sourceType !== 'ota-manifest' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <Globe className="w-4 h-4 text-blue-400" />
                <span>Datos de la Fuente</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Nombre de la Fuente</label>
                  <input
                    type="text"
                    value={sourceName}
                    onChange={(e) => setSourceName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Identificador Único</label>
                  <input
                    type="text"
                    value={sourceId}
                    onChange={(e) => setSourceId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* App Entries List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <Smartphone className="w-4 h-4 text-indigo-400" />
                <span>Aplicaciones en la Fuente ({apps.length})</span>
              </h2>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto">
              {apps.map((app, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    {app.iconURL ? (
                      <img src={app.iconURL} alt={app.name} className="w-8 h-8 rounded-lg object-cover border border-slate-700 shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-slate-800 text-indigo-400 font-bold flex items-center justify-center text-xs shrink-0">
                        {app.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <p className="font-semibold text-slate-200 truncate">{app.name}</p>
                      <p className="font-mono text-[10px] text-slate-400 truncate">{app.bundleIdentifier} • v{app.version}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveApp(idx)}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors ml-2"
                    title="Eliminar app"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add App Form */}
            <form onSubmit={handleAddApp} className="pt-3 border-t border-slate-800/80 space-y-3">
              <p className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                <Plus className="w-3.5 h-3.5 text-indigo-400" />
                <span>Añadir Aplicación a la Fuente</span>
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <input
                  type="text"
                  placeholder="Nombre de la App (ej. Delta)"
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Bundle ID (ej. com.rileytestut.Delta)"
                  value={newBundleId}
                  onChange={(e) => setNewBundleId(e.target.value)}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <input
                  type="text"
                  placeholder="Versión (ej. 1.6.0)"
                  value={newVersion}
                  onChange={(e) => setNewVersion(e.target.value)}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Desarrollador (ej. Autor en GitHub)"
                  value={newDeveloper}
                  onChange={(e) => setNewDeveloper(e.target.value)}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <input
                type="url"
                placeholder="URL Directa de Descarga del archivo .IPA (GitHub Release URL)"
                value={newDownloadUrl}
                onChange={(e) => setNewDownloadUrl(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                required
              />

              <input
                type="url"
                placeholder="URL del Icono de la App (Opcional, formato .png)"
                value={newIconUrl}
                onChange={(e) => setNewIconUrl(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 font-mono"
              />

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar a la lista</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Code Preview & Export */}
        <div className="lg:col-span-6 space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col h-full">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <Code className="w-4 h-4 text-emerald-400" />
                <span>Vista Previa del Código Generado</span>
              </h2>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-lg text-xs font-medium flex items-center space-x-1.5 border border-slate-700 transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado' : 'Copiar'}</span>
                </button>

                <button
                  onClick={handleDownloadFile}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar</span>
                </button>
              </div>
            </div>

            {/* Code editor / pre */}
            <div className="flex-1 min-h-[340px] bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-[11px] text-slate-300 overflow-auto">
              <pre>{generatedContent}</pre>
            </div>

            {/* Hosting guide tip */}
            <div className="p-3.5 bg-slate-850/80 border border-slate-800 rounded-xl text-xs text-slate-400 space-y-1.5">
              <p className="font-semibold text-slate-200 flex items-center space-x-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                <span>¿Cómo alojar tu fuente para AltStore/SideStore?</span>
              </p>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300">
                <li>Sube este archivo <code className="text-indigo-300 font-mono">source.json</code> a un repositorio público de GitHub o GitHub Gist.</li>
                <li>Activa <strong>GitHub Pages</strong> o copia el enlace <strong>Raw</strong> del archivo.</li>
                <li>En tu iPhone/iPad, abre AltStore o SideStore → Sources → Añadir URL de la fuente.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
