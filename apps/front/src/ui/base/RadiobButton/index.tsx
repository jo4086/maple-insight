interface RadioOption {
  value: string;
  label: string;
}

interface RadioButtonProps {
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  name: string;
  disabled?: boolean;
  className?: string;
  direction?: 'horizontal' | 'vertical';
}

export function RadioButton({ options, value, onChange, name, disabled = false, className = '', direction = 'vertical' }: RadioButtonProps) {
  return (
    <div className={`${direction === 'horizontal' ? 'flex flex-wrap gap-4' : 'space-y-2'} ${className}`}>
      {options.map((option) => (
        <div key={option.value} className="flex items-center">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={disabled}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-0 cursor-pointer disabled:cursor-not-allowed"
          />
          <label className={`ml-2 text-sm text-gray-700 ${disabled ? 'text-gray-400' : 'cursor-pointer'}`}>{option.label}</label>
        </div>
      ))}
    </div>
  );
}
