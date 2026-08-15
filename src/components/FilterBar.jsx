import React from 'react';
import { Calculator, BookText, Microscope, Globe, Filter, Check, X } from 'lucide-react';

export function FilterBar({
  selectedSubject,
  setSelectedSubject,
  selectedGrade,
  setSelectedGrade,
  selectedCategory,
  setSelectedCategory,
  selectedDok,
  setSelectedDok,
  examFilter,
  setExamFilter,
  availableCategories,
  clearAllFilters,
  hasActiveFilters,
  isMobileDrawer = false,
  onCloseMobileDrawer
}) {
  const subjects = [
    { id: 'All', label: 'All Subjects', icon: null },
    { id: 'Mathematics', label: 'Mathematics', icon: <Calculator size={15} color="#38BDF8" /> },
    { id: 'English Language Arts', label: 'ELA / Reading', icon: <BookText size={15} color="#34D399" /> },
    { id: 'STEELS Science', label: 'STEELS Science', icon: <Microscope size={15} color="#A78BFA" /> },
    { id: 'Social Studies', label: 'Social Studies', icon: <Globe size={15} color="#FB923C" /> }
  ];

  const grades = ['All', 'Pre-K', 'K', '1', '2', '3', '4', '5', '6', '7', '8', 'HS'];
  const dokLevels = ['All', 'DOK 1', 'DOK 2', 'DOK 3', 'DOK 4'];
  const examOptions = [
    { id: 'All', label: 'All Frameworks' },
    { id: 'PSSA', label: 'PSSA Tested (3–8)' },
    { id: 'Keystone', label: 'Keystone Exam (HS)' }
  ];

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
            style={{ fontSize: '0.75rem', color: '#ff5c7a', fontWeight: '600' }}
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
                  color: active ? '#FFFFFF' : 'var(--text-muted)',
                  fontSize: '0.85rem',
                  fontWeight: active ? '700' : '400',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {s.icon}
                  <span>{s.label}</span>
                </div>
                {active && <Check size={14} color="#ff5c7a" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Grade Level Carousel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
          Grade Level
        </label>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '6px'
        }}>
          {grades.map(g => {
            const active = selectedGrade === g;
            return (
              <button
                key={g}
                onClick={() => setSelectedGrade(g)}
                style={{
                  padding: '7px 4px',
                  borderRadius: 'var(--radius-sm)',
                  background: active ? 'var(--accent-crimson)' : 'var(--bg-primary)',
                  color: active ? '#FFFFFF' : 'var(--text-silver)',
                  border: `1px solid ${active ? 'var(--accent-crimson)' : 'var(--border-subtle)'}`,
                  fontSize: '0.82rem',
                  fontWeight: active ? '700' : '500'
                }}
              >
                {g}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Assessment Framework Focus */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
          Assessment Scope
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {examOptions.map(opt => {
            const active = examFilter === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setExamFilter(opt.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: active ? 'var(--accent-crimson-bg)' : 'transparent',
                  border: `1px solid ${active ? 'var(--accent-crimson)' : 'var(--border-subtle)'}`,
                  color: active ? '#FFFFFF' : 'var(--text-muted)',
                  fontSize: '0.8rem',
                  fontWeight: active ? '700' : '400'
                }}
              >
                <span>{opt.label}</span>
                {active && <Check size={14} color="#ff5c7a" />}
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
                  color: active ? '#FFFFFF' : 'var(--text-muted)',
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

      {/* 5. Reporting Category Selector (if Math/ELA chosen) */}
      {availableCategories.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
            PSSA Reporting Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '8px 10px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-primary)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-medium)',
              fontSize: '0.82rem',
              outline: 'none'
            }}
          >
            <option value="All">All Reporting Categories</option>
            {availableCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      )}

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
