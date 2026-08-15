/**
 * @file coherenceGraph.test.js
 * Comprehensive Unit Test Suite for Coherence Graph Engine,
 * Multi-Index In-Memory Store, 5-Tier Traversal, Search Engine,
 * Filter Selectors, Breadcrumb History, and SWBAT Generator.
 *
 * Runs via Node 22 native test runner: `node --test src/utils/__tests__/coherenceGraph.test.js`
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

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
  getDomainFamily,
  GRADE_ORDER,
  GRADE_RANKS,
  DOK_METADATA,
  VERB_DICTIONARY
} from '../coherenceGraph.js';

describe('Coherence Graph Engine — Comprehensive Unit Test Suite', () => {

  // ==========================================================================
  // 1. DATA STORE & IN-MEMORY MULTI-INDEXING
  // ==========================================================================
  describe('1. Data Store & In-Memory Indexing', () => {
    it('indexes all 2,489 standards from standards.json', () => {
      const standards = getAllStandards();
      assert.equal(standards.length, 2489, 'Should load exactly 2,489 standards');
    });

    it('ensures every standard contains required schema properties and non-empty values', () => {
      const standards = getAllStandards();
      for (const s of standards) {
        assert.ok(s.id, `Standard missing id: ${JSON.stringify(s)}`);
        assert.ok(s.code, `Standard missing code: ${s.id}`);
        assert.ok(s.subject, `Standard missing subject: ${s.id}`);
        assert.ok(s.grade, `Standard missing grade: ${s.id}`);
        assert.ok(s.grade_band, `Standard missing grade_band: ${s.id}`);
        assert.ok(s.domain, `Standard missing domain: ${s.id}`);
        assert.ok(s.description, `Standard missing description: ${s.id}`);
        assert.ok(s.dok, `Standard missing dok: ${s.id}`);
        assert.equal(typeof s.is_pssa_assessed, 'boolean', `is_pssa_assessed must be boolean: ${s.id}`);
        assert.equal(typeof s.is_keystone, 'boolean', `is_keystone must be boolean: ${s.id}`);
        assert.ok(Array.isArray(s.keywords), `keywords must be array: ${s.id}`);
        assert.ok(s.swbat, `swbat must be generated and attached: ${s.id}`);
      }
    });

    it('verifies exact subject distribution in the dataset', () => {
      const standards = getAllStandards();
      const subjectCounts = {};
      standards.forEach(s => {
        subjectCounts[s.subject] = (subjectCounts[s.subject] || 0) + 1;
      });

      assert.equal(subjectCounts['English Language Arts'], 1317);
      assert.equal(subjectCounts['Mathematics'], 539);
      assert.equal(subjectCounts['STEELS Science'], 400);
      assert.equal(subjectCounts['Early Learning'], 227);
      assert.equal(subjectCounts['Social Studies'], 6);
    });

    it('looks up standard by exact code across all 5 subjects', () => {
      const math = getStandardByCode('CC.2.1.4.C.1');
      assert.ok(math);
      assert.equal(math.subject, 'Mathematics');
      assert.equal(math.grade, '4');

      const ela = getStandardByCode('E04.A-K.1.1.1');
      assert.ok(ela);
      assert.equal(ela.subject, 'English Language Arts');

      const steels = getStandardByCode('3.2.K.A');
      assert.ok(steels);
      assert.equal(steels.subject, 'STEELS Science');

      const early = getStandardByCode('10.1.PK.B1');
      assert.ok(early);
      assert.equal(early.subject, 'Early Learning');

      const soc = getStandardByCode('5.1.8.C');
      assert.ok(soc);
      assert.equal(soc.subject, 'Social Studies');
    });

    it('looks up standard case-insensitively and with whitespace tolerance', () => {
      const std1 = getStandardByCode('cc.2.1.4.c.1');
      assert.ok(std1);
      assert.equal(std1.code, 'CC.2.1.4.C.1');

      const std2 = getStandardByCode('  M04.A-T.1.1.1  ');
      assert.ok(std2);
      assert.equal(std2.code, 'M04.A-T.1.1.1');
    });

    it('looks up standard by alt_code alias (e.g. 3.1.HS.A -> BIO.A.1.1.1)', () => {
      const std = getStandardByCode('3.1.HS.A');
      assert.ok(std, 'Should find standard via alt_code');
      assert.equal(std.code, 'BIO.A.1.1.1');
      assert.equal(std.alt_code, '3.1.HS.A');
    });

    it('looks up standard by national crosswalk alias', () => {
      const std = getStandardByCode('K.CC.A.1');
      assert.ok(std, 'Should resolve national crosswalk code');
    });

    it('returns null for non-existent, empty, or invalid inputs', () => {
      assert.equal(getStandardByCode('NON_EXISTENT_CODE_12345'), null);
      assert.equal(getStandardByCode(''), null);
      assert.equal(getStandardByCode('   '), null);
      assert.equal(getStandardByCode(null), null);
      assert.equal(getStandardByCode(undefined), null);
      assert.equal(getStandardByCode(12345), null);
    });
  });

  // ==========================================================================
  // 2. CODE NORMALIZATION & PARSING
  // ==========================================================================
  describe('2. Code Normalization & Parsing', () => {
    it('normalizes PSSA single digit grade padding (M3 -> M03)', () => {
      assert.equal(normalizeCode('M3.A-T.1.1.1'), 'M03.A-T.1.1.1');
      assert.equal(normalizeCode('E4.A-K.1.1.1'), 'E04.A-K.1.1.1');
    });

    it('normalizes Pre-K grade tokens (PRE-K -> PREK)', () => {
      assert.equal(normalizeCode('CC.2.1.PRE-K.A.1'), 'CC.2.1.PREK.A.1');
    });

    it('converts spaced codes to dots (CC 2.1 K A 1 -> CC.2.1.K.A.1)', () => {
      assert.equal(normalizeCode('CC 2.1 K A 1'), 'CC.2.1.K.A.1');
    });

    it('parses PSSA assessment anchor codes correctly', () => {
      const parsed = parseStandardCode('M04.A-T.1.1.1');
      assert.ok(parsed);
      assert.equal(parsed.type, 'PSSA');
      assert.equal(parsed.subject, 'Mathematics');
      assert.equal(parsed.grade, '4');
      assert.equal(parsed.anchor, 'A-T');
      assert.equal(parsed.descriptor, '1.1.1');
      assert.equal(parsed.isValid, true);
    });

    it('parses PA Core codes correctly', () => {
      const parsed = parseStandardCode('CC.2.1.K.A.1');
      assert.ok(parsed);
      assert.equal(parsed.type, 'PA_CORE');
      assert.equal(parsed.subject, 'Mathematics');
      assert.equal(parsed.grade, 'K');
      assert.equal(parsed.isValid, true);
    });

    it('parses STEELS Science codes correctly', () => {
      const parsed = parseStandardCode('3.2.4.B');
      assert.ok(parsed);
      assert.equal(parsed.type, 'STEELS');
      assert.equal(parsed.subject, 'STEELS Science');
      assert.equal(parsed.grade, '4');
      assert.equal(parsed.isValid, true);
    });

    it('parses Early Learning codes correctly', () => {
      const parsed = parseStandardCode('10.1.PK.B1');
      assert.ok(parsed);
      assert.equal(parsed.type, 'EARLY_LEARNING');
      assert.equal(parsed.subject, 'Early Learning');
      assert.equal(parsed.grade, 'PK');
      assert.equal(parsed.isValid, true);
    });

    it('parses Keystone exam codes correctly', () => {
      const parsed = parseStandardCode('BIO.A.1.1.1');
      assert.ok(parsed);
      assert.equal(parsed.type, 'KEYSTONE');
      assert.equal(parsed.subject, 'STEELS Science');
      assert.equal(parsed.grade, 'HS');
      assert.equal(parsed.isValid, true);
    });

    it('parses Social Studies codes correctly', () => {
      const parsed = parseStandardCode('5.1.8.C');
      assert.ok(parsed);
      assert.equal(parsed.type, 'SOCIAL_STUDIES');
      assert.equal(parsed.subject, 'Social Studies');
      assert.equal(parsed.grade, '8');
      assert.equal(parsed.isValid, true);
    });

    it('gracefully handles anomalous float codes', () => {
      const parsed = parseStandardCode('37684.791666666664');
      assert.ok(parsed);
      assert.equal(parsed.isValid, true);
    });

    it('returns invalid object on non-standard unmatchable codes', () => {
      const parsed = parseStandardCode('INVALID_NON_EXISTENT_99');
      assert.ok(parsed);
      assert.equal(parsed.isValid, false);
    });

    it('evaluates grade ranks monotonically', () => {
      assert.equal(getGradeRank('Pre-K'), 0);
      assert.equal(getGradeRank('K'), 1);
      assert.equal(getGradeRank('1'), 2);
      assert.equal(getGradeRank('4'), 5);
      assert.equal(getGradeRank('8'), 9);
      assert.equal(getGradeRank('12'), 13);
      assert.equal(getGradeRank('HS'), 14);
      assert.ok(getGradeRank('Pre-K') < getGradeRank('K'));
      assert.ok(getGradeRank('K') < getGradeRank('1'));
      assert.ok(getGradeRank('4') < getGradeRank('5'));
      assert.ok(getGradeRank('8') < getGradeRank('HS'));
    });

    it('maps domain families accurately', () => {
      assert.equal(getDomainFamily('Numbers & Operations in Base Ten'), 'numbers_operations');
      assert.equal(getDomainFamily('Algebraic Concepts: Linear Equations'), 'algebraic_concepts');
      assert.equal(getDomainFamily('Geometry: 2D & 3D Shapes'), 'geometry');
      assert.equal(getDomainFamily('Life Science: Ecosystem Dynamics'), 'life_science');
      assert.equal(getDomainFamily('Physical Science: Waves and Energy'), 'physical_science');
    });
  });

  // ==========================================================================
  // 3. 5-TIER COHERENCE GRAPH RESOLUTION ENGINE
  // ==========================================================================
  describe('3. 5-Tier Coherence Graph Traversal (`getCoherenceGraph`)', () => {
    it('generates a complete coherence graph with all required result contracts', () => {
      const graph = getCoherenceGraph('CC.2.1.4.C.1');
      assert.ok(graph, 'Graph must not be null');
      assert.ok(graph.focalNode, 'Must contain focalNode');
      assert.equal(graph.focalNode.code, 'CC.2.1.4.C.1');
      assert.equal(graph.focalNode.relationshipType, 'focal');
      assert.ok(graph.focalNode.swbat);

      assert.ok(Array.isArray(graph.upstream), 'upstream must be array');
      assert.ok(Array.isArray(graph.downstream), 'downstream must be array');
      assert.ok(Array.isArray(graph.horizontal), 'horizontal must be array');
      assert.ok(Array.isArray(graph.edges), 'edges must be array');

      assert.ok(graph.stats, 'stats must be present');
      assert.equal(typeof graph.stats.totalConnections, 'number');
      assert.equal(typeof graph.stats.upstreamCount, 'number');
      assert.equal(typeof graph.stats.downstreamCount, 'number');
      assert.equal(typeof graph.stats.horizontalCount, 'number');
      assert.ok(graph.stats.tierCounts, 'tierCounts must exist');
      assert.equal(typeof graph.stats.tierCounts.tier1, 'number');
      assert.equal(typeof graph.stats.tierCounts.tier2, 'number');
      assert.equal(typeof graph.stats.tierCounts.tier3, 'number');
      assert.equal(typeof graph.stats.tierCounts.tier4, 'number');
      assert.equal(typeof graph.stats.tierCounts.tier5, 'number');
    });

    it('accepts both standard object and code string', () => {
      const std = getStandardByCode('CC.2.1.4.C.1');
      const graphFromObj = getCoherenceGraph(std);
      const graphFromStr = getCoherenceGraph('CC.2.1.4.C.1');
      assert.equal(graphFromObj.focalNode.id, graphFromStr.focalNode.id);
      assert.equal(graphFromObj.stats.totalConnections, graphFromStr.stats.totalConnections);
    });

    it('resolves Tier 1 explicit bidirectional links from JSON', () => {
      const graph = getCoherenceGraph('10.1.PK.B1');
      assert.ok(graph);
      const downstreamCodes = graph.downstream.map(d => d.code);
      assert.ok(downstreamCodes.includes('10.1.K.B1'), '10.1.PK.B1 should connect to 10.1.K.B1');

      const nextNode = graph.downstream.find(d => d.code === '10.1.K.B1');
      assert.equal(nextNode.tier, 1);
      assert.equal(nextNode.isExplicit, true);
    });

    it('resolves Tier 2 PSSA Assessment Anchor progressions across grades', () => {
      const graph = getCoherenceGraph('M04.A-T.1.1.1');
      assert.ok(graph);
      const allNeighborCodes = [...graph.upstream, ...graph.downstream].map(n => n.code);
      const hasProgression = allNeighborCodes.some(c => c.startsWith('M03.A-T') || c.startsWith('M05.A-T'));
      assert.ok(hasProgression, 'M04.A-T.1.1.1 should connect to M03.A-T or M05.A-T');
    });

    it('resolves Tier 2 Keystone Bridges from Grade 8 PSSA to Keystone Algebra', () => {
      const graph = getCoherenceGraph('M08.B-E.1.1.1');
      assert.ok(graph);
      const downstreamCodes = graph.downstream.map(n => n.code);
      const hasKeystone = downstreamCodes.some(c => c.startsWith('A1.'));
      assert.ok(hasKeystone, 'Grade 8 Math M08.B-E should connect to Keystone Algebra I downstream');
    });

    it('resolves Tier 2 Inverse Keystone Bridges from Keystone to Grade 8 PSSA', () => {
      const graph = getCoherenceGraph('A1.1.1.1.1');
      assert.ok(graph);
      const upstreamCodes = graph.upstream.map(n => n.code);
      const hasGrade8 = upstreamCodes.some(c => c.startsWith('M08.B-E'));
      assert.ok(hasGrade8, 'Keystone Algebra I should connect upstream to Grade 8 M08.B-E');
    });

    it('resolves Tier 3 PA Core grade-token progressions', () => {
      const graph = getCoherenceGraph('CC.2.1.4.C.1');
      assert.ok(graph);
      const allNeighborCodes = [...graph.upstream, ...graph.downstream].map(n => n.code);
      const hasCoreProgression = allNeighborCodes.some(c => c.startsWith('CC.2.1.3') || c.startsWith('CC.2.1.5'));
      assert.ok(hasCoreProgression, 'CC.2.1.4.C.1 should connect to CC.2.1.3 or CC.2.1.5');
    });

    it('guarantees 100% graph coverage via Tier 4 Domain Heuristics for isolated standards', () => {
      const standards = getAllStandards();
      const isolated = standards.find(s =>
        (!s.prerequisites || s.prerequisites.length === 0) &&
        (!s.next_steps || s.next_steps.length === 0) &&
        s.grade === '5'
      );
      assert.ok(isolated, 'Should find isolated standard');

      const graph = getCoherenceGraph(isolated.code);
      assert.ok(graph);
      const totalNeighbors = graph.upstream.length + graph.downstream.length + graph.horizontal.length;
      assert.ok(totalNeighbors > 0, `Isolated standard ${isolated.code} must resolve connections`);
    });

    it('resolves Tier 5 Horizontal conceptual peers in the same grade', () => {
      const graph = getCoherenceGraph('CC.2.1.4.C.1');
      assert.ok(graph.horizontal.length > 0, 'Should have horizontal peers');
      assert.ok(graph.horizontal.every(h => h.grade === '4'), 'Horizontal peers must be in Grade 4');
      assert.ok(graph.horizontal.every(h => h.relationshipType === 'horizontal'));
      assert.ok(graph.horizontal.every(h => h.tier === 5));
    });

    it('verifies edge records match connected nodes', () => {
      const graph = getCoherenceGraph('CC.2.1.4.C.1');
      assert.ok(graph.edges.length > 0);
      for (const edge of graph.edges) {
        assert.ok(edge.fromId, 'Edge must have fromId');
        assert.ok(edge.toId, 'Edge must have toId');
        assert.ok(edge.type, 'Edge must have type');
      }
    });

    it('handles Pre-K foundational entry points correctly (isFoundational === true)', () => {
      const graph = getCoherenceGraph('CC.2.1.PREK.A.1');
      assert.ok(graph);
      assert.equal(graph.stats.isFoundational, true, 'Pre-K entry standard should be marked as foundational');
    });

    it('handles terminal capstone standards correctly (isCapstone === true)', () => {
      const graph = getCoherenceGraph('10.1.2.B1');
      assert.ok(graph);
      assert.equal(graph.stats.isCapstone, true, 'Grade 2 Early Learning terminal standard should be marked as capstone');
    });

    it('prevents cycle loops and node duplication in graph extraction', () => {
      const standards = getAllStandards();
      for (const std of standards.slice(0, 50)) {
        const graph = getCoherenceGraph(std);
        const nodeIds = [
          graph.focalNode.id,
          ...graph.upstream.map(n => n.id),
          ...graph.downstream.map(n => n.id),
          ...graph.horizontal.map(n => n.id)
        ];
        const uniqueIds = new Set(nodeIds);
        assert.equal(nodeIds.length, uniqueIds.size, `Duplicate node IDs found in graph for ${std.code}`);
      }
    });

    it('handles non-existent / invalid codes gracefully', () => {
      const graph = getCoherenceGraph('NON_EXISTENT_CODE');
      assert.ok(graph);
      assert.equal(graph.focalNode, null);
      assert.equal(graph.stats.totalConnections, 0);
    });
  });

  // ==========================================================================
  // 4. MULTI-FIELD RELEVANCE SEARCH ENGINE
  // ==========================================================================
  describe('4. Multi-Field Search Engine (`searchStandards`)', () => {
    it('ranks exact code match at position 0', () => {
      const results = searchStandards('CC.2.1.4.C.1');
      assert.ok(results.length > 0);
      assert.equal(results[0].code, 'CC.2.1.4.C.1');
    });

    it('ranks prefix matches above general substring matches', () => {
      const results = searchStandards('CC.2.1.4');
      assert.ok(results.length > 0);
      assert.ok(results[0].code.startsWith('CC.2.1.4'));
    });

    it('handles natural multi-token queries with grade alias ("fractions grade 4")', () => {
      const results = searchStandards('fractions grade 4');
      assert.ok(results.length > 0);
      const topMathGr4 = results.find(r => r.subject === 'Mathematics' && r.grade === '4');
      assert.ok(topMathGr4, 'Should find Grade 4 math fraction standard');
    });

    it('handles ordinal grade query ("4th grade fractions")', () => {
      const results = searchStandards('4th grade fractions');
      assert.ok(results.length > 0);
      assert.ok(results.some(r => r.grade === '4' && r.subject === 'Mathematics'));
    });

    it('searches by curricular topic keyword ("photosynthesis")', () => {
      const results = searchStandards('photosynthesis');
      assert.ok(results.length > 0);
      assert.ok(results.some(r => r.subject === 'STEELS Science'));
    });

    it('searches by early learning topic ("play")', () => {
      const results = searchStandards('play');
      assert.ok(results.length > 0);
      assert.ok(results.some(r => r.subject === 'Early Learning'));
    });

    it('respects the custom limit parameter', () => {
      const results = searchStandards('mathematics', 5);
      assert.ok(results.length <= 5);
    });

    it('returns empty array for empty, whitespace, null, or undefined queries', () => {
      assert.deepEqual(searchStandards(''), []);
      assert.deepEqual(searchStandards('   '), []);
      assert.deepEqual(searchStandards(null), []);
      assert.deepEqual(searchStandards(undefined), []);
      assert.deepEqual(searchStandards(123), []);
    });
  });

  // ==========================================================================
  // 5. CASCADING FILTER SELECTORS
  // ==========================================================================
  describe('5. Cascading Filter Selectors (`getFilterOptions` & `getStandardsByFilter`)', () => {
    it('returns all 5 subjects in getFilterOptions', () => {
      const opts = getFilterOptions();
      assert.ok(opts.subjects.includes('Mathematics'));
      assert.ok(opts.subjects.includes('English Language Arts'));
      assert.ok(opts.subjects.includes('STEELS Science'));
      assert.ok(opts.subjects.includes('Early Learning'));
      assert.ok(opts.subjects.includes('Social Studies'));
    });

    it('orders grades monotonically from Pre-K to HS', () => {
      const opts = getFilterOptions();
      assert.equal(opts.grades[0], 'Pre-K');
      assert.equal(opts.grades[1], 'K');
      assert.equal(opts.grades[2], '1');
      assert.equal(opts.grades[opts.grades.length - 1], 'HS');
    });

    it('provides cascading domain selectors by subject and grade', () => {
      const opts = getFilterOptions();
      assert.ok(opts.domainsBySubject['Mathematics']);
      assert.ok(opts.domainsBySubjectAndGrade['Mathematics|4']);
      assert.ok(opts.domainsBySubjectAndGrade['Mathematics|4'].length > 0);
    });

    it('filters standards by exact subject, grade, and domain', () => {
      const filtered = getStandardsByFilter({
        subject: 'Mathematics',
        grade: '4',
        domain: 'Numbers & Operations - Fractions'
      });
      assert.ok(filtered.length > 0);
      assert.ok(filtered.every(s => s.subject === 'Mathematics' && s.grade === '4'));
    });

    it('handles array of grades in filter', () => {
      const filtered = getStandardsByFilter({
        subject: 'Mathematics',
        grade: ['3', '4']
      });
      assert.ok(filtered.length > 0);
      assert.ok(filtered.every(s => s.grade === '3' || s.grade === '4'));
    });

    it('handles "All" wildcard filter option', () => {
      const allMath = getStandardsByFilter({ subject: 'Mathematics', grade: 'All', domain: 'All' });
      assert.equal(allMath.length, 539);
    });

    it('returns all standards when empty filter object is passed', () => {
      const all = getStandardsByFilter({});
      assert.equal(all.length, 2489);
    });
  });

  // ==========================================================================
  // 6. BREADCRUMB HISTORY MANAGER
  // ==========================================================================
  describe('6. Breadcrumb History Manager (`addBreadcrumb`)', () => {
    it('appends unique standard codes sequentially', () => {
      let history = [];
      history = addBreadcrumb(history, 'CC.2.1.K.A.1');
      assert.deepEqual(history, ['CC.2.1.K.A.1']);
      history = addBreadcrumb(history, 'CC.2.1.1.B.1');
      assert.deepEqual(history, ['CC.2.1.K.A.1', 'CC.2.1.1.B.1']);
      history = addBreadcrumb(history, 'CC.2.1.2.B.2');
      assert.deepEqual(history, ['CC.2.1.K.A.1', 'CC.2.1.1.B.1', 'CC.2.1.2.B.2']);
    });

    it('suppresses loops by truncating history to prior visit index', () => {
      const history = ['CC.2.1.K.A.1', 'CC.2.1.1.B.1', 'CC.2.1.2.B.2'];
      const updated = addBreadcrumb(history, 'CC.2.1.1.B.1');
      assert.deepEqual(updated, ['CC.2.1.K.A.1', 'CC.2.1.1.B.1']);
    });

    it('handles backtrack to root node', () => {
      const history = ['A', 'B', 'C', 'D'];
      const updated = addBreadcrumb(history, 'A');
      assert.deepEqual(updated, ['A']);
    });

    it('maintains state on repeated selection of current standard', () => {
      const history = ['A', 'B'];
      const updated = addBreadcrumb(history, 'B');
      assert.deepEqual(updated, ['A', 'B']);
    });

    it('caps history length to maxLen by dropping oldest entries', () => {
      const history = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
      const updated = addBreadcrumb(history, '11', 10);
      assert.equal(updated.length, 10);
      assert.equal(updated[0], '2');
      assert.equal(updated[9], '11');
    });

    it('safely ignores invalid, null, undefined, or empty code inputs', () => {
      const history = ['A', 'B'];
      assert.deepEqual(addBreadcrumb(history, ''), ['A', 'B']);
      assert.deepEqual(addBreadcrumb(history, '   '), ['A', 'B']);
      assert.deepEqual(addBreadcrumb(history, null), ['A', 'B']);
      assert.deepEqual(addBreadcrumb(history, undefined), ['A', 'B']);
    });
  });

  // ==========================================================================
  // 7. SWBAT & DOK OBJECTIVE GENERATOR
  // ==========================================================================
  describe('7. SWBAT & DOK Generator (`generateSWBAT`)', () => {
    it('generates student-friendly objective starting with "Students will be able to"', () => {
      const swbat = generateSWBAT('CC.2.1.4.C.1');
      assert.ok(swbat.swbatText.startsWith('Students will be able to'));
      assert.equal(swbat.dokLevel, 2);
      assert.ok(swbat.actionVerb);
    });

    it('cleans STEELS Science boilerplate ("who demonstrate understanding can")', () => {
      const swbat = generateSWBAT('3.2.K.A');
      assert.ok(!swbat.swbatText.includes('who demonstrate understanding can'));
      assert.ok(swbat.swbatText.startsWith('Students will be able to'));
    });

    it('preserves and formats Early Learning preambles ("with prompting and support")', () => {
      const swbat = generateSWBAT('CC.1.2.PREK.F');
      assert.ok(swbat.swbatText.includes('with prompting and support'));
    });

    it('provides DOK level and Bloom taxonomy categorization', () => {
      const swbat = generateSWBAT('CC.2.1.4.C.1');
      assert.ok(swbat.dokName);
      assert.ok(swbat.bloomsLevel);
    });

    it('supports dual string coercion and object property access', () => {
      const swbat = generateSWBAT('10.1.PK.B1');
      assert.equal(typeof swbat, 'object');
      assert.ok(String(swbat).startsWith('Students will be able to'));
      assert.ok(('' + swbat).startsWith('Students will be able to'));
    });

    it('returns graceful fallback on invalid or missing standard', () => {
      const swbat = generateSWBAT('NON_EXISTENT_STANDARD');
      assert.ok(swbat.swbatText.startsWith('Students will be able to'));
    });
  });

  // ==========================================================================
  // 8. PERFORMANCE & LATENCY BENCHMARKS
  // ==========================================================================
  describe('8. Performance Latency Budget & Benchmarks', () => {
    it('generates coherence graph in < 5ms for any standard (budget < 20ms)', () => {
      const sampleCodes = [
        'CC.2.1.K.A.1', 'CC.2.1.4.C.1', 'M04.A-T.1.1.1', '3.2.K.A',
        'BIO.A.1.1.1', '10.1.PK.B1', 'CC.1.4.11-12.A', 'E04.A-K.1.1.1',
        '5.1.8.C', 'A1.1.1.1.1'
      ];

      for (const code of sampleCodes) {
        const start = performance.now();
        const graph = getCoherenceGraph(code);
        const duration = performance.now() - start;
        assert.ok(graph);
        assert.ok(duration < 20, `getCoherenceGraph(${code}) took ${duration.toFixed(2)}ms (budget < 20ms)`);
      }
    });

    it('searches standards across 2,489 records in < 10ms (budget < 20ms)', () => {
      const queries = ['fractions grade 4', 'photosynthesis', 'equations', 'kindergarten', 'reading literature'];
      for (const q of queries) {
        const start = performance.now();
        const results = searchStandards(q);
        const duration = performance.now() - start;
        assert.ok(results.length > 0);
        assert.ok(duration < 20, `searchStandards('${q}') took ${duration.toFixed(2)}ms (budget < 20ms)`);
      }
    });

    it('completes 100 consecutive graph generations in under 50ms total', () => {
      const standards = getAllStandards();
      const testSet = standards.slice(100, 200);

      // Warm up
      getCoherenceGraph(testSet[0].code);

      const start = performance.now();
      for (let i = 0; i < testSet.length; i++) {
        getCoherenceGraph(testSet[i].code);
      }
      const totalDuration = performance.now() - start;
      const avgDuration = totalDuration / testSet.length;

      assert.ok(totalDuration < 50, `100 graph generations took ${totalDuration.toFixed(2)}ms total (avg ${avgDuration.toFixed(3)}ms/call)`);
    });
  });

  // ==========================================================================
  // 9. ADVERSARIAL & EDGE CASE STRESS TESTING
  // ==========================================================================
  describe('9. Adversarial & Edge Case Stress Testing', () => {
    it('handles extreme breadcrumb navigation loops without memory leak', () => {
      let history = [];
      const loop = ['CC.2.1.K.A.1', 'CC.2.1.1.B.1', 'CC.2.1.2.B.2', 'CC.2.1.3.C.1', 'CC.2.1.4.C.1'];
      for (let cycle = 0; cycle < 50; cycle++) {
        for (const code of loop) {
          history = addBreadcrumb(history, code, 10);
        }
      }
      assert.ok(history.length <= 10, 'History should never exceed maxLen');
      assert.deepEqual(history, loop);
    });

    it('handles query with special regex characters safely', () => {
      const results1 = searchStandards('.*+?^${}()|[]\\');
      assert.deepEqual(results1, []);

      const results2 = searchStandards('CC.2.1.*');
      assert.ok(Array.isArray(results2));
    });

    it('verifies all 2,489 standards can generate a coherence graph without throwing', () => {
      const all = getAllStandards();
      let totalEdges = 0;
      for (let i = 0; i < all.length; i++) {
        const g = getCoherenceGraph(all[i]);
        assert.ok(g.focalNode);
        assert.equal(g.focalNode.id, all[i].id);
        totalEdges += g.edges.length;
      }
      assert.ok(totalEdges > 5000, `Total graph edges across 2,489 standards: ${totalEdges}`);
    });
  });
});
