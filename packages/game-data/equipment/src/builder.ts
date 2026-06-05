/**
 * 빌더 종류
 *  1. meta 빌더
 *  2. stat 빌더
 *
 * 빌더 형식
 *
 * 함수<장비명>(여기 안에는 각 빌더마다 필요한 값을 거기서 쓰는걸로)
 */

/** 장비 이름을 key로 하는 데이터 맵을 단계적으로 작성하는 공통 builder */
export type EquipmentBuilder<TName extends string, TInput, TValue, TUsed extends TName, TExtra = never> = {
  /** 장비 이름을 추가한다. 이미 추가한 이름은 다음 add 후보에서 제외된다. */
  add: <const TCurrentName extends Exclude<TName, TUsed>>(
    name: TCurrentName,
    input?: TInput,
    extra?: TExtra,
  ) => EquipmentBuilder<TName, TInput, TValue, TUsed | TCurrentName, TExtra>;
  /** 작성 중인 부분 맵을 반환한다. 일부 장비가 누락되어도 허용한다. */
  done: () => Partial<Record<TName, TValue>>;
  /** 모든 장비 이름이 작성된 경우에만 전체 맵을 반환한다. */
  doneStrict: [Exclude<TName, TUsed>] extends [never] ? () => Record<TName, TValue> : never;
};

/** meta builder 별칭 */
export type EquipmentMetaBuilder<TName extends string, TInput, TValue, TUsed extends TName> = EquipmentBuilder<TName, TInput, TValue, TUsed>;

/** stat builder 별칭 */
export type EquipmentStatBuilder<TName extends string, TInput, TValue, TUsed extends TName, TExtra = never> = EquipmentBuilder<TName, TInput, TValue, TUsed, TExtra>;

type CreateEquipmentBuilderOptions<TName extends string, TInput, TValue, TExtra> = {
  /** add() 입력값을 실제 맵 값으로 변환하는 함수 */
  createValue: (name: TName, input: TInput | undefined, extra: TExtra | undefined) => TValue;
  /** 이미 작성된 맵. 재귀적으로 add() 체인을 이어갈 때 사용한다. */
  map?: Partial<Record<TName, TValue>>;
};

/** 장비 데이터 맵 builder 기본형 */
export function createEquipmentBuilder<TName extends string, TInput, TValue, TUsed extends TName = never, TExtra = never>({
  createValue,
  map = {},
}: CreateEquipmentBuilderOptions<TName, TInput, TValue, TExtra>): EquipmentBuilder<TName, TInput, TValue, TUsed, TExtra> {
  return {
    add: (name, input, extra) =>
      createEquipmentBuilder<TName, TInput, TValue, TUsed | typeof name, TExtra>({
        createValue,
        map: {
          ...map,
          [name]: createValue(name, input, extra),
        },
      }),
    done: () => map,
    doneStrict: (() => map) as EquipmentBuilder<TName, TInput, TValue, TUsed, TExtra>['doneStrict'],
  };
}

/** meta 맵 builder 기본형 */
export function createEquipmentMetaBuilder<TName extends string, TInput, TValue, TUsed extends TName = never>(
  options: CreateEquipmentBuilderOptions<TName, TInput, TValue, never>,
): EquipmentMetaBuilder<TName, TInput, TValue, TUsed> {
  return createEquipmentBuilder<TName, TInput, TValue, TUsed>(options);
}

/** stat 맵 builder 기본형 */
export function createEquipmentStatBuilder<TName extends string, TInput, TValue, TUsed extends TName = never, TExtra = never>(
  options: CreateEquipmentBuilderOptions<TName, TInput, TValue, TExtra>,
): EquipmentStatBuilder<TName, TInput, TValue, TUsed, TExtra> {
  return createEquipmentBuilder<TName, TInput, TValue, TUsed, TExtra>(options);
}
