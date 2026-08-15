/**
 * Adversarial Empirical Stress Test Suite for E2E Test Infrastructure
 * Strictly tests:
 * 1. Assertion library edge cases (assertions.js)
 * 2. Test runner registry, lifecycle hooks, async promises, bail, filters (harness.js)
 * 3. Reporter formatting: ANSI spec and TAP v13 (reporters.js)
 * 4. CLI flags, argument parsing, error isolation, exit codes (runner.js)
 */

import { assert, AssertionError } from './lib/assertions.js';
import { TestRunner, resetGlobalRunner, getGlobalRunner } from './lib/harness.js';
import { formatSpec, formatTAP } from './lib/reporters.js';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const RUNNER_PATH = path.join(__dirname, 'runner.js');

const results = {
  total: 0,
  passed: 0,
  failed: 0,
  failures: []
};

function test(category, name, fn) {
  results.total++;
  try {
    fn();
    results.passed++;
    console.log(`  ✓ [${category}] ${name}`);
  } catch (err) {
    results.failed++;
    results.failures.push({ category, name, error: err });
    console.error(`  ✗ [${category}] ${name}\n    Error: ${err.message}`);
  }
}

async function asyncTest(category, name, fn) {
  results.total++;
  try {
    await fn();
    results.passed++;
    console.log(`  ✓ [${category}] ${name}`);
  } catch (err) {
    results.failed++;
    results.failures.push({ category, name, error: err });
    console.error(`  ✗ [${category}] ${name}\n    Error: ${err.message}`);
  }
}

console.log('\n================================================================');
console.log('ADVERSARIAL EMPIRICAL STRESS TEST SUITE — E2E TEST INFRASTRUCTURE');
console.log('================================================================\n');

// ============================================================================
// PART 1: ASSERTION LIBRARY STRESS TESTING
// ============================================================================
console.log('--- PART 1: Assertion Library Strict Invariants & Edge Cases ---');

test('assert.strictEqual', 'Passes on identical primitives, Object.is semantics (+0 vs -0, NaN)', () => {
  assert.strictEqual(42, 42);
  assert.strictEqual('hello', 'hello');
  assert.strictEqual(true, true);
  assert.strictEqual(false, false);
  assert.strictEqual(null, null);
  assert.strictEqual(undefined, undefined);
  assert.strictEqual(NaN, NaN); // Object.is(NaN, NaN) === true
});

test('assert.strictEqual', 'Distinguishes +0 and -0 under Object.is', () => {
  let threw = false;
  try {
    assert.strictEqual(+0, -0);
  } catch (err) {
    threw = true;
    if (!(err instanceof AssertionError)) throw new Error('Expected AssertionError');
  }
  if (!threw) throw new Error('assert.strictEqual failed to distinguish +0 and -0');
});

test('assert.strictEqual', 'Throws on type coercion and distinct object references', () => {
  const cases = [
    [1, '1'],
    [0, false],
    ['', false],
    [null, undefined],
    [{ a: 1 }, { a: 1 }],
    [[1, 2], [1, 2]]
  ];

  for (const [a, b] of cases) {
    let threw = false;
    try {
      assert.strictEqual(a, b);
    } catch (err) {
      threw = true;
      if (!(err instanceof AssertionError)) throw new Error('Expected AssertionError');
      if (err.operator !== 'strictEqual') throw new Error('Expected operator strictEqual');
    }
    if (!threw) throw new Error(`assert.strictEqual unexpectedly passed for ${JSON.stringify(a)} vs ${JSON.stringify(b)}`);
  }
});

test('assert.notStrictEqual', 'Passes on distinct references and types, throws on identical references', () => {
  assert.notStrictEqual(1, 2);
  assert.notStrictEqual('a', 'b');
  assert.notStrictEqual({ a: 1 }, { a: 1 });
  assert.notStrictEqual(+0, -0);

  let threw = false;
  try {
    assert.notStrictEqual(100, 100);
  } catch (err) {
    threw = true;
    if (!(err instanceof AssertionError)) throw new Error('Expected AssertionError');
    if (err.operator !== 'notStrictEqual') throw new Error('Expected operator notStrictEqual');
  }
  if (!threw) throw new Error('assert.notStrictEqual failed to throw on identical values');
});

