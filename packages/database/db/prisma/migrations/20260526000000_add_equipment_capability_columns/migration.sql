ALTER TABLE "equipment"."equipment_items"
  ADD COLUMN IF NOT EXISTS "potential_enabled" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "starforce_enabled" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "scroll_upgrade_enabled" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "additional_option_enabled" BOOLEAN NOT NULL DEFAULT true;

