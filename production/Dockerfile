FROM python:2

RUN mkdir -p /opt/app
WORKDIR /opt/app

COPY requirements.txt /opt/app/
RUN pip install --no-cache-dir -r requirements.txt

COPY . /opt/app

ENV PYTHONPATH=/opt/app
CMD ./run.sh --http-socket=:8000 --pyargv='--gcs_bucket_name=icpcsec --gcs_bucket_path_prefix=icpc2016-domestic/'
