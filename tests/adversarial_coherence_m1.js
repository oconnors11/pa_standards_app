/**
 * @file adversarial_coherence_m1.js
 * Adversarial Challenger 2 verification script for Milestone 1: Coherence Graph Engine.
 *
 * Tests:
 * 1. Pedagogical Monotonicity across all 2,489 standards in all 5 subject areas.
 *    - G_upstream <= G_focal
 *    - G_downstream >= G_focal
 *    - G_horizontal == G_focal
 * 2. SWBAT Objective & DOK Generator across 100+ random and all 2,489 standards.
 *    - Prefix check ("Students will be able to")
 *    - Meaningful action verb extraction
 *    - Valid DOK level (1-4) & metadata matching
 *    - Valid Bloom's taxonomy category
 * 3. Filter Options & getStandardsByFilter across all combinations.
 *    - Subject, Grade, Domain combinations
 *    - Array of grades, "All" wildcards, empty filters
 *    - Monotonic ordering of filtered results
 *    - Cascading options consistency
 * 4. Performance & Graph structural invariants.
 */

import {
  getAllStandards,
  getStandardByCode,
  getCoherenceGraph,
  searchStandards,
  getFilterOptions,
  getStandardsByFilter,
  addBreadcrumb,
  generateSWBAT,
  parseStandardCode,
  normalizeCode,
  getGradeRank,
  GRADE_ORDER,
  DOK_METADATA,
  VERB_DICTIONARY
} from '../src/utils/coherenceGraph.js';

console.log('================================================================');
console.log('ADVERSARIAL VERIFICATION HARNESS — CHALLENGER 2 (MILESTONE 1)');
console.log('================================================================\n');

const allStandards = getAllStandards();
console.log(`Loaded ${allStandards.length} total standards from coherenceGraph engine.`);

const results = {
  monotonicity: {
    totalChecked: 0,
    upstreamChecked: 0,
    downstreamChecked: 0,
    horizontalChecked: 0,
    upstreamViolations: [],
    downstreamViolations: [],
    horizontalViolations: []
  },
  swbat: {
    totalChecked: 0,
    prefixFailures: [],
    verbFailures: [],
    dokFailures: [],
    bloomsFailures: [],
    sample100: []
  },
  filters: {
    combinationsTested: 0,
    failures: []
  },
  edgeInvariants: {
    totalEdges: 0,
    invalidEdges: [],
    duplicateNodes: []
  }
};

// ----------------------------------------------------------------------------
// TEST 1: PEDAGOGICAL MONOTONICITY ACROSS ALL 2,489 STANDARDS & 5 SUBJECTS
// ----------------------------------------------------------------------------
console.log('\n--- 1. Testing Pedagogical Monotonicity ---');

const subjectCounts = {};

for (const focal of allStandards) {
  results.monotonicity.totalChecked++;
  subjectCounts[focal.subject] = (subjectCounts[focal.subject] || 0) + 1;

  const focalRank = getGradeRank(focal.grade);
  const graph = getCoherenceGraph(focal);

  // Check self-exclusion
  const allNeighbors = [...graph.upstream, ...graph.downstream, ...graph.horizontal];
  const neighborIds = new Set();

  for (const n of allNeighbors) {
    if (n.id === focal.id) {
      results.edgeInvariants.duplicateNodes.push({
        focalId: focal.id,
        issue: 'Focal node included in its own neighborhood'
      });
    }
    if (neighborIds.has(n.id)) {
      results.edgeInvariants.duplicateNodes.push({
        focalId: focal.id,
        duplicateId: n.id,
        issue: 'Duplicate neighbor node in neighborhood'
      });
    }
    neighborIds.add(n.id);
  }

  // Check upstream: G_upstream <= G_focal
  for (const up of graph.upstream) {
    results.monotonicity.upstreamChecked++;
    const upRank = getGradeRank(up.grade);
    if (upRank > focalRank) {
      results.monotonicity.upstreamViolations.push({
        focal: { id: focal.id, code: focal.code, grade: focal.grade, rank: focalRank, subject: focal.subject },
        neighbor: { id: up.id, code: up.code, grade: up.grade, rank: upRank, subject: up.subject },
        tier: up.tier,
        reason: up.connectionReason
      });
    }
  }

  // Check downstream: G_downstream >= G_focal
  for (const down of graph.downstream) {
    results.monotonicity.downstreamChecked++;
    const downRank = getGradeRank(down.grade);
    if (downRank < focalRank) {
      results.monotonicity.downstreamViolations.push({
        focal: { id: focal.id, code: focal.code, grade: focal.grade, rank: focalRank, subject: focal.subject },
        neighbor: { id: down.id, code: down.code, grade: down.grade, rank: downRank, subject: down.subject },
        tier: down.tier,
        reason: down.connectionReason
      });
    }
  }

  // Check horizontal: G_horizontal == G_focal
  for (const horiz of graph.horizontal) {
    results.monotonicity.horizontalChecked++;
    const horizRank = getGradeRank(horiz.grade);
    if (horizRank !== focalRank) {
      results.monotonicity.horizontalViolations.push({
        focal: { id: focal.id, code: focal.code, grade: focal.grade, rank: focalRank, subject: focal.subject },
        neighbor: { id: horiz.id, code: horiz.code, grade: horiz.grade, rank: horizRank, subject: horiz.subject },
        tier: horiz.tier,
        reason: horiz.connectionReason
      });
    }
  }

  // Check edges consistency
  for (const edge of graph.edges) {
    results.edgeInvariants.totalEdges++;
    if (edge.type.includes('prerequisite')) {
      if (edge.toId !== focal.id) {
        results.edgeInvariants.invalidEdges.push({ edge, focalId: focal.id, issue: 'Prereq edge toId !== focal.id' });
      }
    } else if (edge.type.includes('next_step')) {
      if (edge.fromId !== focal.id) {
        results.edgeInvariants.invalidEdges.push({ edge, focalId: focal.id, issue: 'Next-step edge fromId !== focal.id' });
      }
    } else if (edge.type.includes('horizontal')) {
      if (edge.fromId !== focal.id) {
        results.edgeInvariants.invalidEdges.push({ edge, focalId: focal.id, issue: 'Horizontal edge fromId !== focal.id' });
      }
    }
  }
}

