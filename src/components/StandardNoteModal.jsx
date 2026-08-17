import React, { useState, useEffect } from 'react';
import { X, Plus, Edit2, Trash2, Check, Tag, Calendar, Sparkles } from 'lucide-react';
import { NOTE_CATEGORIES, getNotesForStandard } from '../utils/notesStorage';

export function StandardNoteModal({ standard, isOpen, onClose, onAddNote, onUpdateNote, onDeleteNote }) {
  const [existingNotes, setExistingNotes] = useState([]);
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Lesson Plan');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState('');

  useEffect(() => {
    if (standard && isOpen) {
      const currentNotes = getNotesForStandard(standard.code || standard.id);
      setExistingNotes(currentNotes);
      setContent('');
      setCategory('Lesson Plan');
      setEditingNoteId(null);
    }
  }, [standard, isOpen]);

  if (!isOpen || !standard) return null;

  const handleSaveNew = (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    onAddNote({
      standardId: standard.id,
      standardCode: standard.code,
      standardTitle: standard.description ? standard.description.substring(0, 100) : standard.code,
      standardSubject: standard.subject || '',
      standardGrade: standard.grade || '',
      content: content.trim(),
      category
    });

    // Refresh existing list
    setExistingNotes(getNotesForStandard(standard.code || standard.id));
    setContent('');
  };

  const handleStartEdit = (note) => {
    setEditingNoteId(note.id);
    setEditContent(note.content);
    setEditCategory(note.category || 'General');
  };

  const handleSaveEdit = (noteId) => {
    if (!editContent.trim()) return;
    onUpdateNote(noteId, {
      content: editContent.trim(),
      category: editCategory
    });
    setEditingNoteId(null);
    setExistingNotes(getNotesForStandard(standard.code || standard.id));
  };

  const handleDelete = (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      onDeleteNote(noteId);
      setExistingNotes(getNotesForStandard(standard.code || standard.id));
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1000 }}>
      <div 
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '650px',
          width: '90%',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-tertiary)',
          borderTopLeftRadius: 'var(--radius-lg)',
          borderTopRightRadius: 'var(--radius-lg)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-navy" style={{ fontSize: '0.85rem' }}>
                {standard.code}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                {standard.subject} • Grade {standard.grade}
              </span>
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginTop: '6px', color: 'var(--text-main)' }}>
              Standard Notes & Observations
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="btn-icon"
            style={{ padding: '6px', borderRadius: '50%' }}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Add New Note Form */}
          <form onSubmit={handleSaveNew} style={{
            background: 'var(--bg-secondary)',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-medium)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Plus size={16} color="var(--accent-blue)" /> Add New Note / Walkthrough Entry
              </label>
            </div>

            {/* Category Selectors */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {NOTE_CATEGORIES.map(cat => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '16px',
                      fontSize: '0.78rem',
                      fontWeight: '600',
                      border: isSelected ? `2px solid ${cat.color}` : '1px solid var(--border-medium)',
                      background: isSelected ? cat.bgColor : 'var(--bg-card)',
                      color: isSelected ? cat.color : 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Textarea */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="e.g. Eureka Math2 Unit 4 Lesson 2 connection, or Principal walkthrough observation in Room 102..."
              rows={3}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-medium)',
                background: 'var(--bg-card)',
                color: 'var(--text-main)',
                fontSize: '0.88rem',
                lineHeight: '1.4',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={!content.trim()}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-sm)',
                  background: content.trim() ? 'var(--accent-blue)' : 'var(--border-medium)',
                  color: '#FFFFFF',
                  fontWeight: '700',
                  fontSize: '0.82rem',
                  cursor: content.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  border: 'none'
                }}
              >
                <Plus size={14} /> Save Note
              </button>
            </div>
          </form>

          {/* Existing Notes List */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Saved Notes for {standard.code} ({existingNotes.length})
            </h4>

            {existingNotes.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No notes logged for this standard yet. Use the form above to add a lesson plan note or walkthrough observation.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {existingNotes.map(n => {
                  const catConfig = NOTE_CATEGORIES.find(c => c.id === n.category) || NOTE_CATEGORIES[3];
                  const isEditing = editingNoteId === n.id;

                  return (
                    <div 
                      key={n.id}
                      style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        padding: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      {isEditing ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {NOTE_CATEGORIES.map(cat => (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => setEditCategory(cat.id)}
                                style={{
                                  padding: '4px 10px',
                                  borderRadius: '12px',
                                  fontSize: '0.75rem',
                                  fontWeight: '600',
                                  border: editCategory === cat.id ? `2px solid ${cat.color}` : '1px solid var(--border-medium)',
                                  background: editCategory === cat.id ? cat.bgColor : 'transparent',
                                  color: editCategory === cat.id ? cat.color : 'var(--text-muted)'
                                }}
                              >
                                {cat.label}
                              </button>
                            ))}
                          </div>
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows={3}
                            style={{
                              width: '100%',
                              padding: '8px',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border-medium)',
                              background: 'var(--bg-secondary)',
                              color: 'var(--text-main)',
                              fontSize: '0.85rem'
                            }}
                          />
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => setEditingNoteId(null)}
                              style={{ padding: '4px 10px', fontSize: '0.78rem', background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer' }}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(n.id)}
                              style={{ padding: '5px 12px', fontSize: '0.78rem', background: 'var(--accent-emerald)', color: '#FFF', borderRadius: '4px', border: 'none', fontWeight: '700', cursor: 'pointer' }}
                            >
                              Save Changes
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span 
                              style={{
                                padding: '3px 10px',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                color: catConfig.color,
                                background: catConfig.bgColor
                              }}
                            >
                              {catConfig.label}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Calendar size={12} /> {new Date(n.createdAt).toLocaleDateString()}
                              </span>
                              <button
                                onClick={() => handleStartEdit(n)}
                                style={{ background: 'none', border: 'none', padding: '2px', color: 'var(--text-muted)', cursor: 'pointer' }}
                                title="Edit note"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(n.id)}
                                style={{ background: 'none', border: 'none', padding: '2px', color: 'var(--accent-crimson)', cursor: 'pointer' }}
                                title="Delete note"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', whiteSpace: 'pre-wrap', lineHeight: '1.45', margin: 0 }}>
                            {n.content}
                          </p>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
