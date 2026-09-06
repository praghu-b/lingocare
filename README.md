# Lingocare — Curriculum Creation Engine

> An AI-native curriculum structuring engine built for German nursing vocational education (*Pflegeausbildung*).

Built as part of the Technical Task for the **Full Stack Developer Intern** position at **Lingocare**.

---

## 🌟 Overview

Lingocare combines clinical German language training with vocational nursing education in Germany. School directors and clinical instructors need to structure complex, multi-level curricula effortlessly without getting bogged down by cumbersome form modals.

The **Curriculum Creation Engine** provides:
1. **Fluid Manual Authoring:** Direct Notion-style inline editing across a 4-tier hierarchy:
   $$\text{Curriculum} \longrightarrow \text{Module} \longrightarrow \text{Topic} \longrightarrow \text{Lesson}$$
2. **AI-Powered Generation from PDF:** Upload any curriculum or syllabus PDF to automatically parse, structure, and populate the hierarchy.
3. **Smart Inference for Missing Levels:** If the uploaded document only specifies modules or lacks topics/lessons, the AI infers and synthesizes realistic, pedagogically sound German nursing topics (e.g., *Pflegefachassistenz*, hygiene standards, clinical communication).
4. **Resilient Local State:** Zero database setup required; state is managed immutably with auto-saving to `localStorage` so instructors never lose progress on refresh.

---

## 🚀 Live Demo & Video Walkthrough

- **Live URL:** [https://lingocare-umber.vercel.app/](https://lingocare-umber.vercel.app/)
- **Video Walkthrough (5 mins):** [Link to Walkthrough Video]

---

## 🏗️ Architecture & Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, TypeScript)
- **Styling:** Tailwind CSS with Lingocare brand identity (`#EC8601` accent, sleek card layout, nested visual guide rails)
- **Icons:** [lucide-react](https://lucide.dev/)
- **AI Processing:** Google Gemini 2.0 Flash / 1.5 Flash via `@google/genai` (1M+ token context window, native document understanding)
- **PDF Extraction:** Server-side document processing with structured schema validation

---

## 📂 Project Structure

```
lingocare/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── parse-curriculum/   # Serverless AI parsing endpoint
│   │   ├── globals.css             # Tailwind styling & brand variables
│   │   ├── layout.tsx              # Root layout with metadata
│   │   └── page.tsx                # Main Curriculum Engine page
│   ├── components/
│   │   ├── CurriculumEditor.tsx    # Primary workspace orchestrator
│   │   ├── CurriculumHeader.tsx    # Action bar, statistics, and title
│   │   ├── ModuleCard.tsx          # Collapsible module card with topic list
│   │   ├── TopicCard.tsx           # Nested topic block with lesson list
│   │   ├── LessonRow.tsx           # Inline-editable lesson row
│   │   ├── InlineEditable.tsx      # Notion-style zero-shift inline editor
│   │   ├── PdfUploadModal.tsx      # PDF dropzone with multi-step status
│   │   └── SettingsModal.tsx       # Optional custom API key configuration
│   ├── hooks/
│   │   └── useCurriculum.ts        # Immutable state transitions & persistence
│   └── types/
│       └── curriculum.ts           # Strict TypeScript contracts
├── public/                         # Static assets and sample PDFs
├── .gitignore
├── README.md
└── package.json
```

---

## ⚡ Getting Started Locally

### Prerequisites
- Node.js 18+ (tested on Node v22)
- npm or yarn

### 1. Clone & Install
```bash
git clone <repository-url>
cd lingocare
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
*(Note: Evaluators can also supply their own key directly in the web UI via the Settings modal if running without environment variables).*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🧠 Key Decisions & Trade-Offs

1. **Notion-Style Inline Editing vs. Modals:**
   - *Decision:* Replaced modal dialogs with click-to-edit typography that perfectly mirrors the display text's font, size, line-height, and padding.
   - *Rationale:* Nursing school directors need to quickly scan, tweak, and reword dozens of competencies; modal forms introduce click fatigue.
2. **Deep Document Understanding with Gemini 2.0 Flash:**
   - *Decision:* Leveraged Gemini's 1M token context window and native document comprehension.
   - *Rationale:* Supports extensive multi-semester curricula (20+ modules with 10–15 topics each) without context fragmentation or token truncation.
3. **Inference of Incomplete Syllabi:**
   - *Decision:* When a PDF only lists modules (e.g. "Module 1: Anatomie und Physiologie"), the AI detects the gap and automatically synthesizes relevant topics and lessons according to German nursing education standards (*PflAPrV*).
4. **Collapse/Expand for Scale:**
   - *Decision:* Added per-module and global Expand/Collapse controls.
   - *Rationale:* A full 300-lesson curriculum is unmanageable as a single flat view. Collapsibility preserves focus while maintaining hierarchy.
5. **No Accidental Data Loss:**
   - *Decision:* Auto-save to `localStorage` + soft confirmation and Toast Undo for deletions.

---

## 📄 Evaluation Criteria Checklist

- [x] Full Curriculum → Module → Topic → Lesson hierarchy supported.
- [x] Notion-style inline title editing (no separate modal screens).
- [x] Intuitive, non-intrusive empty description placeholders.
- [x] Inline additions and deletions at any level.
- [x] Clear visual nesting with indentations and connector lines.
- [x] Local state management without database overhead.
- [x] AI-powered PDF upload and extraction.
- [x] Missing topics/lessons inferred intelligently.
- [x] Orange `#EC8601` brand accent thoughtfully integrated.
