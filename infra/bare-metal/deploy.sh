#!/bin/bash

# Pull the latest images
docker-compose pull

# Restart the services
docker-compose up -d --remove-orphans
