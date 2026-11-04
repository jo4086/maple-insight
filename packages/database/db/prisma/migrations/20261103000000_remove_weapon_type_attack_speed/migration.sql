BEGIN;

ALTER TABLE "equipment"."weapon_types"
DROP CONSTRAINT "weapon_types_primary_fields_check";

ALTER TABLE "equipment"."weapon_types"
ADD CONSTRAINT "weapon_types_primary_fields_check"
CHECK (
    (
        "category" = 'weapon'
        AND "hand_type" IN ('oneHanded', 'twoHanded')
        AND "weapon_constant" IS NOT NULL
        AND "weapon_constant" > 0
        AND ("hero_weapon_constant" IS NULL OR "hero_weapon_constant" > 0)
    )
    OR (
        "category" = 'subWeapon'
        AND "hand_type" IS NULL
        AND "weapon_constant" IS NULL
        AND "hero_weapon_constant" IS NULL
    )
);

ALTER TABLE "equipment"."weapon_types"
DROP COLUMN "attack_speed";

COMMIT;
