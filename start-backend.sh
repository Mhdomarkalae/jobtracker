#!/bin/bash
cd /Users/mhdomarkalae/IdeaProjects/jobtracker

set -a
source "$(dirname "$0")/.env"
set +a

./mvnw spring-boot:run
