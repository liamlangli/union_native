#!python3
OUTPUT_FILENAME="build/Makefile_source"
ROOT="src"

import os
import sys


def recursive_traverse(folder, result):
    print("search path: " + folder)
    nodes = os.listdir(folder)
    for n in nodes:
        sub_path = os.path.join(folder, n)
        if os.path.isdir(sub_path):
            recursive_traverse(sub_path, result)
        else:
            if n.endswith('.cpp') or n.endswith('.c'):
                result.append(sub_path)

def iterate_traverse(folders, result):
    for folder in folders:
        nodes = os.listdir(folder)
        for n in nodes:
            sub_path = os.path.join(folder, n)
            if not os.path.isdir(sub_path):
                if n.endswith('.cpp') or n.endswith('.c'):
                    result.append(sub_path)

if __name__ == '__main__':
    # read first input arguments
    if len(sys.argv) > 1:
        PLATFORM = sys.argv[1]
    else:
        print("please input OS name")
        exit(1)

    folders = []
    if PLATFORM == "OS_WINDOWS":
        folders = ["src/foundation", "src/foundation/win"]
    elif PLATFORM == "OS_LINUX":
        folders = ["src/foundation", "src/foundation/linux"]
    elif PLATFORM == "OS_OSX":
        folders = ["src/foundation", "src/foundation/osx"]
    else:
        print("unknown platform")
        exit(1)

    result = []
    iterate_traverse(folders, result)
    print("====")
    print("source files: \n" + '\n'.join(result))
    print("====")

    with open(OUTPUT_FILENAME, 'w') as f:
        f.write("SOURCE_FILES = \\\n")
        for r in result:
            f.write(r + " \\\n")
