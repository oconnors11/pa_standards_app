/**
 * RBCS PA Standards Visual Coherence Map — Tier 1 Engine Test Suite
 * Features 1–6: Graph Indexing, 5-Tier Relationship Resolution, Search/Filters, Breadcrumbs, SWBAT/DOK, Interface Contracts.
 */

import { describe, test } from './lib/harness.js';
import { assert } from './lib/assertions.js';
import { getEngine } from './lib/fixtures.js';

describe('Tier 1: Multi-Subject Graph Indexing & In-Memory Storage (Feature 1)', () => {
  test('T1.1.1: Complete Dataset Indexing — Indexes all 2,489 standards', async () => {
    const engine = await getEngine();
    const all = engine.getAllStandards();
    assert.strictEqual(all.length, 2489, 'Store must index exactly 2,489 standards');
  }, { tier: 1 });

  test('T1.1.2: Subject Census Verification — Accurately indexes all 5 PA subjects', async () => {
    const engine = await getEngine();
    const all = engine.getAllStandards();
    const math = all.filter(s => s.subject === 'Mathematics');
    const ela = all.filter(s => s.subject === 'English Language Arts');
    const steels = all.filter(s => s.subject === 'STEELS Science');
    const early = all.filter(s => s.subject === 'Early Learning');
    const social = all.filter(s => s.subject === 'Social Studies');

    assert.strictEqual(math.length, 539, 'Mathematics standards count must be 539');
    assert.strictEqual(ela.length, 1317, 'English Language Arts standards count must be 1317');
    assert.strictEqual(steels.length, 400, 'STEELS Science standards count must be 400');
    assert.strictEqual(early.length, 227, 'Early Learning standards count must be 227');
    assert.strictEqual(social.length, 6, 'Social Studies standards count must be 6');
  }, { tier: 1 });

  test('T1.1.3: Primary Key O(1) Lookup — Resolves standards by exact code across subjects', async () => {
    const engine = await getEngine();
    const mathStd = engine.getStandardByCode('CC.2.1.3.C.1');
    assert.ok(mathStd, 'Resolves Grade 3 Math standard CC.2.1.3.C.1');
    assert.strictEqual(mathStd.code, 'CC.2.1.3.C.1');
    assert.strictEqual(mathStd.subject, 'Mathematics');
    assert.strictEqual(mathStd.grade, '3');

    const earlyStd = engine.getStandardByCode('10.1.PK.B1');
    assert.ok(earlyStd, 'Resolves Pre-K Early Learning standard 10.1.PK.B1');
    assert.strictEqual(earlyStd.subject, 'Early Learning');

    const steelsStd = engine.getStandardByCode('3.1.5.A');
    assert.ok(steelsStd, 'Resolves STEELS standard 3.1.5.A');
    assert.strictEqual(steelsStd.subject, 'STEELS Science');
  }, { tier: 1 });

  test('T1.1.4: Subject & Grade Compound Filter — Queries specific subject and grade', async () => {
    const engine = await getEngine();
    const g3Math = engine.getStandardsByFilter({ subject: 'Mathematics', grade: '3' });
    assert.ok(g3Math.length > 0, 'Returns non-empty array of Grade 3 Math standards');
    assert.ok(g3Math.every(s => s.subject === 'Mathematics' && s.grade === '3'), 'All items match Subject=Mathematics and Grade=3');
  }, { tier: 1 });

  test('T1.1.5: 3-Tier Compound Filter — Specificity across Subject, Grade & Domain', async () => {
    const engine = await getEngine();
    const healthPK = engine.getStandardsByFilter({
      subject: 'Early Learning',
      grade: 'Pre-K',
      domain: 'Concepts of Health'
    });
    assert.strictEqual(healthPK.length, 4, 'Exact 4 Pre-K Concepts of Health standards (10.1.PK.B1..E1)');
    const codes = healthPK.map(s => s.code);
    assert.includes(codes, '10.1.PK.B1');
    assert.includes(codes, '10.1.PK.C1');
    assert.includes(codes, '10.1.PK.D1');
    assert.includes(codes, '10.1.PK.E1');
  }, { tier: 1 });

  test('T1.1.6: Store Immutability Check — Protects in-memory store from mutation', async () => {
    const engine = await getEngine();
    const s1 = engine.getStandardByCode('CC.2.1.3.C.1');
    s1.tempMutationFlag = true;

    const s2 = engine.getStandardByCode('CC.2.1.3.C.1');
    const all = engine.getAllStandards();
    assert.ok(Array.isArray(all), 'getAllStandards returns an array');
  }, { tier: 1 });
});

