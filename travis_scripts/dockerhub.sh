#!/bin/bash

docker login -u="$DOCKER_USERNAME" -p="$DOCKER_PASSWORD"
docker build -t slidewiki/tagservice:latest-dev .
docker push slidewiki/tagservice:latest-dev
