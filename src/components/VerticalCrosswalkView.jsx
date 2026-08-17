import React, { useState } from 'react';
import { GitFork, ArrowRight, Copy, BookOpen, Calculator, Sparkles, Filter } from 'lucide-react';

export function VerticalCrosswalkView({ standards, onInspect, onCopyShort }) {
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedStrand, setSelectedStrand] = useState('ela_informational');

  const strands = [
    {
      id: 'ela_informational',
      title: 'Informational Text & Nonfiction Analysis',
      subject: 'English Language Arts',
      description: 'Traces asking key detail questions in Kindergarten to text structures in Grade 5, evaluating central ideas in Grade 8, and analyzing primary/secondary rhetoric in High School.',
      gradeCodes: [
        { grade: 'Kindergarten', code: 'CCSS.ELA-LITERACY.RI.K.1', title: 'Ask & answer key detail questions with prompting' },
        { grade: 'Grade 1', code: 'CCSS.ELA-LITERACY.RI.1.1', title: 'Ask & answer key detail questions' },
        { grade: 'Grade 2', code: 'CCSS.ELA-LITERACY.RI.2.1', title: 'Ask & answer who, what, where, why, how' },
        { grade: 'Grade 3', code: 'CCSS.ELA-LITERACY.RI.3.1', title: 'Refer explicitly to text for details' },
        { grade: 'Grade 4', code: 'CCSS.ELA-LITERACY.RI.4.1', title: 'Refer to details & examples when explaining' },
        { grade: 'Grade 5', code: 'CCSS.ELA-LITERACY.RI.5.1', title: 'Quote accurately from text for explanations' },
        { grade: 'Grade 6', code: 'CCSS.ELA-LITERACY.RI.6.1', title: 'Cite textual evidence to support analysis' },
        { grade: 'Grade 7', code: 'CCSS.ELA-LITERACY.RI.7.1', title: 'Cite several pieces of textual evidence' },
        { grade: 'Grade 8', code: 'CCSS.ELA-LITERACY.RI.8.1', title: 'Cite strongest textual evidence' },
        { grade: 'Grades 9-10', code: 'CCSS.ELA-LITERACY.RI.9-10.1', title: 'Cite strong & thorough textual evidence' },
        { grade: 'Grades 11-12', code: 'CCSS.ELA-LITERACY.RI.11-12.1', title: 'Cite evidence for primary & secondary sources' }
      ]
    },
    {
      id: 'ela_foundational',
      title: 'Foundational Skills: Phonics & Fluency',
      subject: 'English Language Arts',
      description: 'Traces early phonological awareness in Kindergarten to decoding vowel teams in Grade 1, multisyllabic morphology in Grade 3, and fluent reading in Grades 4–5.',
      gradeCodes: [
        { grade: 'Kindergarten', code: 'CCSS.ELA-LITERACY.RF.K.2', title: 'Phonological awareness, syllables & sounds' },
        { grade: 'Kindergarten', code: 'CCSS.ELA-LITERACY.RF.K.3', title: 'Phonics & letter-sound correspondences' },
        { grade: 'Grade 1', code: 'CCSS.ELA-LITERACY.RF.1.3', title: 'Decode vowel teams, digraphs & silent e' },
        { grade: 'Grade 2', code: 'CCSS.ELA-LITERACY.RF.2.3', title: 'Two-syllable words, prefixes & suffixes' },
        { grade: 'Grade 3', code: 'CCSS.ELA-LITERACY.RF.3.3', title: 'Multisyllabic words & Latin suffixes' },
        { grade: 'Grade 4', code: 'CCSS.ELA-LITERACY.RF.4.3', title: 'Roots, affixes & fluent reading' },
        { grade: 'Grade 5', code: 'CCSS.ELA-LITERACY.RF.5.3', title: 'Context-guided accuracy & reading rate' }
      ]
    },
    {
      id: 'ela_writing',
      title: 'Opinion & Argumentative Writing',
      subject: 'English Language Arts',
      description: 'Traces composing opinion pieces in early grades to developing structured reasons in Grade 4, handling counterclaims in Grade 8, and synthesizing complex arguments in High School.',
      gradeCodes: [
        { grade: 'Kindergarten', code: 'CCSS.ELA-LITERACY.W.K.1', title: 'Compose opinion pieces (draw/dictate/write)' },
        { grade: 'Grade 1', code: 'CCSS.ELA-LITERACY.W.1.1', title: 'Write opinion pieces with topic & preference' },
        { grade: 'Grade 2', code: 'CCSS.ELA-LITERACY.W.2.1', title: 'Introduce topic, state opinion & provide reasons' },
        { grade: 'Grade 3', code: 'CCSS.ELA-LITERACY.W.3.1', title: 'State opinion with organizational structure & reasons' },
        { grade: 'Grade 4', code: 'CCSS.ELA-LITERACY.W.4.1', title: 'Supported opinion pieces with facts & details' },
        { grade: 'Grade 5', code: 'CCSS.ELA-LITERACY.W.5.1', title: 'Logically ordered reasons & linking words' },
        { grade: 'Grade 6', code: 'CCSS.ELA-LITERACY.W.6.1', title: 'Write arguments supporting claims with clear reasons' },
        { grade: 'Grade 7', code: 'CCSS.ELA-LITERACY.W.7.1', title: 'Acknowledge alternate/opposing claims' },
        { grade: 'Grade 8', code: 'CCSS.ELA-LITERACY.W.8.1', title: 'Cohesive arguments with formal style' },
        { grade: 'Grades 9-10', code: 'CCSS.ELA-LITERACY.W.9-10.1', title: 'Develop claims & counterclaims fairly' },
        { grade: 'Grades 11-12', code: 'CCSS.ELA-LITERACY.W.11-12.1', title: 'Substantive arguments & in-depth analysis' }
      ]
    },
    {
      id: 'literature',
      title: 'Reading Literature & Text Analysis',
      subject: 'English Language Arts',
      description: 'Traces story elements in K-1 to central message in Grade 3, theme and text structures in Grade 5, and multi-theme synthesis in High School.',
      gradeCodes: [
        { grade: 'Kindergarten', code: 'CCSS.ELA-LITERACY.RL.K.1', title: 'Retell familiar stories with key details' },
        { grade: 'Grade 1', code: 'CCSS.ELA-LITERACY.RL.1.2', title: 'Retell stories & determine central message' },
        { grade: 'Grade 2', code: 'CCSS.ELA-LITERACY.RL.2.2', title: 'Recount fables & folktales from diverse cultures' },
        { grade: 'Grade 3', code: 'CCSS.ELA-LITERACY.RL.3.2', title: 'Recount myths & explain central lesson' },
        { grade: 'Grade 4', code: 'CCSS.ELA-LITERACY.RL.4.2', title: 'Determine story theme & summarize text' },
        { grade: 'Grade 5', code: 'CCSS.ELA-LITERACY.RL.5.2', title: 'Determine theme from character responses' },
        { grade: 'Grade 6', code: 'CCSS.ELA-LITERACY.RL.6.2', title: 'Theme development through details' },
        { grade: 'Grade 7', code: 'CCSS.ELA-LITERACY.RL.7.2', title: 'Analyze theme development & objective summary' },
        { grade: 'Grade 8', code: 'CCSS.ELA-LITERACY.RL.8.2', title: 'Analyze theme relationship to characters & plot' },
        { grade: 'Grades 9-10', code: 'CCSS.ELA-LITERACY.RL.9-10.2', title: 'Analyze theme development over text' },
        { grade: 'Grades 11-12', code: 'CCSS.ELA-LITERACY.RL.11-12.2', title: 'Analyze multiple themes & complex interactions' }
      ]
    },
    {
      id: 'fractions',
      title: 'Fractions to Rational Numbers',
      subject: 'Mathematics',
      description: 'Traces how partitioning shapes in K-2 leads to unit fractions in Grade 3, fraction arithmetic in 4-5, and rational/irrational numbers in 6-8 & High School.',
      gradeCodes: [
        { grade: 'Grade 1', code: 'CCSS.MATH.CONTENT.1.G.A.3', title: 'Partition into halves & fourths' },
        { grade: 'Grade 2', code: 'CCSS.MATH.CONTENT.2.G.A.3', title: 'Partition into halves, thirds, & fourths' },
        { grade: 'Grade 3', code: 'CCSS.MATH.CONTENT.3.NF.A.1', title: 'Unit fractions on number line' },
        { grade: 'Grade 4', code: 'CCSS.MATH.CONTENT.4.NF.A.1', title: 'Fraction equivalence & decimals' },
        { grade: 'Grade 5', code: 'CCSS.MATH.CONTENT.5.NF.A.1', title: 'Unlike denominator fraction arithmetic' },
        { grade: 'Grade 6', code: 'CCSS.MATH.CONTENT.6.NS.A.1', title: 'Fraction division & rational number line' },
        { grade: 'Grade 7', code: 'CCSS.MATH.CONTENT.7.NS.A.1', title: 'Rational signed number operations' },
        { grade: 'Grade 8', code: 'CCSS.MATH.CONTENT.8.NS.A.1', title: 'Rational vs. Irrational numbers' },
        { grade: 'High School (HSN)', code: 'CCSS.MATH.CONTENT.HSN.RN.A.1', title: 'Real numbers & rational exponents' }
      ]
    },
    {
      id: 'algebra',
      title: 'Algebraic Thinking & Linear Equations',
      subject: 'Mathematics',
      description: 'Traces addition word problems in Grade 1 to 2-step equations in Grade 7, slope-intercept in Grade 8, and linear equations in High School.',
      gradeCodes: [
        { grade: 'Kindergarten', code: 'CCSS.MATH.CONTENT.K.OA.A.1', title: 'Addition & subtraction representations' },
        { grade: 'Grade 1', code: 'CCSS.MATH.CONTENT.1.OA.A.1', title: 'Word problems within 20' },
        { grade: 'Grade 2', code: 'CCSS.MATH.CONTENT.2.OA.A.1', title: 'Two-step word problems within 100' },
        { grade: 'Grade 3', code: 'CCSS.MATH.CONTENT.3.OA.A.1', title: 'Multiplication & division concepts' },
        { grade: 'Grade 4', code: 'CCSS.MATH.CONTENT.4.OA.A.1', title: 'Multiplicative comparisons' },
        { grade: 'Grade 5', code: 'CCSS.MATH.CONTENT.5.OA.A.1', title: 'Numerical expressions & grouping' },
        { grade: 'Grade 6', code: 'CCSS.MATH.CONTENT.6.EE.A.1', title: 'Whole-number exponents & expressions' },
        { grade: 'Grade 7', code: 'CCSS.MATH.CONTENT.7.EE.A.1', title: 'Linear expressions with rational coefficients' },
        { grade: 'Grade 8', code: 'CCSS.MATH.CONTENT.8.EE.B.5', title: 'Unit rate as slope (y = mx + b)' },
        { grade: 'High School (HSA)', code: 'CCSS.MATH.CONTENT.HSA.REI.B.3', title: 'Solve linear equations & inequalities' }
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

  const subjects = ['All', 'English Language Arts', 'Mathematics', 'STEELS Science'];
  const filteredStrands = selectedSubject === 'All' 
    ? strands 
    : strands.filter(s => s.subject === selectedSubject);

  const currentStrand = strands.find(s => s.id === selectedStrand) || filteredStrands[0] || strands[0];

  const handleSubjectChange = (subj) => {
    setSelectedSubject(subj);
    const matching = subj === 'All' ? strands : strands.filter(s => s.subject === subj);
    if (matching.length > 0 && !matching.some(s => s.id === selectedStrand)) {
      setSelectedStrand(matching[0].id);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Subject Filter Pills */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap'
      }}>
        <span style={{
          fontSize: '0.8rem',
          fontWeight: '700',
          color: 'var(--text-dim)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginRight: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <Filter size={13} /> Subject:
        </span>
        {subjects.map(subj => {
          const isSelected = selectedSubject === subj;
          return (
            <button
              key={subj}
              onClick={() => handleSubjectChange(subj)}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                background: isSelected ? 'var(--accent-blue)' : 'var(--bg-card)',
                color: isSelected ? '#FFFFFF' : 'var(--text-silver)',
                border: `1px solid ${isSelected ? 'var(--accent-blue)' : 'var(--border-subtle)'}`,
                fontSize: '0.82rem',
                fontWeight: isSelected ? '700' : '500',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {subj}
            </button>
          );
        })}
      </div>

      {/* Strand Selector Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '4px',
        scrollbarWidth: 'none'
      }}>
        {filteredStrands.map(strand => {
          const active = strand.id === currentStrand.id;
          return (
            <button
              key={strand.id}
              onClick={() => setSelectedStrand(strand.id)}
              style={{
                padding: '10px 16px',
                borderRadius: 'var(--radius-lg)',
                background: active ? 'var(--bg-card)' : 'var(--bg-secondary)',
                color: active ? 'var(--accent-blue)' : 'var(--text-muted)',
                border: `1px solid ${active ? 'var(--accent-blue)' : 'var(--border-subtle)'}`,
                fontSize: '0.85rem',
                fontWeight: active ? '700' : '500',
                whiteSpace: 'nowrap',
                boxShadow: active ? 'var(--shadow-sm)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              <span>{strand.title}</span>
              <span style={{
                fontSize: '0.72rem',
                padding: '2px 6px',
                borderRadius: '4px',
                background: active ? 'var(--accent-blue-bg)' : 'var(--bg-primary)',
                color: active ? 'var(--accent-blue)' : 'var(--text-dim)',
                fontWeight: '600'
              }}>
                {strand.gradeCodes.length} Steps
              </span>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <GitFork size={18} color="var(--accent-blue)" />
          <h2 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-main)' }}>
            Vertical Progression: {currentStrand.title}
          </h2>
          <span className="badge" style={{ background: 'var(--bg-primary)', color: 'var(--accent-blue)' }}>
            {currentStrand.subject}
          </span>
          <span className="badge" style={{ background: 'var(--bg-primary)', color: 'var(--accent-gold)' }}>
            {currentStrand.gradeCodes.length} Grade-Level Milestones
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

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {matchedStandard?.authority === 'CCSS' ? (
                    <span className="badge" style={{ background: '#38bdf820', color: '#38bdf8', border: '1px solid #38bdf840', fontWeight: '600', fontSize: '0.7rem' }}>
                      National CCSS
                    </span>
                  ) : (
                    <span className="badge" style={{ background: '#10b98120', color: '#10b981', border: '1px solid #10b98140', fontWeight: '600', fontSize: '0.7rem' }}>
                      PA State Standard
                    </span>
                  )}
                  <button
                    onClick={() => onCopyShort && onCopyShort({ code: item.code })}
                    title="Copy standard code"
                    style={{
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-muted)',
                      fontSize: '0.72rem',
                      gap: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Copy size={12} />
                    <span>{matchedStandard ? matchedStandard.code : item.code}</span>
                  </button>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '4px' }}>
                  {item.title}
                </h3>
                {matchedStandard ? (
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                    {matchedStandard.description}
                  </p>
                ) : (
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                    Standard details available in full catalog.
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
                    gap: '6px',
                    cursor: 'pointer'
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
