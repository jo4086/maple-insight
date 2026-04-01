export const CharacterLoadingOverlay = () => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
      <div className="flex items-center gap-3 rounded-full border border-white/20 bg-gray-950/80 px-5 py-3 shadow-lg">
        <span className="inline-block h-6 w-6 rounded-full border-2 border-white/25 border-t-white animate-spin" />
        <span className="text-sm font-medium text-white">캐릭터 정보를 불러오는 중...</span>
      </div>
    </div>
  );
};
