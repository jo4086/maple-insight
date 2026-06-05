-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "app";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "ranking";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "game_data";

-- Move app tables
ALTER TABLE IF EXISTS "public"."ocids" SET SCHEMA "app";
ALTER TABLE IF EXISTS "public"."search_histories" SET SCHEMA "app";
ALTER TABLE IF EXISTS "public"."character_groups" SET SCHEMA "app";
ALTER TABLE IF EXISTS "public"."character_group_members" SET SCHEMA "app";

-- Move ranking tables
ALTER TABLE IF EXISTS "public"."ranking_runs" SET SCHEMA "ranking";
ALTER TABLE IF EXISTS "public"."ranking_raw_pages" SET SCHEMA "ranking";
ALTER TABLE IF EXISTS "public"."ranking_ocid_cursors" SET SCHEMA "ranking";
ALTER TABLE IF EXISTS "public"."union_rankings" SET SCHEMA "ranking";

-- Move game data tables
ALTER TABLE IF EXISTS "public"."boss_difficulties" SET SCHEMA "game_data";
ALTER TABLE IF EXISTS "public"."boss_phases" SET SCHEMA "game_data";
ALTER TABLE IF EXISTS "public"."boss_phase_targets" SET SCHEMA "game_data";
ALTER TABLE IF EXISTS "public"."game_data_raw_files" SET SCHEMA "game_data";
ALTER TABLE IF EXISTS "public"."game_data_raw_records" SET SCHEMA "game_data";
