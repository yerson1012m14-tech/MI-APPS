import React, { useState } from 'react';
import { WorkflowProjectType, generateGitHubWorkflowYaml } from '../utils/workflowGenerator';
import { 
  GitBranch, 
  Copy, 
  Check, 
  Download, 
  FileCode, 
  Sparkles, 
  Layers, 
  HelpCircle, 
  Terminal, 
  CheckCircle2 
} from 'lucide-react';

export const WorkflowBuilder: React.FC = () => {
  const [projectType, setProjectType] = useState<WorkflowProjectType>('xcode-swift');
  const [projectName, setProjectName] = useState('MiAppiOS');
  const [scheme, setScheme] = useState('MiAppiOS');
  const [targetBranch, setTargetBranch] = useState('main');
  const [autoRelease, setAutoRelease] = useState(true);
  const [copied, setCopied] = useState(false);

  const generatedYaml = generateGitHubWorkflowYaml({
    projectName: projectName.trim(),
    scheme: scheme.trim(),
    projectType,
    autoRelease,
    signingMode: 'unsigned',
    targetBranch: targetBranch.trim(),
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedYaml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedYaml], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'build-ipa.yml';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <GitBranch className="w-4 h-4" />
          <span>Automatización CI/CD con GitHub Actions</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Generador de GitHub Actions para Compilar IPAs
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Compila tus aplicaciones de iOS automáticamente en la nube de GitHub con ejecutores macOS gratuitos. Obtén archivos <code className="text-emerald-300 bg-slate-800 px-1 py-0.5 rounded text-xs">.ipa</code> listos para instalar con Sideloadly, TrollStore o AltStore con cada commit.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Settings Form */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Configuración del Proyecto</span>
            </h2>

            {/* Framework Selector */}
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">Tecnología / Framework</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'xcode-swift', label: 'Xcode / Swift' },
                  { id: 'flutter', label: 'Flutter iOS' },
                  { id: 'react-native', label: 'React Native' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setProjectType(item.id as WorkflowProjectType)}
                    className={`py-2 px-2 rounded-xl text-xs font-medium border text-center transition-all ${
                      projectType === item.id
                        ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-300 font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Project Name */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">Nombre del Proyecto / App</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="ej. MiAppiOS"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Xcode Scheme */}
            {projectType !== 'flutter' && (
              <div>
                <label className="block text-xs text-slate-400 mb-1">Scheme de Xcode</label>
                <input
                  type="text"
                  value={scheme}
                  onChange={(e) => setScheme(e.target.value)}
                  placeholder="ej. MiAppiOS"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            {/* Target Branch */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">Rama de Git (Branch)</label>
              <input
                type="text"
                value={targetBranch}
                onChange={(e) => setTargetBranch(e.target.value)}
                placeholder="main o master"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Auto Release Checkbox */}
            <div className="pt-2">
              <label className="flex items-center space-x-2.5 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={autoRelease}
                  onChange={(e) => setAutoRelease(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Publicar automáticamente como GitHub Release cuando se cree un Tag</span>
              </label>
            </div>
          </div>

          {/* Instructions Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
              <HelpCircle className="w-4 h-4 text-blue-400" />
              <span>Instrucciones de instalación en tu repositorio</span>
            </h3>
            <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-400 leading-relaxed">
              <li>
                En tu repositorio de GitHub, crea la carpeta <code className="text-emerald-400 font-mono">.github/workflows/</code>
              </li>
              <li>
                Crea un archivo llamado <code className="text-emerald-400 font-mono">build-ipa.yml</code>
              </li>
              <li>Pega el código YAML generado a la derecha y haz commit a tu rama.</li>
              <li>
                Ve a la pestaña <strong>Actions</strong> en GitHub para ver la compilación en vivo y descargar el <code className="text-blue-300 font-mono">.ipa</code> generado.
              </li>
            </ol>
          </div>
        </div>

        {/* YAML Output */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col h-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-bold text-white font-mono">.github/workflows/build-ipa.yml</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-lg text-xs font-medium flex items-center space-x-1.5 border border-slate-700 transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado' : 'Copiar YAML'}</span>
                </button>

                <button
                  onClick={handleDownload}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all shadow-sm shadow-emerald-600/20"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar .yml</span>
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-[380px] bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-[11px] text-emerald-300/90 overflow-auto whitespace-pre leading-relaxed">
              {generatedYaml}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
