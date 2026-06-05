import { Fragment } from 'react/jsx-runtime';
import {
  ENTITY_COLUMNS,
  ENTITY_COLUMN_KEYS,
  type EntityColumnInputType,
  type EntityColumnKey,
} from '../model/constants';

interface EntityRowProps {
  onChange: (columnKey: EntityColumnKey, value: string | boolean) => void;
  row: Record<EntityColumnKey, string | boolean>;
}

const EntityRow = ({ onChange, row }: EntityRowProps) => {
  return (
    <div className="flex w-full">
      {ENTITY_COLUMN_KEYS.map((columnKey) => {
        const col = ENTITY_COLUMNS[columnKey];

        return (
          <Fragment key={columnKey}>
            <EntityCell
              inputType={col.inputType}
              onChange={(value) => onChange(columnKey, value)}
              value={row[columnKey]}
              widthClass={col.widthClass}
            />
          </Fragment>
        );
      })}
    </div>
  );
};

export default EntityRow;

const EntityCell = ({
  inputType,
  onChange,
  value,
  widthClass,
}: {
  inputType: EntityColumnInputType;
  onChange: (value: string | boolean) => void;
  value: string | boolean;
  widthClass: string;
}) => {
  return (
    <div className={`flex min-w-0 border border-pink-400 ${widthClass}`}>
      {inputType === 'checkbox' ? (
        <label className="flex min-h-10 w-full items-center justify-center">
          <input
            checked={Boolean(value)}
            onChange={(event) => onChange(event.target.checked)}
            type="checkbox"
          />
        </label>
      ) : (
        <input
          className="min-w-0 flex-1 px-2"
          onChange={(event) => onChange(event.target.value)}
          type="text"
          value={String(value)}
        />
      )}
    </div>
  );
};
