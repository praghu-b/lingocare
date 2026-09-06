import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { PDFParse } from "pdf-parse";
import { Curriculum, Module, Topic, Lesson } from "@/types/curriculum";

// Fallback inference dictionary for German nursing competencies
const NURSING_INFERENCE_KNOWLEDGE: Record<
  string,
  { topics: { title: string; desc: string; lessons: { title: string; desc: string }[] }[] }
> = {
  notfall: {
    topics: [
      {
        title: "Topic: Reanimation und Basismaßnahmen (BLS & AED)",
        desc: "Strukturierte Durchführung der Wiederbelebungsmaßnahmen bei Herz-Kreislauf-Stillstand nach ERC-Leitlinien.",
        lessons: [
          {
            title: "Lesson: Herzdruckmassage und Beatmung im 30:2 Rhythmus",
            desc: "Praktische Umsetzung von Thoraxkompressionen mit korrekter Drucktiefe und Frequenz.",
          },
          {
            title: "Lesson: Einsatz des automatisierten externen Defibrillators (AED)",
            desc: "Sichere Handhabung, Sicherheitsabstände und Sprachansagen im Notfallteam.",
          },
        ],
      },
      {
        title: "Topic: Atemwegsmanagement und Sauerstofftherapie",
        desc: "Sicherung der oberen Atemwege und Sauerstoffapplikation bei akuter Hypoxie.",
        lessons: [
          {
            title: "Lesson: Guedel- und Wendl-Tuben, Absaugung",
            desc: "Auswahl passender Tubusgrößen und endotracheales Absaugen unter Asepsis.",
          },
        ],
      },
    ],
  },
  pharmakologie: {
    topics: [
      {
        title: "Topic: 6-R-Regel und Medikamentensicherheit",
        desc: "Prävention von Medikationsfehlern durch strikte Einhaltung der 6-R-Prüfschritte.",
        lessons: [
          {
            title: "Lesson: Orale, subcutane und intravenöse Applikationswege",
            desc: "Besonderheiten verschiedener Verabreichungsformen und Hygieneanforderungen.",
          },
          {
            title: "Lesson: Perfusoren und Infusionspumpen bedienen",
            desc: "Einstellen von Laufraten, Bolusgaben und Alarmmanagement auf der Station.",
          },
        ],
      },
    ],
  },
  beatmung: {
    topics: [
      {
        title: "Topic: Grundlagen der Beatmungstherapie",
        desc: "Unterscheidung zwischen druck- und volumenkontrollierter Ventilation.",
        lessons: [
          {
            title: "Lesson: Tracheostomapflege und Kanülenwechsel",
            desc: "Aseptischer Verbandswechsel, Cuffdruckmessung und Kanülenreinigung.",
          },
          {
            title: "Lesson: Weaning-Prozesse und Atemmuskeltraining",
            desc: "Pflegerische Unterstützung bei der Entwöhnung vom Beatmungsgerät.",
          },
        ],
      },
    ],
  },
  palliativ: {
    topics: [
      {
        title: "Topic: Symptomkontrolle in der Palliativpflege",
        desc: "Linderung von Schmerzen, Atemnot, Übelkeit und Angst in der letzten Lebensphase.",
        lessons: [
          {
            title: "Lesson: Schmerzeinschätzung und Medikamentenpumpen",
            desc: "Erfassung der Schmerzintensität nach NRS/VRS und Betreuung von Schmerzpflastern.",
          },
          {
            title: "Lesson: Begleitung von Angehörigen und Abschiedskultur",
            desc: "Empathische Gesprächsführung, seelsorgerische Angebote und Trauerbegleitung.",
          },
        ],
      },
    ],
  },
  hygiene: {
    topics: [
      {
        title: "Topic: Infektionsprävention und Hygienepläne",
        desc: "Einhaltung der RKI-Richtlinien zur Vermeidung nosokomialer Infektionen.",
        lessons: [
          {
            title: "Lesson: Händedesinfektion nach WHO 5-Indikationen",
            desc: "Indikationen, Einwirkzeiten und Hautschutzmaßnahmen im Pflegealltag.",
          },
          {
            title: "Lesson: Isolierungsmaßnahmen bei multiresistenten Erregern (MRE)",
            desc: "Schutzkleidung, Entsorgungswege und Patiententransport bei MRSA/VRE.",
          },
        ],
      },
    ],
  },
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const customApiKey = (formData.get("customApiKey") as string | null)?.trim();

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No PDF file provided in upload request." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "The uploaded file is 0 bytes. Please upload a valid PDF document.",
        },
        { status: 400 }
      );
    }

    const effectiveApiKey = customApiKey || process.env.GEMINI_API_KEY;

    // 1. Try Gemini API first if key exists
    if (effectiveApiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: effectiveApiKey });

        const prompt = `
You are the Lead Curriculum Architect for German Nursing Vocational Education (Generalistische Pflegeausbildung & Pflegefachassistenz gemäß PflAPrV).

Analyze the attached curriculum PDF and extract/structure it into an accurate 4-tier hierarchy:
Curriculum -> Module -> Topic -> Lesson

RULES:
1. Curriculum: Title and comprehensive summary description.
2. Modules: Thematic modules (e.g., "MODULE 1 — ...").
3. Topics: Sub-units under each module.
4. Lessons: Individual educational sessions under each topic with titles and descriptions.

CRITICAL INFERENCE REQUIREMENT:
If the document is missing Topics or Lessons under any Module (or only provides high-level module outlines):
- You MUST synthesize and generate realistic, pedagogically sound German nursing topics and lessons matching German nursing standards (PflAPrV).
- Ensure clinical German terminology is accurately represented (e.g. SIS, SIS-Themenfelder, Vitalzeichen, Hygiene, Notfallmanagement, Prophylaxen, ISBAR).
- Mark any inferred item with "isInferred": true.

LONG DOCUMENT & SCALE DIRECTIVE:
The document may contain up to 20 modules with 10-15 topics each. Extract all modules and topics faithfully. Keep descriptions clear, concise (1-2 sentences), and clinically focused to stay within JSON token limits.

EDGE CASE DIRECTIVE:
If the document is completely unrelated to education, healthcare, or vocational training (e.g., an invoice, receipt, or random code): Set "unstructuredWarning" to a polite message explaining what was found and provide a best-effort structured nursing curriculum draft.

OUTPUT JSON FORMAT ONLY:
{
  "title": "Curriculum Title",
  "description": "Curriculum Description",
  "unstructuredWarning": "optional warning message",
  "modules": [
    {
      "id": "mod-1",
      "title": "Module Title",
      "description": "Module Description",
      "isInferred": false,
      "topics": [
        {
          "id": "top-1-1",
          "title": "Topic Title",
          "description": "Topic Description",
          "isInferred": false,
          "lessons": [
            {
              "id": "les-1-1-1",
              "title": "Lesson Title",
              "description": "Lesson Description",
              "isInferred": false
            }
          ]
        }
      ]
    }
  ]
}
`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            {
              role: "user",
              parts: [
                {
                  inlineData: {
                    data: buffer.toString("base64"),
                    mimeType: "application/pdf",
                  },
                },
                { text: prompt },
              ],
            },
          ],
          config: {
            responseMimeType: "application/json",
          },
        });

        const responseText = response.text || "";
        const parsedData = JSON.parse(responseText);

        if (parsedData && Array.isArray(parsedData.modules)) {
          // Normalize IDs and ensure structure
          let moduleCounter = 1;
          const sanitizedModules: Module[] = parsedData.modules.map(
            (m: any, mIdx: number) => {
              const moduleId = `mod-ai-${Date.now()}-${moduleCounter++}`;
              let topicCounter = 1;

              const sanitizedTopics: Topic[] = (m.topics || []).map(
                (t: any, tIdx: number) => {
                  const topicId = `top-ai-${Date.now()}-${mIdx + 1}-${topicCounter++}`;
                  let lessonCounter = 1;

                  const sanitizedLessons: Lesson[] = (t.lessons || []).map(
                    (l: any) => ({
                      id: `les-ai-${Date.now()}-${mIdx + 1}-${tIdx + 1}-${lessonCounter++}`,
                      title: l.title || `Lesson ${lessonCounter}`,
                      description: l.description || "",
                      isInferred: Boolean(l.isInferred),
                    })
                  );

                  return {
                    id: topicId,
                    title: t.title || `Topic ${tIdx + 1}`,
                    description: t.description || "",
                    lessons: sanitizedLessons,
                    isCollapsed: false,
                    isInferred: Boolean(t.isInferred),
                  };
                }
              );

              return {
                id: moduleId,
                title: m.title || `MODULE ${mIdx + 1}`,
                description: m.description || "",
                topics: sanitizedTopics,
                isCollapsed: false,
                isInferred: Boolean(m.isInferred),
              };
            }
          );

          const curriculum: Curriculum = {
            id: `curr-ai-${Date.now()}`,
            title: parsedData.title || file.name.replace(/\.pdf$/i, ""),
            description: parsedData.description || "",
            modules: sanitizedModules,
            source: "ai-generated",
            fileName: file.name,
            lastModified: Date.now(),
          };

          return NextResponse.json({
            success: true,
            curriculum,
            warning: parsedData.unstructuredWarning,
          });
        }
      } catch (geminiError: any) {
        console.warn("Gemini API call failed, falling back to local structural parser:", geminiError?.message || geminiError);
        // Fall through to local structural parser
      }
    }

    // 2. Intelligent Local Structural Parser (Fallback & Offline Mode)
    let extractedText = "";
    try {
      const parser = new PDFParse({ data: buffer });
      const textResult = await parser.getText();
      extractedText = textResult.text || "";
    } catch (parseErr: any) {
      console.warn("PDFParse error:", parseErr);
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No readable text found in this PDF. It appears to be an empty document or a scanned image without an OCR layer.",
        },
        { status: 400 }
      );
    }

    // Process extracted text lines
    const lines = extractedText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith("--") && !l.includes("LINGOCARE ACADEMY"));

    let curriculumTitle = "Generalistische Pflegeausbildung";
    let curriculumDesc = "Ausbildungsplan für Pflegeberufe extrahiert aus " + file.name;
    const modules: Module[] = [];

    let currentModule: Module | null = null;
    let currentTopic: Topic | null = null;
    let modCount = 1;
    let topCount = 1;
    let lesCount = 1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Detect Title at the top
      if (i < 3 && (line.toLowerCase().includes("curriculum") || line.toLowerCase().includes("ausbildung") || line.toLowerCase().includes("pflege"))) {
        curriculumTitle = line.replace(/^curriculum:\s*/i, "");
        continue;
      }

      // Check if line starts a Module
      const isModuleHeader = /^(module|modul|kapitel|block|teil)\s*([0-9ivx]+)?[:—\-]?/i.test(line);

      if (isModuleHeader) {
        if (currentTopic && currentModule) {
          currentModule.topics.push(currentTopic);
          currentTopic = null;
        }
        if (currentModule) {
          modules.push(currentModule);
        }

        const nextLine = lines[i + 1] && !/^(module|modul|topic|thema|lesson|lektion)/i.test(lines[i + 1]) ? lines[i + 1] : "";
        currentModule = {
          id: `mod-local-${Date.now()}-${modCount++}`,
          title: line,
          description: nextLine,
          topics: [],
          isCollapsed: false,
        };
        topCount = 1;
        lesCount = 1;
        continue;
      }

      // Check if line starts a Topic
      const isTopicHeader = /^(topic|thema|einheit|schwerpunkt)\s*([0-9.]+)?[:—\-]?/i.test(line);

      if (isTopicHeader && currentModule) {
        if (currentTopic) {
          currentModule.topics.push(currentTopic);
        }
        const nextLine = lines[i + 1] && !/^(module|modul|topic|thema|lesson|lektion|\-)/i.test(lines[i + 1]) ? lines[i + 1] : "";
        currentTopic = {
          id: `top-local-${Date.now()}-${topCount++}`,
          title: line,
          description: nextLine,
          lessons: [],
          isCollapsed: false,
        };
        lesCount = 1;
        continue;
      }

      // Check if line starts a Lesson
      const isLessonHeader = /^(\-|\*|•)?\s*(lesson|lektion|stunde|ue|unterrichtseinheit)\s*([0-9.]+)?[:—\-]?/i.test(line) ||
        (line.startsWith("- ") && currentTopic !== null);

      if (isLessonHeader && currentTopic) {
        const cleanedTitle = line.replace(/^(\-|\*|•)\s*/, "");
        const nextLine = lines[i + 1] && lines[i + 1].startsWith("  ") ? lines[i + 1].trim() : "";
        currentTopic.lessons.push({
          id: `les-local-${Date.now()}-${lesCount++}`,
          title: cleanedTitle,
          description: nextLine,
        });
        continue;
      }
    }

    if (currentTopic && currentModule) {
      currentModule.topics.push(currentTopic);
    }
    if (currentModule) {
      modules.push(currentModule);
    }

    // Check if document was an invoice/receipt or unrelated
    let warning: string | undefined = undefined;
    if (modules.length === 0) {
      // Document had text, but no recognizable modules
      warning = "Notice: The document did not contain a standard module hierarchy. The structural engine created a draft syllabus based on clinical nursing competencies.";
      
      // Create a default 2-module structure
      modules.push({
        id: `mod-fallback-1`,
        title: "MODULE 1 — Klinische Pflegepraxis & Grundlagen",
        description: `Extrahiert aus ${file.name}. Grundlegende pflegerische Tätigkeiten und Patientenkommunikation.`,
        isCollapsed: false,
        isInferred: true,
        topics: [
          {
            id: `top-fallback-1-1`,
            title: "Topic 1.1 — Hygiene und allgemeine Pflege",
            description: "Standardmaßnahmen zur Infektionsprävention und täglichen Körperpflege.",
            isCollapsed: false,
            isInferred: true,
            lessons: [
              {
                id: `les-fallback-1-1-1`,
                title: "Lesson 1.1.1 — Händedesinfektion und Arbeitssicherheit",
                description: "Praktische Durchführung der 5 WHO-Momente der Händehygiene.",
                isInferred: true,
              },
            ],
          },
        ],
      });
    }

    // INFERENCE STEP: If any module lacks topics or lessons, infer them based on module title!
    for (const mod of modules) {
      if (mod.topics.length === 0) {
        mod.isInferred = true;
        const lowerTitle = mod.title.toLowerCase();

        // Find matching nursing knowledge domain
        let matched = NURSING_INFERENCE_KNOWLEDGE.hygiene;
        if (lowerTitle.includes("notfall") || lowerTitle.includes("reanimation")) {
          matched = NURSING_INFERENCE_KNOWLEDGE.notfall;
        } else if (lowerTitle.includes("pharma") || lowerTitle.includes("medikament") || lowerTitle.includes("infusion")) {
          matched = NURSING_INFERENCE_KNOWLEDGE.pharmakologie;
        } else if (lowerTitle.includes("beatmung") || lowerTitle.includes("trachea")) {
          matched = NURSING_INFERENCE_KNOWLEDGE.beatmung;
        } else if (lowerTitle.includes("palliativ") || lowerTitle.includes("sterb")) {
          matched = NURSING_INFERENCE_KNOWLEDGE.palliativ;
        }

        let inferredTopIdx = 1;
        for (const t of matched.topics) {
          const newTopicId = `top-inferred-${mod.id}-${inferredTopIdx++}`;
          let inferredLesIdx = 1;
          const newLessons: Lesson[] = t.lessons.map((l) => ({
            id: `les-inferred-${newTopicId}-${inferredLesIdx++}`,
            title: l.title,
            description: l.desc,
            isInferred: true,
          }));

          mod.topics.push({
            id: newTopicId,
            title: t.title,
            description: t.desc,
            lessons: newLessons,
            isCollapsed: false,
            isInferred: true,
          });
        }
      } else {
        // Module has topics, check if topics lack lessons
        for (const top of mod.topics) {
          if (top.lessons.length === 0) {
            top.isInferred = true;
            top.lessons.push(
              {
                id: `les-inferred-${top.id}-1`,
                title: `Lesson 1 — Klinische Praxis zu ${top.title.split("—")[0].trim()}`,
                description: "Strukturierte Praxiseinheit nach dem Leitfaden für Pflegefachkräfte in Deutschland.",
                isInferred: true,
              },
              {
                id: `les-inferred-${top.id}-2`,
                title: `Lesson 2 — Dokumentation und Fachterminologie`,
                description: "Fachgerechte Eintragung im Stationsbericht und Kommunikation im Team.",
                isInferred: true,
              }
            );
          }
        }
      }
    }

    const generatedCurriculum: Curriculum = {
      id: `curr-local-${Date.now()}`,
      title: curriculumTitle,
      description: curriculumDesc,
      modules,
      source: "ai-generated",
      fileName: file.name,
      lastModified: Date.now(),
    };

    return NextResponse.json({
      success: true,
      curriculum: generatedCurriculum,
      warning,
    });
  } catch (error: any) {
    console.error("Critical API error in /api/parse-curriculum:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "An unexpected server error occurred during document parsing.",
      },
      { status: 500 }
    );
  }
}
