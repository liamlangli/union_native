import os
import shutil
import subprocess
import sys

# Flags
debug = False

base_path = os.path.dirname(os.path.dirname(__file__))

source_path = os.path.join(base_path, 'third_party', 'source')
include_path = os.path.join(base_path, 'third_party', 'include')
lib_path = os.path.join(base_path, 'third_party', 'lib')

deps = [
    {   
        'name': 'quickjs',
        'git': 'https://github.com/liamlangli/quickjs.git',
        'head': '3b45d15',
        'includes': ['quickjs.h', 'quickjs-libc.h'],
        'libs': ['libquickjs.a'],
        'build_cmd': 'make libquickjs.a CONFIG_MIMALLOC=y CONFIG_VERSION=\\"0.0.1\\" CONFIG_BIGNUM=y CONFIG_STR_EVAL=y CONFIG_LTO=y',
        'build_toolchain': 'make',
    },
    { 
        'name': 'mimalloc',
        'git': 'https://github.com/liamlangli/mimalloc.git',
        'head': 'cc3c14f',
        'libs': ['libmimalloc.a', 'libmimalloc-static.a'],
        'build_cmd': f'cmake -G "Unix Makefiles" -DCMAKE_BUILD_TYPE={"Debug" if debug else "Release"} -DMI_OVERRIDE=ON -DMI_BUILD_SHARED=OFF -DMI_BUILD_STATIC=ON -DMI_BUILD_TESTS=OFF -DMI_BUILD_SHARED=OFF -DMI_BUILD_TLS=OFF -DMI_BUILD_TLS=OFF -DMI_BUILD_OVERRIDE=ON -DMI_BUILD_OVERRIDE=ON .. > ./cmake.log',
        'build_toolchain': 'cmake',
    },
    {
        'name': 'libuv',
        'git': 'https://github.com/liamlangli/libuv.git',
        'head': '520eb622',
        'libs': ['libuv.a'],
        'build_cmd': f'cmake -G "Unix Makefiles" -DCMAKE_BUILD_TYPE={"Debug" if debug else "Release"} -DBUILD_TESTING=OFF .. > ./cmake.log',
        'build_toolchain': 'cmake',
    }
]

def run_cmd(cmd, cwd=None):
    subprocess.run(cmd, shell=True, check=True, cwd=cwd)

def download():
    # Download source
    os.makedirs(source_path, exist_ok=True)

    for dep in deps:
        dep_path = os.path.join(source_path, dep['name'])
        if os.path.exists(dep_path):
            print(f"skip {dep['name']} download")
        else:
            print(f"downloading {dep['name']} source")
            run_cmd(f"git clone {dep['git']} {dep_path}")
        print(dep_path)

        # Check if head matched
        head = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=dep_path, text=True).strip()
        
        if head.startswith(dep['head']):
            print(f"head matched. skip {dep['name']} checkout")
        else:
            print(f"check out {dep['name']} to {dep['head']}")
            run_cmd(f"git reset {dep['head']} && git checkout .", cwd=dep_path)

def cp_folder_sync(src, dest):
    if os.path.exists(dest):
        shutil.rmtree(dest)
    shutil.copytree(src, dest)

def clean():
    for dep in deps:
        dep_path = os.path.join(source_path, dep['name'])
        if dep['build_toolchain'] == 'cmake':
            build_path = os.path.join(dep_path, 'build')
            if os.path.exists(build_path):
                shutil.rmtree(build_path)
        run_cmd("git checkout .", cwd=dep_path)

def compile():
    if not os.path.exists(source_path):
        print('source not found. run download first')
        sys.exit(1)

    os.makedirs(include_path, exist_ok=True)
    os.makedirs(lib_path, exist_ok=True)

    for dep in deps:
        dep_path = os.path.join(source_path, dep['name'])
        print(f"compile {dep['name']}")
        if dep['build_toolchain'] == 'make':
            run_cmd(dep['build_cmd'], cwd=dep_path)
        elif dep['build_toolchain'] == 'cmake':
            build_dir = os.path.join(dep_path, 'build')
            os.makedirs(build_dir, exist_ok=True)
            run_cmd(dep['build_cmd'], cwd=build_dir)
            run_cmd('make', cwd=build_dir)

        # Copy include folder to include_path
        include_dst = os.path.join(include_path, dep['name'])
        if os.path.exists(include_dst):
            shutil.rmtree(include_dst)
        os.makedirs(include_dst, exist_ok=True)
        if dep['build_toolchain'] == 'cmake':
            src = os.path.join(dep_path, 'include')
            dst = include_dst
            cp_folder_sync(src, dst)
        elif dep['build_toolchain'] == 'make':
            for include in dep['includes']:
                src = os.path.join(dep_path, include)
                dst = os.path.join(include_dst, include)
                shutil.copy2(src, dst)

        for lib in dep['libs']:
            src = os.path.join(dep_path, 'build' if dep['build_toolchain'] == 'cmake' else '', lib)
            dst = os.path.join(lib_path, lib)
            if os.path.exists(src):
                shutil.copy2(src, dst)

# Parse arguments
args = sys.argv[1:]
if not args:
    print('usage: python build.py [--debug] download|compile')
    sys.exit(1)
else:
    for arg in args:
        if arg.startswith('--') or arg.startswith('-'):
            flag_name = arg.lstrip('-')
            if flag_name == 'debug':
                debug = True
    
    cmd = args[-1]
    if cmd == 'download':
        download()
    elif cmd == 'compile':
        compile()
    elif cmd == 'clean':
        clean()
    else:
        print(f"unknown command: {cmd}")
        sys.exit(1)
