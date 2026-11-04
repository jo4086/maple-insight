ALTER TABLE "equipment"."equipment_items"
ADD COLUMN "weapon_speed" SMALLINT;

ALTER TABLE "equipment"."equipment_items"
ADD CONSTRAINT "equipment_items_weapon_speed_check"
CHECK ("weapon_speed" IS NULL OR "weapon_speed" BETWEEN 1 AND 8);
