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
  "головний сержант", "штаб-сержант", "майстер-сержант", "старший майстер-сержант",
  "головний майстер-сержант", "молодший лейтенант", "лейтенант", "старший лейтенант",
  "капітан", "майор", "підполковник", "полковник"
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

// 3. Відмінювання прізвищ
export function inflectSurname(surname: string, targetCase: 'gent' | 'datv' = 'gent'): string {
  const s = surname.trim().toUpperCase();
  if (!s) return "";

  // -ІЙ (САНДІЙ -> САНДІЯ / САНДІЮ)
  if (s.endsWith('ІЙ')) {
    return targetCase === 'gent' ? s.slice(0, -2) + 'ІЯ' : s.slice(0, -2) + 'ІЮ';
  }
  // -ИЙ, -СЬКИЙ, -ЦЬКИЙ, -ОЙ (ЗАЛУЦЬКИЙ -> ЗАЛУЦЬКОГО / ЗАЛУЦЬКОМУ)
  if (s.endsWith('ИЙ') || s.endsWith('ЬКИЙ') || s.endsWith('СЬКИЙ') || s.endsWith('ЦЬКИЙ') || s.endsWith('ОЙ')) {
    return targetCase === 'gent' ? s.slice(0, -2) + 'ОГО' : s.slice(0, -2) + 'ОМУ';
  }
  if (s.endsWith('ОК')) {
    return targetCase === 'gent' ? s.slice(0, -2) + 'КА' : s.slice(0, -2) + 'КОВІ';
  }
  if (s.endsWith('ЕЦЬ')) {
    return targetCase === 'gent' ? s.slice(0, -3) + 'ЦЯ' : s.slice(0, -3) + 'ЦЮ';
  }
  // -ЦЬО (МИХАНЦЬО -> МИХАНЦЯ / МИХАНЦЮ)
  if (s.endsWith('ЦЬО')) {
    return targetCase === 'gent' ? s.slice(0, -3) + 'ЦЯ' : s.slice(0, -3) + 'ЦЮ';
  }
  // -КО
  if (s.endsWith('КО')) {
    return targetCase === 'gent' ? s.slice(0, -1) + 'А' : s.slice(0, -1) + 'У';
  }
  if (s.endsWith('О')) {
    return targetCase === 'gent' ? s.slice(0, -1) + 'А' : s.slice(0, -1) + 'ОВІ';
  }
  if (/(ОВ|ЄВ|ЕВ|ИН|ІН|ЇН)$/.test(s)) {
    return targetCase === 'gent' ? s + 'А' : s + 'У';
  }
  if (s.endsWith('Ь')) {
    return targetCase === 'gent' ? s.slice(0, -1) + 'Я' : s.slice(0, -1) + 'Ю';
  }

  return targetCase === 'gent' ? s + 'А' : s + 'У';
}

function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function formatFirstName(name: string, targetCase: 'gent' | 'datv' = 'gent'): string {
  const clean = name.trim();
  if (!clean) return "";
  const lower = clean.toLowerCase();

  if (targetCase === 'gent') {
    if (/[нрсдтвмбпфкгхжчшщ]$/.test(lower)) return capitalize(lower + 'а');
    if (lower.endsWith('й')) return capitalize(lower.slice(0, -1) + 'я');
    if (lower.endsWith('ь')) return capitalize(lower.slice(0, -1) + 'я');
    if (lower.endsWith('о')) return capitalize(lower.slice(0, -1) + 'а');
    if (lower.endsWith('а')) return capitalize(lower.slice(0, -1) + 'и');
    if (lower.endsWith('я')) return capitalize(lower.slice(0, -1) + 'і');
  } else {
    // Давальний (Кому?)
    if (lower.endsWith('й')) return capitalize(lower.slice(0, -1) + 'ю'); // Сергій -> Сергію
    if (lower.endsWith('ь')) return capitalize(lower.slice(0, -1) + 'ю'); // Ігор -> Ігорю
    if (lower.endsWith('о')) return capitalize(lower.slice(0, -1) + 'у'); // Петро -> Петру, Михайло -> Михайлу
    if (lower.endsWith('а')) return capitalize(lower.slice(0, -1) + 'і'); // Микола -> Миколі
    if (lower.endsWith('я')) return capitalize(lower.slice(0, -1) + 'і'); // Ілля -> Іллі
    if (/[нрсдтвмбпфкгхжчшщ]$/.test(lower)) return capitalize(lower + 'у'); // Роман -> Роману, Максим -> Максиму
  }

  return capitalize(clean);
}

