// 위치: /src/components/FileBox/index.tsx
import React, { useRef, useState } from 'react';

import { Checkbox } from '@/components/base';
import { formatFileSize } from '@/utils/formatFileSize';

interface FileBoxProps {
  onFileClick?: (file: File, index: number) => void; // 파일 클릭 시 상위에 알림
  onFilesChange?: (files: File[]) => void; // 전체 파일 목록 변경 시 알림
}

export const FileBox = ({ onFileClick, onFilesChange }: FileBoxProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const updateFiles = (newFiles: File[]) => {
    setFiles(newFiles);
    onFilesChange?.(newFiles);
  };

  /** 파일 선택 */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = [...files, ...Array.from(e.target.files)];
    updateFiles(newFiles);
    e.target.value = '';
  };

  /** 파일 클릭 시 상위에 전달 */
  const handleFileClick = (file: File, index: number) => {
    onFileClick?.(file, index);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const newFiles: File[] = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  /** 파일 삭제 */
  const handleRemove = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    updateFiles(newFiles);
  };

  /** 선택된 파일 삭제 */
  const handleRemoveSelected = () => {
    const newFiles = files.filter((_, idx) => !selectedFiles.includes(idx));
    updateFiles(newFiles);
    setSelectedFiles([]);
  };

  const isAllSelected = files.length > 0 && selectedFiles.length === files.length;

  return (
    <div>
      {/* 드래그 앤 드랍 or 클릭 업로드 */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-gray-400 border-dotted p-10 text-center cursor-pointer mb-5"
      >
        파일 드래그 앤 드랍 또는 클릭
        <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileChange} />
      </div>

      {/* 파일 리스트 */}
      <div className="p-2.5 rounded-[4px]">
        <div className="grid grid-cols-[32px_1fr_100px_40px] bg-amber-100 px-3 py-2 text-sm">
          <Checkbox checked={isAllSelected} onChange={(checked) => setSelectedFiles(checked ? files.map((_, idx) => idx) : [])} />
          <span>파일명</span>
          <span className="text-right">용량</span>
          <span className="ml-2.5">삭제</span>
        </div>

        {files.map((file, index) => (
          <div
            key={index}
            onClick={() => handleFileClick(file, index)} // 클릭 시 상위로 전달
            className="grid grid-cols-[32px_1fr_100px_40px] px-3 py-2 hover:bg-gray-50 items-center"
          >
            <Checkbox
              checked={selectedFiles.includes(index)}
              onChange={(checked) => setSelectedFiles((prev) => (checked ? [...prev, index] : prev.filter((i) => i !== index)))}
              className="cursor-pointer w-fit h-fit"
            />
            <div className="truncate">{file.name}</div>
            <div className="text-right">{formatFileSize(file.size)}</div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(index);
              }}
              className="text-red-500 ml-2.5 cursor-pointer rounded-sm border-1 border-[#00000033] aspect-square"
            >
              ❌
            </button>
          </div>
        ))}
      </div>

      {/* 선택 삭제 버튼 */}
      <div className="mt-3 text-right">
        <button onClick={handleRemoveSelected} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
          선택 삭제
        </button>
      </div>
    </div>
  );
};
