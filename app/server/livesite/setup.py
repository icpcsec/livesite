import logging
import logging.handlers
import os
import sys

import bottle
import gflags
from passlib.hash import sha256_crypt

from livesite import model
from livesite import siteconfig

FLAGS = gflags.FLAGS


def _setup_logging():
    root = logging.getLogger()
    root.setLevel(logging.INFO)
    formatter = logging.Formatter(
        '%(asctime)-15s %(levelname)s [%(filename)s:%(lineno)d] %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S')
    handler = logging.StreamHandler(sys.stderr)
    handler.setFormatter(formatter)
    root.addHandler(handler)


def _setup_bottle():
    bottle.TEMPLATE_PATH = [
        os.path.join(os.path.dirname(__file__), 'templates')
    ]
    bottle.BaseRequest.MEMFILE_MAX = 8 * 1024 * 1024


def setup_common():
    FLAGS(sys.argv)
    _setup_logging()
    _setup_bottle()
    siteconfig.load()


def setup_database():
    logging.info('Setting up database...')

    api_key = model.ensure_api_key()
    logging.info('API key: %s', api_key)

    if not model.get_entity('contest')['data']:
        contest = {
            'title': u'Example Contest',
            'problems': [],
            'times': {
                'start': 1451574000,  # 2016-01-01
                'end': 1483196400,  # 2017-01-01
                'freeze': 1483196400,  # 2017-01-01
            },
        }
        model.replace_entity('contest', contest)

    if not model.get_entity('teams')['data']:
        team_map = {}
        team_map['sample'] = {
            'id': 'sample',
            'name': 'Sample Team',
            'university': 'University of Sample',
            'photo': '/images/default-photo.png',
            'members': [{
                'name': 'Member %d' % (i + 1),
                'topcoderId': '',
                'codeforcesId': '',
                'twitterId': '',
                'githubId': '',
                'comment': '',
                'icon': '/images/default-icon.png',
            } for i in xrange(3)],
        }
        model.replace_entity('teams', team_map)

    if not model.get_entity('auth')['data']:
        auth_map = {}
        fixed_hash = sha256_crypt.encrypt('hogehoge')
        auth_map['sample'] = fixed_hash
        model.replace_entity('auth', auth_map)

    if not model.get_entity('standings')['data']:
        standings = []
        model.replace_entity('standings', standings)
