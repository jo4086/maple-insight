export type JobTier = 1 | 2 | 3 | 4 | 5 | 6

export interface JobBranch<TSecond extends string, TThird extends string, TFourth extends string> {
  second: TSecond;
  third: TThird
  fourth: TFourth;
}
