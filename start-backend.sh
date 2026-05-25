#!/bin/bash
cd "$(dirname "$0")"/..

set -a
source "$(dirname "$0")/.env"
set +a

./mvnw spring-boot:run
