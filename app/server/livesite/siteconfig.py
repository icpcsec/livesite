import sys

import gflags
import yaml

FLAGS = gflags.FLAGS

gflags.DEFINE_string('siteconfig_file', 'siteconfig.yaml',
                     'Path to siteconfig.yaml')

data = None


def load():
    global data
    with open(FLAGS.siteconfig_file) as f:
        data = yaml.load(f)


class FakeSiteConfigModule(object):
    def __init__(self):
        self.__file__ = FLAGS.siteconfig_file


def watch_for_development():
    # Adds a fake module claiming siteconfig.yaml is the source so that
    # reloader in bottle detects changes.
    sys.modules['__siteconfig__'] = FakeSiteConfigModule()
