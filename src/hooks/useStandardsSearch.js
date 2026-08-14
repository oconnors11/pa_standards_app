import { useState, useMemo, useCallback } from 'react';
import rawStandards from '../data/standards.json';
import stats from '../data/stats.json';

export function useStandardsSearch() {
  const [query, setQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedGrade, setSelectedGrade] = useState('All');
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

    return rawStandards.filter(item => {
      // Subject filter
      if (selectedSubject !== 'All' && item.subject !== selectedSubject) {
        return false;
      }

      // Grade filter
      if (selectedGrade !== 'All' && item.grade !== selectedGrade) {
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
      const gradeOrder = { 'K': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, 'HS': 9 };
      const gradeDiff = (gradeOrder[a.grade] ?? 99) - (gradeOrder[b.grade] ?? 99);
      if (gradeDiff !== 0) return gradeDiff;

      return a.code.localeCompare(b.code);
    });
  }, [query, selectedSubject, selectedGrade, selectedCategory, selectedDok, examFilter]);

  const clearAllFilters = useCallback(() => {
    setQuery('');
    setSelectedSubject('All');
    setSelectedGrade('All');
    setSelectedCategory('All');
    setSelectedDok('All');
    setExamFilter('All');
  }, []);

  const hasActiveFilters = query.length > 0 || selectedSubject !== 'All' || selectedGrade !== 'All' || selectedCategory !== 'All' || selectedDok !== 'All' || examFilter !== 'All';

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
  };
}
