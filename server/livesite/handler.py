import cStringIO
import hashlib

import bottle
import bson.timestamp
import gflags
from passlib.hash import sha256_crypt
import PIL.Image
import ujson

from livesite import model
from livesite import storage

FLAGS = gflags.FLAGS

gflags.DEFINE_string('gcs_bucket_name', None, '')
gflags.DEFINE_string('gcs_bucket_path_prefix', '', '')


PROFILE_SCHEMA = (
  # key, max_len
  ('name', 64),
  ('topcoderId', 32),
  ('codeforcesId', 32),
  ('twitterId', 32),
  ('githubId', 32),
  ('comment', 140),
)


def get_api_key():
  api_key = model.get_entity('apiKey')['data']
  assert api_key, 'API key has not been generated yet.'
  return api_key


def respond_with_json(result):
  bottle.response.content_type = 'application/json'
  return ujson.dumps(result, sort_keys=True)


@bottle.get('/api/<name:re:(contest|teams|standings)>.json')
def api_generic_json_handler(name):
  ts = model.get_entity_ts(name)
  bottle.redirect('/api/%s.cached.%d.%d.json' % (name, ts.time, ts.inc))


@bottle.get('/api/<name:re:(contest|teams|standings)>.cached.<ts_time:int>.<ts_inc:int>.json')
def api_generic_cached_json_handler(name, ts_time, ts_inc):
  requested_ts = bson.timestamp.Timestamp(ts_time, ts_inc)
  entry = model.get_entity(name)
  if entry['ts'] < requested_ts:
    bottle.abort(404, 'No data.')
  bottle.response.headers['Cache-Control'] = 'public,max-age=3600'
  result = {'data': entry['data']}
  return respond_with_json(result)


@bottle.post('/api/ui/update_team')
def api_ui_update_team_handler():
  teamId = bottle.request.forms['id']
  password = bottle.request.forms['password']

  hash = model.get_entity('auth')['data'].get(teamId)
  if not hash or not sha256_crypt.verify(password, hash):
    return respond_with_json({'ok': False, 'message': 'Wrong password.'})

  update = {'$set': {}}

  for i in xrange(3):
    for profile_key, max_len in PROFILE_SCHEMA:
      request_key = 'members.%d.%s' % (i, profile_key)
      value = bottle.request.forms.get(request_key)
      if value is not None:
        if len(value) > max_len:
          return respond_with_json({'ok': False, 'message': '%s too long.' % key})
        entity_key = '%s.%s' % (teamId, request_key)
        update['$set'][entity_key] = value

  uploader = storage.Uploader()

  def process_photo_upload(request_key, upload_name, entity_key, max_size):
    upload_file = bottle.request.files.get(request_key)
    if not upload_file:
      return

    if not FLAGS.gcs_bucket_name:
      raise bottle.HTTPResponse(respond_with_json(
          {'ok': False, 'message': 'Storage is not available.'}))

    im = PIL.Image.open(upload_file.file)
    im = im.convert(mode='RGB')
    if max(im.size) > max_size:
      im.thumbnail((max_size, max_size))
    buf = cStringIO.StringIO()
    im.save(buf, format='jpeg')
    buf.seek(0)

    upload_path = '%simages/upload/%s.%s.%s.jpg' % (
        FLAGS.gcs_bucket_path_prefix, teamId, upload_name,
        hashlib.md5(buf.getvalue()).hexdigest())
    uploader.upload(FLAGS.gcs_bucket_name, upload_path, buf, 'image/jpeg')
    update['$set'][entity_key] = 'https://%s.storage.googleapis.com/%s' % (
        FLAGS.gcs_bucket_name, upload_path)

  process_photo_upload(
      'teamPhotoFile',
      'photo',
      '%s.photo' % teamId,
      max_size=1200)

  for i in xrange(3):
    process_photo_upload(
        'members.%d.iconFile' % i,
        'icon.%d' % i,
        '%s.members.%d.icon' % (teamId, i),
        max_size=120)

  model.update_entity('teams', update)

  return respond_with_json({'ok': True, 'message': 'Successfully updated.'})


@bottle.post('/api/admin/update/<name:re:(contest|teams|standings|auth)>')
def api_admin_update_handler(name):
  if bottle.request.forms['api_key'] != get_api_key():
    bottle.abort(403)
  update = ujson.loads(bottle.request.forms['update'])
  model.update_entity(name, update)
  return 'ok'


@bottle.get('/assets/<path:path>')
def assets_handler(path):
  return bottle.static_file(path, root='static/assets')


@bottle.get('/demodata/<path:path>')
def demodata_handler(path):
  return bottle.static_file(path, root='static/demodata')


@bottle.get('/api/<path:re:.*>')
def not_found_handler(path):
  bottle.abort(404, 'File not found.')


@bottle.get('<path:path>')
def index_handler(path):
  title = model.get_entity('contest').get('data', {}).get('title', 'LiveSite')
  return bottle.template('index.html', title=title)
