import { context } from 'esbuild';
import http from 'node:http';

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

let ctx = await context({
    entryPoints: [
        "node/src/main.ts",
    ],
    bundle: true,
    outdir: "node/public",
    plugins: [no_side_effects]
});

let { host, port } = await ctx.serve({ servedir: "node/public" });

http.createServer((request, response) => {
    const options = {
        hostname: host,
        port: port,
        path: request.url,
        method: request.method,
        headers: request.headers,
    }

    // Forward each incoming request to esbuild
    const proxy_request = http.request(options, proxy_response => {
        if (proxy_response.statusCode === 404) {
            response.writeHead(404, { 'Content-Type': 'text/html' })
            response.end('<h1>A custom 404 page</h1>')
            return
        }

        // Otherwise, forward the response from esbuild to the client
        proxy_response.headers['Cross-Origin-Opener-Policy'] = 'same-origin';
        proxy_response.headers['Cross-Origin-Embedder-Policy'] = 'require-corp';
        response.writeHead(proxy_response.statusCode, proxy_response.headers);
        proxy_response.pipe(response, { end: true });
    })

    request.pipe(proxy_request, { end: true });
}).listen(3003)

console.log(`listen at ${host}:${3003}`);