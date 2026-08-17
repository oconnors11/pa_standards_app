/**
 * @file coherenceGraph.js
 * High-performance Coherence Graph Engine, multi-index in-memory store,
 * 5-tier relationship resolution waterfall, multi-field search engine,
 * cascading filter selectors, breadcrumb navigation manager, and SWBAT objective generator.
 *
 * Covers all 2,489 Pennsylvania Standards across Mathematics, English Language Arts,
 * STEELS Science, Early Learning, and Social Studies.
 */

import rawStandards from '../data/standards.json' with { type: 'json' };

// ============================================================================
// 1. CONSTANTS & GRADE RANKINGS
// ============================================================================

export const GRADE_ORDER = {
  'PRE-K': 0, 'PREK': 0, 'PK': 0, 'Pre-K': 0, 'PreK': 0, 'pre-k': 0, 'prek': 0, 'pk': 0, 'INFANT-TODDLER': 0, 'PRE-KINDERGARTEN': 0,
  'K': 1, 'KG': 1, 'KINDERGARTEN': 1, 'k': 1, 'kg': 1, 'kindergarten': 1,
  '1': 2, '2': 3, '3': 4, '4': 5, '5': 6, '6': 7, '7': 8, '8': 9,
  '9': 10, '10': 11, '11': 12, '12': 13,
  'HS': 14, 'HIGH SCHOOL': 14, 'hs': 14, 'high school': 14,
  '9-12': 14, '11-12': 13, '9-10': 11, '3-5': 5, '6-8': 8, 'K-2': 1, 'k-2': 1,
  'HSA': 10, 'HSF': 11, 'HSG': 12, 'HSN': 10, 'HSS': 13, 'K-12': 7
};

export const GRADE_RANKS = [
  'Pre-K', 'K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'HS'
];

export const GRADE_SEQUENCE_TOKENS = [
  'PK', 'K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'HS'
];

export const GRADE_SEQUENCE_ALT_TOKENS = [
  'PREK', 'K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'HS'
];

export const SUBJECT_PRIORITY = {
  'Mathematics': 1,
  'English Language Arts': 2,
  'STEELS Science': 3,
  'Early Learning': 4,
  'Social Studies': 5
};

export const DOK_METADATA = {
  1: { level: 1, name: 'Recall & Reproduction', description: 'Recall facts, definitions, terms, or simple procedures.' },
  2: { level: 2, name: 'Skills & Concepts', description: 'Apply concepts, interpret information, or solve multi-step problems.' },
  3: { level: 3, name: 'Strategic Thinking', description: 'Analyze, justify, explain reasoning, or synthesize evidence.' },
  4: { level: 4, name: 'Extended Thinking', description: 'Design, conduct complex investigations, or evaluate multi-faceted systems.' }
};

export const VERB_DICTIONARY = {
  // DOK 1 / Remember
  recall: { dok: 1, blooms: 'Remember' },
  recognize: { dok: 1, blooms: 'Remember' },
  identify: { dok: 1, blooms: 'Remember' },
  define: { dok: 1, blooms: 'Remember' },
  list: { dok: 1, blooms: 'Remember' },
  name: { dok: 1, blooms: 'Remember' },
  state: { dok: 1, blooms: 'Remember' },
  match: { dok: 1, blooms: 'Remember' },
  label: { dok: 1, blooms: 'Remember' },
  locate: { dok: 1, blooms: 'Remember' },
  quote: { dok: 1, blooms: 'Remember' },
  count: { dok: 1, blooms: 'Remember' },
  read: { dok: 1, blooms: 'Remember' },
  write: { dok: 1, blooms: 'Remember' },
  compute: { dok: 1, blooms: 'Remember' },
  calculate: { dok: 1, blooms: 'Remember' },

  // DOK 2 / Understand & Apply
  describe: { dok: 2, blooms: 'Understand' },
  explain: { dok: 2, blooms: 'Understand' },
  summarize: { dok: 2, blooms: 'Understand' },
  interpret: { dok: 2, blooms: 'Understand' },
  classify: { dok: 2, blooms: 'Understand' },
  compare: { dok: 2, blooms: 'Understand' },
  contrast: { dok: 2, blooms: 'Understand' },
  distinguish: { dok: 2, blooms: 'Understand' },
  demonstrate: { dok: 2, blooms: 'Understand' },
  estimate: { dok: 2, blooms: 'Understand' },
  predict: { dok: 2, blooms: 'Understand' },
  apply: { dok: 2, blooms: 'Apply' },
  solve: { dok: 2, blooms: 'Apply' },
  use: { dok: 2, blooms: 'Apply' },
  determine: { dok: 2, blooms: 'Apply' },
  represent: { dok: 2, blooms: 'Apply' },
  illustrate: { dok: 2, blooms: 'Apply' },
  organize: { dok: 2, blooms: 'Apply' },
  model: { dok: 2, blooms: 'Apply' },
  construct: { dok: 2, blooms: 'Apply' },
  show: { dok: 2, blooms: 'Apply' },
  perform: { dok: 2, blooms: 'Apply' },
  develop: { dok: 2, blooms: 'Apply' },
  extend: { dok: 2, blooms: 'Apply' },
  build: { dok: 2, blooms: 'Apply' },
  connect: { dok: 2, blooms: 'Apply' },

  // DOK 3 / Analyze & Evaluate
  analyze: { dok: 3, blooms: 'Analyze' },
  differentiate: { dok: 3, blooms: 'Analyze' },
  infer: { dok: 3, blooms: 'Analyze' },
  examine: { dok: 3, blooms: 'Analyze' },
  investigate: { dok: 3, blooms: 'Analyze' },
  justify: { dok: 3, blooms: 'Evaluate' },
  evaluate: { dok: 3, blooms: 'Evaluate' },
  critique: { dok: 3, blooms: 'Evaluate' },
  assess: { dok: 3, blooms: 'Evaluate' },
  formulate: { dok: 3, blooms: 'Analyze' },
  hypothesize: { dok: 3, blooms: 'Analyze' },
  synthesize: { dok: 3, blooms: 'Analyze' },
  conclude: { dok: 3, blooms: 'Analyze' },
  argue: { dok: 3, blooms: 'Evaluate' },
  defend: { dok: 3, blooms: 'Evaluate' },
  cite: { dok: 3, blooms: 'Analyze' },

  // DOK 4 / Create & Extended
  design: { dok: 4, blooms: 'Create' },
  create: { dok: 4, blooms: 'Create' },
  compose: { dok: 4, blooms: 'Create' },
  generate: { dok: 4, blooms: 'Create' },
  plan: { dok: 4, blooms: 'Create' },
  conduct: { dok: 4, blooms: 'Create' }
};

