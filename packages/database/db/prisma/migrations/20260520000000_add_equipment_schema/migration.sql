CREATE SCHEMA IF NOT EXISTS "equipment";

CREATE TABLE "equipment"."equipment_items" (
    "version" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "keywords" TEXT[],
    "part" TEXT NOT NULL,
    "set_name" TEXT,
    "lucky_flag" BOOLEAN NOT NULL DEFAULT false,
    "required_level" INTEGER,
    "required_class" JSONB NOT NULL,
    "class_group" TEXT,
    "hand_type" TEXT,
    "weapon_constant" DOUBLE PRECISION,
    "str" INTEGER NOT NULL DEFAULT 0,
    "dex" INTEGER NOT NULL DEFAULT 0,
    "int" INTEGER NOT NULL DEFAULT 0,
    "luk" INTEGER NOT NULL DEFAULT 0,
    "max_hp" INTEGER NOT NULL DEFAULT 0,
    "max_mp" INTEGER NOT NULL DEFAULT 0,
    "max_hp_rate" INTEGER NOT NULL DEFAULT 0,
    "max_mp_rate" INTEGER NOT NULL DEFAULT 0,
    "attack_power" INTEGER NOT NULL DEFAULT 0,
    "magic_power" INTEGER NOT NULL DEFAULT 0,
    "armor" INTEGER NOT NULL DEFAULT 0,
    "boss_damage" INTEGER NOT NULL DEFAULT 0,
    "ignore_monster_armor" INTEGER NOT NULL DEFAULT 0,
    "cri_rate" INTEGER NOT NULL DEFAULT 0,
    "cri_damage" INTEGER NOT NULL DEFAULT 0,
    "normal_damage" INTEGER NOT NULL DEFAULT 0,
    "speed" INTEGER NOT NULL DEFAULT 0,
    "jump" INTEGER NOT NULL DEFAULT 0,
    "upgrade_scroll" INTEGER NOT NULL DEFAULT 0,
    "exceptional_scroll" INTEGER NOT NULL DEFAULT 0,
    "special_ring_level" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "equipment_items_pkey" PRIMARY KEY ("version","name")
);

CREATE INDEX "equipment_items_version_category_idx" ON "equipment"."equipment_items"("version", "category");
CREATE INDEX "equipment_items_version_part_idx" ON "equipment"."equipment_items"("version", "part");
CREATE INDEX "equipment_items_version_set_name_idx" ON "equipment"."equipment_items"("version", "set_name");
CREATE INDEX "equipment_items_version_class_group_idx" ON "equipment"."equipment_items"("version", "class_group");
