import { useState, useEffect } from 'react';
import { Packer } from 'docx';
import { MilitaryReportForm, MilitaryFormData } from './components/MilitaryReportForm';
import { DocxViewer } from './components/DocxViewer';
import { TemplateManagerView } from './components/TemplateManagerView';
import { AnalyticsView } from './components/AnalyticsView';
import { ProfilesView } from './components/ProfilesView';
import { Combobox } from './components/Combobox';
import { 
  RANKS, 
  DIV_TYPES, 
  REPORT_TYPES, 
  POSITIONS_MAP, 
  HOSPITALS 
} from './services/militaryDict';
import { buildMilitaryReportDocx } from './services/nativeDocxBuilder';
import { fillDocxTemplate, parseDocxPlaceholders, ExtractedField } from './services/docEngine';
import { getSavedTemplates, SavedTemplate, base64ToArrayBuffer } from './services/templateManager';
import { logReportGeneration } from './services/analyticsService';
import { autoSaveOrUpdateProfile } from './services/profilesService';
import {
  FileText, BarChart3, Library, Users, Download,
  Sparkles, ShieldCheck, UserCheck, Plus
} from 'lucide-react';

type TabType = 'generator' | 'analytics' | 'templates' | 'profiles';

const emptyFormData: MilitaryFormData = {
  report_type: "На консультацію",
  pib: "",
  rank: "",
  position: "",
  division: "",
  phone: "",
  hospital: "",
  doctor_specialist: "",
  attachments: "",
  rat_date: "",
  bday: "",
  citizen: "",
  tck: "",
  draft: "",
  bat_pref: "Командир",
  bat_rank: "",
  bat_name: "",
  div_pref: "Командир",
  div_rank: "",
  div_name: "",
  accordance_to: "",
  tariff_range: "",
  staff_category: "",
  acceptance_date: "",
  salary_position: "",
  salary_rank: "",
  features_pct: "",
  premium_pct: "",
  exp_years: 0,
  exp_months: 0,
  current_month: "",
  vacation_reason: "у зв’язку з необхідністю надання невідкладної допомоги сім’ї у вирішенні складних побутових питань",
  vacation_days_num: 1,
  vacation_start_date: "",
  vacation_address: ""
};

