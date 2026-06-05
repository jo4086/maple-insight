DROP INDEX IF EXISTS "equipment"."equipment_items_version_category_idx";
DROP INDEX IF EXISTS "equipment"."equipment_items_version_part_idx";
DROP INDEX IF EXISTS "equipment"."equipment_items_version_set_name_idx";
DROP INDEX IF EXISTS "equipment"."equipment_items_version_class_group_idx";

ALTER TABLE "equipment"."equipment_items" DROP CONSTRAINT IF EXISTS "equipment_items_pkey";
ALTER TABLE "equipment"."equipment_items" ADD COLUMN "id" BIGSERIAL;
ALTER TABLE "equipment"."equipment_items" DROP COLUMN "version";
ALTER TABLE "equipment"."equipment_items" ADD CONSTRAINT "equipment_items_pkey" PRIMARY KEY ("id");

CREATE UNIQUE INDEX "equipment_items_name_key" ON "equipment"."equipment_items"("name");
CREATE INDEX "equipment_items_category_idx" ON "equipment"."equipment_items"("category");
CREATE INDEX "equipment_items_part_idx" ON "equipment"."equipment_items"("part");
CREATE INDEX "equipment_items_set_name_idx" ON "equipment"."equipment_items"("set_name");
CREATE INDEX "equipment_items_class_group_idx" ON "equipment"."equipment_items"("class_group");
