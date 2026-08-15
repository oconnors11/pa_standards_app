/**
 * RBCS PA Standards E2E Test Suite - Reporters Module
 * Dual output formatters: ANSI Pretty Spec Reporter & Standard TAP v13 Formatter.
 */

// ANSI Color Escape Sequences
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgBlue: '\x1b[44m',
  brightCrimson: '\x1b[38;2;128;0;34m',
  gold: '\x1b[38;2;217;119;6m'
};

export function formatSpec(results, options = {}) {
  const lines = [];
  const verbose = options.verbose || false;

  lines.push('');
  lines.push(`${c.bold}${c.cyan}================================================================================${c.reset}`);
  lines.push(`${c.bold}${c.brightCrimson}   RBCS PA STANDARDS VISUAL COHERENCE MAP — E2E TEST RUNNER SPEC REPORT   ${c.reset}`);
  lines.push(`${c.bold}${c.cyan}================================================================================${c.reset}`);
  lines.push('');

  // Group tests by Suite hierarchy
  let currentSuiteName = '';
  for (const t of results.tests) {
    const fullSuite = getFullSuiteName(t.suite);
    if (fullSuite !== currentSuiteName) {
      currentSuiteName = fullSuite;
      lines.push('');
      const tierBadge = t.meta.tier ? `${c.dim}[Tier ${t.meta.tier}]${c.reset} ` : '';
      lines.push(`${c.bold}${c.blue}▶ ${tierBadge}${currentSuiteName}${c.reset}`);
    }

    const durationStr = t.durationMs > 10 ? `${c.yellow}(${t.durationMs.toFixed(1)}ms)${c.reset}` : `${c.dim}(${t.durationMs.toFixed(1)}ms)${c.reset}`;

    if (t.status === 'PASSED') {
      lines.push(`  ${c.green}✓${c.reset} ${c.white}${t.name}${c.reset} ${durationStr}`);
    } else if (t.status === 'FAILED') {
      lines.push(`  ${c.red}✗ ${c.bold}${t.name}${c.reset} ${durationStr}`);
      if (t.error) {
        const errorMsg = (t.error.message || String(t.error)).split('\n').map(l => `      ${c.red}${l}${c.reset}`).join('\n');
        lines.push(errorMsg);
        if (verbose && t.error.stack) {
          const stackLines = t.error.stack.split('\n').slice(1, 4).map(l => `        ${c.gray}${l.trim()}${c.reset}`).join('\n');
          lines.push(stackLines);
        }
      }
    } else if (t.status === 'SKIPPED') {
      lines.push(`  ${c.gray}○ ${t.name} (skipped)${c.reset}`);
    }
  }

  lines.push('');
  lines.push(`${c.cyan}--------------------------------------------------------------------------------${c.reset}`);
  lines.push(`${c.bold}TEST SUITE EXECUTION SUMMARY ACROSS TIERS${c.reset}`);
  lines.push(`${c.cyan}--------------------------------------------------------------------------------${c.reset}`);

  // Tier Table
  const tierHeaders = ['Tier Level', 'Description', 'Passed', 'Failed', 'Skipped', 'Total', 'Time (ms)'];
  lines.push(`${c.bold}${tierHeaders[0].padEnd(12)} ${tierHeaders[1].padEnd(32)} ${tierHeaders[2].padStart(8)} ${tierHeaders[3].padStart(8)} ${tierHeaders[4].padStart(8)} ${tierHeaders[5].padStart(8)} ${tierHeaders[6].padStart(10)}${c.reset}`);
  lines.push(`${c.gray}${''.padEnd(90, '-')}${c.reset}`);

  const tierDescs = {
    1: 'Feature Contracts & Core Unit',
    2: 'Boundaries, Corners & Stress',
    3: 'Cross-Feature Combinations',
    4: 'Real-World Workload Scenarios'
  };

  for (let tier = 1; tier <= 4; tier++) {
    const s = results.tiers[tier] || { pass: 0, fail: 0, skip: 0, total: 0, durationMs: 0 };
    const passColor = s.pass > 0 ? c.green : c.gray;
    const failColor = s.fail > 0 ? c.red : c.gray;
    lines.push(`Tier ${tier}`.padEnd(12) +
      ` ${tierDescs[tier]}`.padEnd(33) +
      ` ${passColor}${String(s.pass).padStart(8)}${c.reset}` +
      ` ${failColor}${String(s.fail).padStart(8)}${c.reset}` +
      ` ${String(s.skip).padStart(8)}` +
      ` ${c.bold}${String(s.total).padStart(8)}${c.reset}` +
      ` ${s.durationMs.toFixed(1).padStart(10)}`);
  }

  lines.push(`${c.gray}${''.padEnd(90, '-')}${c.reset}`);

  const totalColor = results.failed === 0 ? c.green : c.red;
  lines.push(`${c.bold}TOTALS`.padEnd(46) +
    ` ${c.green}${String(results.passed).padStart(8)}${c.reset}` +
    ` ${results.failed > 0 ? c.red : c.gray}${String(results.failed).padStart(8)}${c.reset}` +
    ` ${String(results.skipped).padStart(8)}` +
    ` ${c.bold}${String(results.total).padStart(8)}${c.reset}` +
    ` ${results.durationMs.toFixed(1).padStart(10)}${c.reset}`);

  lines.push('');
  if (results.failed === 0) {
    lines.push(`${c.bgGreen}${c.bold}${c.white}  ALL TESTS PASSED  ${c.reset} ${c.green}100% SUCCESS (${results.passed}/${results.total} passed in ${results.durationMs.toFixed(2)}ms)${c.reset}`);
  } else {
    lines.push(`${c.bgRed}${c.bold}${c.white}  TEST SUITE FAILED  ${c.reset} ${c.red}${results.failed} test(s) failed out of ${results.total} (${results.durationMs.toFixed(2)}ms)${c.reset}`);
  }
  lines.push('');

  return lines.join('\n');
}