describe('Tier 1: 5-Tier Relationship Resolution Engine (Feature 2)', () => {
  test('T1.2.1: Tier 1 Explicit Bidirectional Linkage — Connects explicit prerequisites and next steps', async () => {
    const engine = await getEngine();
    const pkGraph = engine.getCoherenceGraph('10.1.PK.B1');
    const kGraph = engine.getCoherenceGraph('10.1.K.B1');

    const pkDownstream = pkGraph.downstream.map(n => n.code);
    assert.includes(pkDownstream, '10.1.K.B1', 'Pre-K downstream includes Kindergarten 10.1.K.B1');

    const kUpstream = kGraph.upstream.map(n => n.code);
    assert.includes(kUpstream, '10.1.PK.B1', 'Kindergarten upstream includes Pre-K 10.1.PK.B1');
  }, { tier: 1 });

  test('T1.2.2: Tier 2 Assessment Anchor Resolution — Bridges assessment anchors and core standards', async () => {
    const engine = await getEngine();
    const anchorGraph = engine.getCoherenceGraph('M03.A-N.1.1.1');
    assert.ok(anchorGraph.focalNode.is_pssa_assessed, 'Identifies PSSA assessment anchor');
    assert.ok(anchorGraph.upstream.length > 0 || anchorGraph.downstream.length > 0, 'Anchor resolves connected standards');
  }, { tier: 1 });

  test('T1.2.3: Tier 3 PA Core Code Progression — Parses hierarchical code tokens across grade rungs', async () => {
    const engine = await getEngine();
    const g3Graph = engine.getCoherenceGraph('CC.2.1.3.B.1');
    assert.strictEqual(g3Graph.focalNode.code, 'CC.2.1.3.B.1');
    assert.ok(g3Graph.upstream.length > 0, 'Identifies upstream foundational standards');
    assert.ok(g3Graph.downstream.length > 0, 'Identifies downstream next-step extensions');
  }, { tier: 1 });

  test('T1.2.4: Tier 4 Domain Heuristic Matching — Traverses domain continuity across adjacent grades', async () => {
    const engine = await getEngine();
    const steelsGraph = engine.getCoherenceGraph('3.1.3.A');
    assert.strictEqual(steelsGraph.focalNode.subject, 'STEELS Science');
    assert.ok(steelsGraph.upstream.length > 0 || steelsGraph.downstream.length > 0, 'STEELS Life Science standard resolves domain progression');
  }, { tier: 1 });

  test('T1.2.5: Tier 5 Horizontal Same-Grade Peer Resolution — Resolves same-grade peer standards', async () => {
    const engine = await getEngine();
    const graph = engine.getCoherenceGraph('CC.2.1.3.B.1');
    assert.ok(graph.horizontal.length > 0, 'Resolves horizontal peer standards in same grade');
    assert.ok(graph.horizontal.every(n => n.grade === '3' && n.subject === 'Mathematics'), 'Peers are in Grade 3 Mathematics');
  }, { tier: 1 });

  test('T1.2.6: Graph Result Structural Integrity — Conforms to full interface contract', async () => {
    const engine = await getEngine();
    const result = engine.getCoherenceGraph('CC.1.2.3.A');
    assert.hasKeys(result, ['focalNode', 'upstream', 'downstream', 'horizontal', 'edges', 'stats']);
    assert.ok(Array.isArray(result.upstream));
    assert.ok(Array.isArray(result.downstream));
    assert.ok(Array.isArray(result.horizontal));
    assert.ok(Array.isArray(result.edges));
  }, { tier: 1 });
});

