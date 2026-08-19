import React from 'react';
import { ExtractedField } from '../services/docEngine';

interface DynamicFormProps {
  fields: ExtractedField[];
  formData: Record<string, any>;
  onChange: (key: string, value: string) => void;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({ fields, formData, onChange }) => {
  if (fields.length === 0) {
    return (
      <div className="text-center py-6 text-slate-500 text-sm">
        У цьому шаблоні не знайдено змінних для заповнення.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {fields.map(field => (
        <div key={field.key} className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300">
            {field.label}
          </label>
          
          {field.type === 'textarea' ? (
            <textarea
              rows={3}
              value={formData[field.key] || ''}
              onChange={e => onChange(field.key, e.target.value)}
              placeholder={`Введіть ${field.label.toLowerCase()}`}
              className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
            />
          ) : (
            <input
              type={field.type}
              value={formData[field.key] || ''}
              onChange={e => onChange(field.key, e.target.value)}
              placeholder={`Введіть ${field.label.toLowerCase()}`}
              className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
          )}
        </div>
      ))}
    </div>
  );
};