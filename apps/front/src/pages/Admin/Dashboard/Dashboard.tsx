// File: pages/Admin/Dashboard/Dashboard.tsx

import { useUploadModal } from '@/components/shared/UploadModalProvider';

function DashBoard() {
  const { openUploadModal } = useUploadModal();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-gray-900">관리자 대시보드</h1>
      <p className="text-gray-600">오른쪽 하단의 FAB에서 업로드를 선택하거나 아래 버튼을 눌러 파일 업로드 모달을 열 수 있습니다.</p>
      <button type="button" className="rounded bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-600" onClick={openUploadModal}>
        업로드 모달 열기
      </button>
    </div>
  );
}

export default DashBoard;
