import { FiAlertCircle, FiCheckCircle, FiClock, FiDatabase, FiFileText, FiUploadCloud } from 'react-icons/fi';

import { LinkButton } from '@/components';

const summaryCards = [
  { label: '업로드 완료', value: '3', description: '원본 CSV 저장 완료', icon: FiUploadCloud },
  { label: '검증 대기', value: '2', description: '변환/검증 필요', icon: FiClock },
  { label: 'DB 반영 완료', value: '1', description: '최종 publish 완료', icon: FiCheckCircle },
  { label: '확인 필요', value: '0', description: '실패 또는 충돌 항목', icon: FiAlertCircle },
];

const recentImports = [
  { id: 'import_20260531_001', version: '1.2.425', domain: '스킬', status: 'uploaded', fileCount: 5 },
  { id: 'import_20260530_002', version: '1.2.424', domain: '장비', status: 'validated', fileCount: 3 },
  { id: 'import_20260529_003', version: '1.2.423', domain: '직업', status: 'published', fileCount: 2 },
];

const statusLabel: Record<string, string> = {
  uploaded: '업로드 완료',
  converted: '변환 완료',
  validated: '검증 완료',
  published: 'DB 반영 완료',
  failed: '실패',
};

const AdminHome = () => {
  return (
    <section className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-4 py-6">
      <header className="flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-blue-600">Admin</p>
          <h1 className="text-2xl font-bold text-gray-950">관리자 대시보드</h1>
          <p className="text-sm text-gray-600">CSV 원본 업로드부터 JSON 변환, 검증, DB 반영까지의 작업 상태를 확인합니다.</p>
        </div>

        <div className="flex gap-2">
          <LinkButton to="/admin/imports/new" size="sm">
            새 업로드
          </LinkButton>
          <LinkButton to="/" size="sm" variant="secondary">
            홈으로
          </LinkButton>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <article key={card.label} className="rounded-md border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">{card.label}</p>
                <Icon className="h-5 w-5 text-gray-400" />
              </div>
              <strong className="mt-3 block text-2xl text-gray-950">{card.value}</strong>
              <p className="mt-2 text-sm text-gray-500">{card.description}</p>
            </article>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-md border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
            <div>
              <h2 className="text-base font-bold text-gray-950">최근 업로드</h2>
              <p className="mt-1 text-sm text-gray-500">저장된 원본 CSV 작업 이력입니다.</p>
            </div>
            <LinkButton to="/admin/imports" size="sm" variant="secondary">
              전체 보기
            </LinkButton>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead className="bg-gray-50 text-xs font-medium text-gray-500">
                <tr>
                  <th className="px-5 py-3">Import ID</th>
                  <th className="px-5 py-3">버전</th>
                  <th className="px-5 py-3">데이터</th>
                  <th className="px-5 py-3">파일</th>
                  <th className="px-5 py-3">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentImports.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-sm font-medium text-gray-950">{item.id}</td>
                    <td className="px-5 py-3 text-sm text-gray-700">{item.version}</td>
                    <td className="px-5 py-3 text-sm text-gray-700">{item.domain}</td>
                    <td className="px-5 py-3 text-sm text-gray-700">{item.fileCount}개</td>
                    <td className="px-5 py-3 text-sm text-gray-700">{statusLabel[item.status]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="grid gap-4">
          <section className="rounded-md border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <FiFileText className="h-5 w-5 text-blue-600" />
              <h2 className="text-base font-bold text-gray-950">업로드 작업</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-gray-600">새 버전 CSV 원본을 저장하고 이후 변환/검증 작업으로 넘깁니다.</p>
            <LinkButton to="/admin/imports/new" className="mt-4 w-full" size="sm">
              CSV 업로드
            </LinkButton>
          </section>

          <section className="rounded-md border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <FiDatabase className="h-5 w-5 text-gray-700" />
              <h2 className="text-base font-bold text-gray-950">데이터 탐색</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-gray-600">업로드와 검증 흐름이 잡힌 뒤 JSON 초안/DB 데이터를 비교하는 화면으로 확장합니다.</p>
          </section>
        </aside>
      </div>
    </section>
  );
};

export default AdminHome;
