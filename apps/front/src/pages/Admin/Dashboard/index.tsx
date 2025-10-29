import { useState } from 'react';

type FileType = 'csv' | 'json';
type Mode = 'test' | 'production' | '';

interface UploadData {
  file?: File;
  fileType?: FileType;
  version: string;
  type: Mode;
}
function Dashboard() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const [data, setData] = useState<UploadData>({
    version: '',
    type: '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext !== 'csv' && ext !== 'json') {
      setError('파일 형식이 맞지 않습니다. csv 또는 json 파일만 업로드해주세요.');
      setData((prev) => ({ ...prev, file: undefined, fileType: undefined }));
      return;
    }

    // ✅ 올바른 파일이면 에러 초기화 + 자동으로 fileType 지정
    setError(null);
    setData((prev) => ({
      ...prev,
      file,
      fileType: ext as FileType, // 확장자로 타입 자동 설정
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!data.file) {
      alert('파일을 업로드해주세요.');
      return;
    }
    if (!data.fileType) {
      alert('파일 형식을 확인해주세요.');
      return;
    }
    if (data.type === '') {
      alert('모드를 선택해주세요.');
      return;
    }

    // ✅ 모든 조건 충족 시 서버 전송
    console.log('서버 전송 데이터:', data);
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div>
          <label>file upload</label>
          <input type="file" accept=".csv,.json" onChange={handleFileChange} />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div>
          <label>버전:</label>
          <input type="text" value={data.version} onChange={(e) => setData({ ...data, version: e.target.value })} />
        </div>

        <div>
          <label>모드:</label>
          <select value={data.type} onChange={(e) => setData({ ...data, type: e.target.value as Mode })}>
            <option value="">-- 선택하세요 --</option>
            <option value="test">테스트</option>
            <option value="production">프로덕션</option>
          </select>
        </div>

        <button type="submit">제출</button>

        <pre style={{ background: '#f5f5f5', padding: 10, marginTop: 10 }}>{JSON.stringify(data, null, 2)}</pre>
      </form>
    </>
  );
}

export default Dashboard;
