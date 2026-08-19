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

const DEFAULT_CONFIG: XitforgeConfig = {
  version: "3.0.0",
  lastUpdated: new Date().toISOString(),
  games: [
    {
      id: "normal",
      name: "FREE FIRE NORMAL",
      badge: "NORMAL",
      description: "Versión Estándar / Clásica"
    },
    {
      id: "max",
      name: "FREE FIRE MAX",
      badge: "MAX HD",
      description: "Versión Ultra Gráficos HD"
    }
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

// In-memory / persistent config storage
let currentConfig: XitforgeConfig = { ...DEFAULT_CONFIG };

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Health Endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "XITFORGE Backend API", timestamp: new Date().toISOString() });
  });

  // 1. GET API / JSON: Retorna la configuración completa para la IPA / App
  app.get("/api/xitforge/config", (req, res) => {
    const gameQuery = req.query.game as string | undefined;
    
    if (gameQuery && (gameQuery === 'normal' || gameQuery === 'max')) {
      const filteredOptions = currentConfig.options.filter(
        (opt) => opt.game === 'all' || opt.game === gameQuery
      );
      return res.json({
        ...currentConfig,
        options: filteredOptions
      });
    }

    res.json(currentConfig);
  });

  // 2. POST API / JSON: Actualiza o Guarda la configuración desde el PANEL XITFORGE
  app.post("/api/xitforge/config", (req, res) => {
    try {
      const newConfig = req.body;
      if (!newConfig || !Array.isArray(newConfig.options)) {
        return res.status(400).json({ error: 'Formato inválido. Debe incluir array "options".' });
      }

      currentConfig = {
        ...currentConfig,
        ...newConfig,
        lastUpdated: new Date().toISOString(),
      };

      res.json({ success: true, message: 'Configuración XITFORGE actualizada con éxito', config: currentConfig });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Error al guardar la configuración' });
    }
  });

  // 3. POST API: Agregar una opción individual rápidamente
  app.post("/api/xitforge/options", (req, res) => {
    try {
      const newOption: OptionItem = req.body;
      if (!newOption.name || !newOption.type) {
        return res.status(400).json({ error: 'Nombre y tipo son obligatorios' });
      }

      const id = newOption.id || `opt_${Date.now()}`;
      const optionWithId: OptionItem = {
        ...newOption,
        id,
        game: newOption.game || 'all',
        category: newOption.category || 'General',
        createdAt: new Date().toISOString()
      };

      // Si no existe la categoría, agregarla
      if (optionWithId.category && !currentConfig.categories.includes(optionWithId.category)) {
        currentConfig.categories.push(optionWithId.category);
      }

      currentConfig.options.unshift(optionWithId);
      currentConfig.lastUpdated = new Date().toISOString();

      res.json({ success: true, option: optionWithId, totalOptions: currentConfig.options.length });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 4. DELETE API: Eliminar una opción
  app.delete("/api/xitforge/options/:id", (req, res) => {
    const { id } = req.params;
    currentConfig.options = currentConfig.options.filter(opt => opt.id !== id);
    currentConfig.lastUpdated = new Date().toISOString();
    res.json({ success: true, id, totalOptions: currentConfig.options.length });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`XITFORGE Fullstack Server running on http://localhost:${PORT}`);
  });
}

startServer();
