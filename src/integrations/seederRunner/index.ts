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
        await executeSeedFile({ 
          filePath: fileURLToPath(fileUrl), 
          viteServer: server
        })
      },
			'astro:build:setup': async ({ vite }) => {
        const tempViteServer = await getTempViteServer({ viteConfig: vite });
        await executeSeedFile({ 
          filePath: fileURLToPath(fileUrl), 
          viteServer: tempViteServer
        })
			},
    }
  }

}