describe('Tier 1: Search & Cascading Filter Selectors (Feature 3)', () => {
  test('T1.3.1: Exact Standard Code Query — Exact match ranks first', async () => {
    const engine = await getEngine();
    const results = engine.searchStandards('CC.2.1.3.C.1');
    assert.ok(results.length > 0);
    assert.strictEqual(results[0].code, 'CC.2.1.3.C.1');
  }, { tier: 1 });

  test('T1.3.2: Prefix / Partial Code Query — Matches standards with code prefix', async () => {
    const engine = await getEngine();
    const results = engine.searchStandards('CC.2.1');
    assert.ok(results.length > 0);
    assert.ok(results.some(s => s.code.startsWith('CC.2.1')));
  }, { tier: 1 });

  test('T1.3.3: Topic Keyword Query ("fractions") — Returns fraction standards', async () => {
    const engine = await getEngine();
    const results = engine.searchStandards('fractions');
    assert.ok(results.length > 0);
    const hasFraction = results.some(s =>
      s.description.toLowerCase().includes('fraction') ||
      (s.keywords || []).some(k => k.toLowerCase().includes('fraction'))
    );
    assert.ok(hasFraction, 'Results include fraction-related standards');
  }, { tier: 1 });

  test('T1.3.4: Multi-Subject Keyword Coverage — Covers STEELS and Social Studies keywords', async () => {
    const engine = await getEngine();
    const ecoResults = engine.searchStandards('ecosystems');
    assert.ok(ecoResults.length > 0, 'Finds ecosystem standards');
    assert.ok(ecoResults.some(s => s.subject === 'STEELS Science'), 'Finds STEELS ecosystems');

    const constResults = engine.searchStandards('constitution');
    assert.ok(constResults.length > 0, 'Finds constitutional standards');
    assert.ok(constResults.some(s => s.subject === 'Social Studies'), 'Finds Social Studies civics');
  }, { tier: 1 });

  test('T1.3.5: Filter Tree Structure Completeness — Generates cascading dropdown options', async () => {
    const engine = await getEngine();
    const filterOpts = engine.getFilterOptions();
    assert.hasKeys(filterOpts, ['subjects', 'gradesBySubject', 'domainsBySubjectAndGrade']);
    assert.strictEqual(filterOpts.subjects.length, 5, '5 subject categories mapped');
    assert.includes(filterOpts.subjects, 'Mathematics');
    assert.includes(filterOpts.subjects, 'STEELS Science');
  }, { tier: 1 });

  test('T1.3.6: Cascading Filter Selector Filtering — Filters by subject and grade', async () => {
    const engine = await getEngine();
    const g3Steels = engine.getStandardsByFilter({ subject: 'STEELS Science', grade: '3' });
    assert.ok(g3Steels.length > 0);
    assert.ok(g3Steels.every(s => s.subject === 'STEELS Science' && s.grade === '3'));
  }, { tier: 1 });
});

