import bson.timestamp
import gflags
import pymongo

FLAGS = gflags.FLAGS

gflags.DEFINE_string(
    'mongodb_url', 'mongodb://localhost', 'MongoDB URL to connect to.')
gflags.DEFINE_string(
    'mongodb_db', 'livesite', 'MongoDB database name.')


_cached_client = None

def open_client():
  global _cached_client
  if not _cached_client:
    _cached_client = pymongo.MongoClient(FLAGS.mongodb_url)
  return _cached_client


def open_db():
  return open_client()[FLAGS.mongodb_db]


def drop_db():
  open_client().drop_database(FLAGS.mongodb_db)


def get_entity(name):
  db = open_db()
  entry = db.entities.find_one({'_id': name})
  if not entry:
    return {'data': None, 'ts': bson.timestamp.Timestamp(0, 0)}
  return {'data': entry['data'], 'ts': entry['ts']}


def get_entity_ts(name):
  db = open_db()
  entry = db.entities.find_one({'_id': name}, projection=['ts'])
  if not entry:
    return bson.timestamp.Timestamp(0, 0)
  return entry['ts']


def update_entity(name, update):
  real_update = update.copy()
  for command, payload in real_update.iteritems():
    real_update[command] = {
        ('data.%s' % key if key else 'data'): value
        for key, value in payload.iteritems()}
  real_update.setdefault('$set', {})['_id'] = name
  real_update.setdefault('$currentDate', {})['ts'] = {'$type': 'timestamp'}
  db = open_db()
  db.entities.update_one({'_id': name}, real_update, upsert=True)


def replace_entity(name, entity):
  update_entity(name, {'': entity})
