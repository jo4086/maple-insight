import type { Entity } from '../model/types';
import { ENTITY_COLUMN_KEYS, ENTITY_COLUMNS } from '../model/constants';

interface EntityCardProps {
  entity: Entity;
  onEntityFieldChange: (entityId: string, field: 'name' | 'pName', value: string) => void;
}

const EntityCard = ({ entity, onEntityFieldChange }: EntityCardProps) => {
  return (
    <div
      data-canvas-entity="true"
      className="text-[8px] absolute overflow-hidden border border-slate-800 bg-white shadow-sm"
      style={{
        left: `${entity.position.x}px`,
        top: `${entity.position.y}px`,
        width: `${entity.size.width}px`,
        minHeight: `${entity.size.height}px`,
      }}
    >
      <TablePanel name={entity.name} pName={entity.pName} onChange={(field, value) => onEntityFieldChange(entity._id, field, value)} />

      <ColumnHeader />

      <div className="divide-y divide-slate-200">
        {entity.fields.length === 0 ? (
          <div className="flex h-10 items-center px-2 text-[8px] text-slate-400">empty</div>
        ) : (
          entity.fields.map((field) => (
            <div key={field._id} className="flex h-10 items-center text-[8px] text-slate-700">
              <div className={`min-w-0 px-2 ${ENTITY_COLUMNS.key.widthClass}`}></div>
              <div className={`min-w-0 truncate px-2 ${ENTITY_COLUMNS.name.widthClass}`}>{field.name}</div>
              <div className={`min-w-0 truncate px-2 ${ENTITY_COLUMNS.pname.widthClass}`}>{field.pName}</div>
              <div className={`min-w-0 truncate px-2 ${ENTITY_COLUMNS.domain.widthClass}`}>{field.domain}</div>
              <div className={`flex min-w-0 items-center px-2 ${ENTITY_COLUMNS.null.widthClass}`}>
                <input checked={field.isAllowNull} readOnly type="checkbox" />
              </div>
              <div className={`min-w-0 truncate px-2 ${ENTITY_COLUMNS.type.widthClass}`}>{field.type}</div>
              <div className={`min-w-0 truncate px-2 ${ENTITY_COLUMNS.default.widthClass}`}>{field.defaultValue}</div>
              <div className={`min-w-0 truncate px-2 ${ENTITY_COLUMNS.comment.widthClass}`}>{field.comment}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EntityCard;

function TablePanel({ name, onChange, pName }: { name: string; onChange: (field: 'name' | 'pName', value: string) => void; pName: string }) {
  return (
    <div className="flex items-center justify-between gap-2 bg-slate-950 px-3 py-2">
      <input
        className="min-w-0 flex-1 bg-transparent text-[10px] font-semibold text-white outline-none"
        onChange={(event) => onChange('name', event.target.value)}
        placeholder="new_entity"
        value={name}
      />
      <input
        className="w-28 bg-white px-2 border border-red-300 text-right text-[10px] text-slate-700 outline-none"
        onChange={(event) => onChange('pName', event.target.value)}
        placeholder="alias"
        value={pName}
      />
    </div>
  );
}

function ColumnHeader() {
  return (
    <div className="flex border-t border-slate-700 bg-slate-600 text-[8px] font-semibold uppercase tracking-[0.08em] text-white">
      {ENTITY_COLUMN_KEYS.map((columnKey) => {
        const column = ENTITY_COLUMNS[columnKey];

        return (
          <div key={columnKey} className={`min-w-0 border-r border-slate-500 text-center last:border-r-0 ${column.widthClass}`}>
            {column.label}
          </div>
        );
      })}
    </div>
  );
}
