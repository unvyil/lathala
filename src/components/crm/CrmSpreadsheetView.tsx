import React, { useState, useMemo, useRef } from 'react';
import {
  SearchIcon,
  PlusIcon,
  Trash2Icon,
  DownloadIcon,
  UploadIcon,
  RefreshCwIcon,
  FileSpreadsheetIcon,
  Code2Icon,
  CheckCircle2Icon,
  ClockIcon,
  SendIcon,
  SlidersHorizontalIcon,
  TagIcon,
  FilterIcon,
  ExternalLinkIcon,
  ColumnsIcon,
  EyeIcon,
} from 'lucide-react';
import { useStudio } from '../../contexts/StudioContext';
import { Subscriber, Department, CustomFieldColumn, SubscriberStatus } from '../../types/studio';
import { GOOGLE_APPS_SCRIPT_SAMPLE } from '../../services/googleSheetsScript';

interface CrmSpreadsheetViewProps {
  onOpenSettings: () => void;
  onOpenScriptModal: () => void;
  onOpenPreview?: () => void;
}

export function CrmSpreadsheetView({ onOpenSettings, onOpenScriptModal, onOpenPreview }: CrmSpreadsheetViewProps) {
  const {
    subscribers,
    addSubscriber,
    updateSubscriber,
    deleteSubscriber,
    markSent,
    departments,
    addDepartment,
    customColumns,
    addCustomColumn,
    deleteCustomColumn,
    isSyncingSheets,
    syncWithGoogleSheets,
    integrations,
    setView,
    setPreviewSubscriberId,
    addToast,
  } = useStudio();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [newColType, setNewColType] = useState<CustomFieldColumn['type']>('text');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtered subscribers
  const filteredRows = useMemo(() => {
    return subscribers.filter((sub) => {
      const matchesSearch =
        searchQuery === '' ||
        sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sub.customData &&
          Object.values(sub.customData).some((val) =>
            String(val).toLowerCase().includes(searchQuery.toLowerCase()),
          ));

      const matchesDept =
        selectedDeptId === 'all' || sub.departmentId === selectedDeptId;

      const matchesStatus =
        selectedStatus === 'all' || sub.status === selectedStatus;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [subscribers, searchQuery, selectedDeptId, selectedStatus]);

  // Bulk selection handlers
  const allSelected =
    filteredRows.length > 0 && filteredRows.every((r) => selectedIds.includes(r.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRows.map((r) => r.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  // Add new subscriber inline
  const handleAddNewRow = () => {
    addSubscriber({
      name: 'New Recipient',
      email: `member-${Math.floor(Math.random() * 900) + 100}@example.com`,
      role: 'Member',
      departmentId: departments[0]?.id || '',
      status: 'pending',
      customData: {
        organization: 'Independent Studio',
        city: 'Global',
      },
    });
  };

  // Add new custom column
  const handleCreateColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    addCustomColumn(newColName.trim(), newColType);
    setNewColName('');
    setIsAddingColumn(false);
  };

  // CSV Export
  const handleExportCsv = () => {
    const headers = ['ID', 'Name', 'Email', 'Role', 'Department', 'Status', ...customColumns.map((c) => c.label)];
    const rows = subscribers.map((sub) => {
      const dept = departments.find((d) => d.id === sub.departmentId)?.name || 'Unassigned';
      const customVals = customColumns.map((c) => (sub.customData ? sub.customData[c.key] || '' : ''));
      return [sub.id, `"${sub.name}"`, `"${sub.email}"`, `"${sub.role}"`, `"${dept}"`, sub.status, ...customVals.map((v) => `"${v}"`)];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `lathala_crm_audience_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Audience exported as CSV', 'success');
  };

  // CSV Import
  const handleImportCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
        if (lines.length < 2) {
          addToast('File must have a header row and at least one subscriber', 'error');
          return;
        }

        // Determine delimiter: comma, semicolon, or tab
        const firstLine = lines[0];
        const delimiter = firstLine.includes('\t')
          ? '\t'
          : firstLine.includes(';') && !firstLine.includes(',')
          ? ';'
          : ',';

        const parseRow = (line: string): string[] => {
          const row: string[] = [];
          let insideQuotes = false;
          let current = '';

          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              insideQuotes = !insideQuotes;
            } else if (char === delimiter && !insideQuotes) {
              row.push(current.replace(/^"|"$/g, '').trim());
              current = '';
            } else {
              current += char;
            }
          }
          row.push(current.replace(/^"|"$/g, '').trim());
          return row;
        };

        const headers = parseRow(lines[0]).map((h) => h.toLowerCase());

        // Map core fields only
        const nameIdx = headers.findIndex(
          (h) => h.includes('name') || h.includes('contact') || h.includes('subscriber') || h.includes('recipient'),
        );
        const emailIdx = headers.findIndex((h) => h.includes('email') || h.includes('mail'));
        const roleIdx = headers.findIndex(
          (h) => h.includes('role') || h.includes('position') || h.includes('title') || h.includes('job'),
        );
        const deptIdx = headers.findIndex(
          (h) => h.includes('department') || h.includes('dept') || h.includes('team') || h.includes('segment'),
        );

        // Map custom columns only if they exist in customColumns
        const customColMap = customColumns.map((col) => ({
          key: col.key,
          index: headers.findIndex(
            (h) => h === col.key.toLowerCase() || h === col.label.toLowerCase(),
          ),
        }));

        let importedCount = 0;
        for (let i = 1; i < lines.length; i++) {
          const cols = parseRow(lines[i]);
          const email = emailIdx !== -1 ? cols[emailIdx] : '';
          const name = nameIdx !== -1 ? cols[nameIdx] : 'Audience Member';
          const role = roleIdx !== -1 ? cols[roleIdx] : 'Subscriber';

          // Department resolution
          let deptId = departments[0]?.id || '';
          if (deptIdx !== -1 && cols[deptIdx]) {
            const rawDept = cols[deptIdx].toLowerCase();
            const matchedDept = departments.find(
              (d) => d.name.toLowerCase() === rawDept || d.id.toLowerCase() === rawDept,
            );
            if (matchedDept) {
              deptId = matchedDept.id;
            }
          }

          // Populate custom fields strictly matching registered columns
          const customData: Record<string, string> = {};
          for (const item of customColMap) {
            if (item.index !== -1 && cols[item.index]) {
              customData[item.key] = cols[item.index];
            }
          }

          if (email && email.includes('@')) {
            addSubscriber({
              name,
              email,
              role,
              departmentId: deptId,
              status: 'pending',
              customData,
            });
            importedCount++;
          }
        }
        addToast(`Successfully imported ${importedCount} subscribers!`, 'success');
      } catch (err) {
        addToast('Failed to parse spreadsheet file', 'error');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const pendingCount = subscribers.filter((s) => s.status === 'pending').length;
  const sentCount = subscribers.filter((s) => s.status === 'sent').length;

  return (
    <div className="flex-1 flex flex-col bg-parchment overflow-hidden">
      {/* Top Banner & Google Sheets Sync Bar */}
      <div className="bg-espresso text-parchment px-6 py-3 border-b border-sandbar/20 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-emerald-900/60 border border-emerald-700/50 flex items-center justify-center text-emerald-300">
            <FileSpreadsheetIcon size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold tracking-tight text-white">
                Workspace Spreadsheet Audience
              </h1>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-sandbar/20 text-parchment/90">
                {subscribers.length} records · {pendingCount} pending · {sentCount} sent
              </span>
            </div>
            <p className="text-xs text-parchment/60">
              Inline spreadsheet connected to Lathala Newsletter Personalization & Google Apps Script
            </p>
          </div>
        </div>

        {/* Sync Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={syncWithGoogleSheets}
            disabled={isSyncingSheets}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-medium text-parchment transition-all border border-white/10 disabled:opacity-50"
          >
            <RefreshCwIcon size={13} className={isSyncingSheets ? 'animate-spin' : ''} />
            <span>{isSyncingSheets ? 'Syncing...' : 'Sync with Google Sheet'}</span>
          </button>

          <button
            onClick={onOpenScriptModal}
            title="View copyable Google Apps Script Code.gs"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-800/80 hover:bg-emerald-700 text-xs font-medium text-emerald-100 transition-all border border-emerald-600/50"
          >
            <Code2Icon size={13} />
            <span>Apps Script Code</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-parchment/70 hover:text-parchment border border-white/10"
          >
            <SlidersHorizontalIcon size={13} />
            <span>Sync Config</span>
          </button>

          {onOpenPreview && (
            <button
              onClick={onOpenPreview}
              title="Preview newsletter rendering with live audience personalization"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-xs font-semibold text-white transition-all shadow-sm"
            >
              <EyeIcon size={13} />
              <span>Newsletter Preview</span>
            </button>
          )}
        </div>
      </div>

      {/* Toolbar: Search, Filters, Bulk Actions */}
      <div className="bg-base px-6 py-3 border-b border-sandbar flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search box */}
          <div className="relative">
            <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-espresso/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, role, tag..."
              className="h-8.5 w-64 rounded-lg border border-sandbar bg-white pl-8 pr-3 text-xs text-onyx placeholder:text-espresso/40 focus:border-accent focus:outline-none"
            />
          </div>

          {/* Department Filter */}
          <select
            value={selectedDeptId}
            onChange={(e) => setSelectedDeptId(e.target.value)}
            className="h-8.5 rounded-lg border border-sandbar bg-white px-2.5 text-xs text-onyx focus:border-accent focus:outline-none"
          >
            <option value="all">All Departments ({departments.length})</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-8.5 rounded-lg border border-sandbar bg-white px-2.5 text-xs text-onyx focus:border-accent focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending ({pendingCount})</option>
            <option value="sent">Sent ({sentCount})</option>
          </select>

          {/* Bulk actions bar */}
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-1.5 bg-onyx text-parchment px-2.5 py-1 rounded-lg text-xs animate-in fade-in">
              <span className="font-semibold mr-1">{selectedIds.length} selected</span>
              <button
                onClick={() => {
                  markSent(selectedIds);
                  setSelectedIds([]);
                }}
                className="px-2 py-0.5 rounded bg-emerald-800 hover:bg-emerald-700 text-emerald-200 text-[11px] font-medium"
              >
                Mark as Sent
              </button>
              <button
                onClick={() => {
                  selectedIds.forEach((id) =>
                    updateSubscriber(id, { status: 'pending' }),
                  );
                  setSelectedIds([]);
                  addToast('Marked as Pending', 'info');
                }}
                className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-parchment text-[11px]"
              >
                Mark Pending
              </button>
              <button
                onClick={() => {
                  selectedIds.forEach((id) => deleteSubscriber(id));
                  setSelectedIds([]);
                }}
                className="px-2 py-0.5 rounded bg-red-900/80 hover:bg-red-800 text-red-200 text-[11px]"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Right action buttons: Add Row, Add Column, CSV Import/Export */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleAddNewRow}
            className="h-8.5 px-3 rounded-lg bg-onyx hover:bg-espresso text-parchment text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <PlusIcon size={14} />
            <span>Add Row</span>
          </button>

          <button
            onClick={() => setIsAddingColumn(true)}
            className="h-8.5 px-2.5 rounded-lg bg-white border border-sandbar hover:bg-sandbar/30 text-onyx text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <ColumnsIcon size={13} />
            <span>Add Column</span>
          </button>

          {/* Hidden File input for CSV */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportCsv}
            accept=".csv"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Import subscribers from CSV"
            className="h-8.5 px-2.5 rounded-lg bg-white border border-sandbar hover:bg-sandbar/30 text-onyx text-xs font-medium flex items-center gap-1 transition-colors"
          >
            <UploadIcon size={13} />
            <span className="hidden sm:inline">Import CSV</span>
          </button>

          <button
            onClick={handleExportCsv}
            title="Export full audience table to CSV"
            className="h-8.5 px-2.5 rounded-lg bg-white border border-sandbar hover:bg-sandbar/30 text-onyx text-xs font-medium flex items-center gap-1 transition-colors"
          >
            <DownloadIcon size={13} />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Spreadsheet Table Container */}
      <div className="flex-1 overflow-auto lathala-scroll bg-white">
        <table className="w-full border-collapse text-left select-text">
          {/* Header Row */}
          <thead className="sticky top-0 bg-base/95 backdrop-blur-sm z-10 border-b border-sandbar shadow-sm">
            <tr className="text-[11px] font-semibold uppercase tracking-wider text-espresso/70">
              <th className="w-10 px-3 py-2.5 text-center border-r border-sandbar/50">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  aria-label="Select all"
                  className="rounded border-sandbar accent-accent cursor-pointer"
                />
              </th>
              <th className="w-10 px-2 py-2.5 text-center text-[10px] text-espresso/40 border-r border-sandbar/50 font-mono">
                #
              </th>
              <th className="min-w-[170px] px-3.5 py-2.5 border-r border-sandbar/50">
                Name <span className="font-mono text-[9px] text-accent lowercase">{'{{name}}'}</span>
              </th>
              <th className="min-w-[210px] px-3.5 py-2.5 border-r border-sandbar/50">
                Email <span className="font-mono text-[9px] text-accent lowercase">{'{{email}}'}</span>
              </th>
              <th className="min-w-[140px] px-3.5 py-2.5 border-r border-sandbar/50">
                Role <span className="font-mono text-[9px] text-accent lowercase">{'{{role}}'}</span>
              </th>
              <th className="min-w-[160px] px-3.5 py-2.5 border-r border-sandbar/50">
                Department <span className="font-mono text-[9px] text-accent lowercase">{'{{department}}'}</span>
              </th>
              <th className="min-w-[120px] px-3.5 py-2.5 border-r border-sandbar/50">
                Status
              </th>
              {/* Dynamic custom columns */}
              {customColumns.map((col) => (
                <th key={col.id} className="min-w-[150px] px-3.5 py-2.5 border-r border-sandbar/50 group">
                  <div className="flex items-center justify-between">
                    <div>
                      <span>{col.label}</span>{' '}
                      <span className="font-mono text-[9px] text-accent lowercase">{`{{${col.key}}}`}</span>
                    </div>
                    <button
                      onClick={() => deleteCustomColumn(col.id)}
                      title={`Remove column "${col.label}"`}
                      className="opacity-0 group-hover:opacity-100 text-espresso/40 hover:text-red-600 transition-opacity"
                    >
                      <Trash2Icon size={11} />
                    </button>
                  </div>
                </th>
              ))}
              <th className="w-24 px-3 py-2.5 text-right">Actions</th>
            </tr>
          </thead>

          {/* Body Rows */}
          <tbody className="divide-y divide-sandbar/50 text-xs">
            {filteredRows.map((sub, index) => {
              const dept = departments.find((d) => d.id === sub.departmentId);
              const isChecked = selectedIds.includes(sub.id);

              return (
                <tr
                  key={sub.id}
                  className={`hover:bg-sandbar/15 transition-colors ${
                    isChecked ? 'bg-accent/5' : ''
                  }`}
                >
                  {/* Checkbox */}
                  <td className="px-3 py-2 text-center border-r border-sandbar/40">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSelectOne(sub.id)}
                      className="rounded border-sandbar accent-accent cursor-pointer"
                    />
                  </td>

                  {/* Row index */}
                  <td className="px-2 py-2 text-center text-[10px] text-espresso/40 font-mono border-r border-sandbar/40">
                    {index + 1}
                  </td>

                  {/* Name cell (Inline editable) */}
                  <td className="px-2.5 py-1.5 border-r border-sandbar/40">
                    <input
                      type="text"
                      value={sub.name}
                      onChange={(e) => updateSubscriber(sub.id, { name: e.target.value })}
                      className="w-full bg-transparent px-1.5 py-1 rounded text-xs font-medium text-onyx border border-transparent hover:border-sandbar focus:border-accent focus:bg-white focus:outline-none"
                    />
                  </td>

                  {/* Email cell (Inline editable) */}
                  <td className="px-2.5 py-1.5 border-r border-sandbar/40">
                    <input
                      type="email"
                      value={sub.email}
                      onChange={(e) => updateSubscriber(sub.id, { email: e.target.value })}
                      className="w-full bg-transparent px-1.5 py-1 rounded text-xs text-espresso/85 border border-transparent hover:border-sandbar focus:border-accent focus:bg-white focus:outline-none"
                    />
                  </td>

                  {/* Role cell (Inline editable) */}
                  <td className="px-2.5 py-1.5 border-r border-sandbar/40">
                    <input
                      type="text"
                      value={sub.role}
                      onChange={(e) => updateSubscriber(sub.id, { role: e.target.value })}
                      className="w-full bg-transparent px-1.5 py-1 rounded text-xs text-onyx border border-transparent hover:border-sandbar focus:border-accent focus:bg-white focus:outline-none"
                    />
                  </td>

                  {/* Department Select */}
                  <td className="px-2.5 py-1.5 border-r border-sandbar/40">
                    <div className="relative flex items-center">
                      <select
                        value={sub.departmentId}
                        onChange={(e) => updateSubscriber(sub.id, { departmentId: e.target.value })}
                        className="w-full bg-transparent px-2 py-1 rounded text-xs font-medium border border-transparent hover:border-sandbar focus:border-accent focus:bg-white focus:outline-none cursor-pointer"
                        style={{ color: dept ? dept.color : '#302E2F' }}
                      >
                        <option value="">Unassigned</option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                      {dept && (
                        <span
                          className="h-2 w-2 rounded-full absolute right-2 pointer-events-none"
                          style={{ backgroundColor: dept.color }}
                        />
                      )}
                    </div>
                  </td>

                  {/* Status Cell */}
                  <td className="px-2.5 py-1.5 border-r border-sandbar/40">
                    <button
                      onClick={() =>
                        updateSubscriber(sub.id, {
                          status: sub.status === 'sent' ? 'pending' : 'sent',
                          lastSentAt: sub.status === 'pending' ? new Date().toISOString() : undefined,
                        })
                      }
                      title="Click to toggle status"
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                        sub.status === 'sent'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-sandbar/40 text-espresso border border-sandbar hover:bg-sandbar/70'
                      }`}
                    >
                      {sub.status === 'sent' ? (
                        <>
                          <CheckCircle2Icon size={11} className="text-emerald-700" />
                          <span>Sent</span>
                        </>
                      ) : (
                        <>
                          <ClockIcon size={11} className="text-espresso/60" />
                          <span>Pending</span>
                        </>
                      )}
                    </button>
                  </td>

                  {/* Dynamic Custom Data Cells */}
                  {customColumns.map((col) => {
                    const val = sub.customData ? sub.customData[col.key] ?? '' : '';
                    return (
                      <td key={col.id} className="px-2.5 py-1.5 border-r border-sandbar/40">
                        <input
                          type="text"
                          value={String(val)}
                          onChange={(e) => {
                            const nextCustom = { ...(sub.customData || {}), [col.key]: e.target.value };
                            updateSubscriber(sub.id, { customData: nextCustom });
                          }}
                          placeholder="-"
                          className="w-full bg-transparent px-1.5 py-1 rounded text-xs text-onyx border border-transparent hover:border-sandbar focus:border-accent focus:bg-white focus:outline-none"
                        />
                      </td>
                    );
                  })}

                  {/* Row Actions */}
                  <td className="px-2.5 py-1.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* Preview in Editor / Modal with this subscriber */}
                      <button
                        onClick={() => {
                          setPreviewSubscriberId(sub.id);
                          if (onOpenPreview) {
                            onOpenPreview();
                          } else {
                            setView('editor');
                          }
                          addToast(`Previewing newsletter personalized for ${sub.name}`, 'info');
                        }}
                        title={`Preview active newsletter customized for ${sub.name}`}
                        className="p-1 rounded text-espresso/60 hover:text-accent hover:bg-sandbar/50 transition-colors"
                      >
                        <EyeIcon size={13} />
                      </button>

                      <button
                        onClick={() => deleteSubscriber(sub.id)}
                        title="Delete subscriber"
                        className="p-1 rounded text-espresso/60 hover:text-red-600 hover:bg-sandbar/50 transition-colors"
                      >
                        <Trash2Icon size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredRows.length === 0 && (
          <div className="text-center py-16 px-4">
            <p className="text-sm font-medium text-onyx">No audience records found</p>
            <p className="text-xs text-espresso/60 mt-1 max-w-sm mx-auto">
              Try adjusting your search query or filters, or click "Add Row" to create your first subscriber.
            </p>
            <button
              onClick={handleAddNewRow}
              className="mt-4 px-3.5 py-1.5 rounded-lg bg-onyx text-parchment text-xs font-medium hover:bg-espresso"
            >
              Add New Row
            </button>
          </div>
        )}
      </div>

      {/* Add Custom Column Modal */}
      {isAddingColumn && (
        <div className="fixed inset-0 bg-onyx/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-base border border-sandbar rounded-2xl w-full max-w-md shadow-artboard overflow-hidden">
            <div className="bg-onyx text-parchment px-5 py-4 flex items-center justify-between">
              <h3 className="font-serif text-base font-semibold">Add Spreadsheet Column</h3>
              <button
                onClick={() => setIsAddingColumn(false)}
                className="text-parchment/60 hover:text-parchment text-sm"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateColumn} className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-espresso/70 mb-1">
                  Column Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organization, Discount Code, City, Tier"
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  className="w-full h-9 rounded-lg border border-sandbar bg-white px-3 text-xs text-onyx focus:border-accent focus:outline-none"
                />
                <p className="text-[11px] text-espresso/60 mt-1">
                  This will automatically become a usable newsletter merge tag like{' '}
                  <code className="text-accent bg-sandbar/40 px-1 py-0.5 rounded">
                    {`{{${newColName.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'column_name'}}}`}
                  </code>
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-espresso/70 mb-1">
                  Data Type
                </label>
                <select
                  value={newColType}
                  onChange={(e) => setNewColType(e.target.value as CustomFieldColumn['type'])}
                  className="w-full h-9 rounded-lg border border-sandbar bg-white px-3 text-xs text-onyx focus:border-accent focus:outline-none"
                >
                  <option value="text">Text (General string)</option>
                  <option value="number">Number</option>
                  <option value="tag">Category Tag</option>
                  <option value="link">URL / Web Link</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-sandbar">
                <button
                  type="button"
                  onClick={() => setIsAddingColumn(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-sandbar text-xs text-espresso hover:bg-sandbar/40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-onyx text-parchment text-xs font-medium hover:bg-espresso"
                >
                  Create Column
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
