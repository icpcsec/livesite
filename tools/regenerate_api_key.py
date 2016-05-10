import sys

import gflags

from livesite import model

FLAGS = gflags.FLAGS


def main(unused_argv):
  model.update_entity('apiKey', {'$set': None});
  print model.get_api_key()


if __name__ == '__main__':
  sys.exit(main(FLAGS(sys.argv)))
