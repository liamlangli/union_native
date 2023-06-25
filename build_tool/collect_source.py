#!python3
OUTPUT_FILENAME="build/Makefile_source"
ROOT="src"

import os
import sys

def recursive_traverse(folder, source_files, MacOSX=False):
    print("search path: " + folder)
    nodes = os.listdir(folder)
    for n in nodes:
        sub_path = os.path.join(folder, n).replace("\\","/")
        if os.path.isdir(sub_path):
            recursive_traverse(sub_path, source_files, MacOSX)
        else:
            if n.endswith('.cpp') or n.endswith('.c') or (MacOSX and n.endswith('.m')):
                source_files.append(sub_path)

if __name__ == '__main__':
    # read first input arguments
    if len(sys.argv) > 1:
        PLATFORM = sys.argv[1]
    else:
        print("please input OS name")
        exit(1)

    folders = ["src/foundation", "src/component", "src/plugin"]
    if not (PLATFORM == "OS_WINDOWS" or PLATFORM == "OS_LINUX" or PLATFORM == "OS_OSX"):
        print("unknown platform")
        exit(1)

    source_files = []
    for folder in folders:
        recursive_traverse(folder, source_files, PLATFORM == "OS_OSX")

    print("====")
    print("source files: \n" + '\n'.join(source_files))
    print("====")

    with open(OUTPUT_FILENAME, 'w') as f:
        f.write("SOURCE_FILES = \\\n")
        f.write(" \\\n".join(source_files))