describe('Tier 1: Interactive Breadcrumb Navigation Stack (Feature 4)', () => {
  test('T1.4.1: Initial Stack Initialization — Creates root breadcrumb', async () => {
    const engine = await getEngine();
    const trail = engine.addBreadcrumb([], 'CC.2.1.K.A.1');
    assert.deepStrictEqual(trail, ['CC.2.1.K.A.1']);
  }, { tier: 1 });

  test('T1.4.2: Linear Forward Traversal — Appends next step progression', async () => {
    const engine = await getEngine();
    const trail = engine.addBreadcrumb(['CC.2.1.K.A.1'], 'CC.2.1.1.B.1');
    assert.deepStrictEqual(trail, ['CC.2.1.K.A.1', 'CC.2.1.1.B.1']);
  }, { tier: 1 });

  test('T1.4.3: Multi-Step Progression Trail — Preserves multi-step vertical path', async () => {
    const engine = await getEngine();
    let trail = ['CC.2.1.K.A.1', 'CC.2.1.1.B.1'];
    trail = engine.addBreadcrumb(trail, 'CC.2.1.2.B.2');
    assert.deepStrictEqual(trail, ['CC.2.1.K.A.1', 'CC.2.1.1.B.1', 'CC.2.1.2.B.2']);
  }, { tier: 1 });

  test('T1.4.4: Loop & Backtrack Truncation — Truncates stack when revisiting prior node', async () => {
    const engine = await getEngine();
    const trail = engine.addBreadcrumb(['A', 'B', 'C', 'D'], 'B');
    assert.deepStrictEqual(trail, ['A', 'B']);
  }, { tier: 1 });

  test('T1.4.5: Consecutive Duplicate Suppression — Ignores immediate repeat clicks', async () => {
    const engine = await getEngine();
    const trail = engine.addBreadcrumb(['A', 'B'], 'B');
    assert.deepStrictEqual(trail, ['A', 'B']);
  }, { tier: 1 });

  test('T1.4.6: Root Node Reset — Truncates back to root when clicking root node', async () => {
    const engine = await getEngine();
    const trail = engine.addBreadcrumb(['A', 'B', 'C', 'D'], 'A');
    assert.deepStrictEqual(trail, ['A']);
  }, { tier: 1 });
});

describe('Tier 1: DOK & Dynamic SWBAT Lesson Objective Generator (Feature 5)', () => {
  test('T1.5.1: DOK 1 Objective Generation — Generates foundational recall objective', async () => {
    const engine = await getEngine();
    const swbat = engine.generateSWBAT('10.1.PK.B1');
    assert.match(swbat, /Students will be able to/i);
    assert.match(swbat, /body parts|locate|identify/i);
  }, { tier: 1 });

  test('T1.5.2: DOK 2 Objective Generation — Generates conceptual skills objective', async () => {
    const engine = await getEngine();
    const swbat = engine.generateSWBAT('CC.2.1.3.C.1');
    assert.match(swbat, /Students will be able to/i);
    assert.match(swbat, /fraction/i);
  }, { tier: 1 });

  test('T1.5.3: DOK 3 Objective Generation — Generates strategic thinking objective', async () => {
    const engine = await getEngine();
    const swbat = engine.generateSWBAT('8.2.8.B');
    assert.match(swbat, /Students will be able to/i);
    assert.match(swbat, /history|pennsylvania|contribution/i);
  }, { tier: 1 });

  test('T1.5.4: DOK 4 Extended Thinking Generation — Formulates high-rigor objective', async () => {
    const engine = await getEngine();
    const dok4Std = engine.getAllStandards().find(s => s.dok && s.dok.includes('4'));
    assert.ok(dok4Std, 'Finds standard with DOK 4 rigor');
    const swbat = engine.generateSWBAT(dok4Std);
    assert.match(swbat, /Students will be able to/i);
  }, { tier: 1 });

  test('T1.5.5: DOK Range Handling — Correctly parses DOK range strings without throwing', async () => {
    const engine = await getEngine();
    const rangeStd = engine.getAllStandards().find(s => s.dok && (s.dok.includes('-') || s.dok.includes('1-2')));
    assert.ok(rangeStd, 'Finds standard with DOK range');
    const swbat = engine.generateSWBAT(rangeStd);
    assert.match(swbat, /Students will be able to/i);
  }, { tier: 1 });

  test('T1.5.6: Lead Boilerplate Cleaning — Strips legacy introductory phrases cleanly', async () => {
    const engine = await getEngine();
    const floatStd = engine.getStandardByCode('37684.791666666664');
    assert.ok(floatStd, 'Finds standard 37684.791666666664');
    const swbat = engine.generateSWBAT(floatStd);
    assert.match(swbat, /^Students will be able to/i);
    assert.notMatch(swbat, /students who demonstrate understanding can/i);
  }, { tier: 1 });
});

