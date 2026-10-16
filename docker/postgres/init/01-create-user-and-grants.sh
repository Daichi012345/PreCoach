#!/usr/bin/env bash
set -e

psql \
  --username "$POSTGRES_USER" \
  --dbname "$POSTGRES_DB" \
  --set=ON_ERROR_STOP=1 \
  --set=app_password="$PRECOACH_USER_PASSWORD" <<'SQL'
CREATE ROLE precoach_user WITH LOGIN PASSWORD :'app_password';

GRANT CONNECT ON DATABASE precoach TO precoach_user;
GRANT USAGE ON SCHEMA public TO precoach_user;
GRANT CREATE ON SCHEMA public TO precoach_user;

GRANT SELECT, INSERT, UPDATE, DELETE
ON ALL TABLES IN SCHEMA public
TO precoach_user;

GRANT USAGE, SELECT
ON ALL SEQUENCES IN SCHEMA public
TO precoach_user;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO precoach_user;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
GRANT USAGE, SELECT ON SEQUENCES TO precoach_user;
SQL
