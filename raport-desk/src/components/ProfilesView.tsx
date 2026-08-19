import React, { useEffect, useState, useRef } from 'react';
import { 
  Users, Search, Plus, Edit3, Trash2, ArrowRight, 
  Phone, Shield, Award, Calendar, X, Check, 
  FileSpreadsheet, Loader2, FileCheck, UserCheck, 
  Plane, Palmtree, HeartPulse, AlertTriangle, Skull, CheckCircle2,
  CheckSquare, Square
} from 'lucide-react';
import { 
  getAllProfiles, deleteProfile, deleteProfilesBulk, 
  updateProfilesStatus, saveOrUpdateExplicitProfile, 
  MilitaryProfile, MilitaryStatus 
} from '../services/profilesService';
import { importProfilesFromEzhoos } from '../services/ezhoosParser';
import { MilitaryFormData } from './MilitaryReportForm';
import { Combobox } from './Combobox';
import { RANKS, POSITIONS_MAP, DIV_TYPES } from '../services/militaryDict';

interface Props {
  onSelectProfile: (data: Partial<MilitaryFormData>) => void;
}

const STATUS_CONFIG: Record<MilitaryStatus, { label: string; color: string; bg: string; border: string; icon: any }> = {
  active: {
    label: 'В строю',
    color: 'text-emerald-400',
    bg: 'bg-emerald-950/40',
    border: 'border-emerald-800/60',
    icon: CheckCircle2
  },
  business_trip: {
    label: 'Відрядження',
    color: 'text-blue-400',
    bg: 'bg-blue-950/40',
    border: 'border-blue-800/60',
    icon: Plane
  },
  vacation_main: {
    label: 'Відпустка Основна',
    color: 'text-amber-400',
    bg: 'bg-amber-950/40',
    border: 'border-amber-800/60',
    icon: Palmtree
  },
  vacation_treatment: {
    label: 'Відпустка Лікування',
    color: 'text-teal-400',
    bg: 'bg-teal-950/40',
    border: 'border-teal-800/60',
    icon: HeartPulse
  },
  awol: {
    label: 'СЗЧ',
    color: 'text-rose-400',
    bg: 'bg-rose-950/40',
    border: 'border-rose-800/60',
    icon: AlertTriangle
  },
  deceased: {
    label: 'Загинув',
    color: 'text-slate-400',
    bg: 'bg-slate-900',
    border: 'border-slate-700',
    icon: Skull
  }
};

const emptyProfileForm: Partial<MilitaryProfile> = {
  pib: '',
  short_pib: '',
  rank: '',
  position: '',
  full_position: '',
  position_index: '',
  vos: '',
  division: '',
  service_type: '',
  phone: '',
  status: 'active',
  bday: '',
  birth_place: '',
  full_years: '',
  citizen: 'українець',
  tck: '',
  draft: '',
  arrived_from: '',
  tariff_range: '',
  staff_category: '',
  salary_position: '',
  salary_rank: '',
  features_pct: '',
  premium_pct: '',
  exp_years: 0,
  exp_months: 0,
  exp_days: 0,
  acceptance_date: '',
  arrival_date: '',
  rank_order: '',
  rank_order_date: '',
  appointment_order: '',
  appointment_order_num: '',
  appointment_order_date: '',
  military_id_card: '',
  contract_end_date: '',
  ubd_status: '',
  ubd_period: '',
  ipn: '',
  fitness_vlk: '',
  vlk_certificate: '',
  vlk_date: '',
  marital_status: '',
  contact_person: '',
  education: '',
  education_degree: '',
  gender: '',
  registration_address: '',
  vacation_address: ''
};

