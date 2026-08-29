import React from 'react';

/**
 * Shared admin table shell. `columns` is an array of header labels
 * (strings, or { label, className } for alignment/visibility).
 */
export const AdminTable = ({ columns, minWidth = 700, children }) => (
  <div className="bg-surface border border-line rounded-2xl overflow-x-auto">
    <table className="w-full text-left border-collapse" style={{ minWidth }}>
      <thead>
        <tr className="bg-surface-2 border-b border-line text-muted text-xs uppercase tracking-widest font-bold">
          {columns.map((c, i) => {
            const label = typeof c === 'string' ? c : c.label;
            const className = typeof c === 'string' ? '' : c.className || '';
            return <th key={i} className={`p-4 font-medium ${className}`}>{label}</th>;
          })}
        </tr>
      </thead>
      <tbody className="divide-y divide-line">{children}</tbody>
    </table>
  </div>
);

export const EmptyRow = ({ colSpan, children = 'Nothing to show.' }) => (
  <tr>
    <td colSpan={colSpan} className="p-8 text-center text-muted">{children}</td>
  </tr>
);

export default AdminTable;
