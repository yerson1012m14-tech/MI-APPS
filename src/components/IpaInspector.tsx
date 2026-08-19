import React, { useState, useRef } from 'react';
import { ParsedIPA } from '../types';
import { parseIPAFile, calculateSHA256 } from '../utils/ipaParser';
import { formatBytes } from '../utils/githubApi';
import {
  UploadCloud,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Smartphone,
  Layers,
  Cpu,
  Lock,
  Copy,
  Check,
  Calendar,
  Key,
  Download,
  Eye,
  Info,
  RefreshCw,
  Sparkles,
  FileText
} from 'lucide-react';

interface IpaInspectorProps {
  onExportToManifest?: (ipa: ParsedIPA) => void;
}

export const IpaInspector: React.FC<IpaInspectorProps> = ({ onExportToManifest }) => {
  const [parsedIPA, setParsedIPA] = useState<ParsedIPA | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeInspectorTab, setActiveInspectorTab] = useState<'overview' | 'provisioning' | 'dylibs' | 'permissions' | 'rawPlist'>('overview');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopy = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const processFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.ipa') && !file.name.toLowerCase().endsWith('.zip')) {
      setError('Por favor selecciona un archivo con extensión .ipa o .zip de iOS.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    try {
      const data = await parseIPAFile(file);
      setParsedIPA(data);
      setActiveInspectorTab('overview');
    } catch (err: any) {
      console.error('IPA parsing error:', err);
      setError(`No se pudo analizar el archivo IPA: ${err.message || 'Estructura no válida o archivo dañado.'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  // Load a demo mockup IPA dataset for users who don't have an IPA on hand
  const loadDemoData = () => {
    setParsedIPA({
      fileName: 'uYouEnhanced_v19.08.2-3.0.4.ipa',
      fileSize: 142857120,
      sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      appName: 'YouTube (uYouEnhanced)',
      bundleDisplayName: 'YouTube',
      bundleIdentifier: 'com.google.ios.youtube.uyou',
      version: '19.08.2',
      buildNumber: '19080200',
      minOSVersion: 'iOS 15.0',
      deviceFamilies: ['iPhone', 'iPad'],
      frameworksCount: 14,
      injectedDylibs: [
        { name: 'uYou.dylib', path: 'Payload/YouTube.app/Frameworks/uYou.dylib', size: 8450120 },
        { name: 'SponsorBlock.dylib', path: 'Payload/YouTube.app/Frameworks/SponsorBlock.dylib', size: 1240500 },
        { name: 'YouPiP.dylib', path: 'Payload/YouTube.app/Frameworks/YouPiP.dylib', size: 890400 },
        { name: 'YTUHD.dylib', path: 'Payload/YouTube.app/Frameworks/YTUHD.dylib', size: 450200 },
        { name: 'ReturnYouTubeDislike.dylib', path: 'Payload/YouTube.app/Frameworks/ReturnYouTubeDislike.dylib', size: 680100 },
        { name: 'CydiaSubstrate.framework', path: 'Payload/YouTube.app/Frameworks/CydiaSubstrate.framework', size: 340000 },
      ],
      provisioning: {
        appIdName: 'YouTube Sideloaded Edition',
        teamName: 'Apple Development Profile',
        teamId: '9XYZ876ABC',
        creationDate: '2026-08-01T12:00:00Z',
        expirationDate: '2027-08-01T12:00:00Z',
        isExpired: false,
        provisionedDevicesCount: 100,
        entitlements: {
          'application-identifier': '9XYZ876ABC.com.google.ios.youtube.uyou',
          'aps-environment': 'production',
          'com.apple.developer.networking.wifi-info': true,
          'get-task-allow': false,
        },
      },
      permissions: [
        { key: 'Acceso a la Cámara', description: 'Para grabar y subir videos o transmisiones en directo.' },
        { key: 'Acceso a la Fototeca', description: 'Para seleccionar fotos de perfil y videos a subir.' },
        { key: 'Acceso al Micrófono', description: 'Para grabar audios y transmisiones.' },
        { key: 'Acceso a Bluetooth', description: 'Para transmitir a dispositivos Chromecast / AirPlay.' },
      ],
      rawPlist: {
        CFBundleDisplayName: 'YouTube',
        CFBundleIdentifier: 'com.google.ios.youtube.uyou',
        CFBundleShortVersionString: '19.08.2',
        CFBundleVersion: '19080200',
        MinimumOSVersion: '15.0',
        UIDeviceFamily: [1, 2],
        ITSAppUsesNonExemptEncryption: false,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <FileCode className="w-4 h-4" />
              <span>Analizador Binario Client-Side</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Inspector de Paquetes IPA para iOS
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Arrastra cualquier archivo <code className="text-blue-300 bg-slate-800 px-1 py-0.5 rounded text-xs">.ipa</code> para inspeccionar su <span className="text-slate-200">Info.plist</span>, certificado de firma, tweaks inyectados, permisos y versión mínima de iOS.
            </p>
          </div>

          <button
            onClick={loadDemoData}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium flex items-center space-x-2 transition-all shrink-0 self-start md:self-auto"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Cargar IPA de Ejemplo</span>
          </button>
        </div>

        {/* Dropzone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="mt-6 border-2 border-dashed border-slate-700/80 hover:border-blue-500/70 bg-slate-950/40 hover:bg-blue-500/5 rounded-2xl p-8 text-center cursor-pointer transition-all group"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".ipa,.zip"
            className="hidden"
          />

          <div className="max-w-md mx-auto space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-lg shadow-blue-500/10">
              {isProcessing ? (
                <RefreshCw className="w-7 h-7 animate-spin text-blue-400" />
              ) : (
                <UploadCloud className="w-7 h-7" />
              )}
            </div>

            <div>
              <p className="font-semibold text-slate-200 text-base">
                {isProcessing ? 'Analizando estructura del IPA...' : 'Arrastra tu archivo .IPA aquí o haz clic para examinar'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Procesado 100% en tu navegador (privado y seguro, ningún archivo se sube a servidores externos)
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Results View */}
      {parsedIPA && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Main App Overview Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
              {/* App Icon + Basic Info */}
              <div className="flex items-start space-x-5">
                {parsedIPA.appIconUrl ? (
                  <img
                    src={parsedIPA.appIconUrl}
                    alt={parsedIPA.appName}
                    className="w-20 h-20 rounded-2xl shadow-xl shadow-black/50 border border-slate-700 object-cover shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-xl shadow-blue-600/30 flex items-center justify-center text-white font-bold text-2xl shrink-0">
                    {parsedIPA.appName.substring(0, 2).toUpperCase()}
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex items-center space-x-2.5 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      {parsedIPA.bundleDisplayName || parsedIPA.appName}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                      v{parsedIPA.version} ({parsedIPA.buildNumber})
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
                    <span className="text-slate-300">{parsedIPA.bundleIdentifier}</span>
                    <button
                      onClick={() => handleCopy(parsedIPA.bundleIdentifier, 'bundleId')}
                      className="p-1 hover:text-white transition-colors"
                      title="Copiar Bundle ID"
                    >
                      {copiedKey === 'bundleId' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-xs flex items-center space-x-1">
                      <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                      <span>{parsedIPA.minOSVersion}</span>
                    </span>

                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-xs">
                      {formatBytes(parsedIPA.fileSize)}
                    </span>

                    {parsedIPA.deviceFamilies.map((dev) => (
                      <span key={dev} className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 text-xs">
                        {dev}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* SHA256 & Quick Actions */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0 lg:items-end">
                {onExportToManifest && (
                  <button
                    onClick={() => onExportToManifest(parsedIPA)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-md shadow-blue-600/20 transition-all"
                  >
                    <Layers className="w-4 h-4" />
                    <span>Generar Fuente / Manifiesto</span>
                  </button>
                )}

                {parsedIPA.sha256 && (
                  <div className="bg-slate-950/80 border border-slate-800 p-2 rounded-xl text-[11px] font-mono text-slate-400 flex items-center space-x-2">
                    <span className="text-slate-500">SHA256:</span>
                    <span className="truncate max-w-[160px] sm:max-w-[200px]">{parsedIPA.sha256}</span>
                    <button
                      onClick={() => handleCopy(parsedIPA.sha256 || '', 'sha256')}
                      className="p-1 hover:text-white text-slate-400"
                      title="Copiar SHA256"
                    >
                      {copiedKey === 'sha256' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Inspector Navigation Tabs */}
            <div className="flex space-x-1 overflow-x-auto no-scrollbar pt-4">
              {[
                { id: 'overview', label: 'Resumen y Compatibilidad', icon: <CheckCircle2 className="w-4 h-4" /> },
                { id: 'provisioning', label: 'Certificado & Firma', icon: <Shield className="w-4 h-4" /> },
                { id: 'dylibs', label: `Tweaks & Dylibs (${parsedIPA.injectedDylibs.length})`, icon: <Cpu className="w-4 h-4" /> },
                { id: 'permissions', label: `Permisos (${parsedIPA.permissions.length})`, icon: <Lock className="w-4 h-4" /> },
                { id: 'rawPlist', label: 'Info.plist Crudo', icon: <FileText className="w-4 h-4" /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveInspectorTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    activeInspectorTab === tab.id
                      ? 'bg-blue-600/20 border border-blue-500/40 text-blue-300'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab 1: Overview */}
          {activeInspectorTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sideload Compatibility Matrix */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="font-bold text-white text-sm flex items-center space-x-2">
                  <Smartphone className="w-4 h-4 text-blue-400" />
                  <span>Compatibilidad de Instalación (Sideload)</span>
                </h3>

                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-200">TrollStore (iOS 14.0 - 17.0)</p>
                      <p className="text-slate-400 text-[11px]">Instalación permanente sin caducidad de certificados</p>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold text-[11px]">
                      100% Compatible
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-200">SideStore / AltStore / Sideloadly</p>
                      <p className="text-slate-400 text-[11px]">Requiere cuenta Apple ID (Gratuita 7 días o Desarrollador 1 año)</p>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 font-semibold text-[11px]">
                      Compatible
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-200">Feather / Scarlet / ESign (Certificados P12)</p>
                      <p className="text-slate-400 text-[11px]">Firmado en el dispositivo con certificado empresarial/ad-hoc</p>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30 font-semibold text-[11px]">
                      Compatible
                    </span>
                  </div>
                </div>
              </div>

              {/* Package Metadata Metrics */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="font-bold text-white text-sm flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>Detalles del Binario</span>
                </h3>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
                    <p className="text-slate-500">Nombre de Archivo</p>
                    <p className="font-mono text-slate-200 truncate" title={parsedIPA.fileName}>{parsedIPA.fileName}</p>
                  </div>
                  <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
                    <p className="text-slate-500">Versión Mínima de iOS</p>
                    <p className="font-semibold text-slate-200">{parsedIPA.minOSVersion}</p>
                  </div>
                  <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
                    <p className="text-slate-500">Número de Compilación</p>
                    <p className="font-mono text-slate-200">{parsedIPA.buildNumber}</p>
                  </div>
                  <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
                    <p className="text-slate-500">Frameworks / Dylibs</p>
                    <p className="font-semibold text-slate-200">{parsedIPA.frameworksCount} elementos</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Provisioning */}
          {activeInspectorTab === 'provisioning' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-base flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  <span>Perfil Móvil (embedded.mobileprovision)</span>
                </h3>
                {parsedIPA.provisioning ? (
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                    parsedIPA.provisioning.isExpired
                      ? 'bg-red-500/10 text-red-400 border-red-500/30'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  }`}>
                    {parsedIPA.provisioning.isExpired ? 'Certificado Caducado' : 'Firma Válida / Activa'}
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    Sin Firma (Listo para re-firmar)
                  </span>
                )}
              </div>

              {parsedIPA.provisioning ? (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
                      <p className="text-slate-500">Nombre del Equipo (Team)</p>
                      <p className="font-semibold text-slate-200 text-sm mt-0.5">
                        {parsedIPA.provisioning.teamName || 'Desconocido'}
                      </p>
                    </div>
                    <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
                      <p className="text-slate-500">ID del Equipo (Team ID)</p>
                      <p className="font-mono text-slate-200 text-sm mt-0.5">
                        {parsedIPA.provisioning.teamId || 'N/A'}
                      </p>
                    </div>
                    <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
                      <p className="text-slate-500">Fecha de Expiración</p>
                      <p className="font-semibold text-slate-200 text-sm mt-0.5 flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-blue-400" />
                        <span>
                          {parsedIPA.provisioning.expirationDate
                            ? new Date(parsedIPA.provisioning.expirationDate).toLocaleDateString()
                            : 'N/A'}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Entitlements JSON */}
                  {parsedIPA.provisioning.entitlements && (
                    <div className="space-y-2 pt-2">
                      <p className="font-semibold text-slate-300 flex items-center space-x-1.5">
                        <Key className="w-4 h-4 text-amber-400" />
                        <span>Entitlements (Permisos de firma Apple):</span>
                      </p>
                      <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
                        {JSON.stringify(parsedIPA.provisioning.entitlements, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 bg-slate-950/50 border border-slate-800/80 rounded-xl text-center space-y-2">
                  <Info className="w-6 h-6 text-blue-400 mx-auto" />
                  <p className="text-sm text-slate-300 font-medium">Este IPA no incluye un perfil móvil embebido o es una compilación no firmada.</p>
                  <p className="text-xs text-slate-500">
                    Esto es ideal para instalar con TrollStore, o para firmar con tu propio Apple ID mediante AltStore, SideStore, Sideloadly o Feather.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Dylibs */}
          {activeInspectorTab === 'dylibs' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-base flex items-center space-x-2">
                    <Cpu className="w-5 h-5 text-indigo-400" />
                    <span>Librerías Dinámicas (.dylib) y Frameworks Inyectados</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Permite comprobar qué modificaciones, tweaks (como CydiaSubstrate, uYou, Spotilife) o librerías están embebidos dentro de la app.
                  </p>
                </div>
              </div>

              {parsedIPA.injectedDylibs.length === 0 ? (
                <div className="p-6 bg-slate-950/50 border border-slate-800 rounded-xl text-center text-slate-400 text-xs">
                  No se detectaron dylibs externas adicionales. La app parece contener solo sus binarios estándar.
                </div>
              ) : (
                <div className="space-y-2">
                  {parsedIPA.injectedDylibs.map((dylib, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <span className="w-6 h-6 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-mono text-[10px]">
                          {idx + 1}
                        </span>
                        <div className="overflow-hidden">
                          <p className="font-semibold text-slate-200 truncate">{dylib.name}</p>
                          <p className="font-mono text-[10px] text-slate-500 truncate">{dylib.path}</p>
                        </div>
                      </div>
                      {dylib.size > 0 && (
                        <span className="text-slate-400 text-xs shrink-0 font-mono">
                          {formatBytes(dylib.size)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Permissions */}
          {activeInspectorTab === 'permissions' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-white text-base flex items-center space-x-2">
                <Lock className="w-5 h-5 text-amber-400" />
                <span>Permisos de Privacidad Solicitados en Info.plist</span>
              </h3>

              {parsedIPA.permissions.length === 0 ? (
                <div className="p-6 bg-slate-950/50 border border-slate-800 rounded-xl text-center text-slate-400 text-xs">
                  No se encontraron descripciones de privacidad explícitas en Info.plist.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {parsedIPA.permissions.map((perm, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1.5"
                    >
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-semibold text-slate-200 text-xs">{perm.key}</span>
                      </div>
                      <p className="text-xs text-slate-400 italic">"{perm.description}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 5: Raw Info.plist */}
          {activeInspectorTab === 'rawPlist' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-base flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <span>Info.plist Decodificado</span>
                </h3>
                <button
                  onClick={() => handleCopy(JSON.stringify(parsedIPA.rawPlist || {}, null, 2), 'rawPlist')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center space-x-1.5"
                >
                  {copiedKey === 'rawPlist' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar JSON</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 max-h-96 overflow-y-auto">
                {JSON.stringify(parsedIPA.rawPlist || {}, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
