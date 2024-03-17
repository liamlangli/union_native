import { build } from 'esbuild';
import glsl from 'esbuild-plugin-glsl';

build({
    entryPoints: [
        'src/index.ts',
        'src/simple.ts',
        'src/terrain.ts'
    ],
    bundle: true,
    outdir: "../public",
    treeShaking: true,
    // minify: true,
    // minifyIdentifiers: true,
    // minifySyntax: true,
    plugins: [
        glsl({ minify: true, resolveIncludes: true })
    ],
});