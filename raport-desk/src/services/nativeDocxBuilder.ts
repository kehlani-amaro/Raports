import { 
  Document, Paragraph, TextRun, AlignmentType, Table, TableRow, 
  TableCell, WidthType, BorderStyle, convertMillimetersToTwip 
} from 'docx';
import { MilitaryFormData } from '../components/MilitaryReportForm';
import { 
  POSITIONS_MAP, formatPibCustom, inflectRank, inflectPosition, 
  formatRecipientDative, getExperienceAllowancePct, formatDaysUkr 
} from './militaryDict';

function formatDateUkr(isoOrFormattedDate: string): string {
  if (!isoOrFormattedDate) return "";
  const trimmed = isoOrFormattedDate.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split('-');
    return `${d}.${m}.${y}`;
  }
  return trimmed;
}

export function buildMilitaryReportDocx(data: MilitaryFormData): Document {
  const currentYear = new Date().getFullYear();
  const t = data.report_type;

  // 1. ПІБ та відмінювання військовослужбовця
  const pNom = data.pib.trim().split(/\s+/).filter(Boolean);
  const pibUpper = pNom.length > 0
    ? pNom.map((w, i) => i === 0 ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
    : "";

  const pibGen = pNom.length > 0 ? formatPibCustom(pibUpper, 'gent') : "";
  const pibDatv = pNom.length > 0 ? formatPibCustom(pibUpper, 'datv') : "";

  // Підпис: Ім'я ПРІЗВИЩЕ (наприклад: Максим САНДІЙ)
  const sigNom = pNom.length >= 2 
    ? `${pNom[1].charAt(0).toUpperCase() + pNom[1].slice(1).toLowerCase()} ${pNom[0].toUpperCase()}` 
    : (pNom[0] || "");

  const pGenArr = pibGen.split(/\s+/).filter(Boolean);
  const sigGen = pGenArr.length >= 2 ? `${pGenArr[1]} ${pGenArr[0]}` : pibGen;

  const rankNom = data.rank ? data.rank.toLowerCase() : "";
  const rankGen = data.rank ? inflectRank(data.rank, 'gent') : "";
  const rankDatv = data.rank ? inflectRank(data.rank, 'datv') : "";

  const basePos = data.position ? (POSITIONS_MAP[data.position] || data.position) : "";
  const divSuffix = data.position === "Курсант" && data.division ? ` ${data.division}` : "";
  const posNom = basePos ? `${basePos}${divSuffix}` : "";
  const posGen = posNom ? inflectPosition(posNom, 'gent') : "";
  const posDatv = posNom ? inflectPosition(posNom, 'datv') : "";

  const docElements: (Paragraph | Table)[] = [];

  // Допоміжні функції створення абзаців (12 pt -> size 24)
  const addP = (text = "", align: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.LEFT, indent = false) => {
    return new Paragraph({
      alignment: align,
      indent: indent ? { firstLine: convertMillimetersToTwip(12.5) } : undefined,
      spacing: { line: 240, before: 0, after: 0 },
      children: text ? [new TextRun({ text, font: "Times New Roman", size: 24 })] : []
    });
  };

  // Універсальний заголовок "РАПОРТ" (50 мм відступ + 20 мм Top Margin = 70 мм від верхнього краю аркуша)
  const addReportHeader = () => {
    return new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { 
        before: convertMillimetersToTwip(50), 
        after: convertMillimetersToTwip(10), 
        line: 240 
      },
      children: [new TextRun({ text: "РАПОРТ", font: "Times New Roman", size: 24 })]
    });
  };

  // Невидима таблиця для вирівнювання підписів (звання ліворуч, Ім'я ПРІЗВИЩЕ праворуч)
  const createSignatureTable = (rankText: string, nameText: string) => {
    const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: noBorder, bottom: noBorder, left: noBorder, right: noBorder,
        insideHorizontal: noBorder, insideVertical: noBorder,
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
              children: [
                new Paragraph({
                  alignment: AlignmentType.LEFT,
                  children: [new TextRun({ text: rankText.toLowerCase(), font: "Times New Roman", size: 24 })],
                }),
              ],
            }),
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [new TextRun({ text: nameText, font: "Times New Roman", size: 24 })],
                }),
              ],
            }),
          ],
        }),
      ],
    });
  };

  // Стандартний блок підпису з датою __.__.2026
  const addFullSignatureBlock = (posText: string, rankText: string, nameText: string) => {
    docElements.push(new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 120, after: 40 },
      children: [new TextRun({ text: posText, font: "Times New Roman", size: 24 })]
    }));
    docElements.push(createSignatureTable(rankText, nameText));
    docElements.push(new Paragraph({
      spacing: { before: 40, after: 0 },
      children: [new TextRun({ text: `__.__.${currentYear}`, font: "Times New Roman", size: 24 })]
    }));
  };

  const formatCmdrName = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    return parts.length >= 2 
      ? `${parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase()} ${parts[1].toUpperCase()}` 
      : name.toUpperCase();
  };

  // --- 1. НА КОНСУЛЬТАЦІЮ / НА ГОСПІТАЛІЗАЦІЮ ---
  if (t === "На консультацію" || t === "На госпіталізацію") {
    docElements.push(addP("Командиру батареї", AlignmentType.RIGHT));
    docElements.push(addReportHeader());

    const meta = t === "На консультацію" ? "консультації" : "госпіталізації";
    const docStr = t === "На консультацію" && data.doctor_specialist ? `, ${data.doctor_specialist}` : "";

    const soldierDesc = [posGen, rankGen, pibGen].filter(Boolean).join(" ");
    const intro = soldierDesc ? `, ${soldierDesc}` : "";

    docElements.push(addP(
      `Прошу Вашого клопотання перед вищим командуванням, про скерування мене${intro} ${data.hospital}${docStr} з метою ${meta}.`.replace(/\s{2,}/g, ' '),
      AlignmentType.JUSTIFIED,
      true
    ));

    if (data.attachments && data.attachments.trim()) {
      docElements.push(addP("До рапорту додаю:", AlignmentType.LEFT, true));
      const attachList = data.attachments.split(',').map(a => a.trim()).filter(Boolean);
      attachList.forEach((att, idx) => {
        docElements.push(new Paragraph({
          indent: { left: convertMillimetersToTwip(18) },
          spacing: { line: 240, before: 0, after: 0 },
          children: [new TextRun({ text: `${idx + 1}. ${att}`, font: "Times New Roman", size: 24 })]
        }));
      });
    }

    docElements.push(addP("Слідування за межі гарнізону буду здійснювати громадським транспортом.", AlignmentType.LEFT, true));
    if (data.phone) {
      docElements.push(addP(`Оповіщення мене проводити за номером телефону: ${data.phone}.`, AlignmentType.JUSTIFIED, true));
    }
    docElements.push(addP("З правилами поводження у громадських місцях ознайомлений, по заходам безпеки проінструктований.", AlignmentType.JUSTIFIED, true));

    addFullSignatureBlock(posNom, rankNom, sigNom);

    // Клопотання командирів
    const clopTarget = [rankGen, sigGen].filter(Boolean).join(" ");
    [
      { pref: data.bat_pref, rank: data.bat_rank, name: data.bat_name, tgt: "дивізіону", base: "батареї забезпечення навчального процесу дивізіону забезпечення навчального процесу" },
      { pref: data.div_pref, rank: data.div_rank, name: data.div_name, tgt: "військової частини А3618", base: "дивізіону забезпечення навчального процесу" }
    ].forEach(c => {
      docElements.push(addP());
      docElements.push(addP(`Командиру ${c.tgt}`, AlignmentType.RIGHT));
      docElements.push(addP());
      docElements.push(addP(`Клопочу по суті рапорту ${clopTarget}.`.trim(), AlignmentType.JUSTIFIED, true));
      addFullSignatureBlock(`${c.pref} ${c.base}${divSuffix}`.trim(), c.rank, formatCmdrName(c.name));
    });
  } 

  // --- 2. ВІДПУСТКА ЗА СІМЕЙНИМИ ОБСТАВИНАМИ ---
  else if (t === "Відпустка за сімейними обставинами") {
    docElements.push(addP("Командиру батареї", AlignmentType.RIGHT));
    docElements.push(addReportHeader());

    const soldierDesc = [posDatv, rankDatv, pibDatv].filter(Boolean).join(" ");
    const intro = soldierDesc ? `, ${soldierDesc}` : "";
    const formattedDays = data.vacation_days_num ? formatDaysUkr(data.vacation_days_num) : "";
    const dateStr = data.vacation_start_date ? ` з ${data.vacation_start_date} року` : "";
    const reasonStr = data.vacation_reason && data.vacation_reason.trim()
      ? ` ${data.vacation_reason.trim()}`
      : " у зв’язку з необхідністю надання невідкладної допомоги сім’ї у вирішенні складних побутових питань";

    const textBody = `Прошу Вашого клопотання перед вищим командуванням, про надання мені${intro} відпустки за сімейними обставинами${reasonStr} терміном ${formattedDays}${dateStr}.`.replace(/\s{2,}/g, ' ');
    
    docElements.push(addP(textBody, AlignmentType.JUSTIFIED, true));
    if (data.vacation_address) {
      docElements.push(addP(`Відпустку буду проводити за адресою: ${data.vacation_address}.`, AlignmentType.JUSTIFIED, true));
    }
    if (data.phone) {
      docElements.push(addP(`Моє оповіщення проводити за номером телефону: ${data.phone}.`, AlignmentType.JUSTIFIED, true));
    }
    docElements.push(addP("З правилами поводження у громадських місцях ознайомлений, по заходам безпеки проінструктований.", AlignmentType.JUSTIFIED, true));
    docElements.push(addP("У разі службової необхідності зобов’язуюсь прибути до військової частини протягом 24-х годин.", AlignmentType.JUSTIFIED, true));

    addFullSignatureBlock(posNom, rankNom, sigNom);

    const clopTarget = [rankGen, sigGen].filter(Boolean).join(" ");
    [
      { pref: data.bat_pref, rank: data.bat_rank, name: data.bat_name, tgt: "дивізіону", base: "батареї забезпечення навчального процесу дивізіону забезпечення навчального процесу" },
      { pref: data.div_pref, rank: data.div_rank, name: data.div_name, tgt: "військової частини А3618", base: "дивізіону забезпечення навчального процесу" }
    ].forEach(c => {
      docElements.push(addP());
      docElements.push(addP(`Командиру ${c.tgt}`, AlignmentType.RIGHT));
      docElements.push(addP());
      docElements.push(addP(`Клопочу по суті рапорту ${clopTarget}.`.trim(), AlignmentType.JUSTIFIED, true));
      addFullSignatureBlock(`${c.pref} ${c.base}${divSuffix}`.trim(), c.rank, formatCmdrName(c.name));
    });
  }

  // --- 3. НА ВЛК ---
  else if (t === "На ВЛК") {
    docElements.push(addP("Командиру батареї", AlignmentType.RIGHT));
    docElements.push(addReportHeader());

    // Виправлення: після "надання мені" використовуємо давальний відмінок (Кому?)
    // "номеру обслуги взводу... солдату САНДІЮ Максиму Тарасовичу"
    const soldierDescDatv = [posDatv, rankDatv, pibDatv].filter(Boolean).join(" ");
    const introDatv = soldierDescDatv ? `, ${soldierDescDatv}` : "";

    docElements.push(addP(
      `Прошу Вашого клопотання перед вищим командуванням, про надання мені${introDatv}, направлення на військову-лікарську комісію до ${data.hospital}, згідно вимог «Положення про військово-лікарську експертизу в Збройних силах України», що затверджене Наказом Міністерства оборони України від 14 серпня 2008 року №402 з метою повторного встановлення придатності/непридатності до проходження військової служби.`.replace(/\s{2,}/g, ' '),
      AlignmentType.JUSTIFIED,
      true
    ));

    if (data.attachments && data.attachments.trim()) {
      docElements.push(addP("До рапорту додаю:", AlignmentType.LEFT, true));
      const attachList = data.attachments.split(',').map(a => a.trim()).filter(Boolean);
      attachList.forEach((att, idx) => {
        docElements.push(new Paragraph({
          indent: { left: convertMillimetersToTwip(18) },
          spacing: { line: 240, before: 0, after: 0 },
          children: [new TextRun({ text: `${idx + 1}. ${att}`, font: "Times New Roman", size: 24 })]
        }));
      });
    }

    if (rankNom || pibUpper || data.bday || data.citizen || data.tck || data.draft) {
      docElements.push(addP("Паспортні дані:", AlignmentType.LEFT, true));
      const passportParts = [
        [rankNom, pibUpper].filter(Boolean).join(" "),
        data.bday ? `дата народження ${data.bday}` : "",
        data.citizen ? `громадянство: ${data.citizen}` : "",
        (data.tck || data.draft) ? `Призваний на військову службу ${data.tck} ${data.draft}`.trim() : ""
      ].filter(Boolean).join(", ");
      docElements.push(addP(`${passportParts}.`, AlignmentType.JUSTIFIED, true));
    }

    addFullSignatureBlock(posNom, rankNom, sigNom);

    const clopTarget = [rankGen, sigGen].filter(Boolean).join(" ");
    [
      { pref: data.bat_pref, rank: data.bat_rank, name: data.bat_name, tgt: "дивізіону", base: "батареї забезпечення навчального процесу дивізіону забезпечення навчального процесу" },
      { pref: data.div_pref, rank: data.div_rank, name: data.div_name, tgt: "військової частини А3618", base: "дивізіону забезпечення навчального процесу" }
    ].forEach(c => {
      docElements.push(addP());
      docElements.push(addP(`Командиру ${c.tgt}`, AlignmentType.RIGHT));
      docElements.push(addP());
      docElements.push(addP(`Клопочу по суті рапорту ${clopTarget}.`.trim(), AlignmentType.JUSTIFIED, true));
      addFullSignatureBlock(`${c.pref} ${c.base}${divSuffix}`.trim(), c.rank, formatCmdrName(c.name));
    });
  }

  // --- 4. ПРИЙОМ ПОСАДИ (НОВИЙ ФОРМАТ) ---
  else if (t === "Прийом посади (новий формат)") {
    const expPct = getExperienceAllowancePct(data.exp_years);
    
    // Виправлення шапки адресата: "молодшому лейтенанту Роману ЗАЛУЦЬКОМУ"
    const { prefixText: batPrefixD, recipientText: batRecipientD } = formatRecipientDative(
      data.bat_pref || "Тимчасово виконуючий обов’язки командира",
      data.bat_rank || "",
      data.bat_name || ""
    );

    const headLines = [`${batPrefixD} батареї`];
    if (batRecipientD) {
      headLines.push(batRecipientD);
    }

    docElements.push(new Paragraph({
      indent: { left: convertMillimetersToTwip(75) },
      children: [new TextRun({ text: headLines.join('\n'), font: "Times New Roman", size: 24 })]
    }));

    docElements.push(addReportHeader());

    const accordStr = data.accordance_to ? `відповідно до ${data.accordance_to}` : "відповідно до наказу";
    const personStr = [rankNom, pibUpper].filter(Boolean).join(" ");
    const tariffStr = data.tariff_range ? ` згідно тарифного розряду ${data.tariff_range}` : "";
    const staffStr = data.staff_category ? `, штатно-посадова категорія «${data.staff_category}»` : "";
    
    const formattedAcceptanceDate = formatDateUkr(data.acceptance_date);
    const dateStr = formattedAcceptanceDate ? ` з ${formattedAcceptanceDate}` : "";

    // Виправлення: посада у родовому відмінку ("номера обслуги взводу...")
    const posGentText = posGen ? posGen.toLowerCase() : posNom.toLowerCase();

    docElements.push(addP(
      `Дійсним доповідаю, що ${accordStr} я, ${personStr}, справи та посаду ${posGentText} прийняв та приступив до виконання службових обов’язків за такою посадою з посадовим окладом${tariffStr}${staffStr}${dateStr}.`.replace(/\s{2,}/g, ' '),
      AlignmentType.JUSTIFIED,
      true
    ));

    docElements.push(addP(`Прошу встановити (виплачувати) мені${dateStr}:`, AlignmentType.JUSTIFIED));
    if (data.salary_position) docElements.push(addP(`Посадовий оклад у розмірі ${data.salary_position} гривень;`, AlignmentType.JUSTIFIED, true));
    if (data.salary_rank) docElements.push(addP(`Оклад за військовим званням в розмірі ${data.salary_rank} гривень;`, AlignmentType.JUSTIFIED, true));
    docElements.push(addP(`Надбавку за вислугу років в розмірі ${expPct}% відсотків посадового окладу з урахуванням окладу за військове звання;`, AlignmentType.JUSTIFIED, true));
    if (data.features_pct) docElements.push(addP(`Надбавку за особливості проходження служби в розмірі ${data.features_pct}% відсотків посадового окладу з урахуванням окладу за військове звання та надбавки за вислугу років;`, AlignmentType.JUSTIFIED, true));
    if (data.premium_pct) docElements.push(addP(`Надбавку за щомісячну премію в розмірі ${data.premium_pct}% відсотків посадового окладу.`, AlignmentType.JUSTIFIED, true));
    docElements.push(addP(`Вислуга років ${data.exp_years} років ${data.exp_months} місяців.`, AlignmentType.JUSTIFIED, true));

    // Спеціальний підпис для рапорту прийому посади з текстовим місяцем
    const monthText = data.current_month && data.current_month.trim() ? data.current_month.trim() : "червня";
    const acceptanceDateLine = `«__» ${monthText} ${currentYear} року`;

    const addAcceptanceSignatureBlock = (posText: string, rankText: string, nameText: string) => {
      docElements.push(new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 120, after: 40 },
        children: [new TextRun({ text: posText, font: "Times New Roman", size: 24 })]
      }));
      docElements.push(createSignatureTable(rankText, nameText));
      docElements.push(new Paragraph({
        spacing: { before: 40, after: 0 },
        children: [new TextRun({ text: acceptanceDateLine, font: "Times New Roman", size: 24 })]
      }));
    };

    // Підпис військовослужбовця
    addAcceptanceSignatureBlock(posNom, rankNom, sigNom);

    // Клопотання комбата до комдива
    const clopTarget = [rankGen, sigGen].filter(Boolean).join(" ");
    const { prefixText: divPrefixD, recipientText: divRecipientD } = formatRecipientDative(
      data.div_pref || "Тимчасово виконуючий обов’язки командира",
      data.div_rank || "",
      data.div_name || ""
    );

    const divHeadLines = [`${divPrefixD} дивізіону`];
    if (divRecipientD) divHeadLines.push(divRecipientD);

    docElements.push(addP());
    docElements.push(new Paragraph({
      indent: { left: convertMillimetersToTwip(75) },
      children: [new TextRun({ text: divHeadLines.join('\n'), font: "Times New Roman", size: 24 })]
    }));
    docElements.push(addP());
    docElements.push(addP(`Клопочу по суті рапорту ${clopTarget}.`.trim(), AlignmentType.JUSTIFIED, true));
    addAcceptanceSignatureBlock(
      "Тимчасово виконуючий обов’язки командира батареї забезпечення навчального процесу дивізіону забезпечення навчального процесу", 
      data.bat_rank, 
      formatCmdrName(data.bat_name)
    );

    // Клопотання комдива до командира частини
    docElements.push(addP());
    docElements.push(new Paragraph({
      indent: { left: convertMillimetersToTwip(75) },
      children: [new TextRun({ text: "Командиру військової частини А3618\nполковнику Роману ГРУЗДУ", font: "Times New Roman", size: 24 })]
    }));
    docElements.push(addP());
    docElements.push(addP(`Клопочу по суті рапорту ${clopTarget}.`.trim(), AlignmentType.JUSTIFIED, true));
    addAcceptanceSignatureBlock(
      "Тимчасово виконуючий обов’язки командира дивізіону забезпечення навчального процесу", 
      data.div_rank, 
      formatCmdrName(data.div_name)
    );
  }

  // --- 5. ЗНЯТТЯ З КОТЛА / ПОВЕРНЕННЯ З ЛІКАРНІ ---
  else {
    docElements.push(addP("Командиру дивізіону", AlignmentType.RIGHT));
    docElements.push(addReportHeader());

    const soldierDesc = [posGen, rankGen, pibGen].filter(Boolean).join(" ");
    const soldierNomDesc = [posNom.toLowerCase(), rankNom, pibUpper].filter(Boolean).join(" ");
    const dateStr = data.rat_date ? ` з ${data.rat_date}` : "";

    if (t === "Зняття з котла") {
      docElements.push(addP(
        `Прошу Вашого клопотання перед вищим командуванням про зняття з котлового забезпечення${dateStr} ${soldierDesc} у зв’язку з госпіталізацією ${data.hospital}.`.replace(/\s{2,}/g, ' '),
        AlignmentType.JUSTIFIED,
        true
      ));
    } else {
      docElements.push(addP(
        `Дійсним доповідаю, що ${soldierNomDesc} з лікарні прибув, до виконання службових обов\`язків за посадою приступив. Прошу зарахувати даного військовослужбовця на котлове забезпечення${dateStr}.`.replace(/\s{2,}/g, ' '),
        AlignmentType.JUSTIFIED,
        true
      ));
    }

    addFullSignatureBlock(`${data.bat_pref} батареї забезпечення навчального процесу дивізіону забезпечення навчального процесу${divSuffix}`.trim(), data.bat_rank, formatCmdrName(data.bat_name));

    const clopTarget = [data.bat_rank ? inflectRank(data.bat_rank, 'gent') : "", formatCmdrName(data.bat_name)].filter(Boolean).join(" ");
    [
      { pref: data.div_pref, rank: data.div_rank, name: data.div_name, tgt: "військової частини А3618", base: "дивізіону забезпечення навчального процесу" }
    ].forEach(c => {
      docElements.push(addP());
      docElements.push(addP(`Командиру ${c.tgt}`, AlignmentType.RIGHT));
      docElements.push(addP());
      docElements.push(addP(`Клопочу по суті рапорту ${clopTarget}.`.trim(), AlignmentType.JUSTIFIED, true));
      addFullSignatureBlock(`${c.pref} ${c.base}${divSuffix}`.trim(), c.rank, formatCmdrName(c.name));
    });
  }

  return new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: convertMillimetersToTwip(20),
            bottom: convertMillimetersToTwip(20),
            left: convertMillimetersToTwip(30),
            right: convertMillimetersToTwip(10),
          }
        }
      },
      children: docElements
    }]
  });
}