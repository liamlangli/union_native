import { build } from 'esbuild';

build({
    entryPoints: [
        'src/index.ts',
        'src/simple.ts'
    ],
    bundle: true,
    sourcemap: "inline",
    sourcesContent: true,
    outdir: "public",
    external: ['acorn']
});