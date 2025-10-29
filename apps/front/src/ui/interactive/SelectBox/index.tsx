import type { ChangeEvent } from 'react';

// Type
// interface SelectBoxProps {
//   label: string;
//   options: [];
//   selectedValue: string;
//   placeholder?: string;
//   disabled: boolean;
//   handleChange: (e: ChangeEvent<HTMLSelectElement>) => void;
// }
// interface Option {
//   key: number | string;
//   value: string;
// }
//
// export const SelectBox = () => {
//   return (
//     <div>
//       <div>hello</div>
//     </div>
//   );
// };

interface IOption {
  key: number | string;
  value: string;
}

interface ISelectBoxProps {
  label?: string;
  options: IOption[];
  selectedValue: string;
  placeholder?: string;
  error: string;
  disabled: boolean;
  handleChange: (e: ChangeEvent<HTMLSelectElement>) => void;
}

export function SelectBox({ label, options, selectedValue, placeholder, error, disabled, handleChange }: ISelectBoxProps) {
  return (
    <div className="relative">
      {label && <label className="text-xs">{label}</label>}
      <div>
        <select className="h-12 w-full rounded-lg bg-none px-3" value={selectedValue} onChange={(e) => handleChange(e)} disabled={disabled}>
          <option value="" className="">
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={`select_${option.key}`} value={option.key} data-name={option.value}>
              {option.value}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="absolute mt-0.5 text-xs text-[#F44336]">{error}</p>}
    </div>
  );
}