export const KEYSTONE_BRIDGES = {
  // Math Grade 8 PSSA -> Keystone Algebra I & Geometry
  'M08.B-E': ['A1.1.1.1.1', 'A1.1.2.1.1', 'A1.2.1.1.1'],
  'M08.C-G': ['G.1.1.1.1', 'G.1.2.1.1'],
  // ELA Grade 8 PSSA -> Keystone Literature
  'E08.A-K': ['L.F.1.1.1', 'L.N.1.1.1'],
  'E08.B-C': ['L.F.2.1.1', 'L.N.2.1.1'],
  'E08.E':   ['L.F.1.1.1', 'L.N.1.1.1'],
  // STEELS Science Grade 8 -> Keystone Biology
  '3.1.8':   ['BIO.A.1.1.1', 'BIO.B.1.1.1'],
  '3.2.8':   ['BIO.A.2.1.1'],
  '3.3.8':   ['BIO.B.2.1.1']
};

export const KEYSTONE_INVERSE_BRIDGES = {
  'A1.1':  ['M08.B-E.1.1.1', 'M08.B-E.2.1.1'],
  'A1.2':  ['M08.B-E.3.1.1'],
  'L.F':   ['E08.A-K.1.1.1', 'E08.B-C.2.1.1'],
  'L.N':   ['E08.B-C.2.1.1', 'E08.B-C.3.1.1'],
  'BIO.A': ['3.1.8.A', '3.2.8.A'],
  'BIO.B': ['3.1.8.A', '3.3.8.A']
};

// ============================================================================
// 2. NORMALIZATION & HELPER UTILITIES
// ============================================================================

/**
 * Returns integer rank for any PA grade string.
 * @param {string|number} grade
 * @returns {number} 0 (Pre-K) to 14 (HS)
 */
export function getGradeRank(grade) {
  if (grade === null || grade === undefined) return 7;
  const str = String(grade).trim();
  if (GRADE_ORDER.hasOwnProperty(str)) return GRADE_ORDER[str];
  const upper = str.toUpperCase();
  if (GRADE_ORDER.hasOwnProperty(upper)) return GRADE_ORDER[upper];
  const num = parseInt(str, 10);
  if (!isNaN(num) && num >= 1 && num <= 12) {
    return GRADE_ORDER[String(num)] ?? 7;
  }
  return 7;
}

/**
 * Normalizes any standard code into canonical lookup key.
 * Handles casing, whitespace, leading zeroes, dashes, and Pre-K tokens.
 * @param {string} rawCode
 * @returns {string}
 */
export function normalizeCode(rawCode) {
  if (!rawCode || typeof rawCode !== 'string') return '';
  let code = rawCode.trim().toUpperCase();

  // Spaces to dots for PA Core / STEELS codes: "CC 2.1 K A 1" -> "CC.2.1.K.A.1"
  if (code.includes(' ')) {
    code = code.replace(/\s+/g, '.').replace(/\.+/g, '.');
  }

  // PSSA single-digit grade padding: M3.A-T.1.1.1 -> M03.A-T.1.1.1
  code = code.replace(/^([ME])(\d)\b/i, (_, subj, g) => `${subj}0${g}`);

  // Pre-K grade token normalization: PRE-K / PreK -> PREK
  code = code.replace(/PRE-K/gi, 'PREK');

  return code;
}

/**
 * Maps granular domain titles to 16 canonical domain families.
 * @param {string} domain
 * @returns {string}
 */
export function getDomainFamily(domain) {
  if (!domain) return '';
  const d = domain.toLowerCase();
  if (d.includes('number') || d.includes('counting') || d.includes('fraction') || d.includes('ratio') || d.includes('base ten') || d.includes('real number')) return 'numbers_operations';
  if (d.includes('algebra') || d.includes('expression') || d.includes('equation') || d.includes('function') || d.includes('pattern')) return 'algebraic_concepts';
  if (d.includes('geometry') || d.includes('pythagorean') || d.includes('coordinate')) return 'geometry';
  if (d.includes('measurement') || d.includes('data') || d.includes('time') || d.includes('money') || d.includes('volume') || d.includes('probability') || d.includes('statistics')) return 'measurement_data';
  if (d.includes('literature') || d.includes('fiction') || d.includes('story') || d.includes('literary')) return 'reading_literature';
  if (d.includes('informational') || d.includes('nonfiction') || d.includes('rhetoric')) return 'reading_informational';
  if (d.includes('writing') || d.includes('tda') || d.includes('text-dependent')) return 'writing';
  if (d.includes('speaking') || d.includes('listening')) return 'speaking_listening';
  if (d.includes('foundational') || d.includes('phonics') || d.includes('print')) return 'foundational_skills';
  if (d.includes('life science') || d.includes('biology') || d.includes('ecology') || d.includes('heredity') || d.includes('cell')) return 'life_science';
  if (d.includes('physical science') || d.includes('energy') || d.includes('matter') || d.includes('motion') || d.includes('waves') || d.includes('force')) return 'physical_science';
  if (d.includes('earth') || d.includes('space') || d.includes('climate') || d.includes('weather')) return 'earth_space';
  if (d.includes('environment') || d.includes('sustainability')) return 'environmental_literacy';
  if (d.includes('technology') || d.includes('engineering')) return 'technology_engineering';
  if (d.includes('health') || d.includes('body') || d.includes('physical activity')) return 'health_physical';
  if (d.includes('civics') || d.includes('government') || d.includes('history') || d.includes('geography') || d.includes('economics')) return 'social_studies';
  return d;
}

/**
 * Parses a standard code string into structured metadata.
 * @param {string} code
 * @returns {object|null}
 */
