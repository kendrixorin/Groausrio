import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';

function patchCrossFetchPlugin(): Plugin {
  const fetchPattern = /this\.fetch\s*=\s*(?:!1|false)/g;
  const replacement =
    'Object.defineProperty(this,"fetch",{value:!1,writable:!0,configurable:!0})';

  return {
    name: 'patch-web3-browser-compat',
    transform(code: string, id: string) {
      if (!id.includes('node_modules')) {
        return null;
      }

      let updated = code;
      let changed = false;

      if (
        (updated.includes('this.fetch') || updated.includes('DOMException')) &&
        fetchPattern.test(updated)
      ) {
        fetchPattern.lastIndex = 0;
        updated = updated.replace(fetchPattern, replacement);
        changed = true;
      }

      if (
        id.includes('@wagmi/core') &&
        id.includes('injected') &&
        updated.includes('await this.getAccounts()')
      ) {
        updated = updated.replace(
          /await this\.getAccounts\(\)/g,
          'await this.getAccounts().catch(() => [])',
        );
        changed = true;
      }

      return changed ? { code: updated, map: null } : null;
    },
  };
}

export default defineConfig(() => {
  const crossFetchPlugin = patchCrossFetchPlugin();

  return {
    optimizeDeps: {
      rolldownOptions: {
        plugins: [crossFetchPlugin],
      },
    },
    plugins: [
      crossFetchPlugin,
      react(),
      tailwindcss(),
      // Copies src/assets into dist/ so root-relative URLs like
      // "/src/assets/images/..." (e.g. generate_image output) still resolve
      // in production builds. Do not remove.
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(__dirname, 'dist');
          const srcAssets = path.resolve(__dirname, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, {recursive: true, force: true});
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
