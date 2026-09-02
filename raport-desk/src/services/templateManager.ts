import { parseDocxPlaceholders, ExtractedField } from './docEngine';

export interface SavedTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  raw_docx_base64: string;
  raw_docx_blob?: string;
  fields_metadata_json: string;
  fields_json?: string;
  is_built_in: number;
  created_at?: string;
}

const LOCAL_STORAGE_KEY = 'raportdesk_saved_templates';

function isTauriEnv(): boolean {
  return typeof window !== 'undefined' && (
    '__TAURI_INTERNALS__' in window ||
    '__TAURI__' in window
  );
}

async function getSafeDb() {
  if (!isTauriEnv()) return null;
  try {
    const { getDatabase } = await import('../db/database');
    const db = await getDatabase();

    // Гарантуємо створення таблиці, якщо вона ще не існує
    try {
      await db.execute(`
        CREATE TABLE IF NOT EXISTS templates (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          category TEXT DEFAULT 'Загальні',
          description TEXT DEFAULT '',
          raw_docx_blob TEXT,
          fields_metadata_json TEXT,
          is_built_in INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } catch (createErr) {
      console.warn('Table create check error:', createErr);
    }

    return db;
  } catch (err) {
    console.warn('Tauri Database unavailable, using localStorage fallback:', err);
    return null;
  }
}

// 1. Отримати всі збережені шаблони (ОБ'ЄДНУЄ SQLite та LocalStorage)
export async function getSavedTemplates(): Promise<SavedTemplate[]> {
  const resultTemplatesMap = new Map<string, SavedTemplate>();

  // А. Спочатку читаємо LocalStorage (щоб миттєво підхопити останні додані)
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const localList: SavedTemplate[] = JSON.parse(raw);
      localList.forEach(t => {
        if (t && t.id) {
          resultTemplatesMap.set(t.id, {
            ...t,
            raw_docx_base64: t.raw_docx_base64 || t.raw_docx_blob || '',
            fields_metadata_json: t.fields_metadata_json || t.fields_json || '[]',
            fields_json: t.fields_metadata_json || t.fields_json || '[]'
          });
        }
      });
    }
  } catch (e) {
    console.error('LocalStorage read error:', e);
  }

  // Б. Потім читаємо SQLite і об'єднуємо
  const db = await getSafeDb();
  if (db) {
    try {
      const rows = await db.select<any[]>(
        'SELECT * FROM templates ORDER BY created_at DESC'
      );

      (rows || []).forEach(row => {
        if (row && row.id) {
          resultTemplatesMap.set(row.id, {
            id: row.id,
            title: row.title || 'Без назви',
            category: row.category || 'Загальні',
            description: row.description || '',
            raw_docx_base64: row.raw_docx_base64 || row.raw_docx_blob || '',
            raw_docx_blob: row.raw_docx_blob || row.raw_docx_base64 || '',
            fields_metadata_json: row.fields_metadata_json || row.fields_json || '[]',
            fields_json: row.fields_metadata_json || row.fields_json || '[]',
            is_built_in: row.is_built_in ? 1 : 0,
            created_at: row.created_at || new Date().toISOString()
          });
        }
      });
    } catch (err) {
      console.warn('SQLite select error:', err);
    }
  }

  const list = Array.from(resultTemplatesMap.values());
  list.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
  return list;
}

// 2. Зберегти новий шаблон (пише ОДНОЧАСНО в LocalStorage і в SQLite)
export async function saveCustomTemplate(
  title: string,
  category: string,
  description: string,
  fileBuffer: ArrayBuffer
): Promise<SavedTemplate> {
  const id = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `tmpl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const fields: ExtractedField[] = parseDocxPlaceholders(fileBuffer);
  const fieldsJson = JSON.stringify(fields);

  // Конвертація в Base64
  const bytes = new Uint8Array(fileBuffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64Docx = window.btoa(binary);

  const newTemplate: SavedTemplate = {
    id,
    title: title.trim() || 'Новий шаблон',
    category: category || 'Загальні',
    description: description || '',
    raw_docx_base64: base64Docx,
    raw_docx_blob: base64Docx,
    fields_metadata_json: fieldsJson,
    fields_json: fieldsJson,
    is_built_in: 0,
    created_at: new Date().toISOString()
  };

  // 1. Обов'язковий запис у LocalStorage (надійне резервне джерело)
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    const current: SavedTemplate[] = raw ? JSON.parse(raw) : [];
    current.unshift(newTemplate);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
  } catch (lsErr) {
    console.warn('LocalStorage save error:', lsErr);
  }

  // 2. Запис у SQLite
  const db = await getSafeDb();
  if (db) {
    try {
      await db.execute(
        `INSERT OR REPLACE INTO templates (id, title, category, description, raw_docx_blob, fields_metadata_json, is_built_in)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [id, newTemplate.title, newTemplate.category, newTemplate.description, base64Docx, fieldsJson, 0]
      );
    } catch (err) {
      console.warn('SQLite insert error:', err);
    }
  }
  window.dispatchEvent(new CustomEvent('templates_updated'));
  return newTemplate;
}

// 3. Видалити шаблон з обох сховищ
export async function deleteTemplate(id: string): Promise<void> {
  // З LocalStorage
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const current: SavedTemplate[] = JSON.parse(raw);
      const filtered = current.filter(t => t.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
    }
  } catch (e) {
    console.error('LocalStorage delete error:', e);
  }

  // З SQLite
  const db = await getSafeDb();
  if (db) {
    try {
      await db.execute('DELETE FROM templates WHERE id = $1', [id]);
    } catch (err) {
      console.warn('SQLite delete error:', err);
    }
  }
  window.dispatchEvent(new CustomEvent('templates_updated'));
}

// 4. Конвертація Base64 у ArrayBuffer
export function base64ToArrayBuffer(base64: string): ArrayBuffer | null {
  if (!base64 || typeof base64 !== 'string') return null;
  try {
    const cleanBase64 = base64.trim();
    const binaryString = window.atob(cleanBase64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  } catch (e) {
    console.error('Помилка декодування Base64 DOCX:', e);
    return null;
  }
}