type RelationCardinalityIconProps = {
  color?: string;
  type: 'zero-or-many' | 'one' | 'zero-or-one' | 'many' | 'one-or-many' | 'one-only' | 'zero-or-one-or-many';
};

const stroke = {
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  strokeWidth: 1.35,
};

function ZeroBaseLine() {
  return <path d="M0 12H4" {...stroke} />;
}

function BaseLine() {
  return <path d="M0 12H17" {...stroke} />;
}

function LastLine() {
  return (
    <>
      <path d="M11.5 12H17" {...stroke} />
    </>
  );
}

function ZeroMarker() {
  return <circle cx="8" cy="12" r="3.5" fill="none" {...stroke} strokeWidth="2" />;
}

function OneMarker() {
  return <path d="M11.5 8V16" {...stroke} strokeWidth="2" />;
}

function OneOnlyMarker() {
  return (
    <>
      <path d="M11.5 8V16" {...stroke} strokeWidth="2" />
      <path d="M14.5 8V16" {...stroke} strokeWidth="2" />
    </>
  );
}

function ManyMarker() {
  return (
    <>
      <path d="M11.5 12L16 8.5" {...stroke} strokeWidth="1.8" />
      <path d="M11.5 12L16 15.5" {...stroke} strokeWidth="1.8" />
    </>
  );
}

function RelationCardinalityIconContent({ type }: Pick<RelationCardinalityIconProps, 'type'>) {
  return (
    <>
      {type.includes('zero') ? <ZeroBaseLine /> : <BaseLine />}

      {type === 'zero-or-one-or-many' ? (
        <>
          <ZeroMarker />
          <OneMarker />
          <ManyMarker />
          <LastLine />
        </>
      ) : null}

      {type === 'zero-or-many' ? (
        <>
          <ZeroMarker />
          <ManyMarker />
          <LastLine />
        </>
      ) : null}

      {type === 'zero-or-one' ? (
        <>
          <ZeroMarker />
          <OneMarker />
          <LastLine />
        </>
      ) : null}

      {type === 'one-or-many' ? (
        <>
          <OneMarker />
          <ManyMarker />
        </>
      ) : null}

      {type === 'one-only' ? (
        <>
          <OneOnlyMarker />
          <LastLine />
        </>
      ) : null}

      {type === 'many' ? (
        <>
          <ManyMarker />
        </>
      ) : null}

      {type === 'one' ? (
        <>
          <OneMarker />
          <LastLine />
        </>
      ) : null}
    </>
  );
}

function BaseRelationCardinalityIcon({ color, type }: RelationCardinalityIconProps) {
  return (
    <svg aria-hidden="true" fill="none" height="30" style={color ? { color } : undefined} viewBox="0 0 17 24" width="20">
      <RelationCardinalityIconContent type={type} />
    </svg>
  );
}

export function RelationSourceIcon(props: RelationCardinalityIconProps) {
  return (
    <svg aria-hidden="true" fill="none" height="30" style={props.color ? { color: props.color } : undefined} viewBox="0 0 17 24" width="20">
      <g transform="rotate(180 8.5 12)">
        <RelationCardinalityIconContent type={props.type} />
      </g>
    </svg>
  );
}

export function RelationTargetIcon(props: RelationCardinalityIconProps) {
  return <BaseRelationCardinalityIcon {...props} />;
}

export default function RelationCardinalityIcon(props: RelationCardinalityIconProps) {
  return <RelationTargetIcon {...props} />;
}