export function parseStandardCode(code) {
  if (!code || typeof code !== 'string') return null;
  const trimmed = code.trim();
  if (!trimmed) return null;

  const normalized = normalizeCode(trimmed);
  const existing = getStandardByCode(trimmed) || getStandardByCode(normalized);

  // 0. CCSS regex: CCSS.MATH.CONTENT.K.CC.A.1, CCSS.ELA-LITERACY.RL.K.1, CCSS.MATH.PRACTICE.MP1
  const ccssMatch = normalized.match(/^CCSS\.(MATH\.CONTENT|ELA-LITERACY|MATH\.PRACTICE)\.([A-Z0-9.-]+)/i);
  if (ccssMatch) {
    const isMath = ccssMatch[1].startsWith('MATH');
    return {
      rawCode: trimmed,
      normalizedCode: normalized,
      type: 'CCSS',
      subject: existing ? existing.subject : (isMath ? 'Mathematics' : 'English Language Arts'),
      grade: existing ? existing.grade : 'K-12',
      anchor: ccssMatch[2],
      domain: existing ? existing.domain : (isMath ? 'Mathematics' : 'English Language Arts'),
      standardNumber: ccssMatch[2],
      isValid: true
    };
  }

  // 1. PSSA regex: M04.A-T.1.1.1, E08.E.1.1.1
  const pssaMatch = normalized.match(/^([ME])(\d{2})\.([A-Z0-9-]+)(?:\.([A-Z0-9.-]+))?$/i);
  if (pssaMatch) {
    const subjChar = pssaMatch[1].toUpperCase();
    const gradeNum = parseInt(pssaMatch[2], 10);
    return {
      rawCode: trimmed,
      normalizedCode: normalized,
      type: 'PSSA',
      subject: existing ? existing.subject : (subjChar === 'M' ? 'Mathematics' : 'English Language Arts'),
      grade: String(gradeNum),
      anchor: pssaMatch[3],
      descriptor: pssaMatch[4] || null,
      standardNumber: pssaMatch[4] || null,
      domain: existing ? existing.domain : (subjChar === 'M' ? 'Mathematics' : 'English Language Arts'),
      isValid: true
    };
  }

  // 2. PA Core regex: CC.2.1.K.A.1, CC.1.2.4.A
  const coreMatch = normalized.match(/^CC\.([12])\.([1-4])\.(PREK|PK|K|\d{1,2}|11-12|9-10|HS)\.([A-Z0-9.]+)/i);
  if (coreMatch) {
    const isMath = coreMatch[1] === '2';
    return {
      rawCode: trimmed,
      normalizedCode: normalized,
      type: 'PA_CORE',
      subject: existing ? existing.subject : (isMath ? 'Mathematics' : 'English Language Arts'),
      grade: coreMatch[3].toUpperCase(),
      anchor: `CC.${coreMatch[1]}.${coreMatch[2]}.${coreMatch[3]}`,
      domain: existing ? existing.domain : (isMath ? 'Mathematics' : 'English Language Arts'),
      standardNumber: coreMatch[4],
      isValid: true
    };
  }

  // 3. Social Studies regex: 5.1.8.C, 6.1.8.A, 7.1.8.A, 8.2.8.B
  const socMatch = normalized.match(/^([5-8]\.\d+)\.(\d+)\.([A-Z0-9]+)/i);
  if (socMatch && (existing?.subject === 'Social Studies' || parseInt(socMatch[2], 10) >= 3)) {
    return {
      rawCode: trimmed,
      normalizedCode: normalized,
      type: 'SOCIAL_STUDIES',
      subject: 'Social Studies',
      grade: socMatch[2],
      anchor: socMatch[1],
      domain: existing ? existing.domain : 'Social Studies',
      standardNumber: socMatch[3],
      isValid: true
    };
  }

  // 4. STEELS Science: 3.1.PK.A, 3.2.4.B, 3.3.8.A
  const steelsMatch = normalized.match(/^3\.(\d+)\.(PREK|PK|K|\d{1,2}|3-5|6-8|9-12|HS|K-2)(?:\.([A-Z0-9.]+))?/i);
  if (steelsMatch) {
    return {
      rawCode: trimmed,
      normalizedCode: normalized,
      type: 'STEELS',
      subject: 'STEELS Science',
      grade: steelsMatch[2].toUpperCase(),
      anchor: `3.${steelsMatch[1]}`,
      domain: existing ? existing.domain : 'STEELS Science',
      standardNumber: steelsMatch[3] || null,
      isValid: true
    };
  }

  // 5. Early Learning: 10.1.PK.B1, AL.1.PK.A1, 9.1.M.1.J1 (grades PK, K, 1, 2)
  const earlyMatch = normalized.match(/^((?:\d+\.\d+(?:\.[A-Z])?|[A-Z]+\.\d+))\.(PREK|PK|K|[12])\.([A-Z0-9.]+)/i);
  if (earlyMatch) {
    return {
      rawCode: trimmed,
      normalizedCode: normalized,
      type: 'EARLY_LEARNING',
      subject: 'Early Learning',
      grade: earlyMatch[2].toUpperCase(),
      anchor: earlyMatch[1],
      domain: existing ? existing.domain : 'Early Learning',
      standardNumber: earlyMatch[3],
      isValid: true
    };
  }

  // 6. Keystone: A1.1.1.1.1, BIO.A.1.1.1, L.F.1.1.1
  const keystoneMatch = normalized.match(/^(A1|BIO|L|G)\.([A-Z0-9.]+)/i);
  if (keystoneMatch) {
    const subType = keystoneMatch[1].toUpperCase();
    let subj = 'Mathematics';
    if (subType === 'BIO') subj = 'STEELS Science';
    else if (subType === 'L') subj = 'English Language Arts';
    return {
      rawCode: trimmed,
      normalizedCode: normalized,
      type: 'KEYSTONE',
      subject: existing ? existing.subject : subj,
      grade: 'HS',
      anchor: subType,
      domain: existing ? existing.domain : subj,
      standardNumber: keystoneMatch[2],
      isValid: true
    };
  }

  // Fallback for existing items
  if (existing) {
    return {
      rawCode: trimmed,
      normalizedCode: normalized,
      type: existing.is_keystone ? 'KEYSTONE' : (existing.is_pssa_assessed ? 'PSSA' : 'GENERIC'),
      subject: existing.subject,
      grade: existing.grade,
      anchor: existing.anchor || null,
      domain: existing.domain,
      standardNumber: null,
      isValid: true
    };
  }

  return {
    rawCode: trimmed,
    normalizedCode: normalized,
    type: 'UNKNOWN',
    subject: null,
    grade: null,
    domain: null,
    anchor: null,
    standardNumber: null,
    isValid: false
  };
}

// ============================================================================
// 3. IN-MEMORY MULTI-INDEX STORE SETUP
// ============================================================================

const byId = new Map();
const byCode = new Map();
const byLowerCode = new Map();
const byNormalizedCode = new Map();
const byAltCode = new Map();
const bySubject = new Map();
const bySubjectAndGrade = new Map();
const bySubjectAndDomain = new Map();
const bySubjectAndDomainFamily = new Map();
const bySubjectGradeDomain = new Map();
const byAnchor = new Map();
const explicitPrereqsMap = new Map();
const explicitNextStepsMap = new Map();
const searchableBlobMap = new Map();

