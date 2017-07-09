import cStringIO
import hashlib
import logging

import bottle
import bson.timestamp
from passlib.hash import sha256_crypt
import PIL.Image
import requests
import ujson

from livesite import model
from livesite import siteconfig
from livesite import storage

UI_SITECONFIG_KEYS = ('ui', 'features')


def get_profile_schema():
    return (
        # key, max_len
        ('name', 32),
        ('atcoderId', 16),
        ('topcoderId', 16),
        ('codeforcesId', 16),
        ('twitterId', 16),
        ('githubId', 16),
        ('comment', siteconfig.data['ui']['comment_chars']))


def stringify_ts(ts):
    return '%d.%d' % (ts.time, ts.inc)


def respond_with_json(result):
    bottle.response.content_type = 'application/json'
    return ujson.dumps(result, sort_keys=True)


def set_relative_redirect(path):
    bottle.response.status = 303
    bottle.response.set_header('Location', path)


@bottle.get('/api/siteconfig.json')
def api_siteconfig_json_handler():
    ui_siteconfig = {key: siteconfig.data[key] for key in UI_SITECONFIG_KEYS}
    return response_with_json(ui_siteconfig)


@bottle.get('/api/siteconfig.js')
def api_siteconfig_js_handler():
    ui_siteconfig = {key: siteconfig.data[key] for key in UI_SITECONFIG_KEYS}
    bottle.response.content_type = 'application/javascript'
    return 'window.siteconfig = %s;\n' % ujson.dumps(ui_siteconfig)


@bottle.get('/api/<name:re:(contest|teams|standings|ratings)>.json')
def api_generic_json_redirect_handler(name):
    ts = model.get_entity_ts(name)
    set_relative_redirect('/api/%s.%d.%d.json' % (name, ts.time, ts.inc))


@bottle.get(
    '/api/<name:re:(contest|teams|standings|ratings)>.<ts_time:int>.<ts_inc:int>.json'
)
def api_generic_json_with_ts_handler(name, ts_time, ts_inc):
    requested_ts = bson.timestamp.Timestamp(ts_time, ts_inc)
    entry = model.get_entity(name)
    if entry['ts'] < requested_ts:
        bottle.abort(404, 'No data.')
    bottle.response.headers['Cache-Control'] = 'public,max-age=3600'
    result = {'data': entry['data'], 'ts': stringify_ts(entry['ts'])}
    return respond_with_json(result)


@bottle.post('/api/ui/update_team')
def api_ui_update_team_handler():
    team_id = bottle.request.forms['id']
    password = bottle.request.forms['password']

    hash = model.get_entity('auth')['data'].get(team_id)
    if not ((hash and sha256_crypt.verify(password, hash)) or
            password == model.get_api_key()):
        return respond_with_json({'ok': False, 'message': 'Wrong password.'})

    update = {'$set': {}}

    if siteconfig.data['features']['prefecture']:
        prefecture = int(bottle.request.forms['prefecture'])
        assert 1 <= prefecture <= 48
        update['$set']['%s.prefecture' % team_id] = prefecture

    for i in xrange(3):
        for profile_key, max_len in get_profile_schema():
            request_key = 'members.%d.%s' % (i, profile_key)
            value = bottle.request.forms.get(request_key).decode('utf-8')
            if value is not None:
                if len(value) > max_len:
                    return respond_with_json({
                        'ok': False,
                        'message': '%s too long.' % profile_key
                    })
                entity_key = '%s.%s' % (team_id, request_key)
                update['$set'][entity_key] = value

    uploader = storage.Uploader()

    def process_photo_upload(request_key, remove_key, upload_name, entity_key,
                             default_url, max_size):
        if remove_key in bottle.request.forms:
            update['$set'][entity_key] = default_url
            return

        upload_file = bottle.request.files.get(request_key)
        if not upload_file:
            return

        if not siteconfig.data['server']['gcs_bucket_name']:
            raise bottle.HTTPResponse(
                respond_with_json({
                    'ok': False,
                    'message': 'Storage is not available.'
                }))

        im = PIL.Image.open(upload_file.file)
        im = im.convert(mode='RGB')
        if max(im.size) > max_size:
            im.thumbnail((max_size, max_size))
        buf = cStringIO.StringIO()
        im.save(buf, format='jpeg')
        buf.seek(0)

        upload_path = '%simages/upload/%s.%s.%s.jpg' % (
            siteconfig.data['server']['gcs_bucket_path_prefix'], team_id,
            upload_name, hashlib.md5(buf.getvalue()).hexdigest())
        uploader.upload(siteconfig.data['server']['gcs_bucket_name'],
                        upload_path, buf, 'image/jpeg')
        update['$set'][entity_key] = 'https://%s.storage.googleapis.com/%s' % (
            siteconfig.data['server']['gcs_bucket_name'], upload_path)

    if siteconfig.data['features']['photo_upload']:
        process_photo_upload(
            'teamPhotoFile',
            'removePhoto',
            'photo',
            '%s.photo' % team_id,
            '/images/default-photo.png',
            max_size=1200)

    for i in xrange(3):
        process_photo_upload(
            'members.%d.iconFile' % i,
            'members.%d.removeIcon' % i,
            'icon.%d' % i,
            '%s.members.%d.icon' % (team_id, i),
            '/images/default-icon.png',
            max_size=120)

    model.update_entity('teams', update)

    # TODO: Post to slack asynchronously.
    if siteconfig.data['server']['slack_webhook_url']:
        try:
            team = model.get_entity('teams')['data'][team_id]
            urlparts = bottle.request.urlparts
            text = 'Team data update: <%s://%s/team/%s|%s / %s>' % (
                urlparts.scheme, urlparts.netloc, team_id, team['name'],
                team['university'])
            data = {'payload': ujson.dumps({'text': text})}
            response = requests.post(
                siteconfig.data['server']['slack_webhook_url'],
                data=data,
                timeout=3)
            response.raise_for_status()
        except Exception:
            logging.exception('An error occurred posting to slack')

    return respond_with_json({'ok': True, 'message': 'Successfully updated.'})


@bottle.post('/api/admin/update/<name:re:(contest|teams|standings|auth)>')
def api_admin_update_handler(name):
    if bottle.request.forms['api_key'] != model.get_api_key():
        bottle.abort(403)
    update = ujson.loads(bottle.request.forms['update'])
    model.update_entity(name, update)
    return 'ok'


@bottle.get('/assets/<path:path>')
def assets_handler(path):
    return bottle.static_file(path, root='static/assets')


@bottle.get('/images/<path:path>')
def images_handler(path):
    return bottle.static_file(path, root='static/images')


@bottle.get('/api/<path:re:.*>')
@bottle.get('/favicon.ico')
@bottle.get('/robots.txt')
@bottle.get('/ws/<path:re:.*>')
def not_found_handler(path=None):
    bottle.abort(404, 'File not found.')


@bottle.get('<path:path>')
def index_handler(path):
    title = model.get_entity('contest').get('data', {}).get('title',
                                                            'LiveSite')
    google_analytics_id = siteconfig.data['ui']['google_analytics_id']
    template_dict = {
        'title': title,
        'google_analytics_id': google_analytics_id or '',
    }
    return bottle.template('index.html', **template_dict)
