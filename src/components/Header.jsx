import React, { useState, useEffect } from 'react';
import { 
  Home, BookOpen, GitFork, Network, Layers, 
  SlidersHorizontal, Compass, Sun, Moon, NotebookPen, 
  Menu, X, ChevronRight 
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export function Header({ 
  currentView, 
  setCurrentView, 
  totalNotesCount = 0,
  onToggleMobileFilters,
  theme: controlledTheme,
  onToggleTheme: controlledToggleTheme
}) {
  const themeHook = useTheme();
  const theme = controlledTheme !== undefined ? controlledTheme : themeHook.theme;
  const toggleTheme = controlledToggleTheme || themeHook.toggleTheme;

  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Close drawer on escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsMobileDrawerOpen(false);
    };
    if (isMobileDrawerOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isMobileDrawerOpen]);

  const navItems = [
    { id: 'home', label: 'Home', desc: 'Curriculum landing & grade bands', icon: <Home size={17} /> },
    { id: 'feed', label: 'Standards Feed', desc: 'Search & browse standard statements', icon: <BookOpen size={17} /> },
    { id: 'map', label: 'Coherence Map', desc: 'Vertical learning trajectories', icon: <Compass size={17} /> },
    { id: 'crosswalk', label: 'Vertical Progression', desc: 'Cross-grade learning crosswalks', icon: <GitFork size={17} /> },
    { id: 'tree', label: 'Hierarchy Tree', desc: 'Subject & domain standard tree', icon: <Network size={17} /> },
    { id: 'notes', label: 'My Notes', desc: 'Saved bookmarks & teacher notes', icon: <NotebookPen size={17} />, badge: totalNotesCount }
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
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        
        {/* Clickable Brand Logo & Title (Returns Home) */}
        <button
          onClick={() => {
            setCurrentView('home');
            setIsMobileDrawerOpen(false);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
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
              <span style={{ fontSize: '1.1rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
                RBCS Standards Browser
              </span>
            </div>
          </div>
        </button>

        {/* View Mode Switcher (Desktop / Widescreen Tablet) */}
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
                  transition: 'all var(--transition-fast)',
                  cursor: 'pointer',
                  border: 'none'
                }}
              >
                {item.icon}
                <span>{item.label}</span>
                {Boolean(item.badge) && item.badge > 0 && (
                  <span style={{
                    padding: '1px 6px',
                    borderRadius: '10px',
                    fontSize: '0.7rem',
                    fontWeight: '800',
                    background: active ? '#FFFFFF' : 'var(--accent-crimson)',
                    color: active ? 'var(--accent-crimson)' : '#FFFFFF',
                    marginLeft: '2px'
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Theme Toggle Button (Desktop) */}
          <button
            onClick={toggleTheme}
            className="theme-toggle-btn desktop-only"
            data-testid="theme-toggle"
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            style={{
              padding: '8px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-main)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all var(--transition-fast)'
            }}
          >
            {theme === 'dark' ? (
              <Sun size={17} color="var(--accent-gold)" />
            ) : (
              <Moon size={17} color="var(--accent-crimson)" />
            )}
          </button>

          {/* Filter Toggle Button (When on Feed) */}
          {currentView === 'feed' && (
            <button
              onClick={onToggleMobileFilters}
              className="mobile-filter-btn"
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-main)',
                fontSize: '0.82rem',
                fontWeight: '600',
                display: 'none',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <SlidersHorizontal size={15} color="var(--accent-crimson)" />
              <span>Filters</span>
            </button>
          )}

          {/* Mobile Hamburger Menu Toggle Button */}
          <button
            onClick={() => setIsMobileDrawerOpen(prev => !prev)}
            className="mobile-menu-btn"
            aria-label="Open navigation menu"
            style={{
              padding: '8px',
              borderRadius: 'var(--radius-md)',
              background: isMobileDrawerOpen ? 'var(--accent-crimson)' : 'var(--bg-primary)',
              border: `1px solid ${isMobileDrawerOpen ? 'var(--accent-crimson)' : 'var(--border-subtle)'}`,
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all var(--transition-fast)'
            }}
          >
            {isMobileDrawerOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

      </div>

      {/* Mobile Slide-Out Drawer Navigation */}
      {isMobileDrawerOpen && (
        <div 
          className="mobile-drawer-overlay animate-fade-in"
          onClick={() => setIsMobileDrawerOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 15, 35, 0.78)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            zIndex: 999,
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <div 
            className="mobile-drawer-panel"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(88vw, 360px)',
              height: '100%',
              background: 'var(--bg-secondary)',
              borderLeft: '1px solid var(--border-medium)',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              overflowY: 'auto'
            }}
          >
            {/* Drawer Header */}
            <div>
              <div style={{
                padding: '20px',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--bg-card)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-md)',
                    background: 'linear-gradient(135deg, #00234b 0%, #001226 100%)',
                    border: '1px solid var(--accent-crimson)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg width="18" height="18" viewBox="0 0 100 100">
                      <polygon points="12,18 88,18 78,86 50,96 22,86" fill="#800022" />
                      <path d="M 32 45 Q 50 40 50 62 Q 50 40 68 45 L 68 68 Q 50 63 50 78 Q 50 63 32 68 Z" fill="#FFFFFF" />
                    </svg>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.98rem', fontWeight: '800', color: 'var(--text-main)', display: 'block' }}>
                      RBCS Standards
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                      Curriculum & Tools Navigation
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  aria-label="Close navigation menu"
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '6px',
                    color: 'var(--text-silver)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Links List */}
              <nav style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {navItems.map(item => {
                  const active = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentView(item.id);
                        setIsMobileDrawerOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-lg)',
                        background: active 
                          ? 'linear-gradient(135deg, var(--accent-crimson) 0%, rgba(128, 0, 34, 0.85) 100%)' 
                          : 'var(--bg-card)',
                        border: `1px solid ${active ? 'var(--accent-crimson-border)' : 'var(--border-subtle)'}`,
                        color: active ? '#FFFFFF' : 'var(--text-main)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                        boxShadow: active ? 'var(--shadow-sm)' : 'none'
                      }}
                      className={active ? '' : 'drawer-nav-item'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          color: active ? '#FFFFFF' : 'var(--accent-crimson)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {item.icon}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.9rem', fontWeight: active ? '700' : '600' }}>
                            {item.label}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: active ? 'rgba(255, 255, 255, 0.8)' : 'var(--text-dim)', marginTop: '2px' }}>
                            {item.desc}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {Boolean(item.badge) && item.badge > 0 && (
                          <span style={{
                            padding: '2px 7px',
                            borderRadius: '10px',
                            fontSize: '0.72rem',
                            fontWeight: '800',
                            background: active ? '#FFFFFF' : 'var(--accent-crimson)',
                            color: active ? 'var(--accent-crimson)' : '#FFFFFF'
                          }}>
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight size={16} color={active ? '#FFFFFF' : 'var(--text-dim)'} />
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Drawer Footer with Theme Toggle */}
            <div style={{
              padding: '16px 20px',
              borderTop: '1px solid var(--border-subtle)',
              background: 'var(--bg-card)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-silver)', fontWeight: '600' }}>
                  Theme Mode
                </span>
                <button
                  onClick={toggleTheme}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-main)',
                    fontSize: '0.78rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {theme === 'dark' ? <Sun size={14} color="var(--accent-gold)" /> : <Moon size={14} color="var(--accent-crimson)" />}
                  <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                </button>
              </div>

              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textAlign: 'center' }}>
                PA Standards Explorer · Offline PWA Ready
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .mobile-drawer-panel {
          animation: slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .drawer-nav-item:hover {
          background: var(--bg-card-hover) !important;
          border-color: var(--border-medium) !important;
        }
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .desktop-only { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          .mobile-filter-btn { display: flex !important; }
        }
      `}</style>
    </header>
  );
}

export default Header;
