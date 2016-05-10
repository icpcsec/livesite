import os
import sys
import time

import gflags
import ujson

from livesite import model

FLAGS = gflags.FLAGS

gflags.DEFINE_string('demodata_dir', 'demodata', '')
gflags.DEFINE_integer('update_interval', 10, '')
gflags.DEFINE_integer('contest_duration', 5 * 60 * 60, '')


def load_feed(name):
  with open(os.path.join(FLAGS.demodata_dir, name)) as f:
    return ujson.load(f)['data']


def main(unused_argv):
  contest_feed = load_feed('contest.json')
  teams_feed = load_feed('teams.json')
  auth_feed = load_feed('auth.json')
  standings_feeds = []
  for i in xrange(1000):
    try:
      standings_feeds.append(load_feed('standings/%d.json' % i))
    except IOError:
      break
  assert len(standings_feeds) >= 3

  model.replace_entity('teams', teams_feed)
  model.replace_entity('auth', auth_feed)

  while True:

    base_time = int(time.time())
    start_time = base_time + FLAGS.update_interval
    end_time = base_time + FLAGS.update_interval * (len(standings_feeds) - 1)
    contest_feed['times'] = {
        'start': start_time,
        'end': end_time,
        'freeze': 2 ** 32 - 1,
        'scale': float(FLAGS.contest_duration) / (end_time - start_time),
    }
    model.replace_entity('contest', contest_feed)

    for i, standings_feed in enumerate(standings_feeds):
      model.replace_entity('standings', standings_feed)

      target_time = base_time + FLAGS.update_interval * (i + 1)
      current_time = time.time()
      delta_time = target_time - current_time
      if delta_time > 0:
        time.sleep(delta_time)


if __name__ == '__main__':
  sys.exit(main(FLAGS(sys.argv)))
