import { executeSeedFile, getTempViteServer } from './executeSeedFile';
import { fileURLToPath } from 'url';
import type { AstroIntegration  } from "astro";

export default function seederRunnerIntegration(): AstroIntegration {
  let root: URL;
  let fileUrl: URL;

  return {
    name: 'astro-seeder-runner',
    hooks: {
      'astro:config:setup': async ({ config }) => {
        root = config.root;
        fileUrl = new URL("./db/seed.ts", root)
      },
      'astro:server:setup': async ({ server, logger }) => {
        // Solo ejecutar el seed en desarrollo
        if (process.env.NODE_ENV !== 'production') {
          await executeSeedFile({ 
            filePath: fileURLToPath(fileUrl), 
            viteServer: server
          })
        }
      },
			'astro:build:setup': async ({ vite }) => {
        // No ejecutar seed durante el build para evitar problemas de BD
        console.log('Skipping seed execution during build...');
			},
    }
  }

}