import os
import sys
import time

import gflags
import ujson

from livesite import model

FLAGS = gflags.FLAGS

gflags.DEFINE_string('demodata_dir', None, '')
gflags.DEFINE_float('time_scale', None, '')
gflags.MarkFlagAsRequired('demodata_dir')
gflags.MarkFlagAsRequired('time_scale')


def load_feed(name):
  with open(os.path.join(FLAGS.demodata_dir, name)) as f:
    return ujson.load(f)['data']


def main(unused_argv):
  contest_feed = load_feed('contest.json')
  teams_feed = load_feed('teams.json')
  auth_feed = load_feed('auth.json')

  standings_index = load_feed('standings.json')
  standings_timestamp_feeds = []
  for entry in standings_index:
    standings = load_feed(entry['filename'])
    timestamp = entry['time']
    standings_timestamp_feeds.append((standings, timestamp))

  first_timestamp = standings_timestamp_feeds[0][1]
  last_timestamp = (
      standings_timestamp_feeds[-1][1] +
      (standings_timestamp_feeds[-1][1] - standings_timestamp_feeds[-2][1]))
  standings_timestamp_feeds.append(([], last_timestamp))  # sentinel

  original_times = contest_feed['times']

  model.replace_entity('teams', teams_feed)
  model.replace_entity('auth', auth_feed)

  while True:

    base_time = int(time.time())

    def convert_time(timestamp):
      return int((timestamp - first_timestamp) / FLAGS.time_scale + base_time)

    contest_feed['times'] = {
        'start': convert_time(original_times['start']),
        'end': convert_time(original_times['end']),
        'freeze': convert_time(original_times['freeze']),
        'scale': FLAGS.time_scale,
    }
    model.replace_entity('contest', contest_feed)

    for (standings_feed, timestamp), (_, next_timestamp) in zip(standings_timestamp_feeds, standings_timestamp_feeds[1:]):
      model.replace_entity('standings', standings_feed)

      next_time = convert_time(next_timestamp)
      delta_time = next_time - time.time()
      if delta_time > 0:
        time.sleep(delta_time)


if __name__ == '__main__':
  sys.exit(main(FLAGS(sys.argv)))
