/** INFO:
 *  공통 배치 실행 옵션
 *  - batchSize만큼 잘라 순차 배치 실행한다.
 *  - maxFetchCount로 전체 처리 상한을 제한한다.
 *  - batchDelayMs를 주면 배치 사이에 대기한다.
 **/
export type BatchProcessOptions = {
  batchSize: number;
  maxFetchCount: number;
  batchDelayMs?: number;
};

// INFO: 루프 사이 간격을 두기 위한 비동기 sleep 함수다.
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// INFO: 최대 처리 건수까지만 잘라서 배치 단위 배열로 나눈다.
export function createBatches<T>(items: T[], options: BatchProcessOptions) {
  const limitedItems = items.slice(0, options.maxFetchCount);
  const batches: T[][] = [];

  for (let index = 0; index < limitedItems.length; index += options.batchSize) {
    batches.push(limitedItems.slice(index, index + options.batchSize));
  }

  return batches;
}

/** INFO:
 * 공통 배치 실행기
 * - 입력 목록을 최대 조회 건수만큼 제한한다.
 * - batchSize 단위로 worker를 순차 실행한다.
 * - 각 배치 결과를 평탄화해서 반환한다.
 **/
export async function processInBatches<T, R>(items: T[], options: BatchProcessOptions, worker: (batch: T[], batchIndex: number) => Promise<R[]>) {
  const batches = createBatches(items, options);
  const results: R[] = [];

  for (const [batchIndex, batch] of batches.entries()) {
    const batchResults = await worker(batch, batchIndex);
    results.push(...batchResults);

    if (options.batchDelayMs && batchIndex < batches.length - 1) {
      await delay(options.batchDelayMs);
    }
  }

  return results;
}
