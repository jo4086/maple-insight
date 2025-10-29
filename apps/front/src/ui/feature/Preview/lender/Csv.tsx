// File: /src/components/Preview/lender/Csv.tsx
import Papa from 'papaparse';
import { useEffect, useState } from 'react';

interface CsvProps {
  file: File;
}

export const Csv = ({ file }: CsvProps) => {
  const [data, setData] = useState<string[][]>([]);

  useEffect(() => {
    Papa.parse<string[]>(file, {
      complete: (result) => {
        setData(result.data.slice(0, 5));
        // setData(result.data.slice(0, 5))
      },
      error: (err) => {
        console.error('CSV 파싱 에러:', err);
      },
    });
  }, [file]);

  const getColumnHeader = (index) => {
    let result = '';
    while (index >= 0) {
      result = String.fromCharCode((index % 26) + 65) + result;
      index = Math.floor(index / 26) - 1;
    }
    return result;
  };

  const columnHeaders = Array.from({ length: data[0]?.length || 0 }, (_, i) => getColumnHeader(i));

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
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-gray-200">
              {/* 행 번호 */}
              <td className="sticky left-0 bg-gray-100 border-r border-gray-300 w-[50px] text-center text-sm px-2 py-1 z-10">{rowIndex + 1}</td>
              {row.map((cell, cellIndex) => (
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
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="overflow-auto max-h-[300px] border border-gray-300 rounded">
      <table className="border-collapse w-full">
        <thead>
          <tr>
            {/* 왼쪽 상단 빈 칸 */}
            <th className="sticky top-0 left-0 bg-gray-100 border-b border-gray-300 w-[50px] z-20"></th>
            {columnHeaders.map((header, index) => (
              <th key={index} className="sticky top-0 bg-gray-100 border-b border-r border-gray-300 px-3 py-2 text-sm font-medium z-10 text-center">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-gray-200">
              {/* 행 번호 */}
              <td className="sticky left-0 bg-gray-100 border-r border-gray-300 w-[50px] text-center text-sm px-2 py-1 z-10">{rowIndex + 1}</td>
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  title={cell} // 마우스 오버 시 전체 내용 표시
                  className="px-3 py-2 border-r border-gray-200 text-sm 
                             whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]"
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
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="overflow-auto max-h-[300px] border border-gray-300 rounded">
      <table className="border-collapse w-full">
        <thead>
          <tr>
            {/* 첫 번째 빈 칸 (왼쪽 상단) */}
            <th className="sticky top-0 left-0 bg-gray-100 border-b border-r border-gray-300 px-2 py-1"></th>
            {columnHeaders.map((header, index) => (
              <th key={index} className="sticky top-0 bg-gray-100 border-b border-gray-300 px-3 py-2 text-sm font-medium">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-gray-200">
              {/* 행 번호 표시 */}
              <td className="sticky left-0 bg-gray-100 border-r border-gray-300 px-2 py-1 text-sm text-center">{rowIndex + 1}</td>
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  title={cell} // 마우스 오버 시 전체 내용 표시
                  className="px-3 py-2 border-r border-gray-200 text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]"
                  style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '200px', // 셀 최대 너비 제한
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>

        {/* <tbody> */}
        {/*   {data.map((row, i) => ( */}
        {/*     <tr key={i} className="border-b border-gray-200"> */}
        {/*       {row.map((cell, j) => ( */}
        {/*         <td */}
        {/*           key={j} */}
        {/*           title={cell} // 마우스 오버 시 전체 내용 표시 */}
        {/*           className="px-3 py-2 border-r border-gray-200 text-sm  */}
        {/*                      whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]" */}
        {/*           style={{ */}
        {/*             whiteSpace: 'nowrap', */}
        {/*             overflow: 'hidden', */}
        {/*             textOverflow: 'ellipsis', */}
        {/*             maxWidth: '200px', // 셀 최대 너비 제한 */}
        {/*           }} */}
        {/*         > */}
        {/*           {cell} */}
        {/*         </td> */}
        {/*       ))} */}
        {/*     </tr> */}
        {/*   ))} */}
        {/* </tbody> */}
      </table>
    </div>
  );

  return (
    <table className="border-1" border={1}>
      <tbody>
        {data.map((row, i) => (
          <tr className="border-1" key={i}>
            {row.map((cell, j) => (
              <td
                key={j}
                title={cell} // 마우스 오버 시 전체 내용 표시
                className="px-3 py-2 border-r border-gray-200 text-sm 
                             whitespace-nowrap overflow-hidden text-ellipsis max-w-[400px]"
                style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '400px', // 셀 최대 너비 제한
                }}
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
