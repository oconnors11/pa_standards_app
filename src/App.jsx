import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { SearchBar } from './components/SearchBar';
import { FilterBar } from './components/FilterBar';
import { StandardCard } from './components/StandardCard';
import { StandardDetailModal } from './components/StandardDetailModal';
import { VerticalCrosswalkView } from './components/VerticalCrosswalkView';
import { HierarchyTreeView } from './components/HierarchyTreeView';
import { PssaMatrixView } from './components/PssaMatrixView';
import { CoherenceMapView } from './components/CoherenceMapView';
import { Toast } from './components/Toast';

import { useStandardsSearch } from './hooks/useStandardsSearch';
import { useToast } from './hooks/useToast';
import { AlertCircle } from 'lucide-react';

export function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home', 'feed', 'map', 'crosswalk', 'tree', 'pssa'
  const [inspectedStandard, setInspectedStandard] = useState(null);
  const [activeMapCode, setActiveMapCode] = useState('CC.2.1.4.B.2');
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
    selectedCategory,
    setSelectedCategory,
    selectedDok,
    setSelectedDok,
    examFilter,
    setExamFilter,
    availableCategories,
    clearAllFilters,
    hasActiveFilters
  } = useStandardsSearch();

  const { toast, showToast, hideToast } = useToast();

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

  // Handle category selection from PSSA matrix view
  const handleSelectPssaCategory = useCallback((categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentView('feed');
  }, [setSelectedCategory]);

  // Handle open standard directly in Coherence Map
  const handleOpenMap = useCallback((standardOrCode) => {
    const code = typeof standardOrCode === 'string' ? standardOrCode : standardOrCode?.code;
    if (code) {
      setActiveMapCode(code);
    }
    setCurrentView('map');
  }, []);

  return (
    <div className="app-container">
      {/* Global Navigation Header */}
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        totalCount={totalCount}
        onToggleMobileFilters={() => setIsMobileFiltersOpen(true)}
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
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedDok={selectedDok}
              setSelectedDok={setSelectedDok}
              examFilter={examFilter}
              setExamFilter={setExamFilter}
              availableCategories={availableCategories}
              clearAllFilters={clearAllFilters}
              hasActiveFilters={hasActiveFilters}
            />
          </div>
        )}

        {/* Center / Full-Width Feed & Tools */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
          
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

          {/* PSSA & Keystone Blueprint View */}
          {currentView === 'pssa' && (
            <PssaMatrixView
              standards={standards}
              onSelectCategory={handleSelectPssaCategory}
              onInspect={setInspectedStandard}
            />
          )}

        </section>

      </main>

      {/* Standard Detail Inspector (Bottom Sheet on Mobile / Slide-Over on Desktop) */}
      <StandardDetailModal
        standard={inspectedStandard}
        onClose={() => setInspectedStandard(null)}
        onCopyCitation={handleCopyCitation}
        onSelectPrerequisite={handleSelectPrerequisite}
        onOpenMap={handleOpenMap}
      />

      {/* Mobile Filters Modal Drawer */}
      {isMobileFiltersOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(5, 15, 30, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 920,
            display: 'flex',
            alignItems: 'flex-end'
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
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedDok={selectedDok}
              setSelectedDok={setSelectedDok}
              examFilter={examFilter}
              setExamFilter={setExamFilter}
              availableCategories={availableCategories}
              clearAllFilters={clearAllFilters}
              hasActiveFilters={hasActiveFilters}
              isMobileDrawer={true}
              onCloseMobileDrawer={() => setIsMobileFiltersOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Toast Notification Alert */}
      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
}

export default App;
