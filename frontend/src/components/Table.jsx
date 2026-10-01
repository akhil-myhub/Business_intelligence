'use client';

import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';

// Sortable table. columns: [{ key, label, render?(row), sortable?, align? }]
export function DataTable({ columns, rows, initialSort, rowKey = r => r.name, onRow, empty = 'No data for this selection.' }) {
  const [sort, setSort] = useState(initialSort ?? null);
  const sorted = useMemo(() => {
    if (!sort) return rows;
    const dir = sort.dir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const x = a[sort.key], y = b[sort.key];
      return typeof x === 'string' ? x.localeCompare(y) * dir : (x - y) * dir;
    });
  }, [rows, sort]);

  const toggle = key => setSort(s => (s?.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' }));

  if (!rows.length) return <p className="empty">{empty}</p>;
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th aria-label="rank">#</th>
            {columns.map(c => {
              const active = sort?.key === c.key;
              return (
                <th key={c.key} style={{ textAlign: c.align }} aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}>
                  {c.sortable === false ? c.label : (
                    <button className="th-btn" onClick={() => toggle(c.key)}>
                      {c.label}
                      {active ? (sort.dir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ChevronsUpDown size={12} className="dim" />}
                    </button>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((r, i) => (
            <tr key={rowKey(r)} onClick={onRow ? () => onRow(r) : undefined} className={onRow ? 'clickable' : undefined}>
              <td>{i + 1}</td>
              {columns.map(c => <td key={c.key} style={{ textAlign: c.align }} className={c.tone?.(r)}>{c.render ? c.render(r) : r[c.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
