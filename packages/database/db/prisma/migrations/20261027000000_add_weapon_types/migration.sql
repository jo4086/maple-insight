CREATE TABLE "equipment"."weapon_types" (
    "id" BIGSERIAL NOT NULL,
    "part" TEXT NOT NULL,
    "normalized_part" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "class_group_keys" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "allowed_job_ids" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "availability_mode" TEXT NOT NULL,
    "is_dedicated" BOOLEAN NOT NULL,
    "hand_type" TEXT,
    "weapon_constant" DECIMAL(8,4),
    "hero_weapon_constant" DECIMAL(8,4),
    "attack_speed" SMALLINT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "weapon_types_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "weapon_types_category_check"
        CHECK ("category" IN ('weapon', 'subWeapon')),
    CONSTRAINT "weapon_types_primary_fields_check"
        CHECK (
            (
                "category" = 'weapon'
                AND "hand_type" IN ('oneHanded', 'twoHanded')
                AND "weapon_constant" IS NOT NULL
                AND "weapon_constant" > 0
                AND ("hero_weapon_constant" IS NULL OR "hero_weapon_constant" > 0)
                AND ("attack_speed" IS NULL OR "attack_speed" BETWEEN 1 AND 8)
            )
            OR (
                "category" = 'subWeapon'
                AND "hand_type" IS NULL
                AND "weapon_constant" IS NULL
                AND "hero_weapon_constant" IS NULL
                AND "attack_speed" IS NULL
            )
        ),
    CONSTRAINT "weapon_types_hero_weapon_constant_check"
        CHECK (
            "hero_weapon_constant" IS NULL
            OR (
                "category" = 'weapon'
                AND "part" IN ('한손검', '두손검', '한손도끼', '두손도끼')
            )
        ),
    CONSTRAINT "weapon_types_class_group_keys_check"
        CHECK (
            "class_group_keys" <@ ARRAY['warrior', 'archer', 'mage', 'thief', 'pirate']::TEXT[]
            AND array_position("class_group_keys", NULL) IS NULL
        ),
    CONSTRAINT "weapon_types_allowed_job_ids_check"
        CHECK (
            array_position("allowed_job_ids", NULL) IS NULL
            AND array_position("allowed_job_ids", '') IS NULL
        ),
    CONSTRAINT "weapon_types_availability_check"
        CHECK (
            (
                "availability_mode" = 'common'
                AND cardinality("class_group_keys") = 0
                AND cardinality("allowed_job_ids") = 0
                AND NOT "is_dedicated"
            )
            OR (
                "availability_mode" = 'class_groups'
                AND cardinality("class_group_keys") > 0
                AND cardinality("allowed_job_ids") = 0
                AND NOT "is_dedicated"
            )
            OR (
                "availability_mode" = 'job_ids'
                AND cardinality("class_group_keys") = 0
                AND cardinality("allowed_job_ids") > 0
                AND (NOT "is_dedicated" OR cardinality("allowed_job_ids") = 1)
            )
        )
);

CREATE UNIQUE INDEX "weapon_types_category_normalized_part_key"
    ON "equipment"."weapon_types"("category", "normalized_part");
