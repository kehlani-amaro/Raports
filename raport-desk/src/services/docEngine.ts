import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { save } from '@tauri-apps/plugin-dialog';
import { writeFile } from '@tauri-apps/plugin-fs';

export interface ExtractedField {
  key: string;
  label: string;
  type: 'text' | 'date' | 'textarea' | 'number';
}

// Парсинг тегів {{tag}} з бінарника .docx
export function parseDocxPlaceholders(buffer: ArrayBuffer): ExtractedField[] {
  const zip = new PizZip(buffer);
  const doc = new Docxtemplater(zip, {
    delimiters: { start: '{{', end: '}}' },
    paragraphLoop: true,
    linebreaks: true,
  });

  const rawText = doc.getFullText();
  const rawMatches = rawText.match(/\{\{([^{}]+)\}\}/g) || [];
  const uniqueKeys = Array.from(new Set(rawMatches.map(m => m.replace(/[{}]/g, '').trim())));

  return uniqueKeys.map(key => {
    let type: ExtractedField['type'] = 'text';
    const lowerKey = key.toLowerCase();

    if (lowerKey.includes('дата') || lowerKey.includes('date')) {
      type = 'date';
    } else if (lowerKey.includes('підстава') || lowerKey.includes('обставини') || lowerKey.includes('причина') || lowerKey.includes('суть')) {
      type = 'textarea';
    } else if (lowerKey.includes('днів') || lowerKey.includes('номер') || lowerKey.includes('кількість')) {
      type = 'number';
    }

    return {
      key,
      label: formatLabel(key),
      type,
    };
  });
}

function formatLabel(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^\w/, c => c.toUpperCase())
    .trim();
}

// Генерація буфера .docx з підставленими значеннями
export function fillDocxTemplate(buffer: ArrayBuffer, data: Record<string, any>): Uint8Array {
  const zip = new PizZip(buffer);
  const doc = new Docxtemplater(zip, {
    delimiters: { start: '{{', end: '}}' },
    paragraphLoop: true,
    linebreaks: true,
  });

  doc.render(data);

  return doc.getZip().generate({
    type: 'uint8array',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
}

// Нативне збереження файлу на диск
export async function exportDocxFile(docxUint8: Uint8Array, defaultName: string): Promise<string | null> {
  const filePath = await save({
    defaultPath: defaultName,
    filters: [{ name: 'Word Document (*.docx)', extensions: ['docx'] }],
  });

  if (filePath) {
    await writeFile(filePath, docxUint8);
    return filePath;
  }
  return null;
}