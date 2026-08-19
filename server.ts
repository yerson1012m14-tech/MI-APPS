import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

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

export interface XitforgeConfig {
  version: string;
  lastUpdated: string;
  games: {
    id: 'normal' | 'max';
    name: string;
    badge: string;
    description: string;
  }[];
  categories: string[];
  options: OptionItem[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const CONFIG_FILE = path.join(DATA_DIR, 'xitforge.json');

const DEFAULT_CONFIG: XitforgeConfig = {
  version: "3.0.0",
  lastUpdated: new Date().toISOString(),
  games: [
    { id: "normal", name: "FREE FIRE NORMAL", badge: "NORMAL", description: "Versión Estándar / Clásica" },
    { id: "max", name: "FREE FIRE MAX", badge: "MAX HD", description: "Versión Ultra Gráficos HD" }
  ],
  categories: ["Todos", "General", "Sensibilidad", "Optimización", "Pantalla", "Especiales"],
  options: [
    {
      id: "opt_touch_boost",
      game: "all",
      name: "Respuesta Táctil Acelerada",
      category: "Optimización",
      type: "switch",
      enabled: true,
      description: "Reduce el retraso táctil de pantalla en dispositivos iOS",
      badge: "120Hz"
    },
    {
      id: "opt_fps_steady",
      game: "all",
      name: "Estabilizador de Cuadros (FPS)",
      category: "Optimización",
      type: "switch",
      enabled: true,
      description: "Previene caídas bruscas de FPS en enfrentamientos intensos",
      badge: "PRO"
    },
    {
      id: "opt_general_sens",
      game: "all",
      name: "Sensibilidad General",
      category: "Sensibilidad",
      type: "slider",
      value: 96,
      min: 0,
      max: 100,
      step: 1,
      description: "Velocidad de giro horizontal de cámara"
    },
    {
      id: "opt_red_dot_sens",
      game: "all",
      name: "Sensibilidad Mira Punto Rojo",
      category: "Sensibilidad",
      type: "slider",
      value: 90,
      min: 0,
      max: 100,
      step: 1,
      description: "Calibración de levantamiento de mira"
    },
    {
      id: "opt_hud_layout",
      game: "all",
      name: "Esquema de Botones HUD",
      category: "Pantalla",
      type: "select",
      options: ["2 Dedos Básico", "3 Dedos Híbrido", "4 Dedos Competitivo"],
      selectedOption: "3 Dedos Híbrido",
      description: "Distribución táctil sugerida según tu estilo de juego"
    }
  ]
};

function cloneDefault(): XitforgeConfig {
  return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
}

function loadConfig(): XitforgeConfig {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(CONFIG_FILE)) {
      const fresh = cloneDefault();
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(fresh, null, 2), 'utf8');
      return fresh;
    }
    const raw = fs.readFileSync(CONFIG_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Partial<XitforgeConfig>;
    return {
      ...cloneDefault(),
      ...parsed,
      games: Array.isArray(parsed.games) ? parsed.games : cloneDefault().games,
      categories: Array.isArray(parsed.categories) ? parsed.categories : cloneDefault().categories,
      options: Array.isArray(parsed.options) ? parsed.options : cloneDefault().options,
    };
  } catch (error) {
    console.error('No se pudo cargar xitforge.json:', error);
    return cloneDefault();
  }
}

function saveConfig(config: XitforgeConfig) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const temp = `${CONFIG_FILE}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(config, null, 2), 'utf8');
  fs.renameSync(temp, CONFIG_FILE);
}

let currentConfig: XitforgeConfig = loadConfig();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });

  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "XITFORGE Backend API", timestamp: new Date().toISOString() });
  });

  app.get("/api/xitforge/config", (req, res) => {
    const gameQuery = req.query.game as string | undefined;
    if (gameQuery === 'normal' || gameQuery === 'max') {
      const filteredOptions = currentConfig.options.filter((opt) => opt.game === 'all' || opt.game === gameQuery);
      return res.json({ ...currentConfig, options: filteredOptions });
    }
    res.json(currentConfig);
  });

  app.post("/api/xitforge/config", (req, res) => {
    try {
      const newConfig = req.body as Partial<XitforgeConfig>;
      if (!newConfig || !Array.isArray(newConfig.options)) {
        return res.status(400).json({ error: 'Formato inválido. Debe incluir array "options".' });
      }
      currentConfig = {
        ...currentConfig,
        ...newConfig,
        lastUpdated: new Date().toISOString(),
      };
      saveConfig(currentConfig);
      res.json({ success: true, message: 'Configuración XITFORGE actualizada con éxito', config: currentConfig });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al guardar la configuración';
      res.status(500).json({ error: message });
    }
  });

  app.post("/api/xitforge/options", (req, res) => {
    try {
      const newOption = req.body as OptionItem;
      if (!newOption.name || !newOption.type) {
        return res.status(400).json({ error: 'Nombre y tipo son obligatorios' });
      }

      const id = newOption.id || `opt_${Date.now()}`;
      const optionWithId: OptionItem = {
        ...newOption,
        id,
        game: newOption.game || 'all',
        category: newOption.category || 'General',
        createdAt: new Date().toISOString(),
      };

      if (optionWithId.category && !currentConfig.categories.includes(optionWithId.category)) {
        currentConfig.categories.push(optionWithId.category);
      }

      currentConfig.options.unshift(optionWithId);
      currentConfig.lastUpdated = new Date().toISOString();
      saveConfig(currentConfig);

      res.json({ success: true, option: optionWithId, totalOptions: currentConfig.options.length });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear la opción';
      res.status(500).json({ error: message });
    }
  });

  app.put("/api/xitforge/options/:id", (req, res) => {
    try {
      const { id } = req.params;
      const index = currentConfig.options.findIndex((opt) => opt.id === id);
      if (index < 0) return res.status(404).json({ error: "Opción no encontrada" });

      currentConfig.options[index] = {
        ...currentConfig.options[index],
        ...(req.body as Partial<OptionItem>),
        id,
      };

      const category = currentConfig.options[index].category;
      if (category && !currentConfig.categories.includes(category)) {
        currentConfig.categories.push(category);
      }

      currentConfig.lastUpdated = new Date().toISOString();
      saveConfig(currentConfig);
      res.json({ success: true, option: currentConfig.options[index] });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al actualizar";
      res.status(500).json({ error: message });
    }
  });

  app.delete("/api/xitforge/options/:id", (req, res) => {
    const { id } = req.params;
    const before = currentConfig.options.length;
    currentConfig.options = currentConfig.options.filter((opt) => opt.id !== id);
    currentConfig.lastUpdated = new Date().toISOString();
    saveConfig(currentConfig);
    res.json({ success: true, id, deleted: before !== currentConfig.options.length, totalOptions: currentConfig.options.length });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`XITFORGE Fullstack Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('No se pudo iniciar XITFORGE:', error);
  process.exit(1);
});
