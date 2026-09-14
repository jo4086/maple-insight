CREATE TABLE "equipment"."equipment_potential_option_texts" (
    "id" BIGSERIAL NOT NULL,
    "kind" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "part" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "option_text" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "equipment_potential_option_texts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "equipment_potential_option_texts_unique"
    ON "equipment"."equipment_potential_option_texts"("kind", "level", "part", "grade", "option_text");

CREATE INDEX "equipment_potential_option_texts_kind_level_idx"
    ON "equipment"."equipment_potential_option_texts"("kind", "level");

CREATE INDEX "equipment_potential_option_texts_part_idx"
    ON "equipment"."equipment_potential_option_texts"("part");

CREATE INDEX "equipment_potential_option_texts_grade_idx"
    ON "equipment"."equipment_potential_option_texts"("grade");
