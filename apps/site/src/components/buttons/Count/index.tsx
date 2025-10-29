// export { default as Count } from './Count';

import CountDisplay from './CountDisplay';
import CountButtons from './CountButtons';

interface CountProps {
  increment: () => void;
  reset: () => void;
  decrement: () => void;
  count: number;
}
export function Count({ increment, reset, decrement, count }: CountProps) {
  return (
    <>
      <CountDisplay count={count} />
      <CountButtons increment={increment} reset={reset} decrement={decrement} />
    </>
  );
}

export default Count;
