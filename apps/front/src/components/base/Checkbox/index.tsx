interface CheckboxProps {
  label?: string;
  checked?: boolean;
  onChange?: (_checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  name?: string;
}

export function Checkbox({ label, checked = false, onChange, disabled = false, className = '', name }: CheckboxProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        disabled={disabled}
        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-300 focus:ring-1 cursor-pointer disabled:cursor-not-allowed"
      />
      {label && <label className={`ml-2 text-sm text-gray-700 ${disabled ? 'text-gray-400' : 'cursor-pointer'}`}>{label}</label>}
    </div>
  );
}
