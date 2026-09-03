import * as XLSX from 'xlsx';
import { MilitaryProfile, getAllProfiles, replaceAllProfiles, MilitaryStatus } from './profilesService';
import { SALARY_TARIFF_MAP } from './militaryDict';

function colLetterToIndex(col: string): number {
  let index = 0;
  const clean = col.trim().toUpperCase();
  for (let i = 0; i < clean.length; i++) {
    index = index * 26 + (clean.charCodeAt(i) - 64);
  }
  return index - 1;
}

function cleanCell(val: any): string {
  if (val === undefined || val === null) return '';
  const s = String(val).trim();
  if (s === '-' || s === '—' || s === 'null' || s === 'undefined') return '';
  return s;
}

function normalizePib(pib: string): string {
  return pib.trim().toLowerCase().replace(/\s+/g, ' ');
}

function parseExcelDate(val: any): string {
  if (!val) return '';
  
  if (typeof val === 'number') {
    const d = XLSX.SSF.parse_date_code(val);
    if (d && d.y && d.m && d.d) {
      const day = String(d.d).padStart(2, '0');
      const month = String(d.m).padStart(2, '0');
      return `${day}.${month}.${d.y}`;
    }
  }

  let str = String(val).trim();
  if (!str || str === '-' || str === '—') return '';

  str = str.split(' ')[0].split('T')[0];

  if (/^\d{4}[-./]\d{1,2}[-./]\d{1,2}$/.test(str)) {
    const [y, m, d] = str.split(/[-./]/);
    return `${d.padStart(2, '0')}.${m.padStart(2, '0')}.${y}`;
  }

  if (/^\d{1,2}[-./]\d{1,2}[-./]\d{4}$/.test(str)) {
    const [d, m, y] = str.split(/[-./]/);
    return `${d.padStart(2, '0')}.${m.padStart(2, '0')}.${y}`;
  }

  return str;
}

function parseIntSafe(val: any): number {
  if (!val) return 0;
  const n = parseInt(String(val).replace(/\D/g, ''), 10);
  return isNaN(n) ? 0 : n;
}

export interface EzhoosImportResult {
  totalRows: number;
  addedCount: number;
  updatedCount: number;
  deletedCount: number;
  skippedCount: number;
}