// Pass 1: Build enriched standards and register primary keys
const enrichedStandards = rawStandards.map(item => {
  const normCode = normalizeCode(item.code);
  const normId = normalizeCode(item.id);
  const lowerCode = (item.code || '').toLowerCase();
  const lowerId = (item.id || '').toLowerCase();

  // Synthesize and attach swbat
  const swbatObj = generateSWBAT(item);
  const enriched = {
    ...item,
    swbat: swbatObj.swbatText,
    swbatMetadata: swbatObj
  };

  byId.set(item.id, enriched);
  byCode.set(item.code, enriched);
  byLowerCode.set(lowerId, enriched);
  byLowerCode.set(lowerCode, enriched);
  byNormalizedCode.set(normId, enriched);
  byNormalizedCode.set(normCode, enriched);

  // Subject index
  if (!bySubject.has(item.subject)) bySubject.set(item.subject, []);
  bySubject.get(item.subject).push(enriched);

  // Subject + Grade index
  const sgKey = `${item.subject}|${item.grade}`;
  if (!bySubjectAndGrade.has(sgKey)) bySubjectAndGrade.set(sgKey, []);
  bySubjectAndGrade.get(sgKey).push(enriched);

  // Subject + Domain index
  const sdKey = `${item.subject}|${item.domain}`;
  if (!bySubjectAndDomain.has(sdKey)) bySubjectAndDomain.set(sdKey, []);
  bySubjectAndDomain.get(sdKey).push(enriched);

  // Subject + Domain Family index
  const family = getDomainFamily(item.domain);
  const sdfKey = `${item.subject}|${family}`;
  if (!bySubjectAndDomainFamily.has(sdfKey)) bySubjectAndDomainFamily.set(sdfKey, []);
  bySubjectAndDomainFamily.get(sdfKey).push(enriched);

  // Subject + Grade + Domain index
  const sgdKey = `${item.subject}|${item.grade}|${item.domain}`;
  if (!bySubjectGradeDomain.has(sgdKey)) bySubjectGradeDomain.set(sgdKey, []);
  bySubjectGradeDomain.get(sgdKey).push(enriched);

  // Anchor index
  if (item.anchor) {
    if (!byAnchor.has(item.anchor)) byAnchor.set(item.anchor, []);
    byAnchor.get(item.anchor).push(enriched);
  }

  // Build searchable text blob
  const codeLow = lowerCode;
  const altCodeLow = (item.alt_code || '').toLowerCase();
  const anchorLow = (item.anchor || '').toLowerCase();
  const domainLow = (item.domain || '').toLowerCase();
  const descLow = (item.description || '').toLowerCase();
  const subjectLow = (item.subject || '').toLowerCase();
  const gradeLow = String(item.grade || '').toLowerCase();

  let gradeAliases = `grade ${gradeLow} gr ${gradeLow} ${gradeLow}th grade`;
  if (gradeLow === 'k') gradeAliases += ' kindergarten kinder';
  if (gradeLow === 'pre-k' || gradeLow === 'pk') gradeAliases += ' prek prekindergarten early learning';
  if (gradeLow === 'hs') gradeAliases += ' high school secondary keystone';

  const keywordsStr = (item.keywords || []).join(' ').toLowerCase();
  const descriptorStr = (item.descriptor || '').toLowerCase();
  const limitsStr = (item.assessment_limits || '').toLowerCase();
  const crosswalksStr = (item.crosswalks || []).join(' ').toLowerCase();
  const clarifyingStr = (item.clarifying_statement || '').toLowerCase();

  const blob = `${codeLow} ${altCodeLow} ${anchorLow} ${domainLow} ${subjectLow} ${gradeLow} ${gradeAliases} ${descLow} ${descriptorStr} ${limitsStr} ${clarifyingStr} ${crosswalksStr} ${keywordsStr}`;
  searchableBlobMap.set(item.id, blob);

  return enriched;
});

// Pass 2: Register alt_codes and crosswalks where not conflicting with primary codes
enrichedStandards.forEach(item => {
  if (item.alt_code) {
    const rawAlt = item.alt_code.trim();
    const normAlt = normalizeCode(rawAlt);
    const lowAlt = rawAlt.toLowerCase();

    byAltCode.set(rawAlt, item);
    byAltCode.set(normAlt, item);
    byAltCode.set(lowAlt, item);

    if (!byLowerCode.has(lowAlt)) byLowerCode.set(lowAlt, item);
    if (!byNormalizedCode.has(normAlt)) byNormalizedCode.set(normAlt, item);
  }

  if (Array.isArray(item.crosswalks)) {
    item.crosswalks.forEach(cw => {
      const rawCw = cw.trim();
      const normCw = normalizeCode(rawCw);
      const lowCw = rawCw.toLowerCase();

      if (!byLowerCode.has(lowCw)) byLowerCode.set(lowCw, item);
      if (!byNormalizedCode.has(normCw)) byNormalizedCode.set(normCw, item);
    });
  }
});

// Pass 3: Build bidirectional explicit graph links
enrichedStandards.forEach(s => {
  if (!explicitPrereqsMap.has(s.id)) explicitPrereqsMap.set(s.id, new Set());
  if (!explicitNextStepsMap.has(s.id)) explicitNextStepsMap.set(s.id, new Set());

  // Direct prerequisites
  if (Array.isArray(s.prerequisites)) {
    s.prerequisites.forEach(pCode => {
      const target = getStandardByCode(pCode);
      if (target && target.id !== s.id) {
        explicitPrereqsMap.get(s.id).add(target);
        if (!explicitNextStepsMap.has(target.id)) explicitNextStepsMap.set(target.id, new Set());
        explicitNextStepsMap.get(target.id).add(s);
      }
    });
  }

  // Direct next_steps
  if (Array.isArray(s.next_steps)) {
    s.next_steps.forEach(nCode => {
      const target = getStandardByCode(nCode);
      if (target && target.id !== s.id) {
        explicitNextStepsMap.get(s.id).add(target);
        if (!explicitPrereqsMap.has(target.id)) explicitPrereqsMap.set(target.id, new Set());
        explicitPrereqsMap.get(target.id).add(s);
      }
    });
  }
});

// Pre-computed search index objects for sub-millisecond multi-token search
const searchIndex = enrichedStandards.map(item => ({
  item,
  codeLow: (item.code || '').toLowerCase(),
  altCodeLow: (item.alt_code || '').toLowerCase(),
  anchorLow: (item.anchor || '').toLowerCase(),
  domainLow: (item.domain || '').toLowerCase(),
  descLow: (item.description || '').toLowerCase(),
  subjectLow: (item.subject || '').toLowerCase(),
  gradeLow: String(item.grade || '').toLowerCase(),
  keywords: item.keywords || [],
  blob: searchableBlobMap.get(item.id) || ''
}));

