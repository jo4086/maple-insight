export default function CountButtons({ increment, reset, decrement }: { increment: () => void; reset: () => void; decrement: () => void }) {
  console.log('카운터 버튼 리렌더링');
  return (
    <>
      <button onClick={increment}> + </button>
      <button onClick={reset}> 초기화 </button>
      <button onClick={decrement}> - </button>
    </>
  );
}
