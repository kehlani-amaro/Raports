import Database from '@tauri-apps/plugin-sql';

let dbInstance: Database | null = null;

export async function getDatabase(): Promise<Database> {
  if (!dbInstance) {
    // Підключення до локального файлу SQLite в робочій директорії застосунку
    dbInstance = await Database.load('sqlite:raport_desk.db');
    await initTables(dbInstance);
  }
  return dbInstance;
}

async function initTables(db: Database): Promise<void> {
  // 1. Таблиця профілів / пресетів військовослужбовців
  await db.execute(`
    CREATE TABLE IF NOT EXISTS user_presets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      is_default INTEGER DEFAULT 0,
      data_json TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Таблиця користувацьких та системних шаблонів .docx
  await db.execute(`
    CREATE TABLE IF NOT EXISTS templates (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      raw_docx_blob TEXT NOT NULL,
      fields_metadata_json TEXT NOT NULL,
      is_built_in INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 3. Таблиця журналу та аналітики сформованих рапортів
  await db.execute(`
    CREATE TABLE IF NOT EXISTS report_logs (
      id TEXT PRIMARY KEY,
      template_id TEXT,
      template_title TEXT NOT NULL,
      category TEXT NOT NULL,
      target_person_name TEXT NOT NULL,
      target_person_rank TEXT,
      target_person_unit TEXT,
      commander_title TEXT,
      status TEXT DEFAULT 'APPROVED',
      form_payload_json TEXT NOT NULL,
      file_path TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Індекси для прискорення вибірок аналітики
  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_report_logs_created_at ON report_logs(created_at);
    CREATE INDEX IF NOT EXISTS idx_report_logs_category ON report_logs(category);
    CREATE INDEX IF NOT EXISTS idx_report_logs_target_person ON report_logs(target_person_name);
  `);
}