// ============================================================================
// 4. PUBLIC STANDARD LOOKUP & STORE ACCESSORS
// ============================================================================

/**
 * Returns all indexed standards.
 * @returns {Array<object>}
 */
export function getAllStandards() {
  return enrichedStandards;
}

/**
 * Finds a standard by standard code, id, or alt_code.
 * O(1) in-memory lookup with case-insensitivity and whitespace tolerance.
 * @param {string} codeOrId
 * @returns {object|null}
 */
export function getStandardByCode(codeOrId) {
  if (!codeOrId || typeof codeOrId !== 'string') return null;
  const raw = codeOrId.trim();
  if (!raw) return null;

  // 1. Direct exact primary match
  if (byId.has(raw)) return byId.get(raw);
  if (byCode.has(raw)) return byCode.get(raw);

  // 2. Direct lowercase lookup
  const lower = raw.toLowerCase();
  if (byLowerCode.has(lower)) return byLowerCode.get(lower);

  // 3. Normalized uppercase code lookup
  const norm = normalizeCode(raw);
  if (byNormalizedCode.has(norm)) return byNormalizedCode.get(norm);

  // 5. Crosswalks & partial match fallback
  const foundMatch = enrichedStandards.find(s => 
    s.code === raw || 
    s.alt_code === raw || 
    (s.crosswalks && s.crosswalks.includes(raw)) ||
    s.code.toLowerCase().includes(lower) ||
    (s.alt_code && s.alt_code.toLowerCase().includes(lower))
  );
  if (foundMatch) return foundMatch;

  return null;
}

// ============================================================================
// 5. 5-TIER COHERENCE GRAPH RESOLUTION ENGINE
// ============================================================================

/**
 * Generates the complete 5-tier coherence graph neighborhood for a standard.
 * @param {string|object} standardOrCode
 * @returns {object|null}
 */
