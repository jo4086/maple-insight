import type { ChangeEvent } from 'react';

import { InputField } from '../../InputField';

interface SearchBoxProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export const SearchBox = ({ onChange, value, className }: SearchBoxProps) => {
  console.log(value);

  return <InputField onChange={onChange} value={value} className={className} />;
};