export function formatPatronymic(patronymic: string, targetCase: 'gent' | 'datv' = 'gent'): string {
  const clean = patronymic.trim();
  if (!clean) return "";
  const lower = clean.toLowerCase();

  if (targetCase === 'gent') {
    if (lower.endsWith('ич')) return capitalize(lower + 'а');
    if (lower.endsWith('на')) return capitalize(lower.slice(0, -1) + 'и');
  } else {
    if (lower.endsWith('ич')) return capitalize(lower + 'у');
    if (lower.endsWith('на')) return capitalize(lower.slice(0, -1) + 'і');
  }

  return capitalize(clean);
}

// 4. Повний ПІБ військовослужбовця: "САНДІЙ Максим Тарасович"
export function formatPibCustom(fullPib: string, targetCase: 'gent' | 'datv' = 'gent'): string {
  const parts = fullPib.trim().split(/\s+/);
  if (!parts[0]) return "";

  const sur = inflectSurname(parts[0], targetCase);
  const fname = parts[1] ? formatFirstName(parts[1], targetCase) : "";
  const pname = parts[2] ? formatPatronymic(parts[2], targetCase) : "";

  return [sur, fname, pname].filter(Boolean).join(" ");
}

// 5. Відмінювання військових звань
export function inflectRank(rankStr: string, targetCase: 'gent' | 'datv' = 'gent'): string {
  const r = rankStr.trim().toLowerCase();
  const gentMap: Record<string, string> = {
    "солдат": "солдата",
    "старший солдат": "старшого солдата",
    "молодший сержант": "молодшого сержанта",
    "сержант": "сержанта",
    "старший сержант": "старшого сержанта",
    "головний сержант": "головного сержанта",
    "штаб-сержант": "штаб-сержанта",
    "майстер-сержант": "майстра-сержанта",
    "старший майстер-сержант": "старшого майстра-сержанта",
    "головний майстер-сержант": "головного майстра-сержанта",
    "молодший лейтенант": "молодшого лейтенанта",
    "лейтенант": "лейтенанта",
    "старший лейтенант": "старшого лейтенанта",
    "капітан": "капітана",
    "майор": "майора",
    "підполковник": "підполковника",
    "полковник": "полковника"
  };

  const datvMap: Record<string, string> = {
    "солдат": "солдату",
    "старший солдат": "старшому солдату",
    "молодший сержант": "молодшому сержанту",
    "сержант": "сержанту",
    "старший сержант": "старшому сержанту",
    "головний сержант": "головному сержанту",
    "штаб-сержант": "штаб-сержанту",
    "майстер-сержант": "майстру-сержанту",
    "старший майстер-сержант": "старшому майстру-сержанту",
    "головний майстер-сержант": "головному майстру-сержанту",
    "молодший лейтенант": "молодшому лейтенанту",
    "лейтенант": "лейтенанту",
    "старший лейтенант": "старшому лейтенанту",
    "капітан": "капітану",
    "майор": "майору",
    "підполковник": "підполковнику",
    "полковник": "полковнику"
  };

  if (targetCase === 'gent') return gentMap[r] || r;
  if (targetCase === 'datv') return datvMap[r] || r;
  return r;
}

