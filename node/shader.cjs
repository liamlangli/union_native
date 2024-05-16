const fs = require('node:fs')
const path = require('node:path')
const { execSync } = require('node:child_process')

const source_path = path.join(__dirname, 'public/shader');
const cache_path = path.join(__dirname, 'public/shader_cache');

function compile() {
    // download source
    if (!fs.existsSync(cache_path)) {
        fs.mkdirSync(cache_path, { recursive: true })  
    }

    const files = fs.readdirSync(source_path);
    for (const file of files) {
        const file_path = path.join(source_path, file);
        const vs_cache_path = path.join(cache_path, file.replace('.hlsl', '_vs.cso'));
        const ps_cache_path = path.join(cache_path, file.replace('.hlsl', '_ps.cso'));
        if (file.endsWith('.hlsl')) {
            const vs_cmd = `dxc /T vs_5_0 /E vertex_main /Fo ${vs_cache_path} ${file_path}`;
            execSync(vs_cmd);
            const fs_cmd = `dxc /T vs_5_0 /E fragment_main /Fo ${ps_cache_path} ${file_path}`;
            execSync(fs_cmd);
        }
    }
}

compile();