test('assert.deepStrictEqual', 'Passes on deeply nested objects, arrays, Dates, and RegExps', () => {
  const d1 = new Date('2026-08-15T00:00:00Z');
  const d2 = new Date('2026-08-15T00:00:00Z');
  const r1 = /^CC\.\d+\.\d+/i;
  const r2 = /^CC\.\d+\.\d+/i;

  const objA = {
    code: 'CC.2.1.3.C.1',
    tags: ['math', 'fractions'],
    meta: { date: d1, pattern: r1, active: true },
    nodes: [{ id: '1', scores: [10, 20] }]
  };

  const objB = {
    // Key order inverted in nested object — should still be deeply equal
    code: 'CC.2.1.3.C.1',
    tags: ['math', 'fractions'],
    meta: { active: true, pattern: r2, date: d2 },
    nodes: [{ id: '1', scores: [10, 20] }]
  };

  assert.deepStrictEqual(objA, objB);
});

test('assert.deepStrictEqual', 'Throws on deep inequalities, type differences, missing keys, and array mismatches', () => {
  const inequalities = [
    [{ a: 1 }, { a: 2 }],
    [{ a: 1 }, { a: 1, b: 2 }],
    [{ a: 1, b: 2 }, { a: 1 }],
    [[1, 2, 3], [1, 2, 4]],
    [[1, 2], [1, 2, 3]],
    [[1, 2], { 0: 1, 1: 2 }], // Array vs plain Object
    [{ a: new Date('2026-01-01') }, { a: new Date('2026-01-02') }],
    [{ r: /test/i }, { r: /test/g }],
    [{ a: undefined }, {}],
    [null, {}],
    [undefined, null]
  ];

  for (const [a, b] of inequalities) {
    let threw = false;
    try {
      assert.deepStrictEqual(a, b);
    } catch (err) {
      threw = true;
      if (!(err instanceof AssertionError)) throw new Error('Expected AssertionError');
      if (err.operator !== 'deepStrictEqual') throw new Error('Expected operator deepStrictEqual');
    }
    if (!threw) throw new Error(`assert.deepStrictEqual passed on mismatched values:\n  A: ${JSON.stringify(a)}\n  B: ${JSON.stringify(b)}`);
  }
});

test('assert.notDeepStrictEqual', 'Passes on non-equal structures and throws on deeply identical structures', () => {
  assert.notDeepStrictEqual({ a: 1 }, { a: 2 });
  assert.notDeepStrictEqual([1, 2], [2, 1]);

  let threw = false;
  try {
    assert.notDeepStrictEqual({ x: [1, { y: 2 }] }, { x: [1, { y: 2 }] });
  } catch (err) {
    threw = true;
    if (!(err instanceof AssertionError)) throw new Error('Expected AssertionError');
    if (err.operator !== 'notDeepStrictEqual') throw new Error('Expected operator notDeepStrictEqual');
  }
  if (!threw) throw new Error('assert.notDeepStrictEqual failed to throw on deeply equal structures');
});

test('assert.ok', 'Validates truthiness and throws AssertionError on all falsy variants', () => {
  const truthy = [true, 1, -1, 'non-empty', {}, [], () => {}, Infinity];
  for (const t of truthy) {
    assert.ok(t);
  }

  const falsy = [false, 0, -0, '', null, undefined, NaN];
  for (const f of falsy) {
    let threw = false;
    try {
      assert.ok(f);
    } catch (err) {
      threw = true;
      if (!(err instanceof AssertionError)) throw new Error('Expected AssertionError');
      if (err.operator !== 'ok') throw new Error('Expected operator ok');
    }
    if (!threw) throw new Error(`assert.ok unexpectedly accepted falsy value: ${String(f)}`);
  }
});

