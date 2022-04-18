import os
from glob import glob

imgs = glob("*.jpg")

for im in imgs:
    if not os.path.isfile(os.path.join("..", im)):
        print("unlinking:", im)
        os.remove(im)
