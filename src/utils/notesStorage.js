/**
 * Utility functions for local storage management of user notes on PA Standards.
 * Storage key: 'pa_standards_user_notes_v1'
 */

const STORAGE_KEY = 'pa_standards_user_notes_v1';

export const NOTE_CATEGORIES = [
  { id: 'Lesson Plan', label: 'Lesson Plan', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.12)' },
  { id: 'Walkthrough', label: 'Walkthrough Observation', color: '#38bdf8', bgColor: 'rgba(56, 189, 248, 0.12)' },
  { id: 'Small Group', label: 'Small Group', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.12)' },
  { id: 'Differentiation', label: 'Differentiation', color: '#a855f7', bgColor: 'rgba(168, 85, 247, 0.12)' },
  { id: 'General', label: 'General Note', color: '#94a3b8', bgColor: 'rgba(148, 163, 184, 0.12)' }
];

/**
 * Retrieve all notes from localStorage
 * @returns {Array<Object>}
 */
export function getAllNotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error reading notes from localStorage:', err);
    return [];
  }
}

/**
 * Save full notes array to localStorage
 * @param {Array<Object>} notes 
 */
export function saveAllNotes(notes) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    // Dispatch custom event for reactive cross-component sync
    window.dispatchEvent(new Event('pa_standards_notes_updated'));
  } catch (err) {
    console.error('Error saving notes to localStorage:', err);
  }
}

/**
 * Add a new note entry
 * @param {Object} params
 * @param {string} params.standardId
 * @param {string} params.standardCode
 * @param {string} [params.standardTitle]
 * @param {string} [params.standardSubject]
 * @param {string} [params.standardGrade]
 * @param {string} params.content
 * @param {string} [params.category]
 * @returns {Object} created note
 */
export function addNote({ standardId, standardCode, standardTitle = '', standardSubject = '', standardGrade = '', content, category = 'General' }) {
  const notes = getAllNotes();
  const now = new Date().toISOString();
  const newNote = {
    id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    standardId,
    standardCode,
    standardTitle,
    standardSubject,
    standardGrade,
    content: content ? content.trim() : '',
    category: category || 'General',
    createdAt: now,
    updatedAt: now
  };
  notes.unshift(newNote); // newest first
  saveAllNotes(notes);
  return newNote;
}

/**
 * Update an existing note content or category
 * @param {string} noteId 
 * @param {Object} updates { content, category }
 * @returns {Object|null} updated note
 */
export function updateNote(noteId, updates) {
  const notes = getAllNotes();
  const index = notes.findIndex(n => n.id === noteId);
  if (index === -1) return null;

  notes[index] = {
    ...notes[index],
    ...updates,
    content: updates.content !== undefined ? updates.content.trim() : notes[index].content,
    updatedAt: new Date().toISOString()
  };

  saveAllNotes(notes);
  return notes[index];
}

/**
 * Delete a note by ID
 * @param {string} noteId 
 * @returns {boolean} true if deleted
 */
export function deleteNote(noteId) {
  const notes = getAllNotes();
  const filtered = notes.filter(n => n.id !== noteId);
  if (filtered.length === notes.length) return false;
  saveAllNotes(filtered);
  return true;
}

/**
 * Get all notes for a specific standard (by code or id)
 * @param {string} standardCodeOrId 
 * @returns {Array<Object>}
 */
export function getNotesForStandard(standardCodeOrId) {
  if (!standardCodeOrId) return [];
  const notes = getAllNotes();
  const target = String(standardCodeOrId).trim().toLowerCase();
  return notes.filter(n => 
    String(n.standardCode).trim().toLowerCase() === target ||
    String(n.standardId).trim().toLowerCase() === target
  );
}

/**
 * Export notes array to CSV string
 * @param {Array<Object>} notes 
 * @returns {string} CSV text
 */
export function exportNotesToCSV(notes = []) {
  if (!notes.length) return '';
  const headers = ['Standard Code', 'Subject', 'Grade', 'Category', 'Date Created', 'Last Updated', 'Note Content'];
  
  const escapeCSV = (str) => {
    if (str === null || str === undefined) return '""';
    const cleanStr = String(str).replace(/"/g, '""');
    return `"${cleanStr}"`;
  };

  const rows = notes.map(n => [
    escapeCSV(n.standardCode),
    escapeCSV(n.standardSubject),
    escapeCSV(n.standardGrade),
    escapeCSV(n.category),
    escapeCSV(new Date(n.createdAt).toLocaleDateString() + ' ' + new Date(n.createdAt).toLocaleTimeString()),
    escapeCSV(new Date(n.updatedAt).toLocaleDateString() + ' ' + new Date(n.updatedAt).toLocaleTimeString()),
    escapeCSV(n.content)
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

/**
 * Export notes to formatted markdown/text summary for Google Docs or emails
 * @param {Array<Object>} notes 
 * @returns {string} Formatted markdown text
 */
export function exportNotesToFormattedText(notes = []) {
  if (!notes.length) return 'No notes recorded.';
  
  let output = `# RBCS PA Standards - User Notes & Walkthrough Summary\nGenerated: ${new Date().toLocaleDateString()}\n\n`;
  
  notes.forEach((n, index) => {
    output += `### ${index + 1}. [${n.standardCode}] ${n.category.toUpperCase()}\n`;
    if (n.standardSubject || n.standardGrade) {
      output += `**Subject / Grade:** ${n.standardSubject} (Grade ${n.standardGrade})\n`;
    }
    output += `**Date:** ${new Date(n.createdAt).toLocaleString()}\n`;
    output += `**Notes:**\n${n.content}\n\n`;
    output += `---\n\n`;
  });

  return output;
}