export function getCoherenceGraph(standardOrCode) {
  let focal = null;
  if (typeof standardOrCode === 'object' && standardOrCode !== null) {
    focal = standardOrCode.id ? getStandardByCode(standardOrCode.id) || standardOrCode : standardOrCode;
  } else if (typeof standardOrCode === 'string') {
    focal = getStandardByCode(standardOrCode);
  }

  // If focal not found directly, default to first available math standard as resilient fallback
  if (!focal && enrichedStandards.length > 0) {
    focal = enrichedStandards.find(s => s.subject === 'Mathematics') || enrichedStandards[0];
  }

  if (!focal) {
    // Safe graceful return for invalid inputs
    return {
      focalNode: null,
      target: null,
      upstream: [],
      prerequisites: [],
      downstream: [],
      nextSteps: [],
      horizontal: [],
      edges: [],
      stats: {
        totalConnections: 0,
        upstreamCount: 0,
        downstreamCount: 0,
        horizontalCount: 0,
        tierCounts: { tier1: 0, tier2: 0, tier3: 0, tier4: 0, tier5: 0 },
        isFoundational: true,
        isCapstone: true
      }
    };
  }

  const focalRank = getGradeRank(focal.grade);
  const upstream = [];
  const downstream = [];
  const horizontal = [];
  const edges = [];
  const seenNodeIds = new Set([focal.id]);
  const tierCounts = { tier1: 0, tier2: 0, tier3: 0, tier4: 0, tier5: 0 };

  function addNode(target, direction, tier, reason, isExplicit = false) {
    if (!target || seenNodeIds.has(target.id) || target.id === focal.id) return false;
    seenNodeIds.add(target.id);
    tierCounts[`tier${tier}`]++;

    const node = {
      ...target,
      relationshipType: direction,
      tier,
      isExplicit,
      gradeDifference: getGradeRank(target.grade) - focalRank,
      connectionReason: reason,
      swbat: target.swbat || generateSWBAT(target).swbatText
    };

    if (direction === 'prerequisite') {
      upstream.push(node);
      edges.push({ fromId: target.id, toId: focal.id, type: `tier${tier}_prerequisite` });
    } else if (direction === 'next_step') {
      downstream.push(node);
      edges.push({ fromId: focal.id, toId: target.id, type: `tier${tier}_next_step` });
    } else if (direction === 'horizontal') {
      horizontal.push(node);
      edges.push({ fromId: focal.id, toId: target.id, type: `tier${tier}_horizontal` });
    }
    return true;
  }

  // --------------------------------------------------------------------------
  // TIER 1: Explicit Links (Direct & Bidirectional Inverse from JSON)
  // --------------------------------------------------------------------------
  const prereqsSet = explicitPrereqsMap.get(focal.id);
  if (prereqsSet) {
    prereqsSet.forEach(target => {
      const targetRank = getGradeRank(target.grade);
      if (targetRank <= focalRank) {
        addNode(target, 'prerequisite', 1, 'Explicit prerequisite link in PA curriculum blueprint', true);
      } else {
        addNode(target, 'next_step', 1, 'Explicit prerequisite link pointing to future grade extension', true);
      }
    });
  }

  const nextStepsSet = explicitNextStepsMap.get(focal.id);
  if (nextStepsSet) {
    nextStepsSet.forEach(target => {
      const targetRank = getGradeRank(target.grade);
      if (targetRank >= focalRank) {
        addNode(target, 'next_step', 1, 'Explicit next-step learning pathway in PA curriculum blueprint', true);
      } else {
        addNode(target, 'prerequisite', 1, 'Explicit next-step link pointing to prior grade foundation', true);
      }
    });
  }

  // --------------------------------------------------------------------------
  // TIER 2: PSSA Assessment Anchors & Keystone Progression
  // --------------------------------------------------------------------------
  const normCode = normalizeCode(focal.code);

  // 1. PSSA anchor structural offset (M04.A-T.1.1.1 <-> M03.A-T.1.1.1 / M05.A-T.1.1.1)
  const pssaMatch = normCode.match(/^([ME])0?([3-8])\.([A-Z0-9.-]+)$/i);
  if (pssaMatch) {
    const subjChar = pssaMatch[1].toUpperCase();
    const gradeNum = parseInt(pssaMatch[2], 10);
    const suffix = pssaMatch[3];

    // Upstream (Grade - 1)
    if (upstream.length === 0 && gradeNum > 3) {
      const candCode = `${subjChar}0${gradeNum - 1}.${suffix}`;
      const cand = getStandardByCode(candCode);
      if (cand) {
        addNode(cand, 'prerequisite', 2, `PSSA Assessment Anchor Grade ${gradeNum - 1} foundational anchor progression`);
      }
    }

    // Downstream (Grade + 1)
    if (downstream.length === 0 && gradeNum < 8) {
      const candCode = `${subjChar}0${gradeNum + 1}.${suffix}`;
      const cand = getStandardByCode(candCode);
      if (cand) {
        addNode(cand, 'next_step', 2, `PSSA Assessment Anchor Grade ${gradeNum + 1} progression extension`);
      }
    }
  }

  // 2. Keystone High School Bridges (Grade 8 PSSA / STEELS -> Keystone Exams)
  for (const prefix in KEYSTONE_BRIDGES) {
    if (normCode.startsWith(prefix)) {
      const targets = KEYSTONE_BRIDGES[prefix];
      targets.forEach(tCode => {
        const target = getStandardByCode(tCode);
        if (target) {
          addNode(target, 'next_step', 2, `Pennsylvania Keystone Exam High School bridge from Grade 8`);
        }
      });
    }
  }

  // 3. Inverse Keystone Bridges (Keystone High School -> Grade 8 Foundations)
  for (const prefix in KEYSTONE_INVERSE_BRIDGES) {
    if (normCode.startsWith(prefix)) {
      const targets = KEYSTONE_INVERSE_BRIDGES[prefix];
      targets.forEach(tCode => {
        const target = getStandardByCode(tCode);
        if (target) {
          addNode(target, 'prerequisite', 2, `Foundational Grade 8 Assessment Anchor prerequisite for Keystone course`);
        }
      });
    }
  }

  // --------------------------------------------------------------------------
  // TIER 3: PA Core Grade Token Progressions
  // --------------------------------------------------------------------------
  const CORE_TOKEN_PATTERNS = [
    // PA Core: CC.1.2.4.A, CC.2.1.K.A.1, CC.1.4.11-12.G
    /^(CC\.[12]\.[1-4]\.)(PREK|PK|K|\d{1,2}|11-12|9-10|7-8|6-8|3-5|HS)(\..+)$/i,
    // Early Learning: 10.1.PK.B1, 9.1.D.PK.B1, AL.1.PK.A1, etc.
    /^((?:\d+\.\d+(?:\.[A-Z])?|[A-Z]+\.\d+)\.)(PREK|PK|K|\d{1,2})(\..+)$/i,
    // STEELS Science: 3.1.PK.A, 3.2.4.B, 3.3.8.A
    /^(3\.\d+\.)(PREK|PK|K|\d{1,2}|3-5|6-8|9-12|HS)(\..+)$/i
  ];

  for (const pattern of CORE_TOKEN_PATTERNS) {
    const match = normCode.match(pattern);
    if (match) {
      const prefix = match[1];
      const gradeToken = match[2].toUpperCase();
      const suffix = match[3];

      const normToken = gradeToken === 'PREK' || gradeToken === 'PRE-K' ? 'PK' : gradeToken;
      const idx = GRADE_SEQUENCE_TOKENS.indexOf(normToken);

      if (idx !== -1) {
        // Upstream step
        if (upstream.length === 0) {
          for (let i = idx - 1; i >= 0; i--) {
            const tok1 = GRADE_SEQUENCE_TOKENS[i];
            const tok2 = GRADE_SEQUENCE_ALT_TOKENS[i];
            const cand = getStandardByCode(`${prefix}${tok1}${suffix}`) || getStandardByCode(`${prefix}${tok2}${suffix}`);
            if (cand) {
              addNode(cand, 'prerequisite', 3, `PA Core grade-token vertical progression from Grade ${cand.grade}`);
              break;
            }
          }
        }

        // Downstream step
        if (downstream.length === 0) {
          for (let i = idx + 1; i < GRADE_SEQUENCE_TOKENS.length; i++) {
            const tok1 = GRADE_SEQUENCE_TOKENS[i];
            const tok2 = GRADE_SEQUENCE_ALT_TOKENS[i];
            const cand = getStandardByCode(`${prefix}${tok1}${suffix}`) || getStandardByCode(`${prefix}${tok2}${suffix}`);
            if (cand) {
              addNode(cand, 'next_step', 3, `PA Core grade-token vertical extension to Grade ${cand.grade}`);
              break;
            }
          }
        }
      }
      break;
    }
  }

  // --------------------------------------------------------------------------
  // TIER 4: Vertical Domain & Anchor Heuristics
  // --------------------------------------------------------------------------
  // If upstream or downstream is still empty for non-terminal grades, search nearest grade
  const isNonFoundational = focalRank > 0;
  const isNonCapstone = focalRank < 14 && focal.grade !== '12' && !focal.is_keystone && !(focal.subject === 'Early Learning' && focal.grade === '2');

  if ((upstream.length === 0 && isNonFoundational) || (downstream.length === 0 && isNonCapstone)) {
    // Fast O(1) domain family candidate pool
    const family = getDomainFamily(focal.domain);
    let candidatePool = bySubjectAndDomain.get(`${focal.subject}|${focal.domain}`) ||
      bySubjectAndDomainFamily.get(`${focal.subject}|${family}`) ||
      bySubject.get(focal.subject) || [];

    // Upstream Heuristic
    if (upstream.length === 0 && isNonFoundational) {
      const lowerCandidates = candidatePool.filter(c => getGradeRank(c.grade) < focalRank);
      if (lowerCandidates.length > 0) {
        const maxRank = Math.max(...lowerCandidates.map(c => getGradeRank(c.grade)));
        const bestCandidates = lowerCandidates.filter(c => getGradeRank(c.grade) === maxRank);

        bestCandidates.sort((a, b) => {
          let scoreA = (a.domain === focal.domain ? 20 : 0) + (a.anchor === focal.anchor ? 10 : 0);
          let scoreB = (b.domain === focal.domain ? 20 : 0) + (b.anchor === focal.anchor ? 10 : 0);
          return scoreB - scoreA;
        });

        bestCandidates.slice(0, 3).forEach(c => {
          addNode(c, 'prerequisite', 4, `Closest adjacent Grade ${c.grade} foundation in ${c.domain}`);
        });
      }
    }

    // Downstream Heuristic
    if (downstream.length === 0 && isNonCapstone) {
      const higherCandidates = candidatePool.filter(c => getGradeRank(c.grade) > focalRank);
      if (higherCandidates.length > 0) {
        const minRank = Math.min(...higherCandidates.map(c => getGradeRank(c.grade)));
        const bestCandidates = higherCandidates.filter(c => getGradeRank(c.grade) === minRank);

        bestCandidates.sort((a, b) => {
          let scoreA = (a.domain === focal.domain ? 20 : 0) + (a.anchor === focal.anchor ? 10 : 0);
          let scoreB = (b.domain === focal.domain ? 20 : 0) + (b.anchor === focal.anchor ? 10 : 0);
          return scoreB - scoreA;
        });

        bestCandidates.slice(0, 3).forEach(c => {
          addNode(c, 'next_step', 4, `Closest adjacent Grade ${c.grade} extension in ${c.domain}`);
        });
      }
    }
  }

  // --------------------------------------------------------------------------
  // TIER 5: Horizontal Conceptual Connections (Same Grade)
  // --------------------------------------------------------------------------
  const sameGradePool = bySubjectAndGrade.get(`${focal.subject}|${focal.grade}`) || [];
  const horizontalCandidates = sameGradePool.filter(c => c.id !== focal.id && !seenNodeIds.has(c.id));

  horizontalCandidates.sort((a, b) => {
    let scoreA = (a.domain === focal.domain ? 20 : 0) + (a.anchor === focal.anchor ? 10 : 0);
    let scoreB = (b.domain === focal.domain ? 20 : 0) + (b.anchor === focal.anchor ? 10 : 0);
    return scoreB - scoreA;
  });

  horizontalCandidates.slice(0, 4).forEach(c => {
    addNode(c, 'horizontal', 5, `Same-grade conceptual standard in ${c.domain}`);
  });

  const focalNodeData = {
    ...focal,
    relationshipType: 'focal',
    swbat: focal.swbat || generateSWBAT(focal).swbatText
  };

  return {
    focalNode: focalNodeData,
    target: focalNodeData,
    upstream,
    prerequisites: upstream,
    downstream,
    nextSteps: downstream,
    horizontal,
    edges,
    stats: {
      totalConnections: upstream.length + downstream.length + horizontal.length,
      upstreamCount: upstream.length,
      downstreamCount: downstream.length,
      horizontalCount: horizontal.length,
      tierCounts,
      isFoundational: upstream.length === 0,
      isCapstone: downstream.length === 0
    }
  };
}

