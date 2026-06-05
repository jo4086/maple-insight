import { useParams } from 'react-router-dom';
import { FiCheckCircle, FiDatabase, FiFileText, FiRefreshCw } from 'react-icons/fi';

import { LinkButton } from '@/components';

const files = ['job.csv', 'skill.csv', 'skill_common.csv', 'skill_level.csv', 'skill_h.csv'];

const steps = [
  { label: '원본 업로드', status: 'done', icon: FiFileText },
  { label: 'JSON 변환', status: 'ready', icon: FiRefreshCw },
  { label: '검증', status: 'waiting', icon: FiCheckCircle },
  { label: 'DB 반영', status: 'waiting', icon: FiDatabase },
];

const AdminImportDetail = () => {
  const { importId } = useParams();

  return (
    <section className="mx-auto flex w-full max-w-[1120px] flex-col gap-6 px-4 py-6">
      <header className="flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">Import Detail</p>
          <h1 className="mt-2 text-2xl font-bold text-gray-950">{importId}</h1>
          <p className="mt-2 text-sm text-gray-600">업로드된 원본 CSV와 이후 처리 단계를 확인합니다.</p>
        </div>

        <LinkButton to="/admin/imports" size="sm" variant="secondary">
          목록으로
        </LinkButton>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        {steps.map((step) => {
          const Icon = step.icon;

          return (
            <article key={step.label} className="rounded-md border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">{step.label}</p>
                <Icon className="h-5 w-5 text-gray-400" />
              </div>
              <p className="mt-3 text-sm text-gray-500">{step.status === 'done' ? '완료' : step.status === 'ready' ? '실행 가능' : '대기'}</p>
            </article>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-md border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="text-base font-bold text-gray-950">원본 파일</h2>
            <p className="mt-1 text-sm text-gray-500">백엔드 저장소에 보관된 CSV 목록입니다.</p>
          </div>

          <div className="divide-y divide-gray-100">
            {files.map((fileName) => (
              <div key={fileName} className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <FiFileText className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">{fileName}</span>
                </div>
                <span className="text-sm text-gray-500">저장 완료</span>
              </div>
            ))}
          </div>
        </section>

        <aside className="grid gap-4">
          <section className="rounded-md border border-gray-200 bg-white p-5">
            <h2 className="text-base font-bold text-gray-950">작업 실행</h2>
            <div className="mt-4 grid gap-2">
              <button className="h-10 rounded-md bg-gray-900 px-4 text-sm font-medium text-white hover:bg-gray-800" type="button">
                JSON 변환
              </button>
              <button className="h-10 rounded-md border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50" type="button">
                검증 실행
              </button>
              <button className="h-10 rounded-md border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50" type="button">
                DB 반영
              </button>
            </div>
          </section>

          <section className="rounded-md border border-gray-200 bg-white p-5">
            <h2 className="text-base font-bold text-gray-950">메타 정보</h2>
            <dl className="mt-4 grid gap-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-gray-500">버전</dt>
                <dd className="font-medium text-gray-900">1.2.425</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-gray-500">데이터</dt>
                <dd className="font-medium text-gray-900">스킬</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-gray-500">상태</dt>
                <dd className="font-medium text-gray-900">업로드 완료</dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </section>
  );
};

export default AdminImportDetail;
