# PA Core Standards & Assessment Anchors Explorer 🏛️

A lightning-fast, offline-first **Progressive Web App (PWA)** and full-stack educational tool for exploring, searching, and aligning Pennsylvania Core Standards, PSSA Assessment Anchors, and Keystone Frameworks across **Kindergarten through Grade 12**.

Designed for seamless responsive use on **Android, iPhone, iPad / Tablets, and Desktop PCs / Smartboards**.

![PA Standards Explorer](public/favicon.svg)

---

## 🌐 Live Deployments

* **Firebase App Hosting (`us-east4` Cloud Run):** [https://pa-standards-browser--mro-analysis-hub.us-east4.hosted.app](https://pa-standards-browser--mro-analysis-hub.us-east4.hosted.app)
* **Firebase Hosting (Global Edge CDN):** [https://pa-standards-browser.web.app](https://pa-standards-browser.web.app)
* **GitHub Repository:** [https://github.com/oconnors11/pa_standards_app](https://github.com/oconnors11/pa_standards_app)

---

## 🚀 Key Features

* **⚡ Instant Omnibar Search (<5ms):** Fast client-side fuzzy search and exact code matcher (`M08.A-N.1.1.1`, `CC.2.1.8.E.1`, `E03.A-K.1.1.1`, `BIO.A.1.1.1`).
* **📱 Multi-Device Adaptive Interface:**
  * **Mobile (iOS & Android):** Bottom sheet drawers, sticky top search, swipeable grade pills, native haptic feedback (`navigator.vibrate`), 1-tap clipboard copying.
  * **Tablet (iPad / Android):** 2-column master-detail split layout.
  * **Desktop:** 3-column power command center with keyboard hotkeys (`/` or `⌘K` to search, `Esc` to close).
* **🔀 Vertical Progression / Crosswalk Matrix:** Side-by-side comparative views tracing how concepts evolve across grades (e.g. Fractions in Grade 1–5 $\rightarrow$ Rational Numbers in 6–8 $\rightarrow$ Real Numbers in Keystone Algebra).
* **🌲 Hierarchy Tree Explorer:** Expandable/collapsible nested tree of all PA standards by Subject $\rightarrow$ Grade $\rightarrow$ Domain $\rightarrow$ Anchor $\rightarrow$ Eligible Content.
* **✨ AI Lesson Objective Generator:** Generates customizable Bloom's taxonomy "Students Will Be Able To" (SWBAT) objective stems for any standard.
* **📶 100% Offline PWA:** Service Worker caching allows teachers to use the app in basement classrooms or areas with spotty school Wi-Fi.

---

## 📐 Data Architecture

The application is powered by a normalized static JSON dataset (`src/data/standards.json`) compiled directly from Pennsylvania Department of Education (PDE SAS) standards:

```json
{
  "id": "M08.A-N.1.1.1",
  "code": "M08.A-N.1.1.1",
  "alt_code": "CC.2.1.8.E.1",
  "subject": "Mathematics",
  "grade": "8",
  "grade_band": "Middle School (6-8)",
  "domain": "The Number System",
  "reporting_category": "Reporting Category A - Numbers and Operations",
  "anchor": "M08.A-N.1 - Demonstrate an understanding of numbers...",
  "descriptor": "M08.A-N.1.1 - Apply concepts of rational and irrational numbers.",
  "description": "Determine whether a number is rational or irrational...",
  "assessment_limits": "Radicals limited to square roots and cube roots.",
  "dok": "DOK 1-2",
  "is_pssa_assessed": true,
  "crosswalks": ["CC.2.1.8.E.1", "8.NS.A.1"],
  "prerequisites": ["M07.A-N.1.1.1"],
  "next_steps": ["A1.1.1.1.1"],
  "keywords": ["rational", "irrational", "repeating decimals", "fractions", "real numbers"]
}
```

---

## 🛠️ Local Development & Compilation

```bash
# Install dependencies
npm install

# Start local dev server
npm run dev

# Ingest new PA SAS files (drop .csv / .xlsx files into raw_data/):
npm run import-standards

# Build production bundle
npm run build
```

### 📥 Ingesting Official PA SAS Standards Files
To add complete official standards sets from the Pennsylvania Department of Education (PDE SAS):
1. Export standards files as `.csv` or `.xlsx` from [pdesas.org](https://www.pdesas.org/).
2. Place the export files into the [`raw_data/`](file:///home/oconnors11/teamwork_projects/pa_standards_app/raw_data) folder.
3. Run `npm run import-standards`.
4. The pipeline parses the hierarchy, formats bulleted sub-skills, computes vertical grade progressions, extracts search keywords, and compiles [`standards.json`](file:///home/oconnors11/teamwork_projects/pa_standards_app/src/data/standards.json).

---

## 📄 License
MIT License. Built for Pennsylvania educators, curriculum directors, and students.