// ============================================================================
// 6. MULTI-FIELD SEARCH ENGINE
// ============================================================================

/**
 * Searches standards by standard code, alt code, anchor, domain, keywords, or full description.
 * Applies tiered relevance scoring, grade-alias expansion, and AND-token matching.
 * @param {string} query
 * @param {number} [limit=20]
 * @returns {Array<object>}
 */
export function searchStandards(query, limit = 20) {
  if (!query || typeof query !== 'string') return [];
  const clean = query.trim().toLowerCase();
  if (clean.length === 0) return [];

  const tokens = clean.split(/\s+/).filter(Boolean);
  const scored = [];

  for (let i = 0; i < searchIndex.length; i++) {
    const sObj = searchIndex[i];
    const { item, codeLow, altCodeLow, anchorLow, domainLow, descLow, subjectLow, gradeLow, keywords, blob } = sObj;

    let score = 0;

    // Direct Exact / Prefix Matches on Codes
    if (codeLow === clean) score += 10000;
    else if (altCodeLow === clean) score += 9000;
    else if (codeLow.startsWith(clean)) score += 5000;
    else if (altCodeLow && altCodeLow.startsWith(clean)) score += 4000;
    else if (codeLow.includes(clean)) score += 2000;

    // Anchor & Domain Matches
    if (anchorLow && anchorLow === clean) score += 1500;
    else if (anchorLow && anchorLow.includes(clean)) score += 800;

    if (domainLow === clean) score += 1200;
    else if (domainLow.includes(clean)) score += 600;

    // Tokenized Blob Search
    let allTokensMatch = true;
    let tokenScore = 0;

    for (let t = 0; t < tokens.length; t++) {
      const tok = tokens[t];
      if (!blob.includes(tok)) {
        allTokensMatch = false;
        break;
      }
      if (codeLow.includes(tok)) tokenScore += 300;
      if (anchorLow.includes(tok)) tokenScore += 150;
      if (domainLow.includes(tok)) tokenScore += 100;
      if (keywords.includes(tok)) tokenScore += 50;
      if (descLow.includes(tok)) tokenScore += 40;
      if (subjectLow.includes(tok) || gradeLow.includes(tok)) tokenScore += 30;
    }

    if (!allTokensMatch && score === 0) continue;

    score += tokenScore;
    if (score > 0) {
      scored.push({ item, score });
    }
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const gA = GRADE_ORDER[a.item.grade] ?? 99;
    const gB = GRADE_ORDER[b.item.grade] ?? 99;
    if (gA !== gB) return gA - gB;
    return a.item.code.localeCompare(b.item.code);
  });

  return scored.slice(0, limit).map(s => s.item);
}

// ============================================================================
// 7. CASCADING FILTER SELECTORS
// ============================================================================

let cachedFilterOptions = null;

/**
 * Returns distinct subjects, grades, and cascading domain selectors.
 * @returns {object}
 */
export function getFilterOptions() {
  if (cachedFilterOptions) return cachedFilterOptions;

  const subjectsSet = new Set();
  const gradesSet = new Set();
  const gradesBySubject = {};
  const domainsBySubject = {};
  const domainsBySubjectAndGrade = {};

  enrichedStandards.forEach(s => {
    subjectsSet.add(s.subject);
    gradesSet.add(s.grade);

    if (!gradesBySubject[s.subject]) gradesBySubject[s.subject] = new Set();
    gradesBySubject[s.subject].add(s.grade);

    if (!domainsBySubject[s.subject]) domainsBySubject[s.subject] = new Set();
    domainsBySubject[s.subject].add(s.domain);

    const sgKey = `${s.subject}|${s.grade}`;
    if (!domainsBySubjectAndGrade[sgKey]) domainsBySubjectAndGrade[sgKey] = new Set();
    domainsBySubjectAndGrade[sgKey].add(s.domain);
  });

  const sortGrades = (arr) => Array.from(arr).sort((a, b) => (getGradeRank(a)) - (getGradeRank(b)));

  const sortedSubjects = Array.from(subjectsSet).sort(
    (a, b) => (SUBJECT_PRIORITY[a] ?? 99) - (SUBJECT_PRIORITY[b] ?? 99)
  );

  const result = {
    subjects: sortedSubjects,
    grades: sortGrades(gradesSet),
    gradesBySubject: {},
    domains: {},
    domainsBySubject: {},
    domainsBySubjectAndGrade: {}
  };

  for (const subj in gradesBySubject) {
    result.gradesBySubject[subj] = sortGrades(gradesBySubject[subj]);
  }
  for (const subj in domainsBySubject) {
    const sortedDoms = Array.from(domainsBySubject[subj]).sort();
    result.domains[subj] = sortedDoms;
    result.domainsBySubject[subj] = sortedDoms;
  }
  for (const key in domainsBySubjectAndGrade) {
    result.domainsBySubjectAndGrade[key] = Array.from(domainsBySubjectAndGrade[key]).sort();
  }

  cachedFilterOptions = result;
  return cachedFilterOptions;
}

