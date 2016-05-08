import bson.timestamp
import gflags
import pymongo

FLAGS = gflags.FLAGS

gflags.DEFINE_string(
    'mongodb_url', 'mongodb://localhost', 'MongoDB URL to connect to.')
gflags.DEFINE_string(
    'mongodb_db', 'livesite', 'MongoDB database name.')


def open_client():
  return pymongo.MongoClient(FLAGS.mongodb_url)


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
        ('data.%s' % key): value for key, value in payload.iteritems()}
  real_update.setdefault('$set', {})
  real_update['$set']['_id'] = name
  real_update['$set']['ts'] = bson.timestamp.Timestamp(0, 0)
  db = open_db()
  db.entities.update_one({'_id': name}, real_update, upsert=True)


def replace_entity(name, entity):
  replacement = {
      '_id': name,
      'ts': bson.timestamp.Timestamp(0, 0),
      'data': entity,
  }
  db = open_db()
  db.entities.replace_one({'_id': name}, replacement, upsert=True)
