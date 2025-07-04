import { useState } from 'react';

import { SearchBox } from '../../components';

export const Home = () => {
  const [nick, setNick] = useState('');

  return (
    <>
      <h1 className="text-blue-100">[Home Page]</h1>
      <SearchBox onChange={(e) => setNick(e.target.value)} value={nick} />
    </>
  );
};

export default Home;