const testFormData: MilitaryFormData = {
  report_type: "На консультацію",
  pib: "САНДІЙ Максим Тарасович",
  rank: "солдат",
  position: "Номер обслуги",
  division: "забезпечення навчального процесу",
  phone: "+380971234567",
  hospital: "у ВМКЦ ЗР м. Львів, вул. Личаківська 26",
  doctor_specialist: "до лікаря-травматолога",
  attachments: "Направлення, медична книжка",
  rat_date: "",
  bday: "24.02.2000",
  citizen: "українець",
  tck: "Львівським МТЦК та СП",
  draft: "в лютому 2025 року",
  bat_pref: "Тимчасово виконуючий обов’язки командира",
  bat_rank: "молодший лейтенант",
  bat_name: "Роман ЗАЛУЦЬКИЙ",
  div_pref: "Тимчасово виконуючий обов’язки командира",
  div_rank: "полковник",
  div_name: "Михайло МИХАНЦЬО",
  accordance_to: "наказу командира військової частини А3618 від 10.08.2026 року №142",
  tariff_range: "4",
  staff_category: "сержант",
  acceptance_date: "2026-06-01",
  salary_position: "2730",
  salary_rank: "530",
  features_pct: "65",
  premium_pct: "578",
  exp_years: 2,
  exp_months: 4,
  current_month: "червня",
  vacation_reason: "у зв’язку з необхідністю надання невідкладної допомоги сім’ї у вирішенні складних побутових питань",
  vacation_days_num: 5,
  vacation_start_date: "",
  vacation_address: "Львівська обл., Жовківський р-н, с. Забір'я, вул. Шевченка, 90"
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('generator');
  const [generatorMode, setGeneratorMode] = useState<'builtin' | 'custom'>('builtin');
  const [builtInFormData, setBuiltInFormData] = useState<MilitaryFormData>(emptyFormData);

  // Користувацькі шаблони
  const [customTemplates, setCustomTemplates] = useState<SavedTemplate[]>([]);
  const [selectedCustomId, setSelectedCustomId] = useState<string>('');
  const [customDocBuffer, setCustomDocBuffer] = useState<ArrayBuffer | null>(null);
  const [customFields, setCustomFields] = useState<ExtractedField[]>([]);
  const [customValues, setCustomValues] = useState<Record<string, string>>({});

  const [previewBuffer, setPreviewBuffer] = useState<ArrayBuffer | null>(null);

  // Завантаження збережених шаблонів
  const reloadCustomTemplates = async () => {
    try {
      const list = await getSavedTemplates();
      setCustomTemplates(list);
    } catch (err) {
      console.error('Помилка завантаження шаблонів:', err);
    }
  };

  useEffect(() => {
    reloadCustomTemplates();

    const onUpdate = () => reloadCustomTemplates();
    window.addEventListener('templates_updated', onUpdate);
    return () => window.removeEventListener('templates_updated', onUpdate);
  }, [activeTab]);

  // Вибір конкретного власного шаблону
  const handleSelectTemplate = (template: SavedTemplate) => {
    setSelectedCustomId(template.id);
    setGeneratorMode('custom');

    const rawBase64 = template.raw_docx_base64 || template.raw_docx_blob || '';
    const buffer = base64ToArrayBuffer(rawBase64);

    if (buffer) {
      setCustomDocBuffer(buffer);
      try {
        const fields = parseDocxPlaceholders(buffer);
        setCustomFields(fields);

        const initialVals: Record<string, string> = {};
        fields.forEach(f => {
          initialVals[f.key] = customValues[f.key] || '';
        });
        setCustomValues(initialVals);
      } catch (err) {
        console.error('Помилка парсингу полів шаблону:', err);
        setCustomFields([]);
      }
    } else {
      setCustomDocBuffer(null);
      setCustomFields([]);
    }
  };

  // Автозаповнення полів власного шаблону з поточного профілю військового
  const handleAutoFillCustom = () => {
    if (!customFields.length) return;
    const updated = { ...customValues };

    customFields.forEach(f => {
      const k = f.key.toLowerCase();
      if (k.includes('піб') || k.includes('прізвище') || k === 'name' || k === 'pib') {
        updated[f.key] = builtInFormData.pib;
      } else if (k.includes('звання') || k === 'rank' || k === 'ранг') {
        updated[f.key] = builtInFormData.rank;
      } else if (k.includes('посада') || k === 'position') {
        updated[f.key] = builtInFormData.position;
      } else if (k.includes('підрозділ') || k.includes('дивізіон') || k === 'division') {
        updated[f.key] = builtInFormData.division;
      } else if (k.includes('телефон') || k === 'phone') {
        updated[f.key] = builtInFormData.phone;
      } else if (k.includes('народження') || k === 'bday') {
        updated[f.key] = builtInFormData.bday;
      } else if (k.includes('тцк') || k === 'tck') {
        updated[f.key] = builtInFormData.tck;
      } else if (k.includes('адреса') || k.includes('прописка')) {
        updated[f.key] = builtInFormData.vacation_address;
      } else if (k.includes('госпіталь') || k.includes('лікарня') || k === 'hospital') {
        updated[f.key] = builtInFormData.hospital;
      }
    });

    setCustomValues(updated);
  };

  // Оновлення живого попереднього перегляду DOCX
  useEffect(() => {
    let isMounted = true;

    if (generatorMode === 'builtin') {
      try {
        const doc = buildMilitaryReportDocx(builtInFormData);
        Packer.toBlob(doc).then(async (blob) => {
          const arrayBuf = await blob.arrayBuffer();
          if (isMounted) setPreviewBuffer(arrayBuf);
        }).catch(err => console.error(err));
      } catch (e) {
        console.error(e);
      }
    } else if (generatorMode === 'custom' && customDocBuffer) {
      try {
        const filledUint8 = fillDocxTemplate(customDocBuffer, customValues);
        const cleanBuf = filledUint8.buffer.slice(0);
        if (isMounted) setPreviewBuffer(cleanBuf);
      } catch (err) {
        console.error('Помилка генерації прев’ю власного шаблону:', err);
      }
    }

    return () => { isMounted = false; };
  }, [builtInFormData, generatorMode, customDocBuffer, customValues]);

  // Експорт DOCX
  const handleExport = async () => {
    try {
      if (generatorMode === 'builtin' && builtInFormData.pib.trim()) {
        try {
          await autoSaveOrUpdateProfile(builtInFormData);
        } catch (err) {
          console.warn('Помилка автозбереження профілю:', err);
        }
      }

      let uint8: Uint8Array;
      let defaultName = '';
      let targetName = '';
      let templateTitle = '';
      let category = '';

      if (generatorMode === 'builtin') {
        const doc = buildMilitaryReportDocx(builtInFormData);
        const blob = await Packer.toBlob(doc);
        const arrayBuf = await blob.arrayBuffer();
        uint8 = new Uint8Array(arrayBuf);

        const pibFirst = builtInFormData.pib.trim().split(/\s+/)[0] || 'Рапорт';
        defaultName = `Рапорт_${pibFirst}_${builtInFormData.report_type}.docx`;
        targetName = builtInFormData.pib || 'Не вказано';
        templateTitle = builtInFormData.report_type;
        category = 'Стандартні ЗСУ';
      } else {
        if (!customDocBuffer) {
          alert('Будь ласка, оберіть шаблон');
          return;
        }
        const filled = fillDocxTemplate(customDocBuffer, customValues);
        uint8 = new Uint8Array(filled);
        const curTmpl = customTemplates.find(t => t.id === selectedCustomId);
        templateTitle = curTmpl?.title || 'Шаблон';
        defaultName = `Рапорт_${templateTitle}.docx`;
        targetName = customValues['прізвище'] || customValues['pib'] || customValues['ПІБ'] || 'Користувач';
        category = curTmpl?.category || 'Користувацькі';
      }

      const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
      let savedFilePath = '';

      if (isTauri) {
        try {
          const { save } = await import('@tauri-apps/plugin-dialog');
          const { writeFile } = await import('@tauri-apps/plugin-fs');
          const filePath = await save({
            defaultPath: defaultName,
            filters: [{ name: 'Word Document', extensions: ['docx'] }]
          });
          if (filePath) {
            await writeFile(filePath, uint8);
            savedFilePath = filePath;
          } else return;
        } catch {
          downloadBlobFallback(uint8, defaultName);
        }
      } else {
        downloadBlobFallback(uint8, defaultName);
      }

      try {
        await logReportGeneration({
          template_title: templateTitle,
          category,
          target_person_name: targetName,
          target_person_rank: generatorMode === 'builtin' ? builtInFormData.rank : (customValues['звання'] || ''),
          target_person_unit: generatorMode === 'builtin' ? builtInFormData.division : (customValues['підрозділ'] || ''),
          commander_title: generatorMode === 'builtin' ? builtInFormData.bat_name : '',
          status: 'APPROVED',
          form_payload_json: JSON.stringify(generatorMode === 'builtin' ? builtInFormData : customValues),
          file_path: savedFilePath || defaultName
        });
      } catch { }

      alert(`Рапорт успішно збережено: ${defaultName}`);
    } catch (e: any) {
      alert(`Помилка формування: ${e.message}`);
    }
  };

  function downloadBlobFallback(bytes: Uint8Array, fileName: string) {
    const blob = new Blob([bytes as BlobPart], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Функція підбору варіантів дропдауну для поля власного шаблону
  const getDropdownOptionsForField = (key: string): string[] | null => {
    const k = key.toLowerCase().trim();

    if (k.includes('звання') || k === 'rank' || k === 'ранг') {
      return RANKS;
    }
    if (k.includes('підрозділ') || k.includes('дивізіон') || k === 'division') {
      return DIV_TYPES;
    }
    if (k.includes('посада') || k === 'position') {
      return Object.keys(POSITIONS_MAP);
    }
    if (k.includes('госпіталь') || k.includes('лікарня') || k === 'hospital') {
      return HOSPITALS;
    }
    if (k.includes('тип') && k.includes('рапорт')) {
      return REPORT_TYPES;
    }
    return null;
  };

  return (
    <div className="flex h-screen w-screen bg-[#050811] text-slate-100 font-sans select-none overflow-hidden">
      {/* Бокова панель навігації */}
      <aside className="w-64 border-r border-slate-900 bg-[#070c18] flex flex-col justify-between p-4 shrink-0">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-500 border border-blue-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-100">RaportDesk</h1>
              <p className="text-[10px] text-emerald-400 font-medium">Автономний режим</p>
            </div>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('generator')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'generator' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              Генератор рапортів
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'analytics' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Журнал та Статистика
            </button>

            <button
              onClick={() => setActiveTab('templates')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'templates' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <Library className="w-4 h-4" />
              База шаблонів
            </button>

            <button
              onClick={() => setActiveTab('profiles')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'profiles' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              Профілі військових
            </button>
          </nav>
        </div>

        <div className="space-y-2 text-[11px] text-slate-500 border-t border-slate-900 pt-4 px-2">
          <div className="flex justify-between items-center">
            <span>Сховище:</span>
            <span className="text-slate-400 font-mono">SQLite Portable</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Мережа:</span>
            <span className="text-emerald-500 font-medium">Вимкнено (Air-Gap)</span>
          </div>
        </div>
      </aside>

      {/* Основна робоча зона */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#050811]">
        <header className="h-14 border-b border-slate-900 px-6 flex items-center justify-between shrink-0 bg-[#070c18]/50">
          {activeTab === 'generator' ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setGeneratorMode('builtin')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  generatorMode === 'builtin' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                Регламентні рапорти ЗСУ
              </button>
              <button
                onClick={() => {
                  setGeneratorMode('custom');
                  if (customTemplates.length > 0 && !selectedCustomId) {
                    handleSelectTemplate(customTemplates[0]);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  generatorMode === 'custom'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                Власні .docx шаблони ({customTemplates.length})
              </button>
            </div>
          ) : (
            <div className="text-sm font-semibold text-slate-200">
              {activeTab === 'analytics' && 'Журнал та Аналітика'}
              {activeTab === 'templates' && 'База Шаблонів'}
              {activeTab === 'profiles' && 'Профілі Військовослужбовців'}
            </div>
          )}

          {activeTab === 'generator' && (
            <div className="flex items-center gap-2">
              {generatorMode === 'builtin' && (
                <button
                  onClick={() => setBuiltInFormData(testFormData)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  🧪 ТЕСТ (САНДІЙ М.Т.)
                </button>
              )}

              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-lg shadow-blue-600/30 transition"
              >
                <Download className="w-3.5 h-3.5" />
                ЗГЕНЕРУВАТИ .DOCX
              </button>
            </div>
          )}
        </header>

        {/* Контент табів */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'generator' && (
            <div className="grid grid-cols-12 h-full gap-6 p-6 overflow-hidden">
              {/* Ліва колонка: Форма введення */}
              <div className="col-span-6 h-full overflow-y-auto pr-2 custom-scrollbar">
                {generatorMode === 'builtin' ? (
                  <MilitaryReportForm
                    formData={builtInFormData}
                    setFormData={setBuiltInFormData}
                  />
                ) : (
                  <div className="space-y-4">
                    {/* Вибір завантаженого шаблону */}
                    <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Обраний шаблон Word
                        </label>
                        <button
                          type="button"
                          onClick={() => setActiveTab('templates')}
                          className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Додати шаблон
                        </button>
                      </div>

                      <select
                        value={selectedCustomId}
                        onChange={(e) => {
                          const tmpl = customTemplates.find(t => t.id === e.target.value);
                          if (tmpl) handleSelectTemplate(tmpl);
                        }}
                        className="w-full h-8 rounded-md bg-slate-950 border border-slate-800 px-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                      >
                        {customTemplates.length > 0 ? (
                          customTemplates.map(t => (
                            <option key={t.id} value={t.id}>
                              {t.title} ({t.category || 'Загальні'})
                            </option>
                          ))
                        ) : (
                          <option value="">Немає завантажених шаблонів</option>
                        )}
                      </select>
                    </div>

                    {/* Поля шаблону з інтерактивними Combobox */}
                    {customTemplates.length > 0 && (
                      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Поля шаблону ({customFields.length})
                          </h3>
                          {builtInFormData.pib && (
                            <button
                              type="button"
                              onClick={handleAutoFillCustom}
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-950 border border-blue-800 text-[11px] font-medium text-blue-300 hover:bg-blue-900 transition"
                            >
                              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                              Заповнити з: {builtInFormData.pib.split(' ')[0]}
                            </button>
                          )}
                        </div>

                        {customFields.length > 0 ? (
                          <div className="grid grid-cols-2 gap-3 pt-1">
                            {customFields.map(f => {
                              const currentValue = customValues[f.key] || '';
                              const dropdownOptions = getDropdownOptionsForField(f.key);

                              return (
                                <div 
                                  key={f.key} 
                                  className={f.key.length > 20 ? 'col-span-2' : 'col-span-1'}
                                >
                                  <label className="block text-[11px] font-medium text-slate-400 mb-1 truncate" title={f.key}>
                                    {f.label}{' '}
                                    <span className="text-[10px] text-slate-600 font-mono">({`{{${f.key}}}`})</span>
                                  </label>

                                  {dropdownOptions ? (
                                    <Combobox
                                      value={currentValue}
                                      onChange={val => setCustomValues(prev => ({ ...prev, [f.key]: val }))}
                                      options={dropdownOptions}
                                      placeholder={`Оберіть ${f.label.toLowerCase()}...`}
                                    />
                                  ) : f.type === 'date' ? (
                                    <input
                                      type="date"
                                      value={currentValue}
                                      onChange={e => setCustomValues(prev => ({ ...prev, [f.key]: e.target.value }))}
                                      className="w-full h-8 rounded-md bg-slate-950 border border-slate-800 px-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                                    />
                                  ) : (
                                    <input
                                      type="text"
                                      value={currentValue}
                                      onChange={e => setCustomValues(prev => ({ ...prev, [f.key]: e.target.value }))}
                                      placeholder={`Введіть ${f.label.toLowerCase()}...`}
                                      className="w-full h-8 rounded-md bg-slate-950 border border-slate-800 px-2.5 text-xs text-slate-100 placeholder:text-slate-700 focus:outline-none focus:border-blue-500"
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="py-6 text-center text-xs text-slate-500">
                            У цьому файлі не виявлено плейсхолдерів формату <code className="text-blue-400 font-mono">{"{{змінна}}"}</code>.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Права колонка: Інтерактивне прев'ю DOCX */}
              <div className="col-span-6 h-full flex flex-col overflow-hidden">
                <DocxViewer fileBuffer={previewBuffer} />
              </div>
            </div>
          )}

          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === 'templates' && <TemplateManagerView />}
          {activeTab === 'profiles' && (
            <ProfilesView
              onSelectProfile={(data: Partial<MilitaryFormData>) => {
                setBuiltInFormData(prev => ({ ...prev, ...data }));
                setActiveTab('generator');
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
}