FROM python:2

RUN mkdir -p /opt/app
WORKDIR /opt/app

RUN apt-get update && apt-get install -y graphviz && apt-get clean

COPY requirements.txt /opt/app/
RUN pip install --no-cache-dir -r requirements.txt

COPY . /opt/app

ENV PYTHONPATH=/opt/app
CMD ./run.sh
