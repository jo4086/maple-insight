-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "ranking_runs" (
    "id" BIGSERIAL NOT NULL,
    "ranking_date" TEXT NOT NULL,
    "page_start" INTEGER NOT NULL,
    "page_end" INTEGER NOT NULL,
    "total_names" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "started_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMPTZ(3),
    "last_error" TEXT,

    CONSTRAINT "ranking_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ranking_raw_pages" (
    "id" BIGSERIAL NOT NULL,
    "run_id" BIGINT NOT NULL,
    "ranking_date" TEXT NOT NULL,
    "page" INTEGER NOT NULL,
    "raw_payload" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ranking_raw_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ranking_ocid_cursors" (
    "id" BIGSERIAL NOT NULL,
    "run_id" BIGINT NOT NULL,
    "last_processed_page" INTEGER NOT NULL DEFAULT 0,
    "page_offset" INTEGER NOT NULL DEFAULT 0,
    "processed_pages" INTEGER NOT NULL DEFAULT 0,
    "processed_names" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "last_error" TEXT,
    "started_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ranking_ocid_cursors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ocids" (
    "id" BIGSERIAL NOT NULL,
    "character_name" TEXT NOT NULL,
    "ocid" TEXT,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ocids_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_histories" (
    "id" BIGSERIAL NOT NULL,
    "ocid_row_id" BIGINT NOT NULL,
    "search_date" DATE NOT NULL,
    "search_count" INTEGER NOT NULL DEFAULT 0,
    "search_snapshots" JSONB,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "search_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "union_rankings" (
    "id" BIGSERIAL NOT NULL,
    "ocid_row_id" BIGINT NOT NULL,
    "ranking_date" TEXT NOT NULL,
    "queried_character_name" TEXT NOT NULL,
    "primary_character_name" TEXT,
    "is_primary_character" BOOLEAN,
    "account_key" TEXT,
    "representative_ocid_row_id" BIGINT,
    "ranking" INTEGER,
    "world_name" TEXT,
    "class_name" TEXT,
    "sub_class_name" TEXT,
    "union_level" INTEGER,
    "union_power" INTEGER,
    "raw_payload" JSONB NOT NULL,
    "fetched_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "union_rankings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_groups" (
    "id" BIGSERIAL NOT NULL,
    "previous_group_id" BIGINT,
    "label" TEXT,
    "account_key" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "primary_character_name" TEXT,
    "representative_ocid_row_id" BIGINT,
    "member_count" INTEGER NOT NULL DEFAULT 0,
    "member_names_snapshot" JSONB,
    "union_level" INTEGER,
    "union_power" INTEGER,
    "union_ranking_date" TEXT,
    "source" TEXT,
    "confidence" DOUBLE PRECISION,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "last_validated_at" TIMESTAMPTZ(3),

    CONSTRAINT "character_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_group_members" (
    "id" BIGSERIAL NOT NULL,
    "group_id" BIGINT NOT NULL,
    "ocid_row_id" BIGINT NOT NULL,
    "character_name_snapshot" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "first_seen_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "character_group_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boss_difficulties" (
    "id" BIGSERIAL NOT NULL,
    "boss_name" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "force_type" TEXT NOT NULL,
    "reward_meso" BIGINT NOT NULL,
    "entry_level" INTEGER,
    "party_size" INTEGER,
    "time_limit_seconds" INTEGER,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "boss_difficulties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boss_phases" (
    "id" BIGSERIAL NOT NULL,
    "boss_difficulty_id" BIGINT NOT NULL,
    "phase" INTEGER NOT NULL,
    "level" INTEGER,
    "required_force" INTEGER,
    "hp" BIGINT,
    "defense_rate" INTEGER,
    "time_limit_seconds" INTEGER,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "boss_phases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boss_phase_targets" (
    "id" BIGSERIAL NOT NULL,
    "boss_phase_id" BIGINT NOT NULL,
    "target_name" TEXT NOT NULL,
    "target_role" TEXT,
    "level" INTEGER,
    "required_force" INTEGER,
    "hp" BIGINT,
    "defense_rate" INTEGER,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "boss_phase_targets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ranking_runs_ranking_date_idx" ON "ranking_runs"("ranking_date");

-- CreateIndex
CREATE INDEX "ranking_runs_status_idx" ON "ranking_runs"("status");

-- CreateIndex
CREATE INDEX "ranking_raw_pages_ranking_date_page_idx" ON "ranking_raw_pages"("ranking_date", "page");

-- CreateIndex
CREATE INDEX "ranking_raw_pages_run_id_idx" ON "ranking_raw_pages"("run_id");

-- CreateIndex
CREATE UNIQUE INDEX "ranking_raw_pages_run_id_page_key" ON "ranking_raw_pages"("run_id", "page");

-- CreateIndex
CREATE UNIQUE INDEX "ranking_ocid_cursors_run_id_key" ON "ranking_ocid_cursors"("run_id");

-- CreateIndex
CREATE INDEX "ranking_ocid_cursors_status_idx" ON "ranking_ocid_cursors"("status");

-- CreateIndex
CREATE INDEX "ranking_ocid_cursors_last_processed_page_idx" ON "ranking_ocid_cursors"("last_processed_page");

-- CreateIndex
CREATE INDEX "ranking_ocid_cursors_last_processed_page_page_offset_idx" ON "ranking_ocid_cursors"("last_processed_page", "page_offset");

-- CreateIndex
CREATE UNIQUE INDEX "ocids_character_name_key" ON "ocids"("character_name");

-- CreateIndex
CREATE UNIQUE INDEX "ocids_ocid_key" ON "ocids"("ocid");

-- CreateIndex
CREATE INDEX "ocids_ocid_idx" ON "ocids"("ocid");

-- CreateIndex
CREATE INDEX "ocids_status_idx" ON "ocids"("status");

-- CreateIndex
CREATE INDEX "search_histories_search_date_idx" ON "search_histories"("search_date");

-- CreateIndex
CREATE INDEX "search_histories_ocid_row_id_idx" ON "search_histories"("ocid_row_id");

-- CreateIndex
CREATE UNIQUE INDEX "search_histories_ocid_row_id_search_date_key" ON "search_histories"("ocid_row_id", "search_date");

-- CreateIndex
CREATE UNIQUE INDEX "union_rankings_ocid_row_id_key" ON "union_rankings"("ocid_row_id");

-- CreateIndex
CREATE INDEX "union_rankings_account_key_idx" ON "union_rankings"("account_key");

-- CreateIndex
CREATE INDEX "union_rankings_representative_ocid_row_id_idx" ON "union_rankings"("representative_ocid_row_id");

-- CreateIndex
CREATE INDEX "union_rankings_world_name_union_level_union_power_primary_c_idx" ON "union_rankings"("world_name", "union_level", "union_power", "primary_character_name");

-- CreateIndex
CREATE INDEX "union_rankings_primary_character_name_idx" ON "union_rankings"("primary_character_name");

-- CreateIndex
CREATE INDEX "character_groups_previous_group_id_idx" ON "character_groups"("previous_group_id");

-- CreateIndex
CREATE INDEX "character_groups_account_key_idx" ON "character_groups"("account_key");

-- CreateIndex
CREATE INDEX "character_groups_status_idx" ON "character_groups"("status");

-- CreateIndex
CREATE INDEX "character_groups_representative_ocid_row_id_idx" ON "character_groups"("representative_ocid_row_id");

-- CreateIndex
CREATE INDEX "character_group_members_group_id_idx" ON "character_group_members"("group_id");

-- CreateIndex
CREATE INDEX "character_group_members_ocid_row_id_idx" ON "character_group_members"("ocid_row_id");

-- CreateIndex
CREATE UNIQUE INDEX "character_group_members_group_id_ocid_row_id_key" ON "character_group_members"("group_id", "ocid_row_id");

-- CreateIndex
CREATE INDEX "boss_difficulties_boss_name_idx" ON "boss_difficulties"("boss_name");

-- CreateIndex
CREATE INDEX "boss_difficulties_difficulty_idx" ON "boss_difficulties"("difficulty");

-- CreateIndex
CREATE UNIQUE INDEX "boss_difficulties_boss_name_difficulty_key" ON "boss_difficulties"("boss_name", "difficulty");

-- CreateIndex
CREATE INDEX "boss_phases_boss_difficulty_id_idx" ON "boss_phases"("boss_difficulty_id");

-- CreateIndex
CREATE UNIQUE INDEX "boss_phases_boss_difficulty_id_phase_key" ON "boss_phases"("boss_difficulty_id", "phase");

-- CreateIndex
CREATE INDEX "boss_phase_targets_boss_phase_id_idx" ON "boss_phase_targets"("boss_phase_id");

-- CreateIndex
CREATE INDEX "boss_phase_targets_target_role_idx" ON "boss_phase_targets"("target_role");

-- CreateIndex
CREATE UNIQUE INDEX "boss_phase_targets_boss_phase_id_target_name_key" ON "boss_phase_targets"("boss_phase_id", "target_name");

-- AddForeignKey
ALTER TABLE "ranking_raw_pages" ADD CONSTRAINT "ranking_raw_pages_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "ranking_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ranking_ocid_cursors" ADD CONSTRAINT "ranking_ocid_cursors_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "ranking_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "search_histories" ADD CONSTRAINT "search_histories_ocid_row_id_fkey" FOREIGN KEY ("ocid_row_id") REFERENCES "ocids"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "union_rankings" ADD CONSTRAINT "union_rankings_ocid_row_id_fkey" FOREIGN KEY ("ocid_row_id") REFERENCES "ocids"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "union_rankings" ADD CONSTRAINT "union_rankings_representative_ocid_row_id_fkey" FOREIGN KEY ("representative_ocid_row_id") REFERENCES "ocids"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_groups" ADD CONSTRAINT "character_groups_previous_group_id_fkey" FOREIGN KEY ("previous_group_id") REFERENCES "character_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_groups" ADD CONSTRAINT "character_groups_representative_ocid_row_id_fkey" FOREIGN KEY ("representative_ocid_row_id") REFERENCES "ocids"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_group_members" ADD CONSTRAINT "character_group_members_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "character_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_group_members" ADD CONSTRAINT "character_group_members_ocid_row_id_fkey" FOREIGN KEY ("ocid_row_id") REFERENCES "ocids"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boss_phases" ADD CONSTRAINT "boss_phases_boss_difficulty_id_fkey" FOREIGN KEY ("boss_difficulty_id") REFERENCES "boss_difficulties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boss_phase_targets" ADD CONSTRAINT "boss_phase_targets_boss_phase_id_fkey" FOREIGN KEY ("boss_phase_id") REFERENCES "boss_phases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
