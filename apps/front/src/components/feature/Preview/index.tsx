// File: /src/components/feature/Preview/index.tsx

import type React from 'react';

import { Csv, Json } from './lender';

export type PreviewDisplayMode = 'default' | 'expanded';

interface PreviewComponentProps {
  file: File;
  displayMode: PreviewDisplayMode;
}

interface PreviewProps {
  file: File;
  displayMode?: PreviewDisplayMode;
}

const previewMap: Record<string, React.FC<PreviewComponentProps>> = {
  csv: Csv,
  // jpg: Img,
  // jpeg: Img,
  // png: Img,
  // gif: Img,
  json: Json,
  // pdf: Pdf,
};

export const Preview = ({ file, displayMode = 'default' }: PreviewProps) => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  const Component = extension ? previewMap[extension] : undefined;

  if (!Component) {
    return <p>지원하지 않는 파일 형식입니다.</p>;
  }

  return <Component file={file} displayMode={displayMode} />;
};
