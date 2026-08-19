import React, { useState } from 'react';
import { 
  Smartphone, 
  CheckCircle2, 
  HelpCircle, 
  ExternalLink, 
  Sparkles, 
  Zap, 
  AlertCircle, 
  ShieldCheck, 
  Cpu, 
  Monitor 
} from 'lucide-react';

export const SideloadGuide: React.FC = () => {
  const [selectedIosVersion, setSelectedIosVersion] = useState<string>('17.0');
  const [hasComputer, setHasComputer] = useState<boolean>(true);

  const getRecommendation = () => {
    const v = parseFloat(selectedIosVersion);

    if (selectedIosVersion === '17.0' || (v >= 14.0 && v <= 16.61)) {
      return {
        best: 'TrollStore',
        badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        title: '¡Tu dispositivo es compatible con TrollStore!',
        description:
          'Puedes instalar IPAs de forma 100% permanente sin caducidad de certificados (7 días), sin límite de aplicaciones y con permisos avanzados mediante el bug CoreTrust.',
        link: 'https://github.com/opa334/TrollStore',
      };
    }

    if (!hasComputer) {
      return {
        best: 'SideStore o Feather (Con Certificado)',
        badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
        title: 'Instalación en el dispositivo sin PC constante',
        description:
          'Utiliza SideStore (firma usando tu Apple ID mediante VPN local WireGuard) o Feather si dispones de un certificado de desarrollador .p12.',
        link: 'https://github.com/SideStore/SideStore',
      };
    }

    return {
      best: 'AltStore o Sideloadly',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      title: 'Instalación Estándar con Apple ID',
      description:
        'Usa AltStore (renovación inalámbrica por Wi-Fi) o Sideloadly desde tu ordenador PC con Windows o Mac.',
      link: 'https://github.com/rileytestut/AltStore',
    };
  };

  const recommendation = getRecommendation();

  const sideloadMethods = [
    {
      name: 'TrollStore',
      tag: 'Permanente (Sin Revokes)',
      supportedOS: 'iOS 14.0 - 16.6.1 & 17.0',
      pros: ['No caduca nunca', 'Sin límite de 3 apps', 'Permisos root / JIT completo', 'Soporta inyección de tweaks'],
      cons: ['No funciona en iOS 17.0.1+ o iOS 18+'],
      repo: 'opa334/TrollStore',
      githubUrl: 'https://github.com/opa334/TrollStore',
      difficulty: 'Fácil (con instalador)',
    },
    {
      name: 'SideStore',
      tag: 'Firmado en el Dispositivo',
      supportedOS: 'iOS 14.0 - iOS 18.x',
      pros: ['No requiere PC después de la configuración inicial', 'Usa tu Apple ID', 'Renueva automáticamente por Wi-Fi'],
      cons: ['Límite de 3 apps con cuenta Apple ID gratuita', 'Requiere emparejamiento WireGuard'],
      repo: 'SideStore/SideStore',
      githubUrl: 'https://github.com/SideStore/SideStore',
      difficulty: 'Media',
    },
    {
      name: 'LiveContainer',
      tag: 'Bypass Límite 3 Apps',
      supportedOS: 'iOS 14.0 - iOS 18.x',
      pros: ['Instala decenas de IPAs dentro de una sola app', 'Supera el límite de 3 apps gratuitas de Apple', 'JIT integrado'],
      cons: ['Requiere JIT para ciertas funciones complejas'],
      repo: 'khanhduytran0/LiveContainer',
      githubUrl: 'https://github.com/khanhduytran0/LiveContainer',
      difficulty: 'Media',
    },
    {
      name: 'AltStore & AltServer',
      tag: 'El Clásico de Sideloading',
      supportedOS: 'iOS 12.2 - iOS 18.x',
      pros: ['Muy estable', 'Sincronización por Wi-Fi con PC/Mac', 'Soporte de fuentes comunitarias de IPAs'],
      cons: ['Límite de 3 apps en cuenta gratuita', 'Requiere tener la PC encendida en la misma red'],
      repo: 'rileytestut/AltStore',
      githubUrl: 'https://github.com/rileytestut/AltStore',
      difficulty: 'Fácil',
    },
    {
      name: 'Feather',
      tag: 'Firmador Moderno On-Device',
      supportedOS: 'iOS 15.0 - iOS 18.x',
      pros: ['Interfaz moderna en Swift', 'Firma con certificados .p12 y perfiles móviles', 'Inyección de dylibs personalizada'],
      cons: ['Requiere archivo de certificado P12'],
      repo: 'khcrysalis/Feather',
      githubUrl: 'https://github.com/khcrysalis/Feather',
      difficulty: 'Fácil',
    },
    {
      name: 'Sideloadly',
      tag: 'Herramienta PC/Mac',
      supportedOS: 'iOS 9.0 - iOS 18.x',
      pros: ['Inyección directa de .dylib/.framework en el IPA', 'Instalación por cable USB o Wi-Fi', 'Cambio de Bundle ID automático'],
      cons: ['Requiere PC o Mac para cada instalación'],
      repo: 'Sideloadly Official',
      githubUrl: 'https://sideloadly.io',
      difficulty: 'Muy Fácil',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-2 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <Smartphone className="w-4 h-4" />
          <span>Asistente de Compatibilidad iOS</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Guía de Instalación y Métodos de Sideloading
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Aprende qué herramienta es la más adecuada para instalar tus archivos <code className="text-blue-300 bg-slate-800 px-1 py-0.5 rounded text-xs">.ipa</code> según tu versión de iOS y necesidades.
        </p>
      </div>

      {/* Interactive Helper Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <h2 className="text-base font-bold text-white flex items-center space-x-2">
          <Zap className="w-5 h-5 text-amber-400" />
          <span>Comprueba el mejor método para tu iPhone / iPad</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1.5 font-medium">Versión de iOS de tu dispositivo:</label>
            <select
              value={selectedIosVersion}
              onChange={(e) => setSelectedIosVersion(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500 font-semibold"
            >
              <option value="15.1">iOS 15.0 - 15.4.1</option>
              <option value="16.5">iOS 16.0 - 16.6.1</option>
              <option value="17.0">iOS 17.0 (Soportado por TrollStore)</option>
              <option value="17.4">iOS 17.4 - 17.7 (AltStore / SideStore)</option>
              <option value="18.0">iOS 18.0 - 18.4+ (Últimas versiones)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1.5 font-medium">¿Tienes acceso a un ordenador (PC o Mac)?</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setHasComputer(true)}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 ${
                  hasComputer
                    ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Sí, tengo PC / Mac</span>
              </button>

              <button
                type="button"
                onClick={() => setHasComputer(false)}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 ${
                  !hasComputer
                    ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Solo mi iPhone/iPad</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Recommendation Box */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${recommendation.badgeColor}`}>
                Recomendado: {recommendation.best}
              </span>
            </div>
            <h3 className="font-bold text-white text-sm">{recommendation.title}</h3>
            <p className="text-xs text-slate-400 max-w-xl">{recommendation.description}</p>
          </div>

          <a
            href={recommendation.link}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all shrink-0 self-start sm:self-auto shadow-md shadow-blue-600/20"
          >
            <span>Ver Instalador en GitHub</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Methods Comparison Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Comparativa de Herramientas de Sideloading</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sideloadMethods.map((method, idx) => (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800 hover:border-slate-750 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all shadow-lg shadow-black/30"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base">{method.name}</h3>
                    <p className="text-xs text-blue-400 font-medium">{method.tag}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-mono border border-slate-700">
                    {method.difficulty}
                  </span>
                </div>

                <div className="p-2 bg-slate-950/60 rounded-lg border border-slate-800/80 text-[11px] text-slate-300">
                  <span className="text-slate-500 font-semibold">Compatibilidad: </span>
                  {method.supportedOS}
                </div>

                {/* Pros */}
                <div className="space-y-1 text-xs">
                  <p className="text-slate-400 font-semibold text-[11px]">Ventajas:</p>
                  {method.pros.map((pro, pIdx) => (
                    <div key={pIdx} className="flex items-center space-x-1.5 text-slate-300 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{pro}</span>
                    </div>
                  ))}
                </div>

                {/* Cons */}
                <div className="space-y-1 text-xs">
                  <p className="text-slate-400 font-semibold text-[11px]">Limitaciones:</p>
                  {method.cons.map((con, cIdx) => (
                    <div key={cIdx} className="flex items-center space-x-1.5 text-slate-400 text-[11px]">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{con}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80">
                <a
                  href={method.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <span>Repositorio Oficial</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
