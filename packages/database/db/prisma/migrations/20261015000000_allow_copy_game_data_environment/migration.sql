ALTER TABLE "game_data"."game_data_versions"
DROP CONSTRAINT "game_data_versions_environment_check";

ALTER TABLE "game_data"."game_data_versions"
ADD CONSTRAINT "game_data_versions_environment_check"
CHECK ("environment" IN ('test', 'production', 'copy'));
