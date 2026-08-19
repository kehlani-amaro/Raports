import React from 'react';
import { Combobox } from './Combobox';
import {
    REPORT_TYPES, RANKS, DIV_TYPES, HOSPITALS, DOCTOR_SPECIALISTS,
    POSITIONS_MAP, SALARY_TARIFF_MAP, formatDaysUkr
} from '../services/militaryDict';

const PREFIXES = [
    "Командир",
    "Тимчасово виконуючий обов’язки командира"
];

const TARIFF_RANGES = Array.from({ length: 60 }, (_, i) => String(i + 1));

export interface MilitaryFormData {
    report_type: string;
    pib: string;
    rank: string;
    position: string;
    division: string;
    phone: string;
    hospital: string;
    doctor_specialist: string;
    attachments: string;
    rat_date: string;
    bday: string;
    citizen: string;
    tck: string;
    draft: string;
    bat_pref: string;
    bat_rank: string;
    bat_name: string;
    div_pref: string;
    div_rank: string;
    div_name: string;
    accordance_to: string;
    tariff_range: string;
    staff_category: string;
    acceptance_date: string;
    salary_position: string;
    salary_rank: string;
    features_pct: string;
    premium_pct: string;
    exp_years: number;
    exp_months: number;
    current_month: string;
    vacation_reason: string;
    vacation_days_num: number;
    vacation_start_date: string;
    vacation_address: string;
}

interface Props {
    formData: MilitaryFormData;
    setFormData: React.Dispatch<React.SetStateAction<MilitaryFormData>>;
}

