export type ProgressBarOptions = {
  width?: number;
  filledChar?: string;
  emptyChar?: string;
};

const DEFAULT_PROGRESS_BAR_WIDTH = 20;

export function formatProgressBar(current: number, total: number, options: ProgressBarOptions = {}) {
  const width = options.width ?? DEFAULT_PROGRESS_BAR_WIDTH;
  const filledChar = options.filledChar ?? '#';
  const emptyChar = options.emptyChar ?? '.';
  const safeTotal = Math.max(total, 1);
  const ratio = Math.min(Math.max(current / safeTotal, 0), 1);
  const filled = Math.round(ratio * width);
  const empty = width - filled;
  const percent = Math.floor(ratio * 100);

  return `[${filledChar.repeat(filled)}${emptyChar.repeat(empty)}] (${percent}%)`;
}

export function writeProgressLine(line: string) {
  process.stdout.write(`\r\x1b[K${line}`);
}

export function finishProgressLine() {
  process.stdout.write('\n');
}
