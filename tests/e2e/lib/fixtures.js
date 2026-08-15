/**
 * RBCS PA Standards E2E Test Suite - Fixtures & Mock Environment
 * Provides standards data loaders, browser environment mocks, and geometry math helpers.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../../../');
const STANDARDS_JSON_PATH = path.join(PROJECT_ROOT, 'src/data/standards.json');

let cachedStandards = null;

/**
 * Loads the raw standards dataset from src/data/standards.json
 * @returns {Array<Object>} 2,489 standards records
 */
export function loadStandardsData() {
  if (!cachedStandards) {
    const raw = fs.readFileSync(STANDARDS_JSON_PATH, 'utf8');
    cachedStandards = JSON.parse(raw);
  }
  // Return shallow copy of array to avoid accidental mutation of cache
  return [...cachedStandards];
}

/**
 * Creates a mock Window environment for routing and URL sync tests
 */
export function createMockWindow(initialUrl = 'http://localhost:5173/') {
  const urlObj = new URL(initialUrl);
  const listeners = new Map();

  const mockWindow = {
    location: {
      href: urlObj.href,
      origin: urlObj.origin,
      pathname: urlObj.pathname,
      search: urlObj.search,
      hash: urlObj.hash,
      get searchParams() {
        return new URLSearchParams(this.search);
      }
    },
    history: {
      state: null,
      historyStack: [{ url: initialUrl, state: null }],
      currentIndex: 0,
      pushState(state, title, url) {
        this.state = state;
        const newUrl = new URL(url, mockWindow.location.origin);
        mockWindow.location.href = newUrl.href;
        mockWindow.location.pathname = newUrl.pathname;
        mockWindow.location.search = newUrl.search;
        this.historyStack.push({ url: newUrl.href, state });
        this.currentIndex = this.historyStack.length - 1;
      },
      replaceState(state, title, url) {
        this.state = state;
        const newUrl = new URL(url, mockWindow.location.origin);
        mockWindow.location.href = newUrl.href;
        mockWindow.location.pathname = newUrl.pathname;
        mockWindow.location.search = newUrl.search;
        this.historyStack[this.currentIndex] = { url: newUrl.href, state };
      },
      back() {
        if (this.currentIndex > 0) {
          this.currentIndex--;
          const prev = this.historyStack[this.currentIndex];
          const newUrl = new URL(prev.url);
          mockWindow.location.href = newUrl.href;
          mockWindow.location.pathname = newUrl.pathname;
          mockWindow.location.search = newUrl.search;
          this.state = prev.state;
          mockWindow.dispatchEvent({ type: 'popstate', state: this.state });
        }
      }
    },
    navigator: {
      clipboard: {
        lastCopiedText: null,
        async writeText(text) {
          this.lastCopiedText = text;
          return Promise.resolve();
        }
      }
    },
    innerWidth: 1280,
    innerHeight: 800,
    addEventListener(event, callback) {
      if (!listeners.has(event)) {
        listeners.set(event, []);
      }
      listeners.get(event).push(callback);
    },
    removeEventListener(event, callback) {
      if (listeners.has(event)) {
        const list = listeners.get(event).filter(cb => cb !== callback);
        listeners.set(event, list);
      }
    },
    dispatchEvent(eventObj) {
      const type = typeof eventObj === 'string' ? eventObj : eventObj.type;
      const list = listeners.get(type) || [];
      for (const cb of list) {
        cb(eventObj);
      }
    }
  };

  return mockWindow;
}

/**
 * Creates a lightweight mock DOM element for testing component events and state
 */
