import { type ChangeEvent, type ChangeEventHandler } from 'react';

export type OptionKV = { label: string; value: string };
interface SelectBoxProps {
  options: OptionKV[];
  id?: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;

  value: string;
  // onChange: () => void;

  // onChange: (value: string) => void;
  onChange: ChangeEventHandler<HTMLSelectElement>;
}

export const SelectBox = ({
  value,
  onChange,
  options,
  disabled = false,
  id = 'select-box',
  label,
  placeholder,
}: SelectBoxProps) => {
  // const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
  //   onChange(e.currentTarget.value);
  // };

  return (
    <label className="bg-blue-200 justify-between text-black outline-0" htmlFor={id}>
      {label}
      <select
        className="outline-0 w-40 flex justify-center items-center border border-indigo-600 rounded-sm p-2"
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
      >
        {placeholder && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option className="w-10" key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
};
