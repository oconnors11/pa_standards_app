import React from 'react';
import { 
  BookOpen, GitFork, Network, Layers, Bookmark, Search, 
  ArrowRight, Sparkles, CheckCircle2, Shield, Compass, FileSpreadsheet, Printer 
} from 'lucide-react';

export function HomePage({ 
  onNavigate, 
  onSearchTopic, 
  totalCount, 
  onOpenBinder 
}) {
  const features = [
    {
      id: 'feed',
      title: 'Standards Feed & Search',
      icon: <BookOpen size={24} color="#38BDF8" />,
      badge: 'Instant Search',
      bg: 'rgba(56, 189, 248, 0.1)',
      border: 'rgba(56, 189, 248, 0.3)',
      description: 'Search by exact code (e.g. M08.A-N.1, CC.2.1.8) or topic keywords. Multi-filter by Subject, Grade K–12, DOK level, and PSSA Reporting Category with live term highlighting.',
      actionText: 'Open Search Feed'
    },
    {
      id: 'crosswalk',
      title: 'Vertical Progression Matrix',
      icon: <GitFork size={24} color="#818CF8" />,
      badge: 'Cross-Grade Trajectory',
      bg: 'rgba(129, 140, 248, 0.1)',
      border: 'rgba(129, 140, 248, 0.3)',
      description: 'Trace how core pedagogical concepts evolve vertically across grade bands (e.g. Fractions in Grades 1–5 → Rational Numbers in 6–8 → Real Numbers & Radicals in Keystone Algebra).',
      actionText: 'View Skill Progression'
    },
    {
      id: 'tree',
      title: 'Hierarchy Tree Explorer',
      icon: <Network size={24} color="#34D399" />,
      badge: 'Taxonomy View',
      bg: 'rgba(52, 211, 153, 0.1)',
      border: 'rgba(52, 211, 153, 0.3)',
      description: 'Explore standards organized in an expandable nested tree: Subject Area → Grade Level → Domain & Strand → Assessment Anchor → Eligible Content statements.',
      actionText: 'Explore Hierarchy'
    },
    {
      id: 'pssa',
      title: 'PSSA & Keystone Blueprint',
      icon: <Layers size={24} color="#F59E0B" />,
      badge: 'Assessment Specs',
      bg: 'rgba(245, 158, 11, 0.1)',
      border: 'rgba(245, 158, 11, 0.3)',
      description: 'Inspect state testing frameworks broken down by Reporting Category (Categories A–E), testing blueprint weightings, assessment boundaries, and Webb\'s Depth of Knowledge (DOK).',
      actionText: 'View State Blueprint'
    }
  ];

  const quickTopics = [
    { label: 'Pythagorean Theorem', query: 'Pythagorean' },
    { label: 'Fractions & Rational Numbers', query: 'fractions' },
    { label: 'Linear Equations & Slope', query: 'slope' },
    { label: 'Text-Dependent Analysis (TDA)', query: 'TDA' },
    { label: 'Cellular Organelles', query: 'organelles' },
    { label: 'US Constitution & Civics', query: 'constitution' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1200px', margin: '0 auto', width: '100%' }} className="animate-fade-in">
      
      {/* Hero Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--bg-secondary) 0%, #112845 100%)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-medium)',
        padding: '40px 32px',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative Keystone Glow */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--accent-blue-bg)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          color: 'var(--accent-blue)',
          fontSize: '0.85rem',
          fontWeight: '700',
          marginBottom: '16px'
        }}>
          <Compass size={16} />
          <span>Curriculum & Assessment Alignment Hub</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
          fontWeight: '800',
          color: 'var(--text-main)',
          letterSpacing: '-0.03em',
          lineHeight: '1.2',
          maxWidth: '780px'
        }}>
          Welcome to RBCS Standards Browser
        </h1>

        <p style={{
          fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
          color: 'var(--text-muted)',
          maxWidth: '680px',
          marginTop: '12px',
          lineHeight: '1.6'
        }}>
          A fast, accessible browser for Pennsylvania Core Standards, PSSA Assessment Anchors, and Keystone Frameworks across <strong>Kindergarten through Grade 12</strong>.
        </p>

        {/* Quick Launch Buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          marginTop: '28px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => onNavigate('feed')}
            style={{
              padding: '12px 24px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--accent-blue)',
              color: '#FFFFFF',
              fontWeight: '700',
              fontSize: '0.95rem',
              boxShadow: 'var(--shadow-sm)',
              gap: '8px'
            }}
          >
            <Search size={18} />
            <span>Search All Standards ({totalCount})</span>
          </button>

          <button
            onClick={onOpenBinder}
            style={{
              padding: '12px 20px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-primary)',
              color: 'var(--accent-gold)',
              border: '1px solid var(--accent-gold)',
              fontWeight: '700',
              fontSize: '0.95rem',
              gap: '8px'
            }}
          >
            <Bookmark size={18} />
            <span>Lesson Unit Planner</span>
          </button>
        </div>

        {/* Popular Topic Shortcuts */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginTop: '24px',
          flexWrap: 'wrap'
        }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={14} color="var(--accent-gold)" /> Quick Topics:
          </span>
          {quickTopics.map(t => (
            <button
              key={t.label}
              onClick={() => onSearchTopic(t.query)}
              style={{
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-muted)',
                fontSize: '0.78rem',
                fontWeight: '500',
                transition: 'all var(--transition-fast)'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Guide & Tool Explanations Section */}
      <div>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            How to Use the RBCS Standards Browser
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Choose the view mode that best fits your lesson planning or assessment workflow
          </p>
        </div>

        {/* 4 Feature Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {features.map(f => (
            <div
              key={f.id}
              onClick={() => onNavigate(f.id)}
              style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border-subtle)',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all var(--transition-fast)',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.borderColor = 'var(--border-medium)';
                e.currentTarget.style.background = 'var(--bg-card-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.background = 'var(--bg-card)';
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: 'var(--radius-lg)',
                  background: f.bg,
                  border: `1px solid ${f.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {f.icon}
                </div>

                <span className="badge" style={{ background: f.bg, color: 'var(--text-main)', fontSize: '0.72rem' }}>
                  {f.badge}
                </span>
              </div>

              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  {f.description}
                </p>
              </div>

              <div style={{
                marginTop: 'auto',
                paddingTop: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--accent-blue)',
                fontWeight: '700',
                fontSize: '0.85rem'
              }}>
                <span>{f.actionText}</span>
                <ArrowRight size={15} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Teacher Productivity Callout Banner */}
      <div style={{
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-subtle)',
        padding: '24px 28px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '20px',
        alignItems: 'center'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Bookmark size={18} color="var(--accent-gold)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)' }}>
              Teacher Lesson Planner & 1-Click Exports
            </h3>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            Save standards directly into custom named units. Export alignment matrices formatted for Google Docs, Planbook, or Excel with one click.
          </p>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          fontSize: '0.85rem',
          color: 'var(--text-main)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} color="var(--accent-emerald)" />
            <span>1-Click Copy Code or Full Citation for district planbooks</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} color="var(--accent-emerald)" />
            <span>Dynamic AI-assisted "SWBAT" Lesson Objective stems</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} color="var(--accent-emerald)" />
            <span>Export to Markdown Table, CSV, and Print-ready sheets</span>
          </div>
        </div>
      </div>

    </div>
  );
}
