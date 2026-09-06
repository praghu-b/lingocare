const fs = require('fs');
const path = require('path');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

async function createSamplePdfs() {
  const publicDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // 1. Complete German Nursing Curriculum PDF
  {
    const pdfDoc = await PDFDocument.create();
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const timesBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const { height } = page.getSize();

    let y = height - 50;

    page.drawText('LINGOCARE ACADEMY - CURRICULUM SYLLABUS', {
      x: 50,
      y,
      size: 10,
      font: timesBoldFont,
      color: rgb(0.92, 0.52, 0.0), // #EC8601
    });

    y -= 30;
    page.drawText('Generalistische Pflegeausbildung & Klinisches Deutsch', {
      x: 50,
      y,
      size: 18,
      font: timesBoldFont,
      color: rgb(0.1, 0.1, 0.1),
    });

    y -= 20;
    page.drawText('Staatlicher Rahmenlehrplan fur die Pflegeberufe in Deutschland (PflAPrV)', {
      x: 50,
      y,
      size: 11,
      font: timesRomanFont,
      color: rgb(0.4, 0.4, 0.4),
    });

    y -= 35;
    page.drawText('MODULE 1: Pflegefachassistentin oder Pflegefachassistent werden', {
      x: 50,
      y,
      size: 13,
      font: timesBoldFont,
      color: rgb(0.15, 0.15, 0.15),
    });

    y -= 18;
    page.drawText('Berufsbild, ethische Richtlinien und rechtliche Grundlagen des Gesundheitssystems.', {
      x: 65,
      y,
      size: 10,
      font: timesRomanFont,
      color: rgb(0.3, 0.3, 0.3),
    });

    y -= 25;
    page.drawText('Topic 1.1: Berufliches Selbstverstandnis und Rolle im Pflegeteam', {
      x: 65,
      y,
      size: 11,
      font: timesBoldFont,
      color: rgb(0.2, 0.2, 0.2),
    });
    y -= 16;
    page.drawText('- Lesson 1.1.1: Geschichte und Gesetze der Pflege (Pflegeberufegesetz PflBRefG)', {
      x: 80,
      y,
      size: 10,
      font: timesRomanFont,
    });
    y -= 14;
    page.drawText('- Lesson 1.1.2: Schweigepflicht und Datenschutz im Krankenhaus (Paragraf 203 StGB)', {
      x: 80,
      y,
      size: 10,
      font: timesRomanFont,
    });
    y -= 14;
    page.drawText('- Lesson 1.1.3: Fachsprache Deutsch: Hierarchien und Berufsrollen auf Station', {
      x: 80,
      y,
      size: 10,
      font: timesRomanFont,
    });

    y -= 22;
    page.drawText('Topic 1.2: Hygiene, Desinfektion und Krankenhaussicherheit', {
      x: 65,
      y,
      size: 11,
      font: timesBoldFont,
      color: rgb(0.2, 0.2, 0.2),
    });
    y -= 16;
    page.drawText('- Lesson 1.2.1: Die 5 Momente der Handehygiene nach WHO-Standard', {
      x: 80,
      y,
      size: 10,
      font: timesRomanFont,
    });
    y -= 14;
    page.drawText('- Lesson 1.2.2: Personliche Schutzausrustung (PSA) und Isolierungsplane', {
      x: 80,
      y,
      size: 10,
      font: timesRomanFont,
    });

    y -= 35;
    page.drawText('MODULE 2: Pflegeprozess, SIS und Pflegedokumentation', {
      x: 50,
      y,
      size: 13,
      font: timesBoldFont,
      color: rgb(0.15, 0.15, 0.15),
    });
    y -= 18;
    page.drawText('Strukturierte Informationssammlung (SIS), Massnahmenplanung und elektronische Dokumentation.', {
      x: 65,
      y,
      size: 10,
      font: timesRomanFont,
      color: rgb(0.3, 0.3, 0.3),
    });

    y -= 25;
    page.drawText('Topic 2.1: Die 6 Themenfelder der SIS und das Erstgesprach', {
      x: 65,
      y,
      size: 11,
      font: timesBoldFont,
    });
    y -= 16;
    page.drawText('- Lesson 2.1.1: Kognitive und kommunikative Fahigkeiten beurteilen', {
      x: 80,
      y,
      size: 10,
      font: timesRomanFont,
    });
    y -= 14;
    page.drawText('- Lesson 2.1.2: Klinische Formulierungen im digitalen Pflegebericht', {
      x: 80,
      y,
      size: 10,
      font: timesRomanFont,
    });

    y -= 22;
    page.drawText('Topic 2.2: Vitalzeichenkontrolle und Monitoring', {
      x: 65,
      y,
      size: 11,
      font: timesBoldFont,
    });
    y -= 16;
    page.drawText('- Lesson 2.2.1: Blutdruck (RR), Puls, Temperatur und Sauerstoffmessung', {
      x: 80,
      y,
      size: 10,
      font: timesRomanFont,
    });
    y -= 14;
    page.drawText('- Lesson 2.2.2: Arztliche Rucksprache bei Vitalwertkrisen (ISBAR-Schema)', {
      x: 80,
      y,
      size: 10,
      font: timesRomanFont,
    });

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(path.join(publicDir, 'sample-nursing-curriculum.pdf'), pdfBytes);
    console.log('Created sample-nursing-curriculum.pdf');
  }

  // 2. Incomplete Syllabus PDF (Only Modules — tests AI inference!)
  {
    const pdfDoc = await PDFDocument.create();
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const timesBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const page = pdfDoc.addPage([595.28, 841.89]);
    const { height } = page.getSize();
    let y = height - 50;

    page.drawText('CLINICAL NURSING OUTLINE - MODULES ONLY (INCOMPLETE)', {
      x: 50,
      y,
      size: 10,
      font: timesBoldFont,
      color: rgb(0.92, 0.52, 0.0),
    });

    y -= 30;
    page.drawText('Curriculum: Intensivpflege und Notfallversorgung in Deutschland', {
      x: 50,
      y,
      size: 16,
      font: timesBoldFont,
    });

    y -= 20;
    page.drawText('Note: This document contains only Module outlines. AI must infer topics and lessons.', {
      x: 50,
      y,
      size: 10,
      font: timesRomanFont,
      color: rgb(0.5, 0.5, 0.5),
    });

    const modules = [
      {
        title: 'Modul 1: Akutes Notfallmanagement und Reanimation (BLS & ALS)',
        desc: 'Erstversorgung bei Herz-Kreislauf-Stillstand, Atemwegssicherung und Defibrillation.',
      },
      {
        title: 'Modul 2: Klinische Pharmakologie und Infusionstherapie auf der Intensivstation',
        desc: 'Katecholamine, Sedierungskonzepte, Perfusoren und sichere Medikamentengabe.',
      },
      {
        title: 'Modul 3: Beatmungstherapie und Trachealkanulen-Management',
        desc: 'Invasive und nicht-invasive Beatmung, endotracheales Absaugen und Weaning-Prozesse.',
      },
      {
        title: 'Modul 4: Palliativpflege und Angehorigengespraache im Akutbereich',
        desc: 'Schmerztherapie, psychosoziale Begleitung Sterbender und interkulturelle Kommunikation.',
      },
    ];

    for (const m of modules) {
      y -= 35;
      page.drawText(m.title, {
        x: 50,
        y,
        size: 12,
        font: timesBoldFont,
        color: rgb(0.1, 0.1, 0.1),
      });
      y -= 16;
      page.drawText(m.desc, {
        x: 65,
        y,
        size: 10,
        font: timesRomanFont,
        color: rgb(0.3, 0.3, 0.3),
      });
    }

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(path.join(publicDir, 'sample-incomplete-syllabus.pdf'), pdfBytes);
    console.log('Created sample-incomplete-syllabus.pdf');
  }

  // 3. Unrelated document (Invoice/Receipt to test edge cases)
  {
    const pdfDoc = await PDFDocument.create();
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const timesBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const page = pdfDoc.addPage([595.28, 841.89]);
    const { height } = page.getSize();
    let y = height - 50;

    page.drawText('INVOICE / RECHNUNG #INV-2026-9812', {
      x: 50,
      y,
      size: 16,
      font: timesBoldFont,
    });

    y -= 30;
    page.drawText('Medical Supplies GmbH - Berlin, Germany', {
      x: 50,
      y,
      size: 10,
      font: timesRomanFont,
    });
    y -= 16;
    page.drawText('Item 1: Nitrile Gloves (Box of 200) - 24.50 EUR', {
      x: 50,
      y,
      size: 10,
      font: timesRomanFont,
    });
    y -= 16;
    page.drawText('Item 2: Hand Sanitizer 500ml - 12.80 EUR', {
      x: 50,
      y,
      size: 10,
      font: timesRomanFont,
    });
    y -= 16;
    page.drawText('Item 3: Surgical Face Masks Type II R - 18.00 EUR', {
      x: 50,
      y,
      size: 10,
      font: timesRomanFont,
    });
    y -= 25;
    page.drawText('Total Amount: 55.30 EUR (Paid via SEPA)', {
      x: 50,
      y,
      size: 11,
      font: timesBoldFont,
    });

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(path.join(publicDir, 'sample-unrelated-document.pdf'), pdfBytes);
    console.log('Created sample-unrelated-document.pdf');
  }
}

createSamplePdfs().catch(console.error);