export const MilitaryReportForm: React.FC<Props> = ({ formData, setFormData }) => {
    const updateField = (key: keyof MilitaryFormData, value: any) => {
        setFormData(prev => {
            const next = { ...prev, [key]: value };
            if (key === 'tariff_range' && SALARY_TARIFF_MAP[value]) {
                next.salary_position = SALARY_TARIFF_MAP[value];
            }
            return next;
        });
    };

    const setRelativeDate = (key: 'rat_date' | 'vacation_start_date', offsetDays: number) => {
        const d = new Date();
        d.setDate(d.getDate() + offsetDays);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        updateField(key, `${day}.${month}.${d.getFullYear()}`);
    };

    const isVlk = formData.report_type === "На ВЛК";
    const isRation = formData.report_type === "Зняття з котла" || formData.report_type === "Повернення з лікарні";
    const isMed = formData.report_type === "На консультацію" || formData.report_type === "На госпіталізацію" || formData.report_type === "На ВЛК" || formData.report_type === "Зняття з котла";
    const isAcceptance = formData.report_type === "Прийом посади (новий формат)";
    const isVacation = formData.report_type === "Відпустка за сімейними обставинами";

    return (
        <div className="space-y-4">
            {/* 1. Тип рапорту */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Тип рапорту</label>
                <Combobox
                    value={formData.report_type}
                    onChange={val => updateField('report_type', val)}
                    options={REPORT_TYPES}
                    readOnly={true}
                />
            </div>

            {/* 2. Особисті дані солдата */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800/80 pb-2">
                    Особисті дані солдата
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                        <label className="text-xs text-slate-300">ПІБ (Повністю)</label>
                        <input
                            type="text"
                            value={formData.pib}
                            onChange={e => updateField('pib', e.target.value)}
                            placeholder="САНДІЙ Максим Тарасович"
                            className="w-full h-8 mt-1 rounded-md bg-slate-950 border border-slate-800 px-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="text-xs text-slate-300">Звання</label>
                        <div className="mt-1">
                            <Combobox
                                value={formData.rank}
                                onChange={val => updateField('rank', val)}
                                options={RANKS}
                                placeholder="Оберіть або введіть..."
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-slate-300">Посада</label>
                        <div className="mt-1">
                            <Combobox
                                value={formData.position}
                                onChange={val => updateField('position', val)}
                                options={Object.keys(POSITIONS_MAP)}
                                placeholder="Оберіть або введіть..."
                            />
                        </div>
                    </div>

                    {formData.position === "Курсант" && (
                        <div>
                            <label className="text-xs text-slate-300">Дивізіон</label>
                            <div className="mt-1">
                                <Combobox
                                    value={formData.division}
                                    onChange={val => updateField('division', val)}
                                    options={DIV_TYPES}
                                    placeholder="Оберіть або введіть..."
                                />
                            </div>
                        </div>
                    )}

                    {!isAcceptance && formData.report_type !== "Зняття з котла" && formData.report_type !== "Повернення з лікарні" && (
                        <div>
                            <label className="text-xs text-slate-300">Телефон</label>
                            <input
                                type="text"
                                value={formData.phone}
                                onChange={e => updateField('phone', e.target.value)}
                                placeholder="+380..."
                                className="w-full h-8 mt-1 rounded-md bg-slate-950 border border-slate-800 px-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* 3. Параметри посади та грошового забезпечення */}
            {isAcceptance && (
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800/80 pb-2">
                        Параметри посади та грошового забезпечення
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                            <label className="text-xs text-slate-300">Відповідно до (Документ-основа)</label>
                            <input
                                type="text"
                                value={formData.accordance_to}
                                onChange={e => updateField('accordance_to', e.target.value)}
                                placeholder="наказу командира військової частини А3618 від..."
                                className="w-full h-8 mt-1 rounded-md bg-slate-950 border border-slate-800 px-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-slate-300">Тарифний розряд</label>
                            <div className="mt-1">
                                <Combobox
                                    value={formData.tariff_range}
                                    onChange={val => updateField('tariff_range', val)}
                                    options={TARIFF_RANGES}
                                    placeholder="Оберіть розряд..."
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-slate-300">Штатно-посадова категорія</label>
                            <input
                                type="text"
                                value={formData.staff_category}
                                onChange={e => updateField('staff_category', e.target.value)}
                                placeholder="сержант"
                                className="w-full h-8 mt-1 rounded-md bg-slate-950 border border-slate-800 px-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-slate-300">Дата, з якої посаду прийнято</label>
                            <input
                                type="date"
                                value={formData.acceptance_date}
                                onChange={e => updateField('acceptance_date', e.target.value)}
                                className="w-full h-8 mt-1 rounded-md bg-slate-950 border border-slate-800 px-2.5 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-slate-300">Посадовий оклад (грн)</label>
                            <input
                                type="text"
                                value={formData.salary_position}
                                onChange={e => updateField('salary_position', e.target.value)}
                                className="w-full h-8 mt-1 rounded-md bg-slate-950 border border-slate-800 px-2.5 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-slate-300">Оклад за званням (грн)</label>
                            <input
                                type="text"
                                value={formData.salary_rank}
                                onChange={e => updateField('salary_rank', e.target.value)}
                                className="w-full h-8 mt-1 rounded-md bg-slate-950 border border-slate-800 px-2.5 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-slate-300">Надбавка за особливості (%)</label>
                            <input
                                type="text"
                                value={formData.features_pct}
                                onChange={e => updateField('features_pct', e.target.value)}
                                className="w-full h-8 mt-1 rounded-md bg-slate-950 border border-slate-800 px-2.5 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-slate-300">Щомісячна премія (%)</label>
                            <input
                                type="text"
                                value={formData.premium_pct}
                                onChange={e => updateField('premium_pct', e.target.value)}
                                className="w-full h-8 mt-1 rounded-md bg-slate-950 border border-slate-800 px-2.5 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-slate-300">Вислуга (років)</label>
                            <input
                                type="number"
                                value={formData.exp_years}
                                onChange={e => updateField('exp_years', parseInt(e.target.value) || 0)}
                                className="w-full h-8 mt-1 rounded-md bg-slate-950 border border-slate-800 px-2.5 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-slate-300">Вислуга (місяців)</label>
                            <input
                                type="number"
                                value={formData.exp_months}
                                onChange={e => updateField('exp_months', parseInt(e.target.value) || 0)}
                                className="w-full h-8 mt-1 rounded-md bg-slate-950 border border-slate-800 px-2.5 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="text-xs text-slate-300">Місяць підпису (родовий відмінок)</label>
                            <input
                                type="text"
                                value={formData.current_month}
                                onChange={e => updateField('current_month', e.target.value)}
                                placeholder="червня"
                                className="w-full h-8 mt-1 rounded-md bg-slate-950 border border-slate-800 px-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* 4. Паспортні дані (Для ВЛК) */}
            {isVlk && (
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800/80 pb-2">
                        Паспортні дані (Для ВЛК)
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-slate-300">Дата народження</label>
                            <input
                                type="text"
                                placeholder="24.02.2000"
                                value={formData.bday}
                                onChange={e => updateField('bday', e.target.value)}
                                className="w-full h-8 mt-1 rounded-md bg-slate-950 border border-slate-800 px-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-300">Громадянство</label>
                            <input
                                type="text"
                                placeholder="українець"
                                value={formData.citizen}
                                onChange={e => updateField('citizen', e.target.value)}
                                className="w-full h-8 mt-1 rounded-md bg-slate-950 border border-slate-800 px-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-300">Назва ТЦК</label>
                            <input
                                type="text"
                                placeholder="Шевченківським РТЦК..."
                                value={formData.tck}
                                onChange={e => updateField('tck', e.target.value)}
                                className="w-full h-8 mt-1 rounded-md bg-slate-950 border border-slate-800 px-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-300">Час призову</label>
                            <input
                                type="text"
                                placeholder="в лютому 2025 року"
                                value={formData.draft}
                                onChange={e => updateField('draft', e.target.value)}
                                className="w-full h-8 mt-1 rounded-md bg-slate-950 border border-slate-800 px-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* 5. Деталі забезпечення */}
            {isRation && (
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Дата (Події / Зняття / Зарахування)</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={formData.rat_date}
                            onChange={e => updateField('rat_date', e.target.value)}
                            placeholder="ДД.ММ.РРРР"
                            className="flex-1 h-8 rounded-md bg-slate-950 border border-slate-800 px-2.5 text-xs text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                        />
                        <button type="button" onClick={() => setRelativeDate('rat_date', -1)} className="px-2.5 h-8 bg-slate-800 text-xs rounded text-slate-300 hover:bg-slate-700 transition">Вчора</button>
                        <button type="button" onClick={() => setRelativeDate('rat_date', 0)} className="px-2.5 h-8 bg-slate-800 text-xs rounded text-slate-300 hover:bg-slate-700 transition">Сьогодні</button>
                    </div>
                </div>
            )}

            {/* 6. Медичні дані / Додатки */}
            {isMed && (
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800/80 pb-2">
                        Медичні дані / Додатки
                    </h3>
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs text-slate-300">Заклад охорони здоров'я</label>
                            <div className="mt-1">
                                <Combobox
                                    value={formData.hospital}
                                    onChange={val => updateField('hospital', val)}
                                    options={HOSPITALS}
                                    placeholder="Оберіть або введіть..."
                                />
                            </div>
                        </div>

                        {formData.report_type === "На консультацію" && (
                            <div>
                                <label className="text-xs text-slate-300">Лікар (Куди / До кого)</label>
                                <div className="mt-1">
                                    <Combobox
                                        value={formData.doctor_specialist}
                                        onChange={val => updateField('doctor_specialist', val)}
                                        options={DOCTOR_SPECIALISTS.map(d => ({ label: d.label, value: d.caseText }))}
                                        placeholder="Оберіть лікаря або введіть..."
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="text-xs text-slate-300">Додатки (через кому)</label>
                            <input
                                type="text"
                                value={formData.attachments}
                                onChange={e => updateField('attachments', e.target.value)}
                                placeholder="Направлення, медична книжка"
                                className="w-full h-8 mt-1 rounded-md bg-slate-950 border border-slate-800 px-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* 7. Параметри відпустки */}
            {isVacation && (
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800/80 pb-2">
                        Параметри відпустки
                    </h3>
                    <div>
                        <label className="text-xs text-slate-300">Причина відпустки</label>
                        <input
                            type="text"
                            value={formData.vacation_reason}
                            onChange={e => updateField('vacation_reason', e.target.value)}
                            placeholder="у зв’язку з необхідністю надання невідкладної допомоги сім’ї у вирішенні складних побутових питань"
                            className="w-full h-8 mt-1 rounded-md bg-slate-950 border border-slate-800 px-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between text-xs text-slate-300">
                            <span>Кількість днів:</span>
                            <span className="font-bold text-blue-400 font-mono">{formatDaysUkr(formData.vacation_days_num)}</span>
                        </div>
                        <input
                            type="range"
                            min={1}
                            max={10}
                            value={formData.vacation_days_num}
                            onChange={e => updateField('vacation_days_num', parseInt(e.target.value))}
                            className="w-full accent-blue-500 cursor-pointer"
                        />
                    </div>

                    <div>
                        <label className="text-xs text-slate-300">Дата початку відпустки</label>
                        <div className="flex gap-2 mt-1">
                            <input
                                type="text"
                                value={formData.vacation_start_date}
                                onChange={e => updateField('vacation_start_date', e.target.value)}
                                placeholder="ДД.ММ.РРРР"
                                className="flex-1 h-8 rounded-md bg-slate-950 border border-slate-800 px-2.5 text-xs text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                            />
                            <button type="button" onClick={() => setRelativeDate('vacation_start_date', 0)} className="px-2.5 h-8 bg-slate-800 text-xs rounded text-slate-300 hover:bg-slate-700 transition">Сьогодні</button>
                            <button type="button" onClick={() => setRelativeDate('vacation_start_date', 1)} className="px-2.5 h-8 bg-slate-800 text-xs rounded text-slate-300 hover:bg-slate-700 transition">Завтра</button>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-slate-300">Адреса проведення відпустки</label>
                        <input
                            type="text"
                            value={formData.vacation_address}
                            onChange={e => updateField('vacation_address', e.target.value)}
                            placeholder="Львівська обл., Жовківський р-н, с. Забір'я, вул. Шевченка, 90"
                            className="w-full h-8 mt-1 rounded-md bg-slate-950 border border-slate-800 px-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                </div>
            )}

            {/* 8. Дані командирів */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800/80 pb-2">
                    Дані командирів
                </h3>

                {/* Комбат */}
                <div className="space-y-1.5">
                    <span className="text-[11px] text-slate-400 font-medium">Командир батареї (Комбат)</span>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                        <div className="md:col-span-5">
                            <Combobox
                                value={formData.bat_pref}
                                onChange={val => updateField('bat_pref', val)}
                                options={PREFIXES}
                                readOnly={true}
                            />
                        </div>
                        <div className="md:col-span-3">
                            <Combobox
                                value={formData.bat_rank}
                                onChange={val => updateField('bat_rank', val)}
                                options={RANKS}
                                placeholder="Звання"
                            />
                        </div>
                        <div className="md:col-span-4">
                            <input
                                type="text"
                                value={formData.bat_name}
                                onChange={e => updateField('bat_name', e.target.value)}
                                placeholder="Ім'я ПРІЗВИЩЕ"
                                className="w-full h-8 rounded-md bg-slate-950 border border-slate-800 px-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Комдив */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                    <span className="text-[11px] text-slate-400 font-medium">Командир дивізіону (Комдив)</span>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                        <div className="md:col-span-5">
                            <Combobox
                                value={formData.div_pref}
                                onChange={val => updateField('div_pref', val)}
                                options={PREFIXES}
                                readOnly={true}
                            />
                        </div>
                        <div className="md:col-span-3">
                            <Combobox
                                value={formData.div_rank}
                                onChange={val => updateField('div_rank', val)}
                                options={RANKS}
                                placeholder="Звання"
                            />
                        </div>
                        <div className="md:col-span-4">
                            <input
                                type="text"
                                value={formData.div_name}
                                onChange={e => updateField('div_name', e.target.value)}
                                placeholder="Ім'я ПРІЗВИЩЕ"
                                className="w-full h-8 rounded-md bg-slate-950 border border-slate-800 px-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};