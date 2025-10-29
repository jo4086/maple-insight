// File: /src/components/Preview/lender/Csv2.tsx
import Papa from 'papaparse';
import { useEffect, useState } from 'react';

interface CsvProps {
  file: File;
}

export const Csv2 = ({ file }: CsvProps) => {
  const [data, setData] = useState<string[][]>([]);

  // 최소 열 개수 (기본값: 6)
  const minColumns = 10;

  useEffect(() => {
    Papa.parse<string[]>(file, {
      complete: (result) => {
        // CSV 데이터 상위 5행만 미리보기
        setData(result.data.slice(0, 5));
      },
      error: (err) => {
        console.error('CSV 파싱 에러:', err);
      },
    });
  }, [file]);

  // A, B, C... 헤더 생성 함수
  const getColumnHeader = (index: number) => {
    let result = '';
    while (index >= 0) {
      result = String.fromCharCode((index % 26) + 65) + result;
      index = Math.floor(index / 26) - 1;
    }
    return result;
  };

  // 실제 열 개수와 최소 열 개수 중 큰 값 사용
  const totalColumns = Math.max(data[0]?.length || 0, minColumns);

  // 헤더 배열 생성
  const columnHeaders = Array.from({ length: totalColumns }, (_, i) => getColumnHeader(i));

  if (!data.length) return <p>CSV 파일을 불러오는 중...</p>;

  return (
    <div className="overflow-auto max-h-[300px] border border-gray-300 rounded">
      <table className="border-collapse w-full">
        <thead>
          <tr>
            {/* 왼쪽 상단 고정 셀 */}
            <th className="sticky top-0 left-0 bg-gray-100 border-b border-r border-gray-300 w-[50px] z-30"></th>
            {columnHeaders.map((header, index) => (
              <th key={index} className="sticky top-0 bg-gray-100 border-b border-r border-gray-300 px-3 py-2 text-sm font-medium text-center z-20">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => {
            // 부족한 열만큼 공백 셀 추가
            const paddedRow = [...row, ...Array(totalColumns - row.length).fill('')];

            return (
              <tr key={rowIndex} className="border-b border-gray-200">
                {/* 행 번호 */}
                <td className="sticky left-0 bg-gray-100 border-r border-gray-300 w-[50px] text-center text-sm px-2 py-1 z-10">{rowIndex + 1}</td>
                {paddedRow.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    title={cell}
                    className="px-3 py-2 border-r border-gray-200 text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]"
                    style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '200px',
                    }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
