type Locales = 'en-US' | 'ko-KR';

export function formatFileSize(bytes: number, format: 'KB' | 'MB' | 'GB' = 'KB', locale: Locales = 'ko-KR'): string {
  const kb = bytes / 1024;
  const mb = kb / 1024;
  const gb = mb / 1024;

  const numberFormat = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  });

  switch (format) {
    case 'KB':
      return `${numberFormat.format(kb)} KB`;
    case 'MB':
      return `${numberFormat.format(mb)} MB`;
    case 'GB':
      return `${numberFormat.format(gb)} GB`;
    default:
      return `${numberFormat.format(kb)} KB`;
  }
}

// if (kb < 10000) return `${kb.toFixed(1)} KB`;
// return `${(kb / 1024).toFixed(1)} MB`;

export function formatFileSizeSplit(bytes: number): [string, 'KB' | 'MB'] {
  const kb = bytes / 1024;
  if (kb < 10000) return [kb.toFixed(1), 'KB'];
  return [(kb / 1024).toFixed(1), 'MB'];
}
