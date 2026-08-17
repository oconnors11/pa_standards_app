/**
 * RBCS PA Standards Visual Coherence Map — Light Theme & Theme Toggle Test Suite
 * Validates R1 (CSS Custom Properties), R2 (Theme Toggle & Persistence), and Contrast.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../');

console.log('================================================================');
console.log('PA STANDARDS APP — LIGHT THEME & TOGGLE VERIFICATION SUITE');
console.log('================================================================\n');

let passed = 0;
let failed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

// -----------------------------------------------------------------------------
// PART 1: CSS Custom Property Light Theme Token Overrides (R1)
// -----------------------------------------------------------------------------
console.log('--- 1. Testing CSS Custom Property Light Theme Tokens (R1) ---');

const cssPath = path.join(PROJECT_ROOT, 'src/index.css');
const css = fs.readFileSync(cssPath, 'utf8');

runTest('R1.1: Defines :root[data-theme="light"] or body.light-theme selector', () => {
  assert.ok(
    css.includes(':root[data-theme="light"]') || css.includes('[data-theme="light"]') || css.includes('body.light-theme'),
    'src/index.css must declare light theme selector block'
  );
});

runTest('R1.2: Overrides --bg-primary with #f4f6f8 in light theme', () => {
  assert.ok(css.includes('--bg-primary: #f4f6f8'), 'Must define --bg-primary: #f4f6f8');
});

runTest('R1.3: Overrides --bg-secondary and --bg-card with #ffffff in light theme', () => {
  assert.ok(css.includes('--bg-secondary: #ffffff'), 'Must define --bg-secondary: #ffffff');
  assert.ok(css.includes('--bg-card: #ffffff'), 'Must define --bg-card: #ffffff');
});

runTest('R1.4: Overrides --bg-card-hover with #f0f4f8 in light theme', () => {
  assert.ok(css.includes('--bg-card-hover: #f0f4f8'), 'Must define --bg-card-hover: #f0f4f8');
});

runTest('R1.5: Overrides --bg-elevated with #e2e8f0 in light theme', () => {
  assert.ok(css.includes('--bg-elevated: #e2e8f0'), 'Must define --bg-elevated: #e2e8f0');
});

runTest('R1.6: Overrides --text-main with #00234b (Deep Oxford Navy)', () => {
  assert.ok(
    css.includes('--text-main: #00234b') || css.includes('--text-main: #00234B'),
    'Must define --text-main: #00234b'
  );
});

runTest('R1.7: Overrides --text-silver with #475569', () => {
  assert.ok(css.includes('--text-silver: #475569'), 'Must define --text-silver: #475569');
});

runTest('R1.8: Overrides --text-muted with #64748b', () => {
  assert.ok(css.includes('--text-muted: #64748b'), 'Must define --text-muted: #64748b');
});

runTest('R1.9: Overrides --accent-crimson with #800022 (Crimson Burgundy)', () => {
  assert.ok(
    css.includes('--accent-crimson: #800022') || css.includes('--accent-crimson: #800022'),
    'Must define --accent-crimson: #800022'
  );
});

runTest('R1.10: Overrides --accent-crimson-bg with rgba(128, 0, 34, 0.10)', () => {
  assert.ok(
    css.includes('--accent-crimson-bg: rgba(128, 0, 34, 0.1') || css.includes('--accent-crimson-bg: rgba(128, 0, 34, 0.10)'),
    'Must define --accent-crimson-bg: rgba(128, 0, 34, 0.10)'
  );
});

runTest('R1.11: Defines --accent-crimson-text for high-contrast text on subtle crimson backgrounds', () => {
  assert.ok(css.includes('--accent-crimson-text: #800022'), 'Defines light theme --accent-crimson-text');
});

runTest('R1.12: Adjusts borders and shadows for light theme contrast', () => {
  assert.ok(css.includes('--border-subtle: rgba(0, 35, 75'), 'Defines light theme border-subtle');
  assert.ok(css.includes('--shadow-sm: 0 2px 8px rgba(0, 35, 75'), 'Defines light theme shadow-sm');
});

runTest('R1.13: Adjusts badges and search highlight for light theme contrast', () => {
  assert.ok(css.includes('.badge-dok') && css.includes('[data-theme="light"]'), 'Defines light badge-dok');
  assert.ok(css.includes('.badge-keystone') && css.includes('[data-theme="light"]'), 'Defines light badge-keystone');
  assert.ok(css.includes('mark.highlight') && css.includes('[data-theme="light"]'), 'Defines light mark.highlight');
  assert.ok(css.includes('.badge-ccss') && css.includes('.badge-pa'), 'Defines reusable authority badge classes');
});

runTest('R1.14: Defines light theme overrides for Hero Tile, Active Node, and hover states', () => {
  assert.ok(css.includes('.hero-tile') && css.includes('[data-theme="light"]'), 'Defines light .hero-tile');
  assert.ok(css.includes('.active-target-card') && css.includes('[data-theme="light"]'), 'Defines light .active-target-card');
  assert.ok(css.includes('.topic-chip:hover') && css.includes('[data-theme="light"]'), 'Defines light .topic-chip:hover');
});


// -----------------------------------------------------------------------------
// PART 2: Theme Toggle Control & Storage Persistence (R2)
// -----------------------------------------------------------------------------
console.log('\n--- 2. Testing Theme Hook & Header Control (R2) ---');

const useThemePath = path.join(PROJECT_ROOT, 'src/hooks/useTheme.js');
runTest('R2.1: useTheme.js hook exists and exports useTheme, getStoredTheme with cross-tab sync', () => {
  assert.ok(fs.existsSync(useThemePath), 'src/hooks/useTheme.js must exist');
  const code = fs.readFileSync(useThemePath, 'utf8');
  assert.ok(code.includes('export function useTheme') || code.includes('export default useTheme'), 'Exports useTheme');
  assert.ok(code.includes('localStorage.setItem'), 'Writes theme to localStorage');
  assert.ok(code.includes('setAttribute(\'data-theme\'') || code.includes('setAttribute("data-theme"'), 'Sets data-theme on root');
  assert.ok(code.includes('window.addEventListener(\'storage\'') || code.includes('window.addEventListener("storage"'), 'Listens for cross-tab storage sync');
});

const headerPath = path.join(PROJECT_ROOT, 'src/components/Header.jsx');
const headerCode = fs.readFileSync(headerPath, 'utf8');

runTest('R2.2: Header.jsx imports Sun and Moon icons from lucide-react', () => {
  assert.ok(headerCode.includes('Sun') && headerCode.includes('Moon'), 'Must import Sun and Moon');
});

runTest('R2.3: Header.jsx renders theme toggle button with accessibility attributes', () => {
  assert.ok(headerCode.includes('theme-toggle') || headerCode.includes('aria-label'), 'Must have theme toggle button');
  assert.ok(headerCode.includes('aria-label='), 'Must have aria-label for screen readers');
  assert.ok(headerCode.includes('title='), 'Must have tooltip title');
});

runTest('R2.4: Header.jsx toggles between Sun and Moon icons based on theme', () => {
  assert.ok(headerCode.includes('theme === \'dark\'') || headerCode.includes('theme === "dark"'), 'Checks theme state');
  assert.ok(headerCode.includes('<Sun') && headerCode.includes('<Moon'), 'Conditionally renders Sun or Moon icon');
});

const appPath = path.join(PROJECT_ROOT, 'src/App.jsx');
const appCode = fs.readFileSync(appPath, 'utf8');

runTest('R2.5: App.jsx integrates useTheme and passes theme handler to Header', () => {
  assert.ok(appCode.includes('useTheme'), 'App.jsx imports useTheme');
  assert.ok(appCode.includes('theme={theme}') || appCode.includes('onToggleTheme='), 'Passes theme props to Header');
});

const indexPath = path.join(PROJECT_ROOT, 'index.html');
const indexHtml = fs.readFileSync(indexPath, 'utf8');

runTest('R2.6: index.html contains early theme detection script to prevent FOUC', () => {
  assert.ok(indexHtml.includes('localStorage.getItem'), 'Reads theme early in <head>');
  assert.ok(indexHtml.includes('setAttribute(\'data-theme\'') || indexHtml.includes('setAttribute("data-theme"'), 'Applies data-theme before body renders');
});

runTest('R2.7: useTheme safely wraps localStorage access to prevent crashes in restricted sandbox/iframes', () => {
  const code = fs.readFileSync(useThemePath, 'utf8');
  assert.ok(code.includes('try {') && code.includes('catch'), 'Wraps localStorage in try/catch');
});


// -----------------------------------------------------------------------------
// PART 3: Contrast Ratios & WCAG Compliance
// -----------------------------------------------------------------------------
console.log('\n--- 3. Testing Color Contrast Ratios (WCAG AAA) ---');

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return [r, g, b];
}

function getLuminance([r, g, b]) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(hex1, hex2) {
  const l1 = getLuminance(hexToRgb(hex1));
  const l2 = getLuminance(hexToRgb(hex2));
  const bright = Math.max(l1, l2);
  const dark = Math.min(l1, l2);
  return (bright + 0.05) / (dark + 0.05);
}

runTest('R3.1: Deep Oxford Navy (#00234b) on Light Surface (#f4f6f8) meets WCAG AAA (> 7.0:1)', () => {
  const ratio = getContrastRatio('#00234b', '#f4f6f8');
  console.log(`      Calculated contrast ratio: ${ratio.toFixed(2)}:1 (Minimum AAA: 7.0:1)`);
  assert.ok(ratio >= 7.0, `Contrast ratio ${ratio} must be >= 7.0:1`);
});

runTest('R3.2: Deep Oxford Navy (#00234b) on White Card (#ffffff) meets WCAG AAA (> 7.0:1)', () => {
  const ratio = getContrastRatio('#00234b', '#ffffff');
  console.log(`      Calculated contrast ratio: ${ratio.toFixed(2)}:1 (Minimum AAA: 7.0:1)`);
  assert.ok(ratio >= 7.0, `Contrast ratio ${ratio} must be >= 7.0:1`);
});

runTest('R3.3: Crimson Burgundy (#800022) on Light Surface (#f4f6f8) meets WCAG AAA (> 7.0:1)', () => {
  const ratio = getContrastRatio('#800022', '#f4f6f8');
  console.log(`      Calculated contrast ratio: ${ratio.toFixed(2)}:1 (Minimum AAA: 7.0:1)`);
  assert.ok(ratio >= 7.0, `Contrast ratio ${ratio} must be >= 7.0:1`);
});

runTest('R3.4: Crimson Burgundy (#800022) on White Card (#ffffff) meets WCAG AAA (> 7.0:1)', () => {
  const ratio = getContrastRatio('#800022', '#ffffff');
  console.log(`      Calculated contrast ratio: ${ratio.toFixed(2)}:1 (Minimum AAA: 7.0:1)`);
  assert.ok(ratio >= 7.0, `Contrast ratio ${ratio} must be >= 7.0:1`);
});

runTest('R3.5: White Text (#ffffff) on Crimson Burgundy (#800022) meets WCAG AAA (> 7.0:1)', () => {
  const ratio = getContrastRatio('#ffffff', '#800022');
  console.log(`      Calculated contrast ratio: ${ratio.toFixed(2)}:1 (Minimum AAA: 7.0:1)`);
  assert.ok(ratio >= 7.0, `Contrast ratio ${ratio} must be >= 7.0:1`);
});

// -----------------------------------------------------------------------------
// PART 4: Component Integration & High Contrast Validation
// -----------------------------------------------------------------------------
console.log('\n--- 4. Testing Component High Contrast Integrations ---');

const modalCode = fs.readFileSync(path.join(PROJECT_ROOT, 'src/components/StandardDetailModal.jsx'), 'utf8');
runTest('R4.1: StandardDetailModal active tab text uses high contrast tokens instead of #FFFFFF on white', () => {
  assert.ok(!modalCode.includes("color: activeTab === 'overview' ? '#FFFFFF'"), 'No hardcoded white text on active tab overview');
  assert.ok(!modalCode.includes("color: activeTab === 'ai_objectives' ? '#FFFFFF'"), 'No hardcoded white text on active tab objectives');
  assert.ok(modalCode.includes('var(--accent-crimson-text)'), 'Uses high-contrast token on active tabs');
});

const filterBarCode = fs.readFileSync(path.join(PROJECT_ROOT, 'src/components/FilterBar.jsx'), 'utf8');
runTest('R4.2: FilterBar active buttons and checks avoid low-contrast white/pink in light theme', () => {
  assert.ok(!filterBarCode.includes("color: active ? '#FFFFFF' : 'var(--text-muted)'"), 'Active subject/scope buttons do not use white text on light pink');
  assert.ok(filterBarCode.includes('var(--accent-crimson-text)'), 'Uses var(--accent-crimson-text) for active items');
  assert.ok(filterBarCode.includes('var(--accent-crimson)'), 'Uses var(--accent-crimson) for Clear All action');
});

const searchBarCode = fs.readFileSync(path.join(PROJECT_ROOT, 'src/components/SearchBar.jsx'), 'utf8');
runTest('R4.3: SearchBar keyword hover and reset button use high-contrast CSS custom properties', () => {
  assert.ok(!searchBarCode.includes("color: '#ff5c7a'"), 'Reset button does not use low-contrast pink');
  assert.ok(searchBarCode.includes('var(--accent-crimson)'), 'Uses var(--accent-crimson)');
  assert.ok(searchBarCode.includes('var(--accent-crimson-text)'), 'Uses var(--accent-crimson-text)');
});

const cardCode = fs.readFileSync(path.join(PROJECT_ROOT, 'src/components/StandardCard.jsx'), 'utf8');
runTest('R4.4: StandardCard uses CSS classes badge-ccss and badge-pa instead of low-contrast hardcoded hex', () => {
  assert.ok(cardCode.includes('badge-ccss') && cardCode.includes('badge-pa'), 'Uses badge-ccss and badge-pa');
  assert.ok(!cardCode.includes('#38bdf820'), 'No hardcoded low-contrast light blue on card');
  assert.ok(!cardCode.includes('#10b98120'), 'No hardcoded low-contrast light green on card');
});

const coherenceCode = fs.readFileSync(path.join(PROJECT_ROOT, 'src/components/CoherenceMapView.jsx'), 'utf8');
runTest('R4.5: CoherenceMapView floating toolbar and assessment limits use theme-adaptive contrast', () => {
  assert.ok(!coherenceCode.includes("background: 'rgba(5, 15, 30, 0.85)'"), 'No hardcoded dark background on toolbar');
  assert.ok(coherenceCode.includes("background: 'var(--bg-card)'"), 'Toolbar uses var(--bg-card)');
});



const treeCode = fs.readFileSync(path.join(PROJECT_ROOT, 'src/components/HierarchyTreeView.jsx'), 'utf8');
const crosswalkCode = fs.readFileSync(path.join(PROJECT_ROOT, 'src/components/VerticalCrosswalkView.jsx'), 'utf8');
runTest('R4.7: HierarchyTreeView and VerticalCrosswalkView use theme semantic variables for surfaces and text', () => {
  assert.ok(treeCode.includes("background: 'var(--bg-card)'"), 'HierarchyTreeView uses var(--bg-card)');
  assert.ok(treeCode.includes("color: 'var(--text-main)'"), 'HierarchyTreeView uses var(--text-main)');
  assert.ok(crosswalkCode.includes("background: 'var(--bg-secondary)'"), 'VerticalCrosswalkView uses var(--bg-secondary)');
  assert.ok(crosswalkCode.includes("color: 'var(--text-main)'"), 'VerticalCrosswalkView uses var(--text-main)');
});

const toastCode = fs.readFileSync(path.join(PROJECT_ROOT, 'src/components/Toast.jsx'), 'utf8');
runTest('R4.8: Toast notification component uses semantic variables for elevation, border, and text', () => {
  assert.ok(toastCode.includes("background: 'var(--bg-elevated)'"), 'Toast uses var(--bg-elevated)');
  assert.ok(toastCode.includes("color: 'var(--text-main)'"), 'Toast uses var(--text-main)');
  assert.ok(toastCode.includes("border: '1px solid var(--border-medium)'"), 'Toast uses var(--border-medium)');
});

const homeCode = fs.readFileSync(path.join(PROJECT_ROOT, 'src/components/HomePage.jsx'), 'utf8');
runTest('R4.9: HomePage uses theme-adaptive variables for all grade bands and deep-dive cards', () => {
  assert.ok(homeCode.includes("color: 'var(--text-main)'") || homeCode.includes('color: var(--text-main)'), 'HomePage uses var(--text-main)');
  assert.ok(homeCode.includes("color: 'var(--text-muted)'") || homeCode.includes('color: var(--text-muted)'), 'HomePage uses var(--text-muted)');
  assert.ok(homeCode.includes("background: 'var(--bg-card)'") || homeCode.includes('background: var(--bg-card)'), 'HomePage uses var(--bg-card)');
});

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log(`THEME TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('================================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