export const ProfilesView: React.FC<Props> = ({ onSelectProfile }) => {
  const [profiles, setProfiles] = useState<MilitaryProfile[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | MilitaryStatus>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Множинний вибір
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editFormData, setEditFormData] = useState<Partial<MilitaryProfile>>(emptyProfileForm);

  const loadProfiles = async () => {
    const list = await getAllProfiles();
    setProfiles(list);
    if (list.length > 0 && !selectedId) {
      setSelectedId(list[0].id);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const buffer = await file.arrayBuffer();
      const result = await importProfilesFromEzhoos(buffer);
      await loadProfiles();
      alert(
        `Імпорт ЕЖООС успішно завершено!\n\n` +
        `• Додано нових бійців: ${result.addedCount}\n` +
        `• Оновлено даних: ${result.updatedCount}\n` +
        `• Пропущено рядків: ${result.skippedCount}`
      );
    } catch (err: any) {
      console.error(err);
      alert(`Помилка імпорту ЕЖООС: ${err.message}`);
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleOpenCreate = () => {
    setEditFormData(emptyProfileForm);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: MilitaryProfile) => {
    setEditFormData({ ...p });
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData.pib || !editFormData.pib.trim()) {
      alert('Будь ласка, вкажіть ПІБ військовослужбовця');
      return;
    }

    const saved = await saveOrUpdateExplicitProfile(editFormData as any);
    await loadProfiles();
    setSelectedId(saved.id);
    setIsModalOpen(false);
  };

  const handleDeleteSingle = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Видалити цей профіль?')) {
      await deleteProfile(id);
      setSelectedIds(prev => prev.filter(item => item !== id));
      await loadProfiles();
      if (selectedId === id) setSelectedId(null);
    }
  };

  // Масове видалення
  const handleDeleteBulk = async () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Видалити обрані профілі (${selectedIds.length} ос.)? Цю дію неможливо скасувати.`)) {
      await deleteProfilesBulk(selectedIds);
      if (selectedId && selectedIds.includes(selectedId)) {
        setSelectedId(null);
      }
      setSelectedIds([]);
      await loadProfiles();
    }
  };

  // Зміна статусу для одного профілю
  const handleSetStatus = async (id: string, newStatus: MilitaryStatus) => {
    await updateProfilesStatus([id], newStatus);
    await loadProfiles();
  };

  // Чекбокси
  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(p => p.id));
    }
  };

  const toggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Фільтрація
  const filtered = profiles.filter(p => {
    const pStatus = p.status || 'active';
    if (statusFilter !== 'all' && pStatus !== statusFilter) return false;

    const query = search.toLowerCase();
    return (
      p.pib.toLowerCase().includes(query) ||
      (p.short_pib && p.short_pib.toLowerCase().includes(query)) ||
      (p.rank && p.rank.toLowerCase().includes(query)) ||
      (p.position && p.position.toLowerCase().includes(query)) ||
      (p.phone && p.phone.includes(query)) ||
      (p.ipn && p.ipn.includes(query))
    );
  });

  const activeProfile = profiles.find(p => p.id === selectedId);

  // Підрахунок кількості за статусами
  const counts = {
    all: profiles.length,
    active: profiles.filter(p => (p.status || 'active') === 'active').length,
    business_trip: profiles.filter(p => p.status === 'business_trip').length,
    vacation_main: profiles.filter(p => p.status === 'vacation_main').length,
    vacation_treatment: profiles.filter(p => p.status === 'vacation_treatment').length,
    awol: profiles.filter(p => p.status === 'awol').length,
    deceased: profiles.filter(p => p.status === 'deceased').length,
  };

  const handleApplyProfile = (p: MilitaryProfile) => {
    onSelectProfile({
      pib: p.pib,
      rank: p.rank,
      position: p.position,
      division: p.division,
      phone: p.phone,
      bday: p.bday,
      citizen: p.citizen || 'українець',
      tck: p.tck,
      draft: p.draft,
      tariff_range: p.tariff_range,
      staff_category: p.staff_category,
      salary_position: p.salary_position,
      salary_rank: p.salary_rank,
      features_pct: p.features_pct,
      premium_pct: p.premium_pct,
      exp_years: p.exp_years,
      exp_months: p.exp_months,
      acceptance_date: p.acceptance_date,
      vacation_address: p.vacation_address || p.registration_address
    });
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-4 overflow-hidden">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileImport}
        accept=".xlsx, .xls"
        className="hidden"
      />

      {/* Верхня панель */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            База профілів військовослужбовців
          </h2>
          <p className="text-xs text-slate-400">
            Особового складу в базі: <span className="text-blue-400 font-semibold">{profiles.length}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-2.5">
          <div className="relative w-64">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Пошук за ПІБ, званням, ІПН..."
              className="w-full h-8 rounded-md bg-slate-950 border border-slate-800 pl-8 pr-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-700/80 text-xs font-semibold text-emerald-300 shadow-md shadow-emerald-950/50 transition disabled:opacity-50"
            title="Імпортувати журнал особового складу (Excel)"
          >
            {isImporting ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
            ) : (
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            )}
            Імпорт ЕЖООС (.xlsx)
          </button>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-md shadow-blue-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            Додати профіль
          </button>
        </div>
      </div>

      {/* Панель фільтрів за статусами */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0 select-none custom-scrollbar">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1 rounded-lg text-xs font-medium border transition ${
            statusFilter === 'all'
              ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          Всі ({counts.all})
        </button>

        <button
          onClick={() => setStatusFilter('active')}
          className={`px-3 py-1 rounded-lg text-xs font-medium border transition flex items-center gap-1.5 ${
            statusFilter === 'active'
              ? 'bg-emerald-950 border-emerald-600 text-emerald-300 shadow-sm'
              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-emerald-300'
          }`}
        >
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          В строю ({counts.active})
        </button>

        <button
          onClick={() => setStatusFilter('business_trip')}
          className={`px-3 py-1 rounded-lg text-xs font-medium border transition flex items-center gap-1.5 ${
            statusFilter === 'business_trip'
              ? 'bg-blue-950 border-blue-600 text-blue-300 shadow-sm'
              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-blue-300'
          }`}
        >
          <Plane className="w-3 h-3 text-blue-400" />
          Відрядження ({counts.business_trip})
        </button>

        <button
          onClick={() => setStatusFilter('vacation_main')}
          className={`px-3 py-1 rounded-lg text-xs font-medium border transition flex items-center gap-1.5 ${
            statusFilter === 'vacation_main'
              ? 'bg-amber-950 border-amber-600 text-amber-300 shadow-sm'
              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-amber-300'
          }`}
        >
          <Palmtree className="w-3 h-3 text-amber-400" />
          Відпустка Осн. ({counts.vacation_main})
        </button>

        <button
          onClick={() => setStatusFilter('vacation_treatment')}
          className={`px-3 py-1 rounded-lg text-xs font-medium border transition flex items-center gap-1.5 ${
            statusFilter === 'vacation_treatment'
              ? 'bg-teal-950 border-teal-600 text-teal-300 shadow-sm'
              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-teal-300'
          }`}
        >
          <HeartPulse className="w-3 h-3 text-teal-400" />
          Відпустка Лік. ({counts.vacation_treatment})
        </button>

        <button
          onClick={() => setStatusFilter('awol')}
          className={`px-3 py-1 rounded-lg text-xs font-medium border transition flex items-center gap-1.5 ${
            statusFilter === 'awol'
              ? 'bg-rose-950 border-rose-600 text-rose-300 shadow-sm'
              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-rose-300'
          }`}
        >
          <AlertTriangle className="w-3 h-3 text-rose-400" />
          СЗЧ ({counts.awol})
        </button>

        <button
          onClick={() => setStatusFilter('deceased')}
          className={`px-3 py-1 rounded-lg text-xs font-medium border transition flex items-center gap-1.5 ${
            statusFilter === 'deceased'
              ? 'bg-slate-800 border-slate-600 text-slate-200 shadow-sm'
              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Skull className="w-3 h-3 text-slate-400" />
          Загинув ({counts.deceased})
        </button>
      </div>

      {/* Панель вибору та масових дій */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-950/60 border border-slate-800 shrink-0 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-1.5 text-slate-300 hover:text-white transition"
            >
              {selectedIds.length > 0 && selectedIds.length === filtered.length ? (
                <CheckSquare className="w-4 h-4 text-blue-500" />
              ) : (
                <Square className="w-4 h-4 text-slate-500" />
              )}
              <span>Обрати всіх у списку ({filtered.length})</span>
            </button>
            {selectedIds.length > 0 && (
              <span className="text-blue-400 font-medium ml-2">
                (Обрано: {selectedIds.length})
              </span>
            )}
          </div>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleDeleteBulk}
                className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-rose-950/70 hover:bg-rose-900/80 border border-rose-800/80 text-rose-300 font-semibold transition shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                Видалити обраних ({selectedIds.length})
              </button>
            </div>
          )}
        </div>
      )}

      {/* Основна сітка */}
      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden">
        {/* Список зліва */}
        <div className="col-span-5 h-full overflow-y-auto pr-2 custom-scrollbar space-y-2">
          {filtered.length > 0 ? (
            filtered.map(p => {
              const isSelected = p.id === selectedId;
              const isChecked = selectedIds.includes(p.id);
              const pStatus = p.status || 'active';
              const cfg = STATUS_CONFIG[pStatus] || STATUS_CONFIG.active;
              const StatusIcon = cfg.icon;

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected 
                      ? 'bg-blue-950/30 border-blue-600/60 shadow-lg shadow-blue-950/40' 
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 pr-2">
                    {/* Чекбокс */}
                    <button
                      onClick={(e) => toggleSelectOne(p.id, e)}
                      className="mt-0.5 text-slate-500 hover:text-blue-400 transition shrink-0"
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-blue-500" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-600" />
                      )}
                    </button>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-semibold text-slate-100 truncate">
                          {p.pib}
                        </h4>
                        {/* Бейдж статусу */}
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border flex items-center gap-1 shrink-0 ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                          <StatusIcon className="w-2.5 h-2.5" />
                          {cfg.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-400 truncate">
                        <span className="capitalize text-blue-400 font-medium">{p.rank || 'Без звання'}</span>
                        {p.position && <span className="truncate">• {p.position}</span>}
                      </div>

                      {p.phone && (
                        <p className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {p.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => handleDeleteSingle(p.id, e)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition"
                      title="Видалити профіль"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-slate-600 text-xs border border-dashed border-slate-800 rounded-xl">
              Профілів не знайдено за заданими фільтрами.
            </div>
          )}
        </div>

        {/* Картка детальної інформації праворуч */}
        <div className="col-span-7 h-full flex flex-col rounded-xl border border-slate-800 bg-slate-900/40 p-5 overflow-y-auto custom-scrollbar space-y-4">
          {activeProfile ? (
            <>
              {/* Заголовок картки */}
              <div className="flex items-start justify-between border-b border-slate-800/80 pb-3">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-100">{activeProfile.pib}</h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span className="px-2 py-0.5 rounded bg-blue-950/60 border border-blue-900/40 text-blue-300 text-[11px] capitalize font-medium">
                      {activeProfile.rank || 'Звання не вказано'}
                    </span>
                    <span>{activeProfile.position || 'Посада не вказана'}</span>
                    {activeProfile.short_pib && (
                      <span className="text-slate-500 text-[11px]">({activeProfile.short_pib})</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(activeProfile)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                    Редагувати
                  </button>

                  <button
                    onClick={() => handleApplyProfile(activeProfile)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-md shadow-blue-600/30 transition"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    Заповнити рапорт
                  </button>
                </div>
              </div>

              {/* Блок швидкого встановлення статусу бійця */}
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
                <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">
                  Поточний статус бійця:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => handleSetStatus(activeProfile.id, 'active')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium border flex items-center gap-1 transition ${
                      (activeProfile.status || 'active') === 'active'
                        ? 'bg-emerald-950 border-emerald-600 text-emerald-300 shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    В строю
                  </button>

                  <button
                    onClick={() => handleSetStatus(activeProfile.id, 'business_trip')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium border flex items-center gap-1 transition ${
                      activeProfile.status === 'business_trip'
                        ? 'bg-blue-950 border-blue-600 text-blue-300 shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Plane className="w-3 h-3 text-blue-400" />
                    Відрядження
                  </button>

                  <button
                    onClick={() => handleSetStatus(activeProfile.id, 'vacation_main')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium border flex items-center gap-1 transition ${
                      activeProfile.status === 'vacation_main'
                        ? 'bg-amber-950 border-amber-600 text-amber-300 shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Palmtree className="w-3 h-3 text-amber-400" />
                    Відпустка Основна
                  </button>

                  <button
                    onClick={() => handleSetStatus(activeProfile.id, 'vacation_treatment')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium border flex items-center gap-1 transition ${
                      activeProfile.status === 'vacation_treatment'
                        ? 'bg-teal-950 border-teal-600 text-teal-300 shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <HeartPulse className="w-3 h-3 text-teal-400" />
                    Відпустка Лікування
                  </button>

                  <button
                    onClick={() => handleSetStatus(activeProfile.id, 'awol')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium border flex items-center gap-1 transition ${
                      activeProfile.status === 'awol'
                        ? 'bg-rose-950 border-rose-600 text-rose-300 shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <AlertTriangle className="w-3 h-3 text-rose-400" />
                    СЗЧ
                  </button>

                  <button
                    onClick={() => handleSetStatus(activeProfile.id, 'deceased')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium border flex items-center gap-1 transition ${
                      activeProfile.status === 'deceased'
                        ? 'bg-slate-800 border-slate-600 text-slate-200 shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Skull className="w-3 h-3 text-slate-400" />
                    Загинув
                  </button>
                </div>
              </div>

              {/* Детальні блоки даних ЕЖООС */}
              <div className="space-y-3.5 text-xs">
                {/* 1. Служба та підрозділ */}
                <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-2">
                  <h5 className="text-[11px] font-semibold uppercase text-slate-400 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-blue-400" /> Служба та підрозділ
                  </h5>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-300">
                    <p><span className="text-slate-500">Підрозділ:</span> {activeProfile.division || '—'}</p>
                    <p><span className="text-slate-500">Вид служби:</span> {activeProfile.service_type || '—'}</p>
                    <p><span className="text-slate-500">ВОС:</span> {activeProfile.vos || '—'}</p>
                    <p><span className="text-slate-500">Індекс посади:</span> {activeProfile.position_index || '—'}</p>
                    <p className="col-span-2"><span className="text-slate-500">Повна назва посади:</span> {activeProfile.full_position || activeProfile.position || '—'}</p>
                    <p><span className="text-slate-500">Номер телефону:</span> {activeProfile.phone || '—'}</p>
                    <p><span className="text-slate-500">Прописка / Адреса:</span> {activeProfile.registration_address || activeProfile.vacation_address || '—'}</p>
                  </div>
                </div>

                {/* 2. Паспортні дані та ВЛК */}
                <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-2">
                  <h5 className="text-[11px] font-semibold uppercase text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Паспортні дані, ВЛК та облік
                  </h5>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-300">
                    <p><span className="text-slate-500">Дата народження:</span> {activeProfile.bday || '—'}{activeProfile.full_years ? ` (${activeProfile.full_years} р.)` : ''}</p>
                    <p><span className="text-slate-500">Місце народження:</span> {activeProfile.birth_place || '—'}</p>
                    <p><span className="text-slate-500">ІПН:</span> {activeProfile.ipn || '—'}</p>
                    <p><span className="text-slate-500">Стать:</span> {activeProfile.gender || '—'}</p>
                    <p><span className="text-slate-500">Призваний РТЦК:</span> {activeProfile.tck || '—'}</p>
                    <p><span className="text-slate-500">Звідки прибув:</span> {activeProfile.arrived_from || '—'}</p>
                    <p><span className="text-slate-500">Придатність ВЛК:</span> {activeProfile.fitness_vlk || '—'}</p>
                    <p><span className="text-slate-500">Довідка ВЛК:</span> {activeProfile.vlk_certificate ? `${activeProfile.vlk_certificate} від ${activeProfile.vlk_date || ''}` : '—'}</p>
                  </div>
                </div>

                {/* 3. Накази, призначення та контракти */}
                <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-2">
                  <h5 className="text-[11px] font-semibold uppercase text-slate-400 flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-indigo-400" /> Накази, призначення та контракти
                  </h5>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-300">
                    <p><span className="text-slate-500">Прийняття посади:</span> {activeProfile.acceptance_date || '—'}</p>
                    <p><span className="text-slate-500">Фактичне прибуття:</span> {activeProfile.arrival_date || '—'}</p>
                    <p className="col-span-2"><span className="text-slate-500">Наказ призначення:</span> {activeProfile.appointment_order ? `${activeProfile.appointment_order} №${activeProfile.appointment_order_num || ''} від ${activeProfile.appointment_order_date || ''}` : '—'}</p>
                    <p className="col-span-2"><span className="text-slate-500">Наказ присвоєння звання:</span> {activeProfile.rank_order ? `${activeProfile.rank_order} ${activeProfile.rank_order_date ? `(${activeProfile.rank_order_date})` : ''}` : (activeProfile.rank_order || '—')}</p>
                    <p><span className="text-slate-500">Військовий квиток:</span> {activeProfile.military_id_card || '—'}</p>
                    <p><span className="text-slate-500">Кінець контракту:</span> {activeProfile.contract_end_date || '—'}</p>
                  </div>
                </div>

                {/* 4. УБД, Освіта та Сім'я */}
                <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-2">
                  <h5 className="text-[11px] font-semibold uppercase text-slate-400 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-cyan-400" /> УБД, Соціальні дані та Освіта
                  </h5>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-300">
                    <p><span className="text-slate-500">Участь у БД:</span> {activeProfile.ubd_status || '—'}</p>
                    <p><span className="text-slate-500">Період УБД:</span> {activeProfile.ubd_period || '—'}</p>
                    <p><span className="text-slate-500">Сімейний стан:</span> {activeProfile.marital_status || '—'}</p>
                    <p><span className="text-slate-500">Контактна особа:</span> {activeProfile.contact_person || '—'}</p>
                    <p className="col-span-2"><span className="text-slate-500">Освіта:</span> {activeProfile.education ? `${activeProfile.education} (${activeProfile.education_degree || ''})` : '—'}</p>
                  </div>
                </div>

                {/* 5. Грошове забезпечення та вислуга */}
                <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-2">
                  <h5 className="text-[11px] font-semibold uppercase text-slate-400 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-400" /> Грошове забезпечення та вислуга
                  </h5>
                  <div className="grid grid-cols-3 gap-2 text-slate-300">
                    <p><span className="text-slate-500">Тарифний розряд:</span> {activeProfile.tariff_range || '—'}</p>
                    <p><span className="text-slate-500">ШПК:</span> {activeProfile.staff_category || '—'}</p>
                    <p><span className="text-slate-500">Оклад посади:</span> {activeProfile.salary_position ? `${activeProfile.salary_position} грн` : '—'}</p>
                    <p><span className="text-slate-500">Оклад звання:</span> {activeProfile.salary_rank ? `${activeProfile.salary_rank} грн` : '—'}</p>
                    <p><span className="text-slate-500">Особливості:</span> {activeProfile.features_pct ? `${activeProfile.features_pct}%` : '—'}</p>
                    <p><span className="text-slate-500">Премія:</span> {activeProfile.premium_pct ? `${activeProfile.premium_pct}%` : '—'}</p>
                    <p className="col-span-3"><span className="text-slate-500">Вислуга:</span> {activeProfile.exp_years || 0} р. {activeProfile.exp_months || 0} міс. {activeProfile.exp_days ? `${activeProfile.exp_days} дн.` : ''}</p>
                  </div>
                </div>
              </div>

              {/* Футер */}
              <div className="mt-auto pt-3 border-t border-slate-800/60 text-[10px] text-slate-500 flex items-center justify-between">
                <span>Останнє оновлення:</span>
                <span className="font-mono">{new Date(activeProfile.updated_at).toLocaleString('uk-UA')}</span>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-600 text-xs">
              Оберіть профіль зі списку зліва для перегляду
            </div>
          )}
        </div>
      </div>

      {/* Модальне вікно редагування / створення */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in-0 duration-150">
          <div className="w-full max-w-3xl bg-[#090e1c] border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 shrink-0">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                {modalMode === 'create' ? <Plus className="w-4 h-4 text-blue-400" /> : <Edit3 className="w-4 h-4 text-blue-400" />}
                {modalMode === 'create' ? 'Новий профіль військовослужбовця' : `Редагування: ${editFormData.pib}`}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-5 overflow-y-auto custom-scrollbar space-y-4 text-xs flex-1">
              {/* Статус при редагуванні */}
              <div className="p-3 rounded-lg border border-slate-800/80 bg-slate-950/40 flex items-center justify-between">
                <span className="text-slate-300 font-semibold">Статус бійця:</span>
                <select
                  value={editFormData.status || 'active'}
                  onChange={e => setEditFormData({ ...editFormData, status: e.target.value as MilitaryStatus })}
                  className="h-8 rounded-md bg-slate-900 border border-slate-800 px-3 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
                >
                  <option value="active">В строю</option>
                  <option value="business_trip">Відрядження</option>
                  <option value="vacation_main">Відпустка Основна</option>
                  <option value="vacation_treatment">Відпустка Лікування</option>
                  <option value="awol">СЗЧ</option>
                  <option value="deceased">Загинув</option>
                </select>
              </div>

              {/* Служба */}
              <div className="space-y-3 p-3.5 rounded-lg border border-slate-800/80 bg-slate-950/40">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Службові дані</span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="text-slate-300">ПІБ (Повністю)*</label>
                    <input
                      type="text"
                      required
                      value={editFormData.pib || ''}
                      onChange={e => setEditFormData({ ...editFormData, pib: e.target.value })}
                      placeholder="САНДІЙ Максим Тарасович"
                      className="w-full h-8 mt-1 rounded-md bg-slate-900 border border-slate-800 px-2.5 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300">Військове звання</label>
                    <div className="mt-1">
                      <Combobox
                        value={editFormData.rank || ''}
                        onChange={val => setEditFormData({ ...editFormData, rank: val })}
                        options={RANKS}
                        placeholder="Оберіть звання..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-300">Посада</label>
                    <div className="mt-1">
                      <Combobox
                        value={editFormData.position || ''}
                        onChange={val => setEditFormData({ ...editFormData, position: val })}
                        options={Object.keys(POSITIONS_MAP)}
                        placeholder="Оберіть посаду..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-300">Підрозділ / Дивізіон</label>
                    <div className="mt-1">
                      <Combobox
                        value={editFormData.division || ''}
                        onChange={val => setEditFormData({ ...editFormData, division: val })}
                        options={DIV_TYPES}
                        placeholder="Оберіть підрозділ..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-300">ВОС</label>
                    <input
                      type="text"
                      value={editFormData.vos || ''}
                      onChange={e => setEditFormData({ ...editFormData, vos: e.target.value })}
                      placeholder="100028"
                      className="w-full h-8 mt-1 rounded-md bg-slate-900 border border-slate-800 px-2.5 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="text-slate-300">Повна назва посади</label>
                    <input
                      type="text"
                      value={editFormData.full_position || ''}
                      onChange={e => setEditFormData({ ...editFormData, full_position: e.target.value })}
                      className="w-full h-8 mt-1 rounded-md bg-slate-900 border border-slate-800 px-2.5 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Паспортні та ВЛК */}
              <div className="space-y-3 p-3.5 rounded-lg border border-slate-800/80 bg-slate-950/40">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Паспортні дані та ВЛК</span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-300">Дата народження</label>
                    <input
                      type="text"
                      placeholder="24.02.2000"
                      value={editFormData.bday || ''}
                      onChange={e => setEditFormData({ ...editFormData, bday: e.target.value })}
                      className="w-full h-8 mt-1 rounded-md bg-slate-900 border border-slate-800 px-2.5 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300">ІПН</label>
                    <input
                      type="text"
                      placeholder="3642100000"
                      value={editFormData.ipn || ''}
                      onChange={e => setEditFormData({ ...editFormData, ipn: e.target.value })}
                      className="w-full h-8 mt-1 rounded-md bg-slate-900 border border-slate-800 px-2.5 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300">Телефон</label>
                    <input
                      type="text"
                      placeholder="+380..."
                      value={editFormData.phone || ''}
                      onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })}
                      className="w-full h-8 mt-1 rounded-md bg-slate-900 border border-slate-800 px-2.5 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300">Назва ТЦК</label>
                    <input
                      type="text"
                      value={editFormData.tck || ''}
                      onChange={e => setEditFormData({ ...editFormData, tck: e.target.value })}
                      className="w-full h-8 mt-1 rounded-md bg-slate-900 border border-slate-800 px-2.5 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300">Придатність ВЛК</label>
                    <input
                      type="text"
                      value={editFormData.fitness_vlk || ''}
                      onChange={e => setEditFormData({ ...editFormData, fitness_vlk: e.target.value })}
                      className="w-full h-8 mt-1 rounded-md bg-slate-900 border border-slate-800 px-2.5 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300">Довідка ВЛК</label>
                    <input
                      type="text"
                      value={editFormData.vlk_certificate || ''}
                      onChange={e => setEditFormData({ ...editFormData, vlk_certificate: e.target.value })}
                      className="w-full h-8 mt-1 rounded-md bg-slate-900 border border-slate-800 px-2.5 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="col-span-3">
                    <label className="text-slate-300">Прописка / Адреса проживання</label>
                    <input
                      type="text"
                      value={editFormData.registration_address || ''}
                      onChange={e => setEditFormData({ ...editFormData, registration_address: e.target.value })}
                      className="w-full h-8 mt-1 rounded-md bg-slate-900 border border-slate-800 px-2.5 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Кнопки збереження */}
              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
                >
                  Скасувати
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-lg shadow-blue-600/30 transition"
                >
                  <Check className="w-4 h-4" />
                  {modalMode === 'create' ? 'Створити профіль' : 'Зберегти зміни'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};