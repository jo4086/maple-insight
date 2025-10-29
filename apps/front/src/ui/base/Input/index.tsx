import { twMerge } from 'tailwind-merge';

interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (_value: string) => void;
  type?: 'text' | 'email' | 'password' | 'number';
  disabled?: boolean;
  error?: string;
  className?: string;
  name?: string;
  fullWidth?: boolean;
}

export function Input({ label: _label, placeholder, value, onChange, type = 'text', disabled = false, error, className: iClassName = '', name, fullWidth = false }: InputProps) {
  const className = twMerge(`px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none w-full ${iClassName}`);
  return (
    <>
      {/* <div className={`flex ${className}`}> */}
      {/* {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>} */}
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className={`${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'} ${error ? 'border-red-500' : ''} ${className} ${fullWidth ? 'w-full' : ''}`}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {/*</div> */}
    </>
  );
}
