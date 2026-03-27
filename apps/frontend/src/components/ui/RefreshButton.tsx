type RefreshButtonProps = {
  onRefresh: () => void;
  disabled?: boolean;
  isRefreshing?: boolean;
};

export const RefreshButton = ({ onRefresh, disabled, isRefreshing }: RefreshButtonProps) => {
  return (
    <button
      type="button"
      onClick={onRefresh}
      disabled={disabled || isRefreshing}
      className="text-white text-[12px] flex w-20 h-10 justify-center items-center px-1 py-1
  border rounded-md border-gray-300 cursor-pointer disabled:cursor-not-allowed disabled:border outline-none"
    >
      {isRefreshing ? (
        <>
          <span
            className="inline-block h-4 w-4 rounded-full border-2 border-white/40 border-t-white
  animate-spin"
          />
        </>
      ) : (
        <span className="">새로고침</span>
      )}
    </button>
  );
};
