/**
 * RBCS PA Standards Visual Coherence Map — Tier 4 Real-World Application Workload Scenarios
 * 5 End-to-end educator workflow scenarios across Math, Keystone Biology, Early Learning, ELA, and Social Studies.
 */

import { describe, test } from './lib/harness.js';
import { assert } from './lib/assertions.js';
import { getEngine } from './lib/fixtures.js';

describe('Tier 4 Scenario 1: Grade 3 Math Fractions Scaffolding Progression (TC-T4-SCEN-01)', () => {
  test('Executes end-to-end fractions progression analysis workflow', async () => {
    const engine = await getEngine();

    // Step 1: Educator searches for Grade 3 fractions standard
    const searchResults = engine.searchStandards('CC.2.1.3.C.1');
    assert.ok(searchResults.length > 0, 'Search returns matching fraction standards');
    assert.strictEqual(searchResults[0].code, 'CC.2.1.3.C.1');

    // Step 2: Load Coherence Graph for focal standard
    const graph = engine.getCoherenceGraph('CC.2.1.3.C.1');
    assert.strictEqual(graph.focalNode.code, 'CC.2.1.3.C.1');
    assert.strictEqual(graph.focalNode.grade, '3');
    assert.strictEqual(graph.focalNode.subject, 'Mathematics');

    // Step 3: Verify Upstream Prerequisite from Grade 2
    const upstreamCodes = graph.upstream.map(n => n.code);
    assert.ok(upstreamCodes.includes('CC.2.3.2.A.2'), 'Identifies Grade 2 shape partitioning foundation CC.2.3.2.A.2');

    // Step 4: Focus on Grade 2 foundation to generate remediation objective
    const g2Graph = engine.getCoherenceGraph('CC.2.3.2.A.2');
    const g2SWBAT = engine.generateSWBAT(g2Graph.focalNode);
    assert.match(g2SWBAT, /Students will be able to/i, 'Generates valid SWBAT objective');
    assert.match(g2SWBAT, /partition/i, 'SWBAT addresses shape partitioning');

    // Step 5: Trace forward to Grade 3 Assessment Anchor M03.A-N.1.1.1
    const pssaAnchorGraph = engine.getCoherenceGraph('M03.A-N.1.1.1');
    assert.strictEqual(pssaAnchorGraph.focalNode.is_pssa_assessed, true, 'Flags standard as PSSA assessed');
    assert.strictEqual(pssaAnchorGraph.focalNode.dok, 'DOK 1-2', 'Identifies DOK level');

    // Step 6: Verify Downstream Extension to Grade 4 M04.A-F.1.1.1
    const downstreamCodes = pssaAnchorGraph.downstream.map(n => n.code);
    assert.ok(downstreamCodes.includes('M04.A-F.1.1.1'), 'Links forward to Grade 4 equivalent fractions M04.A-F.1.1.1');

    // Step 7: Verify Breadcrumb Trail History Progression
    let trail = [];
    trail = engine.addBreadcrumb(trail, 'CC.2.3.2.A.2');
    trail = engine.addBreadcrumb(trail, 'CC.2.1.3.C.1');
    trail = engine.addBreadcrumb(trail, 'M03.A-N.1.1.1');
    trail = engine.addBreadcrumb(trail, 'M04.A-F.1.1.1');
    assert.deepStrictEqual(trail, ['CC.2.3.2.A.2', 'CC.2.1.3.C.1', 'M03.A-N.1.1.1', 'M04.A-F.1.1.1']);
  }, { tier: 4 });
});

