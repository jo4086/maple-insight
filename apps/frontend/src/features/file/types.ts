export interface UploadParams {
  files: File[];
  profile?: Record<string, unknown>;
  streaming?: boolean;
  version?: string;
  uploader?: string;
  checksum?: string;
  onProgress?: (_percent: number) => void;
}

export interface UploadResp {
  ok: boolean;
  item: { name: string; url?: string }[];
}
