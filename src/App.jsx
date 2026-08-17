import React, { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { SearchBar } from './components/SearchBar';
import { FilterBar } from './components/FilterBar';
import { StandardCard } from './components/StandardCard';
import { StandardDetailModal } from './components/StandardDetailModal';
import { VerticalCrosswalkView } from './components/VerticalCrosswalkView';
import { HierarchyTreeView } from './components/HierarchyTreeView';
import { CoherenceMapView } from './components/CoherenceMapView';
import { MyNotesView } from './components/MyNotesView';
import { StandardNoteModal } from './components/StandardNoteModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toast } from './components/Toast';

import { useStandardsSearch } from './hooks/useStandardsSearch';
import { useToast } from './hooks/useToast';
import { useTheme } from './hooks/useTheme';
import { useUserNotes } from './hooks/useUserNotes';
import { AlertCircle } from 'lucide-react';

export function App() {
  const { theme, toggleTheme } = useTheme();
  const [currentView, setCurrentView] = useState('home'); // 'home', 'feed', 'map', 'crosswalk', 'tree', 'notes'
  const [inspectedStandard, setInspectedStandard] = useState(null);
  const [noteModalStandard, setNoteModalStandard] = useState(null);
  const [activeMapCode, setActiveMapCode] = useState('CCSS.MATH.CONTENT.4.NBT.B.4');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const {
    standards,
    filteredStandards,
    totalCount,
    filteredCount,
    query,
    setQuery,
    selectedSubject,
    setSelectedSubject,
    selectedGrade,
    selectedGrades,
    setSelectedGrade,
    setSelectedGrades,
    toggleGrade,
    selectedDok,
    setSelectedDok,
    clearAllFilters,
    hasActiveFilters
  } = useStandardsSearch();

  const { toast, showToast, hideToast } = useToast();
  const userNotes = useUserNotes();

  // Copy Short Code
  const handleCopyShort = useCallback((standard) => {
    navigator.clipboard.writeText(standard.code);
    showToast(`Copied standard code: ${standard.code}`);
  }, [showToast]);

  // Copy Full Citation for Lesson Plans
  const handleCopyCitation = useCallback((standard) => {
    const citation = `PA Standard ${standard.code}${standard.alt_code ? ` (${standard.alt_code})` : ''} - Grade ${standard.grade} ${standard.subject} [${standard.domain}]: ${standard.description}`;
    navigator.clipboard.writeText(citation);
    showToast(`Copied citation for ${standard.code}`);
  }, [showToast]);

  // Select trajectory standard (prerequisite or next step) from detail modal
  const handleSelectPrerequisite = useCallback((code) => {
    if (!code) return;
    const cleanCode = code.trim();
    const target = standards.find(s => 
      s.code === cleanCode || 
      s.alt_code === cleanCode || 
      s.id === cleanCode ||
      s.crosswalks?.includes(cleanCode)
    );
    if (target) {
      setInspectedStandard(target);
    } else {
      clearAllFilters();
      setQuery(cleanCode);
      setInspectedStandard(null);
      setCurrentView('feed');
    }
  }, [standards, setQuery, clearAllFilters]);

  // Handle quick topic search from Home page
  const handleSearchTopic = useCallback((topicQuery) => {
    clearAllFilters();
    setQuery(topicQuery);
    setCurrentView('feed');
  }, [clearAllFilters, setQuery]);

  // Handle grade band selection from Home page
  const handleSelectGradeBand = useCallback((bandKey) => {
    clearAllFilters();
    if (bandKey === 'PreK-2' || bandKey === 'K-2') {
      setSelectedGrades(['Pre-K', 'K', '1', '2']);
    } else if (bandKey === '3-5') {
      setSelectedGrades(['3', '4', '5']);
    } else if (bandKey === '6-8') {
      setSelectedGrades(['6', '7', '8']);
    } else if (bandKey === '9-12' || bandKey === 'Keystone') {
      setSelectedGrades(['9', '10', '11', '12', 'HS']);
    }
    setCurrentView('feed');
  }, [clearAllFilters, setSelectedGrades]);

  // Handle open standard directly in Coherence Map
  const handleOpenMap = useCallback((standardOrCode) => {
    const code = typeof standardOrCode === 'string' ? standardOrCode : standardOrCode?.code;
    if (code) {
      setActiveMapCode(code);
    }
    setCurrentView('map');
  }, []);

  // Handle opening standard inspector by code or standard object
  const handleInspectByCodeOrObject = useCallback((standardOrCode) => {
    if (!standardOrCode) return;
    if (typeof standardOrCode === 'object' && standardOrCode.description) {
      setInspectedStandard(standardOrCode);
      return;
    }
    const code = typeof standardOrCode === 'string' ? standardOrCode : standardOrCode.code || standardOrCode.id;
    const cleanCode = String(code).trim();
    const target = standards.find(s => 
      s.code === cleanCode || 
      s.alt_code === cleanCode || 
      s.id === cleanCode
    );
    if (target) {
      setInspectedStandard(target);
    } else {
      clearAllFilters();
      setQuery(cleanCode);
      setCurrentView('feed');
    }
  }, [standards, setQuery, clearAllFilters]);

  return (
    <div className="app-container">
      {/* Global Navigation Header */}
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        totalCount={totalCount}
        totalNotesCount={userNotes.totalNotesCount}
        onToggleMobileFilters={() => setIsMobileFiltersOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content Area */}
      <main className={`main-layout ${currentView === 'feed' ? 'feed-layout' : 'fullwidth-layout'}`}>
        
        {/* Left Sidebar Filters (Only active on feed view) */}
        {currentView === 'feed' && (
          <div className="desktop-sidebar">
            <FilterBar
              selectedSubject={selectedSubject}
              setSelectedSubject={setSelectedSubject}
              selectedGrades={selectedGrades}
              selectedGrade={selectedGrade}
              toggleGrade={toggleGrade}
              setSelectedGrade={setSelectedGrade}
              selectedDok={selectedDok}
              setSelectedDok={setSelectedDok}
              clearAllFilters={clearAllFilters}
              hasActiveFilters={hasActiveFilters}
            />
          </div>
        )}

        {/* Center / Full-Width Feed & Tools */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
          <ErrorBoundary key={currentView} onReset={() => setCurrentView('home')}>
            {/* Landing / Home Page */}
            {currentView === 'home' && (
              <HomePage
                onNavigate={setCurrentView}
                onSearchTopic={handleSearchTopic}
                onSelectGradeBand={handleSelectGradeBand}
                totalCount={totalCount}
              />
            )}

            {/* Main Feed View */}
            {currentView === 'feed' && (
              <>
                {/* Omnibar & Suggestions */}
                <SearchBar
                  query={query}
                  setQuery={setQuery}
                  filteredCount={filteredCount}
                  totalCount={totalCount}
                  onClearFilters={clearAllFilters}
                  hasActiveFilters={hasActiveFilters}
                />

                {/* Standard Cards Feed */}
                {filteredStandards.length === 0 ? (
                  <div style={{
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px dashed var(--border-medium)',
                    padding: '48px 24px',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <AlertCircle size={36} color="var(--accent-gold)" />
                    <h2 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-main)' }}>
                      No standards matched your filters
                    </h2>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: '400px' }}>
                      Try searching for broader keywords (e.g. "fractions", "linear", "main idea"), or reset your filters.
                    </p>
                    <button
                      onClick={clearAllFilters}
                      style={{
                        marginTop: '8px',
                        padding: '8px 18px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--accent-blue)',
                        color: '#FFFFFF',
                        fontSize: '0.85rem',
                        fontWeight: '700'
                      }}
                    >
                      Reset All Filters
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {filteredStandards.map(standard => (
                      <StandardCard
                        key={standard.id}
                        standard={standard}
                        query={query}
                        onInspect={setInspectedStandard}
                        onCopyShort={handleCopyShort}
                        onCopyCitation={handleCopyCitation}
                        onOpenMap={handleOpenMap}
                        notesCount={userNotes.notesCountByStandard[standard.code] || userNotes.notesCountByStandard[standard.id] || 0}
                        onOpenNotes={(std) => setNoteModalStandard(std)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Visual Coherence Map View */}
            {currentView === 'map' && (
              <CoherenceMapView
                initialStandardCode={activeMapCode}
                onInspectStandard={setInspectedStandard}
                onCopyCitation={handleCopyCitation}
                onCopyShort={handleCopyShort}
              />
            )}

            {/* Vertical Progression Matrix View */}
            {currentView === 'crosswalk' && (
              <VerticalCrosswalkView
                standards={standards}
                onInspect={setInspectedStandard}
                onCopyShort={handleCopyShort}
              />
            )}

            {/* Hierarchy Tree View */}
            {currentView === 'tree' && (
              <HierarchyTreeView
                standards={standards}
                onInspect={setInspectedStandard}
                onCopyShort={handleCopyShort}
              />
            )}

            {/* My Notes & Lessons Dashboard View */}
            {currentView === 'notes' && (
              <MyNotesView
                userNotes={userNotes}
                onInspectStandard={handleInspectByCodeOrObject}
                onOpenMap={handleOpenMap}
                onShowToast={showToast}
                onAddNote={userNotes.addNote}
                onUpdateNote={userNotes.updateNote}
                onDeleteNote={userNotes.deleteNote}
              />
            )}
          </ErrorBoundary>
        </section>

      </main>

      {/* Standard Detail Inspector */}
      <StandardDetailModal
        standard={inspectedStandard}
        onClose={() => setInspectedStandard(null)}
        onCopyCitation={handleCopyCitation}
        onSelectPrerequisite={handleSelectPrerequisite}
        onOpenMap={handleOpenMap}
        onOpenNotesModal={(std) => setNoteModalStandard(std)}
        notesCount={inspectedStandard ? (userNotes.notesCountByStandard[inspectedStandard.code] || userNotes.notesCountByStandard[inspectedStandard.id] || 0) : 0}
      />

      {/* Standard Note Editor Modal */}
      {noteModalStandard && (
        <StandardNoteModal
          standard={noteModalStandard}
          isOpen={Boolean(noteModalStandard)}
          onClose={() => setNoteModalStandard(null)}
          onAddNote={(params) => {
            userNotes.addNote(params);
            showToast('Note saved successfully!');
          }}
          onUpdateNote={(id, updates) => {
            userNotes.updateNote(id, updates);
            showToast('Note updated.');
          }}
          onDeleteNote={(id) => {
            userNotes.deleteNote(id);
            showToast('Note deleted.');
          }}
        />
      )}

      {/* Mobile Filters Modal Drawer */}
      {isMobileFiltersOpen && typeof document !== 'undefined' && createPortal(
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100dvh',
            backgroundColor: 'rgba(5, 15, 30, 0.75)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            zIndex: 95000,
            display: 'flex',
            alignItems: 'flex-end',
            pointerEvents: 'auto'
          }}
          onClick={() => setIsMobileFiltersOpen(false)}
        >
          <div 
            style={{ width: '100%', maxHeight: '85vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <FilterBar
              selectedSubject={selectedSubject}
              setSelectedSubject={setSelectedSubject}
              selectedGrades={selectedGrades}
              selectedGrade={selectedGrade}
              toggleGrade={toggleGrade}
              setSelectedGrade={setSelectedGrade}
              selectedDok={selectedDok}
              setSelectedDok={setSelectedDok}
              clearAllFilters={clearAllFilters}
              hasActiveFilters={hasActiveFilters}
              isMobileDrawer={true}
              onCloseMobileDrawer={() => setIsMobileFiltersOpen(false)}
            />
          </div>
        </div>,
        document.body
      )}

      {/* Toast Notification Alert */}
      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
}

export default App;