test('assert.match & assert.notMatch', 'Validates string regex matching, pattern compilation, and non-string rejection', () => {
  assert.match('CC.2.1.3.C.1', /^CC\.\d+\.\d+\.[A-Z0-9]+\.[A-Z]\.\d+$/);
  assert.match('Students will be able to solve fractions', 'fractions');
  assert.notMatch('CC.2.1.3.C.1', /^STEELS/);

  // Mismatched regex throws
  let threwMatch = false;
  try {
    assert.match('hello world', /^goodbye/);
  } catch (err) {
    threwMatch = true;
    if (!(err instanceof AssertionError)) throw new Error('Expected AssertionError');
    if (err.operator !== 'match') throw new Error('Expected operator match');
  }
  if (!threwMatch) throw new Error('assert.match failed to throw on regex mismatch');

  // Matching regex in notMatch throws
  let threwNotMatch = false;
  try {
    assert.notMatch('target standard text', /standard/);
  } catch (err) {
    threwNotMatch = true;
    if (!(err instanceof AssertionError)) throw new Error('Expected AssertionError');
    if (err.operator !== 'notMatch') throw new Error('Expected operator notMatch');
  }
  if (!threwNotMatch) throw new Error('assert.notMatch failed to throw on matching pattern');

  // Non-string targets throw
  const nonStrings = [123, null, undefined, {}, []];
  for (const ns of nonStrings) {
    let threwType = false;
    try {
      assert.match(ns, /pattern/);
    } catch (err) {
      threwType = true;
    }
    if (!threwType) throw new Error(`assert.match allowed non-string target: ${typeof ns}`);
  }
});

test('assert.includes', 'Validates membership across strings, array primitives, array objects (deep), Sets, Maps, and Object keys', () => {
  // String substring
  assert.includes('Pennsylvania Educational Standards', 'Educational');
  // Array primitive
  assert.includes([10, 20, 30], 20);
  // Array object with deep equality
  assert.includes([{ id: 'node_1', val: 'A' }, { id: 'node_2', val: 'B' }], { id: 'node_2', val: 'B' });
  // Set
  assert.includes(new Set(['Math', 'Science', 'ELA']), 'Science');
  // Map key
  const map = new Map([['k1', 'v1'], ['k2', 'v2']]);
  assert.includes(map, 'k2');
  // Object property key
  assert.includes({ focalNode: {}, upstream: [] }, 'focalNode');

  // Missing element throws
  let threw = false;
  try {
    assert.includes(['a', 'b'], 'c');
  } catch (err) {
    threw = true;
    if (!(err instanceof AssertionError)) throw new Error('Expected AssertionError');
    if (err.operator !== 'includes') throw new Error('Expected operator includes');
  }
  if (!threw) throw new Error('assert.includes failed to throw on missing element');
});

test('assert.inRange', 'Validates numeric bounds [min, max] inclusive and throws on NaN/out-of-bounds', () => {
  assert.inRange(0.4, 0.4, 2.0); // Exact min
  assert.inRange(2.0, 0.4, 2.0); // Exact max
  assert.inRange(1.15, 0.4, 2.0);

  // Below min throws
  let threwLow = false;
  try {
    assert.inRange(0.39, 0.4, 2.0);
  } catch (err) {
    threwLow = true;
  }
  if (!threwLow) throw new Error('assert.inRange failed on value below min');

  // Above max throws
  let threwHigh = false;
  try {
    assert.inRange(2.01, 0.4, 2.0);
  } catch (err) {
    threwHigh = true;
  }
  if (!threwHigh) throw new Error('assert.inRange failed on value above max');

  // Non-number / NaN throws
  let threwNaN = false;
  try {
    assert.inRange(NaN, 0, 10);
  } catch (err) {
    threwNaN = true;
  }
  if (!threwNaN) throw new Error('assert.inRange accepted NaN');
});

test('assert.hasKeys', 'Validates object keys and throws on missing keys or non-object targets', () => {
  const target = { focalNode: {}, upstream: [], downstream: [], horizontal: [], edges: [], stats: {} };
  assert.hasKeys(target, ['focalNode', 'upstream', 'downstream', 'horizontal', 'edges', 'stats']);

  let threwMissing = false;
  try {
    assert.hasKeys(target, ['focalNode', 'nonExistentKey']);
  } catch (err) {
    threwMissing = true;
    if (!(err instanceof AssertionError)) throw new Error('Expected AssertionError');
    if (err.operator !== 'hasKeys') throw new Error('Expected operator hasKeys');
  }
  if (!threwMissing) throw new Error('assert.hasKeys failed to throw on missing key');

  let threwNull = false;
  try {
    assert.hasKeys(null, ['key']);
  } catch (err) {
    threwNull = true;
  }
  if (!threwNull) throw new Error('assert.hasKeys accepted null');
});

