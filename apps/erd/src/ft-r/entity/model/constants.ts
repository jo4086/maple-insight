export const ENTITY_COLUMN_KEYS = ['key', 'name', 'pname', 'domain', 'null', 'type', 'default', 'comment'] as const;

export type EntityColumnKey = (typeof ENTITY_COLUMN_KEYS)[number];
export type EntityColumnInputType = 'text' | 'checkbox';

export const ENTITY_COLUMNS: Record<
  EntityColumnKey,
  {
    label: string;
    widthClass: string;
    inputType: EntityColumnInputType;
  }
> = {
  key: { label: 'key', widthClass: 'w-[72px]', inputType: 'text' },
  name: { label: 'name', widthClass: 'flex-1', inputType: 'text' },
  pname: { label: 'Pname', widthClass: 'flex-1', inputType: 'text' },
  domain: { label: 'domain', widthClass: 'flex-1', inputType: 'text' },
  null: { label: 'null', widthClass: 'w-[64px]', inputType: 'checkbox' },
  type: { label: 'type', widthClass: 'flex-1', inputType: 'text' },
  default: { label: 'default', widthClass: 'flex-1', inputType: 'text' },
  comment: { label: 'comment', widthClass: 'flex-1', inputType: 'text' },
};
