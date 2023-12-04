#!python3

import os
import sys
from path_util import gurad_dir

HLSL_INPUT_DIR = "resource/shader/"

SPRIV_OUTPUT_DIR = "build/spirv"

OS_WINDOWS = "OS_WINDOWS"
OS_LINUX = "OS_LINUX"
OS_OSX = "OS_OSX"

def recursive_traverse(folder, source_files, suffix):
    print("search path: " + folder)
    nodes = os.listdir(folder)
    for n in nodes:
        sub_path = os.path.join(folder, n).replace("\\","/")
        if os.path.isdir(sub_path):
            recursive_traverse(sub_path, source_files)
        else:
            if n.endswith(suffix):
                source_files.append(sub_path)

def convert_hlsl_to_spriv():
    gurad_dir(SPRIV_OUTPUT_DIR)
    source_files = []
    recursive_traverse(HLSL_INPUT_DIR, source_files, ".hlsl")
    for source in source_files:
        filename = os.path.basename(source)
        vertex_output_filename = os.path.join(SPRIV_OUTPUT_DIR, filename.replace(".hlsl", "_vertex.spv"))
        pixel_output_filename = os.path.join(SPRIV_OUTPUT_DIR, filename.replace(".hlsl", "_pixel.spv"))
        print("convert " + source)
        os.system("dxc -spirv -T vs_6_0 -E vertex_main -Fo " + vertex_output_filename + " " + source)
        os.system("dxc -spirv -T ps_6_0 -E pixel_main -Fo " + pixel_output_filename + " " + source)

def convert_metal_to_metallib():
    # TODO: convert hlsl shader to metallib
    pass 

def convert():
    # read first input arguments
    if len(sys.argv) > 1:
        PLATFORM = sys.argv[1]
    else:
        print("please input OS name")
        exit(1)

    if PLATFORM == OS_OSX:
        convert_metal_to_metallib()
    else: #  OS_WINDOWS or OS_LINUX
        convert_hlsl_to_spriv()

if __name__ == '__main__':
    convert()