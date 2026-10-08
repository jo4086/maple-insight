ALTER TABLE "game_data"."game_data_versions"
ADD COLUMN "environment" TEXT,
ADD COLUMN "released_on" DATE;

UPDATE "game_data"."game_data_versions"
SET "environment" = CASE
    WHEN "patch" BETWEEN 100 AND 299 THEN 'test'
    WHEN "patch" BETWEEN 300 AND 499 THEN 'production'
    ELSE 'production'
END;

ALTER TABLE "game_data"."game_data_versions"
ALTER COLUMN "environment" SET NOT NULL;

ALTER TABLE "game_data"."game_data_versions"
ADD CONSTRAINT "game_data_versions_environment_check"
CHECK ("environment" IN ('test', 'production'));

CREATE INDEX "game_data_versions_environment_idx"
ON "game_data"."game_data_versions"("environment");
