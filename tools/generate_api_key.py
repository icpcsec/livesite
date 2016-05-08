import hashlib
import os
import sys

import gflags

from livesite import model

FLAGS = gflags.FLAGS


def main(unused_argv):
  api_key = hashlib.md5(os.urandom(64)).hexdigest()
  model.update_entity('apiKey', {'$set': {'': api_key}})
  print api_key


if __name__ == '__main__':
  sys.exit(main(FLAGS(sys.argv)))
