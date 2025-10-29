import React, { useState, Children, cloneElement, isValidElement, type ReactNode, useRef, useEffect } from 'react';

// --- TYPE DEFINITIONS ---

type SelectBoxProps = {
  children: ReactNode;
  value?: string; // Controlled value from parent
  onValueChange?: (value: string) => void; // Callback to notify parent of change
  placeholder?: string;
  onOpenChange?: (open: boolean) => void; // 예시 추가
};

type TriggerProps = {
  children?: ReactNode;
  // Injected props
  isOpen?: boolean;
  onToggle?: () => void;
  selectedLabel?: ReactNode;
};

type OptionsProps = {
  children: ReactNode;
  // Injected props
  isOpen?: boolean;
  onSelect?: (value: string, label: ReactNode) => void;
  selectedValue?: string;
};

type OptionProps = {
  value: string;
  children: ReactNode;
  // Injected props
  onSelect?: (value: string, label: ReactNode) => void;
  selectedValue?: string;
};

// --- SUBCOMPONENTS ---

const Trigger = ({ isOpen, onToggle, selectedLabel }: TriggerProps) => (
  <button
    type="button"
    data-role="selectbox-trigger"
    onPointerDown={(e) => {
      e.stopPropagation(); // Fab으로 이벤트 버블링 안 감
    }}
    onClick={onToggle}
    className="flex items-center justify-between w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
  >
    <span className="truncate text-black">{selectedLabel}</span>
    <svg
      className={`w-5 h-5 ml-2 -mr-1 text-gray-400 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  </button>
);

const Options = ({ isOpen, children, onSelect, selectedValue }: OptionsProps) => {
  if (!isOpen) return null;

  return (
    <ul className="absolute z-10 w-full mt-1 overflow-auto bg-white border border-gray-300 rounded-md shadow-lg max-h-60 focus:outline-none">
      {Children.map(children, (child) => {
        if (isValidElement(child) && typeof child.type !== 'string' && child.type.name === 'Option') {
          return cloneElement(child, { onSelect, selectedValue } as OptionProps);
        }
        return child;
      })}
    </ul>
  );
};

const Option = ({ value, children, onSelect, selectedValue }: OptionProps) => {
  const isSelected = value === selectedValue;
  return (
    <li
      onClick={() => onSelect?.(value, children)}
      className={`px-4 py-2 text-gray-900 cursor-pointer hover:bg-indigo-500 hover:text-white ${isSelected ? 'bg-indigo-100' : ''}`}
      role="option"
      aria-selected={isSelected}
    >
      {children}
    </li>
  );
};

// --- MAIN COMPONENT ---

export const SelectBox3 = ({ children, value, onValueChange, onOpenChange, placeholder = 'Select an option' }: SelectBoxProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<ReactNode>(placeholder);
  const selectBoxRef = useRef<HTMLDivElement>(null);

  // Find the label for the current value from props
  useEffect(() => {
    let currentLabel: ReactNode = placeholder;
    if (value) {
      Children.forEach(children, (child) => {
        if (isValidElement<OptionsProps>(child) && typeof child.type !== 'string' && child.type.name === 'Options') {
          Children.forEach(child.props.children, (optionChild) => {
            if (isValidElement<OptionProps>(optionChild) && optionChild.props.value === value) {
              currentLabel = optionChild.props.children;
            }
          });
        }
      });
    }
    setSelectedLabel(currentLabel);
  }, [value, children, placeholder]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectBoxRef.current && !selectBoxRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // const handleToggle = () => setIsOpen((prev) => !prev);
  const handleToggle = () => {
    setIsOpen((prev) => {
      const next = !prev;
      onOpenChange?.(next);
      return next;
    });
  };

  // const handleSelect = (newValue: string, label: ReactNode) => {
  //   // Don't set state directly. Instead, call the callback passed from the parent.
  //   onValueChange?.(newValue);
  //   // The label will be updated via the useEffect hook when the parent passes a new `value` prop.
  //   setIsOpen(false);
  // };

  const handleSelect = (newValue: string, label: ReactNode) => {
    onValueChange?.(newValue);
    setIsOpen(false);
    onOpenChange?.(false);
  };

  const renderChildren = () => {
    return Children.map(children, (child) => {
      if (isValidElement(child) && typeof child.type !== 'string') {
        switch (child.type.name) {
          case 'Trigger':
            return cloneElement(child as React.ReactElement<TriggerProps>, { isOpen, onToggle: handleToggle, selectedLabel });
          case 'Options':
            // Pass the `value` from props as `selectedValue` to the Options
            return cloneElement(child as React.ReactElement<OptionsProps>, { isOpen, onSelect: handleSelect, selectedValue: value });
          default:
            return child;
        }
      }
      return child;
    });
  };

  return (
    <div className="relative w-full max-w-xs  bg-transparent" ref={selectBoxRef}>
      {renderChildren()}
    </div>
  );
};

SelectBox3.Trigger = Trigger;
SelectBox3.Options = Options;
SelectBox3.Option = Option;

/*
// --- EXAMPLE USAGE ---
//
// const App = () => {
//   const [framework, setFramework] = useState('react');
//
//   return (
//     <div className="flex items-center justify-center h-screen bg-gray-100">
//       <div className="w-64 p-4 space-y-4 bg-white rounded-lg shadow-xl">
//         <h2 className="text-lg font-bold text-center">Custom Select Box</h2>
//         <SelectBox3 onValueChange={(value) => setFramework(value)} defaultValue={framework}>
//           <SelectBox3.Trigger />
//           <SelectBox3.Options>
//             <SelectBox3.Option value="react">React</SelectBox3.Option>
//             <SelectBox3.Option value="vue">Vue.js</SelectBox3.Option>
//             <SelectBox3.Option value="svelte">Svelte</SelectBox3.Option>
//             <SelectBox3.Option value="angular">Angular</SelectBox3.Option>
//           </SelectBox3.Options>
//         </SelectBox3>
//         <p className="text-center text-gray-600">
//           Selected: <span className="font-semibold text-indigo-600">{framework}</span>
//         </p>
//       </div>
//     </div>
//   );
// };
//
// export default App;
*/
