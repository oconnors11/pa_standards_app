import React from 'react';
import { Calculator, BookText, Microscope, Globe, Filter, Check, X, Sparkles } from 'lucide-react';

export function FilterBar({
  selectedSubject,
  setSelectedSubject,
  selectedGrades = ['All'],
  selectedGrade = 'All',
  toggleGrade,
  setSelectedGrade,
  selectedDok,
  setSelectedDok,
  clearAllFilters,
  hasActiveFilters,
  isMobileDrawer = false,
  onCloseMobileDrawer
}) {
  const subjects = [
    { id: 'All', label: 'All Subjects', icon: null },
    { id: 'Early Learning', label: 'Early Learning (PreK-2)', icon: <Sparkles size={15} color="var(--color-early)" /> },
    { id: 'Mathematics', label: 'Mathematics', icon: <Calculator size={15} color="var(--color-math)" /> },
    { id: 'English Language Arts', label: 'ELA / Reading', icon: <BookText size={15} color="var(--color-ela)" /> },
    { id: 'STEELS Science', label: 'STEELS Science', icon: <Microscope size={15} color="var(--color-steels)" /> },
    { id: 'Social Studies', label: 'Social Studies', icon: <Globe size={15} color="var(--color-social)" /> }
  ];

  const grades = ['All', 'Pre-K', 'K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'HS'];
  const dokLevels = ['All', 'DOK 1', 'DOK 2', 'DOK 3', 'DOK 4'];

  const handleGradeClick = (g) => {
    if (toggleGrade) {
      toggleGrade(g);
    } else if (setSelectedGrade) {
      setSelectedGrade(g);
    }
  };

  const isGradeActive = (g) => {
    if (g === 'All') {
      return selectedGrades.includes('All') || selectedGrades.length === 0;
    }
    return !selectedGrades.includes('All') && selectedGrades.includes(g);
  };

  return (
    <aside style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      background: 'var(--bg-secondary)',
      padding: isMobileDrawer ? '20px' : '16px',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-subtle)',
      height: 'fit-content'
    }}>
      {/* Sidebar Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '8px',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '0.95rem' }}>
          <Filter size={16} color="var(--text-silver)" />
          <span>Filter Standards</span>
        </div>
        {isMobileDrawer ? (
          <button onClick={onCloseMobileDrawer} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        ) : hasActiveFilters ? (
          <button 
            onClick={clearAllFilters}
            style={{ fontSize: '0.75rem', color: 'var(--accent-crimson)', fontWeight: '600' }}
          >
            Clear All
          </button>
        ) : null}
      </div>

      {/* 1. Subject Selector */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
          Subject Area
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {subjects.map(s => {
            const active = selectedSubject === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedSubject(s.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: active ? 'var(--accent-crimson-bg)' : 'transparent',
                  border: `1px solid ${active ? 'var(--accent-crimson)' : 'transparent'}`,
                  color: active ? 'var(--accent-crimson-text)' : 'var(--text-muted)',
                  fontSize: '0.85rem',
                  fontWeight: active ? '700' : '400',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {s.icon}
                  <span>{s.label}</span>
                </div>
                {active && <Check size={14} color="var(--accent-crimson-text)" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Grade Level Multi-Select Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
            Grade Level
          </label>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Multi-select</span>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '6px'
        }}>
          {grades.map(g => {
            const active = isGradeActive(g);
            return (
              <button
                key={g}
                onClick={() => handleGradeClick(g)}
                title={g === 'All' ? 'Show all grades' : `Toggle Grade ${g}`}
                style={{
                  padding: '7px 4px',
                  borderRadius: 'var(--radius-sm)',
                  background: active ? 'var(--accent-crimson)' : 'var(--bg-primary)',
                  color: active ? '#FFFFFF' : 'var(--text-silver)',
                  border: `1px solid ${active ? 'var(--accent-crimson)' : 'var(--border-subtle)'}`,
                  fontSize: '0.82rem',
                  fontWeight: active ? '700' : '500',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {g}
              </button>
            );
          })}
        </div>
      </div>



      {/* 4. Depth of Knowledge (DOK) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
          Rigor / DOK Level
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {dokLevels.map(d => {
            const active = selectedDok === d;
            return (
              <button
                key={d}
                onClick={() => setSelectedDok(d)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  background: active ? 'var(--accent-crimson)' : 'var(--bg-primary)',
                  color: active ? '#FFFFFF' : 'var(--text-silver)',
                  border: `1px solid ${active ? 'var(--accent-crimson)' : 'var(--border-subtle)'}`,
                  fontSize: '0.75rem',
                  fontWeight: active ? '700' : '400'
                }}
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>



      {isMobileDrawer && (
        <button
          onClick={onCloseMobileDrawer}
          style={{
            marginTop: '10px',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-crimson)',
            color: '#FFFFFF',
            fontWeight: '700',
            fontSize: '0.95rem'
          }}
        >
          Apply Filters
        </button>
      )}
    </aside>
  );
}
