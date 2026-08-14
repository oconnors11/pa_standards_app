import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { FilterBar } from './components/FilterBar';
import { StandardCard } from './components/StandardCard';
import { StandardDetailModal } from './components/StandardDetailModal';
import { VerticalCrosswalkView } from './components/VerticalCrosswalkView';
import { HierarchyTreeView } from './components/HierarchyTreeView';
import { PssaMatrixView } from './components/PssaMatrixView';
import { LessonBinderModal } from './components/LessonBinderModal';
import { Toast } from './components/Toast';

import { useStandardsSearch } from './hooks/useStandardsSearch';
import { useLessonBinder } from './hooks/useLessonBinder';
import { useToast } from './hooks/useToast';
import { AlertCircle } from 'lucide-react';

export function App() {
  const [currentView, setCurrentView] = useState('feed'); // 'feed', 'crosswalk', 'tree', 'pssa'
  const [inspectedStandard, setInspectedStandard] = useState(null);
  const [isBinderOpen, setIsBinderOpen] = useState(false);
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
    setSelectedGrade,
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

  const {
    units,
    activeUnit,
    activeUnitId,
    setActiveUnitId,
    isStandardInActiveUnit,
    toggleStandardInActiveUnit,
    createUnit,
    updateActiveUnit,
    deleteUnit,
    totalSavedCount
  } = useLessonBinder();

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
    showToast(`Copied lesson plan citation for ${standard.code}`);
  }, [showToast]);

  // Toggle bookmark in unit
  const handleToggleBookmark = useCallback((standardId) => {
    const added = toggleStandardInActiveUnit(standardId);
    showToast(added ? `Added to "${activeUnit?.title || 'Lesson Unit'}"` : 'Removed from lesson unit');
    return added;
  }, [toggleStandardInActiveUnit, activeUnit, showToast]);

  // Select prerequisite from detail modal
  const handleSelectPrerequisite = useCallback((code) => {
    const target = standards.find(s => s.code === code || s.alt_code === code || s.crosswalks?.includes(code));
    if (target) {
      setInspectedStandard(target);
    } else {
      setQuery(code);
      setInspectedStandard(null);
      setCurrentView('feed');
    }
  }, [standards, setQuery]);

  // Handle category selection from PSSA matrix view
  const handleSelectPssaCategory = useCallback((categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentView('feed');
  }, [setSelectedCategory]);

  return (
    <div className="app-container">
      {/* Global Navigation Header */}
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        totalCount={totalCount}
        savedCount={totalSavedCount}
        onOpenBinder={() => setIsBinderOpen(true)}
        onToggleMobileFilters={() => setIsMobileFiltersOpen(true)}
      />

      {/* Main Content Area */}
      <main className="main-layout">
        
        {/* Left Sidebar Filters (Desktop Only) */}
        {currentView === 'feed' && (
          <div className="desktop-sidebar">
            <FilterBar
              selectedSubject={selectedSubject}
              setSelectedSubject={setSelectedSubject}
              selectedGrade={selectedGrade}
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
                      isBookmarked={isStandardInActiveUnit(standard.id)}
                      onToggleBookmark={handleToggleBookmark}
                      onCopyShort={handleCopyShort}
                      onCopyCitation={handleCopyCitation}
                    />
                  ))}
                </div>
              )}
            </>
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
        isBookmarked={inspectedStandard ? isStandardInActiveUnit(inspectedStandard.id) : false}
        onToggleBookmark={handleToggleBookmark}
        onCopyShort={handleCopyShort}
        onCopyCitation={handleCopyCitation}
        onSelectPrerequisite={handleSelectPrerequisite}
      />

      {/* Lesson Binder & Pacing Planner Modal */}
      <LessonBinderModal
        isOpen={isBinderOpen}
        onClose={() => setIsBinderOpen(false)}
        units={units}
        activeUnit={activeUnit}
        activeUnitId={activeUnitId}
        setActiveUnitId={setActiveUnitId}
        createUnit={createUnit}
        updateActiveUnit={updateActiveUnit}
        deleteUnit={deleteUnit}
        allStandards={standards}
        onInspect={setInspectedStandard}
        showToast={showToast}
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
              selectedGrade={selectedGrade}
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
