import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'pa_standards_lesson_binders_v1';

const DEFAULT_UNITS = [
  {
    id: 'unit-default',
    title: 'Current Lesson Unit',
    subject: 'Mathematics',
    grade: '8',
    notes: 'Draft unit for upcoming Pennsylvania curriculum cycle.',
    target_days: 10,
    created_at: new Date().toISOString(),
    standard_ids: ['M08.A-N.1.1.1', 'M08.A-N.1.1.2', 'M08.B-E.2.1.1']
  }
];

export function useLessonBinder() {
  const [units, setUnits] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_UNITS;
    } catch (e) {
      console.error('Failed to load binders from localStorage:', e);
      return DEFAULT_UNITS;
    }
  });

  const [activeUnitId, setActiveUnitId] = useState(() => {
    return units[0]?.id || 'unit-default';
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(units));
    } catch (e) {
      console.error('Failed to save binders to localStorage:', e);
    }
  }, [units]);

  const activeUnit = units.find(u => u.id === activeUnitId) || units[0] || null;

  // Check if a standard is in the active unit
  const isStandardInActiveUnit = useCallback((standardId) => {
    if (!activeUnit) return false;
    return activeUnit.standard_ids.includes(standardId);
  }, [activeUnit]);

  // Toggle standard in active unit
  const toggleStandardInActiveUnit = useCallback((standardId) => {
    if (!activeUnit) return false;
    
    let added = false;
    setUnits(prev => prev.map(unit => {
      if (unit.id !== activeUnitId) return unit;
      const exists = unit.standard_ids.includes(standardId);
      added = !exists;
      const updatedIds = exists 
        ? unit.standard_ids.filter(id => id !== standardId)
        : [...unit.standard_ids, standardId];
      return { ...unit, standard_ids: updatedIds };
    }));

    return added;
  }, [activeUnitId, activeUnit]);

  // Create new unit
  const createUnit = useCallback((title = 'New Curriculum Unit', subject = 'Mathematics', grade = '8') => {
    const newUnit = {
      id: 'unit-' + Date.now(),
      title,
      subject,
      grade,
      notes: '',
      target_days: 5,
      created_at: new Date().toISOString(),
      standard_ids: []
    };
    setUnits(prev => [newUnit, ...prev]);
    setActiveUnitId(newUnit.id);
    return newUnit;
  }, []);

  // Update active unit metadata
  const updateActiveUnit = useCallback((updates) => {
    setUnits(prev => prev.map(unit => {
      if (unit.id === activeUnitId) {
        return { ...unit, ...updates };
      }
      return unit;
    }));
  }, [activeUnitId]);

  // Delete unit
  const deleteUnit = useCallback((unitId) => {
    setUnits(prev => {
      const remaining = prev.filter(u => u.id !== unitId);
      if (remaining.length === 0) {
        return DEFAULT_UNITS;
      }
      return remaining;
    });
    if (activeUnitId === unitId) {
      setActiveUnitId(units[0]?.id || 'unit-default');
    }
  }, [activeUnitId, units]);

  // Total saved standards across all units
  const totalSavedCount = activeUnit ? activeUnit.standard_ids.length : 0;

  return {
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
  };
}
