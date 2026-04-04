export type DeepNullable<T> = T extends readonly (infer U)[] ? DeepNullable<U>[] | null : T extends object ? { [K in keyof T]: DeepNullable<T[K]> | null } : T | null;
