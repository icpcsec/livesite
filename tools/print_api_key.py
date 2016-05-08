import hashlib
import os
import sys

import gflags

from livesite import model

FLAGS = gflags.FLAGS


def main(unused_argv):
  api_key = model.get_entity('apiKey')['data']
  if not api_key:
    print >>sys.stderr, 'API key has not been generated yet.'
    return 1
  print api_key


if __name__ == '__main__':
  sys.exit(main(FLAGS(sys.argv)))
