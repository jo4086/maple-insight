interface RefreshButtonProps {
  onRefresh: () => void;
  disabled?: boolean;
  isRefreshing?: boolean;
}

export function RefreshButton({ onRefresh, disabled = false, isRefreshing = false }: RefreshButtonProps) {
  return (
    <button
      type="button"
      onClick={onRefresh}
      disabled={disabled || isRefreshing}
      className="px-3 py-1.5 border rounded-md border-gray-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isRefreshing ? '새로고침 중...' : '새로고침'}
    </button>
  );
}
