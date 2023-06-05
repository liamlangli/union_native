#!python3
OUTPUT_FILENAME="build/Makefile_source"
ROOT="src"

import os

def collection(output_stream):
    source_files = []
    recursive_traverse(ROOT, source_files)
    
def recursive_traverse(node, result):
    os.listdir()

if __name__ == '__main__':
    with open(OUTPUT_FILENAME, 'w') as f:
        collect()