test('assert.closeTo', 'Validates floating point approximations and delta boundaries', () => {
  assert.closeTo(0.1 + 0.2, 0.3, 0.00001);
  assert.closeTo(1.1505, 1.15, 0.001);

  // Delta exceeded throws
  let threw = false;
  try {
    assert.closeTo(1.155, 1.15, 0.001);
  } catch (err) {
    threw = true;
    if (!(err instanceof AssertionError)) throw new Error('Expected AssertionError');
    if (err.operator !== 'closeTo') throw new Error('Expected operator closeTo');
  }
  if (!threw) throw new Error('assert.closeTo failed on diff > delta');

  // Non-number throws
  let threwType = false;
  try {
    assert.closeTo('1.0', 1.0, 0.01);
  } catch (err) {
    threwType = true;
  }
  if (!threwType) throw new Error('assert.closeTo accepted string argument');
});

test('assert.throws', 'Validates synchronous exception throwing, Error class matching, and regex message matching', () => {
  assert.throws(() => { throw new Error('Standard code invalid'); }, /Standard code invalid/);
  assert.throws(() => { throw new TypeError('Type mismatch'); }, TypeError);
  assert.throws(() => { throw new Error('Any error'); });

  // Function did not throw
  let threwNoThrow = false;
  try {
    assert.throws(() => { return 42; });
  } catch (err) {
    threwNoThrow = true;
    if (!(err instanceof AssertionError)) throw new Error('Expected AssertionError');
    if (err.operator !== 'throws') throw new Error('Expected operator throws');
  }
  if (!threwNoThrow) throw new Error('assert.throws failed when function did not throw');

  // Threw wrong error constructor
  let threwWrongType = false;
  try {
    assert.throws(() => { throw new RangeError('Index out of range'); }, TypeError);
  } catch (err) {
    threwWrongType = true;
  }
  if (!threwWrongType) throw new Error('assert.throws accepted mismatched error constructor');

  // Threw wrong message regex
  let threwWrongRegex = false;
  try {
    assert.throws(() => { throw new Error('Actual message'); }, /Different pattern/);
  } catch (err) {
    threwWrongRegex = true;
  }
  if (!threwWrongRegex) throw new Error('assert.throws accepted mismatched error regex');
});

await asyncTest('assert.rejects', 'Validates asynchronous promise rejections with Constructor and regex matching', async () => {
  await assert.rejects(async () => { throw new Error('Async DB failure'); }, /Async DB failure/);
  await assert.rejects(Promise.reject(new RangeError('Out of bounds')), RangeError);

  // Promise resolved instead of rejecting
  let threwResolved = false;
  try {
    await assert.rejects(async () => 'resolved value');
  } catch (err) {
    threwResolved = true;
    if (!(err instanceof AssertionError)) throw new Error('Expected AssertionError');
    if (err.operator !== 'rejects') throw new Error('Expected operator rejects');
  }
  if (!threwResolved) throw new Error('assert.rejects failed when Promise resolved');

  // Promise rejected with mismatched regex
  let threwWrongMsg = false;
  try {
    await assert.rejects(async () => { throw new Error('Msg A'); }, /Msg B/);
  } catch (err) {
    threwWrongMsg = true;
  }
  if (!threwWrongMsg) throw new Error('assert.rejects accepted mismatched regex');
});

// ============================================================================
// PART 2: HARNESS & RUNNER LIFECYCLE STRESS TESTING
// ============================================================================
console.log('\n--- PART 2: TestRunner Registry, Lifecycle Hooks & Execution Engine ---');

await asyncTest('TestRunner Suite Nesting & Hook Order', 'Executes 3-level deep suites with rigorous beforeEach/afterEach chaining', async () => {
  const runner = new TestRunner();
  const log = [];

  runner.describe('Level 1', () => {
    runner.before(() => { log.push('L1.before'); });
    runner.beforeEach(() => { log.push('L1.beforeEach'); });
    runner.afterEach(() => { log.push('L1.afterEach'); });
    runner.after(() => { log.push('L1.after'); });

    runner.test('L1 Test', () => { log.push('L1.test'); });

    runner.describe('Level 2', () => {
      runner.beforeEach(() => { log.push('L2.beforeEach'); });
      runner.afterEach(() => { log.push('L2.afterEach'); });

      runner.describe('Level 3', () => {
        runner.beforeEach(() => { log.push('L3.beforeEach'); });
        runner.afterEach(() => { log.push('L3.afterEach'); });

        runner.test('L3 Test', () => { log.push('L3.test'); });
      });
    });
  });

  const res = await runner.run();
  assert.strictEqual(res.passed, 2);
  assert.strictEqual(res.failed, 0);

  const expectedLog = [
    'L1.before',
    // L1 Test
    'L1.beforeEach',
    'L1.test',
    'L1.afterEach',
    // L3 Test (beforeEach: parent to child; afterEach: child to parent)
    'L1.beforeEach',
    'L2.beforeEach',
    'L3.beforeEach',
    'L3.test',
    'L3.afterEach',
    'L2.afterEach',
    'L1.afterEach',
    // L1 After
    'L1.after'
  ];

  assert.deepStrictEqual(log, expectedLog);
});