console.log(`Monotonicity Summary:`);
console.log(`- Total Standards Evaluated: ${results.monotonicity.totalChecked}`);
console.log(`- Subject Breakdown:`, subjectCounts);
console.log(`- Upstream Nodes Checked: ${results.monotonicity.upstreamChecked} (Violations: ${results.monotonicity.upstreamViolations.length})`);
console.log(`- Downstream Nodes Checked: ${results.monotonicity.downstreamChecked} (Violations: ${results.monotonicity.downstreamViolations.length})`);
console.log(`- Horizontal Nodes Checked: ${results.monotonicity.horizontalChecked} (Violations: ${results.monotonicity.horizontalViolations.length})`);
console.log(`- Edge Invariants Checked: ${results.edgeInvariants.totalEdges} (Invalid Edges: ${results.edgeInvariants.invalidEdges.length})`);
console.log(`- Self / Duplicate Node Collisions: ${results.edgeInvariants.duplicateNodes.length}`);

// ----------------------------------------------------------------------------
// TEST 2: SWBAT GENERATOR VERIFICATION ACROSS DATASET & 100+ RANDOM SAMPLES
// ----------------------------------------------------------------------------
console.log('\n--- 2. Testing SWBAT Objective & DOK Generator ---');

const VALID_BLOOMS = new Set(['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create']);

// Deterministic seed PRNG for reproducible random 120 samples
function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}
const rng = mulberry32(20260815);

// Test across ALL standards
for (const s of allStandards) {
  results.swbat.totalChecked++;
  const swbat = generateSWBAT(s);

  // 1. Prefix check
  if (!swbat.swbatText || !swbat.swbatText.startsWith('Students will be able to')) {
    results.swbat.prefixFailures.push({ id: s.id, code: s.code, swbatText: swbat.swbatText });
  }

  // 2. Meaningful action verb
  if (!swbat.actionVerb || typeof swbat.actionVerb !== 'string' || !/^[a-z]+$/i.test(swbat.actionVerb)) {
    results.swbat.verbFailures.push({ id: s.id, code: s.code, actionVerb: swbat.actionVerb });
  }

  // 3. DOK Level (1-4)
  if (![1, 2, 3, 4].includes(swbat.dokLevel) || swbat.dokName !== DOK_METADATA[swbat.dokLevel]?.name) {
    results.swbat.dokFailures.push({ id: s.id, code: s.code, dokLevel: swbat.dokLevel, dokName: swbat.dokName });
  }

  // 4. Bloom's Taxonomy category
  if (!VALID_BLOOMS.has(swbat.bloomsLevel)) {
    results.swbat.bloomsFailures.push({ id: s.id, code: s.code, bloomsLevel: swbat.bloomsLevel });
  }
}

// Extract 120 stratified random samples across subjects
const sampledIndices = new Set();
while (sampledIndices.size < 120) {
  const idx = Math.floor(rng() * allStandards.length);
  sampledIndices.add(idx);
}

