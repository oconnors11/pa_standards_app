import React, { useState } from 'react';
import { 
  X, Trash2, Plus, Download, Printer, Copy, Check, 
  BookmarkCheck, BookOpen, Calendar, Edit3, Save 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function LessonBinderModal({
  isOpen,
  onClose,
  units,
  activeUnit,
  activeUnitId,
  setActiveUnitId,
  createUnit,
  updateActiveUnit,
  deleteUnit,
  allStandards,
  onInspect,
  showToast
}) {
  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [unitTitle, setUnitTitle] = useState(activeUnit?.title || '');
  const [unitNotes, setUnitNotes] = useState(activeUnit?.notes || '');
  const [unitDays, setUnitDays] = useState(activeUnit?.target_days || 10);
  const [copiedFormat, setCopiedFormat] = useState(null);

  if (!isOpen || !activeUnit) return null;

  // Resolve standard objects for active unit
  const savedStandards = activeUnit.standard_ids
    .map(id => allStandards.find(s => s.id === id || s.code === id))
    .filter(Boolean);

  const handleSaveMeta = () => {
    updateActiveUnit({
      title: unitTitle,
      notes: unitNotes,
      target_days: Number(unitDays)
    });
    setIsEditingMeta(false);
    showToast('Lesson unit updated successfully!');
  };

  const handleRemoveStandard = (standardId) => {
    updateActiveUnit({
      standard_ids: activeUnit.standard_ids.filter(id => id !== standardId)
    });
    showToast('Removed standard from unit.');
  };

  // 1. Export as Markdown Planbook Table
  const handleCopyMarkdown = () => {
    let md = `# ${activeUnit.title}\n`;
    md += `**Subject:** ${activeUnit.subject} | **Target Duration:** ${activeUnit.target_days} Days\n`;
    if (activeUnit.notes) md += `**Unit Focus / Notes:** ${activeUnit.notes}\n\n`;
    md += `| PA Standard Code | Domain / Strand | Eligible Content Description | DOK Level |\n`;
    md += `| :--- | :--- | :--- | :--- |\n`;
    savedStandards.forEach(s => {
      md += `| **${s.code}** | ${s.domain} | ${s.description.replace(/\|/g, '-')} | ${s.dok} |\n`;
    });

    navigator.clipboard.writeText(md);
    setCopiedFormat('markdown');
    showToast('Copied formatted Lesson Plan Markdown table!');
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  // 2. Export as CSV / Excel
  const handleDownloadCsv = () => {
    let csv = 'Standard Code,Alt Core Code,Subject,Grade,Domain,Description,Reporting Category,DOK Level\n';
    savedStandards.forEach(s => {
      const row = [
        `"${s.code}"`,
        `"${s.alt_code || ''}"`,
        `"${s.subject}"`,
        `"${s.grade}"`,
        `"${s.domain}"`,
        `"${s.description.replace(/"/g, '""')}"`,
        `"${s.reporting_category || ''}"`,
        `"${s.dok}"`
      ];
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${activeUnit.title.toLowerCase().replace(/\s+/g, '_')}_standards.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported CSV spreadsheet matrix!');
  };

  // 3. Printable View
  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 15, 30, 0.8)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 950,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-secondary)',
          width: '100%',
          maxWidth: '840px',
          maxHeight: '90vh',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-gold-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--accent-gold)'
            }}>
              <BookmarkCheck size={20} color="var(--accent-gold)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)' }}>
                Curriculum Lesson Binder
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Organize, sequence, and export standards for weekly lesson pacing
              </p>
            </div>
          </div>

          <button onClick={onClose} style={{ color: 'var(--text-muted)', padding: '6px' }}>
            <X size={22} />
          </button>
        </div>

        {/* Units Tabs Strip */}
        <div style={{
          padding: '12px 24px',
          background: 'var(--bg-primary)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          overflowX: 'auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto' }}>
            {units.map(u => {
              const active = u.id === activeUnitId;
              return (
                <button
                  key={u.id}
                  onClick={() => {
                    setActiveUnitId(u.id);
                    setUnitTitle(u.title);
                    setUnitNotes(u.notes || '');
                    setUnitDays(u.target_days || 10);
                    setIsEditingMeta(false);
                  }}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    background: active ? 'var(--accent-gold)' : 'var(--bg-card)',
                    color: active ? '#000000' : 'var(--text-muted)',
                    fontWeight: active ? '700' : '500',
                    fontSize: '0.82rem',
                    whiteSpace: 'nowrap',
                    border: `1px solid ${active ? 'var(--accent-gold)' : 'var(--border-subtle)'}`
                  }}
                >
                  {u.title} ({u.standard_ids.length})
                </button>
              );
            })}
          </div>

          <button
            onClick={() => {
              const newU = createUnit();
              setUnitTitle(newU.title);
              setUnitNotes('');
              setUnitDays(5);
              setIsEditingMeta(true);
            }}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--accent-blue)',
              color: '#FFFFFF',
              fontSize: '0.8rem',
              fontWeight: '700',
              whiteSpace: 'nowrap',
              gap: '4px'
            }}
          >
            <Plus size={14} />
            <span>New Unit</span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>

          {/* Unit Metadata Card */}
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {isEditingMeta ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Unit Title</label>
                    <input
                      type="text"
                      value={unitTitle}
                      onChange={(e) => setUnitTitle(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-medium)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-main)',
                        fontSize: '0.9rem',
                        marginTop: '4px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Pacing (Days)</label>
                    <input
                      type="number"
                      value={unitDays}
                      onChange={(e) => setUnitDays(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-medium)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-main)',
                        fontSize: '0.9rem',
                        marginTop: '4px'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Unit Notes & Pacing Focus</label>
                  <textarea
                    rows={2}
                    value={unitNotes}
                    onChange={(e) => setUnitNotes(e.target.value)}
                    placeholder="e.g. Focus on conceptual models of rational numbers and real-world word problems..."
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem',
                      marginTop: '4px',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button
                    onClick={() => setIsEditingMeta(false)}
                    style={{ padding: '6px 12px', color: 'var(--text-muted)', fontSize: '0.82rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveMeta}
                    style={{
                      padding: '6px 16px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--accent-blue)',
                      color: '#FFFFFF',
                      fontSize: '0.82rem',
                      fontWeight: '700',
                      gap: '4px'
                    }}
                  >
                    <Save size={14} />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)' }}>
                    {activeUnit.title}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={14} color="var(--accent-gold)" />
                      {activeUnit.target_days || 10} Estimated Teaching Days
                    </span>
                    <span>·</span>
                    <span>{savedStandards.length} Standards Aligned</span>
                  </div>
                  {activeUnit.notes && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.4' }}>
                      {activeUnit.notes}
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    onClick={() => setIsEditingMeta(true)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--accent-blue)',
                      fontSize: '0.78rem',
                      fontWeight: '600',
                      gap: '4px'
                    }}
                  >
                    <Edit3 size={13} />
                    <span>Edit</span>
                  </button>
                  {units.length > 1 && (
                    <button
                      onClick={() => deleteUnit(activeUnitId)}
                      style={{
                        padding: '6px',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--accent-ruby)'
                      }}
                      title="Delete unit"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Standards List in Unit */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                Aligned Standards ({savedStandards.length})
              </h4>
            </div>

            {savedStandards.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '36px 20px',
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px dashed var(--border-medium)',
                color: 'var(--text-muted)'
              }}>
                <BookOpen size={28} style={{ margin: '0 auto 8px auto', opacity: 0.5 }} />
                <p style={{ fontWeight: '600', fontSize: '0.95rem' }}>No standards saved in this unit yet.</p>
                <p style={{ fontSize: '0.82rem', marginTop: '4px' }}>
                  Browse standards in the feed and click the "Save" bookmark button to add them here.
                </p>
              </div>
            ) : (
              savedStandards.map((s, index) => (
                <div
                  key={s.id}
                  style={{
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-dim)' }}>
                        #{index + 1}
                      </span>
                      <span className="badge badge-code">
                        {s.code}
                      </span>
                      <span className="badge" style={{ background: 'var(--bg-primary)', color: 'var(--text-muted)' }}>
                        Grade {s.grade}
                      </span>
                      <span className="badge badge-dok">
                        {s.dok}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--accent-blue)' }}>
                      {s.domain}
                    </div>

                    <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: '1.4' }}>
                      {s.description}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button
                      onClick={() => handleRemoveStandard(s.id)}
                      style={{
                        padding: '6px',
                        color: 'var(--text-dim)',
                        borderRadius: 'var(--radius-sm)'
                      }}
                      title="Remove from unit"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

        {/* Footer Export Bar */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-subtle)',
          background: 'var(--bg-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Export Matrix:
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={handleCopyMarkdown}
              disabled={savedStandards.length === 0}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-medium)',
                color: copiedFormat === 'markdown' ? 'var(--accent-emerald)' : 'var(--text-main)',
                fontSize: '0.82rem',
                fontWeight: '600',
                gap: '6px'
              }}
            >
              {copiedFormat === 'markdown' ? <Check size={14} /> : <Copy size={14} />}
              <span>Copy Markdown Table</span>
            </button>

            <button
              onClick={handleDownloadCsv}
              disabled={savedStandards.length === 0}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-main)',
                fontSize: '0.82rem',
                fontWeight: '600',
                gap: '6px'
              }}
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handlePrint}
              disabled={savedStandards.length === 0}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent-blue)',
                color: '#FFFFFF',
                fontSize: '0.82rem',
                fontWeight: '700',
                gap: '6px'
              }}
            >
              <Printer size={14} />
              <span>Print Alignment</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
