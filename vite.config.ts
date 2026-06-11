import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { defineConfig } from 'vite-plus';
import { fmt, lint } from '@soybeanjs/oxc-config';

export default defineConfig({
  staged: {
    '*': 'vp check --fix'
  },
  fmt,
  lint: {
    ...lint,
    rules: {
      ...lint.rules,
      'no-loss-of-precision': 'off',
      'oxc/approx-constant': 'off'
    }
  },
  resolve: {
    tsconfigPaths: true
  },
  pack: {
    entry: ['src/colord.ts', 'src/index.ts', 'src/palette/index.ts', 'src/plugins/**/*.ts'],
    platform: 'neutral',
    clean: true,
    dts: true,
    sourcemap: false,
    minify: false,
    fixedExtension: false,
    hooks: {
      'build:done': async ctx => {
        ctx.chunks.forEach(chunk => {
          if (!chunk.fileName.includes('plugins/')) return;

          const filePath = path.join(chunk.outDir, chunk.fileName);
          readFile(filePath, 'utf-8').then(code => {
            const newCode = code.replace(`declare module '../colord'`, `declare module '@soybeanjs/colord'`);

            writeFile(filePath, newCode, 'utf-8');
          });
        });
      }
    }
  }
});