for (const idx of sampledIndices) {
  const s = allStandards[idx];
  const obj = generateSWBAT(s);
  results.swbat.sample100.push({
    code: s.code,
    subject: s.subject,
    grade: s.grade,
    verb: obj.actionVerb,
    dok: obj.dokLevel,
    blooms: obj.bloomsLevel,
    textPreview: obj.swbatText.length > 80 ? obj.swbatText.slice(0, 80) + '...' : obj.swbatText
  });
}

console.log(`SWBAT Generator Summary:`);
console.log(`- Total Standards Checked: ${results.swbat.totalChecked}`);
console.log(`- Prefix Failures ("Students will be able to"): ${results.swbat.prefixFailures.length}`);
console.log(`- Verb Extraction Failures: ${results.swbat.verbFailures.length}`);
console.log(`- DOK 1-4 Level Failures: ${results.swbat.dokFailures.length}`);
console.log(`- Bloom's Category Failures: ${results.swbat.bloomsFailures.length}`);
console.log(`- Stratified Random Samples Collected: ${results.swbat.sample100.length}`);

// Print 5 sample SWBATs
console.log(`\nSample SWBAT Objectives:`);
results.swbat.sample100.slice(0, 5).forEach((sample, i) => {
  console.log(`  ${i + 1}. [${sample.code}] (${sample.subject} Gr ${sample.grade}) [DOK ${sample.dok} - ${sample.blooms}]`);
  console.log(`     Verb: "${sample.verb}" -> ${sample.textPreview}`);
});

// ----------------------------------------------------------------------------
// TEST 3: CASCADING FILTERS & getStandardsByFilter VERIFICATION
// ----------------------------------------------------------------------------
console.log('\n--- 3. Testing Cascading Filters & getStandardsByFilter ---');

const filterOpts = getFilterOptions();

// Verify filter options structure
console.log(`Filter Options extracted:`);
console.log(`- Subjects (${filterOpts.subjects.length}):`, filterOpts.subjects);
console.log(`- Grades (${filterOpts.grades.length}):`, filterOpts.grades);
console.log(`- Domains by Subject:`, Object.fromEntries(
  Object.entries(filterOpts.domainsBySubject).map(([k, v]) => [k, v.length])
));

// Test 1: Empty filter returns all 2,489
results.filters.combinationsTested++;
const allFiltered = getStandardsByFilter({});
if (allFiltered.length !== 2489) {
  results.filters.failures.push({ test: 'Empty filter {}', expected: 2489, actual: allFiltered.length });
}

// Test 2: "All" wildcards
results.filters.combinationsTested++;
const allWildcard = getStandardsByFilter({ subject: 'All', grade: 'All', domain: 'All' });
if (allWildcard.length !== 2489) {
  results.filters.failures.push({ test: 'Wildcard {subject: All, grade: All, domain: All}', expected: 2489, actual: allWildcard.length });
}

// Test 3: Filter by each Subject individually
for (const subj of filterOpts.subjects) {
  results.filters.combinationsTested++;
  const filtered = getStandardsByFilter({ subject: subj });
  const expected = allStandards.filter(s => s.subject === subj);
  if (filtered.length !== expected.length) {
    results.filters.failures.push({ test: `Subject: ${subj}`, expected: expected.length, actual: filtered.length });
  }

  // Test ordering: should be monotonically non-decreasing in grade rank, then code
  for (let i = 1; i < filtered.length; i++) {
    const prevRank = getGradeRank(filtered[i - 1].grade);
    const currRank = getGradeRank(filtered[i].grade);
    if (prevRank > currRank) {
      results.filters.failures.push({ test: `Subject ordering: ${subj}`, issue: `Unsorted grade at index ${i}` });
      break;
    }
  }
}

// Test 4: Filter by each Subject and Grade pair
for (const subj of filterOpts.subjects) {
  const grades = filterOpts.gradesBySubject[subj] || [];
  for (const gr of grades) {
    results.filters.combinationsTested++;
    const filtered = getStandardsByFilter({ subject: subj, grade: gr });
    const expected = allStandards.filter(s => s.subject === subj && s.grade === gr);
    if (filtered.length !== expected.length) {
      results.filters.failures.push({ test: `Subject: ${subj}, Grade: ${gr}`, expected: expected.length, actual: filtered.length });
    }

    // Verify all returned items match criteria
    for (const item of filtered) {
      if (item.subject !== subj || item.grade !== gr) {
        results.filters.failures.push({ test: `Item mismatch for ${subj}/${gr}`, item: item.id });
      }
    }
  }
}

