import logging
import sys

import gflags
import tornado.httpserver
import tornado.ioloop
import tornado.web
import tornado.websocket
import ujson

from livesite import model

FLAGS = gflags.FLAGS

gflags.DEFINE_integer('port', None, 'Port to listen on.')
gflags.DEFINE_integer('poll_interval_in_seconds', 1, '')
gflags.DEFINE_bool('logtostderr', True, 'Log to stderr.')
gflags.DEFINE_bool('logtosyslog', True, 'Log to syslog.')
gflags.MarkFlagAsRequired('port')


def setup_logging():
  root = logging.getLogger()
  root.setLevel(logging.INFO)
  formatter = logging.Formatter(
      '%(asctime)-15s %(levelname)s [%(filename)s:%(lineno)d] %(message)s',
      datefmt='%Y-%m-%d %H:%M:%S')
  if FLAGS.logtostderr:
    handler = logging.StreamHandler(sys.stderr)
    handler.setFormatter(formatter)
    root.addHandler(handler)
  if FLAGS.logtosyslog:
    handler = logging.handlers.SysLogHandler('/dev/log')
    handler.setFormatter(formatter)
    root.addHandler(handler)


class Master(object):
  def __init__(self):
    self._connections = []
    self._last_feeds = {}

  def on_connection_open(self, c):
    self._connections.append(c)
    try:
      c.write_message(self._make_feeds_update())
    except Exception:
      logging.exception('write_message failed')
    self._broadcast(self._make_stats())
    logging.info('clients=%d', len(self._connections))

  def on_connection_close(self, c):
    self._connections.remove(c)
    self._broadcast(self._make_stats())
    logging.info('clients=%d', len(self._connections))

  def on_feeds_change(self, feeds):
    if feeds != self._last_feeds:
      self._last_feeds = feeds
      self._broadcast(self._make_feeds_update())

  def _make_feeds_update(self):
    return {
        'command': 'feeds_update',
        'params': {
            'feeds': self._last_feeds,
        },
    }

  def _make_stats(self):
    return {
        'command': 'stats',
        'params': {
            'num_connections': len(self._connections),
        },
    }

  def _broadcast(self, data):
    message = ujson.dumps(data)
    for c in self._connections:
      try:
        c.write_message(message)
      except Exception:
        logging.exception('write_message failed')


class Application(tornado.web.Application):
  def __init__(self):
    handlers = [('/ws/realtime', WebSocketHandler)]
    super(Application, self).__init__(handlers)


class WebSocketHandler(tornado.websocket.WebSocketHandler):
  def check_origin(self, origin):
    return True

  def open(self):
    g_master.on_connection_open(self)

  def on_close(self):
    g_master.on_connection_close(self)

  def on_message(self, message):
    pass


def poll_feeds():
  feeds = {}
  for name in ('standings', 'teams', 'contest'):
    ts = model.get_entity_ts(name)
    feeds[name] = {
        'ts': '%d.%d' % (ts.time, ts.inc),
        'url': '/api/%s.%d.%d.json' % (name, ts.time, ts.inc),
    }
  g_master.on_feeds_change(feeds)


def main(unused_argv):
  global g_master
  setup_logging()
  g_master = Master()
  app = Application()
  server = tornado.httpserver.HTTPServer(app)
  server.listen(FLAGS.port)
  cron = tornado.ioloop.PeriodicCallback(
      poll_feeds, FLAGS.poll_interval_in_seconds * 1000)
  cron.start()
  logging.info('Listening at port %d', FLAGS.port)
  tornado.ioloop.IOLoop.instance().start()


if __name__ == '__main__':
  sys.exit(main(FLAGS(sys.argv)))
