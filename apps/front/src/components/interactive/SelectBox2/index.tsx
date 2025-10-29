import React from 'react';

interface IOption {
  key: string;
  value: string;
}
interface SelectBoxProps {
  label: string;
  options: IOption[];
  selectedValue: string;
  disabled: boolean;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}
export const SelectBox2 = ({ label, selectedValue, disabled, options, onChange }: SelectBoxProps) => {
  const [selected, setSelected] = React.useState<string>('');

  return (
    <Container>
      {label && <label className="text-xs">{label}</label>}
      <div></div>
      <Select value={selectedValue} disabled={disabled} />
      <Option options={options}></Option>
    </Container>
  );
};

function Container({ children, className, ...rest }: BaseComponentProps<'div'>) {
  return (
    <div className={className} {...rest}>
      {children}
    </div>
  );
}

interface SelectProps {
  value: string;
  disabled: boolean;
}
function Select({ value, disabled }: SelectProps) {
  return (
    <div className="" aria-disabled={disabled}>
      {value}
    </div>
  );
}

interface OptionProps {
  options: IOption[];
}
function Option({ options }: OptionProps) {
  return (
    <div>
      {options.map((option) => (
        <div key={option.key}>{option.value}</div>
      ))}
    </div>
  );
}
