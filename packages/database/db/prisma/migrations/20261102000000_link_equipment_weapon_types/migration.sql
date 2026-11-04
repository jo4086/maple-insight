ALTER TABLE "equipment"."equipment_items"
ADD COLUMN "weapon_type_id" BIGINT,
ADD COLUMN "required_class_override" JSONB;

CREATE INDEX "equipment_items_weapon_type_id_idx"
ON "equipment"."equipment_items"("weapon_type_id");

ALTER TABLE "equipment"."equipment_items"
ADD CONSTRAINT "equipment_items_weapon_type_id_fkey"
FOREIGN KEY ("weapon_type_id") REFERENCES "equipment"."weapon_types"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
