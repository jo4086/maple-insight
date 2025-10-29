// File: /src/components/Preview/lender/Csv.tsx

import Papa from 'papaparse';
import { useEffect, useMemo, useState } from 'react';

import type { PreviewDisplayMode } from '../index';

interface CsvProps {
  file: File;
  displayMode: PreviewDisplayMode;
}

export const Csv = ({ file, displayMode }: CsvProps) => {
  const [data, setData] = useState<string[][]>([]);
  const [showAllRows, setShowAllRows] = useState(false);

  useEffect(() => {
    setShowAllRows(false);
    Papa.parse<string[]>(file, {
      complete: (result) => {
        setData(result.data.filter((row) => row.some((cell) => cell !== undefined && cell !== null && String(cell).trim() !== '')));
      },
      error: (err) => {
        console.error('CSV 파싱 에러:', err);
      },
    });
  }, [file]);

  const rowsToRender = useMemo(() => {
    if (showAllRows) return data;
    return data.slice(0, Math.min(4, data.length));
  }, [data, showAllRows]);

  if (data.length === 0) return <p>CSV 파일을 불러오는 중...</p>;

  const containerHeightClass = displayMode === 'expanded' ? 'max-h-[62vh] h-full' : 'max-h-[300px]';

  return (
    <div className="flex h-full flex-col gap-3">
      <div className={`overflow-auto rounded border border-gray-300 ${containerHeightClass}`}>
        <table className="w-full border-collapse">
          <tbody>
            {rowsToRender.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-gray-200">
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    title={cell}
                    className="max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap border-r border-gray-200 px-3 py-2 text-sm text-gray-800"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length > 4 && (
        <div className="flex items-center justify-end">
          <button
            type="button"
            className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-800"
            onClick={() => setShowAllRows((prev) => !prev)}
          >
            <span>{showAllRows ? '▲ 접기' : '▼ 전체 펼치기'}</span>
            <span className="text-xs text-slate-400">{showAllRows ? `총 ${data.length}줄` : '첫 4줄 표시 중'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
