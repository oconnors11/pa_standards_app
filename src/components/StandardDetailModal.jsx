import React, { useState } from 'react';
import { 
  X, Copy, ArrowRight, ArrowLeft, 
  Sparkles, Check, Compass, NotebookPen 
} from 'lucide-react';

export function StandardDetailModal({
  standard,
  onClose,
  onCopyCitation,
  onSelectPrerequisite,
  onOpenMap,
  onOpenNotesModal,
  notesCount = 0
}) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'ai_objectives', 'user_notes'

  if (!standard) return null;

  const handleCopy = () => {
    onCopyCitation(standard);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate dynamic teacher objective stems (SWBAT)
  const generateObjectives = () => {
    const desc = standard.description;
    return [
      {
        level: "Conceptual Understanding (DOK 2)",
        stem: `Students will be able to explain and model the core principles of ${standard.domain.toLowerCase()} (${standard.code}) using visual representations and mathematical/textual evidence.`
      },
      {
        level: "Procedural & Application (DOK 2-3)",
        stem: `Students will be able to solve multi-step problems and analyze scenarios requiring ${desc.slice(0, 100).toLowerCase()}...`
      },
      {
        level: "Analysis & Strategic Thinking (DOK 3-4)",
        stem: `Students will be able to evaluate claims, justify reasoning, and construct arguments demonstrating mastery of ${standard.code}.`
      }
    ];
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 15, 35, 0.82)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 900,
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'stretch'
      }}
      onClick={onClose}
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
              <span className="badge badge-code" style={{ fontSize: '0.85rem' }}>
                {standard.code}
              </span>
              <span className="badge" style={{ background: 'var(--bg-primary)', color: 'var(--text-silver)' }}>
                Grade {standard.grade}
              </span>
              {standard.authority === 'CCSS' ? (
                <span className="badge badge-ccss">
                  National CCSS
                </span>
              ) : (
                <span className="badge badge-pa">
                  PA State Standard
                </span>
              )}
              {standard.is_keystone && (
                <span className="badge badge-keystone">Keystone</span>
              )}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-silver)', marginTop: '4px' }}>
              {standard.subject} · {standard.grade_band}
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '8px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-silver)'
            }}
            aria-label="Close drawer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '0 24px',
          background: 'var(--bg-card)',
          gap: '16px'
        }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '12px 0',
              borderBottom: `2px solid ${activeTab === 'overview' ? 'var(--accent-crimson)' : 'transparent'}`,
              color: activeTab === 'overview' ? 'var(--accent-crimson-text)' : 'var(--text-silver)',
              fontSize: '0.85rem',
              fontWeight: activeTab === 'overview' ? '700' : '600'
            }}
          >
            Standard Overview
          </button>
          <button
            onClick={() => setActiveTab('ai_objectives')}
            style={{
              padding: '12px 0',
              borderBottom: `2px solid ${activeTab === 'ai_objectives' ? 'var(--accent-crimson)' : 'transparent'}`,
              color: activeTab === 'ai_objectives' ? 'var(--accent-crimson-text)' : 'var(--text-silver)',
              fontSize: '0.85rem',
              fontWeight: activeTab === 'ai_objectives' ? '700' : '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Sparkles size={14} color="var(--accent-crimson-text)" />
            <span>Lesson Objectives</span>
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>

          {activeTab === 'overview' ? (
            <>
              {/* Domain & Anchor Breadcrumbs */}
              <div style={{
                background: 'var(--bg-primary)',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '4px' }}>
                  Domain & Strand
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--accent-blue)', marginBottom: '8px' }}>
                  {standard.domain}
                </div>
                {standard.anchor && (
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '2px' }}>
                      Assessment Anchor
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-silver)', lineHeight: '1.4' }}>
                      {standard.anchor}
                    </div>
                  </div>
                )}
              </div>

              {/* Standard Statement / Eligible Content */}
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-silver)', marginBottom: '6px' }}>
                  Standard Statement / Eligible Content
                </div>
                <div style={{
                  fontSize: '0.96rem',
                  lineHeight: '1.6',
                  color: 'var(--text-main)',
                  background: 'var(--bg-card)',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-medium)'
                }}>
                  {standard.bullets && standard.bullets.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <p style={{ margin: 0, fontWeight: '500' }}>
                        {standard.clean_intro || standard.description}
                      </p>
                      <ul style={{
                        margin: '6px 0 0 0',
                        paddingLeft: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        color: 'var(--text-silver)'
                      }}>
                        {standard.bullets.map((bullet, idx) => (
                          <li key={idx} style={{ lineHeight: '1.5' }}>
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    standard.description
                  )}
                </div>
              </div>

              {/* Assessment Limits */}
              {standard.assessment_limits && (
                <div style={{
                  background: 'rgba(245, 158, 11, 0.08)',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  borderLeft: '4px solid var(--accent-gold)'
                }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--accent-gold)', marginBottom: '4px' }}>
                    Assessment Limits & Boundaries
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.4' }}>
                    {standard.assessment_limits}
                  </p>
                </div>
              )}

              {/* Rigor / DOK & Framework Specs */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px'
              }}>
                <div style={{
                  background: 'var(--bg-card)',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '600' }}>Rigor Level</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--accent-crimson-text)', marginTop: '2px' }}>
                    {standard.dok}
                  </div>
                </div>

                <div style={{
                  background: 'var(--bg-card)',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '600' }}>Reporting Category</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)', marginTop: '2px' }}>
                    {standard.reporting_category || 'General Core'}
                  </div>
                </div>
              </div>

              {/* PA Core Crosswalks */}
              {standard.crosswalks && standard.crosswalks.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-silver)', marginBottom: '6px' }}>
                    PA Core & National Crosswalks
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {standard.crosswalks.map((cw, i) => (
                      <span key={i} className="badge badge-code">
                        {cw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Vertical Prerequisites & Next Steps */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                padding: '14px',
                background: 'var(--bg-primary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)' }}>
                  Vertical Learning Trajectory
                </div>

                {standard.prerequisites && standard.prerequisites.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', flexWrap: 'wrap' }}>
                    <ArrowLeft size={14} color="var(--accent-blue)" />
                    <span style={{ color: 'var(--text-silver)' }}>Prerequisite:</span>
                    {standard.prerequisites.map((p, i) => (
                      <button
                        key={i}
                        onClick={() => onSelectPrerequisite && onSelectPrerequisite(p)}
                        style={{
                          color: 'var(--accent-blue)',
                          fontWeight: '600',
                          textDecoration: 'underline',
                          cursor: 'pointer',
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.8rem'
                        }}
                        title={`Jump to prerequisite ${p}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}

                {standard.next_steps && standard.next_steps.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', flexWrap: 'wrap' }}>
                    <ArrowRight size={14} color="var(--accent-emerald)" />
                    <span style={{ color: 'var(--text-silver)' }}>Next Step:</span>
                    {standard.next_steps.map((n, i) => (
                      <button
                        key={i}
                        onClick={() => onSelectPrerequisite && onSelectPrerequisite(n)}
                        style={{
                          color: 'var(--accent-emerald)',
                          fontWeight: '600',
                          textDecoration: 'underline',
                          cursor: 'pointer',
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.8rem'
                        }}
                        title={`Jump to next standard ${n}`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* AI Lesson Objectives Tab */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                padding: '12px 16px',
                background: 'var(--accent-crimson-bg)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--accent-crimson-border)',
                color: 'var(--accent-crimson-text)',
                fontSize: '0.85rem'
              }}>
                <strong>Curriculum Alignment Assistant:</strong> These customizable "Students Will Be Able To" (SWBAT) objective stems are grounded in the standard's cognitive rigor level.
              </div>

              {generateObjectives().map((obj, i) => (
                <div 
                  key={i}
                  style={{
                    background: 'var(--bg-card)',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent-crimson-text)' }}>
                    {obj.level}
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                    {obj.stem}
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(obj.stem);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    style={{
                      alignSelf: 'flex-start',
                      marginTop: '4px',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.75rem',
                      color: 'var(--text-silver)',
                      fontWeight: '600',
                      gap: '4px'
                    }}
                  >
                    <Copy size={12} />
                    <span>Copy Objective</span>
                  </button>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Drawer Sticky Footer Actions */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-subtle)',
          background: 'var(--bg-card)',
          position: 'sticky',
          bottom: 0,
          zIndex: 10,
          display: 'flex',
          gap: '10px'
        }}>
          {onOpenNotesModal && (
            <button
              onClick={() => {
                onOpenNotesModal(standard);
              }}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                background: notesCount > 0 ? 'rgba(56, 189, 248, 0.18)' : 'var(--bg-primary)',
                color: notesCount > 0 ? 'var(--accent-blue)' : 'var(--text-main)',
                border: notesCount > 0 ? '1px solid var(--accent-blue)' : '1px solid var(--border-medium)',
                fontWeight: '700',
                fontSize: '0.86rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <NotebookPen size={16} />
              <span>Notes {notesCount > 0 ? `(${notesCount})` : ''}</span>
            </button>
          )}

          {onOpenMap && (
            <button
              onClick={() => {
                onOpenMap(standard);
                onClose();
              }}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(245, 158, 11, 0.15)',
                color: 'var(--accent-gold)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                fontWeight: '700',
                fontSize: '0.86rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <Compass size={16} />
              <span>Map</span>
            </button>
          )}

          <button
            onClick={handleCopy}
            style={{
              flex: 1,
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
              gap: '6px',
              transition: 'all var(--transition-fast)',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-crimson-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent-crimson)'; }}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? 'Copied Citation' : 'Copy Citation'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
