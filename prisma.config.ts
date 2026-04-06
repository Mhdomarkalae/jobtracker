// Loads env from .env (default) or set DOTENV_CONFIG_PATH=.env.local for Supabase URLs in that file.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
});
