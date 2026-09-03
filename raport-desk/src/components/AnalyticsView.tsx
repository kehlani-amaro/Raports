import React, { useEffect, useState } from 'react';
import { 
  BarChart3, FileText, Calendar, Clock, RefreshCw, 
  Trash2, User, Search, CheckCircle2 
} from 'lucide-react';
import { 
  getAnalyticsSummary, clearAllLogs, AnalyticsSummary 
} from '../services/analyticsService';

export const AnalyticsView: React.FC = () => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getAnalyticsSummary();
      setSummary(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleClear = async () => {
    if (confirm('Ви впевнені, що хочете очистити весь журнал сформованих рапортів?')) {
      await clearAllLogs();
      await loadData();
    }
  };

  const filteredLogs = summary?.recentLogs.filter(l => 
    l.target_person_name.toLowerCase().includes(search.toLowerCase()) ||
    l.template_title.toLowerCase().includes(search.toLowerCase()) ||
    (l.target_person_rank && l.target_person_rank.toLowerCase().includes(search.toLowerCase()))
  ) || [];

  return (
    <div className="h-full flex flex-col p-6 space-y-6 overflow-y-auto custom-scrollbar">
      {/* Шапка */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            Журнал та Статистика документообігу
          </h2>
          <p className="text-xs text-slate-400">Локальний облік усіх згенерованих рапортів дивізіону</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Оновити
          </button>
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/40 border border-rose-900/60 text-xs text-rose-300 hover:bg-rose-900/60 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Очистити журнал
          </button>
        </div>
      </div>

      {/* Метрики */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Всього сформовано</p>
            <p className="text-2xl font-bold text-slate-100 mt-1">{summary?.totalCount || 0}</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">За поточний місяць</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{summary?.monthCount || 0}</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-600/10 text-emerald-400 border border-emerald-500/20">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Згенеровано сьогодні</p>
            <p className="text-2xl font-bold text-blue-400 mt-1">{summary?.todayCount || 0}</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-600/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Структура рапортів та категорій */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* За типами рапортів */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800/80 pb-2">
            Розподіл за типами рапортів
          </h3>
          <div className="space-y-2">
            {summary?.byCategory && summary.byCategory.length > 0 ? (
              summary.byCategory.map((cat, idx) => {
                const total = summary.totalCount || 1;
                const pct = Math.round((cat.value / total) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span className="truncate pr-2">{cat.name}</span>
                      <span className="font-mono text-slate-400">{cat.value} ({pct}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                        style={{ width: `${pct}%` }} 
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-600 py-3 text-center">Дані відсутні</p>
            )}
          </div>
        </div>

        {/* За званнями */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800/80 pb-2">
            Активність за званнями
          </h3>
          <div className="space-y-2">
            {summary?.byRank && summary.byRank.length > 0 ? (
              summary.byRank.slice(0, 5).map((r, idx) => {
                const total = summary.totalCount || 1;
                const pct = Math.round((r.count / total) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span className="capitalize">{r.rank || 'Не вказано'}</span>
                      <span className="font-mono text-slate-400">{r.count}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                        style={{ width: `${pct}%` }} 
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-600 py-3 text-center">Дані відсутні</p>
            )}
          </div>
        </div>
      </div>

      {/* Журнал останніх сформованих рапортів */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3 flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Останні сформовані рапорти
          </h3>
          <div className="relative w-64">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Пошук за ПІБ або типом..."
              className="w-full h-7 rounded-md bg-slate-950 border border-slate-800 pl-7 pr-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2 top-2" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] text-slate-500 uppercase tracking-wider border-b border-slate-800 sticky top-0 bg-slate-900/90 backdrop-blur-sm">
              <tr>
                <th className="py-2 px-3">Дата та час</th>
                <th className="py-2 px-3">Військовослужбовець</th>
                <th className="py-2 px-3">Звання</th>
                <th className="py-2 px-3">Тип рапорту</th>
                <th className="py-2 px-3">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((l, i) => (
                  <tr key={l.id || i} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">
                      {l.created_at ? new Date(l.created_at).toLocaleString('uk-UA', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-200 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      {l.target_person_name}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 capitalize">
                      {l.target_person_rank || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      <span className="px-2 py-0.5 rounded-md bg-blue-950/60 border border-blue-900/40 text-blue-300 text-[11px]">
                        {l.template_title}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-900/40 text-emerald-300 text-[11px]">
                        <CheckCircle2 className="w-3 h-3" />
                        Сформовано
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-600 text-xs">
                    Записів ще немає або нічого не знайдено
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};