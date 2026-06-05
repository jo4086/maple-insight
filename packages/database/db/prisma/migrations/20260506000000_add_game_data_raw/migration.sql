-- CreateTable
CREATE TABLE "game_data_raw_files" (
    "id" BIGSERIAL NOT NULL,
    "version" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "row_count" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "game_data_raw_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_data_raw_records" (
    "id" BIGSERIAL NOT NULL,
    "file_id" BIGINT NOT NULL,
    "row_index" INTEGER NOT NULL,
    "source_key" TEXT,
    "payload" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_data_raw_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "game_data_raw_files_version_idx" ON "game_data_raw_files"("version");

-- CreateIndex
CREATE UNIQUE INDEX "game_data_raw_files_version_file_name_key" ON "game_data_raw_files"("version", "file_name");

-- CreateIndex
CREATE INDEX "game_data_raw_records_source_key_idx" ON "game_data_raw_records"("source_key");

-- CreateIndex
CREATE UNIQUE INDEX "game_data_raw_records_file_id_row_index_key" ON "game_data_raw_records"("file_id", "row_index");

-- AddForeignKey
ALTER TABLE "game_data_raw_records" ADD CONSTRAINT "game_data_raw_records_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "game_data_raw_files"("id") ON DELETE CASCADE ON UPDATE CASCADE;
