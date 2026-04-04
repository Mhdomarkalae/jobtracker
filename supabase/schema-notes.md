# Supabase Notes

This project uses Supabase as hosted PostgreSQL, not the Supabase JavaScript SDK.

The Spring Boot backend connects through the standard JDBC settings:

- `DATABASE_URL`
- `DATABASE_USERNAME`
- `DATABASE_PASSWORD`

Use the Supabase project's direct Postgres connection string, for example:

`jdbc:postgresql://db.<project-ref>.supabase.co:5432/postgres?sslmode=require`

The backend will create and update the schema automatically with `spring.jpa.hibernate.ddl-auto=update`.

If you already had local data before auth was added, older application rows may have `user_id = null`.
Those rows will not appear for logged-in users until you backfill `user_id` manually.
