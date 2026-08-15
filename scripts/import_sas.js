import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as XLSX from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rawDataDir = path.resolve(__dirname, '../raw_data');
const outputDir = path.resolve(__dirname, '../src/data');

// Grade standardizer
function normalizeGrade(gradeText, completeNumber = '') {
  if (!gradeText && !completeNumber) return 'HS';
  const str = String(gradeText || '').trim().toLowerCase();
  
  if (str.includes('kindergarten') || str === 'k' || str === 'grade k') return 'K';
  if (str.includes('1st') || str.includes('grade 1') || str === '1') return '1';
  if (str.includes('2nd') || str.includes('grade 2') || str === '2') return '2';
  if (str.includes('3rd') || str.includes('grade 3') || str === '3') return '3';
  if (str.includes('4th') || str.includes('grade 4') || str === '4') return '4';
  if (str.includes('5th') || str.includes('grade 5') || str === '5') return '5';
  if (str.includes('6th') || str.includes('grade 6') || str === '6') return '6';
  if (str.includes('7th') || str.includes('grade 7') || str === '7') return '7';
  if (str.includes('8th') || str.includes('grade 8') || str === '8') return '8';
  if (str.includes('9th') || str.includes('grade 9') || str === '9') return '9';
  if (str.includes('10th') || str.includes('grade 10') || str === '10') return '10';
  if (str.includes('11th') || str.includes('grade 11') || str === '11') return '11';
  if (str.includes('12th') || str.includes('grade 12') || str === '12' || str.includes('high school') || str.includes('hs')) return 'HS';

  // Fallback from completeNumber e.g. CC.1.1.1.B -> 1, CC.2.1.K.A.1 -> K
  const parts = completeNumber.split('.');
  if (parts.length >= 4) {
    const candidate = parts[2] || parts[3];
    if (candidate === 'K' || candidate === 'k') return 'K';
    if (/^[1-8]$/.test(candidate)) return candidate;
  }

  return 'HS';
}

function getGradeBand(grade) {
  if (['K', '1', '2'].includes(grade)) return 'Early Elementary (K-2)';
  if (['3', '4', '5'].includes(grade)) return 'Upper Elementary (3-5)';
  if (['6', '7', '8'].includes(grade)) return 'Middle School (6-8)';
  return 'High School (9-12)';
}

// Clean Domain name from SAS Standard Area description
function cleanDomain(standardAreaDesc) {
  if (!standardAreaDesc) return 'General';
  // If format is "Foundational Skills: Students gain a working knowledge of..."
  // Extract "Foundational Skills"
  const colonIdx = standardAreaDesc.indexOf(':');
  if (colonIdx > 0 && colonIdx < 60) {
    return standardAreaDesc.substring(0, colonIdx).trim();
  }
  return standardAreaDesc.trim();
}

// Parse text into intro statement and bullet points
function parseBullets(text) {
  if (!text) return { description: '', bullets: [] };
  
  // Normalize whitespace
  let cleanText = text.replace(/\r\n/g, '\n').trim();

  // Check if contains bullet symbol '•'
  if (cleanText.includes('•')) {
    const parts = cleanText.split('•').map(p => p.trim()).filter(Boolean);
    const intro = parts[0] || '';
    const bullets = parts.slice(1).map(b => b.replace(/\s+/g, ' ').trim());
    return {
      description: intro,
      bullets: bullets,
      fullText: cleanText
    };
  }

  return {
    description: cleanText.replace(/\s+/g, ' '),
    bullets: [],
    fullText: cleanText.replace(/\s+/g, ' ')
  };
}

// Heuristic DOK generator
function inferDok(text, grade) {
  const lower = (text || '').toLowerCase();
  if (lower.includes('evaluate') || lower.includes('synthesize') || lower.includes('critique') || lower.includes('construct an argument')) {
    return 'DOK 3-4';
  }
  if (lower.includes('analyze') || lower.includes('compare and contrast') || lower.includes('explain') || lower.includes('draw conclusions')) {
    return 'DOK 3';
  }
  if (lower.includes('identify') || lower.includes('recall') || lower.includes('recognize') || lower.includes('name') || lower.includes('count')) {
    return 'DOK 1';
  }
  return 'DOK 2';
}

