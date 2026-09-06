import { Curriculum } from "@/types/curriculum";

export const SAMPLE_NURSING_CURRICULUM: Curriculum = {
  id: "curr-sample-de-nursing",
  title: "Generalistische Pflegeausbildung & Klinische Sprachförderung",
  description: "Staatlich anerkannter Ausbildungsplan für angehende Pflegefachkräfte mit integriertem klinischem Deutschunterricht und praktischer Patientenkommunikation.",
  source: "sample",
  lastModified: Date.now(),
  modules: [
    {
      id: "mod-1",
      title: "MODULE 1 — Pflegefachassistentin oder Pflegefachassistent werden",
      description: "Einführung in das deutsche Gesundheitssystem, rechtliche Rahmenbedingungen und das berufliche Selbstverständnis.",
      isCollapsed: false,
      topics: [
        {
          id: "top-1-1",
          title: "Topic 1.1 — Berufliches Selbstverständnis & Berufsidentität",
          description: "Entwicklung einer professionellen pflegerischen Haltung und ethische Grundlagen der Pflegepraxis.",
          isCollapsed: false,
          lessons: [
            {
              id: "les-1-1-1",
              title: "Lesson 1.1.1 — Geschichte der Pflegeberufe und das Pflegeberufegesetz (PflBRefG)",
              description: "Überblick über historische Meilensteine und die gesetzlichen Grundlagen der generalistischen Pflegeausbildung."
            },
            {
              id: "les-1-1-2",
              title: "Lesson 1.1.2 — Ethische Konflikte und berufliche Schweigepflicht (§ 203 StGB)",
              description: "Umgang mit Patientendaten, Datenschutzgrundverordnung und ethischen Dilemmata im Stationsalltag."
            },
            {
              id: "les-1-1-3",
              title: "Lesson 1.1.3 — Fachsprache Deutsch: Berufsbezeichnungen und Stationsteam",
              description: "Klinische Terminologie zur Benennung interdisziplinärer Teammitglieder und hierarchischer Strukturen im Krankenhaus."
            }
          ]
        },
        {
          id: "top-1-2",
          title: "Topic 1.2 — Hygiene und Infektionsschutz im Krankenhaus",
          description: "Standardhygienemaßnahmen, Asepsis, Desinfektion und Sterilisation zur Prävention nosokomialer Infektionen.",
          isCollapsed: false,
          lessons: [
            {
              id: "les-1-2-1",
              title: "Lesson 1.2.1 — Händehygiene nach WHO-Standard (5 Indikationen)",
              description: "Korrekte Durchführung der hygienischen Händedesinfektion und Hautschutzpläne."
            },
            {
              id: "les-1-2-2",
              title: "Lesson 1.2.2 — Persönliche Schutzausrüstung (PSA) und Isolierungsmaßnahmen",
              description: "An- und Ablegen von Schutzkitteln, FFP2/FFP3-Masken und Umgang mit isolationspflichtigen Patienten (MRSA, Norovirus)."
            }
          ]
        }
      ]
    },
    {
      id: "mod-2",
      title: "MODULE 2 — Pflegeprozess und Dokumentation",
      description: "Erhebung des Pflegebedarfs nach SIS (Strukturierte Informationssammlung), Planung und digitale Pflegedokumentation.",
      isCollapsed: false,
      topics: [
        {
          id: "top-2-1",
          title: "Topic 2.1 — Die Strukturierte Informationssammlung (SIS) in 6 Themenfeldern",
          description: "Systematische Erfassung der individuellen Wünsche, kognitiven Fähigkeiten und Mobilität des Patienten.",
          isCollapsed: false,
          lessons: [
            {
              id: "les-2-1-1",
              title: "Lesson 2.1.1 — Themenfeld 1: Kognition und Kommunikation",
              description: "Einschätzung von Orientierung, Erinnerungsvermögen und Ausdrucksfähigkeit im Aufnahmegespräch."
            },
            {
              id: "les-2-1-2",
              title: "Lesson 2.1.2 — Klinische Formulierungshilfen für den Pflegebericht",
              description: "Objektive, präzise Formulierungen für Übergaben und EDV-gestützte Dokumentationssysteme."
            }
          ]
        },
        {
          id: "top-2-2",
          title: "Topic 2.2 — Vitalzeichenkontrolle und Monitoring",
          description: "Messung, Dokumentation und Beurteilung von Blutdruck, Puls, Temperatur, Atemfrequenz und Sauerstoffsättigung.",
          isCollapsed: false,
          lessons: [
            {
              id: "les-2-2-1",
              title: "Lesson 2.2.1 — Blutdruckmessung (RR) nach Riva-Rocci und Hypertonie-Klassifikation",
              description: "Auskultatorische und oszillometrische Blutdruckmessung, Normwerte und Notfallzeichen."
            },
            {
              id: "les-2-2-2",
              title: "Lesson 2.2.2 — Kommunikation bei Vitalwertentgleisungen (ISBAR-Schema)",
              description: "Strukturierte Übergabe kritischer Werte an den Stationsarzt nach dem ISBAR-Format."
            }
          ]
        }
      ]
    },
    {
      id: "mod-3",
      title: "MODULE 3 — Arzneimittellehre und Verabreichung (Pharmakologie)",
      description: "Sichere Verabreichung von Medikamenten unter Einhaltung der 6-R-Regel und fachgerechte Aufklärung.",
      isCollapsed: true,
      topics: [
        {
          id: "top-3-1",
          title: "Topic 3.1 — Die 6-R-Regel der Arzneimitteltherapie",
          description: "Richtiger Patient, Richtiges Arzneimittel, Richtige Dosierung, Richtige Applikationsform, Richtiger Zeitpunkt, Richtige Dokumentation.",
          isCollapsed: false,
          lessons: [
            {
              id: "les-3-1-1",
              title: "Lesson 3.1.1 — Orale und percutane Arzneimittelformen",
              description: "Unterscheidung zwischen Retardtabletten, Kapseln, Tropfen und transdermalen Pflastern."
            },
            {
              id: "les-3-1-2",
              title: "Lesson 3.1.2 — Fachvokabular Beipackzettel und Kontraindikationen",
              description: "Leseverständnis medizinischer Fachinformationen und Kommunikation möglicher Nebenwirkungen mit Patienten."
            }
          ]
        }
      ]
    }
  ]
};

export const EMPTY_CURRICULUM: Curriculum = {
  id: "curr-new",
  title: "Untitled Nursing Curriculum",
  description: "",
  source: "manual",
  lastModified: Date.now(),
  modules: []
};