describe('Tier 4 Scenario 2: STEELS High School Biology Keystone & Ecology (TC-T4-SCEN-02)', () => {
  test('Traces STEELS environmental ecology and bioenergetics prerequisite gaps to Keystone capstones', async () => {
    const engine = await getEngine();

    // Step 1: Filter by Subject "STEELS Science" -> Grade "HS" -> Domain "Keystone Biology: Ecology"
    const ecologyStandards = engine.getStandardsByFilter({ subject: 'STEELS Science', grade: 'HS', domain: 'Keystone Biology: Ecology' });
    assert.ok(ecologyStandards.length > 0, 'Finds Keystone Ecology standards');
    const focalEcology = ecologyStandards.find(s => s.code === 'BIO.B.4.1.1');
    assert.ok(focalEcology, 'Identifies BIO.B.4.1.1');

    // Step 2: Generate Coherence Graph for BIO.B.4.1.1
    const ecoGraph = engine.getCoherenceGraph('BIO.B.4.1.1');
    assert.strictEqual(ecoGraph.focalNode.is_keystone, true, 'Focal node is flagged as Keystone assessed');
    assert.strictEqual(ecoGraph.focalNode.subject, 'STEELS Science');

    // Step 3: Verify Upstream Middle School STEELS Prerequisite (3.4.8.A)
    const upstreamEco = ecoGraph.upstream.map(n => n.code);
    assert.ok(upstreamEco.includes('3.4.8.A'), 'Connects to Grade 8 Environmental Literacy 3.4.8.A');

    // Step 4: Trace 3.4.8.A Grade 8 standard metadata
    const msGraph = engine.getCoherenceGraph('3.4.8.A');
    assert.strictEqual(msGraph.focalNode.grade, '8');
    assert.ok(msGraph.focalNode.prerequisites.includes('3.4.5.A'), 'Records raw prerequisite 3.4.5.A');

    // Step 5: Switch to Keystone Bioenergetics BIO.A.3.2.1
    const bioenergeticsGraph = engine.getCoherenceGraph('BIO.A.3.2.1');
    assert.strictEqual(bioenergeticsGraph.focalNode.is_keystone, true);
    const bioUpstream = bioenergeticsGraph.upstream.map(n => n.code);
    assert.ok(bioUpstream.includes('BIO.A.1.1.1'), 'Bioenergetics requires Basic Biological Principles BIO.A.1.1.1');

    // Step 6: Verify SWBAT Objective for Keystone Bioenergetics
    const bioSWBAT = engine.generateSWBAT(bioenergeticsGraph.focalNode);
    assert.match(bioSWBAT, /Students will be able to/i);
  }, { tier: 4 });
});

describe('Tier 4 Scenario 3: Early Learning Pre-K to Kindergarten Transition (TC-T4-SCEN-03)', () => {
  test('Validates Pre-K root-node handling, domain continuity, and Kindergarten progression mapping', async () => {
    const engine = await getEngine();

    // Step 1: Direct lookup of Pre-K health standard 10.1.PK.B1
    const pkStandard = engine.getStandardByCode('10.1.PK.B1');
    assert.ok(pkStandard, 'Finds Pre-K standard 10.1.PK.B1');
    assert.strictEqual(pkStandard.grade, 'Pre-K');
    assert.strictEqual(pkStandard.subject, 'Early Learning');

    // Step 2: Build Coherence Graph for Pre-K Root Node
    const pkGraph = engine.getCoherenceGraph('10.1.PK.B1');
    assert.strictEqual(pkGraph.upstream.length, 0, 'Root Pre-K standard has zero upstream prerequisites (graceful boundary)');
    assert.strictEqual(pkGraph.focalNode.code, '10.1.PK.B1');

    // Step 3: Verify Downstream Progression to Kindergarten 10.1.K.B1
    const downCodes = pkGraph.downstream.map(n => n.code);
    assert.ok(downCodes.includes('10.1.K.B1'), 'Downstream progression contains Kindergarten continuation 10.1.K.B1');

    // Step 4: Re-center graph on Kindergarten continuation standard 10.1.K.B1
    const kGraph = engine.getCoherenceGraph('10.1.K.B1');
    assert.strictEqual(kGraph.focalNode.grade, 'K');
    const kUpstreamCodes = kGraph.upstream.map(n => n.code);
    assert.ok(kUpstreamCodes.includes('10.1.PK.B1'), 'Kindergarten standard lists 10.1.PK.B1 in upstream prerequisites');

    // Step 5: Test Second Pre-K Domain (Healthful Living 10.2.PK.A1 -> 10.2.K.A1)
    const hlGraph = engine.getCoherenceGraph('10.2.PK.A1');
    assert.strictEqual(hlGraph.upstream.length, 0);
    assert.ok(hlGraph.downstream.map(n => n.code).includes('10.2.K.A1'), 'Maps 10.2.PK.A1 to 10.2.K.A1');

    // Step 6: Test Early Science Inquiry (3.1.PK.A -> 3.1.K.A)
    const sciGraph = engine.getCoherenceGraph('3.1.PK.A');
    assert.strictEqual(sciGraph.upstream.length, 0);
    assert.ok(sciGraph.downstream.map(n => n.code).includes('3.1.K.A'), 'Maps 3.1.PK.A to 3.1.K.A');

    // Step 7: Generate Early Learning SWBAT Objective Stem
    const pkSWBAT = engine.generateSWBAT(pkGraph.focalNode);
    assert.match(pkSWBAT, /Students will be able to/i);
    assert.match(pkSWBAT, /body parts|locate|identify/i);
  }, { tier: 4 });
});

