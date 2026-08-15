import { useState, useMemo, useCallback } from 'react';
import rawStandards from '../data/standards.json';
import stats from '../data/stats.json';

const GRADE_ORDER = { 
  'Pre-K': 0, 'PK': 0,
  'K': 1, 'KG': 1,
  '1': 2, '2': 3, '3': 4, '4': 5, 
  '5': 6, '6': 7, '7': 8, '8': 9, 
  '9': 10, '10': 11, '11': 12, '12': 13, 
  'HS': 14 
};

export function useStandardsSearch() {
  const [query, setQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedGrades, setSelectedGrades] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDok, setSelectedDok] = useState('All');
  const [examFilter, setExamFilter] = useState('All'); // 'All', 'PSSA', 'Keystone'

  // Extract unique reporting categories and domains
  const availableCategories = useMemo(() => {
    const cats = new Set();
    rawStandards.forEach(s => {
      if (s.reporting_category) {
        // Extract shortened category name if present
        const match = s.reporting_category.match(/Reporting Category [A-E]|Module [1-2]|Module [A-B]/i);
        if (match) cats.add(match[0]);
      }
    });
    return Array.from(cats).sort();
  }, []);

  // Filtered & Ranked Standards
  const filteredStandards = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    const queryTerms = cleanQuery.split(/\s+/).filter(Boolean);
    const hasGradeFilter = !selectedGrades.includes('All') && selectedGrades.length > 0;

    return rawStandards.filter(item => {
      // Subject filter
      if (selectedSubject !== 'All' && item.subject !== selectedSubject) {
        return false;
      }

      // Grade multi-select filter
      if (hasGradeFilter && !selectedGrades.includes(item.grade)) {
        return false;
      }

      // Reporting category filter
      if (selectedCategory !== 'All') {
        if (!item.reporting_category || !item.reporting_category.includes(selectedCategory)) {
          return false;
        }
      }

      // DOK filter
      if (selectedDok !== 'All') {
        if (!item.dok || !item.dok.includes(selectedDok)) {
          return false;
        }
      }

      // Exam filter
      if (examFilter === 'PSSA' && !item.is_pssa_assessed) return false;
      if (examFilter === 'Keystone' && !item.is_keystone) return false;

      // Omnibar text query match
      if (cleanQuery.length > 0) {
        const fullSearchString = `
          ${item.code} 
          ${item.alt_code || ''} 
          ${item.subject} 
          ${item.domain} 
          ${item.anchor || ''} 
          ${item.descriptor || ''} 
          ${item.description} 
          ${item.assessment_limits || ''} 
          ${(item.crosswalks || []).join(' ')} 
          ${(item.keywords || []).join(' ')}
        `.toLowerCase();

        // Check if all query terms exist in the search string
        const allTermsMatch = queryTerms.every(term => fullSearchString.includes(term));
        if (!allTermsMatch) return false;
      }

      return true;
    }).sort((a, b) => {
      if (cleanQuery.length > 0) {
        // Priority to exact code matches
        const aCodeExact = a.code.toLowerCase() === cleanQuery || (a.alt_code && a.alt_code.toLowerCase() === cleanQuery);
        const bCodeExact = b.code.toLowerCase() === cleanQuery || (b.alt_code && b.alt_code.toLowerCase() === cleanQuery);
        if (aCodeExact && !bCodeExact) return -1;
        if (!aCodeExact && bCodeExact) return 1;

        // Priority to code startsWith
        const aCodeStarts = a.code.toLowerCase().startsWith(cleanQuery);
        const bCodeStarts = b.code.toLowerCase().startsWith(cleanQuery);
        if (aCodeStarts && !bCodeStarts) return -1;
        if (!aCodeStarts && bCodeStarts) return 1;
      }

      // Default sort by subject, grade, then code
      const gradeDiff = (GRADE_ORDER[a.grade] ?? 99) - (GRADE_ORDER[b.grade] ?? 99);
      if (gradeDiff !== 0) return gradeDiff;

      return a.code.localeCompare(b.code);
    });
  }, [query, selectedSubject, selectedGrades, selectedCategory, selectedDok, examFilter]);

  // Toggle individual grade in multi-select mode
  const toggleGrade = useCallback((grade) => {
    if (grade === 'All') {
      setSelectedGrades(['All']);
      return;
    }

    setSelectedGrades(prev => {
      if (prev.includes('All')) {
        return [grade];
      }

      if (prev.includes(grade)) {
        const next = prev.filter(g => g !== grade);
        return next.length === 0 ? ['All'] : next;
      } else {
        return [...prev, grade];
      }
    });
  }, []);

  // Set grade(s) directly - accepts single grade string or array of grades
  const setSelectedGrade = useCallback((gradeOrGrades) => {
    if (Array.isArray(gradeOrGrades)) {
      setSelectedGrades(gradeOrGrades.length === 0 ? ['All'] : gradeOrGrades);
    } else if (!gradeOrGrades || gradeOrGrades === 'All') {
      setSelectedGrades(['All']);
    } else {
      setSelectedGrades([gradeOrGrades]);
    }
  }, []);

  const clearAllFilters = useCallback(() => {
    setQuery('');
    setSelectedSubject('All');
    setSelectedGrades(['All']);
    setSelectedCategory('All');
    setSelectedDok('All');
    setExamFilter('All');
  }, []);

  const isGradeFiltered = !selectedGrades.includes('All') && selectedGrades.length > 0;
  const hasActiveFilters = query.length > 0 || selectedSubject !== 'All' || isGradeFiltered || selectedCategory !== 'All' || selectedDok !== 'All' || examFilter !== 'All';

  return {
    standards: rawStandards,
    stats,
    filteredStandards,
    totalCount: rawStandards.length,
    filteredCount: filteredStandards.length,
    query,
    setQuery,
    selectedSubject,
    setSelectedSubject,
    selectedGrade: selectedGrades.length === 1 ? selectedGrades[0] : (selectedGrades.includes('All') ? 'All' : selectedGrades.join(',')),
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
  };
}
