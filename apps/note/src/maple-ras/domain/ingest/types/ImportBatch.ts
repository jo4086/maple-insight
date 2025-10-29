export interface ImportBatch {
  id: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED';
  createdAt: Date;
  updatedAt: Date;
  advance: (status: unknown) => void;
}
