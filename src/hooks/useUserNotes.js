import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  getAllNotes, 
  addNote as addNoteUtil, 
  updateNote as updateNoteUtil, 
  deleteNote as deleteNoteUtil,
  getNotesForStandard as getNotesForStandardUtil
} from '../utils/notesStorage';

export function useUserNotes() {
  const [notes, setNotes] = useState(() => getAllNotes());

  const refreshNotes = useCallback(() => {
    setNotes(getAllNotes());
  }, []);

  useEffect(() => {
    window.addEventListener('pa_standards_notes_updated', refreshNotes);
    return () => {
      window.removeEventListener('pa_standards_notes_updated', refreshNotes);
    };
  }, [refreshNotes]);

  const addNote = useCallback((params) => {
    const created = addNoteUtil(params);
    refreshNotes();
    return created;
  }, [refreshNotes]);

  const updateNote = useCallback((noteId, updates) => {
    const updated = updateNoteUtil(noteId, updates);
    refreshNotes();
    return updated;
  }, [refreshNotes]);

  const deleteNote = useCallback((noteId) => {
    const deleted = deleteNoteUtil(noteId);
    refreshNotes();
    return deleted;
  }, [refreshNotes]);

  const getNotesForStandard = useCallback((codeOrId) => {
    return getNotesForStandardUtil(codeOrId);
  }, []);

  // Map of standard code -> array of notes count
  const notesCountByStandard = useMemo(() => {
    const map = {};
    notes.forEach(note => {
      if (note.standardCode) {
        map[note.standardCode] = (map[note.standardCode] || 0) + 1;
      }
      if (note.standardId && note.standardId !== note.standardCode) {
        map[note.standardId] = (map[note.standardId] || 0) + 1;
      }
    });
    return map;
  }, [notes]);

  return {
    notes,
    totalNotesCount: notes.length,
    notesCountByStandard,
    addNote,
    updateNote,
    deleteNote,
    getNotesForStandard,
    refreshNotes
  };
}
