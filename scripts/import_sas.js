import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as XLSX from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rawDataDir = path.resolve(__dirname, '../raw_data');
const outputDir = path.resolve(__dirname, '../src/data');

// Grade standardizer
function normalizeGrade(gradeText, completeNumber = '', fileName = '') {
  const str = String(gradeText || '').trim().toLowerCase();
  const fileLower = String(fileName || '').toLowerCase();
  const code = String(completeNumber || '').trim();
  const parts = code.split('.');

  // 1. From GradeLevelText if it is a specific grade (ignore generic '12th Grade' headers in SAS exports)
  if (str === 'pre-kindergarten' || str === 'prek' || str.includes('pre-k')) return 'Pre-K';
  if (str === 'kindergarten' || str === 'grade k') return 'K';
  if (str === '1st grade' || str === 'grade 1') return '1';
  if (str === '2nd grade' || str === 'grade 2') return '2';
  if (str === '3rd grade' || str === 'grade 3') return '3';
  if (str === '4th grade' || str === 'grade 4') return '4';
  if (str === '5th grade' || str === 'grade 5') return '5';
  if (str === '6th grade' || str === 'grade 6') return '6';
  if (str === '7th grade' || str === 'grade 7') return '7';
  if (str === '8th grade' || str === 'grade 8') return '8';
  if (str === '9th grade' || str === 'grade 9') return '9';
  if (str === '10th grade' || str === 'grade 10') return '10';
  if (str === '11th grade' || str === 'grade 11') return '11';
  if (str === '12th grade' || str === 'grade 12') {
    if (fileLower.includes('grade12') || fileLower.includes('12th')) return '12';
  }

  // 2. From filename
  if (fileLower.includes('prek')) return 'Pre-K';
  if (fileLower.startsWith('k') || fileLower.includes('kearly') || fileLower.includes('ksteel') || fileLower.includes('kmath') || fileLower.includes('kela')) return 'K';
  
  const gMatch = fileLower.match(/grade(\d+)/);
  if (gMatch) return gMatch[1];

  // 3. From completeNumber format
  if (parts.length >= 3) {
    for (let i = 1; i < parts.length - 1; i++) {
      const p = parts[i].toUpperCase();
      if (p === 'PK' || p === 'PREK') return 'Pre-K';
      if (p === 'K') return 'K';
      if (p === 'HS') return 'HS';
      if (/^[1-9]$|^1[0-2]$/.test(p)) return p;
    }
  }

  const anchorMatch = code.match(/^[ME](0[3-8]|[3-8])\./i);
  if (anchorMatch) return String(parseInt(anchorMatch[1], 10));

  if (code.startsWith('BIO.') || code.startsWith('LIT.') || code.startsWith('ALG.')) return 'HS';

  return 'HS';
}

function getGradeBand(grade) {
  if (['Pre-K', 'PK', 'K', '1', '2'].includes(grade)) return 'Early Elementary (PreK-2)';
  if (['3', '4', '5'].includes(grade)) return 'Upper Elementary (3-5)';
  if (['6', '7', '8'].includes(grade)) return 'Middle School (6-8)';
  return 'High School (9-12)';
}

// Clean Domain name from Standard Area description
function cleanDomain(standardAreaDesc) {
  if (!standardAreaDesc) return 'General';
  const clean = String(standardAreaDesc).trim();
  const colonIdx = clean.indexOf(':');
  if (colonIdx > 0 && colonIdx < 60) {
    return clean.substring(0, colonIdx).trim();
  }
  return clean;
}

