import { FiExternalLink, FiPlus } from 'react-icons/fi';

import { LinkButton } from '@/components';

const imports = [
  {
    id: 'import_20260531_001',
    version: '1.2.425',
    domain: '스킬',
    status: 'uploaded',
    createdAt: '2026-05-31 18:20',
    files: ['job.csv', 'skill.csv', 'skill_common.csv', 'skill_level.csv', 'skill_h.csv'],
  },
  {
    id: 'import_20260530_002',
    version: '1.2.424',
    domain: '장비',
    status: 'validated',
    createdAt: '2026-05-30 21:10',
    files: ['weapon.csv', 'armor.csv', 'accessory.csv'],
  },
  {
    id: 'import_20260529_003',
    version: '1.2.423',
    domain: '직업',
    status: 'published',
    createdAt: '2026-05-29 10:05',
    files: ['job.csv', 'job_meta.csv'],
  },
];

const statusLabel: Record<string, string> = {
  uploaded: '업로드 완료',
  converted: '변환 완료',
  validated: '검증 완료',
  published: 'DB 반영 완료',
  failed: '실패',
};

const AdminImports = () => {
  return (
    <section className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-4 py-6">
      <header className="flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">Imports</p>
          <h1 className="mt-2 text-2xl font-bold text-gray-950">업로드 이력</h1>
          <p className="mt-2 text-sm text-gray-600">버전별 CSV 원본 저장 작업을 확인합니다.</p>
        </div>

        <div className="flex gap-2">
          <LinkButton to="/admin/imports/new" size="sm">
            <FiPlus className="mr-2 h-4 w-4" />
            새 업로드
          </LinkButton>
          <LinkButton to="/admin" size="sm" variant="secondary">
            대시보드
          </LinkButton>
        </div>
      </header>

      <section className="rounded-md border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left">
            <thead className="bg-gray-50 text-xs font-medium text-gray-500">
              <tr>
                <th className="px-5 py-3">Import ID</th>
                <th className="px-5 py-3">버전</th>
                <th className="px-5 py-3">데이터</th>
                <th className="px-5 py-3">파일</th>
                <th className="px-5 py-3">상태</th>
                <th className="px-5 py-3">생성일</th>
                <th className="px-5 py-3">상세</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {imports.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-sm font-medium text-gray-950">{item.id}</td>
                  <td className="px-5 py-3 text-sm text-gray-700">{item.version}</td>
                  <td className="px-5 py-3 text-sm text-gray-700">{item.domain}</td>
                  <td className="px-5 py-3 text-sm text-gray-700">{item.files.length}개</td>
                  <td className="px-5 py-3 text-sm text-gray-700">{statusLabel[item.status]}</td>
                  <td className="px-5 py-3 text-sm text-gray-500">{item.createdAt}</td>
                  <td className="px-5 py-3">
                    <LinkButton to={`/admin/imports/${item.id}`} size="xs" variant="secondary">
                      <FiExternalLink className="mr-1 h-3 w-3" />
                      열기
                    </LinkButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
};

export default AdminImports;
