// 1. Словник посад та повних назв
export const POSITIONS_MAP: Record<string, string> = {
  "Номер обслуги": "Номер обслуги взводу забезпечення навчального процесу батареї забезпечення навчального процесу дивізіону забезпечення навчального процесу",
  "Командир міномета": "Командир міномета взводу забезпечення навчального процесу батареї забезпечення навчального процесу дивізіону забезпечення навчального процесу",
  "Навідник": "Навідник взводу забезпечення навчального процесу батареї забезпечення навчального процесу дивізіону забезпечення навчального процесу",
  "Інструктор": "Інструктор взводу забезпечення навчального процесу батареї забезпечення навчального процесу дивізіону забезпечення навчального процесу",
  "Курсант": "курсант навчального взводу навчальної батареї навчального дивізіону",
  "Прикомандирований": "Прикомандирований до взводу забезпечення навчального процесу батареї забезпечення навчального процесу дивізіону забезпечення навчального процесу",
  "Водій": "Водій взводу забезпечення навчального процесу батареї забезпечення навчального процесу дивізіону забезпечення навчального процесу",
  "Водій-номер обслуги": "Водій-номер обслуги взводу забезпечення навчального процесу батареї забезпечення навчального процесу дивізіону забезпечення навчального процесу"
};

// 2. Словники для селектів та автокомпліту
export const REPORT_TYPES = [
  "На консультацію",
  "На госпіталізацію",
  "На ВЛК",
  "Зняття з котла",
  "Повернення з лікарні",
  "Прийом посади (новий формат)",
  "Відпустка за сімейними обставинами"
];

export const RANKS = [
  "солдат", "старший солдат", "молодший сержант", "сержант", "старший сержант",
  "головний сержант", "штаб-сержант", "майстер-сержант", "молодший лейтенант",
  "лейтенант", "старший лейтенант", "капітан", "майор", "підполковник", "полковник"
];

export const DIV_TYPES = [
  "реактивної артилерії",
  "артилерійської розвідки",
  "причіпної артилерії та мінометів"
];

export const HOSPITALS = [
  "у ВМКЦ ЗР м. Львів, вул. Личаківська 26",
  "у КНП Львівської обласної ради «Львівський обласний госпіталь ветеранів війн та репресованих ім.Ю.Липи», м.Винники, вул. Івасюка 31",
  "у КАПД ВМКЦ ЗР м. Львів, вул. Пстрака буд. 6",
  "у КНП ЛОР імені Юрія Липи, Львівська обл., м. Новояворівськ, вул. Шевченка, буд. 18",
  "у КНП ЛОР “Львівський регіональний фтизіопульмонологічний клінічний лікувально-діагностичний центр” (Центр легеневого здоров’я)"
];

export const DOCTOR_SPECIALISTS = [
  { label: "Лікар-хірург", caseText: "до лікаря-хірурга" },
  { label: "Лікар-нейрохірург", caseText: "до лікаря-нейрохірурга" },
  { label: "Лікар-травматолог", caseText: "до лікаря-травматолога" },
  { label: "Лікар-невропатолог", caseText: "до лікаря-невропатолога" },
  { label: "Лікар-невролог", caseText: "до лікаря-невролога" },
  { label: "Лікар-флеболог (судинний хірург)", caseText: "до лікаря-флеболога" },
  { label: "Лікар-терапевт", caseText: "до лікаря-терапевта" },
  { label: "Лікар-офтальмолог", caseText: "до лікаря-офтальмолога" },
  { label: "Лікар-отоларинголог (ЛОР)", caseText: "до лікаря-отоларинголога" },
  { label: "Лікар-психіатр", caseText: "до лікаря-психіатра" },
  { label: "Лікар-стоматолог", caseText: "до лікаря-стоматолога" },
  { label: "Лікар-дерматовенеролог", caseText: "до лікаря-дерматовенеролога" },
  { label: "Лікар-рентгенолог", caseText: "до лікаря-рентгенолога" },
  { label: "Лікар ультразвукової діагностики (УЗД)", caseText: "до лікаря ультразвукової діагностики (УЗД)" }
];