/**
 * Filters standards by subject, grade, and domain with wildcard support.
 * @param {object} [filters={}]
 * @returns {Array<object>}
 */
export function getStandardsByFilter(filters = {}) {
  const { subject, grade, domain } = filters;

  const filtered = enrichedStandards.filter(s => {
    // Subject filter
    if (subject && subject !== 'All' && s.subject !== subject) {
      return false;
    }
    // Grade filter (single grade string or array of grades)
    if (grade && grade !== 'All') {
      if (Array.isArray(grade)) {
        if (!grade.includes('All') && !grade.includes(s.grade)) return false;
      } else if (s.grade !== grade) {
        return false;
      }
    }
    // Domain filter
    if (domain && domain !== 'All' && s.domain !== domain) {
      return false;
    }
    return true;
  });

  filtered.sort((a, b) => {
    const gA = getGradeRank(a.grade);
    const gB = getGradeRank(b.grade);
    if (gA !== gB) return gA - gB;
    return a.code.localeCompare(b.code);
  });

  return filtered;
}

// ============================================================================
// 8. BREADCRUMB HISTORY MANAGER
// ============================================================================

/**
 * Adds a standard code to navigation history with loop suppression and length capping.
 * @param {Array<string>} [history=[]]
 * @param {string} nextCode
 * @param {number} [maxLen=10]
 * @returns {Array<string>}
 */
export function addBreadcrumb(history = [], nextCode, maxLen = 10) {
  if (!Array.isArray(history)) history = [];
  if (!nextCode || typeof nextCode !== 'string' || !nextCode.trim()) {
    return [...history];
  }

  const cleanCode = nextCode.trim();

  // Case-insensitive loop detection
  const existingIndex = history.findIndex(
    code => typeof code === 'string' && code.trim().toLowerCase() === cleanCode.toLowerCase()
  );

  if (existingIndex !== -1) {
    // Truncate back to prior visit point
    return history.slice(0, existingIndex + 1);
  }

  // Append new step
  const nextHistory = [...history, cleanCode];

  // Enforce max length constraint
  if (nextHistory.length > maxLen) {
    return nextHistory.slice(nextHistory.length - maxLen);
  }

  return nextHistory;
}

// ============================================================================
// 9. SWBAT OBJECTIVE & DOK GENERATOR
// ============================================================================

/**
 * Synthesizes dynamic student-friendly learning objectives (SWBAT)
 * matching Bloom's taxonomy & Webb's Depth of Knowledge (DOK).
 *
 * Supports both object property access and string coercion.
 * @param {object|string} standardOrCode
 * @returns {object}
 */
export function generateSWBAT(standardOrCode) {
  let standard = standardOrCode;
  if (typeof standardOrCode === 'string') {
    standard = getStandardByCode(standardOrCode);
  }

  if (!standard) {
    const fallback = {
      swbatText: 'Students will be able to demonstrate mastery of the targeted concept.',
      dokLevel: 1,
      dokName: DOK_METADATA[1].name,
      actionVerb: 'demonstrate',
      bloomsLevel: 'Understand',
      toString() { return this.swbatText; }
    };
    return fallback;
  }

  const rawText = (standard.clean_intro || standard.description || standard.anchor || '').trim();
  if (!rawText) {
    const fallback = {
      swbatText: 'Students will be able to understand key curriculum concepts.',
      dokLevel: 1,
      dokName: DOK_METADATA[1].name,
      actionVerb: 'understand',
      bloomsLevel: 'Understand',
      toString() { return this.swbatText; }
    };
    return fallback;
  }

  // Strip standard prefixes
  let cleaned = rawText
    .replace(/^students who demonstrate understanding can\s+/i, '')
    .replace(/^students will be able to\s+/i, '')
    .replace(/^students are expected to\s+/i, '')
    .replace(/^the student will\s+/i, '')
    .replace(/^the student can\s+/i, '')
    .replace(/^students can\s+/i, '')
    .trim();

  // Extract preamble (e.g. "With prompting and support,")
  let preamble = '';
  const preambleMatch = cleaned.match(/^(with\s+[^,]+,\s*)(.*)/i);
  if (preambleMatch) {
    preamble = preambleMatch[1].trim();
    cleaned = preambleMatch[2].trim();
  }

  // Find recognized action verb in the first 4 words
  let actionVerb = '';
  let verbInfo = null;
  const searchWords = cleaned.split(/\s+/).slice(0, 4);

  for (const w of searchWords) {
    const cleanW = w.toLowerCase().replace(/[^a-z]/g, '');
    if (VERB_DICTIONARY[cleanW]) {
      actionVerb = cleanW;
      verbInfo = VERB_DICTIONARY[cleanW];
      break;
    }
  }

  if (!actionVerb) {
    const firstWord = (cleaned.split(/\s+/)[0] || 'demonstrate').toLowerCase().replace(/[^a-z]/g, '');
    actionVerb = firstWord || 'demonstrate';
    verbInfo = VERB_DICTIONARY[actionVerb] || { dok: 2, blooms: 'Apply' };
  }

  // Determine DOK from standard.dok field if available
  let dokLevel = verbInfo.dok;
  if (standard.dok) {
    const dokMatch = String(standard.dok).match(/\d+/);
    if (dokMatch) {
      dokLevel = parseInt(dokMatch[0], 10);
    }
  }
  if (!DOK_METADATA[dokLevel]) dokLevel = 2;

  // Format main sentence body
  let mainBody = cleaned;
  if (mainBody.length > 0) {
    mainBody = mainBody.charAt(0).toLowerCase() + mainBody.slice(1);
  }
  mainBody = mainBody.replace(/\.+$/, '');

  let swbatText = '';
  if (preamble) {
    const lowerPreamble = preamble.charAt(0).toLowerCase() + preamble.slice(1);
    swbatText = `Students will be able to, ${lowerPreamble.replace(/,\s*$/, '')}, ${mainBody}.`;
  } else {
    swbatText = `Students will be able to ${mainBody}.`;
  }

  return {
    swbatText,
    dokLevel,
    dokName: DOK_METADATA[dokLevel].name,
    actionVerb,
    bloomsLevel: verbInfo.blooms,
    toString() { return this.swbatText; }
  };
}
