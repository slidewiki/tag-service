#!/bin/bash

echo $DOCKER_PASSWORD | docker login -u="$DOCKER_USERNAME" --password-stdin
docker build --build-arg BUILD_ENV=travis -t slidewiki/tagservice:latest-dev ./
docker push slidewiki/tagservice:latest-dev
