import React from 'react';
import { Copy, Bookmark, BookmarkCheck, ArrowUpRight, AlertTriangle, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

// Helper to highlight search matches
function HighlightedText({ text, query }) {
  if (!text) return null;
  if (!query || query.trim().length === 0) return <span>{text}</span>;

  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const regex = new RegExp(`(${terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) => {
        const isMatch = terms.some(t => t.toLowerCase() === part.toLowerCase());
        return isMatch ? (
          <mark key={i} className="highlight">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        );
      })}
    </span>
  );
}

export function StandardCard({
  standard,
  query,
  onInspect,
  isBookmarked,
  onToggleBookmark,
  onCopyShort,
  onCopyCitation
}) {
  const [copiedType, setCopiedType] = React.useState(null);

  const subjectBadgeClass = 
    standard.subject === 'Mathematics' ? 'badge-math' :
    standard.subject === 'English Language Arts' ? 'badge-ela' :
    standard.subject === 'STEELS Science' ? 'badge-steels' : 'badge-social';

  const handleCopyShort = (e) => {
    e.stopPropagation();
    onCopyShort(standard);
    setCopiedType('short');
    setTimeout(() => setCopiedType(null), 1800);
  };

  const handleCopyCitation = (e) => {
    e.stopPropagation();
    onCopyCitation(standard);
    setCopiedType('citation');
    setTimeout(() => setCopiedType(null), 1800);
  };

  const handleBookmark = (e) => {
    e.stopPropagation();
    const added = onToggleBookmark(standard.id);
    if (added) {
      // Trigger tiny celebratory confetti burst near button
      try {
        const rect = e.currentTarget.getBoundingClientRect();
        confetti({
          particleCount: 20,
          spread: 45,
          origin: {
            x: (rect.left + rect.width / 2) / window.innerWidth,
            y: (rect.top + rect.height / 2) / window.innerHeight
          }
        });
      } catch {
        // Confetti optional
      }
    }
  };

  return (
    <article
      onClick={() => onInspect(standard)}
      className="standard-card animate-fade-in"
      style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        cursor: 'pointer',
        boxShadow: 'var(--shadow-sm)',
        transition: 'all var(--transition-fast)',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = 'var(--border-medium)';
        e.currentTarget.style.background = 'var(--bg-card-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--border-subtle)';
        e.currentTarget.style.background = 'var(--bg-card)';
      }}
    >
      {/* Top Meta Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span className={`badge ${subjectBadgeClass}`}>
            {standard.subject}
          </span>
          <span className="badge badge-code">
            <HighlightedText text={standard.code} query={query} />
          </span>
          {standard.alt_code && (
            <span className="badge" style={{ background: 'var(--bg-primary)', color: 'var(--text-muted)' }}>
              Core: {standard.alt_code}
            </span>
          )}
          <span className="badge" style={{ background: 'var(--bg-primary)', color: 'var(--text-muted)' }}>
            Grade {standard.grade}
          </span>
          {standard.is_keystone && (
            <span className="badge badge-keystone">
              Keystone
            </span>
          )}
        </div>

        {/* Depth of Knowledge */}
        <span className="badge badge-dok">
          {standard.dok}
        </span>
      </div>

      {/* Domain / Anchor Header */}
      <div>
        <h2 style={{
          fontSize: '0.85rem',
          fontWeight: '700',
          color: 'var(--accent-blue)',
          marginBottom: '2px'
        }}>
          {standard.domain}
        </h2>
        {standard.anchor && (
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            <HighlightedText text={standard.anchor} query={query} />
          </p>
        )}
      </div>

      {/* Main Standard Statement / Eligible Content */}
      <div style={{
        fontSize: '0.95rem',
        color: 'var(--text-main)',
        lineHeight: '1.6',
        fontWeight: '400'
      }}>
        <HighlightedText text={standard.description} query={query} />
      </div>

      {/* Assessment Limits / Notes Callout */}
      {standard.assessment_limits && (
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
          padding: '8px 12px',
          background: 'rgba(245, 158, 11, 0.08)',
          borderRadius: 'var(--radius-sm)',
          borderLeft: '3px solid var(--accent-gold)',
          fontSize: '0.8rem',
          color: 'var(--accent-gold)'
        }}>
          <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>
            <strong>Assessment Limit:</strong> {standard.assessment_limits}
          </span>
        </div>
      )}

      {/* Bottom Action Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '6px',
        paddingTop: '10px',
        borderTop: '1px solid var(--border-subtle)',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        {/* Reporting category snippet */}
        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          {standard.reporting_category || standard.grade_band}
        </span>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Quick Copy Short Code */}
          <button
            onClick={handleCopyShort}
            title="Copy standard code"
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-primary)',
              color: copiedType === 'short' ? 'var(--accent-emerald)' : 'var(--text-muted)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.75rem',
              fontWeight: '600',
              gap: '4px'
            }}
          >
            {copiedType === 'short' ? <Check size={13} /> : <Copy size={13} />}
            <span>{copiedType === 'short' ? 'Copied' : 'Code'}</span>
          </button>

          {/* Quick Copy Full Citation */}
          <button
            onClick={handleCopyCitation}
            title="Copy citation for lesson plan"
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-primary)',
              color: copiedType === 'citation' ? 'var(--accent-emerald)' : 'var(--text-muted)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.75rem',
              fontWeight: '600',
              gap: '4px'
            }}
          >
            {copiedType === 'citation' ? <Check size={13} /> : <Copy size={13} />}
            <span>{copiedType === 'citation' ? 'Copied' : 'Citation'}</span>
          </button>

          {/* Bookmark Button */}
          <button
            onClick={handleBookmark}
            title={isBookmarked ? 'Remove from Lesson Binder' : 'Add to Lesson Binder'}
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              background: isBookmarked ? 'var(--accent-gold-bg)' : 'var(--bg-primary)',
              color: isBookmarked ? 'var(--accent-gold)' : 'var(--text-muted)',
              border: `1px solid ${isBookmarked ? 'var(--accent-gold)' : 'var(--border-subtle)'}`,
              fontSize: '0.75rem',
              fontWeight: '600',
              gap: '4px'
            }}
          >
            {isBookmarked ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
            <span>{isBookmarked ? 'Saved' : 'Save'}</span>
          </button>

          {/* Inspect Arrow */}
          <button
            onClick={(e) => { e.stopPropagation(); onInspect(standard); }}
            title="Open standard details"
            style={{
              padding: '6px',
              color: 'var(--accent-blue)',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <ArrowUpRight size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}
