import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Check } from 'lucide-react';
import { NOTE_CATEGORIES, getNotesForStandard } from '../utils/notesStorage';

export function StandardNoteModal({ standard, isOpen, onClose, onAddNote }) {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Lesson Plan');
  const [existingCount, setExistingCount] = useState(0);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (standard && isOpen) {
      const currentNotes = getNotesForStandard(standard.code || standard.id);
      setExistingCount(currentNotes.length);
      setContent('');
      setCategory('Lesson Plan');

      // Auto-focus textarea when modal opens
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 100);
    }
  }, [standard, isOpen]);

  if (!isOpen || !standard) return null;

  const handleSave = (e) => {
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

    setContent('');
    onClose();
  };

  return typeof document !== 'undefined' ? createPortal(
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 10000 }}>
      <div 
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '560px',
          width: '90%',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          animation: 'fadeInScale 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-tertiary)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-navy" style={{ fontSize: '0.85rem', fontWeight: '800' }}>
                {standard.code}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                {standard.subject} • Grade {standard.grade}
              </span>
              {existingCount > 0 && (
                <span style={{
                  fontSize: '0.75rem',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  background: 'rgba(56, 189, 248, 0.12)',
                  color: 'var(--accent-blue)',
                  fontWeight: '700'
                }}>
                  {existingCount} saved note{existingCount === 1 ? '' : 's'}
                </span>
              )}
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginTop: '6px', color: 'var(--text-main)', margin: '6px 0 0 0' }}>
              Quick Add Note / Walkthrough Entry
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

        {/* Form Body */}
        <form onSubmit={handleSave} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Category Selector Pills */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>
              Select Tag / Category
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {NOTE_CATEGORIES.map(cat => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '16px',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      border: isSelected ? `2px solid ${cat.color}` : '1px solid var(--border-medium)',
                      background: isSelected ? cat.bgColor : 'var(--bg-secondary)',
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
          </div>

          {/* Text Area */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
              Note Content
            </label>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type your lesson plan note, walkthrough observation, or instructional strategy here..."
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                lineHeight: '1.5',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Footer Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'transparent',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-muted)',
                fontWeight: '600',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!content.trim()}
              style={{
                padding: '8px 20px',
                borderRadius: 'var(--radius-md)',
                background: content.trim() ? 'var(--accent-blue)' : 'var(--border-medium)',
                color: '#FFFFFF',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: content.trim() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                border: 'none'
              }}
            >
              <Check size={16} /> Save Note
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  ) : null;
}
