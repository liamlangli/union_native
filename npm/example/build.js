import { build } from 'esbuild';

const no_side_effects = {
    name: 'no-side-effects',
    setup(build){
        build.onResolve({ filter: /.*/ }, async args => {
            if (args.pluginData) return // Ignore this if we called ourselves

            const { path, ...rest } = args
            rest.pluginData = true // Avoid infinite recursion
            const result = await build.resolve(path, rest)

            result.sideEffects = false
            return result
        })
    }
}

build({
    entryPoints: [
        'src/simple.ts',
    ],
    bundle: true,
    outdir: "../public",
    treeShaking: true,
    format: 'iife',
    // minify: true,
    // minifyIdentifiers: true,
    // minifySyntax: true,
    plugins: [no_side_effects],
});

