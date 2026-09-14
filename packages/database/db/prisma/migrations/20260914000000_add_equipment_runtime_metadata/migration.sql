ALTER TABLE "equipment"."equipment_items"
ADD COLUMN "normalized_name" TEXT,
ADD COLUMN "base_name" TEXT,
ADD COLUMN "granted_skills" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

UPDATE "equipment"."equipment_items"
SET "normalized_name" = regexp_replace("name", '\s+', '', 'g');

ALTER TABLE "equipment"."equipment_items"
ALTER COLUMN "normalized_name" SET NOT NULL;

CREATE UNIQUE INDEX "equipment_items_normalized_name_key"
ON "equipment"."equipment_items"("normalized_name");
