CREATE TABLE "game_data"."game_jobs" (
  "version" TEXT NOT NULL,
  "job_id" TEXT NOT NULL,
  "job_name" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,

  CONSTRAINT "game_jobs_pkey" PRIMARY KEY ("version", "job_id")
);

CREATE TABLE "game_data"."game_skills" (
  "version" TEXT NOT NULL,
  "skill_id" TEXT NOT NULL,
  "job_id" TEXT NOT NULL,
  "skill_name" TEXT NOT NULL,
  "skill_desc" TEXT,
  "max_level" INTEGER,
  "invisible" BOOLEAN,
  "hyper" INTEGER,
  "req_skill" TEXT,
  "req_skill_level" INTEGER,
  "req_level" INTEGER,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,

  CONSTRAINT "game_skills_pkey" PRIMARY KEY ("version", "skill_id")
);

CREATE TABLE "game_data"."game_skill_common" (
  "version" TEXT NOT NULL,
  "skill_id" TEXT NOT NULL,
  "common_name" TEXT NOT NULL,
  "common_value" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "game_skill_common_pkey" PRIMARY KEY ("version", "skill_id", "common_name")
);

CREATE TABLE "game_data"."game_skill_hints" (
  "version" TEXT NOT NULL,
  "skill_id" TEXT NOT NULL,
  "desc" TEXT,
  "pdesc" TEXT,
  "h" TEXT,
  "ph" TEXT,
  "hch" TEXT,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,

  CONSTRAINT "game_skill_hints_pkey" PRIMARY KEY ("version", "skill_id")
);

CREATE TABLE "game_data"."game_skill_levels" (
  "version" TEXT NOT NULL,
  "skill_id" TEXT NOT NULL,
  "level" INTEGER NOT NULL,
  "level_desc" TEXT,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,

  CONSTRAINT "game_skill_levels_pkey" PRIMARY KEY ("version", "skill_id", "level")
);

CREATE TABLE "game_data"."game_skill_pvp_common" (
  "version" TEXT NOT NULL,
  "skill_id" TEXT NOT NULL,
  "common_name" TEXT NOT NULL,
  "common_value" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "game_skill_pvp_common_pkey" PRIMARY KEY ("version", "skill_id", "common_name")
);

CREATE INDEX "game_jobs_job_name_idx" ON "game_data"."game_jobs" ("job_name");
CREATE INDEX "game_skills_version_job_id_idx" ON "game_data"."game_skills" ("version", "job_id");
CREATE INDEX "game_skills_skill_name_idx" ON "game_data"."game_skills" ("skill_name");
CREATE INDEX "game_skill_common_common_name_idx" ON "game_data"."game_skill_common" ("common_name");
CREATE INDEX "game_skill_levels_level_idx" ON "game_data"."game_skill_levels" ("level");
CREATE INDEX "game_skill_pvp_common_common_name_idx" ON "game_data"."game_skill_pvp_common" ("common_name");

ALTER TABLE "game_data"."game_skills"
ADD CONSTRAINT "game_skills_version_job_id_fkey"
FOREIGN KEY ("version", "job_id")
REFERENCES "game_data"."game_jobs"("version", "job_id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "game_data"."game_skill_common"
ADD CONSTRAINT "game_skill_common_version_skill_id_fkey"
FOREIGN KEY ("version", "skill_id")
REFERENCES "game_data"."game_skills"("version", "skill_id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "game_data"."game_skill_hints"
ADD CONSTRAINT "game_skill_hints_version_skill_id_fkey"
FOREIGN KEY ("version", "skill_id")
REFERENCES "game_data"."game_skills"("version", "skill_id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "game_data"."game_skill_levels"
ADD CONSTRAINT "game_skill_levels_version_skill_id_fkey"
FOREIGN KEY ("version", "skill_id")
REFERENCES "game_data"."game_skills"("version", "skill_id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "game_data"."game_skill_pvp_common"
ADD CONSTRAINT "game_skill_pvp_common_version_skill_id_fkey"
FOREIGN KEY ("version", "skill_id")
REFERENCES "game_data"."game_skills"("version", "skill_id")
ON DELETE CASCADE ON UPDATE CASCADE;
