import { useState } from 'react';
import { useUploadFiles } from '@/api/mutations';

export const FileBox = () => {
  const [value, setValue] = useState('첨부 파일');

  return (
    <div>
      <input
        style={{ display: 'inline-block', height: '40px', padding: '0 10px', verticalAlign: 'middle', border: '1px solid #dddddd', width: '78%', color: '#999999', outline: 0 }}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <label
        htmlFor="file"
        style={{
          display: 'inline-block',
          padding: '10px 20px',
          color: '#fff',
          verticalAlign: 'middle',
          backgroundColor: '#999999',
          cursor: 'pointer',
          height: '40px',
          marginLeft: '10px',
        }}
      >
        파일 첨부
      </label>
      <input style={{ position: 'absolute', width: 0, height: 0, padding: 0, overflow: 'hidden', border: 0 }} type="file" multiple id="file" />
    </div>
  );
};
