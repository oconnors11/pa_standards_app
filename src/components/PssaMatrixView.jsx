import React from 'react';
import { Layers, ShieldCheck, AlertCircle, ArrowRight, BarChart3 } from 'lucide-react';

export function PssaMatrixView({ standards, onSelectCategory, onInspect }) {
  const categories = [
    {
      id: 'Reporting Category A',
      title: 'Reporting Category A: Numbers & Operations',
      subject: 'Mathematics',
      grades: 'Grades 3–8',
      emphasis: 'Approx. 20–25% of PSSA Exam',
      description: 'Focuses on place value, fraction models & operations, decimal concepts, division of fractions, rational signed numbers, and distinguishing rational vs. irrational numbers.',
      color: '#38BDF8',
      bg: 'rgba(56, 189, 248, 0.12)'
    },
    {
      id: 'Reporting Category B',
      title: 'Reporting Category B: Algebraic Concepts',
      subject: 'Mathematics',
      grades: 'Grades 3–8 & Keystone Alg 1',
      emphasis: 'Approx. 25–30% of PSSA Exam',
      description: 'Focuses on arithmetic operations, two-step equations, algebraic expressions, linear equations (one/none/infinite solutions), rate of change/slope (y = mx + b), and functions.',
      color: '#818CF8',
      bg: 'rgba(129, 140, 248, 0.12)'
    },
    {
      id: 'Reporting Category C',
      title: 'Reporting Category C: Geometry',
      subject: 'Mathematics',
      grades: 'Grades 3–8',
      emphasis: 'Approx. 15–20% of PSSA Exam',
      description: 'Focuses on polygon classification, line/angle properties, coordinate plane graphing, transformations (rotations/reflections/translations/dilations), and the Pythagorean Theorem.',
      color: '#34D399',
      bg: 'rgba(52, 211, 153, 0.12)'
    },
    {
      id: 'Reporting Category D',
      title: 'Reporting Category D: Measurement, Data & Probability',
      subject: 'Mathematics',
      grades: 'Grades 3–8',
      emphasis: 'Approx. 15–20% of PSSA Exam',
      description: 'Focuses on elapsed time, liquid volume, area & perimeter, box plots, histograms, measures of center/variability (IQR, MAD), and bivariate scatter plots.',
      color: '#F59E0B',
      bg: 'rgba(245, 158, 11, 0.12)'
    },
    {
      id: 'Reporting Category E',
      title: 'Reporting Category E: Text-Dependent Analysis (TDA)',
      subject: 'English Language Arts',
      grades: 'Grades 3–8',
      emphasis: 'High Weight Scoring Rubric (4-Point Holistic)',
      description: 'Requires students to synthesize evidence from literary and informational texts, analyze author craft, character arcs, and thematic development with integrated quotes.',
      color: '#F43F5E',
      bg: 'rgba(244, 63, 94, 0.12)'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Blueprint Intro Banner */}
      <div style={{
        background: 'var(--bg-secondary)',
        padding: '20px 24px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-medium)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Layers size={20} color="var(--accent-gold)" />
          <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)' }}>
            Pennsylvania PSSA & Keystone Assessment Frameworks
          </h2>
          <span className="badge badge-keystone">
            State Exam Blueprint
          </span>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
          Pennsylvania assessment anchors are organized into distinct <strong>Reporting Categories (Categories A through E)</strong>. Eligible content items define the exact boundaries of what can be tested on the annual spring PSSA exams.
        </p>
      </div>

      {/* Categories Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '16px'
      }}>
        {categories.map(cat => {
          // Count matching standards in dataset
          const matchingStandards = standards.filter(s => 
            s.reporting_category && s.reporting_category.toLowerCase().includes(cat.id.toLowerCase())
          );

          return (
            <div
              key={cat.id}
              style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: '10px'
              }}>
                <span className="badge" style={{ background: cat.bg, color: cat.color, fontSize: '0.8rem' }}>
                  {cat.subject}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: '600' }}>
                  {cat.grades}
                </span>
              </div>

              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>
                  {cat.title}
                </h3>
                <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--accent-gold)', marginBottom: '8px' }}>
                  {cat.emphasis}
                </div>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  {cat.description}
                </p>
              </div>

              {/* Sample Standards pill preview */}
              <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '6px' }}>
                  Indexed Standards ({matchingStandards.length})
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {matchingStandards.slice(0, 4).map(s => (
                    <button
                      key={s.id}
                      onClick={() => onInspect(s)}
                      style={{
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--accent-blue)'
                      }}
                    >
                      {s.code}
                    </button>
                  ))}
                  {matchingStandards.length > 4 && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', alignSelf: 'center' }}>
                      +{matchingStandards.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => onSelectCategory(cat.id)}
                style={{
                  marginTop: '8px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--accent-blue)',
                  fontWeight: '700',
                  fontSize: '0.84rem',
                  gap: '6px'
                }}
              >
                <span>Filter Standards for this Category</span>
                <ArrowRight size={14} />
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
}
