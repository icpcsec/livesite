import hashlib
import os

import bson.timestamp
import pymongo
import pymongo.collection

from livesite import siteconfig

_cached_client = None


def open_client():
    global _cached_client
    if not _cached_client:
        _cached_client = pymongo.MongoClient(
            siteconfig.data['server']['mongodb_url'])
    return _cached_client


def open_db():
    return open_client()[siteconfig.data['server']['mongodb_db']]


def drop_db():
    open_client().drop_database(siteconfig.data['server']['mongodb_db'])


def get_entity(name):
    db = open_db()
    entry = db.entities.find_one({'key': name})
    if not entry:
        return {'data': None, 'ts': bson.timestamp.Timestamp(0, 0)}
    return {'data': entry['data'], 'ts': entry['ts']}


def get_entity_ts(name):
    db = open_db()
    entry = db.entities.find_one({'key': name}, projection=['ts'])
    if not entry:
        return bson.timestamp.Timestamp(0, 0)
    return entry['ts']


def update_entity(name, update):
    real_update = update.copy()
    for command, payload in real_update.iteritems():
        real_update[command] = {('data.%s' % key if key else 'data'): value
                                for key, value in payload.iteritems()}
    real_update.setdefault('$set', {})['key'] = name
    real_update.setdefault('$currentDate', {})['ts'] = {'$type': 'timestamp'}
    db = open_db()
    new_entity = db.entities.find_one_and_update(
        {
            'key': name
        },
        real_update,
        upsert=True,
        return_document=pymongo.collection.ReturnDocument.AFTER)
    # new_entity.pop('_id')
    # db.entities_log.insert_one(new_entity)


def replace_entity(name, entity):
    update_entity(name, {'$set': {'': entity}})


def ensure_api_key():
    try:
        return get_api_key()
    except ValueError:
        api_key = hashlib.md5(os.urandom(64)).hexdigest()
        update_entity('apiKey', {'$setOnInsert': {'': api_key}})
        return api_key


def get_api_key():
    api_key = get_entity('apiKey')['data']
    if not api_key:
        raise ValueError('API key not set')
    return api_key
