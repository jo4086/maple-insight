import { useState } from 'react';

import { CharacterSearchInput } from './CharacterSearchInput';
import { CharacterSearchResult } from './CharacterSearchResult';

export function CharacterSearchSection() {
  const [submittedNick, setSubmittedNick] = useState('');

  return (
    <div>
      <CharacterSearchInput onSearch={setSubmittedNick} />
      <CharacterSearchResult nick={submittedNick} />
    </div>
  );
}
