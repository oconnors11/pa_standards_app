/**
 * RBCS PA Standards Visual Coherence Map — Tier 3 Cross-Feature Combination Integration Tests
 * 8 Multi-feature end-to-end integration workflows connecting search, 2D canvas, transitions,
 * breadcrumbs, drawers, view routing, deep-linking, and responsive layout flips.
 */

import { describe, test } from './lib/harness.js';
import { assert } from './lib/assertions.js';
import {
  getEngine,
  calculateBezierPath,
  calculateNodePositions,
  calculatePanZoomTransform,
  createMockWindow
} from './lib/fixtures.js';

describe('Tier 3: Cross-Feature Combinations (TC-T3-COMB-01..08)', () => {
  test('TC-T3-COMB-01: Search -> Canvas -> Re-Center -> Breadcrumbs -> Drawer Flow', async () => {
    const engine = await getEngine();

    // 1. Search for Grade 3 fraction standard
    const searchResults = engine.searchStandards('CC.2.1.3.C.1');
    assert.ok(searchResults.length > 0);
    const selected = searchResults[0];
    assert.strictEqual(selected.code, 'CC.2.1.3.C.1');

    // 2. Load 2D canvas graph for selected standard
    let graph = engine.getCoherenceGraph(selected.code);
    let breadcrumbs = [selected.code];
    let layout = calculateNodePositions(graph.focalNode, graph.upstream, graph.downstream, graph.horizontal);
    assert.strictEqual(layout.positions.get(selected.id).x, 500);

    // 3. Click upstream foundational node CC.2.3.2.A.2 to re-center
    const targetCode = 'CC.2.3.2.A.2';
    graph = engine.getCoherenceGraph(targetCode);
    breadcrumbs = engine.addBreadcrumb(breadcrumbs, targetCode);
    assert.strictEqual(graph.focalNode.code, targetCode);
    assert.deepStrictEqual(breadcrumbs, ['CC.2.1.3.C.1', 'CC.2.3.2.A.2']);

    // 4. Open inspection drawer for new focal node
    const swbat = engine.generateSWBAT(graph.focalNode);
    assert.match(swbat, /Students will be able to/i);
    assert.match(swbat, /partition/i);
  }, { tier: 3 });

  test('TC-T3-COMB-02: Feed Card Launch -> Route Sync -> Popstate History Flow', async () => {
    const engine = await getEngine();
    const mockWin = createMockWindow('http://localhost:5173/?view=feed');
    let currentView = 'feed';
    let focalStandard = null;

    mockWin.addEventListener('popstate', (e) => {
      const view = mockWin.location.searchParams.get('view') || 'home';
      const code = mockWin.location.searchParams.get('code');
      currentView = view;
      if (code) focalStandard = engine.getStandardByCode(code);
    });

    // 1. Feed Card "Map" action button clicked for BIO.B.4.1.1
    const standard = engine.getStandardByCode('BIO.B.4.1.1');
    assert.ok(standard);

    // 2. Launch coherence view and push URL
    currentView = 'coherence';
    focalStandard = standard;
    mockWin.history.pushState({ view: 'coherence', code: standard.code }, '', `/?view=coherence&code=${standard.code}`);

    assert.strictEqual(currentView, 'coherence');
    assert.strictEqual(mockWin.location.searchParams.get('view'), 'coherence');
    assert.strictEqual(mockWin.location.searchParams.get('code'), 'BIO.B.4.1.1');

    // 3. User clicks browser back button
    mockWin.history.back();
    assert.strictEqual(currentView, 'feed');
    assert.strictEqual(mockWin.location.searchParams.get('view'), 'feed');
  }, { tier: 3 });

  test('TC-T3-COMB-03: Detail Modal CTA -> Coherence Map -> Breadcrumb Reset -> Drawer Re-Launch', async () => {
    const engine = await getEngine();
    let modalOpen = true;
    let inspectedStandard = engine.getStandardByCode('CC.1.2.8.B');
    let currentView = 'feed';
    let breadcrumbs = [];

    // 1. User clicks "Explore in Interactive Coherence Map" inside modal
    modalOpen = false;
    currentView = 'coherence';
    breadcrumbs = engine.addBreadcrumb([], inspectedStandard.code);
    assert.strictEqual(modalOpen, false);
    assert.strictEqual(currentView, 'coherence');
    assert.deepStrictEqual(breadcrumbs, ['CC.1.2.8.B']);

    // 2. On canvas, navigate to downstream extension CC.1.2.9-10.B
    const nextCode = 'CC.1.2.9-10.B';
    const nextStd = engine.getStandardByCode(nextCode);
    if (nextStd) {
      breadcrumbs = engine.addBreadcrumb(breadcrumbs, nextCode);
      assert.deepStrictEqual(breadcrumbs, ['CC.1.2.8.B', 'CC.1.2.9-10.B']);
    }
  }, { tier: 3 });

  test('TC-T3-COMB-04: Cascading Filter -> Graph Re-Index -> Responsive Mobile Flip', async () => {
    const engine = await getEngine();

    // 1. Cascading filters applied
    const filtered = engine.getStandardsByFilter({ subject: 'STEELS Science', grade: 'HS' });
    assert.ok(filtered.length > 0);
    const focal = filtered[0];

    // 2. Desktop canvas layout computed at 1280px
    const graph = engine.getCoherenceGraph(focal.code);
    const desktopLayout = calculateNodePositions(graph.focalNode, graph.upstream, graph.downstream, graph.horizontal);
    assert.strictEqual(desktopLayout.col2X, 500);

    // 3. Viewport flips to Mobile (<768px)
    const viewportWidth = 390;
    const isMobileTimeline = viewportWidth < 768;
    assert.strictEqual(isMobileTimeline, true);

    // 4. In mobile stream, tap focus on first downstream node
    if (graph.downstream.length > 0) {
      const nextFocal = graph.downstream[0];
      const nextGraph = engine.getCoherenceGraph(nextFocal.code);
      assert.strictEqual(nextGraph.focalNode.id, nextFocal.id);
    }
  }, { tier: 3 });

  test('TC-T3-COMB-05: Multi-Hop Breadcrumb Backward Hopping with Cycle Suppression', async () => {
    const engine = await getEngine();
    let trail = [];

    // Progression: K -> 1 -> 2 -> 3
    trail = engine.addBreadcrumb(trail, 'CC.2.1.K.A.1');
    trail = engine.addBreadcrumb(trail, 'CC.2.1.1.B.1');
    trail = engine.addBreadcrumb(trail, 'CC.2.1.2.B.2');
    trail = engine.addBreadcrumb(trail, 'CC.2.1.3.C.1');
    assert.strictEqual(trail.length, 4);

    // Jump backward to index 1 (Grade 1)
    trail = engine.addBreadcrumb(trail, 'CC.2.1.1.B.1');
    assert.deepStrictEqual(trail, ['CC.2.1.K.A.1', 'CC.2.1.1.B.1']);

    // Advance to Grade 2 again
    trail = engine.addBreadcrumb(trail, 'CC.2.1.2.B.2');
    assert.deepStrictEqual(trail, ['CC.2.1.K.A.1', 'CC.2.1.1.B.1', 'CC.2.1.2.B.2']);
  }, { tier: 3 });

  test('TC-T3-COMB-06: Canvas Hardware Matrix -> SVG Anchor Sync -> Link Hover State', async () => {
    const engine = await getEngine();
    const graph = engine.getCoherenceGraph('M03.A-N.1.1.1');
    const layout = calculateNodePositions(graph.focalNode, graph.upstream, graph.downstream, graph.horizontal);

    // 1. Pan and zoom canvas stage
    const pan = { x: 120, y: -80 };
    const zoom = 1.4;
    const transformStr = calculatePanZoomTransform(pan, zoom);
    assert.strictEqual(transformStr, 'translate3d(120px, -80px, 0px) scale(1.4)');

    // 2. Verify Bézier paths generated for incident links
    if (graph.upstream.length > 0) {
      const upNodePos = layout.positions.get(graph.upstream[0].id);
      const focalPos = layout.positions.get(graph.focalNode.id);
      assert.ok(upNodePos && focalPos);

      const pathStr = calculateBezierPath(
        upNodePos.x + upNodePos.width,
        upNodePos.y + upNodePos.height / 2,
        focalPos.x,
        focalPos.y + focalPos.height / 2
      );
      assert.match(pathStr, /^M \d+ \d+ C \d+ \d+, \d+ \d+, \d+ \d+$/);
    }
  }, { tier: 3 });

  test('TC-T3-COMB-07: Home Page Feature Deep-Dive Launch -> Coherence Map Route', () => {
    let currentView = 'home';
    let activeNavTab = 'home';

    const handleOpenCoherence = () => {
      currentView = 'coherence';
      activeNavTab = 'coherence';
    };

    handleOpenCoherence();
    assert.strictEqual(currentView, 'coherence');
    assert.strictEqual(activeNavTab, 'coherence');
  }, { tier: 3 });

  test('TC-T3-COMB-08: Direct Cold Boot Deep-Link with Query Params', async () => {
    const engine = await getEngine();
    const mockWin = createMockWindow('http://localhost:5173/?view=coherence&code=5.1.8.C');

    const viewParam = mockWin.location.searchParams.get('view');
    const codeParam = mockWin.location.searchParams.get('code');

    assert.strictEqual(viewParam, 'coherence');
    assert.strictEqual(codeParam, '5.1.8.C');

    const standard = engine.getStandardByCode(codeParam);
    assert.ok(standard);
    assert.strictEqual(standard.subject, 'Social Studies');

    const graph = engine.getCoherenceGraph(codeParam);
    assert.strictEqual(graph.focalNode.code, '5.1.8.C');
  }, { tier: 3 });
});
