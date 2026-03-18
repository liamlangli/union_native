"""
dep.py — dependency manager for union_native.

Usage:
  python script/dep.py download         # Clone / update source repos
  python script/dep.py compile          # Build libraries
  python script/dep.py clean            # Remove build artefacts
  python script/dep.py download compile # Both steps in sequence
  python script/dep.py --debug compile  # Debug builds
"""

import os
import sys
import shutil
import subprocess
import platform

# ---------------------------------------------------------------------------
# Flags
# ---------------------------------------------------------------------------
debug = False

base_path    = os.path.dirname(os.path.dirname(__file__))
source_path  = os.path.join(base_path, 'third_party', 'source')
include_path = os.path.join(base_path, 'third_party', 'include')
lib_path     = os.path.join(base_path, 'third_party', 'lib')

IS_WINDOWS = platform.system() == 'Windows'
IS_MACOS   = platform.system() == 'Darwin'
IS_LINUX   = platform.system() == 'Linux'
IS_APPLE_SILICON = IS_MACOS and platform.machine() == 'arm64'

BUILD_TYPE = 'Debug' if debug else 'Release'

# ---------------------------------------------------------------------------
# Dependency table
# ---------------------------------------------------------------------------

# Dawn: CMake build flags that keep the build lean (no samples, no GL).
DAWN_CMAKE_FLAGS = ' '.join([
    '-DDAWN_FETCH_DEPENDENCIES=ON',
    '-DDAWN_BUILD_SAMPLES=OFF',
    '-DDAWN_BUILD_NODE_BINDINGS=OFF',
    '-DDAWN_ENABLE_DESKTOP_GL=OFF',
    '-DDAWN_ENABLE_OPENGLES=OFF',
    '-DDAWN_USE_GLFW=OFF',
    '-DTINT_BUILD_TESTS=OFF',
    '-DTINT_BUILD_DOCS=OFF',
    '-DTINT_BUILD_CMD_TOOLS=OFF',
    '-DBUILD_SHARED_LIBS=OFF',
])

if IS_APPLE_SILICON:
    DAWN_CMAKE_FLAGS = ' '.join([
        DAWN_CMAKE_FLAGS,
        '-DCMAKE_OSX_ARCHITECTURES=arm64',
    ])

# V8: pre-built binaries via the v8-cmake mirror.
# On Windows use the pre-built package from the v8-cmake release.
V8_CMAKE_FLAGS = ' '.join([
    '-DV8_COMPRESS_POINTERS=ON',
    '-DV8_31BIT_SMIS_ON_64BIT_ARCH=ON',
    '-DBUILD_SHARED_LIBS=OFF',
])

DAWN_LIB_OUTPUTS = [
    'build/src/dawn/native/libdawn_native.a',
    'build/src/dawn/libdawn_proc.a',
]

if IS_WINDOWS:
    DAWN_LIB_OUTPUTS.append('build/src/dawn/native/webgpu_dawn.lib')
elif IS_MACOS:
    DAWN_LIB_OUTPUTS.append('build/src/dawn/native/libwebgpu_dawn.dylib')
else:
    DAWN_LIB_OUTPUTS.append('build/src/dawn/native/libwebgpu_dawn.so')

deps = [
    # -----------------------------------------------------------------------
    # Dawn — WebGPU reference implementation (all platforms)
    # -----------------------------------------------------------------------
    {
        'name': 'dawn',
        'git': 'https://dawn.googlesource.com/dawn',
        'head': 'chromium/6736',
        'platforms': ['Darwin', 'Linux', 'Windows'],
        'includes': ['include', 'build/gen/include'],
        'libs': DAWN_LIB_OUTPUTS,
        'build_toolchain': 'cmake',
        'build_cmd': (
            f'cmake -G "Unix Makefiles" -DCMAKE_BUILD_TYPE={BUILD_TYPE} '
            f'{DAWN_CMAKE_FLAGS} .. > cmake.log'
        ),
    },

    # -----------------------------------------------------------------------
    # V8 — JavaScript engine (Windows only)
    # -----------------------------------------------------------------------
    # V8 is very large. We use the v8-cmake mirror which provides a CMake
    # wrapper around the official V8 source.
    # NOTE: Building V8 requires Python 2, Clang, and ~20 GB of disk space.
    #       On Windows it is faster to download pre-built binaries from:
    #       https://github.com/nicowillis/v8-windows-prebuilt/releases
    {
        'name': 'v8',
        'git': 'https://chromium.googlesource.com/v8/v8',
        'head': '12.3',
        'platforms': ['Windows'],
        'includes': ['include'],
        'libs': [
            'out.gn/x64.release/obj/v8_monolith.lib',
        ],
        'build_toolchain': 'gn',
        # Building V8 via gn/ninja requires depot_tools in PATH.
        'build_cmd': (
            'python tools/dev/gm.py x64.release'
        ),
    },
]

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def run_cmd(cmd, cwd=None):
    print(f'  $ {cmd}')
    subprocess.run(cmd, shell=True, check=True, cwd=cwd)


def cp_folder_sync(src, dest):
    if os.path.exists(dest):
        shutil.rmtree(dest)
    shutil.copytree(src, dest)


def current_platform():
    return platform.system()


def dep_applies(dep):
    return current_platform() in dep.get('platforms', [])


def replace_once(file_path, old_text, new_text):
        if not os.path.exists(file_path):
                return False

        with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()

        if new_text in content:
                return False

        if old_text not in content:
                return False

        content = content.replace(old_text, new_text, 1)

        with open(file_path, 'w', encoding='utf-8') as file:
                file.write(content)

        return True


