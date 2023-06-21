#!python3
OUTPUT_FILENAME="build/Makefile_source"
ROOT="src"

import os
import sys


def recursive_traverse(folder, source_files, include_folders, MacOSX=False):
    print("search path: " + folder)
    nodes = os.listdir(folder)
    for n in nodes:
        sub_path = os.path.join(folder, n).replace("\\","/")
        if os.path.isdir(sub_path):
            recursive_traverse(sub_path, source_files, include_folders, MacOSX)
        else:
            if n.endswith('.cpp') or n.endswith('.c') or (MacOSX and n.endswith('.m')):
                source_files.append(sub_path)
            elif n.endswith('.h'):
                include_folders.add(os.path.dirname(sub_path))

if __name__ == '__main__':
    # read first input arguments
    if len(sys.argv) > 1:
        PLATFORM = sys.argv[1]
    else:
        print("please input OS name")
        exit(1)

    folders = []
    if PLATFORM == "OS_WINDOWS":
        folders = ["src/foundation"]
    elif PLATFORM == "OS_LINUX":
        folders = ["src/foundation"]
    elif PLATFORM == "OS_OSX":
        folders = ["src/foundation"]
    else:
        print("unknown platform")
        exit(1)

    source_files = []
    include_folders = set()
    include_folders.add("src/public")
    for folder in folders:
        include_folders.add(folder)
        recursive_traverse(folder, source_files, include_folders, PLATFORM == "OS_OSX")

    print("====")
    print("source files: \n" + '\n'.join(source_files))
    print("====")
    print("include folders: \n" + '\n'.join(include_folders))
    print("====")

    with open(OUTPUT_FILENAME, 'w') as f:
        f.write("SOURCE_FILES = \\\n")
        f.write(" \\\n".join(source_files))
        f.write("\nSOURCE_INC = \\\n-I")
        f.write("\\\n-I".join(include_folders))
