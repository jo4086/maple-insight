import { useState } from 'react';
import { Count } from '@/components/buttons';

export function User() {
  const [count, setCount] = useState(0);
  const increment = () => setCount((count) => count + 1);
  const reset = () => setCount(0);
  const decrement = () => setCount((count) => count - 1);

  return (
    <>
      <div> User Page</div>
      <Count increment={increment} reset={reset} decrement={decrement} count={count} />
    </>
  );
}
