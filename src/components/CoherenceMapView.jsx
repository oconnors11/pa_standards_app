import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  Search, RotateCcw, ZoomIn, ZoomOut, Maximize2, 
  ArrowRight, ArrowLeft, Copy, Check, BookOpen, 
  Layers, Sparkles, ChevronRight, Info, X, 
  GitFork, Network, Filter, ArrowUpRight, Compass
} from 'lucide-react';
import { 
  getCoherenceGraph, 
  getStandardByCode, 
  searchStandards, 
  getFilterOptions, 
  getStandardsByFilter, 
  addBreadcrumb, 
  generateSWBAT,
  getAllStandards
} from '../utils/coherenceGraph';

// Standard subject color tokens
const SUBJECT_COLORS = {
  'Mathematics': {
    primary: 'var(--color-math)',
    bg: 'var(--color-math-bg)',
    border: 'var(--border-medium)',
    badgeClass: 'badge-math'
  },
  'English Language Arts': {
    primary: 'var(--color-ela)',
    bg: 'var(--color-ela-bg)',
    border: 'var(--border-medium)',
    badgeClass: 'badge-ela'
  },
  'STEELS Science': {
    primary: 'var(--color-steels)',
    bg: 'var(--color-steels-bg)',
    border: 'var(--border-medium)',
    badgeClass: 'badge-steels'
  },
  'Early Learning': {
    primary: 'var(--color-early)',
    bg: 'var(--color-early-bg)',
    border: 'var(--border-medium)',
    badgeClass: 'badge-early'
  },
  'Social Studies': {
    primary: 'var(--color-social)',
    bg: 'var(--color-social-bg)',
    border: 'var(--border-medium)',
    badgeClass: 'badge-social'
  }
};

function getSubjectColor(subject) {
  return SUBJECT_COLORS[subject] || SUBJECT_COLORS['Mathematics'];
}

