import React from 'react';
import { Home, BookOpen, GitFork, Network, Layers, SlidersHorizontal } from 'lucide-react';

export function Header({ 
  currentView, 
  setCurrentView, 
  onToggleMobileFilters 
}) {
  const navItems = [
    { id: 'home', label: 'Home', icon: <Home size={15} /> },
    { id: 'feed', label: 'Standards Feed', icon: <BookOpen size={15} /> },
    { id: 'crosswalk', label: 'Vertical Progression', icon: <GitFork size={15} /> },
    { id: 'tree', label: 'Hierarchy Tree', icon: <Network size={15} /> },
    { id: 'pssa', label: 'PSSA Blueprint', icon: <Layers size={15} /> }
  ];

  return (
    <header style={{
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)'
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        
        {/* Clickable Brand Logo & Title (Returns Home) */}
        <button
          onClick={() => setCurrentView('home')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            textAlign: 'left'
          }}
          title="Return to Home Landing Page"
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #00234b 0%, #001226 100%)',
            border: '1px solid var(--accent-crimson)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-sm)',
            flexShrink: 0
          }}>
            <svg width="22" height="22" viewBox="0 0 100 100">
              <polygon points="12,18 88,18 78,86 50,96 22,86" fill="#800022" />
              <path d="M 32 45 Q 50 40 50 62 Q 50 40 68 45 L 68 68 Q 50 63 50 78 Q 50 63 32 68 Z" fill="#FFFFFF" />
            </svg>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.15rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
                RBCS Standards Browser
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-silver)', margin: 0 }}>
              K–12 Assessment Anchors & Curriculum Explorer
            </p>
          </div>
        </button>

        {/* View Mode Switcher (Desktop / Tablet) */}
        <nav style={{
          display: 'flex',
          background: 'var(--bg-primary)',
          padding: '4px',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border-subtle)',
          gap: '4px'
        }} className="desktop-nav">
          {navItems.map(item => {
            const active = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.82rem',
                  fontWeight: active ? '700' : '500',
                  color: active ? '#FFFFFF' : 'var(--text-muted)',
                  background: active ? 'var(--accent-crimson)' : 'transparent',
                  boxShadow: active ? 'var(--shadow-sm)' : 'none',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Action Controls (Mobile Filter Toggle) */}
        {currentView === 'feed' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={onToggleMobileFilters}
              className="mobile-filter-btn"
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-main)',
                fontSize: '0.85rem',
                display: 'none',
                gap: '6px'
              }}
            >
              <SlidersHorizontal size={16} />
              <span>Filters</span>
            </button>
          </div>
        )}

      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div style={{
        display: 'none',
        overflowX: 'auto',
        padding: '6px 16px',
        borderTop: '1px solid var(--border-subtle)',
        gap: '8px',
        scrollbarWidth: 'none'
      }} className="mobile-nav-strip">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            style={{
              whiteSpace: 'nowrap',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              fontWeight: currentView === item.id ? '700' : '500',
              background: currentView === item.id ? 'var(--accent-crimson)' : 'var(--bg-primary)',
              color: currentView === item.id ? '#FFFFFF' : 'var(--text-muted)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .mobile-nav-strip { display: flex !important; }
          .mobile-filter-btn { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
