import React from 'react';
import { FileEdit, BarChart3, FolderGit2, UserCog, Shield } from 'lucide-react';

export type TabType = 'generator' | 'analytics' | 'templates' | 'profiles';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'generator', label: 'Генератор рапортів', icon: FileEdit },
    { id: 'analytics', label: 'Журнал та Статистика', icon: BarChart3 },
    { id: 'templates', label: 'База шаблонів', icon: FolderGit2 },
    { id: 'profiles', label: 'Профілі військових', icon: UserCog },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-4 select-none shrink-0">
      <div>
        <div className="flex items-center gap-3 px-3 py-4 mb-6 border-b border-slate-800">
          <div className="p-2 bg-blue-600 rounded-lg text-white">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-100 text-sm leading-tight">RaportDesk</h1>
            <span className="text-[11px] text-emerald-400 font-medium">Автономний режим</span>
          </div>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as TabType)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="px-3 py-3 rounded-lg bg-slate-800/40 border border-slate-800 text-[11px] text-slate-400 space-y-1">
        <div className="flex justify-between">
          <span>Сховище:</span>
          <span className="text-slate-200 font-mono">SQLite Portable</span>
        </div>
        <div className="flex justify-between">
          <span>Мережа:</span>
          <span className="text-emerald-400">Вимкнено (Air-Gap)</span>
        </div>
      </div>
    </aside>
  );
};