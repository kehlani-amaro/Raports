import { getDatabase } from '../db/database';
import { parseDocxPlaceholders, ExtractedField } from './docEngine';

export interface SavedTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  raw_docx_base64: string;
  fields_metadata_json: string;
  fields_json?: string;
  is_built_in: number;
  created_at?: string;
}

// 1. Отримати всі збережені шаблони
export async function getSavedTemplates(): Promise<SavedTemplate[]> {
  const db = await getDatabase();
  return await db.select<SavedTemplate[]>(
    'SELECT * FROM templates ORDER BY created_at DESC'
  );
}

// 2. Зберегти новий шаблон у базі
export async function saveCustomTemplate(
  title: string,
  category: string,
  description: string,
  fileBuffer: ArrayBuffer
): Promise<SavedTemplate> {
  const db = await getDatabase();
  const id = crypto.randomUUID();

  // Витягуємо змінні з файлу
  const fields: ExtractedField[] = parseDocxPlaceholders(fileBuffer);
  const fieldsJson = JSON.stringify(fields);
  
  // Конвертуємо буфер у Base64 для збереження в SQLite
  const bytes = new Uint8Array(fileBuffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64Docx = btoa(binary);

  await db.execute(
    `INSERT INTO templates (id, title, category, description, raw_docx_blob, fields_metadata_json, is_built_in)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [id, title, category, description, base64Docx, fieldsJson, 0]
  );

  return {
    id,
    title,
    category,
    description,
    raw_docx_base64: base64Docx,
    fields_metadata_json: fieldsJson,
    fields_json: fieldsJson,
    is_built_in: 0
  };
}

// 3. Видалити шаблон
export async function deleteTemplate(id: string): Promise<void> {
  const db = await getDatabase();
  await db.execute('DELETE FROM templates WHERE id = $1', [id]);
}

// Конвертація Base64 назад в ArrayBuffer для перегляду та генерації
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}