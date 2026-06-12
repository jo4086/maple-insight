export function pickMap<const TMap extends Record<PropertyKey, unknown>, const TKeys extends readonly (keyof TMap)[]>(map: TMap, keys: TKeys): Pick<TMap, TKeys[number]> {
  return Object.fromEntries(keys.map((key) => [key, map[key]])) as Pick<TMap, TKeys[number]>;
}