// 6. Відмінювання посад (Родовий gent, Давальний datv, Орудний inst)
export function inflectPosition(posStr: string, targetCase: 'gent' | 'datv' | 'inst' = 'gent'): string {
  const clean = posStr.trim();
  if (!clean) return "";

  const words = clean.split(/\s+/);
  let fWord = words[0].toLowerCase();

  if (targetCase === 'gent') {
    // Кого / Чого? ("справи та посаду номера обслуги")
    if (fWord === "номер") fWord = "номера";
    else if (fWord === "командир") fWord = "командира";
    else if (fWord === "водій") fWord = "водія";
    else if (fWord === "навідник") fWord = "навідника";
    else if (fWord === "інструктор") fWord = "інструктора";
    else if (fWord === "курсант") fWord = "курсанта";
    else if (fWord === "прикомандирований") fWord = "прикомандированого";
    else if (fWord === "водій-номер") fWord = "водія-номера";
    else if (fWord === "стрілець") fWord = "стрільця";
    else if (fWord === "старший") fWord = "старшого";
  } else if (targetCase === 'datv') {
    // Кому / Чому? ("надання мені, номеру обслуги...")
    if (fWord === "номер") fWord = "номеру";
    else if (fWord === "командир") fWord = "командиру";
    else if (fWord === "водій") fWord = "водію";
    else if (fWord === "навідник") fWord = "навіднику";
    else if (fWord === "інструктор") fWord = "інструктору";
    else if (fWord === "курсант") fWord = "курсанту";
    else if (fWord === "прикомандирований") fWord = "прикомандированому";
    else if (fWord === "водій-номер") fWord = "водію-номеру";
    else if (fWord === "стрілець") fWord = "стрільцю";
    else if (fWord === "старший") fWord = "старшому";
  } else if (targetCase === 'inst') {
    if (fWord === "номер") fWord = "номером";
    else if (fWord === "командир") fWord = "командиром";
    else if (fWord === "водій") fWord = "водієм";
    else if (fWord === "навідник") fWord = "навідником";
    else if (fWord === "інструктор") fWord = "інструктором";
    else if (fWord === "курсант") fWord = "курсантом";
    else if (fWord === "прикомандирований") fWord = "прикомандированим";
    else if (fWord === "водій-номер") fWord = "водієм-номером";
    else if (fWord === "стрілець") fWord = "стрільцем";
    else if (fWord === "старший") fWord = "старшим";
  }

  const rest = words.slice(1).join(" ");
  return rest ? `${fWord} ${rest}` : fWord;
}

// 7. Форматування адресата "Кому"
// Результат: "молодшому лейтенанту Роману ЗАЛУЦЬКОМУ"
export function formatRecipientDative(prefix: string, rank: string, rawFullName: string): { prefixText: string; recipientText: string } {
  const parts = rawFullName.trim().split(/\s+/);
  let firstName = "";
  let lastName = "";

  if (parts.length === 1) {
    lastName = parts[0];
  } else if (parts.length >= 2) {
    // Якщо ввели: "ЗАЛУЦЬКИЙ Роман"
    if (parts[0] === parts[0].toUpperCase() && parts[1] !== parts[1].toUpperCase()) {
      lastName = parts[0];
      firstName = parts[1];
    } else {
      // "Роман ЗАЛУЦЬКИЙ" або "Роман Залуцький"
      firstName = parts[0];
      lastName = parts.slice(1).join(" ");
    }
  }

  const dativeRank = inflectRank(rank, 'datv');
  const dativeFirstName = firstName ? formatFirstName(firstName, 'datv') : "";
  const dativeLastName = lastName ? inflectSurname(lastName, 'datv').toUpperCase() : "";

  let dativePrefix = prefix.trim();
  if (/^тимчасово\s+виконуючий/i.test(dativePrefix)) {
    dativePrefix = "Тимчасово виконуючому обов’язки командира";
  } else if (/^командир/i.test(dativePrefix)) {
    dativePrefix = "Командиру";
  }

  const recipientLine = [dativeRank, dativeFirstName, dativeLastName].filter(Boolean).join(" ");

  return {
    prefixText: dativePrefix,
    recipientText: recipientLine
  };
}

// 8. Вислуга років
export function getExperienceAllowancePct(years: number): number {
  if (years < 1) return 0;
  if (years >= 1 && years < 5) return 25;
  if (years >= 5 && years < 10) return 30;
  if (years >= 10 && years < 15) return 35;
  if (years >= 15 && years < 20) return 40;
  if (years >= 20 && years < 25) return 45;
  return 50;
}

// 9. Форматування днів
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