import React, { useState } from 'react';
import { GitFork, ArrowRight, BookOpen, Layers, Check, Copy } from 'lucide-react';

export function VerticalCrosswalkView({ standards, onInspect, onCopyShort }) {
  const [selectedStrand, setSelectedStrand] = useState('fractions');

  const strands = [
    {
      id: 'fractions',
      title: 'Fractions to Rational Numbers',
      subject: 'Mathematics',
      description: 'Traces how partitioning shapes in K-2 leads to unit fractions in Grade 3, fraction arithmetic in 4-5, and rational/irrational numbers in 6-8 & HS.',
      gradeCodes: [
        { grade: 'Grade 1', code: 'CC.2.3.1.A.2', title: 'Partition into halves & fourths' },
        { grade: 'Grade 2', code: 'CC.2.3.2.A.2', title: 'Halves, thirds, & fourths' },
        { grade: 'Grade 3', code: 'M03.A-N.1.1.1', title: 'Unit fractions on number line' },
        { grade: 'Grade 4', code: 'M04.A-F.1.1.1', title: 'Fraction equivalence & decimals' },
        { grade: 'Grade 5', code: 'M05.A-F.1.1.1', title: 'Unlike denominator operations' },
        { grade: 'Grade 6', code: 'M06.A-N.1.1.1', title: 'Fraction by fraction division' },
        { grade: 'Grade 7', code: 'M07.A-N.1.1.1', title: 'Rational signed operations' },
        { grade: 'Grade 8', code: 'M08.A-N.1.1.1', title: 'Rational vs. Irrational numbers' },
        { grade: 'Keystone HS', code: 'A1.1.1.1.1', title: 'Real numbers & radical expressions' }
      ]
    },
    {
      id: 'algebra',
      title: 'Algebraic Thinking & Linear Equations',
      subject: 'Mathematics',
      description: 'Traces addition word problems in Grade 1 to 2-step equations in Grade 7, slope-intercept in Grade 8, and systems of equations in Keystone Algebra.',
      gradeCodes: [
        { grade: 'Grade 1', code: 'CC.2.2.1.A.1', title: 'Addition & subtraction within 20' },
        { grade: 'Grade 3', code: 'M03.B-O.1.2.1', title: 'Two-step word problems & symbols' },
        { grade: 'Grade 6', code: 'M06.B-E.1.1.1', title: 'Exponents & algebraic expressions' },
        { grade: 'Grade 7', code: 'M07.B-E.2.1.1', title: 'Multi-step equations & inequalities' },
        { grade: 'Grade 8', code: 'M08.B-E.2.1.1', title: 'Unit rate as slope (y = mx + b)' },
        { grade: 'Grade 8', code: 'M08.B-F.1.1.1', title: 'Functions & vertical line test' },
        { grade: 'Keystone HS', code: 'A1.1.2.1.1', title: 'Linear equations with variables both sides' },
        { grade: 'Keystone HS', code: 'A1.1.2.2.1', title: 'Systems of linear equations' }
      ]
    },
    {
      id: 'literature',
      title: 'Reading Literature & Text-Dependent Analysis (TDA)',
      subject: 'English Language Arts',
      description: 'Traces story elements in K-1 to central message in Grade 3, theme and text structures in Grade 5, and synthesis in Grade 8 & Keystone Literature.',
      gradeCodes: [
        { grade: 'Grade K', code: 'CC.1.3.K.A', title: 'Retell familiar stories with key details' },
        { grade: 'Grade 3', code: 'E03.A-K.1.1.1', title: 'Central message & moral in fables' },
        { grade: 'Grade 3', code: 'E03.E.1.1.1', title: 'Text-Dependent Analysis (TDA) prompt' },
        { grade: 'Grade 5', code: 'E05.A-K.1.1.1', title: 'Theme determination & accurate quotes' },
        { grade: 'Grade 8', code: 'E08.A-K.1.1.1', title: 'Cite strongest evidence & objective summary' },
        { grade: 'Grade 8', code: 'E08.E.1.1.1', title: 'TDA evidence synthesis essay' },
        { grade: 'Keystone HS', code: 'L.F.1.1.1', title: 'Literary elements in fiction & poetry' }
      ]
    },
    {
      id: 'steels_science',
      title: 'STEELS 3D Science: Life Sciences & Ecology',
      subject: 'STEELS Science',
      description: 'Traces plant/animal needs in Kindergarten to energy transformation in Grade 4, earth systems in Grade 8, and Keystone Biology genetics/cells.',
      gradeCodes: [
        { grade: 'Grade K', code: '3.1.K.A', title: 'Organism needs for survival' },
        { grade: 'Grade 4', code: '3.2.4.B', title: 'Energy transformation & engineering' },
        { grade: 'Grade 8', code: '3.3.8.A', title: 'Geoscience & plate tectonics' },
        { grade: 'Grade 8', code: '3.4.8.A', title: 'Watershed conservation & human impact' },
        { grade: 'Keystone HS', code: 'BIO.A.1.1.1', title: 'Prokaryotic vs. Eukaryotic organelles' },
        { grade: 'Keystone HS', code: 'BIO.B.2.1.1', title: 'DNA replication & genetic mutations' }
      ]
    }
  ];

  const currentStrand = strands.find(s => s.id === selectedStrand) || strands[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Strand Selector Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '4px',
        scrollbarWidth: 'none'
      }}>
        {strands.map(strand => {
          const active = strand.id === selectedStrand;
          return (
            <button
              key={strand.id}
              onClick={() => setSelectedStrand(strand.id)}
              style={{
                padding: '10px 16px',
                borderRadius: 'var(--radius-lg)',
                background: active ? 'var(--accent-blue)' : 'var(--bg-secondary)',
                color: active ? '#FFFFFF' : 'var(--text-muted)',
                border: `1px solid ${active ? 'var(--accent-blue)' : 'var(--border-subtle)'}`,
                fontSize: '0.85rem',
                fontWeight: active ? '700' : '500',
                whiteSpace: 'nowrap',
                boxShadow: active ? 'var(--shadow-sm)' : 'none'
              }}
            >
              {strand.title}
            </button>
          );
        })}
      </div>

      {/* Strand Summary Banner */}
      <div style={{
        background: 'var(--bg-secondary)',
        padding: '16px 20px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-medium)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GitFork size={18} color="var(--accent-blue)" />
          <h2 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-main)' }}>
            Vertical Progression: {currentStrand.title}
          </h2>
          <span className="badge" style={{ background: 'var(--bg-primary)', color: 'var(--accent-blue)' }}>
            {currentStrand.subject}
          </span>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
          {currentStrand.description}
        </p>
      </div>

      {/* Side-by-Side Progression Matrix */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px'
      }}>
        {currentStrand.gradeCodes.map((item, index) => {
          const matchedStandard = standards.find(s => s.code === item.code || s.alt_code === item.code);

          return (
            <div
              key={index}
              style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                position: 'relative'
              }}
            >
              {/* Step indicator header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: '10px'
              }}>
                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: '800',
                  color: 'var(--accent-gold)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Step {index + 1} · {item.grade}
                </span>

                <button
                  onClick={() => onCopyShort && onCopyShort({ code: item.code })}
                  title="Copy standard code"
                  style={{
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-muted)',
                    fontSize: '0.72rem',
                    gap: '4px'
                  }}
                >
                  <Copy size={12} />
                  <span>{item.code}</span>
                </button>
              </div>

              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '4px' }}>
                  {item.title}
                </h3>
                {matchedStandard && (
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                    {matchedStandard.description}
                  </p>
                )}
              </div>

              {matchedStandard && (
                <button
                  onClick={() => onInspect(matchedStandard)}
                  style={{
                    marginTop: 'auto',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--accent-blue)',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <span>Inspect Full Standard</span>
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
