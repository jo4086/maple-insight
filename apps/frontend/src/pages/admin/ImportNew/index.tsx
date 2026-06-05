import { useState, type ChangeEvent } from 'react';
import { FiFile, FiUploadCloud } from 'react-icons/fi';

import { LinkButton } from '@/components';

const requiredSkillFiles = ['job.csv', 'skill.csv', 'skill_common.csv', 'skill_level.csv', 'skill_h.csv'];

const AdminImportNew = () => {
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFiles(Array.from(event.currentTarget.files ?? []));
  };

  return (
    <section className="mx-auto flex w-full max-w-[960px] flex-col gap-6 px-4 py-6">
      <header className="flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">New Import</p>
          <h1 className="mt-2 text-2xl font-bold text-gray-950">새 CSV 업로드</h1>
          <p className="mt-2 text-sm text-gray-600">새 버전의 원본 CSV를 백엔드 저장소에 먼저 보관합니다.</p>
        </div>

        <LinkButton to="/admin/imports" size="sm" variant="secondary">
          업로드 이력
        </LinkButton>
      </header>

      <form className="grid gap-5 rounded-md border border-gray-200 bg-white p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-gray-700">데이터 버전</span>
            <input className="h-10 rounded-md border border-gray-200 px-3 text-sm outline-none focus:border-blue-500" placeholder="예: 1.2.425" />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-gray-700">데이터 종류</span>
            <select className="h-10 rounded-md border border-gray-200 px-3 text-sm outline-none focus:border-blue-500" defaultValue="skill">
              <option value="skill">스킬</option>
              <option value="equipment">장비 아이템</option>
              <option value="job">직업</option>
            </select>
          </label>
        </div>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-gray-700">메모</span>
          <textarea className="min-h-24 rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500" placeholder="선택 사항" />
        </label>

        <div className="grid gap-3">
          <p className="text-sm font-medium text-gray-700">CSV 파일</p>

          <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center transition-colors hover:bg-gray-100">
            <FiUploadCloud className="h-8 w-8 text-gray-400" />
            <span className="mt-3 text-sm font-medium text-gray-800">CSV 파일 선택</span>
            <span className="mt-1 text-xs text-gray-500">여러 파일을 한 번에 선택할 수 있습니다.</span>
            <input className="sr-only" type="file" accept=".csv,text/csv" multiple onChange={handleFileChange} />
          </label>

          <div className="rounded-md border border-gray-200">
            <div className="border-b border-gray-200 px-4 py-3">
              <p className="text-sm font-medium text-gray-800">스킬 업로드 기본 파일</p>
            </div>
            <div className="grid gap-2 p-4 sm:grid-cols-2">
              {requiredSkillFiles.map((fileName) => (
                <div key={fileName} className="flex items-center gap-2 text-sm text-gray-600">
                  <FiFile className="h-4 w-4 text-gray-400" />
                  {fileName}
                </div>
              ))}
            </div>
          </div>

          {files.length > 0 && (
            <div className="rounded-md border border-gray-200">
              <div className="border-b border-gray-200 px-4 py-3">
                <p className="text-sm font-medium text-gray-800">선택된 파일</p>
              </div>
              <div className="grid gap-2 p-4">
                {files.map((file) => (
                  <div key={`${file.name}-${file.size}`} className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm">
                    <span className="text-gray-800">{file.name}</span>
                    <span className="text-gray-500">{Math.ceil(file.size / 1024).toLocaleString()} KB</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-200 pt-5">
          <LinkButton to="/admin/imports" variant="secondary">
            취소
          </LinkButton>
          <button className="inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-700" type="button">
            업로드 저장
          </button>
        </div>
      </form>
    </section>
  );
};

export default AdminImportNew;
