import { build } from 'esbuild';
import glsl from 'esbuild-plugin-glsl';

build({
    entryPoints: [
        'src/index.ts',
        'src/simple.ts',
        'src/terrain.ts'
    ],
    bundle: true,
    sourcemap: "inline",
    sourcesContent: true,
    outdir: "public",
    treeShaking: true,
    external: ['acorn'],
    plugins: [
        glsl({ minify: true, resolveIncludes: true })
    ],
});