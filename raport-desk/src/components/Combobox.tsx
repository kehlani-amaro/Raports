import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface OptionItem {
  label: string;
  value: string;
}

export interface ComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: (string | OptionItem)[];
  placeholder?: string;
  readOnly?: boolean;
}

export const Combobox: React.FC<ComboboxProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Оберіть або введіть...',
  readOnly = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const normalizedOptions: OptionItem[] = options.map(opt =>
    typeof opt === 'string' ? { label: opt, value: opt } : opt
  );

  const filteredOptions = normalizedOptions.filter(opt =>
    opt.label.toLowerCase().includes((readOnly ? '' : filter).toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFilter('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentSelectedLabel = normalizedOptions.find(o => o.value === value)?.label || value;

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative flex items-center">
        <input
          type="text"
          value={isOpen && !readOnly ? filter : (currentSelectedLabel || '')}
          readOnly={readOnly}
          placeholder={placeholder}
          onClick={() => {
            setIsOpen(prev => !prev);
            if (!isOpen) setFilter('');
          }}
          onChange={e => {
            setFilter(e.target.value);
            onChange(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          className="w-full h-8 rounded-md bg-slate-950 border border-slate-800 px-2.5 pr-7 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer truncate"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => {
            setIsOpen(prev => !prev);
            if (!isOpen) setFilter('');
          }}
          className="absolute right-2 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-400' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <ul className="absolute z-50 mt-1 max-h-52 w-full overflow-y-auto rounded-md bg-slate-900 border border-slate-800 py-1 shadow-2xl custom-scrollbar text-xs">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt, idx) => (
              <li
                key={idx}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                  setFilter('');
                }}
                className={`px-3 py-1.5 cursor-pointer transition-colors ${
                  value === opt.value
                    ? 'bg-blue-600/30 text-blue-300 font-medium'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {opt.label}
              </li>
            ))
          ) : (
            <li className="px-3 py-1.5 text-slate-500 text-[11px]">Нічого не знайдено</li>
          )}
        </ul>
      )}
    </div>
  );
};