export function CoherenceMapView({ 
  initialStandardCode = 'CCSS.MATH.CONTENT.4.NBT.B.4',
  onInspectStandard,
  onCopyCitation,
  onCopyShort
}) {
  // Resolve valid initial standard code
  const resolvedInitialCode = useMemo(() => {
    const found = getStandardByCode(initialStandardCode);
    if (found) return found.code;
    const all = getAllStandards();
    const firstMath = all.find(s => s.subject === 'Mathematics') || all[0];
    return firstMath ? firstMath.code : initialStandardCode;
  }, [initialStandardCode]);

  // Current active standard code
  const [activeCode, setActiveCode] = useState(resolvedInitialCode);
  const [breadcrumbTrail, setBreadcrumbTrail] = useState([resolvedInitialCode]);
  const [inspectedStandard, setInspectedStandard] = useState(null);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  
  // Cascading Filter state
  const filterOptions = useMemo(() => getFilterOptions(), []);
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [selectedGrade, setSelectedGrade] = useState('4');
  const [selectedDomain, setSelectedDomain] = useState('');
  
  // Canvas zoom & pan state for desktop
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  
  // Copy state
  const [copiedCode, setCopiedCode] = useState(null);

  // Update initial code if prop changes
  useEffect(() => {
    if (initialStandardCode) {
      const found = getStandardByCode(initialStandardCode);
      const codeToSet = found ? found.code : initialStandardCode;
      if (codeToSet !== activeCode) {
        setActiveCode(codeToSet);
        setBreadcrumbTrail(prev => addBreadcrumb(prev, codeToSet));
      }
    }
  }, [initialStandardCode]);

  // Compute graph data safely
  const graphData = useMemo(() => {
    return getCoherenceGraph(activeCode) || {};
  }, [activeCode]);

  const targetStandard = graphData.target || graphData.focalNode || null;
  const prerequisites = graphData.prerequisites || graphData.upstream || [];
  const nextSteps = graphData.nextSteps || graphData.downstream || [];
  const horizontal = graphData.horizontal || [];
  const stats = graphData.stats || {
    totalConnections: prerequisites.length + nextSteps.length + horizontal.length,
    upstreamCount: prerequisites.length,
    downstreamCount: nextSteps.length,
    horizontalCount: horizontal.length
  };

  // Sync cascading dropdowns when target changes
  useEffect(() => {
    if (targetStandard) {
      if (targetStandard.subject) setSelectedSubject(targetStandard.subject);
      if (targetStandard.grade) setSelectedGrade(targetStandard.grade);
      if (targetStandard.domain) setSelectedDomain(targetStandard.domain);
    }
  }, [targetStandard]);

  // Instant Search Handler
  const handleSearchChange = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.trim().length >= 1) {
      const results = searchStandards(q, 8);
      setSearchResults(results);
      setIsSearchDropdownOpen(true);
    } else {
      setSearchResults([]);
      setIsSearchDropdownOpen(false);
    }
  };

  // Select standard handler (re-centers map and updates breadcrumbs)
  const handleSelectStandard = useCallback((code) => {
    if (!code) return;
    setActiveCode(code);
    setBreadcrumbTrail(prev => addBreadcrumb(prev, code));
    setIsSearchDropdownOpen(false);
    setSearchQuery('');
    setPanOffset({ x: 0, y: 0 });
  }, []);

  // Quick copy short code
  const handleCopyCode = (e, standard) => {
    e.stopPropagation();
    navigator.clipboard.writeText(standard.code);
    setCopiedCode(standard.code);
    if (onCopyShort) onCopyShort(standard);
    setTimeout(() => setCopiedCode(null), 1800);
  };

  // Inspect standard in side drawer
  const handleOpenInspect = (e, standard) => {
    e.stopPropagation();
    setInspectedStandard(standard);
  };

  // Cascading Filter Available Grades & Domains
  const availableGrades = useMemo(() => {
    if (!filterOptions.bySubject[selectedSubject]) return [];
    return filterOptions.bySubject[selectedSubject].grades || [];
  }, [filterOptions, selectedSubject]);

  const availableDomains = useMemo(() => {
    if (!filterOptions.bySubject[selectedSubject]) return [];
    const domainsByGrade = filterOptions.bySubject[selectedSubject].domainsByGrade || {};
    return domainsByGrade[selectedGrade] || [];
  }, [filterOptions, selectedSubject, selectedGrade]);

  const availableStandardsInDomain = useMemo(() => {
    if (!selectedSubject || !selectedGrade) return [];
    return getStandardsByFilter({
      subject: selectedSubject,
      grade: selectedGrade,
      domain: selectedDomain
    }).slice(0, 15);
  }, [selectedSubject, selectedGrade, selectedDomain]);

  // Zoom / Reset Handlers
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.15, 1.6));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.15, 0.65));
  const handleResetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Desktop Pan Handlers
  const handleMouseDown = (e) => {
    if (e.target.closest('.interactive-node') || e.target.closest('.interactive-control')) return;
    setIsPanning(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e) => {
    if (!isPanning) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsPanning(false);

  // SWBAT Generator for inspected node
  const inspectedSWBAT = useMemo(() => {
    if (!inspectedStandard) return [];
    return generateSWBAT(inspectedStandard);
  }, [inspectedStandard]);

  const subjectColor = getSubjectColor(targetStandard?.subject);

  return (
    <div className="coherence-map-view animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      
      {/* Top Banner & Control Deck */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-subtle)',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {/* Header Title & Concept Intro */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #00234b 0%, #001226 100%)',
              border: '1px solid var(--accent-crimson)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)',
              flexShrink: 0
            }}>
              <Compass size={24} color="var(--accent-gold)" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
                  Visual Coherence Map
                </h1>
                <span className="badge" style={{ background: subjectColor.bg, color: subjectColor.primary, borderColor: subjectColor.border, border: '1px solid' }}>
                  {targetStandard?.subject || 'PA Standards'}
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Trace vertical learning trajectories, identify prerequisite gaps, and explore cross-grade extensions inspired by Achieve the Core.
              </p>
            </div>
          </div>

          {/* Quick Metrics Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span className="badge" style={{ background: 'var(--bg-primary)', color: 'var(--text-silver)', padding: '6px 12px', fontSize: '0.78rem' }}>
              <strong>{prerequisites.length}</strong> Prior Foundations
            </span>
            <span className="badge" style={{ background: 'var(--bg-primary)', color: 'var(--text-silver)', padding: '6px 12px', fontSize: '0.78rem' }}>
              <strong>{nextSteps.length}</strong> Future Extensions
            </span>
            <span className="badge" style={{ background: 'var(--bg-primary)', color: 'var(--text-silver)', padding: '6px 12px', fontSize: '0.78rem' }}>
              <strong>{horizontal.length}</strong> Same-Grade Links
            </span>
          </div>
        </div>

        {/* Search & Cascading Selector Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr 1fr 1.2fr',
          gap: '12px',
          alignItems: 'center'
        }} className="coherence-controls-grid">
          
          {/* Instant Search Bar */}
          <div style={{ position: 'relative' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '8px 12px'
            }}>
              <Search size={15} color="var(--text-dim)" />
              <input
                type="text"
                placeholder="Search standard (e.g. CC.2.1.4, M08, fractions)..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => searchQuery.trim() && setIsSearchDropdownOpen(true)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-main)',
                  fontSize: '0.84rem',
                  width: '100%'
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); setIsSearchDropdownOpen(false); }}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--text-dim)' }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Instant Search Suggestions Dropdown */}
            {isSearchDropdownOpen && searchResults.length > 0 && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                right: 0,
                background: 'var(--bg-card)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 100,
                maxHeight: '280px',
                overflowY: 'auto',
                padding: '6px'
              }}>
                {searchResults.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectStandard(item.code)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                      borderBottom: '1px solid var(--border-subtle)'
                    }}
                    className="dropdown-item-hover"
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="badge badge-code" style={{ fontSize: '0.75rem' }}>{item.code}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-silver)' }}>Grade {item.grade} · {item.subject}</span>
                      </div>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '3px 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>
                        {item.description}
                      </p>
                    </div>
                    <ArrowRight size={14} color="var(--accent-blue)" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Subject Dropdown */}
          <div>
            <select
              value={selectedSubject}
              onChange={(e) => {
                const newSubj = e.target.value;
                setSelectedSubject(newSubj);
                const firstGrade = filterOptions.bySubject[newSubj]?.grades[0] || 'K';
                setSelectedGrade(firstGrade);
                setSelectedDomain('');
              }}
              style={{
                width: '100%',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-main)',
                borderRadius: 'var(--radius-md)',
                padding: '8px 12px',
                fontSize: '0.84rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {filterOptions.subjects.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Grade Dropdown */}
          <div>
            <select
              value={selectedGrade}
              onChange={(e) => {
                setSelectedGrade(e.target.value);
                setSelectedDomain('');
              }}
              style={{
                width: '100%',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-main)',
                borderRadius: 'var(--radius-md)',
                padding: '8px 12px',
                fontSize: '0.84rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {availableGrades.map(g => (
                <option key={g} value={g}>Grade {g}</option>
              ))}
            </select>
          </div>

          {/* Domain / Standard Selector */}
          <div>
            <select
              value={activeCode}
              onChange={(e) => handleSelectStandard(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-main)',
                borderRadius: 'var(--radius-md)',
                padding: '8px 12px',
                fontSize: '0.84rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <optgroup label={`Standards in ${selectedSubject} (Gr ${selectedGrade})`}>
                {availableStandardsInDomain.map(std => (
                  <option key={std.code} value={std.code}>
                    {std.code} - {std.clean_intro?.slice(0, 32)}...
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

        </div>

        {/* Breadcrumb Navigation Trail */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap',
          paddingTop: '8px',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Exploration Path:
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            {breadcrumbTrail.map((code, index) => {
              const isCurrent = code === activeCode;
              return (
                <React.Fragment key={`${code}-${index}`}>
                  {index > 0 && <ChevronRight size={12} color="var(--text-dim)" />}
                  <button
                    onClick={() => handleSelectStandard(code)}
                    style={{
                      background: isCurrent ? 'var(--accent-crimson)' : 'var(--bg-primary)',
                      color: isCurrent ? '#FFFFFF' : 'var(--text-silver)',
                      border: `1px solid ${isCurrent ? 'var(--accent-crimson)' : 'var(--border-subtle)'}`,
                      borderRadius: 'var(--radius-sm)',
                      padding: '3px 8px',
                      fontSize: '0.75rem',
                      fontWeight: isCurrent ? '700' : '500',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)'
                    }}
                    title={`Jump to ${code}`}
                  >
                    {code}
                  </button>
                </React.Fragment>
              );
            })}
          </div>

          {/* Reset Breadcrumbs */}
          {breadcrumbTrail.length > 1 && (
            <button
              onClick={() => setBreadcrumbTrail([activeCode])}
              style={{
                marginLeft: 'auto',
                background: 'none',
                border: 'none',
                color: 'var(--text-dim)',
                fontSize: '0.72rem',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Clear Trail
            </button>
          )}
        </div>
      </div>

      {/* Main Map Container */}
      <div 
        ref={containerRef}
        style={{
          position: 'relative',
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-subtle)',
          minHeight: '620px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Canvas Toolbar Controls (Top-Right Floating) */}
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          zIndex: 30,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'var(--bg-card)',
          backdropFilter: 'blur(8px)',
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-md)',
          borderRadius: 'var(--radius-lg)',
          padding: '4px'
        }} className="interactive-control">
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-main)',
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer'
            }}
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-main)',
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer'
            }}
          >
            <ZoomOut size={16} />
          </button>
          <button
            onClick={handleResetView}
            title="Re-center View"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-main)',
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer'
            }}
          >
            <RotateCcw size={16} />
          </button>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', padding: '0 6px', fontWeight: '600' }}>
            {Math.round(zoomLevel * 100)}%
          </span>
        </div>

        {/* DESKTOP 2D CANVAS LAYOUT */}
        <div
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="coherence-desktop-canvas"
          style={{
            flex: 1,
            padding: '36px 28px',
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
            transformOrigin: 'center center',
            transition: isPanning ? 'none' : 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            cursor: isPanning ? 'grabbing' : 'grab',
            display: 'flex',
            flexDirection: 'column',
            gap: '32px'
          }}
        >
          {/* 3-Column Directed Flow Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.25fr 1fr',
            gap: '36px',
            alignItems: 'center',
            position: 'relative'
          }}>
            
            {/* COLUMN 1: Upstream Prerequisites (Prior Grades) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ArrowLeft size={16} color="var(--accent-blue)" />
                  <h3 style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                    Prerequisite Foundations
                  </h3>
                </div>
                <span className="badge" style={{ fontSize: '0.72rem', background: 'var(--bg-primary)' }}>
                  Prior Grades
                </span>
              </div>
              {prerequisites.length === 0 ? (
                <div style={{
                  background: 'var(--bg-card)',
                  border: '1px dashed var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '24px 16px',
                  textAlign: 'center',
                  color: 'var(--text-dim)',
                  fontSize: '0.8rem'
                }}>
                  Foundational Entry Point (No prior grade prerequisites required)
                </div>
              ) : (
                prerequisites.map((node) => (
                  <StandardNodeCard
                    key={node.code}
                    standard={node}
                    relationship="prerequisite"
                    isTarget={false}
                    onSelect={() => handleSelectStandard(node.code)}
                    onInspect={(e) => handleOpenInspect(e, node)}
                    onCopy={(e) => handleCopyCode(e, node)}
                    copied={copiedCode === node.code}
                  />
                ))
              )}
            </div>

            {/* COLUMN 2: Focal Active Standard (Center Stage) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: '8px'
              }}>
                <Sparkles size={16} color="var(--accent-gold)" />
                <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--accent-gold)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Active Focus Standard
                </h3>
              </div>

              {targetStandard ? (
                <div 
                  className="interactive-node active-target-card"
                  style={{
                    background: 'linear-gradient(145deg, var(--bg-card) 0%, rgba(0, 35, 75, 0.4) 100%)',
                    border: '2px solid var(--accent-crimson)',
                    borderRadius: 'var(--radius-xl)',
                    padding: '24px',
                    boxShadow: 'var(--shadow-lg)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    position: 'relative'
                  }}
                >
                  {/* Top Badges */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="badge badge-code" style={{ fontSize: '0.95rem', padding: '5px 12px' }}>
                        {targetStandard.code}
                      </span>
                      <span className="badge" style={{ background: 'var(--bg-primary)', color: 'var(--text-silver)', fontWeight: '700' }}>
                        Grade {targetStandard.grade}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="badge" style={{ background: 'rgba(217, 119, 6, 0.15)', color: 'var(--accent-gold)', border: '1px solid rgba(217, 119, 6, 0.3)' }}>
                        {targetStandard.dok || 'DOK 2'}
                      </span>
                      {targetStandard.is_pssa_assessed && (
                        <span className="badge badge-pssa">PSSA</span>
                      )}
                    </div>
                  </div>

                  {/* Domain & Anchor Context */}
                  <div>
                    <div style={{ fontSize: '0.78rem', color: subjectColor.primary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                      {targetStandard.subject} · {targetStandard.domain}
                    </div>
                    {targetStandard.anchor && (
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                        Anchor: {targetStandard.anchor}
                      </div>
                    )}
                  </div>

                  {/* Standard Main Statement */}
                  <div style={{ fontSize: '0.96rem', color: 'var(--text-main)', lineHeight: '1.6', fontWeight: '500' }}>
                    {targetStandard.description}
                  </div>

                  {/* Assessment Limits Alert */}
                  {targetStandard.assessment_limits && (
                    <div style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(245, 158, 11, 0.08)',
                      borderLeft: '4px solid var(--accent-gold)',
                      fontSize: '0.8rem',
                      color: 'var(--accent-gold)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px'
                    }}>
                      <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span><strong>Testing Limits:</strong> {targetStandard.assessment_limits}</span>
                    </div>
                  )}

                  {/* Bottom Actions Row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                      Reporting Category: {targetStandard.reporting_category || 'General Core'}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={(e) => handleCopyCode(e, targetStandard)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-primary)',
                          border: '1px solid var(--border-subtle)',
                          color: copiedCode === targetStandard.code ? 'var(--accent-emerald)' : 'var(--text-silver)',
                          fontSize: '0.78rem',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        {copiedCode === targetStandard.code ? <Check size={14} /> : <Copy size={14} />}
                        <span>{copiedCode === targetStandard.code ? 'Copied' : 'Copy Code'}</span>
                      </button>
                      <button
                        onClick={(e) => handleOpenInspect(e, targetStandard)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--accent-crimson)',
                          border: 'none',
                          color: '#FFFFFF',
                          fontSize: '0.78rem',
                          fontWeight: '700',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        <BookOpen size={14} />
                        <span>Teacher Objectives</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{
                  background: 'var(--bg-card)',
                  border: '1px dashed var(--border-subtle)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '32px 24px',
                  textAlign: 'center',
                  color: 'var(--text-muted)'
                }}>
                  Select a standard above or choose from the dropdown to explore its visual coherence graph.
                </div>
              )}
            </div>

            {/* COLUMN 3: Downstream Next Steps (Future Grades) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                    Future Extensions
                  </h3>
                  <ArrowRight size={16} color="var(--accent-emerald)" />
                </div>
                <span className="badge" style={{ fontSize: '0.72rem', background: 'var(--bg-primary)' }}>
                  Subsequent Grades
                </span>
              </div>

              {nextSteps.length === 0 ? (
                <div style={{
                  background: 'var(--bg-card)',
                  border: '1px dashed var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '24px 16px',
                  textAlign: 'center',
                  color: 'var(--text-dim)',
                  fontSize: '0.8rem'
                }}>
                  Terminal Concept Level (Extends into Keystone / Advanced High School Courses)
                </div>
              ) : (
                nextSteps.map((node) => (
                  <StandardNodeCard
                    key={node.code}
                    standard={node}
                    relationship="extension"
                    isTarget={false}
                    onSelect={() => handleSelectStandard(node.code)}
                    onInspect={(e) => handleOpenInspect(e, node)}
                    onCopy={(e) => handleCopyCode(e, node)}
                    copied={copiedCode === node.code}
                  />
                ))
              )}
            </div>

          </div>

          {/* Bottom Section: Same-Grade Horizontal Coherence */}
          {horizontal.length > 0 && (
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xl)',
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <GitFork size={16} color="var(--accent-gold)" />
                  <h3 style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                    Horizontal Grade {targetStandard?.grade} Connections (Same-Grade Coherence)
                  </h3>
                </div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                  Related domain concepts taught concurrently
                </span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '12px'
              }}>
                {horizontal.map((node) => (
                  <StandardNodeCard
                    key={node.code}
                    standard={node}
                    relationship="horizontal"
                    isTarget={false}
                    onSelect={() => handleSelectStandard(node.code)}
                    onInspect={(e) => handleOpenInspect(e, node)}
                    onCopy={(e) => handleCopyCode(e, node)}
                    copied={copiedCode === node.code}
                  />
                ))}
              </div>
            </div>
          )}

        </div>

        {/* MOBILE RESPONSIVE PROGRESSION STREAM */}
        <div className="coherence-mobile-stream" style={{
          padding: '20px 16px',
          display: 'none',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {/* Section 1: Prerequisites */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              <ArrowLeft size={16} color="var(--accent-blue)" />
              <h3 style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                Prerequisites (Prior Grades)
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {prerequisites.length === 0 ? (
                <div className="empty-box-mobile">No prior prerequisites required.</div>
              ) : (
                prerequisites.map(node => (
                  <StandardNodeCard
                    key={node.code}
                    standard={node}
                    relationship="prerequisite"
                    onSelect={() => handleSelectStandard(node.code)}
                    onInspect={(e) => handleOpenInspect(e, node)}
                    onCopy={(e) => handleCopyCode(e, node)}
                    copied={copiedCode === node.code}
                  />
                ))
              )}
            </div>
          </div>

          {/* Section 2: Active Target Standard */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              <Sparkles size={16} color="var(--accent-gold)" />
              <h3 style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--accent-gold)', margin: 0 }}>
                Active Target Standard
              </h3>
            </div>
            {targetStandard && (
              <div style={{
                background: 'var(--bg-card)',
                border: '2px solid var(--accent-crimson)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="badge badge-code">{targetStandard.code}</span>
                  <span className="badge" style={{ background: 'var(--bg-primary)' }}>Grade {targetStandard.grade}</span>
                </div>
                <div style={{ fontSize: '0.86rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                  {targetStandard.description}
                </div>
                <button
                  onClick={(e) => handleOpenInspect(e, targetStandard)}
                  style={{
                    padding: '8px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--accent-crimson)',
                    color: '#fff',
                    border: 'none',
                    fontWeight: '700',
                    fontSize: '0.8rem'
                  }}
                >
                  View Teacher Objectives & Limits
                </button>
              </div>
            )}
          </div>

          {/* Section 3: Future Extensions */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              <ArrowRight size={16} color="var(--accent-emerald)" />
              <h3 style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                Future Extensions (Next Grades)
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {nextSteps.length === 0 ? (
                <div className="empty-box-mobile">Extends into Keystone & High School courses.</div>
              ) : (
                nextSteps.map(node => (
                  <StandardNodeCard
                    key={node.code}
                    standard={node}
                    relationship="extension"
                    onSelect={() => handleSelectStandard(node.code)}
                    onInspect={(e) => handleOpenInspect(e, node)}
                    onCopy={(e) => handleCopyCode(e, node)}
                    copied={copiedCode === node.code}
                  />
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Standard Detail Inspector Drawer */}
      {inspectedStandard && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 15, 35, 0.82)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 950,
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'stretch'
          }}
          onClick={() => setInspectedStandard(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--bg-secondary)',
              width: '100%',
              maxWidth: '560px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-lg)',
              borderLeft: '1px solid var(--border-medium)',
              animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              overflowY: 'auto'
            }}
          >
            {/* Drawer Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-card)',
              position: 'sticky',
              top: 0,
              zIndex: 10
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="badge badge-code" style={{ fontSize: '0.88rem' }}>
                    {inspectedStandard.code}
                  </span>
                  <span className="badge" style={{ background: 'var(--bg-primary)', color: 'var(--text-silver)' }}>
                    Grade {inspectedStandard.grade}
                  </span>
                  {inspectedStandard.is_pssa_assessed && (
                    <span className="badge badge-pssa">PSSA</span>
                  )}
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-silver)', marginTop: '4px', margin: 0 }}>
                  {inspectedStandard.subject} · {inspectedStandard.domain}
                </p>
              </div>

              <button
                onClick={() => setInspectedStandard(null)}
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '6px',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Body Content */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Full Statement */}
              <div>
                <h4 style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Standard Statement
                </h4>
                <p style={{ fontSize: '0.94rem', color: 'var(--text-main)', lineHeight: '1.6', background: 'var(--bg-card)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', margin: 0 }}>
                  {inspectedStandard.description}
                </p>
              </div>

              {/* Assessment Limits */}
              {inspectedStandard.assessment_limits && (
                <div>
                  <h4 style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--accent-gold)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    PSSA Assessment Boundary / Limit
                  </h4>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', background: 'rgba(217, 119, 6, 0.08)', padding: '12px 16px', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--accent-gold)' }}>
                    {inspectedStandard.assessment_limits}
                  </div>
                </div>
              )}

              {/* SWBAT Objectives Generator */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <Sparkles size={16} color="var(--accent-crimson)" />
                  <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                    Teacher Lesson Objectives (SWBAT Stems)
                  </h4>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {inspectedSWBAT.map((obj, i) => (
                    <div
                      key={i}
                      style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        padding: '12px 14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                    >
                      <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--accent-gold)' }}>
                        {obj.level}
                      </span>
                      <p style={{ fontSize: '0.86rem', color: 'var(--text-main)', margin: 0, lineHeight: '1.45' }}>
                        {obj.stem}
                      </p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(obj.stem);
                          setCopiedCode(obj.stem);
                          setTimeout(() => setCopiedCode(null), 1800);
                        }}
                        style={{
                          alignSelf: 'flex-start',
                          marginTop: '4px',
                          padding: '4px 8px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-primary)',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.72rem',
                          color: copiedCode === obj.stem ? 'var(--accent-emerald)' : 'var(--text-silver)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {copiedCode === obj.stem ? <Check size={12} /> : <Copy size={12} />}
                        <span>{copiedCode === obj.stem ? 'Copied' : 'Copy Stem'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action: Re-center Map on this Standard */}
              <button
                onClick={() => {
                  handleSelectStandard(inspectedStandard.code);
                  setInspectedStandard(null);
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--accent-crimson)',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: '700',
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  marginTop: '10px'
                }}
              >
                <Compass size={16} />
                <span>Center Coherence Map on {inspectedStandard.code}</span>
              </button>

            </div>
          </div>
        </div>
      )}

      {/* Embedded CSS for responsive switching */}
      <style>{`
        .dropdown-item-hover:hover {
          background: var(--bg-primary);
        }
        
        .coherence-node-card {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          cursor: pointer;
          transition: all var(--transition-fast);
          box-shadow: var(--shadow-sm);
        }

        .coherence-node-card:hover {
          transform: translateY(-2px);
          border-color: var(--border-medium);
          background: var(--bg-card-hover);
        }

        @media (max-width: 1023px) {
          .coherence-desktop-canvas {
            display: none !important;
          }
          .coherence-mobile-stream {
            display: flex !important;
          }
          .coherence-controls-grid {
            grid-template-columns: 1fr !important;
          }
        }

        .empty-box-mobile {
          background: var(--bg-card);
          border: 1px dashed var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 16px;
          text-align: center;
          font-size: 0.8rem;
          color: var(--text-dim);
        }
      `}</style>

    </div>
  );
}

// Reusable Standard Node Card Sub-Component
function StandardNodeCard({ 
  standard, 
  relationship, 
  onSelect, 
  onInspect, 
  onCopy, 
  copied 
}) {
  const subjColor = getSubjectColor(standard.subject);

  return (
    <div
      onClick={onSelect}
      className="interactive-node coherence-node-card animate-fade-in"
      title={`Click to re-center map on ${standard.code}`}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="badge badge-code" style={{ fontSize: '0.78rem' }}>
            {standard.code}
          </span>
          <span className="badge" style={{ background: 'var(--bg-primary)', color: 'var(--text-silver)', fontSize: '0.72rem' }}>
            Gr {standard.grade}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            onClick={onCopy}
            title="Copy standard code"
            style={{
              padding: '4px',
              background: 'transparent',
              border: 'none',
              color: copied ? 'var(--accent-emerald)' : 'var(--text-dim)',
              cursor: 'pointer'
            }}
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
          </button>
          <button
            onClick={onInspect}
            title="View standard details"
            style={{
              padding: '4px',
              background: 'transparent',
              border: 'none',
              color: 'var(--accent-blue)',
              cursor: 'pointer'
            }}
          >
            <Info size={14} />
          </button>
        </div>
      </div>

      <div style={{ fontSize: '0.72rem', color: subjColor.primary, fontWeight: '600' }}>
        {standard.domain}
      </div>

      <p style={{
        fontSize: '0.82rem',
        color: 'var(--text-muted)',
        lineHeight: '1.4',
        margin: 0,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
      }}>
        {standard.clean_intro || standard.description}
      </p>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '4px',
        fontSize: '0.72rem',
        color: 'var(--text-dim)'
      }}>
        <span>{standard.dok || 'DOK 1-2'}</span>
        <span style={{ color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: '600' }}>
          Focus <ArrowRight size={11} />
        </span>
      </div>
    </div>
  );
}

export default CoherenceMapView;
