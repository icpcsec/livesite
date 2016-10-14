import csv
import json
import sys

import gflags
import requests

FLAGS = gflags.FLAGS

gflags.DEFINE_string('url', None, 'URL of livesite')
gflags.DEFINE_string('api_key', None, 'API key')
gflags.DEFINE_string('problems_csv', None, '')
gflags.MarkFlagAsRequired('url')
gflags.MarkFlagAsRequired('api_key')
gflags.MarkFlagAsRequired('problems_csv')


def main(unused_argv):
    problems = []
    with open(FLAGS.problems_csv) as raw_in:
        csv_in = csv.DictReader(raw_in)
        for row in csv_in:
            problem = {key: row[key] for key in ('color', 'label', 'name')}
            problems.append(problem)

    update = {'$set': {'problems': problems}}

    json.dump(update, sys.stdout, indent=2)
    print
    if raw_input('Are you really sure? ').strip().lower() != 'yes':
        return 'aborted.'
    postdata = {
        'api_key': FLAGS.api_key,
        'update': json.dumps(update),
    }
    r = requests.post('%s/api/admin/update/contest' % FLAGS.url, data=postdata)
    r.raise_for_status()


if __name__ == '__main__':
    sys.exit(main(FLAGS(sys.argv)))
