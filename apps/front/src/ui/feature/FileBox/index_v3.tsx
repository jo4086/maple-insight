import React, { useRef, useState } from 'react';

import { Preview } from '../Preview';

import { useUploadFiles } from '@/api/mutations';
import { Checkbox } from '@/components/base';
import { formatFileSize } from '@/utils/formatFileSize';

// NOTE: [2025-09-16]: 파일 첨부 서버 연결 작업 => 라즈베리파이쪽과 같이 해결하기

export function FileBox() {
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  const [selectedPreviewFile, setSelectedPreviewFile] = useState<File | null>(null);
  const fileInputRef = useRef(null);
  const [progress, setProgress] = useState<number>(0);

  const { mutate, isPending } = useUploadFiles();

  /* ──────────────────── TAG: change ──────────────────── */
  /*
   * 파일의 실제 수정 로직
   * - handleFileChange: 파일의 수정 로직 핸들러
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...newFiles]);
    e.target.value = ''; // 같은 파일 다시 선택 가능
  };

  /* ──────────────────── TAG: select ──────────────────── */
  /*
   * 파일 선택 기능을 담당하는 핸들러 모음
   * - handleSelectOne: 특정 파일 선택/해제
   * - handleSelectAll: 모든 파일 선택/해제
   */
  const handleSelectOne = (index: number, checked: boolean) => {
    if (checked) {
      setSelectedFiles((prev) => [...prev, index]);
    } else {
      setSelectedFiles((prev) => prev.filter((i) => i !== index));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedFiles(files.map((_, idx) => idx));
    } else {
      setSelectedFiles([]);
    }
  };

  /* ──────────────────── TAG: modify ──────────────────── */
  /*
   * 파일의 드래그 앤 드랍 핸들러 모음
   * - handleDragOver: 파일의 드래그 기능
   * - handleDrop: 파일의 드랍 기능
   */
  const handleDragOver = (e: React.DragEvent<HTMLInputElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLInputElement>) => {
    e.preventDefault();
    const newFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...newFiles]);
  };

  //  TAG: Delete - 단일 삭제
  const handleRemove = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  //  TAG: Delete - 선택항목 전체 삭제
  const handleRemoveSelected = () => {
    setFiles(files.filter((_, idx) => !selectedFiles.includes(idx)));
    setSelectedFiles([]);
  };

  const _handleRemoveOne = (index: number) => {
    setFiles(files.filter((_, idx) => idx !== index));
    setSelectedFiles(selectedFiles.filter((i) => i !== index));
  };

  //  TAG: upload - 최종 업로드
  const handleUpload = async () => {
    if (files.length === 0 || isPending) return;

    mutate(
      { files, onProgress: setProgress },
      {
        onSuccess: (res) => {
          console.log('업로드 성공', res);
          setFiles([]);
          setProgress(0);
        },
        onError: (err) => {
          console.error('업로드 실패', err);
          // toast 추가
        },
      },
    );
  };

  const isAllSelected = files.length > 0 && selectedFiles.length === files.length;

  return (
    <div>
      {/* 드래그 앤 드랍 영역 */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-gray-400 border-dotted p-10 text-center cursor-pointer mb-5"
      >
        드래그 앤 드랍 또는 클릭하여 파일 선택
        <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileChange} />
      </div>

      {/* 선택된 파일 리스트 */}
      <div className="p-2.5 rounded-[4px]">
        {/* 헤더 */}
        <div className="grid grid-cols-[32px_32px_1fr_100px_40px] items-center gap-2 bg-amber-100 px-3 py-2 text-black text-sm">
          <Checkbox checked={isAllSelected} onChange={(checked) => handleSelectAll(checked)} />
          <span>#</span>
          <span className="truncate">파일명</span>
          <span className="text-right">용량</span>
          <span className="ml-2.5">삭제</span>
        </div>

        {files.map((file, index) => (
          <div
            key={index}
            className={`relative grid grid-cols-[32px_32px_1fr_100px_40px] items-center gap-2  rounded px-3 py-2 cursor-pointer ${selectedPreviewFile === file ? 'bg-gray-100' : ''}`}
            onClick={() => setSelectedPreviewFile(file)}
          >
            <Checkbox checked={selectedFiles.includes(index)} onChange={(checked) => handleSelectOne(index, checked)} />

            {/* 번호 */}
            <span className="text-gray-700">{index + 1}</span>

            {/* 파일명 */}
            <div className="truncate">{file.name}</div>

            {/* 용량 */}
            <div className="text-right text-sm text-gray-600">{formatFileSize(file.size)}</div>

            {/* 삭제 버튼 */}

            <button
              onClick={() => handleRemove(index)}
              className="ml-2.5 text-red-500 text-sm font-bold border border-gray-300 flex  items-center justify-center cursor-pointer rounded-sm w-8 h-8"
            >
              ❌
            </button>
            <div className="absolute left-0 w-full h-[1px] bottom-0 bg-gray-400"></div>
          </div>
        ))}
      </div>

      {/* 진행률 표시 (프로스래스) */}
      {isPending && <div className="mt-2.5">업로드 중... {progress}%</div>}

      {/* 등록하기 버튼 */}
      <div className="flex justify-between px-5 items-center">
        {/* 선택 삭제 버튼 */}
        <button onClick={handleRemoveSelected} className="mt-3 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
          선택한 파일 삭제
        </button>

        <button onClick={handleUpload} disabled={files.length === 0 || isPending} className="w-40 my-1 px-4 py-2 rounded border-gray-300 border-1 hover:bg-gray-50">
          업로드
        </button>
      </div>

      {/* 미리보기 영역 */}
      <div className="flex-1 border border-gray-200 p-4 rounded">
        <h3 className="font-bold mb-2">미리보기</h3>
        {selectedPreviewFile ? <Preview file={selectedPreviewFile} /> : <p className="text-gray-500">선택된 파일이 없습니다.</p>}
      </div>
    </div>
  );
}
