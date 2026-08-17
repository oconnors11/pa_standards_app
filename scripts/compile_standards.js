import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputDir = path.resolve(__dirname, '../src/data');
const rawDataDir = path.resolve(__dirname, '../raw_data');
const outputPath = path.join(outputDir, 'standards.json');

console.log('Generating comprehensive CCSS & PA State Standards dataset...');

// 1. Preserve Non-CCSS Standards (STEELS Science, Early Learning, Social Studies)
let existingStandards = [];
const existingPath = path.join(outputDir, 'standards.json');
if (fs.existsSync(existingPath)) {
  existingStandards = JSON.parse(fs.readFileSync(existingPath, 'utf8'));
}

const nonCCSS = existingStandards.filter(
  s => s.subject !== 'Mathematics' && s.subject !== 'English Language Arts'
);
nonCCSS.forEach(s => {
  s.authority = 'PA_STATE';
});

console.log(`Preserved ${nonCCSS.length} PA State standards (STEELS Science, Early Learning, Social Studies).`);

// 2. Read CCSS Supplement (Math Practices MP.1-MP.8)
const supplementPath = path.join(__dirname, 'ccss_supplement.json');
let supplement = [];
if (fs.existsSync(supplementPath)) {
  supplement = JSON.parse(fs.readFileSync(supplementPath, 'utf8'));
}

// 3. Read & Parse ccss.csv
const ccssCsvPath = path.join(rawDataDir, 'ccss.csv');
const csvText = fs.readFileSync(ccssCsvPath, 'utf8');
const lines = csvText.split(/\r?\n/);

const ccssItems = [];

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;

  const row = [];
  let inQuotes = false;
  let curr = '';
  for (let c = 0; c < line.length; c++) {
    const char = line[c];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      row.push(curr.trim());
      curr = '';
    } else {
      curr += char;
    }
  }
  row.push(curr.trim());

  if (row.length < 8) continue;

  const id = row[0].replace(/^"|"$/g, '');
  const contentType = row[1].replace(/^"|"$/g, '');
  const categoryId = row[2].replace(/^"|"$/g, '');
  const categoryName = row[3].replace(/^"|"$/g, '');
  const gradeId = row[4].replace(/^"|"$/g, '');
  const gradeName = row[5].replace(/^"|"$/g, '');
  const item = row[6].replace(/^"|"$/g, '');
  const description = row[7].replace(/^"|"$/g, '');

  const isMath = contentType.startsWith('MATH');
  const subject = isMath ? 'Mathematics' : 'English Language Arts';

  let altCode = id;
  if (id.startsWith('CCSS.MATH.CONTENT.')) {
    altCode = id.replace('CCSS.MATH.CONTENT.', '');
  } else if (id.startsWith('CCSS.ELA-LITERACY.')) {
    altCode = id.replace('CCSS.ELA-LITERACY.', '');
  }

  let gradeBand = 'Middle School (6-8)';
  if (['K', '1', '2'].includes(gradeId)) gradeBand = 'Early Elementary (K-2)';
  else if (['3', '4', '5'].includes(gradeId)) gradeBand = 'Upper Elementary (3-5)';
  else if (['6', '7', '8', '6-8'].includes(gradeId)) gradeBand = 'Middle School (6-8)';
  else gradeBand = 'High School (9-12)';

  const textBlob = `${id} ${altCode} ${subject} ${categoryName} ${description}`.toLowerCase();
  const rawWords = textBlob.match(/[a-z0-9\-.]{3,}/g) || [];
  const uniqueKeywords = Array.from(
    new Set(
      rawWords.filter(
        w =>
          ![
            'the',
            'and',
            'for',
            'with',
            'that',
            'from',
            'this',
            'into',
            'each',
            'such',
            'than',
            'have',
            'more',
            'less',
            'will',
            'been',
            'their',
            'when'
          ].includes(w)
      )
    )
  );

  ccssItems.push({
    id: id,
    code: id,
    alt_code: altCode,
    subject: subject,
    grade: gradeId || 'K-12',
    grade_band: gradeBand,
    domain: categoryName,
    cluster: categoryId,
    category_id: categoryId,
    description: description,
    dok: 'DOK 2',
    authority: 'CCSS',
    crosswalks: [altCode],
    prerequisites: [],
    next_steps: [],
    keywords: uniqueKeywords.slice(0, 35)
  });
}