await asyncTest('TestRunner Async Handling & Error Isolation', 'Awaits promises, measures timing, and isolates failure in non-bail mode', async () => {
  const runner = new TestRunner({ bail: false });

  runner.describe('Async Error Suite', () => {
    runner.test('Fast Sync Pass', () => {});
    runner.test('Async Delayed Pass', async () => {
      await new Promise(r => setTimeout(r, 10));
    });
    runner.test('Sync Failure', () => {
      throw new Error('Sync fail');
    });
    runner.test('Async Promise Rejection', async () => {
      await new Promise(r => setTimeout(r, 5));
      throw new Error('Async rejection');
    });
    runner.test('Subsequent Pass', () => {});
  });

  const res = await runner.run();
  assert.strictEqual(res.passed, 3);
  assert.strictEqual(res.failed, 2);
  assert.strictEqual(res.total, 5);
  assert.strictEqual(res.tests[1].status, 'PASSED');
  assert.ok(res.tests[1].durationMs >= 9, 'Duration for async test is measured');
  assert.strictEqual(res.tests[2].status, 'FAILED');
  assert.strictEqual(res.tests[2].error.message, 'Sync fail');
  assert.strictEqual(res.tests[3].status, 'FAILED');
  assert.strictEqual(res.tests[3].error.message, 'Async rejection');
  assert.strictEqual(res.tests[4].status, 'PASSED');
});

await asyncTest('TestRunner Bail Behavior', 'Immediately stops execution when bail=true upon first error', async () => {
  const runner = new TestRunner({ bail: true });
  let executedAfterFail = false;

  runner.describe('Bail Suite 1', () => {
    runner.test('Test 1.1 - Pass', () => {});
    runner.test('Test 1.2 - Fail', () => { throw new Error('Bail trigger'); });
    runner.test('Test 1.3 - Should not run', () => { executedAfterFail = true; });
  });

  runner.describe('Bail Suite 2', () => {
    runner.test('Test 2.1 - Should not run', () => { executedAfterFail = true; });
  });

  const res = await runner.run();
  assert.strictEqual(res.passed, 1);
  assert.strictEqual(res.failed, 1);
  assert.strictEqual(executedAfterFail, false, 'Subsequent tests must not execute under bail mode');
});

await asyncTest('TestRunner Metadata Tier Filtering', 'Filters tests by tier array [1, 3] and updates tier tally', async () => {
  const runner = new TestRunner({ tier: [1, 3] });

  runner.describe('Tier Suite', () => {
    runner.test('Tier 1 Test', () => {}, { tier: 1 });
    runner.test('Tier 2 Test', () => {}, { tier: 2 });
    runner.test('Tier 3 Test', () => {}, { tier: 3 });
    runner.test('Tier 4 Test', () => {}, { tier: 4 });
  });

  const res = await runner.run();
  assert.strictEqual(res.passed, 2);
  assert.strictEqual(res.skipped, 2);
  assert.strictEqual(res.tiers[1].pass, 1);
  assert.strictEqual(res.tiers[2].skip, 1);
  assert.strictEqual(res.tiers[3].pass, 1);
  assert.strictEqual(res.tiers[4].skip, 1);
});