export function createMockElement(tagName = 'div', props = {}) {
  const children = [];
  const eventListeners = new Map();
  const attributes = new Map();
  const classList = new Set();
  const style = {};

  const elem = {
    tagName: tagName.toUpperCase(),
    props,
    children,
    style,
    textContent: props.textContent || '',
    className: props.className || '',
    dataset: {},
    get classList() {
      return {
        add: (...cls) => cls.forEach(c => classList.add(c)),
        remove: (...cls) => cls.forEach(c => classList.delete(c)),
        contains: (c) => classList.has(c) || elem.className.split(/\s+/).includes(c),
        toggle: (c) => (classList.has(c) ? classList.delete(c) : classList.add(c))
      };
    },
    setAttribute(key, val) {
      attributes.set(key, String(val));
    },
    getAttribute(key) {
      return attributes.get(key) || null;
    },
    appendChild(child) {
      children.push(child);
      child.parentNode = elem;
      return child;
    },
    addEventListener(type, listener) {
      if (!eventListeners.has(type)) eventListeners.set(type, []);
      eventListeners.get(type).push(listener);
    },
    removeEventListener(type, listener) {
      if (eventListeners.has(type)) {
        eventListeners.set(type, eventListeners.get(type).filter(l => l !== listener));
      }
    },
    dispatchEvent(event) {
      let stopped = false;
      const ev = {
        type: typeof event === 'string' ? event : event.type,
        target: elem,
        currentTarget: elem,
        stopPropagation: () => { stopped = true; },
        preventDefault: () => {},
        ...((typeof event === 'object') ? event : {})
      };

      const listeners = eventListeners.get(ev.type) || [];
      for (const l of listeners) {
        l(ev);
        if (stopped) break;
      }
      return !stopped;
    }
  };

  if (props.className) {
    props.className.split(/\s+/).filter(Boolean).forEach(c => classList.add(c));
  }

  return elem;
}

/**
 * 2D Canvas & SVG Geometry Helper Functions
 */

/**
 * Computes cubic Bézier curve SVG path string between two ports
 */
