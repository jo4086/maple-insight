import { TextField } from '@/components';
import { Input } from '@/components/base';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [value, setValue] = useState<string>('');

  return (
    <>
      <header className="bg-[oklch(0.2_0.05_250/0.9)] text-black text-2xl flex">
        <Link to={{ pathname: '/' }}>로고</Link>
        {/* <TextField */}
        {/*   mode="tailwind" */}
        {/*   onChange={(e) => setValue(e.target.value)} */}
        {/*   value={value} */}
        {/*   classNames={{ input: 'text-black', label: 'text-red', root: 'text-red' }} */}
        {/*   label="입력" */}
        {/* /> */}
        <Input className="rounded-sm m-4 " />
      </header>
      {/* <header className={`bg-[linear-gradient(to_right,oklch(0.2_0.05_250/0.9),oklch(0.2_0.05_250/0.2)_30%)]`}> 헤더 컴포넌트 </header> */}
    </>
  );
};

export default Header;
