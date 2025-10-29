import { useState } from 'react';

import { DataModal } from '@/ui/interactive/Modal/DataModal';

function Dashboard() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (values: FormValues) => {
    setIsSubmitting(true);
    try {
      alert('Data Submit Success!');
    } catch {
      alert('Network Error!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <h2>Admin - DashBoard</h2>
      <button onClick={() => setIsOpen(true)}>모달 열기</button>
      <DataModal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <DataForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </DataModal>
    </>
  );
}
export default Dashboard;

export interface FormValues {
  username: string;
  email: string;
}

interface DataFormProps {
  onSubmit: (values: FormValues) => void; // 상위에서 처리
  isSubmitting?: boolean;
}

export const DataForm = ({ onSubmit, isSubmitting }: DataFormProps) => {
  const [formValues, setFormValues] = useState<FormValues>({
    username: '',
    email: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formValues); // 상위에 데이터 전달
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        이름:
        <input type="text" name="username" value={formValues.username} onChange={handleChange} required />
      </label>

      <label>
        이메일:
        <input type="email" name="email" value={formValues.email} onChange={handleChange} required />
      </label>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '전송 중...' : '제출'}
      </button>
    </form>
  );
};