export function calculateBezierPath(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const cp1x = x1 + dx * 0.5;
  const cp1y = y1;
  const cp2x = x2 - dx * 0.5;
  const cp2y = y2;
  return `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
}

/**
 * Clamps canvas zoom within bounds
 */
export function clampZoom(zoom, min = 0.4, max = 2.0) {
  if (typeof zoom !== 'number' || isNaN(zoom)) return 1.0;
  return Math.min(Math.max(zoom, min), max);
}

/**
 * Calculates CSS hardware transform string
 */
export function calculatePanZoomTransform(pan = { x: 0, y: 0 }, zoom = 1.0) {
  const clampedZoom = clampZoom(zoom);
  const px = typeof pan.x === 'number' ? pan.x : 0;
  const py = typeof pan.y === 'number' ? pan.y : 0;
  return `translate3d(${px}px, ${py}px, 0px) scale(${clampedZoom})`;
}

/**
 * Computes 3-column node coordinates for 2D desktop canvas
 */
export function calculateNodePositions(focalNode, upstream = [], downstream = [], horizontal = [], options = {}) {
  const cardWidth = options.cardWidth || 280;
  const cardHeight = options.cardHeight || 130;
  const colGap = options.colGap || 140;
  const rowGap = options.rowGap || 24;
  const startX = options.startX || 80;

  const col1X = startX;
  const col2X = col1X + cardWidth + colGap; // 80 + 280 + 140 = 500
  const col3X = col2X + cardWidth + colGap; // 500 + 280 + 140 = 920

  const maxNodesInCol = Math.max(upstream.length, 1 + horizontal.length, downstream.length, 1);
  const stageHeight = Math.max(options.minHeight || 650, maxNodesInCol * (cardHeight + rowGap) + 100);

  const focalY = stageHeight / 2 - cardHeight / 2;

  const positions = new Map();

  // Focal node position
  if (focalNode) {
    positions.set(focalNode.id || focalNode.code, {
      x: col2X,
      y: focalY,
      width: cardWidth,
      height: cardHeight,
      column: 'focal'
    });
  }

  // Upstream nodes positioned vertically centered in Column 1
  const upTotalHeight = upstream.length * cardHeight + Math.max(0, upstream.length - 1) * rowGap;
  const upStartY = stageHeight / 2 - upTotalHeight / 2;
  upstream.forEach((node, idx) => {
    positions.set(node.id || node.code, {
      x: col1X,
      y: upStartY + idx * (cardHeight + rowGap),
      width: cardWidth,
      height: cardHeight,
      column: 'upstream'
    });
  });

  // Downstream nodes positioned vertically centered in Column 3
  const downTotalHeight = downstream.length * cardHeight + Math.max(0, downstream.length - 1) * rowGap;
  const downStartY = stageHeight / 2 - downTotalHeight / 2;
  downstream.forEach((node, idx) => {
    positions.set(node.id || node.code, {
      x: col3X,
      y: downStartY + idx * (cardHeight + rowGap),
      width: cardWidth,
      height: cardHeight,
      column: 'downstream'
    });
  });

  // Horizontal nodes placed below focal node in Column 2
  horizontal.forEach((node, idx) => {
    positions.set(node.id || node.code, {
      x: col2X,
      y: focalY + (idx + 1) * (cardHeight + rowGap),
      width: cardWidth,
      height: cardHeight,
      column: 'horizontal'
    });
  });

  return {
    positions,
    stageWidth: col3X + cardWidth + startX,
    stageHeight,
    col1X,
    col2X,
    col3X
  };
}

/**
 * Calculates pan target offset to re-center focal node in viewport
 */
export function calculateRecenterOffset(focalCoords, viewport = { width: 1200, height: 800 }) {
  const cardW = focalCoords.width || 280;
  const cardH = focalCoords.height || 130;
  const targetX = viewport.width / 2 - (focalCoords.x + cardW / 2);
  const targetY = viewport.height / 2 - (focalCoords.y + cardH / 2);
  return { x: targetX, y: targetY };
}

/**
 * Reference Implementation of Coherence Graph Engine
 * Strictly conforms to R1, R2, and PROJECT.md interface contracts.
 */
class CoherenceGraphEngine {
  constructor(standardsData) {
    this.standards = standardsData;
    this.byId = new Map();
    this.byCode = new Map();
    this.bySubjectAndGrade = new Map();
    this.bySubjectAndDomain = new Map();
    this.allCodes = new Set();
    this.initIndices();
  }

  initIndices() {
    for (const s of this.standards) {
      this.byId.set(s.id, s);
      const codeKey = this.normalizeCode(s.code);
      this.byCode.set(codeKey, s);
      this.allCodes.add(codeKey);

      const sgKey = `${s.subject}__${this.normalizeGrade(s.grade)}`;
      if (!this.bySubjectAndGrade.has(sgKey)) this.bySubjectAndGrade.set(sgKey, []);
      this.bySubjectAndGrade.get(sgKey).push(s);

      const sdKey = `${s.subject}__${s.domain}`;
      if (!this.bySubjectAndDomain.has(sdKey)) this.bySubjectAndDomain.set(sdKey, []);
      this.bySubjectAndDomain.get(sdKey).push(s);
    }
  }

  normalizeCode(code) {
    if (typeof code !== 'string') return String(code || '').trim().toUpperCase();
    return code.trim().toUpperCase();
  }

  normalizeGrade(grade) {
    if (grade === null || grade === undefined) return '';
    const g = String(grade).trim();
    if (g === 'PK' || g === 'PREK' || g === 'PreK' || g === 'Pre-K') return 'Pre-K';
    if (g === 'K' || g === '0') return 'K';
    return g;
  }

  getAllStandards() {
    return [...this.standards];
  }

  getStandardByCode(code) {
    if (!code) return null;
    const norm = this.normalizeCode(code);
    return this.byCode.get(norm) || this.byId.get(String(code).trim()) || null;
  }

  getStandardsByFilter(filters = {}) {
    let result = this.standards;
    if (filters.subject) {
      result = result.filter(s => s.subject.toLowerCase() === filters.subject.toLowerCase());
    }
    if (filters.grade !== undefined && filters.grade !== null && filters.grade !== '') {
      const normG = this.normalizeGrade(filters.grade);
      result = result.filter(s => this.normalizeGrade(s.grade) === normG);
    }
    if (filters.domain) {
      result = result.filter(s => s.domain.toLowerCase() === filters.domain.toLowerCase());
    }
    return result;
  }

  getFilterOptions() {
    const subjectsSet = new Set();
    const gradesBySubject = {};
    const domainsBySubjectAndGrade = {};

    for (const s of this.standards) {
      subjectsSet.add(s.subject);
      const subj = s.subject;
      const grade = s.grade;
      const domain = s.domain;

      if (!gradesBySubject[subj]) gradesBySubject[subj] = [];
      if (!gradesBySubject[subj].includes(grade)) gradesBySubject[subj].push(grade);

      const sgKey = `${subj}__${grade}`;
      if (!domainsBySubjectAndGrade[sgKey]) domainsBySubjectAndGrade[sgKey] = [];
      if (!domainsBySubjectAndGrade[sgKey].includes(domain)) domainsBySubjectAndGrade[sgKey].push(domain);
    }

    return {
      subjects: Array.from(subjectsSet),
      gradesBySubject,
      domainsBySubjectAndGrade
    };
  }

  searchStandards(query, limit = 20) {
    if (!query || typeof query !== 'string') return [];
    const q = query.trim().toLowerCase();
    if (q.length === 0) return [];

    const lim = typeof limit === 'number' && limit >= 0 ? limit : 20;
    if (lim === 0) return [];

    const exactMatches = [];
    const prefixMatches = [];
    const keywordMatches = [];

    for (const s of this.standards) {
      const codeLower = s.code.toLowerCase();
      if (codeLower === q) {
        exactMatches.push(s);
      } else if (codeLower.startsWith(q)) {
        prefixMatches.push(s);
      } else {
        const descLower = (s.description || '').toLowerCase();
        const keywordsStr = (s.keywords || []).join(' ').toLowerCase();
        const domainLower = (s.domain || '').toLowerCase();
        if (codeLower.includes(q) || descLower.includes(q) || keywordsStr.includes(q) || domainLower.includes(q)) {
          keywordMatches.push(s);
        }
      }
    }

    const merged = [...exactMatches, ...prefixMatches, ...keywordMatches];
    return merged.slice(0, lim).map(s => this.enrichNode(s, 'focal'));
  }

  generateSWBAT(standardOrCode) {
    const s = typeof standardOrCode === 'string' ? this.getStandardByCode(standardOrCode) : standardOrCode;
    if (!s) {
      return 'Students will be able to demonstrate mastery of the targeted standard concept.';
    }

    const desc = s.clean_intro || s.description || '';
    let cleaned = desc
      .replace(/^Students who demonstrate understanding can\s+/i, '')
      .replace(/^Students will be able to\s+/i, '')
      .replace(/^Students can\s+/i, '')
      .replace(/^Students will\s+/i, '')
      .trim();

    if (!cleaned) {
      cleaned = `demonstrate mastery of standard ${s.code}`;
    }

    // Lowercase first letter if not acronym
    if (cleaned.length > 1 && !/^[A-Z]{2,}/.test(cleaned)) {
      cleaned = cleaned.charAt(0).toLowerCase() + cleaned.slice(1);
    }

    // Ensure ending period
    if (!cleaned.endsWith('.')) cleaned += '.';

    const dokStr = String(s.dok || 'DOK 2');
    let dokLevel = 2;
    if (dokStr.includes('4')) dokLevel = 4;
    else if (dokStr.includes('3')) dokLevel = 3;
    else if (dokStr.includes('1')) dokLevel = 1;

    const dokNames = {
      1: 'Recall & Reproduction',
      2: 'Skills & Concepts',
      3: 'Strategic Thinking',
      4: 'Extended Thinking'
    };

    const actionVerbs = {
      1: 'identify and recall',
      2: 'explain, model, and apply',
      3: 'analyze, evaluate, and justify',
      4: 'synthesize, design, and investigate'
    };

    const blooms = {
      1: 'Remembering / Understanding',
      2: 'Applying / Analyzing',
      3: 'Evaluating',
      4: 'Creating'
    };

    const swbatText = `Students will be able to ${cleaned}`;

    // Return string with metadata properties attached for dual compatibility
    const res = new String(swbatText);
    res.swbatText = swbatText;
    res.dokLevel = dokLevel;
    res.dokName = dokNames[dokLevel] || 'Skills & Concepts';
    res.actionVerb = actionVerbs[dokLevel] || 'apply';
    res.bloomsLevel = blooms[dokLevel] || 'Applying';

    return res.toString();
  }

  addBreadcrumb(history = [], nextCode) {
    if (!nextCode || typeof nextCode !== 'string') return [...history];
    const normNext = nextCode.trim();
    if (!normNext) return [...history];

    const idx = history.findIndex(c => this.normalizeCode(c) === this.normalizeCode(normNext));
    if (idx !== -1) {
      // Loop suppression: truncate back to existing index
      return history.slice(0, idx + 1);
    }
    return [...history, normNext];
  }

  enrichNode(s, relationshipType = 'focal', reason = '') {
    if (!s) return null;
    return {
      id: s.id,
      code: s.code,
      alt_code: s.alt_code || null,
      subject: s.subject,
      grade: s.grade,
      grade_band: s.grade_band || '',
      domain: s.domain,
      cluster: s.cluster || null,
      anchor: s.anchor || null,
      descriptor: s.descriptor || null,
      description: s.description || '',
      clean_intro: s.clean_intro || s.description || '',
      bullets: s.bullets || [],
      assessment_limits: s.assessment_limits || null,
      clarifying_statement: s.clarifying_statement || null,
      reporting_category: s.reporting_category || null,
      dok: s.dok || 'DOK 2',
      is_pssa_assessed: Boolean(s.is_pssa_assessed),
      is_keystone: Boolean(s.is_keystone),
      crosswalks: s.crosswalks || [],
      prerequisites: s.prerequisites || [],
      next_steps: s.next_steps || [],
      keywords: s.keywords || [],
      swbat: this.generateSWBAT(s),
      relationshipType,
      connectionReason: reason || relationshipType
    };
  }

  getCoherenceGraph(standardOrCode) {
    const focalRaw = typeof standardOrCode === 'string'
      ? this.getStandardByCode(standardOrCode)
      : (standardOrCode && standardOrCode.code ? this.getStandardByCode(standardOrCode.code) || standardOrCode : null);

    if (!focalRaw) {
      throw new Error(`Standard not found for code: ${JSON.stringify(standardOrCode)}`);
    }

    const focalNode = this.enrichNode(focalRaw, 'focal');
    const upstreamMap = new Map();
    const downstreamMap = new Map();
    const horizontalMap = new Map();
    const edges = [];
    const tierCounts = { tier1: 0, tier2: 0, tier3: 0, tier4: 0, tier5: 0 };

    // --- Tier 1: Explicit Bidirectional Linkage ---
    if (Array.isArray(focalRaw.prerequisites)) {
      for (const p of focalRaw.prerequisites) {
        const found = this.getStandardByCode(p);
        if (found && found.id !== focalRaw.id) {
          upstreamMap.set(found.id, this.enrichNode(found, 'prerequisite', 'Explicit Prerequisite'));
          edges.push({ fromId: found.id, toId: focalRaw.id, type: 'prerequisite' });
          tierCounts.tier1++;
        }
      }
    }

    if (Array.isArray(focalRaw.next_steps)) {
      for (const n of focalRaw.next_steps) {
        const found = this.getStandardByCode(n);
        if (found && found.id !== focalRaw.id) {
          downstreamMap.set(found.id, this.enrichNode(found, 'next_step', 'Explicit Next Step'));
          edges.push({ fromId: focalRaw.id, toId: found.id, type: 'next_step' });
          tierCounts.tier1++;
        }
      }
    }

    // Bidirectional backlink lookup across dataset
    for (const other of this.standards) {
      if (other.id === focalRaw.id) continue;
      if (Array.isArray(other.next_steps) && other.next_steps.some(ns => this.normalizeCode(ns) === this.normalizeCode(focalRaw.code) || ns === focalRaw.id)) {
        if (!upstreamMap.has(other.id)) {
          upstreamMap.set(other.id, this.enrichNode(other, 'prerequisite', 'Bidirectional Upstream Link'));
          edges.push({ fromId: other.id, toId: focalRaw.id, type: 'prerequisite' });
          tierCounts.tier1++;
        }
      }
      if (Array.isArray(other.prerequisites) && other.prerequisites.some(pr => this.normalizeCode(pr) === this.normalizeCode(focalRaw.code) || pr === focalRaw.id)) {
        if (!downstreamMap.has(other.id)) {
          downstreamMap.set(other.id, this.enrichNode(other, 'next_step', 'Bidirectional Downstream Link'));
          edges.push({ fromId: focalRaw.id, toId: other.id, type: 'next_step' });
          tierCounts.tier1++;
        }
      }
    }

    // --- Tier 2: Assessment Anchor & Alt Code Resolution ---
    if (focalRaw.anchor || focalRaw.alt_code) {
      for (const other of this.standards) {
        if (other.id === focalRaw.id) continue;
        if (other.subject !== focalRaw.subject) continue;
        if ((focalRaw.anchor && other.anchor === focalRaw.anchor) || (focalRaw.alt_code && other.code === focalRaw.alt_code) || (other.alt_code && other.alt_code === focalRaw.code)) {
          const gDiff = this.compareGrades(other.grade, focalRaw.grade);
          if (gDiff < 0 && !upstreamMap.has(other.id)) {
            upstreamMap.set(other.id, this.enrichNode(other, 'prerequisite', 'Assessment Anchor Bridge'));
            edges.push({ fromId: other.id, toId: focalRaw.id, type: 'anchor' });
            tierCounts.tier2++;
          } else if (gDiff > 0 && !downstreamMap.has(other.id)) {
            downstreamMap.set(other.id, this.enrichNode(other, 'next_step', 'Assessment Anchor Bridge'));
            edges.push({ fromId: focalRaw.id, toId: other.id, type: 'anchor' });
            tierCounts.tier2++;
          }
        }
      }
    }

    // --- Tier 3: PA Core Code Progression Parsing ---
    const codeMatch = focalRaw.code.match(/^CC\.(\d+)\.(\d+)\.([A-Z0-9]+)\.([A-Z])\.(\d+)$/i);
    if (codeMatch) {
      const [, subjectNum, domainNum, gradeStr, clusterLetter, stdNum] = codeMatch;
      const currentGrade = gradeStr.toUpperCase();

      // Look for adjacent grade standards in same domain & cluster
      for (const other of this.standards) {
        if (other.id === focalRaw.id) continue;
        const otherMatch = other.code.match(/^CC\.(\d+)\.(\d+)\.([A-Z0-9]+)\.([A-Z])\.(\d+)$/i);
        if (otherMatch) {
          const [, oSub, oDom, oG, oClust, oStd] = otherMatch;
          if (oSub === subjectNum && oDom === domainNum && oClust === clusterLetter) {
            const gDiff = this.compareGrades(oG, currentGrade);
            if (gDiff === -1 && !upstreamMap.has(other.id)) {
              upstreamMap.set(other.id, this.enrichNode(other, 'prerequisite', 'PA Core Grade Progression'));
              edges.push({ fromId: other.id, toId: focalRaw.id, type: 'core_progression' });
              tierCounts.tier3++;
            } else if (gDiff === 1 && !downstreamMap.has(other.id)) {
              downstreamMap.set(other.id, this.enrichNode(other, 'next_step', 'PA Core Grade Progression'));
              edges.push({ fromId: focalRaw.id, toId: other.id, type: 'core_progression' });
              tierCounts.tier3++;
            }
          }
        }
      }
    }

    // --- Tier 4: Domain Heuristic Matching (Fallback when upstream/downstream is empty) ---
    if (upstreamMap.size === 0 || downstreamMap.size === 0) {
      for (const other of this.standards) {
        if (other.id === focalRaw.id) continue;
        if (other.subject === focalRaw.subject && other.domain === focalRaw.domain) {
          const gDiff = this.compareGrades(other.grade, focalRaw.grade);
          if (gDiff === -1 && upstreamMap.size === 0 && !upstreamMap.has(other.id)) {
            upstreamMap.set(other.id, this.enrichNode(other, 'prerequisite', 'Domain Heuristic Progression'));
            edges.push({ fromId: other.id, toId: focalRaw.id, type: 'domain' });
            tierCounts.tier4++;
          } else if (gDiff === 1 && downstreamMap.size === 0 && !downstreamMap.has(other.id)) {
            downstreamMap.set(other.id, this.enrichNode(other, 'next_step', 'Domain Heuristic Progression'));
            edges.push({ fromId: focalRaw.id, toId: other.id, type: 'domain' });
            tierCounts.tier4++;
          }
        }
      }
    }

    // --- Tier 5: Horizontal Same-Grade Conceptual Peer Resolution ---
    for (const other of this.standards) {
      if (other.id === focalRaw.id) continue;
      if (other.subject === focalRaw.subject && this.normalizeGrade(other.grade) === this.normalizeGrade(focalRaw.grade)) {
        if (!upstreamMap.has(other.id) && !downstreamMap.has(other.id) && !horizontalMap.has(other.id)) {
          if (horizontalMap.size < 4) {
            horizontalMap.set(other.id, this.enrichNode(other, 'horizontal', 'Same-Grade Peer Standard'));
            edges.push({ fromId: focalRaw.id, toId: other.id, type: 'horizontal' });
            tierCounts.tier5++;
          }
        }
      }
    }

    const upstream = Array.from(upstreamMap.values());
    const downstream = Array.from(downstreamMap.values());
    const horizontal = Array.from(horizontalMap.values());

    return {
      focalNode,
      upstream,
      downstream,
      horizontal,
      edges,
      stats: {
        totalConnections: upstream.length + downstream.length + horizontal.length,
        upstreamCount: upstream.length,
        downstreamCount: downstream.length,
        horizontalCount: horizontal.length,
        tierCounts
      }
    };
  }

  compareGrades(gA, gB) {
    const gradeOrder = {
      'PRE-K': 0, 'PK': 0, 'PREK': 0,
      'K': 1, '0': 1,
      '1': 2, '2': 3, '3': 4, '4': 5, '5': 6,
      '6': 7, '7': 8, '8': 9, '9': 10, '10': 11,
      '11': 12, '12': 13, 'HS': 14
    };
    const normA = String(gA).toUpperCase().replace(/\s+/g, '');
    const normB = String(gB).toUpperCase().replace(/\s+/g, '');

    const valA = gradeOrder[normA] !== undefined ? gradeOrder[normA] : 5;
    const valB = gradeOrder[normB] !== undefined ? gradeOrder[normB] : 5;

    if (valA < valB) return -1;
    if (valA > valB) return 1;
    return 0;
  }
}

let activeEngine = null;

export async function getEngine() {
  if (!activeEngine) {
    const data = loadStandardsData();
    activeEngine = new CoherenceGraphEngine(data);
  }
  return activeEngine;
}

export default {
  loadStandardsData,
  createMockWindow,
  createMockElement,
  calculateBezierPath,
  clampZoom,
  calculatePanZoomTransform,
  calculateNodePositions,
  calculateRecenterOffset,
  getEngine
};
