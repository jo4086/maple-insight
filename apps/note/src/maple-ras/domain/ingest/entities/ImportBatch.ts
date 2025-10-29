// File: /src/domain/ingest/entities/ImportBatch.ts
import { IngestStatus } from '../types/IngestStatus';

export class ImportBatch {
  constructor(
    public readonly id: string,
    public status: IngestStatus = 'PENDING',
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {}

  advance(next: IngestStatus) {
    this.status = next;
    this.updatedAt = new Date();
  }
}