// Test 5: Filter by (Subject, Grade, Domain) triplets
let tripletSamples = 0;
for (const subj of filterOpts.subjects) {
  const grades = filterOpts.gradesBySubject[subj] || [];
  for (const gr of grades) {
    const domains = filterOpts.domainsBySubjectAndGrade[`${subj}|${gr}`] || [];
    for (const dom of domains) {
      tripletSamples++;
      results.filters.combinationsTested++;
      const filtered = getStandardsByFilter({ subject: subj, grade: gr, domain: dom });
      const expected = allStandards.filter(s => s.subject === subj && s.grade === gr && s.domain === dom);
      if (filtered.length !== expected.length) {
        results.filters.failures.push({ test: `Triplet: ${subj}|${gr}|${dom}`, expected: expected.length, actual: filtered.length });
      }
      for (const item of filtered) {
        if (item.subject !== subj || item.grade !== gr || item.domain !== dom) {
          results.filters.failures.push({ test: `Triplet mismatch: ${item.id}` });
        }
      }
    }
  }
}

// Test 6: Array of grades filter (e.g. ['3', '4', '5'])
results.filters.combinationsTested++;
const mathGrades3to5 = getStandardsByFilter({ subject: 'Mathematics', grade: ['3', '4', '5'] });
const expectedMath3to5 = allStandards.filter(s => s.subject === 'Mathematics' && ['3', '4', '5'].includes(s.grade));
if (mathGrades3to5.length !== expectedMath3to5.length) {
  results.filters.failures.push({ test: 'Array grade filter [3, 4, 5]', expected: expectedMath3to5.length, actual: mathGrades3to5.length });
}

// Test 7: Non-matching filter (non-existent domain)
results.filters.combinationsTested++;
const nonExistent = getStandardsByFilter({ subject: 'Mathematics', domain: 'Quantum Mechanics In Kindergarten' });
if (nonExistent.length !== 0) {
  results.filters.failures.push({ test: 'Non-existent domain filter', expected: 0, actual: nonExistent.length });
}

console.log(`Filter Tests Summary:`);
console.log(`- Combinations Tested: ${results.filters.combinationsTested} (including ${tripletSamples} subject-grade-domain triplets)`);
console.log(`- Filter Failures: ${results.filters.failures.length}`);

// ----------------------------------------------------------------------------
// TEST 4: BREADCRUMBS & SEARCH ENGINE STRESS
// ----------------------------------------------------------------------------
console.log('\n--- 4. Testing Breadcrumbs & Search Invariants ---');

let bc = [];
bc = addBreadcrumb(bc, 'CC.2.1.K.A.1');
bc = addBreadcrumb(bc, 'CC.2.1.1.B.1');
bc = addBreadcrumb(bc, 'CC.2.1.2.B.2');
bc = addBreadcrumb(bc, 'CC.2.1.3.C.1');
bc = addBreadcrumb(bc, 'CC.2.1.1.B.1'); // Loop back to step 2

const bcLoopCorrect = (bc.length === 2 && bc[0] === 'CC.2.1.K.A.1' && bc[1] === 'CC.2.1.1.B.1');
console.log(`- Breadcrumb loop suppression: ${bcLoopCorrect ? 'PASS' : 'FAIL'} (Trail: ${bc.join(' -> ')})`);

// ----------------------------------------------------------------------------
// FINAL SUMMARY
// ----------------------------------------------------------------------------
console.log('\n================================================================');
console.log('FINAL CHALLENGER 2 VERDICT & VERIFICATION RESULTS');
console.log('================================================================');

const allPassed =
  results.monotonicity.upstreamViolations.length === 0 &&
  results.monotonicity.downstreamViolations.length === 0 &&
  results.monotonicity.horizontalViolations.length === 0 &&
  results.swbat.prefixFailures.length === 0 &&
  results.swbat.verbFailures.length === 0 &&
  results.swbat.dokFailures.length === 0 &&
  results.swbat.bloomsFailures.length === 0 &&
  results.filters.failures.length === 0 &&
  results.edgeInvariants.invalidEdges.length === 0 &&
  results.edgeInvariants.duplicateNodes.length === 0;

console.log(`Monotonicity Upstream Violations:   ${results.monotonicity.upstreamViolations.length}`);
console.log(`Monotonicity Downstream Violations: ${results.monotonicity.downstreamViolations.length}`);
console.log(`Monotonicity Horizontal Violations: ${results.monotonicity.horizontalViolations.length}`);
console.log(`SWBAT Objective Invariant Failures: ${results.swbat.prefixFailures.length + results.swbat.verbFailures.length + results.swbat.dokFailures.length + results.swbat.bloomsFailures.length}`);
console.log(`Filter Permutation Failures:        ${results.filters.failures.length}`);
console.log(`Edge & Node Invariant Failures:     ${results.edgeInvariants.invalidEdges.length + results.edgeInvariants.duplicateNodes.length}`);
console.log(`\nOVERALL VERDICT: ${allPassed ? 'APPROVE' : 'REQUEST_CHANGES'}`);
console.log('================================================================\n');

// Export results for analysis
export { results, allPassed };
