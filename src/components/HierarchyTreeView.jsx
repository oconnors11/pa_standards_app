import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, Folder, ArrowUpRight, Copy } from 'lucide-react';

const GRADE_ORDER = [
  'Pre-K',
  'K',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
  'HS'
];

function getGradeSortIndex(grade) {
  const norm = String(grade).trim();
  const idx = GRADE_ORDER.indexOf(norm);
  if (idx !== -1) return idx;
  const num = parseInt(norm.replace(/\D/g, ''), 10);
  if (!isNaN(num)) return 100 + num;
  return 999;
}

const SUBJECT_ORDER = [
  'Early Learning',
  'Mathematics',
  'English Language Arts',
  'STEELS Science',
  'Social Studies'
];

function getSubjectSortIndex(subject) {
  const idx = SUBJECT_ORDER.indexOf(subject);
  return idx !== -1 ? idx : 99;
}

function formatGradeLabel(grade) {
  if (grade === 'Pre-K') return 'Pre-K';
  if (grade === 'K') return 'Kindergarten (Grade K)';
  if (grade === 'HS') return 'High School (Keystone Frameworks)';
  if (String(grade).toLowerCase().startsWith('grade')) return grade;
  return `Grade ${grade}`;
}

export function HierarchyTreeView({ standards, onInspect, onCopyShort }) {
  const [expandedNodes, setExpandedNodes] = useState({
    'Mathematics': true,
    'Mathematics-1': true,
    'Mathematics-8': true
  });

  // Group standards hierarchically: Subject -> Grade -> Domain -> Standards
  const tree = useMemo(() => {
    const root = {};
    standards.forEach(s => {
      if (!root[s.subject]) root[s.subject] = {};
      if (!root[s.subject][s.grade]) root[s.subject][s.grade] = {};
      if (!root[s.subject][s.grade][s.domain]) root[s.subject][s.grade][s.domain] = [];
      root[s.subject][s.grade][s.domain].push(s);
    });
    return root;
  }, [standards]);

  const toggleNode = (nodeId) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  const expandAll = () => {
    const all = {};
    Object.keys(tree).forEach(subj => {
      all[subj] = true;
      Object.keys(tree[subj]).forEach(gr => {
        all[`${subj}-${gr}`] = true;
        Object.keys(tree[subj][gr]).forEach(dom => {
          all[`${subj}-${gr}-${dom}`] = true;
        });
      });
    });
    setExpandedNodes(all);
  };

  const collapseAll = () => {
    setExpandedNodes({});
  };

  const sortedSubjects = useMemo(() => {
    return Object.keys(tree).sort((a, b) => getSubjectSortIndex(a) - getSubjectSortIndex(b));
  }, [tree]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      
      {/* Top Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg-secondary)',
        padding: '12px 20px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-silver)' }}>
          Explore the Pennsylvania Standards Aligned System hierarchy tree
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={expandAll}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--accent-crimson)',
              color: '#FFFFFF',
              fontSize: '0.8rem',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-crimson-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent-crimson)'; }}
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-primary)',
              color: 'var(--text-silver)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.8rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-medium)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Tree Nodes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {sortedSubjects.map(subject => {
          const isSubjectOpen = !!expandedNodes[subject];
          const gradeKeys = Object.keys(tree[subject]).sort((a, b) => getGradeSortIndex(a) - getGradeSortIndex(b));

          return (
            <div 
              key={subject}
              style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
                overflow: 'hidden'
              }}
            >
              {/* Subject Level Header */}
              <button
                onClick={() => toggleNode(subject)}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'var(--bg-secondary)',
                  borderBottom: isSubjectOpen ? '1px solid var(--border-subtle)' : 'none',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  color: 'var(--text-main)',
                  fontWeight: '800',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {isSubjectOpen ? <ChevronDown size={18} color="var(--text-silver)" /> : <ChevronRight size={18} color="var(--text-silver)" />}
                  <Folder size={18} color="var(--text-silver)" />
                  <span>{subject}</span>
                </div>
                <span className="badge" style={{ background: 'var(--bg-primary)', color: 'var(--text-silver)' }}>
                  {gradeKeys.length} Grade Bands
                </span>
              </button>

              {/* Grade Level Children */}
              {isSubjectOpen && (
                <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {gradeKeys.map(grade => {
                    const gradeNodeId = `${subject}-${grade}`;
                    const isGradeOpen = !!expandedNodes[gradeNodeId];
                    const domainKeys = Object.keys(tree[subject][grade]);

                    return (
                      <div key={grade} style={{ borderLeft: '2px solid var(--border-medium)', marginLeft: '8px', paddingLeft: '14px' }}>
                        
                        {/* Grade Header */}
                        <button
                          onClick={() => toggleNode(gradeNodeId)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '6px 0',
                            color: 'var(--text-main)',
                            fontWeight: '700',
                            fontSize: '0.92rem',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          {isGradeOpen ? <ChevronDown size={15} color="var(--text-silver)" /> : <ChevronRight size={15} color="var(--text-silver)" />}
                          <span>{formatGradeLabel(grade)}</span>
                          <span className="badge badge-code" style={{ fontSize: '0.7rem' }}>
                            {domainKeys.length} Domains
                          </span>
                        </button>

                        {/* Domain Level Children */}
                        {isGradeOpen && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px', marginLeft: '6px' }}>
                            {domainKeys.map(domain => {
                              const stds = tree[subject][grade][domain];
                              return (
                                <div 
                                  key={domain}
                                  style={{
                                    background: 'var(--bg-primary)',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border-subtle)',
                                    padding: '14px'
                                  }}
                                >
                                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-silver)', marginBottom: '10px' }}>
                                    {domain}
                                  </div>

                                  {/* Standard Cards in Domain */}
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {stds.map(s => (
                                      <div
                                        key={s.id}
                                        onClick={() => onInspect(s)}
                                        style={{
                                          padding: '12px 14px',
                                          borderRadius: 'var(--radius-md)',
                                          background: 'var(--bg-card)',
                                          border: '1px solid var(--border-subtle)',
                                          display: 'flex',
                                          flexDirection: 'column',
                                          cursor: 'pointer',
                                          gap: '8px',
                                          transition: 'all var(--transition-fast)'
                                        }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.borderColor = 'var(--border-medium)';
                                          e.currentTarget.style.background = 'var(--bg-card-hover)';
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.borderColor = 'var(--border-subtle)';
                                          e.currentTarget.style.background = 'var(--bg-card)';
                                        }}
                                      >
                                        {/* Top Header Row with Standard Code and Action buttons */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '8px', flexWrap: 'wrap' }}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                            <span className="badge badge-code" style={{ fontSize: '0.78rem' }}>
                                              {s.code}
                                            </span>
                                            {s.alt_code && (
                                              <span className="badge" style={{ background: 'var(--bg-primary)', color: 'var(--text-dim)', fontSize: '0.7rem' }}>
                                                Core: {s.alt_code}
                                              </span>
                                            )}
                                            <span className="badge badge-dok" style={{ fontSize: '0.7rem' }}>
                                              {s.dok}
                                            </span>
                                          </div>

                                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                onCopyShort(s);
                                              }}
                                              style={{
                                                padding: '4px 8px',
                                                borderRadius: 'var(--radius-sm)',
                                                background: 'var(--bg-primary)',
                                                color: 'var(--text-silver)',
                                                fontSize: '0.72rem',
                                                fontWeight: '600',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                border: '1px solid var(--border-subtle)',
                                                cursor: 'pointer'
                                              }}
                                              title="Copy standard code"
                                            >
                                              <Copy size={12} />
                                              <span>Copy</span>
                                            </button>
                                            <ArrowUpRight size={16} color="var(--text-silver)" />
                                          </div>
                                        </div>

                                        {/* Description text neatly displayed below the code badge spanning full width */}
                                        <div style={{
                                          fontSize: '0.86rem',
                                          color: 'var(--text-main)',
                                          lineHeight: '1.5',
                                          margin: 0,
                                          width: '100%'
                                        }}>
                                          {s.bullets && s.bullets.length > 0 ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                              <p style={{ margin: 0 }}>{s.clean_intro || s.description}</p>
                                              <ul style={{ margin: '4px 0 0 0', paddingLeft: '18px', color: 'var(--text-silver)', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                                {s.bullets.map((b, bIdx) => (
                                                  <li key={bIdx}>{b}</li>
                                                ))}
                                              </ul>
                                            </div>
                                          ) : (
                                            <p style={{ margin: 0 }}>{s.description}</p>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
}
