import React from 'react';
import '../styles/components.css';

export default function Pagination({ page, pageSize, total, onChange }) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const pages = [];
  const delta = 2;
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        className="pagination__btn"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        ← Prev
      </button>

      <div className="pagination__pages">
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="pagination__ellipsis">…</span>
          ) : (
            <button
              key={p}
              className={`pagination__page ${p === page ? 'pagination__page--active' : ''}`}
              onClick={() => onChange(p)}
            >
              {p}
            </button>
          )
        )}
      </div>

      <button
        className="pagination__btn"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        Next →
      </button>
    </nav>
  );
}