import { useEffect, useState } from 'react';

interface JsonProps {
  file: File;
}

export const Json = ({ file }: JsonProps) => {
  const [jsonData, setJsonData] = useState<unknown | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        setJsonData(parsed);
      } catch (err) {
        setError('JSON 파싱에 실패했습니다.');
        console.error('JSON Parse Error:', err);
      }
    };

    reader.onerror = () => {
      setError('파일을 읽는 중 오류가 발생했습니다.');
    };

    reader.readAsText(file);
  }, [file]);

  if (error) {
    return <p className="text-read-500">{error}</p>;
  }

  if (!jsonData) {
    return <p>JSON 파일을 불러오는 중...</p>;
  }

  return (
    <div className="max-h-75 overflow-auto bg-[#f7f7f7] p-2.5 rounded rounded-1">
      <pre className="whitespace-pre-wrap wrap-break-word">{JSON.stringify(jsonData, null, 2)}</pre>
    </div>
  );
};