export function formatTAP(results) {
  const lines = [];
  lines.push('TAP version 13');
  lines.push(`1..${results.tests.length}`);

  let testIndex = 1;
  for (const t of results.tests) {
    const fullTitle = `${getFullSuiteName(t.suite)} > ${t.name}`;
    if (t.status === 'PASSED') {
      lines.push(`ok ${testIndex} - ${fullTitle} # time=${t.durationMs.toFixed(2)}ms`);
    } else if (t.status === 'SKIPPED') {
      lines.push(`ok ${testIndex} - ${fullTitle} # SKIP`);
    } else if (t.status === 'FAILED') {
      lines.push(`not ok ${testIndex} - ${fullTitle} # time=${t.durationMs.toFixed(2)}ms`);
      lines.push('  ---');
      lines.push(`  message: ${JSON.stringify(t.error?.message || 'Assertion failed')}`);
      lines.push(`  severity: fail`);
      if (t.error?.operator) lines.push(`  operator: ${t.error.operator}`);
      if (t.error?.expected !== undefined) lines.push(`  expected: ${JSON.stringify(t.error.expected)}`);
      if (t.error?.actual !== undefined) lines.push(`  actual: ${JSON.stringify(t.error.actual)}`);
      if (t.error?.stack) {
        lines.push('  stack: |');
        t.error.stack.split('\n').forEach(line => lines.push(`    ${line}`));
      }
      lines.push('  ...');
    }
    testIndex++;
  }

  lines.push(`# summary: ${results.total} tests, ${results.passed} passed, ${results.failed} failed, ${results.skipped} skipped`);
  lines.push(`# duration: ${results.durationMs.toFixed(2)}ms`);

  return lines.join('\n');
}

function getFullSuiteName(suite) {
  const parts = [];
  let curr = suite;
  while (curr) {
    parts.unshift(curr.name);
    curr = curr.parent;
  }
  return parts.join(' > ');
}

export default {
  formatSpec,
  formatTAP
};
