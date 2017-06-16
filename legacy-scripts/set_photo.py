import csv
import json
import sys

import gflags
import requests

FLAGS = gflags.FLAGS

gflags.DEFINE_string('livesite_url', None, 'URL of livesite')
gflags.DEFINE_string('api_key', None, 'API key')
gflags.DEFINE_string('team_id', None, '')
gflags.DEFINE_string('photo_url', None, '')
gflags.MarkFlagAsRequired('livesite_url')
gflags.MarkFlagAsRequired('api_key')
gflags.MarkFlagAsRequired('team_id')
gflags.MarkFlagAsRequired('photo_url')


def main(unused_argv):
    update = {'$set': {('%s.photo' % FLAGS.team_id): FLAGS.photo_url}}
    r = requests.post(
        '%s/api/admin/update/teams' % FLAGS.livesite_url,
        data={'api_key': FLAGS.api_key, 'update': json.dumps(update)})
    r.raise_for_status()


if __name__ == '__main__':
    sys.exit(main(FLAGS(sys.argv)))
