import React, { useEffect, useRef } from 'react';
import { Search, X, Sparkles } from 'lucide-react';

export function SearchBar({ 
  query, 
  setQuery, 
  filteredCount, 
  totalCount,
  onClearFilters,
  hasActiveFilters
}) {
  const inputRef = useRef(null);

  // Global hotkeys: '/' or 'Cmd+K' / 'Ctrl+K' focuses search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key === 'k')) && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      } else if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // K-8 oriented search suggestions
  const sampleTags = [
    { label: 'Fractions (3–5)', query: 'fractions' },
    { label: 'Place Value (K–2)', query: 'place value' },
    { label: 'Ratios & Rates (6–7)', query: 'ratios' },
    { label: 'Linear Slope (8)', query: 'slope' },
    { label: 'Main Idea & Details (3–5)', query: 'main idea' },
    { label: 'TDA Evidence (3–8)', query: 'TDA' },
    { label: 'Forces & Motion (3–8)', query: 'motion' },
    { label: 'PA Civics & Govt (3–8)', query: 'constitution' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
      {/* Main Search Input */}
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-medium)',
        boxShadow: 'var(--shadow-sm)',
        transition: 'all var(--transition-fast)'
      }}>
        <div style={{
          padding: '0 16px',
          color: query ? 'var(--accent-blue)' : 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Search size={20} />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by code (e.g. CC.2.1.8, M08.A-N, E03.A-K), K-8 topic (e.g. fractions, slope), or keyword..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-main)',
            fontSize: '1rem',
            padding: '14px 0',
            fontWeight: '500'
          }}
        />

        {query && (
          <button
            onClick={() => setQuery('')}
            style={{
              padding: '8px 12px',
              color: 'var(--text-muted)',
              borderRadius: 'var(--radius-sm)'
            }}
            aria-label="Clear search"
          >
            <X size={18} />
          </button>
        )}

        <div style={{
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }} className="shortcut-badge">
          <span style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-medium)',
            color: 'var(--text-dim)',
            padding: '3px 7px',
            borderRadius: '4px',
            fontSize: '0.72rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: '600'
          }}>
            /
          </span>
        </div>
      </div>

      {/* Suggested Keywords & Status Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        {/* Sample K-8 query chips */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          overflowX: 'auto',
          maxWidth: '100%',
          scrollbarWidth: 'none'
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={12} color="var(--accent-gold)" /> K–8 Topics:
          </span>
          {sampleTags.map(tag => (
            <button
              key={tag.label}
              onClick={() => setQuery(tag.query)}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-muted)',
                borderRadius: 'var(--radius-full)',
                padding: '3px 10px',
                fontSize: '0.75rem',
                whiteSpace: 'nowrap'
              }}
            >
              {tag.label}
            </button>
          ))}
        </div>

        {/* Filter count & Reset */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}>
          <span>Showing <strong>{filteredCount}</strong> of {totalCount} standards</span>
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              style={{
                color: 'var(--accent-blue)',
                fontWeight: '600',
                textDecoration: 'underline',
                fontSize: '0.8rem'
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .shortcut-badge { display: none !important; }
        }
      `}</style>
    </div>
  );
}
