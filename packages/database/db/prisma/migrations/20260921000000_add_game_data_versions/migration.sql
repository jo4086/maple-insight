CREATE TABLE "game_data"."game_data_versions" (
    "version" TEXT NOT NULL,
    "major" INTEGER NOT NULL,
    "minor" INTEGER NOT NULL,
    "patch" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'importing',
    "completed_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "game_data_versions_pkey" PRIMARY KEY ("version")
);

INSERT INTO "game_data"."game_data_versions" (
    "version",
    "major",
    "minor",
    "patch",
    "status",
    "completed_at"
)
SELECT
    existing."version",
    split_part(existing."version", '.', 1)::INTEGER,
    split_part(existing."version", '.', 2)::INTEGER,
    split_part(existing."version", '.', 3)::INTEGER,
    'ready',
    CURRENT_TIMESTAMP
FROM (
    SELECT DISTINCT "version" FROM "game_data"."game_data_raw_files"
    UNION
    SELECT DISTINCT "version" FROM "game_data"."game_jobs"
    UNION
    SELECT '1.2.424' WHERE EXISTS (SELECT 1 FROM "equipment"."equipment_items")
) AS existing
WHERE existing."version" ~ '^\d+\.\d+\.\d+$'
ON CONFLICT ("version") DO NOTHING;

CREATE INDEX "game_data_versions_status_idx"
ON "game_data"."game_data_versions"("status");

CREATE INDEX "game_data_versions_major_minor_patch_idx"
ON "game_data"."game_data_versions"("major", "minor", "patch");

ALTER TABLE "equipment"."equipment_items"
ADD COLUMN "version" TEXT;

UPDATE "equipment"."equipment_items"
SET "version" = '1.2.424';

ALTER TABLE "equipment"."equipment_items"
ALTER COLUMN "version" SET NOT NULL;

DROP INDEX IF EXISTS "equipment"."equipment_items_name_key";
DROP INDEX IF EXISTS "equipment"."equipment_items_normalized_name_key";
DROP INDEX IF EXISTS "equipment"."equipment_items_category_idx";
DROP INDEX IF EXISTS "equipment"."equipment_items_part_idx";
DROP INDEX IF EXISTS "equipment"."equipment_items_set_name_idx";
DROP INDEX IF EXISTS "equipment"."equipment_items_class_group_idx";

CREATE UNIQUE INDEX "equipment_items_version_name_key"
ON "equipment"."equipment_items"("version", "name");

CREATE UNIQUE INDEX "equipment_items_version_normalized_name_key"
ON "equipment"."equipment_items"("version", "normalized_name");

CREATE INDEX "equipment_items_version_category_idx"
ON "equipment"."equipment_items"("version", "category");

CREATE INDEX "equipment_items_version_part_idx"
ON "equipment"."equipment_items"("version", "part");

CREATE INDEX "equipment_items_version_set_name_idx"
ON "equipment"."equipment_items"("version", "set_name");

CREATE INDEX "equipment_items_version_class_group_idx"
ON "equipment"."equipment_items"("version", "class_group");

ALTER TABLE "game_data"."game_data_raw_files"
ADD CONSTRAINT "game_data_raw_files_version_fkey"
FOREIGN KEY ("version") REFERENCES "game_data"."game_data_versions"("version")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "game_data"."game_jobs"
ADD CONSTRAINT "game_jobs_version_fkey"
FOREIGN KEY ("version") REFERENCES "game_data"."game_data_versions"("version")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "equipment"."equipment_items"
ADD CONSTRAINT "equipment_items_version_fkey"
FOREIGN KEY ("version") REFERENCES "game_data"."game_data_versions"("version")
ON DELETE CASCADE ON UPDATE CASCADE;
