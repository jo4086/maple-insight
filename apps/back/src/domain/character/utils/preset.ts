export const PRESET_NOS = [1, 2, 3] as const;

export function mapPresets<T>(mapper: (presetNo: number) => T): T[] {
  return PRESET_NOS.map(mapper);
}