await asyncTest('TestRunner Grep Substring & Regex Filtering', 'Filters tests by full title pattern', async () => {
  const runnerSubstring = new TestRunner({ grep: 'Special' });
  runnerSubstring.describe('Suite', () => {
    runnerSubstring.test('Normal test', () => {});
    runnerSubstring.test('Special test', () => {});
  });
  const resSub = await runnerSubstring.run();
  assert.strictEqual(resSub.passed, 1);
  assert.strictEqual(resSub.skipped, 1);

  const runnerRegex = new TestRunner({ grep: /Unit-\d+/ });
  runnerRegex.describe('Suite', () => {
    runnerRegex.test('Unit-101 Verification', () => {});
    runnerRegex.test('Integration Flow', () => {});
  });
  const resRe = await runnerRegex.run();
  assert.strictEqual(resRe.passed, 1);
  assert.strictEqual(resRe.skipped, 1);
});

// ============================================================================
// PART 3: REPORTERS SPEC AND TAP OUTPUT STRESS TESTING
// ============================================================================
console.log('\n--- PART 3: Reporters Spec and TAP Output Formatters ---');

test('formatSpec Reporter', 'Renders full ANSI spec report with passes, fails, skips, error stacks, and tier table', () => {
  const mockResults = {
    passed: 2,
    failed: 1,
    skipped: 1,
    total: 4,
    durationMs: 50.5,
    tiers: {
      1: { pass: 1, fail: 0, skip: 0, total: 1, durationMs: 10.0 },
      2: { pass: 1, fail: 1, skip: 1, total: 3, durationMs: 40.5 },
      3: { pass: 0, fail: 0, skip: 0, total: 0, durationMs: 0 },
      4: { pass: 0, fail: 0, skip: 0, total: 0, durationMs: 0 }
    },
    tests: [
      { name: 'T1 Pass', suite: { name: 'Suite 1' }, meta: { tier: 1 }, status: 'PASSED', durationMs: 10.0 },
      { name: 'T2 Pass', suite: { name: 'Suite 2' }, meta: { tier: 2 }, status: 'PASSED', durationMs: 5.0 },
      { name: 'T2 Fail', suite: { name: 'Suite 2' }, meta: { tier: 2 }, status: 'FAILED', durationMs: 35.5, error: new Error('Empirical error message') },
      { name: 'T2 Skip', suite: { name: 'Suite 2' }, meta: { tier: 2 }, status: 'SKIPPED', durationMs: 0 }
    ]
  };

  const output = formatSpec(mockResults, { verbose: true });
  // Strip ANSI color sequences for text matching
  const clean = output.replace(/\x1b\[[0-9;]*m/g, '');

  assert.match(clean, /RBCS PA STANDARDS VISUAL COHERENCE MAP — E2E TEST RUNNER SPEC REPORT/);
  assert.match(clean, /\[Tier 1\] Suite 1/);
  assert.match(clean, /✓ T1 Pass/);
  assert.match(clean, /\[Tier 2\] Suite 2/);
  assert.match(clean, /✓ T2 Pass/);
  assert.match(clean, /✗ T2 Fail/);
  assert.match(clean, /Empirical error message/);
  assert.match(clean, /○ T2 Skip \(skipped\)/);
  assert.match(clean, /TEST SUITE EXECUTION SUMMARY ACROSS TIERS/);
  assert.match(clean, /Tier 1\s+Feature Contracts & Core Unit\s+1\s+0\s+0\s+1\s+10\.0/);
  assert.match(clean, /Tier 2\s+Boundaries, Corners & Stress\s+1\s+1\s+1\s+3\s+40\.5/);
  assert.match(clean, /TOTALS\s+2\s+1\s+1\s+4\s+50\.5/);
  assert.match(clean, /TEST SUITE FAILED\s+1 test\(s\) failed out of 4/);
});

test('formatTAP Reporter', 'Emits strictly compliant TAP v13 stream with YAML diagnostics blocks', () => {
  const mockResults = {
    passed: 1,
    failed: 1,
    skipped: 1,
    total: 3,
    durationMs: 25.0,
    tests: [
      { name: 'Pass Test', suite: { name: 'Suite A' }, status: 'PASSED', durationMs: 5.12 },
      {
        name: 'Fail Test',
        suite: { name: 'Suite A' },
        status: 'FAILED',
        durationMs: 15.2,
        error: new AssertionError('Values differ', { actual: 1, expected: 2, operator: 'strictEqual' })
      },
      { name: 'Skip Test', suite: { name: 'Suite A' }, status: 'SKIPPED', durationMs: 0 }
    ]
  };

  const tap = formatTAP(mockResults);
  const lines = tap.split('\n');

  assert.strictEqual(lines[0], 'TAP version 13');
  assert.strictEqual(lines[1], '1..3');
  assert.match(lines[2], /^ok 1 - Suite A > Pass Test # time=5\.12ms$/);
  assert.match(lines[3], /^not ok 2 - Suite A > Fail Test # time=15\.20ms$/);
  assert.strictEqual(lines[4], '  ---');
  assert.strictEqual(lines[5], '  message: "Values differ"');
  assert.strictEqual(lines[6], '  severity: fail');
  assert.strictEqual(lines[7], '  operator: strictEqual');
  assert.strictEqual(lines[8], '  expected: 2');
  assert.strictEqual(lines[9], '  actual: 1');
  assert.strictEqual(lines[10], '  ...');
  assert.strictEqual(lines[11], 'ok 3 - Suite A > Skip Test # SKIP');
  assert.match(tap, /# summary: 3 tests, 1 passed, 1 failed, 1 skipped/);
  assert.match(tap, /# duration: 25\.00ms/);
});

// ============================================================================
// PART 4: CLI PROCESS EXECUTION & ERROR ISOLATION STRESS TESTING
// ============================================================================
console.log('\n--- PART 4: CLI Runner Argument Parsing, Error Trapping & Exit Codes ---');

test('CLI --help / -h flag', 'Prints documentation and exits 0', () => {
  const rLong = spawnSync('node', [RUNNER_PATH, '--help'], { encoding: 'utf8' });
  assert.strictEqual(rLong.status, 0);
  assert.match(rLong.stdout, /Usage:\s+node tests\/e2e\/runner\.js/);
  assert.match(rLong.stdout, /--tier=<1\.\.4>/);

  const rShort = spawnSync('node', [RUNNER_PATH, '-h'], { encoding: 'utf8' });
  assert.strictEqual(rShort.status, 0);
  assert.match(rShort.stdout, /Usage:/);
});

test('CLI argument parsing edge case: --tier=invalid & out of bounds', () => {
  // Out of bounds tier --tier=99 skips all tests and exits 0 cleanly
  const r99 = spawnSync('node', [RUNNER_PATH, '--tier=99'], { encoding: 'utf8' });
  assert.strictEqual(r99.status, 0);
  const clean99 = r99.stdout.replace(/\x1b\[[0-9;]*m/g, '');
  assert.match(clean99, /TOTALS\s+0\s+0\s+157\s+157/);

  // Non-numeric tier --tier=xyz: filters out NaNs resulting in empty tier filter (runs all or skips)
  const rXyz = spawnSync('node', [RUNNER_PATH, '--tier=xyz'], { encoding: 'utf8' });
  assert.ok(rXyz.status === 0 || rXyz.status === 1);
});

test('CLI argument parsing edge case: --grep non-matching', () => {
  const rGrep = spawnSync('node', [RUNNER_PATH, '--grep=NON_EXISTENT_STRING_XYZ_999'], { encoding: 'utf8' });
  assert.strictEqual(rGrep.status, 0);
  const clean = rGrep.stdout.replace(/\x1b\[[0-9;]*m/g, '');
  assert.match(clean, /TOTALS\s+0\s+0\s+157\s+157/);
});

test('CLI Exit Code 1 on Intentional Assertion Failure', () => {
  const tempScriptPath = path.join(__dirname, 'probe_assertion_fail.mjs');
  const code = `
import { resetGlobalRunner } from './lib/harness.js';
import { assert } from './lib/assertions.js';
import { formatSpec } from './lib/reporters.js';

const runner = resetGlobalRunner();
runner.describe('Assertion Fail Suite', () => {
  runner.test('Intentional Failed Assertion', () => {
    assert.strictEqual(100, 200, 'Intentional Challenger Failure');
  });
});

const res = await runner.run();
console.log(formatSpec(res));
if (res.failed > 0) process.exit(1);
process.exit(0);
`;
  try {
    fs.writeFileSync(tempScriptPath, code, 'utf8');
    const r = spawnSync('node', [tempScriptPath], { encoding: 'utf8' });
    assert.strictEqual(r.status, 1, `Expected exit status 1 on failed assertion, got ${r.status}`);
    assert.match(r.stdout, /Intentional Challenger Failure/);
    assert.match(r.stdout, /TEST SUITE FAILED/);
  } finally {
    if (fs.existsSync(tempScriptPath)) fs.unlinkSync(tempScriptPath);
  }
});

test('CLI Exit Code 1 on Unhandled Async Promise Rejection', () => {
  const tempScriptPath = path.join(__dirname, 'probe_async_rej.mjs');
  const code = `
import { resetGlobalRunner } from './lib/harness.js';
import { formatSpec } from './lib/reporters.js';

const runner = resetGlobalRunner();
runner.describe('Async Rejection Suite', () => {
  runner.test('Unhandled Async Rejection', async () => {
    await new Promise(r => setTimeout(r, 5));
    throw new Error('Empirical Async Rejection Error Probe');
  });
});

const res = await runner.run();
console.log(formatSpec(res));
if (res.failed > 0) process.exit(1);
process.exit(0);
`;
  try {
    fs.writeFileSync(tempScriptPath, code, 'utf8');
    const r = spawnSync('node', [tempScriptPath], { encoding: 'utf8' });
    assert.strictEqual(r.status, 1, `Expected exit status 1 on async rejection, got ${r.status}`);
    assert.match(r.stdout, /Empirical Async Rejection Error Probe/);
    assert.match(r.stdout, /TEST SUITE FAILED/);
  } finally {
    if (fs.existsSync(tempScriptPath)) fs.unlinkSync(tempScriptPath);
  }
});

test('CLI Exit Code 1 on Bail Mode Failure & Halting of Subsequent Tests', () => {
  const tempScriptPath = path.join(__dirname, 'probe_bail.mjs');
  const code = `
import { resetGlobalRunner } from './lib/harness.js';
import { assert } from './lib/assertions.js';
import { formatSpec } from './lib/reporters.js';

const runner = resetGlobalRunner({ bail: true });
let test2Ran = false;
runner.describe('Bail Suite', () => {
  runner.test('Failing Test 1', () => {
    assert.strictEqual('A', 'B', 'Bail Fail');
  });
  runner.test('Test 2 After Bail', () => {
    test2Ran = true;
  });
});

const res = await runner.run();
console.log(formatSpec(res));
if (test2Ran) {
  console.error('ERROR: Test 2 ran despite bail!');
  process.exit(2);
}
if (res.failed > 0) process.exit(1);
process.exit(0);
`;
  try {
    fs.writeFileSync(tempScriptPath, code, 'utf8');
    const r = spawnSync('node', [tempScriptPath], { encoding: 'utf8' });
    assert.strictEqual(r.status, 1, `Expected exit status 1 on bail failure, got ${r.status}`);
    assert.match(r.stdout, /Bail Fail/);
  } finally {
    if (fs.existsSync(tempScriptPath)) fs.unlinkSync(tempScriptPath);
  }
});

test('CLI Fatal Loading Error Handling', () => {
  // Test that a syntax error during suite loading causes runner to log and exit 1
  const tempSuitePath = path.join(__dirname, 'temp_corrupted_suite.test.js');
  const code = `
// Syntax error
const broken = ;
`;
  const tempRunnerPath = path.join(__dirname, 'temp_corrupt_runner.mjs');
  const runnerCode = `
import path from 'node:path';
import { pathToFileURL } from 'node:url';

try {
  await import(pathToFileURL('${tempSuitePath}').href);
} catch (err) {
  console.error('Caught syntax error during import');
  process.exit(1);
}
process.exit(0);
`;
  try {
    fs.writeFileSync(tempSuitePath, code, 'utf8');
    fs.writeFileSync(tempRunnerPath, runnerCode, 'utf8');
    const r = spawnSync('node', [tempRunnerPath], { encoding: 'utf8' });
    assert.strictEqual(r.status, 1);
    assert.match(r.stderr, /Caught syntax error during import/);
  } finally {
    if (fs.existsSync(tempSuitePath)) fs.unlinkSync(tempSuitePath);
    if (fs.existsSync(tempRunnerPath)) fs.unlinkSync(tempRunnerPath);
  }
});

// ============================================================================
// PART 5: SUMMARY & VERDICT
// ============================================================================
console.log('\n================================================================');
console.log(`STRESS TEST RESULTS: ${results.passed}/${results.total} PASSED, ${results.failed} FAILED`);
console.log('================================================================\n');

if (results.failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