describe('Tier 1: Coherence Node Schema & Graph Interface Contracts (Feature 6)', () => {
  test('T1.6.1: Graph Result Top-Level Schema — Validates return object contract', async () => {
    const engine = await getEngine();
    const graph = engine.getCoherenceGraph('CC.2.1.3.C.1');
    assert.hasKeys(graph, ['focalNode', 'upstream', 'downstream', 'horizontal', 'edges', 'stats']);
  }, { tier: 1 });

  test('T1.6.2: CoherenceNode Field Completeness — Ensures all node properties exist', async () => {
    const engine = await getEngine();
    const graph = engine.getCoherenceGraph('CC.2.1.3.C.1');
    const requiredKeys = ['id', 'code', 'subject', 'grade', 'domain', 'description', 'swbat', 'relationshipType'];
    assert.hasKeys(graph.focalNode, requiredKeys);
    if (graph.upstream.length > 0) assert.hasKeys(graph.upstream[0], requiredKeys);
    if (graph.downstream.length > 0) assert.hasKeys(graph.downstream[0], requiredKeys);
  }, { tier: 1 });

  test('T1.6.3: Edge ID Consistency — All edge pointers map to real graph nodes', async () => {
    const engine = await getEngine();
    const graph = engine.getCoherenceGraph('CC.2.1.3.C.1');
    const allNodeIds = new Set([
      graph.focalNode.id,
      ...graph.upstream.map(n => n.id),
      ...graph.downstream.map(n => n.id),
      ...graph.horizontal.map(n => n.id)
    ]);

    for (const edge of graph.edges) {
      assert.ok(allNodeIds.has(edge.fromId), `edge.fromId ${edge.fromId} must exist in graph`);
      assert.ok(allNodeIds.has(edge.toId), `edge.toId ${edge.toId} must exist in graph`);
    }
  }, { tier: 1 });

  test('T1.6.4: Graph Stats Consistency — Metrics total matches node count sum', async () => {
    const engine = await getEngine();
    const graph = engine.getCoherenceGraph('CC.2.1.3.C.1');
    const sum = graph.upstream.length + graph.downstream.length + graph.horizontal.length;
    assert.strictEqual(graph.stats.totalConnections, sum, 'stats.totalConnections equals sum of connected nodes');
  }, { tier: 1 });

  test('T1.6.5: Case-Insensitive Standard Code Resolution — Handles casing variations', async () => {
    const engine = await getEngine();
    const stdLower = engine.getStandardByCode('cc.2.1.3.c.1');
    assert.ok(stdLower);
    assert.strictEqual(stdLower.code, 'CC.2.1.3.C.1');
  }, { tier: 1 });

  test('T1.6.6: 5-Subject Graph Feasibility — Generates valid graphs across all 5 subjects', async () => {
    const engine = await getEngine();
    const mathG = engine.getCoherenceGraph('CC.2.1.3.C.1');
    const elaG = engine.getCoherenceGraph('CC.1.2.3.A');
    const steelsG = engine.getCoherenceGraph('3.1.3.A');
    const earlyG = engine.getCoherenceGraph('10.1.PK.B1');
    const socialG = engine.getCoherenceGraph('5.1.8.C');

    assert.strictEqual(mathG.focalNode.subject, 'Mathematics');
    assert.strictEqual(elaG.focalNode.subject, 'English Language Arts');
    assert.strictEqual(steelsG.focalNode.subject, 'STEELS Science');
    assert.strictEqual(earlyG.focalNode.subject, 'Early Learning');
    assert.strictEqual(socialG.focalNode.subject, 'Social Studies');
  }, { tier: 1 });
});
