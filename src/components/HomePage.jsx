import React, { useState } from 'react';
import { 
  BookOpen, GitFork, Network, Layers, Search, 
  ArrowRight, Sparkles, Compass, GraduationCap, 
  Calculator, BookText, Microscope, Landmark, ChevronRight
} from 'lucide-react';

export function HomePage({ 
  onNavigate, 
  onSearchTopic, 
  onSelectGradeBand,
  totalCount
}) {
  const [localQuery, setLocalQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (localQuery.trim()) {
      onSearchTopic(localQuery.trim());
    } else {
      onNavigate('feed');
    }
  };

  const navModes = [
    {
      id: 'feed',
      title: 'Standards Feed',
      subtitle: 'Multi-filter & keyword search',
      icon: <BookOpen size={20} color="var(--color-math)" />,
      tag: 'Filter Engine',
      bg: 'var(--bg-card)',
      border: 'var(--border-subtle)'
    },
    {
      id: 'map',
      title: 'Coherence Map',
      subtitle: 'Visual prerequisite network',
      icon: <Compass size={20} color="var(--accent-gold)" />,
      tag: 'Visual Graph',
      bg: 'var(--bg-card)',
      border: 'var(--border-subtle)'
    },
    {
      id: 'crosswalk',
      title: 'Vertical Progression',
      subtitle: 'Cross-grade skill trajectories',
      icon: <GitFork size={20} color="var(--color-steels)" />,
      tag: 'Skill Ladders',
      bg: 'var(--bg-card)',
      border: 'var(--border-subtle)'
    },
    {
      id: 'tree',
      title: 'Hierarchy Tree',
      subtitle: 'Nested PDE SAS taxonomy',
      icon: <Network size={20} color="var(--color-ela)" />,
      tag: 'Domain Tree',
      bg: 'var(--bg-card)',
      border: 'var(--border-subtle)'
    },
    {
      id: 'pssa',
      title: 'PSSA Blueprint',
      subtitle: 'Categories A–E & test limits',
      icon: <Layers size={20} color="var(--accent-gold)" />,
      tag: 'Assessment Specs',
      bg: 'var(--bg-card)',
      border: 'var(--border-subtle)'
    }
  ];

  const gradeBands = [
    {
      label: 'Early Learning & Primary',
      grades: 'Pre-K – Grade 2',
      query: 'PreK-2',
      bandKey: 'PreK-2',
      icon: <Calculator size={18} color="var(--color-early)" />,
      topics: 'Early Literacy, Counting, Place Value, Basic Shapes'
    },
    {
      label: 'Intermediate',
      grades: 'Grades 3–5',
      query: '3-5',
      bandKey: '3-5',
      icon: <BookText size={18} color="var(--color-ela)" />,
      topics: 'Multiplication, Fractions, Main Idea, Earth Systems'
    },
    {
      label: 'Middle School',
      grades: 'Grades 6–8',
      query: '6-8',
      bandKey: '6-8',
      icon: <GraduationCap size={18} color="var(--color-steels)" />,
      topics: 'Ratios, Linear Slope, TDA Evidence, Cells & Genetics'
    },
    {
      label: 'High School',
      grades: 'Grades 9–12 / Keystone',
      query: '9-12',
      bandKey: '9-12',
      icon: <Microscope size={18} color="var(--accent-gold)" />,
      topics: 'Keystone Algebra 1, Literature, Biology'
    }
  ];

  const k8MathTopics = [
    { label: 'Counting & Cardinality (K)', query: 'counting' },
    { label: 'Place Value & Base Ten (1–2)', query: 'place value' },
    { label: 'Multiplication & Division (3)', query: 'multiplication' },
    { label: 'Fractions & Mixed Numbers (3–5)', query: 'fractions' },
    { label: 'Ratios & Proportions (6–7)', query: 'ratios' },
    { label: 'Linear Equations & Slope (8)', query: 'slope' },
    { label: 'Area, Perimeter & Volume (3–6)', query: 'perimeter' },
    { label: 'Probability & Statistics (7–8)', query: 'probability' }
  ];

  const k8ElaTopics = [
    { label: 'Phonics & Word Recognition (K–2)', query: 'phonics' },
    { label: 'Main Idea & Key Details (3–5)', query: 'main idea' },
    { label: 'Text-Dependent Analysis (TDA 3–8)', query: 'TDA' },
    { label: 'Context Clues & Vocabulary (4–6)', query: 'context clues' },
    { label: 'Text Structure & Author Craft (5–8)', query: 'structure' },
    { label: 'Citing Textual Evidence (6–8)', query: 'evidence' }
  ];

  const k8ScienceSocialTopics = [
    { label: 'Weather & Climate Patterns (K–5)', query: 'weather' },
    { label: 'Forces & Motion (3–8)', query: 'motion' },
    { label: 'Ecosystems & Energy Flow (4–7)', query: 'ecosystems' },
    { label: 'PA History & Culture (3–8)', query: 'pennsylvania' },
    { label: 'US Constitution & Civics (5–8)', query: 'constitution' }
  ];

  const featureDeepDives = [
    {
      id: 'feed',
      title: 'Standards Feed & Multi-Filter Search',
      icon: <BookOpen size={22} color="var(--color-math)" />,
      description: 'Search instantly by exact short codes (e.g. M08.A-N.1, CC.2.1.8) or topic keywords. Narrow down by Grade K–8, Subject Area, Webb\'s DOK level (1–4), and PSSA Category with real-time term highlighting.'
    },
    {
      id: 'map',
      title: 'Visual Coherence Map (Achieve the Core Style)',
      icon: <Compass size={22} color="var(--accent-gold)" />,
      description: 'Explore how standards connect across grade levels in an interactive node-and-link network. Trace prerequisite learning gaps backward, plan scaffolded instruction forward, and generate DOK-aligned SWBAT lesson objectives.'
    },
    {
      id: 'crosswalk',
      title: 'Vertical Progression Crosswalks',
      icon: <GitFork size={22} color="var(--color-steels)" />,
      description: 'Trace how foundational skills build vertically across elementary and middle school. Compare how concepts progress (e.g., Partitioning Shapes in Grade 1 → Unit Fractions in 3 → Rational Numbers in 7 → Real Numbers in 8).'
    },
    {
      id: 'tree',
      title: 'Interactive Hierarchy Tree',
      icon: <Network size={22} color="var(--color-ela)" />,
      description: 'Navigate the complete state curriculum taxonomy from high-level Subject Areas down to Grade Levels, Content Domains, Assessment Anchors, and Eligible Content statements with clean full-width descriptions.'
    },
    {
      id: 'pssa',
      title: 'PSSA & State Testing Blueprints',
      icon: <Layers size={22} color="var(--accent-gold)" />,
      description: 'Analyze official Pennsylvania state assessment frameworks broken down by Reporting Category (Categories A–E), testing weights, eligible content boundaries, and assessment limits.'
    }
  ];

  return (
    <div className="home-dashboard-container animate-fade-in">
      
      {/* SECTION 1: Top Hero & Mode Launchpad (2-Column Tiled Grid on Desktop) */}
      <div className="hero-grid-row">
        
        {/* Left Hero Card */}
        <div className="tile-card hero-tile">
          <div className="hero-badge">
            <Compass size={15} />
            <span>K–8 & Secondary Curriculum Hub</span>
          </div>

          <h1 className="hero-heading">
            RBCS Standards Browser
          </h1>

          <p className="hero-subtext">
            A fast, accessible browser for <strong>National Common Core State Standards (CCSS)</strong> in Mathematics and ELA, alongside <strong>PA State Standards</strong> for STEELS Science, Early Learning, and Social Studies.
          </p>

          {/* Embedded Quick Search Input */}
          <form onSubmit={handleSearchSubmit} className="hero-search-form">
            <Search size={18} className="hero-search-icon" />
            <input
              type="text"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              placeholder="Search standards by code (e.g. RL.K.1, K.CC.A.1) or topic (e.g. fractions, slope)..."
              className="hero-search-input"
            />
            <button type="submit" className="hero-search-btn">
              Search
            </button>
          </form>

          {/* Quick Action CTAs */}
          <div className="hero-cta-row">
            <button
              onClick={() => onNavigate('feed')}
              className="btn-primary-launch"
            >
              <BookOpen size={16} />
              <span>Browse All Standards ({totalCount})</span>
            </button>
          </div>
        </div>

        {/* Right Mode Launchpad Card */}
        <div className="tile-card launchpad-tile">
          <div className="tile-header-compact">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="var(--accent-gold)" />
              <h2 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-main)' }}>
                Application Modes
              </h2>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Select a view</span>
          </div>

          <div className="launchpad-grid">
            {navModes.map(mode => (
              <div
                key={mode.id}
                onClick={() => onNavigate(mode.id)}
                className="mode-card-compact"
                style={{
                  background: mode.bg,
                  borderColor: mode.border
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <div className="mode-icon-box">
                    {mode.icon}
                  </div>
                  <span className="badge" style={{ fontSize: '0.68rem', background: 'var(--bg-primary)' }}>
                    {mode.tag}
                  </span>
                </div>
                <div>
                  <div className="mode-title">{mode.title}</div>
                  <div className="mode-subtitle">{mode.subtitle}</div>
                </div>
                <div className="mode-arrow">
                  <span>Open</span>
                  <ChevronRight size={13} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* SECTION 2: Grade-Band Quick Access (4 Tiled Columns on Desktop) */}
      <div className="grade-band-section">
        <div className="section-title-row">
          <GraduationCap size={20} color="var(--accent-blue)" />
          <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Browse by Grade Band
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Jump directly to standards filtered for your grade level</span>
        </div>

        <div className="grade-band-grid">
          {gradeBands.map(band => (
            <div
              key={band.label}
              onClick={() => onSelectGradeBand(band.bandKey)}
              className="tile-card grade-band-card"
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="grade-icon-badge">
                  {band.icon}
                </div>
                <span className="badge badge-keystone" style={{ fontSize: '0.72rem' }}>
                  {band.grades}
                </span>
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>
                  {band.label}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4', margin: 0 }}>
                  {band.topics}
                </p>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: 'var(--text-silver)',
                fontSize: '0.8rem',
                fontWeight: '700',
                marginTop: 'auto'
              }}>
                <span>Explore {band.grades}</span>
                <ArrowRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: K–8 Topic Quick-Finder Matrix (Tiled Tabs & Chips) */}
      <div className="tile-card topic-matrix-tile">
        <div className="section-title-row" style={{ marginBottom: '16px' }}>
          <Sparkles size={18} color="var(--accent-gold)" />
          <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            K–8 Core Topic Finder
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>1-click search for high-frequency elementary and middle school concepts</span>
        </div>

        <div className="topic-categories-grid">
          {/* Math K-8 */}
          <div className="topic-group-box">
            <div className="topic-group-header">
              <Calculator size={16} color="var(--color-math)" />
              <span>Mathematics (Grades K–8)</span>
            </div>
            <div className="topic-chip-wrap">
              {k8MathTopics.map(t => (
                <button
                  key={t.label}
                  onClick={() => onSearchTopic(t.query)}
                  className="topic-chip"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* ELA K-8 */}
          <div className="topic-group-box">
            <div className="topic-group-header">
              <BookText size={16} color="var(--color-ela)" />
              <span>English Language Arts (Grades K–8)</span>
            </div>
            <div className="topic-chip-wrap">
              {k8ElaTopics.map(t => (
                <button
                  key={t.label}
                  onClick={() => onSearchTopic(t.query)}
                  className="topic-chip"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Science & Social Studies K-8 */}
          <div className="topic-group-box">
            <div className="topic-group-header">
              <Landmark size={16} color="var(--color-social)" />
              <span>Science & Social Studies (Grades K–8)</span>
            </div>
            <div className="topic-chip-wrap">
              {k8ScienceSocialTopics.map(t => (
                <button
                  key={t.label}
                  onClick={() => onSearchTopic(t.query)}
                  className="topic-chip"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: Application Feature Explanations (2x2 Tiled Grid on Desktop) */}
      <div>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            How to Use the RBCS Standards Browser
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Five purpose-built lenses for classroom instruction, curriculum alignment, and state assessment preparation
          </p>
        </div>

        <div className="feature-deepdive-grid">
          {featureDeepDives.map(f => (
            <div
              key={f.id}
              onClick={() => onNavigate(f.id)}
              className="tile-card deepdive-card"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="deepdive-icon-box">
                  {f.icon}
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                  {f.title}
                </h3>
              </div>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
                {f.description}
              </p>
              <div style={{
                marginTop: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--text-silver)',
                fontWeight: '700',
                fontSize: '0.82rem'
              }}>
                <span>Launch {f.title.split(' ')[0]} View</span>
                <ArrowRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Embedded Responsive Styles for Tiled Dashboard */}
      <style>{`
        .home-dashboard-container {
          display: flex;
          flex-direction: column;
          gap: 28px;
          width: 100%;
          max-width: 1360px;
          margin: 0 auto;
        }

        .tile-card {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-xl);
          padding: 24px;
          box-shadow: var(--shadow-sm);
          transition: all var(--transition-fast);
        }

        .hero-grid-row {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 20px;
        }

        .hero-tile {
          background: linear-gradient(135deg, #00234b 0%, #001226 100%);
          border-color: var(--border-medium);
          display: flex;
          flex-direction: column;
          justifyContent: center;
          padding: 32px;
          position: relative;
          overflow: hidden;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: var(--radius-full);
          background: var(--accent-crimson-bg);
          border: 1px solid var(--accent-crimson-border);
          color: var(--accent-crimson-text);
          font-size: 0.78rem;
          font-weight: 700;
          margin-bottom: 14px;
          width: fit-content;
        }

        .hero-heading {
          font-size: clamp(1.6rem, 2.8vw, 2.2rem);
          font-weight: 800;
          color: var(--text-main);
          letter-spacing: -0.03em;
          line-height: 1.2;
          margin: 0 0 10px 0;
        }

        .hero-subtext {
          font-size: 0.95rem;
          color: var(--text-muted);
          line-height: 1.5;
          margin: 0 0 20px 0;
          max-width: 95%;
        }

        .hero-search-form {
          display: flex;
          align-items: center;
          background: var(--bg-primary);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-lg);
          padding: 4px 6px 4px 14px;
          gap: 10px;
          box-shadow: var(--shadow-sm);
          margin-bottom: 18px;
        }

        .hero-search-icon {
          color: var(--text-muted);
          flex-shrink: 0;
        }

        .hero-search-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-main);
          font-size: 0.92rem;
          font-weight: 500;
          padding: 8px 0;
        }

        .hero-search-btn {
          background: var(--accent-crimson);
          color: #FFFFFF;
          font-weight: 700;
          font-size: 0.85rem;
          padding: 8px 18px;
          border-radius: var(--radius-md);
          border: none;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .hero-search-btn:hover {
          background: var(--accent-crimson-hover);
        }

        .hero-cta-row {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .btn-primary-launch {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: var(--radius-md);
          background: var(--accent-crimson);
          color: #FFFFFF;
          font-weight: 700;
          font-size: 0.88rem;
          box-shadow: var(--shadow-sm);
          transition: all var(--transition-fast);
        }

        .btn-primary-launch:hover {
          background: var(--accent-crimson-hover);
        }

        .launchpad-tile {
          display: flex;
          flex-direction: column;
          justifyContent: space-between;
          padding: 24px;
        }

        .tile-header-compact {
          display: flex;
          align-items: center;
          justifyContent: space-between;
          margin-bottom: 14px;
        }

        .launchpad-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          flex: 1;
        }

        .mode-card-compact {
          border: 1px solid;
          border-radius: var(--radius-lg);
          padding: 14px;
          display: flex;
          flex-direction: column;
          justifyContent: space-between;
          cursor: pointer;
          gap: 8px;
          transition: all var(--transition-fast);
        }

        .mode-card-compact:hover {
          transform: translateY(-2px);
          border-color: var(--border-strong);
          filter: brightness(1.08);
        }

        .mode-icon-box {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-md);
          background: var(--bg-primary);
          display: flex;
          align-items: center;
          justifyContent: center;
        }

        .mode-title {
          font-size: 0.88rem;
          font-weight: 800;
          color: var(--text-main);
          margin-bottom: 2px;
        }

        .mode-subtitle {
          font-size: 0.72rem;
          color: var(--text-muted);
          line-height: 1.3;
        }

        .mode-arrow {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-silver);
          margin-top: 4px;
        }

        .section-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }

        .grade-band-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .grade-band-card {
          display: flex;
          flex-direction: column;
          gap: 12px;
          cursor: pointer;
          padding: 20px;
        }

        .grade-band-card:hover {
          transform: translateY(-3px);
          border-color: var(--border-medium);
          background: var(--bg-card-hover);
        }

        .grade-icon-badge {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-md);
          background: var(--bg-primary);
          display: flex;
          align-items: center;
          justifyContent: center;
        }

        .topic-matrix-tile {
          padding: 24px;
        }

        .topic-categories-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .topic-group-box {
          background: var(--bg-primary);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .topic-group-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.84rem;
          font-weight: 800;
          color: var(--text-main);
        }

        .topic-chip-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .topic-chip {
          padding: 4px 10px;
          border-radius: var(--radius-full);
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          color: var(--text-muted);
          font-size: 0.76rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
          text-align: left;
        }

        .topic-chip:hover {
          color: var(--accent-crimson-text);
          border-color: var(--accent-crimson);
          background: var(--accent-crimson-bg);
        }

        .feature-deepdive-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 18px;
        }

        .deepdive-card {
          display: flex;
          flex-direction: column;
          gap: 12px;
          cursor: pointer;
          padding: 22px;
        }

        .deepdive-card:hover {
          transform: translateY(-2px);
          border-color: var(--border-medium);
          background: var(--bg-card-hover);
        }

        .deepdive-icon-box {
          width: 38px;
          height: 38px;
          border-radius: var(--radius-md);
          background: var(--bg-primary);
          border: 1px solid var(--border-medium);
          display: flex;
          align-items: center;
          justifyContent: center;
          flex-shrink: 0;
        }

        @media (max-width: 1080px) {
          .hero-grid-row {
            grid-template-columns: 1fr;
          }
          .grade-band-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .topic-categories-grid {
            grid-template-columns: 1fr;
          }
          .feature-deepdive-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .grade-band-grid {
            grid-template-columns: 1fr;
          }
          .launchpad-grid {
            grid-template-columns: 1fr;
          }
          .hero-tile {
            padding: 20px;
          }
          .hero-search-form {
            flex-direction: column;
            align-items: stretch;
            padding: 10px;
          }
          .hero-search-btn {
            width: 100%;
          }
        }
      `}</style>

    </div>
  );
}
