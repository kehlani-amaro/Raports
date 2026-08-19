import React, { useEffect, useState } from 'react';
import { 
  Users, Search, Plus, Edit3, Trash2, ArrowRight, 
  Phone, Shield, Award, Calendar, X, Check, User
} from 'lucide-react';
import { 
  getAllProfiles, deleteProfile, saveOrUpdateExplicitProfile, MilitaryProfile 
} from '../services/profilesService';
import { MilitaryFormData } from './MilitaryReportForm';
import { Combobox } from './Combobox';
import { RANKS, POSITIONS_MAP, DIV_TYPES } from '../services/militaryDict';

interface Props {
  onSelectProfile: (data: Partial<MilitaryFormData>) => void;
}

const emptyProfileForm: Partial<MilitaryProfile> = {
  pib: '',
  rank: '',
  position: '',
  division: '',
  phone: '',
  bday: '',
  citizen: 'українець',
  tck: '',
  draft: '',
  tariff_range: '',
  staff_category: '',
  salary_position: '',
  salary_rank: '',
  features_pct: '',
  premium_pct: '',
  exp_years: 0,
  exp_months: 0,
  vacation_address: ''
};

export const ProfilesView: React.FC<Props> = ({ onSelectProfile }) => {
  const [profiles, setProfiles] = useState<MilitaryProfile[]>([]);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Стан модального вікна додавання / редагування
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

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Видалити цей профіль?')) {
      await deleteProfile(id);
      await loadProfiles();
      if (selectedId === id) setSelectedId(null);
    }
  };

  const filtered = profiles.filter(p => 
    p.pib.toLowerCase().includes(search.toLowerCase()) ||
    (p.rank && p.rank.toLowerCase().includes(search.toLowerCase())) ||
    (p.position && p.position.toLowerCase().includes(search.toLowerCase())) ||
    (p.phone && p.phone.includes(search))
  );

  const activeProfile = profiles.find(p => p.id === selectedId);

  const handleApplyProfile = (p: MilitaryProfile) => {
    onSelectProfile({
      pib: p.pib,
      rank: p.rank,
      position: p.position,
      division: p.division,
      phone: p.phone,
      bday: p.bday,
      citizen: p.citizen,
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
      vacation_address: p.vacation_address
    });
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-6 overflow-hidden">
      {/* Верхня панель */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            База профілів військовослужбовців
          </h2>
          <p className="text-xs text-slate-400">
            Збережені досьє особового складу для швидкого автозаповнення рапортів
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Пошук за ПІБ, званням, телефоном..."
              className="w-full h-8 rounded-md bg-slate-950 border border-slate-800 pl-8 pr-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          </div>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-md shadow-blue-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            Додати профіль
          </button>
        </div>
      </div>

      {/* Основна сітка */}
      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden">
        {/* Список профілів ліворуч */}
        <div className="col-span-5 h-full overflow-y-auto pr-2 custom-scrollbar space-y-2">
          {filtered.length > 0 ? (
            filtered.map(p => {
              const isSelected = p.id === selectedId;
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
                  <div className="space-y-1 min-w-0 pr-2">
                    <h4 className="text-xs font-semibold text-slate-100 truncate">
                      {p.pib}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="capitalize text-blue-400 font-medium">{p.rank || 'Без звання'}</span>
                      {p.position && <span>• {p.position}</span>}
                    </div>
                    {p.phone && (
                      <p className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {p.phone}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => handleDelete(p.id, e)}
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
              Профілів не знайдено. Натисніть «+ Додати профіль» або згенеруйте рапорт.
            </div>
          )}
        </div>

        {/* Картка детальної інформації праворуч */}
        <div className="col-span-7 h-full flex flex-col rounded-xl border border-slate-800 bg-slate-900/40 p-5 overflow-y-auto custom-scrollbar space-y-5">
          {activeProfile ? (
            <>
              {/* Заголовок картки з кнопками Редагувати та Заповнити */}
              <div className="flex items-start justify-between border-b border-slate-800/80 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-100">{activeProfile.pib}</h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                    <span className="px-2 py-0.5 rounded bg-blue-950/60 border border-blue-900/40 text-blue-300 text-[11px] capitalize font-medium">
                      {activeProfile.rank || 'Звання не вказано'}
                    </span>
                    <span>{activeProfile.position || 'Посада не вказана'}</span>
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

              {/* Детальні блоки даних */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                {/* Службові дані */}
                <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-2">
                  <h5 className="text-[11px] font-semibold uppercase text-slate-400 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-blue-400" /> Служба та підрозділ
                  </h5>
                  <div className="space-y-1 text-slate-300">
                    <p><span className="text-slate-500">Дивізіон:</span> {activeProfile.division || '—'}</p>
                    <p><span className="text-slate-500">Телефон:</span> {activeProfile.phone || '—'}</p>
                    <p><span className="text-slate-500">Адреса відпустки:</span> {activeProfile.vacation_address || '—'}</p>
                  </div>
                </div>

                {/* Паспортні дані (ВЛК) */}
                <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-2">
                  <h5 className="text-[11px] font-semibold uppercase text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Паспортні дані (ВЛК)
                  </h5>
                  <div className="space-y-1 text-slate-300">
                    <p><span className="text-slate-500">Дата народження:</span> {activeProfile.bday || '—'}</p>
                    <p><span className="text-slate-500">Громадянство:</span> {activeProfile.citizen || '—'}</p>
                    <p><span className="text-slate-500">ТЦК:</span> {activeProfile.tck || '—'}</p>
                    <p><span className="text-slate-500">Призов:</span> {activeProfile.draft || '—'}</p>
                  </div>
                </div>

                {/* Фінансові та посадові параметри */}
                <div className="col-span-2 p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-2">
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
                    <p className="col-span-3"><span className="text-slate-500">Вислуга років:</span> {activeProfile.exp_years || 0} р. {activeProfile.exp_months || 0} міс.</p>
                  </div>
                </div>
              </div>

              {/* Дата оновлення */}
              <div className="mt-auto pt-3 border-t border-slate-800/60 text-[10px] text-slate-500 flex items-center justify-between">
                <span>Останнє оновлення профілю:</span>
                <span className="font-mono">{new Date(activeProfile.updated_at).toLocaleString('uk-UA')}</span>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-600 text-xs">
              Оберіть профіль зі списку зліва для перегляду детальної картки
            </div>
          )}
        </div>
      </div>

      {/* Модальне вікно Створення / Редагування */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in-0 duration-150">
          <div className="w-full max-w-2xl bg-[#090e1c] border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Шапка модалки */}
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

            {/* Тіло форми */}
            <form onSubmit={handleSaveModal} className="p-5 overflow-y-auto custom-scrollbar space-y-4 text-xs flex-1">
              {/* Основні дані */}
              <div className="space-y-3 p-3.5 rounded-lg border border-slate-800/80 bg-slate-950/40">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Основні та службові дані</span>
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
                    <label className="text-slate-300">Дивізіон</label>
                    <div className="mt-1">
                      <Combobox
                        value={editFormData.division || ''}
                        onChange={val => setEditFormData({ ...editFormData, division: val })}
                        options={DIV_TYPES}
                        placeholder="Оберіть дивізіон..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-300">Номер телефону</label>
                    <input
                      type="text"
                      value={editFormData.phone || ''}
                      onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })}
                      placeholder="+380..."
                      className="w-full h-8 mt-1 rounded-md bg-slate-900 border border-slate-800 px-2.5 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Паспортні дані */}
              <div className="space-y-3 p-3.5 rounded-lg border border-slate-800/80 bg-slate-950/40">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Паспортні дані (ВЛК)</span>
                <div className="grid grid-cols-2 gap-3">
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
                    <label className="text-slate-300">Громадянство</label>
                    <input
                      type="text"
                      placeholder="українець"
                      value={editFormData.citizen || ''}
                      onChange={e => setEditFormData({ ...editFormData, citizen: e.target.value })}
                      className="w-full h-8 mt-1 rounded-md bg-slate-900 border border-slate-800 px-2.5 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300">Назва ТЦК</label>
                    <input
                      type="text"
                      placeholder="Львівським МТЦК та СП"
                      value={editFormData.tck || ''}
                      onChange={e => setEditFormData({ ...editFormData, tck: e.target.value })}
                      className="w-full h-8 mt-1 rounded-md bg-slate-900 border border-slate-800 px-2.5 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300">Час призову</label>
                    <input
                      type="text"
                      placeholder="в лютому 2025 року"
                      value={editFormData.draft || ''}
                      onChange={e => setEditFormData({ ...editFormData, draft: e.target.value })}
                      className="w-full h-8 mt-1 rounded-md bg-slate-900 border border-slate-800 px-2.5 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="text-slate-300">Адреса для відпустки</label>
                    <input
                      type="text"
                      placeholder="Область, район, населений пункт, вулиця"
                      value={editFormData.vacation_address || ''}
                      onChange={e => setEditFormData({ ...editFormData, vacation_address: e.target.value })}
                      className="w-full h-8 mt-1 rounded-md bg-slate-900 border border-slate-800 px-2.5 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Фінансові дані */}
              <div className="space-y-3 p-3.5 rounded-lg border border-slate-800/80 bg-slate-950/40">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Грошове забезпечення та вислуга</span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-300">Тарифний розряд</label>
                    <input
                      type="text"
                      placeholder="4"
                      value={editFormData.tariff_range || ''}
                      onChange={e => setEditFormData({ ...editFormData, tariff_range: e.target.value })}
                      className="w-full h-8 mt-1 rounded-md bg-slate-900 border border-slate-800 px-2.5 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300">ШПК</label>
                    <input
                      type="text"
                      placeholder="сержант"
                      value={editFormData.staff_category || ''}
                      onChange={e => setEditFormData({ ...editFormData, staff_category: e.target.value })}
                      className="w-full h-8 mt-1 rounded-md bg-slate-900 border border-slate-800 px-2.5 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300">Оклад посади (грн)</label>
                    <input
                      type="text"
                      placeholder="2730"
                      value={editFormData.salary_position || ''}
                      onChange={e => setEditFormData({ ...editFormData, salary_position: e.target.value })}
                      className="w-full h-8 mt-1 rounded-md bg-slate-900 border border-slate-800 px-2.5 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300">Оклад звання (грн)</label>
                    <input
                      type="text"
                      placeholder="530"
                      value={editFormData.salary_rank || ''}
                      onChange={e => setEditFormData({ ...editFormData, salary_rank: e.target.value })}
                      className="w-full h-8 mt-1 rounded-md bg-slate-900 border border-slate-800 px-2.5 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300">Особливості (%)</label>
                    <input
                      type="text"
                      placeholder="65"
                      value={editFormData.features_pct || ''}
                      onChange={e => setEditFormData({ ...editFormData, features_pct: e.target.value })}
                      className="w-full h-8 mt-1 rounded-md bg-slate-900 border border-slate-800 px-2.5 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300">Премія (%)</label>
                    <input
                      type="text"
                      placeholder="578"
                      value={editFormData.premium_pct || ''}
                      onChange={e => setEditFormData({ ...editFormData, premium_pct: e.target.value })}
                      className="w-full h-8 mt-1 rounded-md bg-slate-900 border border-slate-800 px-2.5 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300">Вислуга (років)</label>
                    <input
                      type="number"
                      value={editFormData.exp_years || 0}
                      onChange={e => setEditFormData({ ...editFormData, exp_years: parseInt(e.target.value) || 0 })}
                      className="w-full h-8 mt-1 rounded-md bg-slate-900 border border-slate-800 px-2.5 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300">Вислуга (місяців)</label>
                    <input
                      type="number"
                      value={editFormData.exp_months || 0}
                      onChange={e => setEditFormData({ ...editFormData, exp_months: parseInt(e.target.value) || 0 })}
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