export const SALARY_TARIFF_MAP: Record<string, string> = {
  "1": "2470", "2": "2550", "3": "2640", "4": "2730", "5": "2820",
  "6": "2910", "7": "3000", "8": "3080", "9": "3170", "10": "3260",
  "11": "3350", "12": "3440", "13": "3520", "14": "3660", "15": "3810",
  "16": "3950", "17": "4090", "18": "4230", "19": "4370", "20": "4510",
  "21": "4650", "22": "4790", "23": "4930", "24": "5070", "25": "5220",
  "26": "5360", "27": "5500", "28": "5640", "29": "5780", "30": "5920",
  "31": "6060", "32": "6200", "33": "6340", "34": "6480", "35": "6630",
  "36": "6770", "37": "6910", "38": "7050", "39": "7190", "40": "7330",
  "41": "7470", "42": "7610", "43": "7750", "44": "7890", "45": "8030",
  "46": "8180", "47": "8320", "48": "8460", "49": "8600", "50": "8740",
  "51": "8880", "52": "9020", "53": "9160", "54": "9300", "55": "9440",
  "56": "9590", "57": "9730", "58": "9870", "59": "10010", "60": "10150"
};

// 3. Функції відмінювання українською мовою
export function inflectSurname(surname: string, targetCase: 'gent' | 'datv' = 'gent'): string {
  const s = surname.trim().toUpperCase();
  if (!s) return "";

  if (s.endsWith('ІЙ')) return targetCase === 'gent' ? s.slice(0, -2) + 'ІЯ' : s.slice(0, -2) + 'ІЮ';
  if (s.endsWith('ИЙ') || s.endsWith('ЬКИЙ') || s.endsWith('СЬКИЙ') || s.endsWith('ЦЬКИЙ')) {
    return targetCase === 'gent' ? s.slice(0, -2) + 'ОГО' : s.slice(0, -2) + 'ОМУ';
  }
  if (s.endsWith('ОК')) return targetCase === 'gent' ? s.slice(0, -2) + 'КА' : s.slice(0, -2) + 'КОВІ';
  if (s.endsWith('ЕЦЬ')) return targetCase === 'gent' ? s.slice(0, -3) + 'ЦЯ' : s.slice(0, -3) + 'ЦЮ';
  if (s.endsWith('О')) {
    if (s.endsWith('ЦЬО')) return targetCase === 'gent' ? s.slice(0, -1) + 'Я' : s.slice(0, -1) + 'ЕВІ';
    return targetCase === 'gent' ? s.slice(0, -1) + 'А' : s.slice(0, -1) + 'ОВІ';
  }
  if (s.endsWith('ОВ') || s.endsWith('ЄВ') || s.endsWith('ЕВ') || s.endsWith('ИН') || s.endsWith('ІН')) {
    return targetCase === 'gent' ? s + 'А' : s + 'У';
  }
  if (s.endsWith('Ь')) return targetCase === 'gent' ? s.slice(0, -1) + 'Я' : s.slice(0, -1) + 'Ю';

  return targetCase === 'gent' ? s + 'А' : s + 'У';
}

export function formatPibCustom(fullPib: string, targetCase: 'gent' | 'datv' = 'gent'): string {
  const parts = fullPib.trim().split(/\s+/);
  if (!parts[0]) return "";

  const sur = inflectSurname(parts[0], targetCase);
  let fname = parts[1] ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1).toLowerCase() : "";
  
  if (fname) {
    if (targetCase === 'gent') {
      if (/[нрсдтвмбпфкгх]$/i.test(fname)) fname += 'а';
      else if (fname.endsWith('а')) fname = fname.slice(0, -1) + 'и';
      else if (fname.endsWith('я')) fname = fname.slice(0, -1) + 'і';
      else if (fname.endsWith('ій')) fname = fname.slice(0, -2) + 'ія';
      else if (fname.endsWith('о')) fname = fname.slice(0, -1) + 'а';
      else if (fname.endsWith('ь')) fname = fname.slice(0, -1) + 'я';
    } else {
      if (/[нрсдтвмбпфкгх]$/i.test(fname)) fname += 'у';
      else if (fname.endsWith('а')) fname = fname.slice(0, -1) + 'і';
      else if (fname.endsWith('ій')) fname = fname.slice(0, -2) + 'ію';
      else if (fname.endsWith('о')) fname = fname.slice(0, -1) + 'ові';
      else if (fname.endsWith('ь')) fname = fname.slice(0, -1) + 'ю';
    }
  }

  let pname = parts[2] ? parts[2].charAt(0).toUpperCase() + parts[2].slice(1).toLowerCase() : "";
  if (pname) {
    if (targetCase === 'gent') {
      if (pname.endsWith('ич')) pname += 'а';
      else if (pname.endsWith('вна')) pname = pname.slice(0, -1) + 'и';
    } else {
      if (pname.endsWith('ич')) pname += 'у';
      else if (pname.endsWith('вна')) pname = pname.slice(0, -1) + 'і';
    }
  }

  return `${sur} ${fname} ${pname}`.trim();
}

