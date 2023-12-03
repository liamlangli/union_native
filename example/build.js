import { build } from 'esbuild';

build({
    entryPoints: [
        'src/index.ts'
    ],
    bundle: true,
    sourcemap: "inline",
    sourcesContent: true,
    outdir: "public",
    external: ['acorn']
});