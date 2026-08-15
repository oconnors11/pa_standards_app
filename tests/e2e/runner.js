#!/usr/bin/env node
/**
 * RBCS PA Standards Visual Coherence Map — Standalone E2E Test Runner
 * Zero-external-dependency ESM CLI test execution engine.
 */

import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import process from 'node:process';
import { resetGlobalRunner, getGlobalRunner } from './lib/harness.js';
import { formatSpec, formatTAP } from './lib/reporters.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseArgs(args) {
  const options = {
    tier: null,
    grep: null,
    tap: false,
    bail: false,
    verbose: false,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg.startsWith('--tier=')) {
      options.tier = arg.slice(7).split(',').map(n => Number(n.trim())).filter(n => !isNaN(n));
    } else if (arg === '-t' || arg === '--tier') {
      const next = args[++i];
      if (next) options.tier = next.split(',').map(n => Number(n.trim())).filter(n => !isNaN(n));
    } else if (arg.startsWith('--grep=')) {
      options.grep = arg.slice(7);
    } else if (arg === '-g' || arg === '--grep') {
      options.grep = args[++i];
    } else if (arg === '--tap') {
      options.tap = true;
    } else if (arg === '--bail' || arg === '-b') {
      options.bail = true;
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    }
  }

  return options;
}

function printHelp() {
  console.log(`
RBCS PA Standards Visual Coherence Map — E2E Test Runner

Usage:
  node tests/e2e/runner.js [options]

Options:
  --tier=<1..4>       Filter tests by tier level (comma-separated, e.g. --tier=1,2)
  -t <1..4>           Alias for --tier
  --grep=<pattern>    Filter tests by title pattern or regex
  -g <pattern>        Alias for --grep
  --tap               Format output as TAP version 13
  --bail, -b          Abort test execution immediately on first failure
  --verbose, -v       Print verbose details and stack traces
  --help, -h          Show this help documentation

Tiers:
  Tier 1: Feature Coverage (Engine & UI Components)
  Tier 2: Boundary, Corner & Dataset Stress Cases
  Tier 3: Cross-Feature Integration Combinations
  Tier 4: Real-World Application Workload Scenarios
`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printHelp();
    process.exit(0);
  }

  // Initialize fresh runner instance with CLI options
  const runner = resetGlobalRunner(options);

  // Define test files to load
  const testFiles = [
    'tier1_engine.test.js',
    'tier1_ui.test.js',
    'tier2_boundaries.test.js',
    'tier3_combinations.test.js',
    'tier4_realworld.test.js'
  ];

  for (const file of testFiles) {
    const filePath = path.join(__dirname, file);
    try {
      const fileUrl = pathToFileURL(filePath).href;
      await import(fileUrl);
    } catch (err) {
      console.error(`Failed to load test suite: ${file}\n`, err);
      process.exit(1);
    }
  }

  // Execute all registered suites
  const results = await runner.run();

  // Output results
  if (options.tap) {
    console.log(formatTAP(results));
  } else {
    console.log(formatSpec(results, { verbose: options.verbose }));
  }

  // Exit code semantics: 0 for all pass, 1 if any failure
  if (results.failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
