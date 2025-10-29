// File: /src/components/feature/Preview/index.tsx

import type React from 'react';

import { Csv2, Json } from './lender';

const previewMap: Record<string, React.FC<{ file: File }>> = {
  csv: Csv2,
  // jpg: Img,
  // jpeg: Img,
  // png: Img,
  // gif: Img,
  json: Json,
  // pdf: Pdf,
};

interface PreviewProps {
  file: File;
}

export const Preview = ({ file }: PreviewProps) => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  const Component = extension ? previewMap[extension] : undefined;

  if (!Component) {
    return <p>지원하지 않는 파일 형식입니다.</p>;
  }

  return <Component file={file} />;
};
