import cStringIO
import hashlib
import json

import bottle
import gflags
from passlib.hash import sha256_crypt
import PIL.Image

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


def respond_with_json(result):
  bottle.response.content_type = 'application/json'
  return json.dumps(result, sort_keys=True, separators=(',', ':'))


@bottle.get('/api/<name:re:(contest|teams|standings)>.json')
def api_generic_json_handler(name):
  client_ts = bottle.request.query.get('ts')
  if client_ts and client_ts == model.get_entity_ts(name):
    result = {
        'ok': True,
        'cached': True,
        'ts': client_ts,
    }
  else:
    result = model.get_entity(name)
    result.update({
        'ok': True,
        'cached': False,
    })
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


@bottle.get('/assets/<path:path>')
def assets_handler(path):
  return bottle.static_file(path, root='static/assets')


@bottle.get('/api/<path:re:.*>')
@bottle.get('/assets/<path:re:.*>')
def not_found_handler(path):
  bottle.abort(404, 'File not found.')


@bottle.get('<path:path>')
def index_handler(path):
  title = model.get_entity('contest').get('data', {}).get('title', 'LiveSite')
  return bottle.template('index.html', title=title)
