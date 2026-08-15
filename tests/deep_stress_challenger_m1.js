/**
 * @file deep_stress_challenger_m1.js
 * Deep Stress & Edge-Case Testing for Milestone 1 Coherence Graph Engine.
 */

import { performance } from 'node:perf_hooks';
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
  getDomainFamily
} from '../src/utils/coherenceGraph.js';

console.log('--- Deep Stress & Edge Case Verification ---');

const allStandards = getAllStandards();

// Test 1: Pre-K Root Boundary (Foundational)
const prekStandards = allStandards.filter(s => getGradeRank(s.grade) === 0);
let prekUpstreamNonZero = 0;
prekStandards.forEach(s => {
  const g = getCoherenceGraph(s);
  if (g.upstream.length > 0) {
    // Check if any upstream node has rank > 0
    const invalidUpstream = g.upstream.filter(u => getGradeRank(u.grade) > getGradeRank(s.grade));
    if (invalidUpstream.length > 0) {
      prekUpstreamNonZero++;
    }
  }
});
console.log(`Pre-K Standards Checked (${prekStandards.length}): Invalid Upstream > Grade 0 = ${prekUpstreamNonZero}`);

// Test 2: Keystone Capstone Downstream Boundary
const keystoneStandards = allStandards.filter(s => s.is_keystone || s.grade === 'HS');
let keystoneDownstreamNonZero = 0;
keystoneStandards.forEach(s => {
  const g = getCoherenceGraph(s);
  // Check if any downstream node has rank < focal rank
  const invalidDownstream = g.downstream.filter(d => getGradeRank(d.grade) < getGradeRank(s.grade));
  if (invalidDownstream.length > 0) {
    keystoneDownstreamNonZero++;
  }
});
console.log(`Keystone/HS Standards Checked (${keystoneStandards.length}): Invalid Downstream < Focal Rank = ${keystoneDownstreamNonZero}`);

// Test 3: Social Studies Single-Grade Resolution
const socStandards = allStandards.filter(s => s.subject === 'Social Studies');
let socHorizontalOk = 0;
socStandards.forEach(s => {
  const g = getCoherenceGraph(s);
  if (g.horizontal.length > 0) {
    const allSameGrade = g.horizontal.every(h => getGradeRank(h.grade) === getGradeRank(s.grade));
    if (allSameGrade) socHorizontalOk++;
  }
});
console.log(`Social Studies Standards (${socStandards.length}): Horizontal All Same Grade = ${socHorizontalOk}`);

// Test 4: Extreme High-Throughput Performance Benchmark
const t0 = performance.now();
const ITERATIONS = 2489; // Traverse entire dataset
for (let i = 0; i < ITERATIONS; i++) {
  getCoherenceGraph(allStandards[i]);
}
const elapsedMs = performance.now() - t0;
const avgPerGraphMs = elapsedMs / ITERATIONS;
console.log(`Full Dataset 2,489 Graph Generation Throughput:`);
console.log(`- Total Time: ${elapsedMs.toFixed(2)}ms`);
console.log(`- Avg per Graph: ${avgPerGraphMs.toFixed(3)}ms (Budget: < 20ms, Target: < 1ms)`);

// Test 5: Search Stress & Typo / Substring / Wildcard Performance
const searchQueries = [
  'fractions', 'linear equations', 'photosynthesis', 'ecosystems',
  'reading comprehension', 'civics', 'phonemic awareness', 'CC.2.1',
  'M04.A-T', 'BIO.A', '3.1.PK', '10.1', 'quadratics', 'measurement and data',
  'text dependent analysis', 'argumentative writing', 'scientific inquiry'
];

const tSearch0 = performance.now();
let totalMatches = 0;
searchQueries.forEach(q => {
  const matches = searchStandards(q, 20);
  totalMatches += matches.length;
});
const searchElapsedMs = performance.now() - tSearch0;
console.log(`Search Engine Benchmark (${searchQueries.length} complex queries):`);
console.log(`- Total Matches: ${totalMatches}`);
console.log(`- Total Time: ${searchElapsedMs.toFixed(2)}ms (${(searchElapsedMs / searchQueries.length).toFixed(3)}ms / query)`);

// Test 6: Breadcrumb 100-step continuous navigation with random walks
let trail = [];
let cyclesEncountered = 0;
let current = allStandards[0];
trail = addBreadcrumb(trail, current.code);

for (let step = 0; step < 100; step++) {
  const g = getCoherenceGraph(current);
  const neighbors = [...g.upstream, ...g.downstream, ...g.horizontal];
  if (neighbors.length === 0) break;
  // Pick deterministic neighbor
  const nextNeighbor = neighbors[step % neighbors.length];
  const beforeLen = trail.length;
  trail = addBreadcrumb(trail, nextNeighbor.code);
  if (trail.length <= beforeLen) {
    cyclesEncountered++;
  }
  current = nextNeighbor;
}
console.log(`Breadcrumb 100-step Random Walk: Final Stack Length = ${trail.length} (Max 10), Cycles Handled = ${cyclesEncountered}`);

console.log('--- Deep Stress Tests Completed Cleanly ---');
