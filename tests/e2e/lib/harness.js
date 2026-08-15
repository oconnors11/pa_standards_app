/**
 * RBCS PA Standards E2E Test Suite - Harness & Runner Registry
 * Zero-external-dependency lifecycle, test registry, and runner executor.
 */

import { performance } from 'node:perf_hooks';

export class TestRunner {
  constructor(options = {}) {
    this.options = {
      tier: options.tier || null,       // e.g. [1, 2] or null for all
      grep: options.grep || null,       // regex or substring
      bail: options.bail || false,      // stop on first failure
      verbose: options.verbose || false,// show detailed assertions
      tap: options.tap || false,        // output TAP v13
      ...options
    };

    this.suites = [];
    this.currentSuite = null;
    this.suiteStack = [];
    this.results = {
      passed: 0,
      failed: 0,
      skipped: 0,
      total: 0,
      startTime: 0,
      endTime: 0,
      durationMs: 0,
      tiers: {
        1: { pass: 0, fail: 0, skip: 0, total: 0, durationMs: 0 },
        2: { pass: 0, fail: 0, skip: 0, total: 0, durationMs: 0 },
        3: { pass: 0, fail: 0, skip: 0, total: 0, durationMs: 0 },
        4: { pass: 0, fail: 0, skip: 0, total: 0, durationMs: 0 }
      },
      tests: []
    };
  }

  describe(name, fn, meta = {}) {
    const parentSuite = this.currentSuite;
    const suite = {
      name,
      meta: { ...(parentSuite ? parentSuite.meta : {}), ...meta },
      parent: parentSuite,
      tests: [],
      childSuites: [],
      beforeHooks: [],
      afterHooks: [],
      beforeEachHooks: [],
      afterEachHooks: []
    };

    if (parentSuite) {
      parentSuite.childSuites.push(suite);
    } else {
      this.suites.push(suite);
    }

    this.suiteStack.push(suite);
    this.currentSuite = suite;

    try {
      fn();
    } finally {
      this.suiteStack.pop();
      this.currentSuite = this.suiteStack[this.suiteStack.length - 1] || null;
    }
  }

  test(name, fn, meta = {}) {
    if (!this.currentSuite) {
      this.describe('Default Suite', () => {});
    }

    const testItem = {
      name,
      fn,
      meta: { ...this.currentSuite.meta, ...meta },
      suite: this.currentSuite,
      status: 'PENDING',
      durationMs: 0,
      error: null
    };

    this.currentSuite.tests.push(testItem);
  }

  it(name, fn, meta = {}) {
    this.test(name, fn, meta);
  }

  before(fn) {
    if (this.currentSuite) this.currentSuite.beforeHooks.push(fn);
  }

  after(fn) {
    if (this.currentSuite) this.currentSuite.afterHooks.push(fn);
  }

  beforeEach(fn) {
    if (this.currentSuite) this.currentSuite.beforeEachHooks.push(fn);
  }

  afterEach(fn) {
    if (this.currentSuite) this.currentSuite.afterEachHooks.push(fn);
  }

  shouldRunTest(testItem) {
    // Filter by tier
    if (this.options.tier && this.options.tier.length > 0) {
      const testTier = testItem.meta.tier;
      if (testTier && !this.options.tier.includes(Number(testTier))) {
        return false;
      }
    }

    // Filter by grep pattern
    if (this.options.grep) {
      const fullTitle = `${this.getFullSuiteName(testItem.suite)} ${testItem.name}`;
      if (this.options.grep instanceof RegExp) {
        if (!this.options.grep.test(fullTitle)) return false;
      } else {
        if (!fullTitle.toLowerCase().includes(String(this.options.grep).toLowerCase())) return false;
      }
    }

    return true;
  }

  getFullSuiteName(suite) {
    const parts = [];
    let curr = suite;
    while (curr) {
      parts.unshift(curr.name);
      curr = curr.parent;
    }
    return parts.join(' > ');
  }

  async runSuite(suite) {
    // Collect all beforeEach and afterEach hooks from parent hierarchy
    const getAllBeforeEach = (s) => (s.parent ? getAllBeforeEach(s.parent) : []).concat(s.beforeEachHooks);
    const getAllAfterEach = (s) => s.afterEachHooks.concat(s.parent ? getAllAfterEach(s.parent) : []);

    const allBeforeEach = getAllBeforeEach(suite);
    const allAfterEach = getAllAfterEach(suite);

    // Run before hooks
    for (const hook of suite.beforeHooks) {
      await hook();
    }

    // Run tests in current suite
    for (const testItem of suite.tests) {
      const tier = testItem.meta.tier || 1;
      const tierStats = this.results.tiers[tier] || { pass: 0, fail: 0, skip: 0, total: 0, durationMs: 0 };
      tierStats.total++;
      this.results.total++;

      if (!this.shouldRunTest(testItem)) {
        testItem.status = 'SKIPPED';
        this.results.skipped++;
        tierStats.skip++;
        this.results.tests.push(testItem);
        continue;
      }

      // Run beforeEach hooks
      for (const hook of allBeforeEach) {
        await hook();
      }

      const start = performance.now();
      try {
        if (typeof testItem.fn === 'function') {
          const res = testItem.fn();
          if (res instanceof Promise) {
            await res;
          }
        }
        testItem.durationMs = performance.now() - start;
        testItem.status = 'PASSED';
        this.results.passed++;
        tierStats.pass++;
        tierStats.durationMs += testItem.durationMs;
      } catch (err) {
        testItem.durationMs = performance.now() - start;
        testItem.status = 'FAILED';
        testItem.error = err;
        this.results.failed++;
        tierStats.fail++;
        tierStats.durationMs += testItem.durationMs;

        if (this.options.bail) {
          this.results.tests.push(testItem);
          throw err;
        }
      } finally {
        // Run afterEach hooks
        for (const hook of allAfterEach) {
          try {
            await hook();
          } catch (err) {
            console.error('Error in afterEach hook:', err);
          }
        }
      }

      this.results.tests.push(testItem);
    }

    // Run child suites
    for (const child of suite.childSuites) {
      await this.runSuite(child);
    }

    // Run after hooks
    for (const hook of suite.afterHooks) {
      await hook();
    }
  }

  async run() {
    this.results.startTime = performance.now();
    try {
      for (const suite of this.suites) {
        await this.runSuite(suite);
      }
    } catch (err) {
      if (!this.options.bail) {
        console.error('Unexpected runner failure:', err);
      }
    } finally {
      this.results.endTime = performance.now();
      this.results.durationMs = this.results.endTime - this.results.startTime;
    }

    return this.results;
  }
}

// Global runner instance singleton
let globalRunner = new TestRunner();

export function getGlobalRunner() {
  return globalRunner;
}

export function resetGlobalRunner(options = {}) {
  globalRunner = new TestRunner(options);
  return globalRunner;
}

export const describe = (name, fn, meta) => globalRunner.describe(name, fn, meta);
export const test = (name, fn, meta) => globalRunner.test(name, fn, meta);
export const it = (name, fn, meta) => globalRunner.it(name, fn, meta);
export const before = (fn) => globalRunner.before(fn);
export const after = (fn) => globalRunner.after(fn);
export const beforeEach = (fn) => globalRunner.beforeEach(fn);
export const afterEach = (fn) => globalRunner.afterEach(fn);

export default {
  TestRunner,
  describe,
  test,
  it,
  before,
  after,
  beforeEach,
  afterEach,
  getGlobalRunner,
  resetGlobalRunner
};
