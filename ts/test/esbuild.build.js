const { build } = require("esbuild")
const { exec } = require('child_process');

exec('rm -rf public');
build({
    entryPoints: [
        "src/index.ts",
    ],
    bundle: true,
    minify: true,
    treeShaking: true,
    outdir: "public",
}).catch(() => process.exit(1))