// Parse text into intro statement and bullet points
function parseBullets(text) {
  if (!text) return { description: '', bullets: [], fullText: '' };
  
  let cleanText = String(text).replace(/\r\n/g, '\n').trim();

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

  // Check if contains newline hyphens or numbered lists
  if (cleanText.includes('\n- ') || cleanText.includes('\n* ')) {
    const parts = cleanText.split(/\n[-*]\s+/).map(p => p.trim()).filter(Boolean);
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
  const lower = String(text || '').toLowerCase();
  if (lower.includes('evaluate') || lower.includes('synthesize') || lower.includes('critique') || lower.includes('construct an argument') || lower.includes('design a solution')) {
    return 'DOK 3-4';
  }
  if (lower.includes('analyze') || lower.includes('compare and contrast') || lower.includes('explain') || lower.includes('draw conclusions') || lower.includes('develop a model')) {
    return 'DOK 3';
  }
  if (lower.includes('identify') || lower.includes('recall') || lower.includes('recognize') || lower.includes('name') || lower.includes('count') || lower.includes('match')) {
    return 'DOK 1';
  }
  return 'DOK 2';
}

// Extract search keywords
function extractKeywords(item) {
  const textBlob = `${item.code} ${item.alt_code || ''} ${item.subject} ${item.domain} ${item.anchor || ''} ${item.description || ''} ${(item.bullets || []).join(' ')} ${(item.crosswalks || []).join(' ')}`.toLowerCase();
  const rawWords = textBlob.match(/[a-z0-9\-.]{3,}/g) || [];
  const stopWords = new Set(['the', 'and', 'for', 'with', 'that', 'from', 'this', 'into', 'each', 'such', 'than', 'have', 'more', 'less', 'will', 'been', 'their', 'when', 'what', 'which', 'about', 'some', 'these', 'those', 'using', 'used', 'can']);
  
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
  console.log(`Found ${files.length} file(s) in ${rawDataDir}`);

  const xlsxLib = XLSX.default || XLSX;
  let parsedCount = 0;

  files.forEach(fileName => {
    const filePath = path.join(rawDataDir, fileName);

    const isEarly = /early/i.test(fileName);
    const isSteel = /steel/i.test(fileName);
    const isMath = /math/i.test(fileName);
    const isEla = /ela/i.test(fileName);

    const defaultSubject = isEarly ? 'Early Learning' :
                           isSteel ? 'STEELS Science' :
                           isMath ? 'Mathematics' :
                           isEla ? 'English Language Arts' : 'Other';

    const fileBuffer = fs.readFileSync(filePath);
    const workbook = xlsxLib.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const rows = xlsxLib.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

    console.log(`  Processed ${fileName}: ${rows.length} rows (${defaultSubject})`);

    let currentSubject = defaultSubject;
    let currentStandardArea = '';
    let currentDomain = '';
    let currentGrade = normalizeGrade('', '', fileName);
    let currentGradeBand = getGradeBand(currentGrade);

    rows.forEach(row => {
      const typeName = String(row.TypeName || row.type || row.Type || '').trim();
      const completeNumber = String(row.CompleteNumber || row.complete_number || row.Code || row.code || '').trim();
      const rawDesc = String(row.Description || row.description || row.TopLevelDescription || '').trim();
      const topLevelDesc = String(row.TopLevelDescription || row.subject || row.Subject || '').trim();
      const gradeLevelText = String(row.GradeLevelText || row.grade || row.Grade || '').trim();

      // State tracker
      if (typeName === 'Subject Area') {
        if (!isEarly && !isSteel) {
          currentSubject = topLevelDesc || rawDesc || defaultSubject;
        } else {
          currentSubject = defaultSubject;
        }
        return;
      }

      if (typeName === 'Domain' || typeName === 'Standard Area' || typeName === 'Discipline') {
        currentStandardArea = rawDesc || topLevelDesc || '';
        currentDomain = cleanDomain(currentStandardArea);
        return;
      }

      if (typeName === 'Strand' || typeName === 'Organizing Category') {
        currentStandardArea = rawDesc || topLevelDesc || currentStandardArea;
        if (!currentDomain) currentDomain = cleanDomain(currentStandardArea);
        return;
      }

      if (typeName === 'Grade Level') {
        currentGrade = normalizeGrade(gradeLevelText || rawDesc, completeNumber, fileName);
        currentGradeBand = getGradeBand(currentGrade);
        return;
      }

      // Handle child metadata attached to existing standard
      if (typeName === 'Assessment Boundary' && completeNumber) {
        const parentCode = completeNumber.replace(/\.AB$/, '');
        if (standardsMap.has(parentCode)) {
          standardsMap.get(parentCode).assessment_limits = rawDesc;
        }
        return;
      }

      if (typeName === 'Clarifying Statement' && completeNumber) {
        const parentCode = completeNumber.replace(/\.CS$/, '');
        if (standardsMap.has(parentCode)) {
          standardsMap.get(parentCode).clarifying_statement = rawDesc;
        }
        return;
      }

      // Determine if row is a Standard or Eligible Content
      const isStandard = typeName === 'Standard' || 
                         typeName === 'Eligible Content' || 
                         typeName === 'Alternate Eligible Content' || 
                         typeName === 'Assessment Anchor' ||
                         (completeNumber && /[A-Z0-9]$/.test(completeNumber) && !completeNumber.endsWith('.AB') && !completeNumber.endsWith('.CS') && !completeNumber.endsWith('.CI'));

      if (isStandard && completeNumber && rawDesc && rawDesc !== completeNumber && !/^\d+$/.test(rawDesc)) {
        const itemGrade = normalizeGrade(gradeLevelText, completeNumber, fileName);
        const itemGradeBand = getGradeBand(itemGrade);
        const parsedDesc = parseBullets(rawDesc);

        const existing = standardsMap.get(completeNumber) || {};

        const isPssa = existing.is_pssa_assessed !== undefined 
          ? existing.is_pssa_assessed 
          : (['3', '4', '5', '6', '7', '8'].includes(itemGrade) && ['Mathematics', 'English Language Arts', 'STEELS Science'].includes(defaultSubject));

        const isKeystone = existing.is_keystone !== undefined
          ? existing.is_keystone
          : (['9', '10', '11', '12', 'HS'].includes(itemGrade));

        const dok = existing.dok || inferDok(rawDesc, itemGrade);

        let standardDomain = existing.domain || currentDomain;
        if (!standardDomain || standardDomain === 'General') {
          if (isEarly) standardDomain = currentStandardArea || 'Early Childhood Learning';
          else if (isSteel) standardDomain = 'Science, Technology & Engineering';
          else standardDomain = 'General';
        }

        const standardRecord = {
          id: existing.id || completeNumber,
          code: completeNumber,
          alt_code: existing.alt_code || null,
          subject: defaultSubject,
          grade: itemGrade,
          grade_band: itemGradeBand,
          domain: standardDomain,
          cluster: existing.cluster || null,
          anchor: existing.anchor || (currentStandardArea ? currentStandardArea.substring(0, 120) : null),
          descriptor: existing.descriptor || null,
          description: rawDesc,
          clean_intro: parsedDesc.description,
          bullets: parsedDesc.bullets,
          assessment_limits: existing.assessment_limits || null,
          clarifying_statement: existing.clarifying_statement || null,
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

  // 3. Compute Vertical Progression Links
  console.log('\n🔗 Computing vertical grade progressions...');
  const allStandards = Array.from(standardsMap.values());
  const codeIndex = new Set(allStandards.map(s => s.code));

  const gradeSequence = ['Pre-K', 'K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'HS'];
  const gradeToCode = { 'Pre-K': 'PREK', 'K': 'K', '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9', '10': '10', '11': '11', '12': '12', 'HS': 'HS' };
  const codeToGrade = { 'PREK': 'Pre-K', 'PK': 'Pre-K', 'K': 'K', '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9', '10': '10', '11': '11', '12': '12', 'HS': 'HS' };

  allStandards.forEach(std => {
    // ELA / Math pattern matching
    const match = std.code.match(/^(CC\.[12]\.[1-5]\.)(PREK|PK|[K1-9]|1[0-2]|HS)(\.[A-Z0-9]+)$/i);
    if (match) {
      const prefix = match[1];
      const codeGradeKey = match[2].toUpperCase();
      const suffix = match[3];

      const curGrade = codeToGrade[codeGradeKey] || codeGradeKey;
      const curIdx = gradeSequence.indexOf(curGrade);

      if (curIdx > 0) {
        const prevGrade = gradeSequence[curIdx - 1];
        const prevCodeKey = gradeToCode[prevGrade] || prevGrade;
        const prevCode = `${prefix}${prevCodeKey}${suffix}`;
        if (codeIndex.has(prevCode) && !std.prerequisites.includes(prevCode)) {
          std.prerequisites.push(prevCode);
        }
      }

      if (curIdx >= 0 && curIdx < gradeSequence.length - 1) {
        const nextGrade = gradeSequence[curIdx + 1];
        const nextCodeKey = gradeToCode[nextGrade] || nextGrade;
        const nextCode = `${prefix}${nextCodeKey}${suffix}`;
        if (codeIndex.has(nextCode) && !std.next_steps.includes(nextCode)) {
          std.next_steps.push(nextCode);
        }
      }
    }

    // Early Learning AL pattern matching e.g. AL.1.PK.A1 -> AL.1.K.A1 -> AL.1.1.A1 -> AL.1.2.A1
    const earlyMatch = std.code.match(/^([A-Z0-9]+\.[0-9]+\.)(PK|K|[1-2])(\.[A-Z0-9]+)$/i);
    if (earlyMatch) {
      const prefix = earlyMatch[1];
      const earlyGradeKey = earlyMatch[2].toUpperCase();
      const suffix = earlyMatch[3];

      const earlySeq = ['PK', 'K', '1', '2'];
      const eIdx = earlySeq.indexOf(earlyGradeKey);

      if (eIdx > 0) {
        const prevGradeKey = earlySeq[eIdx - 1];
        const prevCode = `${prefix}${prevGradeKey}${suffix}`;
        if (codeIndex.has(prevCode) && !std.prerequisites.includes(prevCode)) {
          std.prerequisites.push(prevCode);
        }
      }
      if (eIdx >= 0 && eIdx < earlySeq.length - 1) {
        const nextGradeKey = earlySeq[eIdx + 1];
        const nextCode = `${prefix}${nextGradeKey}${suffix}`;
        if (codeIndex.has(nextCode) && !std.next_steps.includes(nextCode)) {
          std.next_steps.push(nextCode);
        }
      }
    }
  });

  // Sort standards by Subject, Grade, Code
  const subjectSort = {
    'Early Learning': 1,
    'Mathematics': 2,
    'English Language Arts': 3,
    'STEELS Science': 4,
    'Social Studies': 5
  };

  const gradeOrder = { 'Pre-K': -1, 'K': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, '11': 11, '12': 12, 'HS': 13 };

  allStandards.sort((a, b) => {
    const sa = subjectSort[a.subject] ?? 99;
    const sb = subjectSort[b.subject] ?? 99;
    if (sa !== sb) return sa - sb;

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
