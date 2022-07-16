const { build } = require("esbuild")

build({
    bundle: true,
    entryPoints: [
        "src/index.ts",
    ],
    treeShaking: true,
    sourcemap: true,
    incremental: true,
    outdir: "public",
    external: [""],
    watch: {
        onRebuild(error, result) {
            if (error) console.error("watch build failed:", error)
            else console.log("watch build succeeded:", result)      
        }
    }
}).catch(() => process.exit(1))