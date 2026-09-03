export interface ReportLog {
  id?: number;
  template_title: string;
  category: string;
  target_person_name: string;
  target_person_rank: string;
  target_person_unit: string;
  commander_title: string;
  status: 'GENERATED' | 'APPROVED' | 'REJECTED';
  form_payload_json?: string;
  file_path?: string;
  created_at?: string;
}

export interface AnalyticsSummary {
  totalCount: number;
  todayCount: number;
  monthCount: number;
  byCategory: { name: string; value: number }[];
  byRank: { rank: string; count: number }[];
  recentLogs: ReportLog[];
}

const LOCAL_STORAGE_KEY = 'raportdesk_logs_backup';

// Допоміжна перевірка запуску в середовищі Tauri
function isTauriEnv(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

// Отримання підключення до SQLite
async function getDb() {
  if (!isTauriEnv()) return null;
  try {
    const Database = (await import('@tauri-apps/plugin-sql')).default;
    const db = await Database.load('sqlite:raportdesk.db');
    await db.execute(`
      CREATE TABLE IF NOT EXISTS report_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        template_title TEXT NOT NULL,
        category TEXT NOT NULL,
        target_person_name TEXT NOT NULL,
        target_person_rank TEXT,
        target_person_unit TEXT,
        commander_title TEXT,
        status TEXT DEFAULT 'APPROVED',
        form_payload_json TEXT,
        file_path TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    return db;
  } catch (e) {
    console.warn('Tauri SQL plugin unavailable, using LocalStorage:', e);
    return null;
  }
}

// Запис події створення рапорту
export async function logReportGeneration(log: Omit<ReportLog, 'id' | 'created_at'>): Promise<void> {
  const db = await getDb();
  if (db) {
    try {
      await db.execute(
        `INSERT INTO report_logs (
          template_title, category, target_person_name, target_person_rank, 
          target_person_unit, commander_title, status, form_payload_json, file_path
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          log.template_title,
          log.category,
          log.target_person_name,
          log.target_person_rank || '',
          log.target_person_unit || '',
          log.commander_title || '',
          log.status || 'APPROVED',
          log.form_payload_json || '',
          log.file_path || ''
        ]
      );
      return;
    } catch (err) {
      console.error('DB Insert Error:', err);
    }
  }

  // Резервний варіант: LocalStorage
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    const logs: ReportLog[] = stored ? JSON.parse(stored) : [];
    const newEntry: ReportLog = {
      ...log,
      id: Date.now(),
      created_at: new Date().toISOString()
    };
    logs.unshift(newEntry);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(logs.slice(0, 500)));
  } catch (e) {
    console.error('LocalStorage log error:', e);
  }
}

// Отримання списку всіх рапортів
export async function getAllReportLogs(): Promise<ReportLog[]> {
  const db = await getDb();
  if (db) {
    try {
      return await db.select<ReportLog[]>(`SELECT * FROM report_logs ORDER BY created_at DESC LIMIT 200`);
    } catch (err) {
      console.error('DB Select Error:', err);
    }
  }

  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

// Отримання зведеної аналітики
export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const logs = await getAllReportLogs();
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const curMonth = now.getMonth();
  const curYear = now.getFullYear();

  let todayCount = 0;
  let monthCount = 0;
  const categoryMap: Record<string, number> = {};
  const rankMap: Record<string, number> = {};

  logs.forEach(l => {
    const d = l.created_at ? new Date(l.created_at) : new Date();
    const dStr = d.toISOString().split('T')[0];

    if (dStr === todayStr) todayCount++;
    if (d.getMonth() === curMonth && d.getFullYear() === curYear) monthCount++;

    // 1. Нормалізація категорії/шаблону
    const rawCat = (l.template_title || l.category || 'Інше').trim();
    const catDisplay = rawCat.charAt(0).toUpperCase() + rawCat.slice(1);
    categoryMap[catDisplay] = (categoryMap[catDisplay] || 0) + 1;

    // 2. Нормалізація звання (приведення до одного регістру без пробілів)
    const rawRank = (l.target_person_rank || '').trim();
    const rankDisplay = rawRank 
      ? rawRank.toLowerCase().charAt(0).toUpperCase() + rawRank.toLowerCase().slice(1)
      : 'Без звання';

    rankMap[rankDisplay] = (rankMap[rankDisplay] || 0) + 1;
  });

  const byCategory = Object.entries(categoryMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const byRank = Object.entries(rankMap)
    .map(([rank, count]) => ({ rank, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalCount: logs.length,
    todayCount,
    monthCount,
    byCategory,
    byRank,
    recentLogs: logs.slice(0, 30)
  };
}


// Очищення журналу
export async function clearAllLogs(): Promise<void> {
  const db = await getDb();
  if (db) {
    await db.execute(`DELETE FROM report_logs`);
  }
  localStorage.removeItem(LOCAL_STORAGE_KEY);
}