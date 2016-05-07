import apiclient.discovery
import apiclient.http
import oauth2client.client


class Uploader(object):
  def __init__(self):
    credentials = oauth2client.client.GoogleCredentials.get_application_default()
    self._service = apiclient.discovery.build('storage', 'v1', credentials=credentials)

  def upload(self, bucket_name, bucket_path, fileobj, mimetype):
    request = self._service.objects().insert(
        bucket=bucket_name,
        name=bucket_path,
        media_body=apiclient.http.MediaIoBaseUpload(
            fileobj,
            mimetype=mimetype),
        predefinedAcl='publicRead')
    request.execute(num_retries=3)
