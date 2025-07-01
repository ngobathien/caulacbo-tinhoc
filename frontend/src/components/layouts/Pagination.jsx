import React from "react";

function Pagination({ currentPage, totalPages, onPageChange, className = "" }) {
  if (totalPages <= 1) return null;

  let pages = [];
  let start = Math.max(1, currentPage - 2);
  let end = Math.min(totalPages, currentPage + 2);

  if (currentPage <= 3) {
    end = Math.min(5, totalPages);
  }
  if (currentPage >= totalPages - 2) {
    start = Math.max(1, totalPages - 4);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className={`flex justify-center mt-6 gap-1 flex-wrap ${className}`}>
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={`px-3 py-1 rounded border ${
          currentPage === 1
            ? "bg-gray-200 text-gray-500"
            : "bg-white hover:bg-blue-50"
        }`}
      >
        &lt;
      </button>
      {start > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="px-3 py-1 rounded border bg-white hover:bg-blue-50"
          >
            1
          </button>
          {start > 2 && <span className="px-1">...</span>}
        </>
      )}
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`px-3 py-1 rounded border ${
            p === currentPage
              ? "bg-blue-500 text-white font-bold"
              : "bg-white hover:bg-blue-50"
          }`}
        >
          {p}
        </button>
      ))}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-1">...</span>}
          <button
            onClick={() => onPageChange(totalPages)}
            className="px-3 py-1 rounded border bg-white hover:bg-blue-50"
          >
            {totalPages}
          </button>
        </>
      )}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className={`px-3 py-1 rounded border ${
          currentPage === totalPages
            ? "bg-gray-200 text-gray-500"
            : "bg-white hover:bg-blue-50"
        }`}
      >
        &gt;
      </button>
    </div>
  );
}

export default Pagination;
