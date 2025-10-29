// File: components/shared/UploadModalProvider.tsx

import { createContext, useCallback, useContext, useMemo, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';

import { Modal } from '@/ui/base';
import { Preview } from '@/components/feature/Preview';

type FileType = 'csv' | 'json';
type Mode = 'test' | 'production' | '';

interface UploadItem {
  id: string;
  file: File;
  fileType: FileType;
}

interface UploadData {
  files: UploadItem[];
  version: string;
  type: Mode;
}

interface UploadModalContextValue {
  openUploadModal: () => void;
  closeUploadModal: () => void;
}

const UploadModalContext = createContext<UploadModalContextValue | null>(null);

const createInitialData = (): UploadData => {
  return {
    files: [],
    version: '',
    type: '',
  };
};

const buildUploadItem = (file: File, fileType: FileType): UploadItem => {
  const uniqueKey = `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`;
  return {
    id: uniqueKey,
    file,
    fileType,
  };
};

export const UploadModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null);
  const [data, setData] = useState<UploadData>(createInitialData);
  const [error, setError] = useState<string | null>(null);

  const resetState = useCallback(() => {
    setData(createInitialData());
    setError(null);
    setIsPreviewOpen(false);
    setActivePreviewId(null);
  }, []);

  const openUploadModal = useCallback(() => {
    resetState();
    setIsOpen(true);
  }, [resetState]);

  const closeUploadModal = useCallback(() => {
    setIsOpen(false);
    resetState();
  }, [resetState]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    if (selectedFiles.length === 0) {
      return;
    }

    const invalidFiles: string[] = [];
    const validItems: UploadItem[] = [];

    selectedFiles.forEach((file) => {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension !== 'csv' && extension !== 'json') {
        invalidFiles.push(file.name);
        return;
      }

      const fileType = extension as FileType;

      validItems.push(buildUploadItem(file, fileType));
    });

    if (invalidFiles.length > 0) {
      setError(`지원하지 않는 파일 형식입니다: ${invalidFiles.join(', ')}`);
    } else {
      setError(null);
    }

    if (validItems.length > 0) {
      setData((prev) => {
        const existingIds = new Set(prev.files.map((item) => `${item.file.name}_${item.file.size}`));
        const merged = [
          ...prev.files,
          ...validItems.filter((item) => !existingIds.has(`${item.file.name}_${item.file.size}`)),
        ];
        return {
          ...prev,
          files: merged,
        };
      });
      if (!activePreviewId) {
        setActivePreviewId(validItems[0]?.id ?? null);
      }
    }

    event.target.value = '';
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (data.files.length === 0) {
      alert('파일을 업로드해주세요.');
      return;
    }
    if (data.type === '') {
      alert('모드를 선택해주세요.');
      return;
    }

    console.log('서버 전송 데이터:', data);
    closeUploadModal();
  };

  const handleRemoveFile = (id: string) => {
    setData((prev) => {
      const filtered = prev.files.filter((item) => item.id !== id);
      setActivePreviewId((current) => {
        if (current === id) {
          return filtered[0]?.id ?? null;
        }
        return current;
      });
      if (filtered.length === 0) {
        setIsPreviewOpen(false);
      }
      return {
        ...prev,
        files: filtered,
      };
    });
    setError(null);
  };

  const handlePreviewOpen = () => {
    if (data.files.length === 0) {
      alert('미리볼 파일이 없습니다.');
      return;
    }
    setIsPreviewOpen(true);
    setActivePreviewId((current) => current ?? data.files[0]?.id ?? null);
  };

  const activePreviewFile = useMemo(() => data.files.find((item) => item.id === activePreviewId)?.file ?? null, [activePreviewId, data.files]);

  const contextValue = useMemo(
    () => ({
      openUploadModal,
      closeUploadModal,
    }),
    [openUploadModal, closeUploadModal],
  );

  return (
    <UploadModalContext.Provider value={contextValue}>
      {children}
      <Modal open={isOpen} onClose={closeUploadModal} title="데이터 업로드" closeOnEsc={false} closeOnBackdrop={false} ariaDescribedById="upload-modal-description">
        <form onSubmit={handleSubmit} className="space-y-6" id="upload-modal-description">
          <div className="space-y-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">파일 업로드</label>
            <input className="w-full rounded border border-gray-300 p-2" type="file" multiple accept=".csv,.json" onChange={handleFileChange} />
            <p className="text-xs text-gray-500">csv 또는 json 파일을 하나 이상 선택할 수 있습니다.</p>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {data.files.length > 0 && (
            <div className="rounded border border-gray-200">
              <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700">
                <span>선택된 파일 ({data.files.length})</span>
                <button
                  type="button"
                  className="text-xs text-slate-600 underline"
                  onClick={() => {
                    setData((prev) => ({ ...prev, files: [] }));
                    setIsPreviewOpen(false);
                    setActivePreviewId(null);
                  }}
                >
                  모두 제거
                </button>
              </div>
              <ul className="max-h-56 space-y-1 overflow-auto px-3 py-2 text-sm">
                {data.files.map((item) => (
                  <li key={item.id} className="flex items-center justify-between rounded px-2 py-1 hover:bg-gray-100">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-800">{item.file.name}</span>
                      <span className="text-xs text-gray-500">{item.fileType.toUpperCase()}</span>
                    </div>
                    <button type="button" className="text-xs text-red-500" onClick={() => handleRemoveFile(item.id)}>
                      제거
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">버전</label>
            <input className="w-full rounded border border-gray-300 p-2" type="text" value={data.version} onChange={(event) => setData((prev) => ({ ...prev, version: event.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">모드</label>
            <select className="w-full rounded border border-gray-300 p-2" value={data.type} onChange={(event) => setData((prev) => ({ ...prev, type: event.target.value as Mode }))}>
              <option value="">-- 선택하세요 --</option>
              <option value="test">테스트</option>
              <option value="production">프로덕션</option>
            </select>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button type="button" className="rounded border border-gray-300 px-4 py-2 text-sm disabled:opacity-50" disabled={data.files.length === 0} onClick={handlePreviewOpen}>
              미리보기
            </button>
            <button type="button" className="rounded border border-gray-300 px-4 py-2 text-sm" onClick={closeUploadModal}>
              취소
            </button>
            <button type="submit" className="rounded bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-600">
              제출
            </button>
          </div>
        </form>
      </Modal>
      <Modal
        open={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="업로드 파일 미리보기"
        contentClassName="w-[min(960px,95vw)] max-h-[90vh]"
        bodyClassName="flex h-full flex-col md:h-[70vh]"
      >
        <div className="flex flex-1 flex-col gap-4 md:h-full md:flex-row">
          <aside className="max-h-[50vh] w-full overflow-auto rounded border border-gray-200 md:h-full md:w-64">
            <ul>
              {data.files.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm ${activePreviewId === item.id ? 'bg-slate-100 font-semibold text-slate-900' : 'text-gray-700 hover:bg-slate-50'}`}
                    onClick={() => setActivePreviewId(item.id)}
                  >
                    <span className="truncate">{item.file.name}</span>
                    <span className="ml-2 text-xs uppercase text-gray-500">{item.fileType}</span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>
          <section className="flex-1 overflow-hidden rounded border border-gray-200 p-4 md:h-full">
            {activePreviewFile ? <Preview file={activePreviewFile} displayMode="expanded" /> : <p className="text-sm text-gray-500">선택된 파일이 없습니다.</p>}
          </section>
        </div>
      </Modal>
    </UploadModalContext.Provider>
  );
};

export const useUploadModal = () => {
  const context = useContext(UploadModalContext);
  if (!context) {
    throw new Error('useUploadModal은 UploadModalProvider 내부에서만 사용할 수 있습니다.');
  }

  return context;
};