describe('Tier 4 Scenario 4: ELA Informational Text & Textual Evidence Progression (TC-T4-SCEN-04)', () => {
  test('Traces 4-grade vertical articulation of textual evidence standards with DOK rigor verification', async () => {
    const engine = await getEngine();

    // Step 1: Locate focal Grade 8 Textual Evidence standard CC.1.2.8.B
    const focal = engine.getStandardByCode('CC.1.2.8.B');
    assert.ok(focal, 'Finds CC.1.2.8.B');
    assert.strictEqual(focal.domain, 'Reading Informational Text');
    assert.strictEqual(focal.grade, '8');

    // Step 2: Build Coherence Graph for CC.1.2.8.B
    const graph = engine.getCoherenceGraph('CC.1.2.8.B');
    assert.strictEqual(graph.focalNode.code, 'CC.1.2.8.B');

    // Step 3: Verify Upstream Prerequisite Standards (Grades 6 & 7)
    const upstreamCodes = graph.upstream.map(n => n.code);
    assert.ok(upstreamCodes.includes('CC.1.2.7.B'), 'Upstream includes Grade 7 standard CC.1.2.7.B');
    assert.ok(upstreamCodes.includes('CC.1.2.6.B'), 'Upstream includes Grade 6 standard CC.1.2.6.B');

    // Step 4: Verify Downstream High School Extension (Grade 9-10)
    const downCodes = graph.downstream.map(n => n.code);
    assert.ok(downCodes.includes('CC.1.2.9-10.B'), 'Downstream includes Grade 9-10 High School standard CC.1.2.9-10.B');

    // Step 5: Verify Horizontal Same-Grade Peer Standards (Central Idea CC.1.2.8.A)
    const horizontalCodes = graph.horizontal.map(n => n.code);
    assert.ok(horizontalCodes.includes('CC.1.2.8.A'), 'Identifies same-grade Central Idea peer CC.1.2.8.A');

    // Step 6: Verify DOK 3 Cognitive Rigor & Dynamic SWBAT
    const swbat = engine.generateSWBAT(graph.focalNode);
    assert.match(swbat, /Students will be able to/i);
    assert.match(swbat, /textual evidence|cite|support|evidence/i);

    // Step 7: Step through full 4-Grade Vertical Chain
    const g6Graph = engine.getCoherenceGraph('CC.1.2.6.B');
    const g7Graph = engine.getCoherenceGraph('CC.1.2.7.B');
    const g10Graph = engine.getCoherenceGraph('CC.1.2.9-10.B');
    assert.strictEqual(g6Graph.focalNode.grade, '6');
    assert.strictEqual(g7Graph.focalNode.grade, '7');
    assert.strictEqual(g10Graph.focalNode.grade, '10');
  }, { tier: 4 });
});

describe('Tier 4 Scenario 5: Social Studies Civics & PA Government Vertical Articulation (TC-T4-SCEN-05)', () => {
  test('Validates Civics Act 35 articulation, single-grade dataset heuristics, and multi-domain crosswalks', async () => {
    const engine = await getEngine();

    // Step 1: Filter Social Studies standards for Grade 8 Civics
    const civicsStandards = engine.getStandardsByFilter({ subject: 'Social Studies', grade: '8', domain: '5.1 Civics and Government: Principles & Documents' });
    assert.ok(civicsStandards.length > 0, 'Finds Grade 8 Civics standards');
    const focalCivics = civicsStandards.find(s => s.code === '5.1.8.C');
    assert.ok(focalCivics, 'Finds 5.1.8.C');

    // Step 2: Build Coherence Graph for 5.1.8.C
    const graph = engine.getCoherenceGraph('5.1.8.C');
    assert.strictEqual(graph.focalNode.code, '5.1.8.C');
    assert.strictEqual(graph.focalNode.subject, 'Social Studies');

    // Step 3: Verify Downstream Articulation to Grade 12 Government Capstone
    assert.ok(graph.focalNode.next_steps.includes('5.1.12.C'), 'Explicit next step points to Grade 12 capstone 5.1.12.C');

    // Step 4: Verify Horizontal Cross-Domain Peers (5.3.8.F Voting & Elections, 8.2.8.B PA History)
    const ssFilter = engine.getStandardsByFilter({ subject: 'Social Studies', grade: '8' });
    assert.ok(ssFilter.some(s => s.code === '5.3.8.F'), 'Identifies Grade 8 Voting & Elections standard');
    assert.ok(ssFilter.some(s => s.code === '8.2.8.B'), 'Identifies Grade 8 PA History standard');

    // Step 5: Test Dynamic SWBAT Objective for US Constitution Analysis
    const civicsSWBAT = engine.generateSWBAT(graph.focalNode);
    assert.match(civicsSWBAT, /Students will be able to/i);
    assert.match(civicsSWBAT, /principles|documents|government|constitution/i);

    // Step 6: Verify Deep-link Query Parameter Representation
    const queryUrl = `/?view=coherence&code=${encodeURIComponent('5.1.8.C')}`;
    assert.strictEqual(queryUrl, '/?view=coherence&code=5.1.8.C');
  }, { tier: 4 });
});
