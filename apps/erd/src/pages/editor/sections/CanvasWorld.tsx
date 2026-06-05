import { CANVAS_HEIGHT, CANVAS_WIDTH } from '@/ft-r';
import type { Entity } from '@/ft-r/entity';
import { EntityCard } from '@/ft-r/entity/ui';

interface CanvasWorldProps {
  entities: Entity[];
  onEntityFieldChange: (entityId: string, field: 'name' | 'pName', value: string) => void;
  zoom: number;
}

const CanvasWorld = ({ entities, onEntityFieldChange, zoom }: CanvasWorldProps) => {
  return (
    <div
      className="relative inline-block min-w-max"
      style={{
        width: `${CANVAS_WIDTH * zoom}px`,
        height: `${CANVAS_HEIGHT * zoom}px`,
      }}
    >
      <div
        className="relative origin-top-left"
        style={{
          width: `${CANVAS_WIDTH}px`,
          height: `${CANVAS_HEIGHT}px`,
          transform: `scale(${zoom})`,
        }}
      >
        <div className="absolute inset-0 border border-slate-300/70 bg-white/10" />

        {entities.map((entity) => (
          <EntityCard
            key={entity._id}
            entity={entity}
            onEntityFieldChange={onEntityFieldChange}
          />
        ))}
      </div>
    </div>
  );
};

export default CanvasWorld;
