import { createServer, mergeConfig, type HMRPayload, type UserConfig, type ViteDevServer } from 'vite';

export async function executeSeedFile({
	filePath,
	viteServer,
}: {
	filePath: string;
	viteServer: ViteDevServer;
}) {
	const mod = await viteServer.ssrLoadModule(filePath);
	if (typeof mod.default !== 'function') {
    throw new Error("The seed file does not export a default function.");
	}
	try {
		await mod.default();
	} catch (e) {
		throw e;
	}
}

export async function getTempViteServer({ viteConfig }: { viteConfig: UserConfig }) {
	const tempViteServer = await createServer(
		mergeConfig(viteConfig, {
			server: { middlewareMode: true, hmr: false, watch: null, ws: false },
			optimizeDeps: { noDiscovery: true },
			ssr: { external: [] },
			logLevel: 'silent',
		}),
	);

	const hotSend = tempViteServer.hot.send;
	tempViteServer.hot.send = (payload: HMRPayload) => {
		if (payload.type === 'error') {
			throw payload.err;
		}
		return hotSend(payload);
	};

	return tempViteServer;
}