// Extract search keywords
function extractKeywords(item) {
  const textBlob = `${item.code} ${item.alt_code || ''} ${item.subject} ${item.domain} ${item.anchor || ''} ${item.description || ''} ${(item.bullets || []).join(' ')} ${(item.crosswalks || []).join(' ')}`.toLowerCase();
  const rawWords = textBlob.match(/[a-z0-9\-.]{3,}/g) || [];
  const stopWords = new Set(['the', 'and', 'for', 'with', 'that', 'from', 'this', 'into', 'each', 'such', 'than', 'have', 'more', 'less', 'will', 'been', 'their', 'when', 'what', 'which', 'about', 'some', 'these', 'those', 'using', 'used']);
  
  const keywords = Array.from(new Set(rawWords.filter(w => !stopWords.has(w))));
  return keywords.slice(0, 35);
}

// Main parser function
export function runImport() {
  console.log('🚀 Starting PA Standards SAS Ingestion Pipeline...');

  if (!fs.existsSync(rawDataDir)) {
    fs.mkdirSync(rawDataDir, { recursive: true });
    console.log(`Created raw data directory at: ${rawDataDir}`);
  }

  // 1. Load existing curated standards as baseline/enrichment
  let existingStandards = [];
  const existingPath = path.join(outputDir, 'standards.json');
  if (fs.existsSync(existingPath)) {
    try {
      existingStandards = JSON.parse(fs.readFileSync(existingPath, 'utf-8'));
      console.log(`Loaded ${existingStandards.length} existing base standards.`);
    } catch (e) {
      console.warn('Could not read existing standards.json, starting fresh.');
    }
  }

  const standardsMap = new Map();
  // Index existing by code/id
  existingStandards.forEach(s => {
    standardsMap.set(s.code, s);
  });

  // 2. Scan raw_data directory
  const files = fs.readdirSync(rawDataDir).filter(f => /\.(csv|tsv|xlsx|xls)$/i.test(f));
  console.log(`Found ${files.length} file(s) in ${rawDataDir}: ${files.join(', ')}`);

  let parsedCount = 0;

  files.forEach(fileName => {
    const filePath = path.join(rawDataDir, fileName);
    console.log(`\n📄 Processing file: ${fileName}...`);

    const xlsxLib = XLSX.default || XLSX;
    const fileBuffer = fs.readFileSync(filePath);
    const workbook = xlsxLib.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const rows = xlsxLib.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

    console.log(`  Read ${rows.length} rows from ${fileName}.`);

    let currentSubject = 'English Language Arts';
    let currentStandardArea = '';
    let currentDomain = '';
    let currentGrade = '1';
    let currentGradeBand = 'Early Elementary (K-2)';

    rows.forEach((row, idx) => {
      // Normalize column keys
      const typeName = (row.TypeName || row.type || row.Type || '').trim();
      const completeNumber = (row.CompleteNumber || row.complete_number || row.Code || row.code || '').trim();
      const description = (row.Description || row.description || '').trim();
      const topLevelDesc = (row.TopLevelDescription || row.subject || row.Subject || '').trim();
      const gradeLevelText = (row.GradeLevelText || row.grade || row.Grade || '').trim();

      // State tracker
      if (typeName === 'Subject Area' || (!typeName && completeNumber.startsWith('CC.') && completeNumber.split('.').length === 2)) {
        currentSubject = topLevelDesc || description || 'English Language Arts';
        return;
      }

      if (typeName === 'Standard Area' || (!typeName && completeNumber.startsWith('CC.') && completeNumber.split('.').length === 3)) {
        currentStandardArea = description || topLevelDesc || '';
        currentDomain = cleanDomain(currentStandardArea);
        return;
      }

      if (typeName === 'Grade Level' || (!typeName && completeNumber.startsWith('CC.') && completeNumber.split('.').length === 4 && !/[A-Z]$/.test(completeNumber))) {
        currentGrade = normalizeGrade(gradeLevelText || description, completeNumber);
        currentGradeBand = getGradeBand(currentGrade);
        return;
      }

      // Check if this row is a Standard or Eligible Content
      const isStandard = typeName === 'Standard' || typeName === 'Eligible Content' || typeName === 'Assessment Anchor' || /[A-Z0-9]$/.test(completeNumber);

      if (isStandard && completeNumber && description) {
        const itemGrade = normalizeGrade(gradeLevelText, completeNumber) || currentGrade;
        const itemGradeBand = getGradeBand(itemGrade);
        const parsedDesc = parseBullets(description);

        const existing = standardsMap.get(completeNumber) || {};

        const isPssa = existing.is_pssa_assessed !== undefined 
          ? existing.is_pssa_assessed 
          : (['3', '4', '5', '6', '7', '8'].includes(itemGrade) && ['Mathematics', 'English Language Arts'].includes(currentSubject));

        const isKeystone = existing.is_keystone !== undefined
          ? existing.is_keystone
          : (itemGrade === 'HS' || ['9', '10', '11', '12'].includes(itemGrade));

        const dok = existing.dok || inferDok(description, itemGrade);

        const standardRecord = {
          id: existing.id || completeNumber,
          code: completeNumber,
          alt_code: existing.alt_code || null,
          subject: existing.subject || currentSubject,
          grade: itemGrade,
          grade_band: itemGradeBand,
          domain: existing.domain || currentDomain || 'General',
          cluster: existing.cluster || null,
          anchor: existing.anchor || (currentStandardArea ? currentStandardArea.substring(0, 100) : null),
          descriptor: existing.descriptor || null,
          description: description, // preserve full text with bullets for search
          clean_intro: parsedDesc.description,
          bullets: parsedDesc.bullets,
          assessment_limits: existing.assessment_limits || null,
          reporting_category: existing.reporting_category || null,
          dok: dok,
          is_pssa_assessed: isPssa,
          is_keystone: isKeystone,
          crosswalks: existing.crosswalks || [],
          prerequisites: existing.prerequisites || [],
          next_steps: existing.next_steps || [],
          keywords: []
        };

        standardRecord.keywords = extractKeywords(standardRecord);

        standardsMap.set(completeNumber, standardRecord);
        parsedCount++;
      }
    });
  });

  // 3. Compute Vertical Progression Links (K -> 1 -> 2 -> ... -> 8 -> HS)
  console.log('\n🔗 Computing vertical grade progressions...');
  const allStandards = Array.from(standardsMap.values());
  const codeIndex = new Set(allStandards.map(s => s.code));

  const gradeSequence = ['K', '1', '2', '3', '4', '5', '6', '7', '8', 'HS'];

  allStandards.forEach(std => {
    // Check if code matches CC.1.x.G.X pattern (e.g. CC.1.1.1.B)
    const match = std.code.match(/^(CC\.[12]\.[1-5]\.)([K1-8]|HS)(\.[A-Z0-9]+)$/i);
    if (match) {
      const prefix = match[1];
      const curGrade = match[2];
      const suffix = match[3];

      const curIdx = gradeSequence.indexOf(curGrade);
      if (curIdx > 0) {
        const prevGrade = gradeSequence[curIdx - 1];
        const prevCode = `${prefix}${prevGrade}${suffix}`;
        if (codeIndex.has(prevCode) && !std.prerequisites.includes(prevCode)) {
          std.prerequisites.push(prevCode);
        }
      }

      if (curIdx < gradeSequence.length - 1) {
        const nextGrade = gradeSequence[curIdx + 1];
        const nextCode = `${prefix}${nextGrade}${suffix}`;
        if (codeIndex.has(nextCode) && !std.next_steps.includes(nextCode)) {
          std.next_steps.push(nextCode);
        }
      }
    }
  });

  // Sort standards by subject, grade, then code
  const gradeOrder = { 'K': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, 'HS': 9 };
  allStandards.sort((a, b) => {
    if (a.subject !== b.subject) return a.subject.localeCompare(b.subject);
    const gd = (gradeOrder[a.grade] ?? 99) - (gradeOrder[b.grade] ?? 99);
    if (gd !== 0) return gd;
    return a.code.localeCompare(b.code);
  });

  // 4. Write output standards.json and stats.json
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(path.join(outputDir, 'standards.json'), JSON.stringify(allStandards, null, 2), 'utf-8');

  const stats = {
    total: allStandards.length,
    by_subject: allStandards.reduce((acc, s) => { acc[s.subject] = (acc[s.subject] || 0) + 1; return acc; }, {}),
    by_grade: allStandards.reduce((acc, s) => { acc[s.grade] = (acc[s.grade] || 0) + 1; return acc; }, {}),
    updated_at: new Date().toISOString()
  };

  fs.writeFileSync(path.join(outputDir, 'stats.json'), JSON.stringify(stats, null, 2), 'utf-8');

  console.log(`\n🎉 Ingestion Complete!`);
  console.log(`Total standards compiled: ${allStandards.length}`);
  console.log('Stats:', stats);
  return stats;
}

// Run directly if invoked as CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runImport();
}
