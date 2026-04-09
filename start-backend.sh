#!/bin/bash
cd /Users/mhdomarkalae/IdeaProjects/jobtracker

export DATABASE_URL="jdbc:postgresql://db.wpcxhdtmwpgbdxugklpa.supabase.co:5432/postgres?sslmode=require&connectTimeout=30"
export DATABASE_USERNAME="postgres"
export DATABASE_PASSWORD="4804230272Ken^"
export JWT_SECRET="your-jwt-secret-change-in-production"
export JWT_EXPIRATION_MS="86400000"
export APP_ALLOWED_ORIGIN_PATTERNS="http://localhost:*,http://127.0.0.1:*"

./mvnw spring-boot:run