console.log(`Parsed ${ccssItems.length} CCSS standards from ccss.csv.`);
console.log(`Loaded ${supplement.length} CCSS Math Practice standards.`);

// 4. Build Progression Links for CCSS items
const allCCSS = [...ccssItems, ...supplement];
const elaGradeSeq = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9-10', '11-12'];
const mathGradeSeq = ['K', '1', '2', '3', '4', '5', '6', '7', '8'];

const byCatGrade = {};
allCCSS.forEach(item => {
  const key = `${item.subject}:${item.cluster}:${item.grade}`;
  if (!byCatGrade[key]) byCatGrade[key] = [];
  byCatGrade[key].push(item);
});

allCCSS.forEach(item => {
  if (item.subject === 'English Language Arts') {
    const gIndex = elaGradeSeq.indexOf(item.grade);
    if (gIndex > 0) {
      const prevGrade = elaGradeSeq[gIndex - 1];
      const prevKey = `English Language Arts:${item.cluster}:${prevGrade}`;
      if (byCatGrade[prevKey] && byCatGrade[prevKey].length > 0) {
        item.prerequisites.push(byCatGrade[prevKey][0].code);
      }
    }
    if (gIndex >= 0 && gIndex < elaGradeSeq.length - 1) {
      const nextGrade = elaGradeSeq[gIndex + 1];
      const nextKey = `English Language Arts:${item.cluster}:${nextGrade}`;
      if (byCatGrade[nextKey] && byCatGrade[nextKey].length > 0) {
        item.next_steps.push(byCatGrade[nextKey][0].code);
      }
    }
  } else if (item.subject === 'Mathematics' && item.cluster !== 'MP') {
    const gIndex = mathGradeSeq.indexOf(item.grade);
    if (gIndex > 0) {
      const prevGrade = mathGradeSeq[gIndex - 1];
      const prevKey = `Mathematics:${item.cluster}:${prevGrade}`;
      if (byCatGrade[prevKey] && byCatGrade[prevKey].length > 0) {
        item.prerequisites.push(byCatGrade[prevKey][0].code);
      }
    }
    if (gIndex >= 0 && gIndex < mathGradeSeq.length - 1) {
      const nextGrade = mathGradeSeq[gIndex + 1];
      const nextKey = `Mathematics:${item.cluster}:${nextGrade}`;
      if (byCatGrade[nextKey] && byCatGrade[nextKey].length > 0) {
        item.next_steps.push(byCatGrade[nextKey][0].code);
      }
    }
  }
});

// 5. Combine and Save Dataset
const finalStandards = [...allCCSS, ...nonCCSS];

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputPath, JSON.stringify(finalStandards, null, 2), 'utf-8');

const stats = {
  total: finalStandards.length,
  by_authority: finalStandards.reduce((acc, s) => {
    acc[s.authority] = (acc[s.authority] || 0) + 1;
    return acc;
  }, {}),
  by_subject: finalStandards.reduce((acc, s) => {
    acc[s.subject] = (acc[s.subject] || 0) + 1;
    return acc;
  }, {}),
  by_grade: finalStandards.reduce((acc, s) => {
    acc[s.grade] = (acc[s.grade] || 0) + 1;
    return acc;
  }, {}),
  updated_at: new Date().toISOString()
};

fs.writeFileSync(path.join(outputDir, 'stats.json'), JSON.stringify(stats, null, 2), 'utf-8');

console.log(`Successfully compiled ${finalStandards.length} standards!`);
console.log('Dataset Stats:', stats);
