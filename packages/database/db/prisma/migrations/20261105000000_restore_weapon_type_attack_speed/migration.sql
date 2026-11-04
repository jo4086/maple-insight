BEGIN;

ALTER TABLE "equipment"."weapon_types"
ADD COLUMN "attack_speed" SMALLINT;

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
        AND (
            "weapon_constant_overrides" IS NULL
            OR CASE jsonb_typeof("weapon_constant_overrides")
                WHEN 'array' THEN jsonb_array_length("weapon_constant_overrides") > 0
                ELSE FALSE
            END
        )
        AND ("attack_speed" IS NULL OR "attack_speed" BETWEEN 1 AND 8)
    )
    OR (
        "category" = 'subWeapon'
        AND "hand_type" IS NULL
        AND "weapon_constant" IS NULL
        AND "weapon_constant_overrides" IS NULL
        AND "attack_speed" IS NULL
    )
);

COMMIT;
