import React, { useState, useEffect } from 'react';
import { getSavedTemplates, saveCustomTemplate, deleteTemplate, SavedTemplate } from '../services/templateManager';
import { REPORT_TYPES } from '../services/militaryDict';
import { UploadCloud, Trash2, FileText, CheckCircle2 } from 'lucide-react';

interface Props {
  onSelectCustomTemplate?: (template: SavedTemplate) => void;
}

export const TemplateManagerView: React.FC<Props> = ({ onSelectCustomTemplate }) => {
  const [templates, setTemplates] = useState<SavedTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const loadList = async () => {
    try {
      setLoading(true);
      const data = await getSavedTemplates();
      setTemplates(data);
    } catch (e) {
      console.error('Помилка завантаження шаблонів:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadList();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const buffer = await file.arrayBuffer();
      const title = file.name.replace('.docx', '');
      await saveCustomTemplate(title, 'Користувацькі', 'Завантажений користувачем .docx шаблон', buffer);
      await loadList();
    } catch (err: any) {
      alert(`Помилка додавання шаблону: ${err.message}`);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Ви впевнені, що хочете видалити цей шаблон?')) {
      await deleteTemplate(id);
      await loadList();
    }
  };

  const parseFieldsCount = (tmpl: SavedTemplate): number => {
    try {
      const raw = tmpl.fields_metadata_json || tmpl.fields_json || '[]';
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      return Array.isArray(parsed) ? parsed.length : 0;
    } catch {
      return 0;
    }
  };

  return (
    <div className="p-8 max-w-6xl w-full mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">База Шаблонів Рапортів</h2>
          <p className="text-xs text-slate-400">Вбудовані регламентні форми та ваші власні .docx шаблони</p>
        </div>

        <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-lg transition">
          <UploadCloud className="w-4 h-4" />
          {uploading ? 'Завантаження...' : 'Додати власний .docx'}
          <input type="file" accept=".docx" onChange={handleFileUpload} className="hidden" />
        </label>
      </div>

      {/* Вбудовані рапорти ЗСУ */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Вбудовані стандартизовані бланки (Автоматичні відмінки)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {REPORT_TYPES.map(type => (
            <div key={type} className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex items-start justify-between">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-slate-200">{type}</h4>
                <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/40">
                  Вбудований (ДСТУ)
                </span>
              </div>
              <FileText className="w-5 h-5 text-slate-600" />
            </div>
          ))}
        </div>
      </div>

      {/* Користувацькі шаблони */}
      <div className="space-y-3 pt-4">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-400" />
          Користувацькі .docx шаблони ({templates.length})
        </h3>

        {loading ? (
          <div className="text-center py-6 text-slate-500 text-sm">Завантаження бази...</div>
        ) : templates.length === 0 ? (
          <div className="border border-dashed border-slate-800 rounded-xl p-8 text-center text-slate-500 bg-slate-900/20">
            Ви ще не додали жодного власного шаблону. Натисніть кнопку вище, щоб завантажити .docx файл із тегами типу {'{{прізвище}}'}.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {templates.map(tmpl => {
              const count = parseFieldsCount(tmpl);
              return (
                <div 
                  key={tmpl.id} 
                  onClick={() => onSelectCustomTemplate && onSelectCustomTemplate(tmpl)}
                  className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition flex flex-col justify-between cursor-pointer"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="text-sm font-semibold text-slate-200 line-clamp-1">{tmpl.title}</h4>
                      <button 
                        onClick={(e) => handleDelete(tmpl.id, e)}
                        className="text-slate-500 hover:text-rose-400 transition"
                        title="Видалити"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">{tmpl.description}</p>
                    <span className="inline-block text-[10px] text-blue-400 font-mono">
                      Знайдено {count} змінних(-і)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};