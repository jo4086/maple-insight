BEGIN;

ALTER TABLE "equipment"."weapon_types"
ADD COLUMN "weapon_constant_overrides" JSONB;

UPDATE "equipment"."weapon_types"
SET "weapon_constant_overrides" = jsonb_build_array(
    jsonb_build_object(
        'jobId', 'hero',
        'weaponConstant', "hero_weapon_constant"::TEXT
    )
)
WHERE "hero_weapon_constant" IS NOT NULL;

ALTER TABLE "equipment"."weapon_types"
DROP CONSTRAINT "weapon_types_primary_fields_check";

ALTER TABLE "equipment"."weapon_types"
DROP CONSTRAINT "weapon_types_hero_weapon_constant_check";

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
    )
    OR (
        "category" = 'subWeapon'
        AND "hand_type" IS NULL
        AND "weapon_constant" IS NULL
        AND "weapon_constant_overrides" IS NULL
    )
);

ALTER TABLE "equipment"."weapon_types"
ADD CONSTRAINT "weapon_types_weapon_constant_overrides_shape_check"
CHECK (
    "weapon_constant_overrides" IS NULL
    OR jsonb_path_query_array(
        "weapon_constant_overrides",
        '$[*] ? (@.type() == "object" && @.jobId.type() == "string" && @.jobId != "" && @.weaponConstant.type() == "string" && @.weaponConstant != "")'
    ) = "weapon_constant_overrides"
);

ALTER TABLE "equipment"."weapon_types"
DROP COLUMN "hero_weapon_constant";

COMMIT;
