import os 

def gurad_dir(dir):
    if not os.path.exists(dir):
       os.makedirs(dir)
