FROM python:3.9-slim-buster
MAINTAINER John WC Chau
WORKDIR /usr/src/app
RUN apt update; \
    apt install -y git; \
    git clone https://github.com/johnwcchau/libretto.git .; \
    mv docker/editor/config.ini ./config.ini; \
    pip install -r requirements.txt
ENTRYPOINT ["python3","main.py"]