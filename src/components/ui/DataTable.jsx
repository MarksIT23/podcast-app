import { useState } from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';

/**
 * DataTable — sortable, selectable table with actions slot.
 * Props: columns [{key, label, sortable?, render?}], data[], onSort?, onSelect?, actions?, className?
 */
export default function DataTable({
  columns = [],
  data = [],
  onRowClick,
  actions,
  sortable = true,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  emptyMessage = 'No data found.',
  className = '',
}) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = (key) => {
    if (!sortable) return;
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sorted = [...data].sort((a, b) => {
    if (!sortKey) return 0;
    const aVal = a[sortKey] ?? '';
    const bVal = b[sortKey] ?? '';
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    }
    return sortDir === 'asc'
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

  const toggleSelect = (id) => {
    if (!onSelectionChange) return;
    const next = selectedIds.includes(id)
      ? selectedIds.filter((i) => i !== id)
      : [...selectedIds, id];
    onSelectionChange(next);
  };

  const toggleAll = () => {
    if (!onSelectionChange) return;
    if (selectedIds.length === data.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(data.map((r) => r.id));
    }
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--text-tertiary)]">
        <p className="text-body">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-[var(--color-border)]">
            {selectable && (
              <th className="pb-3 pr-3 w-10">
                <input
                  type="checkbox"
                  checked={selectedIds.length === data.length && data.length > 0}
                  onChange={toggleAll}
                  className="accent-[var(--color-accent-purple)]"
                  aria-label="Select all rows"
                />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                className={`pb-3 pr-4 text-caption text-[var(--text-tertiary)] font-medium ${
                  col.sortable !== false && sortable ? 'cursor-pointer select-none hover:text-[var(--text-primary)]' : ''
                } ${col.className || ''}`}
                onClick={() => col.sortable !== false && sortable && handleSort(col.key)}
                scope="col"
                aria-sort={
                  sortKey === col.key
                    ? sortDir === 'asc' ? 'ascending' : 'descending'
                    : undefined
                }
              >
                <div className="flex items-center gap-1">
                  {col.label}
                  {col.sortable !== false && sortable && (
                    <span className="text-[var(--text-tertiary)]" aria-hidden="true">
                      {sortKey === col.key ? (
                        sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                      ) : (
                        <ChevronsUpDown size={12} />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
            {actions && <th className="pb-3 w-16" scope="col"><span className="sr-only">Actions</span></th>}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr
              key={row.id}
              className={`border-b border-[var(--color-border)]/50 last:border-0 transition-colors ${
                onRowClick ? 'cursor-pointer hover:bg-[var(--color-surface-hover)]' : ''
              }`}
              onClick={() => onRowClick?.(row)}
            >
              {selectable && (
                <td className="py-3 pr-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(row.id)}
                    onChange={() => toggleSelect(row.id)}
                    className="accent-[var(--color-accent-purple)]"
                    aria-label={`Select row ${row.id}`}
                  />
                </td>
              )}
              {columns.map((col) => (
                <td key={col.key} className={`py-3 pr-4 text-small ${col.cellClass || ''}`}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
              {actions && (
                <td className="py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  {actions(row)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