export async function importProfilesFromEzhoos(fileBuffer: ArrayBuffer): Promise<EzhoosImportResult> {
  const workbook = XLSX.read(fileBuffer, { type: 'array' });
  
  const sheetNames = workbook.SheetNames;
  const targetSheetName = sheetNames.find(n => 
    /шпо|оос|особов|персонал|список|штат/i.test(n)
  ) || sheetNames[sheetNames.length - 1];

  const sheet = workbook.Sheets[targetSheetName];
  if (!sheet) {
    throw new Error('Не знайдено робочого аркуша «1. ШПО» для імпорту.');
  }

  const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  if (rows.length < 5) {
    throw new Error('Аркуш не містить необхідної кількості рядків.');
  }

  // Карта колонок з файлу ЕЖООС (1. ШПО)
  const C = {
    posIndex: colLetterToIndex('B'),            // Індекс посади
    position: colLetterToIndex('C'),            // Посада
    staffCategory: colLetterToIndex('D'),       // ШПК
    vos: colLetterToIndex('E'),                 // ВОС
    tariff: colLetterToIndex('F'),              // Тариф
    rank: colLetterToIndex('H'),                // Звання
    pib: colLetterToIndex('I'),                 // ПРІЗВИЩЕ (за наявності) Ім'я По батькові
    division: colLetterToIndex('J'),            // Підрозділ
    serviceType: colLetterToIndex('K'),         // Вид служ.
    acceptanceDate: colLetterToIndex('M'),      // Дата прийняття справ та посади
    arrivalDate: colLetterToIndex('N'),         // Фактичне прибуття
    rankOrder: colLetterToIndex('T'),           // Наказ присвоєння військового звання
    rankOrderDate: colLetterToIndex('U'),       // Коли було присвоєне військове звання
    militaryId: colLetterToIndex('V'),          // Серія, номер військового квитка
    appointOrder: colLetterToIndex('W'),        // Наказ на призначення
    appointOrderNum: colLetterToIndex('X'),     // Номер Наказу
    appointOrderDate: colLetterToIndex('Y'),    // Дата Наказу
    contractEndDate: colLetterToIndex('AA'),    // Дата закінчення контракту
    bday: colLetterToIndex('AD'),               // Дата народження
    birthPlace: colLetterToIndex('AE'),         // Місце народження
    fullYears: colLetterToIndex('AF'),          // Повних років
    shortPib: colLetterToIndex('AJ'),           // Коротке ПІБ
    expYears: colLetterToIndex('AK'),           // Вислуга РОКИ
    expMonths: colLetterToIndex('AL'),          // Вислуга МІСЯЦІ
    expDays: colLetterToIndex('AM'),            // Вислуга ДНІ
    ubdStatus: colLetterToIndex('AN'),          // Участь БД
    ubdPeriod: colLetterToIndex('AP'),          // Період УБД
    maritalStatus: colLetterToIndex('AQ'),      // Сімейний стан
    contactPerson: colLetterToIndex('AR'),      // Контактна особа
    education: colLetterToIndex('AS'),          // Освіта
    educationDegree: colLetterToIndex('AT'),    // Ступінь Освіти
    ipn: colLetterToIndex('AU'),                // ІПН
    fitnessVlk: colLetterToIndex('AV'),         // Придатність до військової служби
    vlkCert: colLetterToIndex('AW'),            // Довідка ВЛК
    vlkDate: colLetterToIndex('AX'),            // Дата Довідки ВЛК
    tck: colLetterToIndex('AY'),                // Яким РТЦК та СП призваний
    arrivedFrom: colLetterToIndex('AZ'),        // Звідки прибув
    phone: colLetterToIndex('BA'),              // Номер телефону
    gender: colLetterToIndex('BC'),             // стать
    registrationAddress: colLetterToIndex('BD'),// Прописка
    fullPosition: colLetterToIndex('BE')        // Повна назва посади
  };

  const existingProfiles = await getAllProfiles();
  const existingMap = new Map<string, MilitaryProfile>();
  existingProfiles.forEach(p => existingMap.set(normalizePib(p.pib), p));

  const now = new Date().toISOString();
  const syncedProfiles: MilitaryProfile[] = [];
  const processedPibSet = new Set<string>();

  let addedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  // Зчитуємо дані з файлу
  for (let i = 5; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    const pibRaw = cleanCell(row[C.pib]);

    // Пропуск порожніх, вакантів та підсумків
    if (
      !pibRaw || 
      pibRaw.length < 4 || 
      /^(1вакант|вакант|вакансія|вакантна|разом|всього|підсумок|начальник|командир|т\.в\.о|№|п\/п|до\s+\d+)/i.test(pibRaw.trim())
    ) {
      skippedCount++;
      continue;
    }

    const pibKey = normalizePib(pibRaw);
    
    // Запобігаємо випадковим повторам однакового бійця в межах одного файлу
    if (processedPibSet.has(pibKey)) {
      continue;
    }
    processedPibSet.add(pibKey);

    const rankRaw = cleanCell(row[C.rank]);
    const posRaw = cleanCell(row[C.position]);
    const fullPosRaw = cleanCell(row[C.fullPosition]);
    const posIndexRaw = cleanCell(row[C.posIndex]);
    const vosRaw = cleanCell(row[C.vos]);
    const staffCatRaw = cleanCell(row[C.staffCategory]);
    const tariffRaw = cleanCell(row[C.tariff]);
    const divRaw = cleanCell(row[C.division]);
    const serviceTypeRaw = cleanCell(row[C.serviceType]);
    const phoneRaw = cleanCell(row[C.phone]);
    const bdayRaw = parseExcelDate(row[C.bday]);
    const birthPlaceRaw = cleanCell(row[C.birthPlace]);
    const fullYearsRaw = cleanCell(row[C.fullYears]);
    const tckRaw = cleanCell(row[C.tck]);
    const arrivedFromRaw = cleanCell(row[C.arrivedFrom]);
    
    // Дати, накази та квитки
    const acceptanceDateRaw = parseExcelDate(row[C.acceptanceDate]);
    const arrivalDateRaw = parseExcelDate(row[C.arrivalDate]);
    const rankOrderRaw = cleanCell(row[C.rankOrder]);
    const rankOrderDateRaw = parseExcelDate(row[C.rankOrderDate]);
    const militaryIdRaw = cleanCell(row[C.militaryId]);
    const appointOrderRaw = cleanCell(row[C.appointOrder]);
    const appointOrderNumRaw = cleanCell(row[C.appointOrderNum]);
    const appointOrderDateRaw = parseExcelDate(row[C.appointOrderDate]);
    const contractEndDateRaw = parseExcelDate(row[C.contractEndDate]);

    // Вислуга
    const expYearsRaw = parseIntSafe(row[C.expYears]);
    const expMonthsRaw = parseIntSafe(row[C.expMonths]);
    const expDaysRaw = parseIntSafe(row[C.expDays]);

    // ВЛК, УБД та соц. поля
    const ubdStatusRaw = cleanCell(row[C.ubdStatus]);
    const ubdPeriodRaw = cleanCell(row[C.ubdPeriod]);
    const ipnRaw = cleanCell(row[C.ipn]);
    const fitnessVlkRaw = cleanCell(row[C.fitnessVlk]);
    const vlkCertRaw = cleanCell(row[C.vlkCert]);
    const vlkDateRaw = parseExcelDate(row[C.vlkDate]);
    const maritalStatusRaw = cleanCell(row[C.maritalStatus]);
    const contactPersonRaw = cleanCell(row[C.contactPerson]);
    const educationRaw = cleanCell(row[C.education]);
    const educationDegreeRaw = cleanCell(row[C.educationDegree]);
    const genderRaw = cleanCell(row[C.gender]);
    const regAddressRaw = cleanCell(row[C.registrationAddress]);

    const tariffKey = tariffRaw.replace(/\D/g, '');
    const autoSalaryPos = tariffKey && SALARY_TARIFF_MAP[tariffKey] ? SALARY_TARIFF_MAP[tariffKey] : '';

    const existing = existingMap.get(pibKey);

    if (existing) {
      // ОНОВЛЕННЯ ІСНУЮЧОГО (зберігаємо статус та створений id)
      const updatedProfile: MilitaryProfile = {
        ...existing,
        pib: pibRaw,
        short_pib: cleanCell(row[C.shortPib]) || existing.short_pib || '',
        rank: rankRaw || existing.rank || '',
        position: posRaw || existing.position || '',
        full_position: fullPosRaw || existing.full_position || '',
        position_index: posIndexRaw || existing.position_index || '',
        vos: vosRaw || existing.vos || '',
        division: divRaw || existing.division || '',
        service_type: serviceTypeRaw || existing.service_type || '',
        phone: phoneRaw || existing.phone || '',
        bday: bdayRaw || existing.bday || '',
        birth_place: birthPlaceRaw || existing.birth_place || '',
        full_years: fullYearsRaw || existing.full_years || '',
        tck: tckRaw || existing.tck || '',
        arrived_from: arrivedFromRaw || existing.arrived_from || '',
        tariff_range: tariffKey || tariffRaw || existing.tariff_range || '',
        staff_category: staffCatRaw || existing.staff_category || '',
        salary_position: autoSalaryPos || existing.salary_position || '',
        acceptance_date: acceptanceDateRaw || existing.acceptance_date || '',
        arrival_date: arrivalDateRaw || existing.arrival_date || '',
        rank_order: rankOrderRaw || existing.rank_order || '',
        rank_order_date: rankOrderDateRaw || existing.rank_order_date || '',
        military_id_card: militaryIdRaw || existing.military_id_card || '',
        appointment_order: appointOrderRaw || existing.appointment_order || '',
        appointment_order_num: appointOrderNumRaw || existing.appointment_order_num || '',
        appointment_order_date: appointOrderDateRaw || existing.appointment_order_date || '',
        contract_end_date: contractEndDateRaw || existing.contract_end_date || '',
        exp_years: expYearsRaw || existing.exp_years || 0,
        exp_months: expMonthsRaw || existing.exp_months || 0,
        exp_days: expDaysRaw || existing.exp_days || 0,
        ubd_status: ubdStatusRaw || existing.ubd_status || '',
        ubd_period: ubdPeriodRaw || existing.ubd_period || '',
        ipn: ipnRaw || existing.ipn || '',
        fitness_vlk: fitnessVlkRaw || existing.fitness_vlk || '',
        vlk_certificate: vlkCertRaw || existing.vlk_certificate || '',
        vlk_date: vlkDateRaw || existing.vlk_date || '',
        marital_status: maritalStatusRaw || existing.marital_status || '',
        contact_person: contactPersonRaw || existing.contact_person || '',
        education: educationRaw || existing.education || '',
        education_degree: educationDegreeRaw || existing.education_degree || '',
        gender: genderRaw || existing.gender || '',
        registration_address: regAddressRaw || existing.registration_address || '',
        vacation_address: regAddressRaw || existing.vacation_address || '',
        updated_at: now
      };

      syncedProfiles.push(updatedProfile);
      updatedCount++;
    } else {
      // СТВОРЕННЯ НОВОГО ПРОФІЛЮ
      const newProfile: MilitaryProfile = {
        id: `prof_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        pib: pibRaw,
        short_pib: cleanCell(row[C.shortPib]) || '',
        status: 'active',
        rank: rankRaw || '',
        position: posRaw || '',
        full_position: fullPosRaw || '',
        position_index: posIndexRaw || '',
        vos: vosRaw || '',
        division: divRaw || '',
        service_type: serviceTypeRaw || '',
        phone: phoneRaw || '',
        bday: bdayRaw || '',
        birth_place: birthPlaceRaw || '',
        full_years: fullYearsRaw || '',
        citizen: 'українець',
        tck: tckRaw || '',
        arrived_from: arrivedFromRaw || '',
        tariff_range: tariffKey || tariffRaw || '',
        staff_category: staffCatRaw || '',
        salary_position: autoSalaryPos || '',
        acceptance_date: acceptanceDateRaw || '',
        arrival_date: arrivalDateRaw || '',
        rank_order: rankOrderRaw || '',
        rank_order_date: rankOrderDateRaw || '',
        military_id_card: militaryIdRaw || '',
        appointment_order: appointOrderRaw || '',
        appointment_order_num: appointOrderNumRaw || '',
        appointment_order_date: appointOrderDateRaw || '',
        contract_end_date: contractEndDateRaw || '',
        exp_years: expYearsRaw || 0,
        exp_months: expMonthsRaw || 0,
        exp_days: expDaysRaw || 0,
        ubd_status: ubdStatusRaw || '',
        ubd_period: ubdPeriodRaw || '',
        ipn: ipnRaw || '',
        fitness_vlk: fitnessVlkRaw || '',
        vlk_certificate: vlkCertRaw || '',
        vlk_date: vlkDateRaw || '',
        marital_status: maritalStatusRaw || '',
        contact_person: contactPersonRaw || '',
        education: educationRaw || '',
        education_degree: educationDegreeRaw || '',
        gender: genderRaw || '',
        registration_address: regAddressRaw || '',
        vacation_address: regAddressRaw || '',
        updated_at: now
      };

      syncedProfiles.push(newProfile);
      addedCount++;
    }
  }

  // Кількість видалених (ті, хто був у базі, але відсутній у новому файлі ЕЖООС)
  const deletedCount = Math.max(0, existingProfiles.length - (syncedProfiles.length - addedCount));

  // ПОВНА ЗАМІНА БАЗИ АКТУАЛЬНИМ СПИСКОМ
  await replaceAllProfiles(syncedProfiles);

  return {
    totalRows: rows.length - 5,
    addedCount,
    updatedCount,
    deletedCount,
    skippedCount
  };
}