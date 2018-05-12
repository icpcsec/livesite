import os

SCOPES = (
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/firebase.database',
    'https://www.googleapis.com/auth/devstorage.read_write',
)

CLIENT_CONFIG = {
    'installed': {
        'client_id': '880347634771-mnr73ka0ojqocsfl4ub0mms8jo5ob67v.apps.googleusercontent.com',
        'client_secret': 'AUCNO_zWF2SHS2_-sU4ATxyh',
        'redirect_uris': [
            'http://localhost',
            'urn:ietf:wg:oauth:2.0:oob',
        ],
        'auth_uri': 'https://accounts.google.com/o/oauth2/auth',
        'token_uri': 'https://accounts.google.com/o/oauth2/token',
    },
}

DEFAULT_CONFIG_PATH = os.path.join(os.environ['HOME'], '.livecli.json')

BLOB_CACHE_CONTROL = 'public, max-age=86400'
