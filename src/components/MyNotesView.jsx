import React, { useState, useMemo } from 'react';
import { 
  NotebookPen, 
  Search, 
  Download, 
  Copy, 
  Trash2, 
  Edit2, 
  Calendar, 
  BookOpen, 
  Workflow, 
  Tag, 
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';
import { NOTE_CATEGORIES, exportNotesToCSV, exportNotesToFormattedText } from '../utils/notesStorage';

export function MyNotesView({ 
  userNotes, 
  onInspectStandard, 
  onOpenMap, 
  onShowToast, 
  onAddNote, 
  onUpdateNote, 
  onDeleteNote 
}) {
  const { notes, totalNotesCount } = userNotes;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState('');

  // Filter notes based on category and search query
  const filteredNotes = useMemo(() => {
    return notes.filter(n => {
      const noteCat = n.category === 'Scaffold' ? 'Small Group' : n.category;
      const matchesCat = selectedCategory === 'All' || noteCat === selectedCategory || n.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = !q || 
        (n.standardCode && n.standardCode.toLowerCase().includes(q)) ||
        (n.content && n.content.toLowerCase().includes(q)) ||
        (n.standardSubject && n.standardSubject.toLowerCase().includes(q)) ||
        (n.category && n.category.toLowerCase().includes(q)) ||
        (noteCat && noteCat.toLowerCase().includes(q));

      return matchesCat && matchesQuery;
    });
  }, [notes, selectedCategory, searchQuery]);

  // Stats calculation
  const uniqueStandardsCount = useMemo(() => {
    const set = new Set(notes.map(n => n.standardCode).filter(Boolean));
    return set.size;
  }, [notes]);

  const categoryCounts = useMemo(() => {
    const counts = { 'Lesson Plan': 0, 'Walkthrough': 0, 'Small Group': 0, 'Differentiation': 0, 'General': 0 };
    notes.forEach(n => {
      let cat = n.category === 'Scaffold' ? 'Small Group' : n.category;
      if (counts[cat] !== undefined) {
        counts[cat]++;
      } else {
        counts['General']++;
      }
    });
    return counts;
  }, [notes]);

  // Handle Export CSV
  const handleExportCSV = () => {
    if (!filteredNotes.length) {
      onShowToast('No notes available to export.');
      return;
    }
    const csvContent = exportNotesToCSV(filteredNotes);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `RBCS_PA_Standards_Notes_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast(`Exported ${filteredNotes.length} notes to CSV`);
  };

  // Handle Copy Formatted Text
  const handleCopyFormatted = () => {
    if (!filteredNotes.length) {
      onShowToast('No notes available to copy.');
      return;
    }
    const formattedText = exportNotesToFormattedText(filteredNotes);
    navigator.clipboard.writeText(formattedText);
    onShowToast(`Copied formatted summary of ${filteredNotes.length} notes to clipboard!`);
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
    onShowToast('Note updated successfully!');
  };

  const handleDelete = (noteId) => {
    if (window.confirm('Are you sure you want to delete this note entry?')) {
      onDeleteNote(noteId);
      onShowToast('Note entry deleted.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      
      {/* Top Banner / Stats Header */}
      <div 
        style={{
          background: 'linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-secondary) 100%)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-medium)',
          padding: '28px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                background: 'rgba(56, 189, 248, 0.15)',
                color: 'var(--accent-blue)',
                padding: '8px',
                borderRadius: 'var(--radius-md)'
              }}>
                <NotebookPen size={24} />
              </div>
              <div>
                <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                  My Notes & Lessons Dashboard
                </h1>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  Private notes, lesson plan tags, and classroom walkthrough observations attached to PA Standards.
                </p>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={handleCopyFormatted}
              disabled={filteredNotes.length === 0}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-main)',
                fontSize: '0.85rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: filteredNotes.length > 0 ? 'pointer' : 'not-allowed',
                opacity: filteredNotes.length > 0 ? 1 : 0.5
              }}
            >
              <Copy size={15} color="var(--accent-blue)" /> Copy Formatted Summary
            </button>

            <button
              onClick={handleExportCSV}
              disabled={filteredNotes.length === 0}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent-emerald)',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '0.85rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: filteredNotes.length > 0 ? 'pointer' : 'not-allowed',
                opacity: filteredNotes.length > 0 ? 1 : 0.5
              }}
            >
              <FileSpreadsheet size={15} /> Export CSV
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          marginTop: '8px'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: '600' }}>Total Notes</span>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--accent-blue)' }}>{totalNotesCount}</span>
          </div>

          <div style={{
            background: 'var(--bg-card)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: '600' }}>Standards Annotated</span>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--accent-gold)' }}>{uniqueStandardsCount}</span>
          </div>

          <div style={{
            background: 'var(--bg-card)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: '600' }}>Walkthroughs</span>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--accent-sky, #38bdf8)' }}>{categoryCounts['Walkthrough']}</span>
          </div>

          <div style={{
            background: 'var(--bg-card)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: '600' }}>Small Group</span>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--accent-gold)' }}>{categoryCounts['Small Group']}</span>
          </div>

          <div style={{
            background: 'var(--bg-card)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: '600' }}>Differentiation</span>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#a855f7' }}>{categoryCounts['Differentiation']}</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg-secondary)',
        padding: '16px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-medium)'
      }}>
        {/* Search Input */}
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes by keyword, standard code (e.g. RI.1.1), or subject..."
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-medium)',
              background: 'var(--bg-card)',
              color: 'var(--text-main)',
              fontSize: '0.88rem'
            }}
          />
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <button
            onClick={() => setSelectedCategory('All')}
            style={{
              padding: '6px 14px',
              borderRadius: '16px',
              fontSize: '0.8rem',
              fontWeight: '700',
              border: selectedCategory === 'All' ? '2px solid var(--accent-blue)' : '1px solid var(--border-medium)',
              background: selectedCategory === 'All' ? 'rgba(56, 189, 248, 0.12)' : 'var(--bg-card)',
              color: selectedCategory === 'All' ? 'var(--accent-blue)' : 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            All Categories ({totalNotesCount})
          </button>
          {NOTE_CATEGORIES.map(cat => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '16px',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  border: isSelected ? `2px solid ${cat.color}` : '1px solid var(--border-medium)',
                  background: isSelected ? cat.bgColor : 'var(--bg-card)',
                  color: isSelected ? cat.color : 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notes List */}
      {filteredNotes.length === 0 ? (
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
          <NotebookPen size={36} color="var(--accent-blue)" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
            {totalNotesCount === 0 ? 'No standard notes created yet' : 'No notes match your filters'}
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: '460px', margin: 0 }}>
            {totalNotesCount === 0 
              ? 'When browsing standards in the Feed or Coherence Map, click the "Notes" button on any standard card to record lesson plans, curriculum connections (e.g. Eureka Math2), or classroom walkthrough observations.'
              : 'Try clearing your search query or switching category filters above.'
            }
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredNotes.map(n => {
            const catConfig = NOTE_CATEGORIES.find(c => c.id === n.category) || NOTE_CATEGORIES[3];
            const isEditing = editingNoteId === n.id;

            return (
              <div 
                key={n.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                {/* Note Card Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span 
                      className="badge badge-navy" 
                      style={{ fontSize: '0.88rem', fontWeight: '800', cursor: 'pointer' }}
                      onClick={() => onInspectStandard({ id: n.standardId, code: n.standardCode })}
                      title="Inspect standard details"
                    >
                      {n.standardCode}
                    </span>
                    {(n.standardSubject || n.standardGrade) && (
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                        {n.standardSubject} • Grade {n.standardGrade}
                      </span>
                    )}
                    <span 
                      style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        color: catConfig.color,
                        background: catConfig.bgColor
                      }}
                    >
                      {catConfig.label}
                    </span>
                  </div>

                  {/* Actions & Timestamp */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={13} /> {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    <button
                      onClick={() => onInspectStandard({ id: n.standardId, code: n.standardCode })}
                      className="btn-icon"
                      style={{ padding: '6px', fontSize: '0.8rem' }}
                      title="View Standard Details"
                    >
                      <BookOpen size={15} color="var(--accent-blue)" />
                    </button>

                    <button
                      onClick={() => onOpenMap(n.standardCode)}
                      className="btn-icon"
                      style={{ padding: '6px', fontSize: '0.8rem' }}
                      title="View in Coherence Map"
                    >
                      <Workflow size={15} color="var(--accent-gold)" />
                    </button>

                    <button
                      onClick={() => handleStartEdit(n)}
                      className="btn-icon"
                      style={{ padding: '6px' }}
                      title="Edit Note"
                    >
                      <Edit2 size={15} color="var(--text-secondary)" />
                    </button>

                    <button
                      onClick={() => handleDelete(n.id)}
                      className="btn-icon"
                      style={{ padding: '6px' }}
                      title="Delete Note"
                    >
                      <Trash2 size={15} color="var(--accent-crimson)" />
                    </button>
                  </div>
                </div>

                {/* Content area / Edit area */}
                {isEditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {NOTE_CATEGORIES.map(cat => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setEditCategory(cat.id)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '0.78rem',
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
                      rows={4}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-medium)',
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-main)',
                        fontSize: '0.9rem',
                        fontFamily: 'inherit'
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setEditingNoteId(null)}
                        style={{ padding: '6px 12px', fontSize: '0.8rem', background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(n.id)}
                        style={{ padding: '6px 14px', fontSize: '0.8rem', background: 'var(--accent-emerald)', color: '#FFF', borderRadius: '4px', border: 'none', fontWeight: '700', cursor: 'pointer' }}
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <p style={{
                    fontSize: '0.92rem',
                    color: 'var(--text-main)',
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.5',
                    margin: 0,
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-secondary)'
                  }}>
                    {n.content}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
