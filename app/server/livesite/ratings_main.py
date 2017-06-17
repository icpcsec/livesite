import binascii
import datetime
import logging
import sys
import time
import urllib

import apscheduler.scheduler
import requests
import ujson

from livesite import model
from livesite import siteconfig
from livesite import setup


def query_topcoder(name):
    if not name or name in ('.', '..') or '/' in name:
        logging.exception('Invalid TopCoder username: %s', name)
        return -1
    # Abort on connection error.
    res = requests.get(
        'http://api.topcoder.com/v2/users/%s' % urllib.quote(name), timeout=5)
    try:
        data = res.json()
        for summary in data['ratingSummary']:
            if summary['name'] == 'Algorithm':
                return summary['rating']
    except Exception:
        logging.exception('Failed to query TopCoder rating.')
    return -1


def query_codeforces(name):
    if not name or ',' in name:
        logging.exception('Invalid CodeForces username: %s', name)
        return -1
    # Abort on connection error.
    params = {'handles': name}
    res = requests.get(
        'http://codeforces.com/api/user.info', params=params, timeout=5)
    try:
        data = res.json()
        return data['result'][0]['rating']
    except Exception:
        logging.exception('Failed to query CodeForces rating.')
    return -1


APIS = {
    'topcoderId': query_topcoder,
    'codeforcesId': query_codeforces,
}


class RatingsJob(object):
    def __init__(self):
        pass

    def __call__(self):
        teams = model.get_entity('teams')['data'] or {}
        ratings = model.get_entity('ratings')['data'] or {}
        self._maybe_update(teams, ratings)

    def _maybe_update(self, teams, ratings):
        now = time.time()
        for team in teams.itervalues():
            for member in team['members']:
                for key, query in APIS.iteritems():
                    name = member.get(key)
                    if name:
                        name_hex = binascii.hexlify(name.encode('utf-8'))
                        ts = ratings.get(key, {}).get(name_hex, {}).get('ts',
                                                                        0)
                        if now - ts > siteconfig.data['rating']['rating_stale_seconds']:
                            logging.info('Query: %s %s', key, name)
                            rating = query(name)
                            model.update_entity('ratings', {
                                '$set': {
                                    '%s.%s' % (key, name_hex): {
                                        'ts': now,
                                        'name': name,
                                        'rating': rating,
                                    },
                                },
                            })
                            logging.info('Updated: %s %s %s', key, name,
                                         rating)
                            return


def main():
    setup.setup_common()
    # Suppress apscheduler logging spam.
    logging.getLogger('apscheduler.scheduler').setLevel(logging.WARNING)
    sched = apscheduler.scheduler.Scheduler(standalone=True)
    sched.add_interval_job(
        RatingsJob(),
        seconds=siteconfig.data['rating']['check_interval_in_seconds'],
        start_date=datetime.datetime.now() + datetime.timedelta(seconds=1))
    sched.start()


if __name__ == '__main__':
    sys.exit(main())
