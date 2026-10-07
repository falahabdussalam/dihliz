#!/bin/sh
set -eu

: "${DATABASE_URL:?DATABASE_URL must be set}"

echo "Applying Prisma PostgreSQL migrations..."
./node_modules/.bin/prisma migrate deploy

echo "Starting application..."
exec "$@"
