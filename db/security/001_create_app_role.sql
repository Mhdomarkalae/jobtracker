-- Run as a database administrator outside the application.
-- This creates the least-privilege role the API is expected to use.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'jobtracker_app') THEN
        CREATE ROLE jobtracker_app LOGIN PASSWORD 'replace-with-secret-manager-value' NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;
    END IF;
END $$;

REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO jobtracker_app;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE users, applications, interviews, status_history TO jobtracker_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO jobtracker_app;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO jobtracker_app;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT USAGE, SELECT ON SEQUENCES TO jobtracker_app;