export function inflectRank(rankStr: string, targetCase: 'gent' | 'datv' = 'gent'): string {
  const r = rankStr.trim().toLowerCase();
  const gentMap: Record<string, string> = {
    "солдат": "солдата", "старший солдат": "старшого солдата",
    "молодший сержант": "молодшого сержанта", "сержант": "сержанта",
    "старший сержант": "старшого сержанта", "головний сержант": "головного сержанта",
    "штаб-сержант": "штаб-сержанта", "майстер-сержант": "майстра-сержанта",
    "молодший лейтенант": "молодшого лейтенанта", "лейтенант": "лейтенанта",
    "старший лейтенант": "старшого лейтенанта", "капітан": "капітана",
    "майор": "майора", "підполковник": "підполковника", "полковник": "полковника"
  };
  const datvMap: Record<string, string> = {
    "солдат": "солдату", "старший солдат": "старшому солдату",
    "молодший сержант": "молодшому сержанту", "сержант": "сержанту",
    "старший сержант": "старшому сержанту", "головний сержант": "головному сержанту",
    "штаб-сержант": "штаб-сержанту", "майстер-сержант": "майстру-сержанту",
    "молодший лейтенант": "молодшому лейтенанту", "лейтенант": "лейтенанту",
    "старший лейтенант": "старшому лейтенанту", "капітан": "капітану",
    "майор": "майору", "підполковник": "підполковнику", "полковник": "полковнику"
  };

  if (targetCase === 'gent') return gentMap[r] || r;
  if (targetCase === 'datv') return datvMap[r] || r;
  return r;
}

export function inflectPosition(posStr: string, targetCase: 'gent' | 'datv' = 'gent'): string {
  const words = posStr.trim().split(/\s+/);
  if (!words[0]) return "";
  let fWord = words[0].toLowerCase();

  if (targetCase === 'gent') {
    if (fWord === "номер") fWord = "номера";
    else if (fWord === "командир") fWord = "командира";
    else if (fWord === "водій") fWord = "водія";
    else if (fWord === "навідник") fWord = "навідника";
    else if (fWord === "інструктор") fWord = "інструктора";
    else if (fWord === "курсант") fWord = "курсанта";
    else if (fWord === "прикомандирований") fWord = "прикомандированого";
    else if (fWord === "водій-номер") fWord = "водія-номера";
  } else {
    if (fWord === "номер") fWord = "номеру";
    else if (fWord === "командир") fWord = "командиру";
    else if (fWord === "водій") fWord = "водію";
    else if (fWord === "навідник") fWord = "навіднику";
    else if (fWord === "інструктор") fWord = "інструктору";
    else if (fWord === "курсант") fWord = "курсанту";
    else if (fWord === "прикомандирований") fWord = "прикомандированому";
    else if (fWord === "водій-номер") fWord = "водію-номеру";
  }

  const rest = words.slice(1).join(" ");
  return rest ? `${fWord} ${rest}` : fWord;
}

export function getExperienceAllowancePct(years: number): number {
  if (years < 1) return 0;
  if (years >= 1 && years < 5) return 25;
  if (years >= 5 && years < 10) return 30;
  if (years >= 10 && years < 15) return 35;
  if (years >= 15 && years < 20) return 40;
  if (years >= 20 && years < 25) return 45;
  return 50;
}

export function formatDaysUkr(days: number): string {
  const numWords: Record<number, string> = {
    1: "один", 2: "два", 3: "три", 4: "чотири", 5: "п’ять",
    6: "шість", 7: "сім", 8: "вісім", 9: "дев’ять", 10: "десять"
  };
  const textWord = numWords[days] || String(days);
  const n = days % 100;
  const n1 = days % 10;

  let daysWord = "днів";
  if (n >= 11 && n <= 19) daysWord = "днів";
  else if (n1 === 1) daysWord = "день";
  else if (n1 >= 2 && n1 <= 4) daysWord = "дні";

  return `${days} (${textWord}) ${daysWord}`;
}