def patch_dawn_for_apple_silicon(dep_dir):
        if not IS_APPLE_SILICON:
                return False

        abseil_copts = os.path.join(
                dep_dir,
                'third_party',
                'abseil-cpp',
                'absl',
                'copts',
                'AbseilConfigureCopts.cmake',
        )

        old_text = 'if(APPLE AND CMAKE_CXX_COMPILER_ID MATCHES [[Clang]])'
        new_text = 'if(APPLE AND CMAKE_SYSTEM_PROCESSOR MATCHES "arm64|aarch64")\n  set(ABSL_RANDOM_RANDEN_COPTS "${ABSL_RANDOM_HWAES_ARM64_FLAGS}")\nelseif(APPLE AND CMAKE_CXX_COMPILER_ID MATCHES [[Clang]])'

        patched = replace_once(abseil_copts, old_text, new_text)
        if patched:
                print('  patched Dawn Abseil Randen flags for Apple Silicon')
        return patched


# ---------------------------------------------------------------------------
# Commands
# ---------------------------------------------------------------------------

def download():
    os.makedirs(source_path, exist_ok=True)

    for dep in deps:
        if not dep_applies(dep):
            print(f'skip {dep["name"]} (not applicable on {current_platform()})')
            continue

        dep_dir = os.path.join(source_path, dep['name'])
        if os.path.exists(dep_dir):
            print(f'skip {dep["name"]} clone (already exists)')
        else:
            print(f'cloning {dep["name"]} …')
            run_cmd(f'git clone {dep["git"]} {dep_dir}')

        # Pin to required commit/tag
        head = subprocess.check_output(
            ['git', 'rev-parse', 'HEAD'], cwd=dep_dir, text=True).strip()
        if head.startswith(dep['head']):
            print(f'{dep["name"]}: head matches ({dep["head"]})')
        else:
            print(f'{dep["name"]}: checking out {dep["head"]}')
            run_cmd(f'git fetch --tags && git checkout {dep["head"]}', cwd=dep_dir)


def compile():
    if not os.path.exists(source_path):
        print('source not found — run `download` first')
        sys.exit(1)

    os.makedirs(include_path, exist_ok=True)
    os.makedirs(lib_path,     exist_ok=True)

    for dep in deps:
        if not dep_applies(dep):
            continue

        dep_dir = os.path.join(source_path, dep['name'])
        if not os.path.exists(dep_dir):
            print(f'skip {dep["name"]} compile (source not found — run download first)')
            continue

        toolchain = dep.get('build_toolchain', 'make')
        print(f'\ncompiling {dep["name"]} (toolchain={toolchain}) …')

        if toolchain == 'header_only':
            pass  # nothing to build; headers are copied below

        elif toolchain == 'make':
            run_cmd(dep['build_cmd'], cwd=dep_dir)

        elif toolchain == 'cmake':
            build_dir = os.path.join(dep_dir, 'build')
            os.makedirs(build_dir, exist_ok=True)
            run_cmd(dep['build_cmd'], cwd=build_dir)
            if dep['name'] == 'dawn' and patch_dawn_for_apple_silicon(dep_dir):
                shutil.rmtree(build_dir)
                os.makedirs(build_dir, exist_ok=True)
                run_cmd(dep['build_cmd'], cwd=build_dir)
            run_cmd('make -j$(nproc 2>/dev/null || sysctl -n hw.logicalcpu)', cwd=build_dir)

        elif toolchain == 'gn':
            # gn/ninja build (V8)
            run_cmd(dep['build_cmd'], cwd=dep_dir)

        # ---- copy headers --------------------------------------------------
        dep_include_dst = os.path.join(include_path, dep['name'])
        if os.path.exists(dep_include_dst):
            shutil.rmtree(dep_include_dst)
        os.makedirs(dep_include_dst, exist_ok=True)

        for inc in dep.get('includes', []):
            src = os.path.join(dep_dir, inc)
            if os.path.isdir(src):
                shutil.copytree(src, dep_include_dst, dirs_exist_ok=True)
            elif os.path.isfile(src):
                shutil.copy(src, dep_include_dst)
            else:
                print(f'  warning: include path not found: {src}')

        # ---- copy libraries ------------------------------------------------
        for lib in dep.get('libs', []):
            lib_src = os.path.join(dep_dir, lib)
            if os.path.exists(lib_src):
                shutil.copy(lib_src, lib_path)
                print(f'  copied {os.path.basename(lib_src)} → {lib_path}')
            else:
                print(f'  warning: lib not found: {lib_src}')

    print('\ndone.')


def clean():
    for dep in deps:
        if not dep_applies(dep):
            continue
        dep_dir = os.path.join(source_path, dep['name'])
        if not os.path.exists(dep_dir):
            continue
        toolchain = dep.get('build_toolchain', 'make')
        if toolchain == 'cmake':
            build_path = os.path.join(dep_dir, 'build')
            if os.path.exists(build_path):
                shutil.rmtree(build_path)
        run_cmd('git checkout .', cwd=dep_dir)


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

args = sys.argv[1:]
if not args:
    print(__doc__)
    sys.exit(1)

for arg in args:
    if arg.startswith('-'):
        if arg.lstrip('-') == 'debug':
            debug = True
            BUILD_TYPE = 'Debug'
    else:
        if arg == 'download':
            download()
        elif arg == 'compile':
            compile()
        elif arg == 'clean':
            clean()
        else:
            print(f'unknown command: {arg}')
            sys.exit(1)
