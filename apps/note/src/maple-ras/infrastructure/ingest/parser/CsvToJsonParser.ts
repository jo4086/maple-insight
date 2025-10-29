import csv from 'csvtojson';
import type { IParser } from '@/domain/ingest/services/IParser';

interface CsvToJsonOptions {
  delimiter?: string;
  checkType?: boolean;
  ignoreEmpty?: boolean;
  trim?: boolean;
  flatKeys?: boolean;
  colParser?: Record<string, (value: string) => unknown>;
}

export class CsvToJsonParser implements IParser {
  constructor(private readonly options: CsvToJsonOptions = {}) {}

  async parse(filePath: string): Promise<{ rows: Record<string, unknown>[] }> {
    const rows = await csv({
      delimiter: ',',
      checkType: true,
      ignoreEmpty: true,
      trim: true,
      flatKeys: true,
      ...this.options,
    }).fromFile(filePath);

    return { rows: rows as Record<string, unknown>[] };
  }

  async parseStream(filePath: string, onRow: (row: Record<string, unknown>) => Promise<void> | void): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      csv({
        delimiter: ',',
        checkType: true,
        ignoreEmpty: true,
        trim: true,
        flatKeys: true,
        ...this.options,
      })
        .fromFile(filePath)
        .subscribe(
          async (json) => {
            await onRow(json as Record<string, unknown>);
          },
          (err) => reject(err),
          () => resolve(),
        );
    });
  }
}
