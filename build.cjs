const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { execSync } = require('node:child_process')

// flags
let debug = false

const source_path = path.join(__dirname, 'third_party/source')
const include_path = path.join(__dirname, 'third_party/include')
const lib_path = path.join(__dirname, 'third_party/lib')
const platform = os.platform();
const is_win32 = platform == 'win32'

const deps = [
    {   
        name: 'quickjs',
        git: 'https://github.com/liamlangli/quickjs.git',
        head: '3b45d15',
        includes: ['quickjs.h', 'quickjs-libc.h'],
        libs: ['libquickjs.a'],
        build_cmd: 'make libquickjs.a CONFIG_MIMALLOC=y CONFIG_VERSION="\\\"0.0.1\\\"" CONFIG_BIGNUM=y CONFIG_STR_EVAL=y CONFIG_LTO=y',
        build_toolchain: 'make',
    },
    { 
        name: 'mimalloc',
        git: 'https://github.com/liamlangli/mimalloc.git',
        head: 'cc3c14f',
        libs: ['libmimalloc.a', 'libmimalloc-static.a'],
        build_cmd: `cmake -G "Unix Makefiles" -DCMAKE_BUILD_TYPE=${debug ? 'Debug' : 'Release'} -DMI_OVERRIDE=ON -DMI_BUILD_SHARED=OFF -DMI_BUILD_STATIC=ON -DMI_BUILD_TESTS=OFF -DMI_BUILD_SHARED=OFF -DMI_BUILD_TLS=OFF -DMI_BUILD_TLS=OFF -DMI_BUILD_OVERRIDE=ON -DMI_BUILD_OVERRIDE=ON .. > ./cmake.log`,
        build_toolchain: 'cmake',
    },
    {
        name: 'libuv',
        git: 'https://github.com/liamlangli/libuv.git',
        head: '520eb622',
        libs: ['libuv.a'],
        build_cmd: `cmake -G "Unix Makefiles" -DCMAKE_BUILD_TYPE=${debug ? 'Debug' : 'Release'} -DBUILD_TESTING=OFF .. > ./cmake.log`,
        build_toolchain: 'cmake',
    }
]

function download() {
    // download source
    if (!fs.existsSync(source_path)) {
        fs.mkdirSync(source_path, { recursive: true })  
    }

    for (const dep of deps) {
        const dep_path = path.join(source_path, dep.name);
        if (fs.existsSync(dep_path)) {
            console.log(`skip ${dep.name} download`)
        } else {
            console.log(`downloading ${dep.name} source`)
            const cmd = `git clone ${dep.git} ${dep_path}`;
            execSync(cmd, { stdio: 'inherit' });
        }

        // check if head matched
        const cmd = `git rev-parse HEAD`;
        const head = execSync(cmd, {
            cwd: dep_path,
            encoding: 'utf8'
        }).trim();
        
        if (head.startsWith(dep.head)) {
            console.log(`head matched. skip ${dep.name} checkout`)
        } else {
            console.log(`check out ${dep.name} to ${dep.head}`)
            const cmd = `git reset ${dep.head} && git checkout .`;
            execSync(cmd, { cwd : dep_path, stdio: 'inherit' });
        }
    }
}

function cp_folder_sync(src, dest) {
    if (fs.existsSync(dest)) {
        fs.rmSync(dest, { recursive: true });
    }
    fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(f => {
        const src_path = path.join(src, f);
        const dest_path = path.join(dest, f);
        if (fs.lstatSync(src_path).isDirectory()) {
            cp_folder_sync(src_path, dest_path);
        } else {
            fs.copyFileSync(src_path, dest_path);
        }
    });
}

function clean() {
    for (const dep of deps) {
        if (dep.build_toolchain === 'cmake') {
            const build_path = path.join(dep_path, 'build');
            if (fs.existsSync(build_path)) {
                fs.rmSync(build_path, { recursive: true });
            }
        }
        const checkout_cmd = `git checkout .`;
        execSync(checkout_cmd, { cwd: dep_path });
    }
}

function compile() {
    if (!fs.existsSync(source_path)) {
        console.log('source not found. run download first')
        process.exit(1);
    }

    if (!fs.existsSync(include_path)) {
        fs.mkdirSync(include_path, { recursive: true })
    }

    if (!fs.existsSync(lib_path)) {
        fs.mkdirSync(lib_path, { recursive: true })
    }

    for (const dep of deps) {
        const dep_path = path.join(source_path, dep.name);
        console.log(`compile ${dep.name}`)
        if (dep.build_toolchain === 'make') {
            execSync(dep.build_cmd, { cwd: dep_path });
        } else if (dep.build_toolchain === 'cmake') {
            if (!fs.existsSync(path.join(dep_path, 'build'))) {
                fs.mkdirSync(path.join(dep_path, 'build'), { recursive: true })
            }
            const cwd = path.join(dep_path, 'build');
            execSync(dep.build_cmd, { cwd });
            execSync('make', { cwd });
        }

        // copy include folder to include_path
        const include_dst = path.join(include_path, dep.name);
        if (fs.existsSync(include_dst)) {
            fs.rmSync(include_dst, { recursive: true });
        }
        fs.mkdirSync(include_dst, { recursive: true });
        if (dep.build_toolchain === 'cmake') {
            const src = path.join(dep_path, 'include');
            const dst = path.join(include_dst);
            cp_folder_sync(src, dst);
        } else if (dep.build_toolchain === 'make') {
            for (const include of dep.includes) {
                const src = path.join(dep_path, include);
                const dst = path.join(include_dst, include);
                fs.copyFileSync(src, dst);
            }
        }

        for (const lib of dep.libs) {
            const src = path.join(dep_path, dep.build_toolchain === 'cmake' ? 'build' : '', lib);
            const dst = path.join(lib_path, lib);
            if (fs.existsSync(src))
                fs.copyFileSync(src, dst);
        }
    }
}

// parse arguments
const args = process.argv.slice(2)
if (args.length === 0) {
    console.log('usage: node build.js [--debug] download|compile')
    process.exit(1)
} else {
    for (const arg of args) {
        if (arg.startsWith('--') || arg.startsWith('-')) {
            const flag_name = arg.slice(arg.lastIndexOf('-') + 1)
            if (flag_name === 'debug') {
                debug = true
            }
        }
    }
    
    const cmd = args[args.length - 1];
    if (cmd === 'download') {
        download()
    } else if (cmd === 'compile') {
        compile()
    } else if (cmd === 'clean') {
        clean();
    } else {
        console.log(`unknown command: ${cmd}`)
        process.exit(1)
    }
}
