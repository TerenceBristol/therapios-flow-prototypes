'use client';

interface VOActionToolbarProps {
  selectedCount: number;
  onDokuErfassen: () => void;
  onClear: () => void;
}

export default function VOActionToolbar({ selectedCount, onDokuErfassen, onClear }: VOActionToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      className="sticky top-16 z-30 bg-blue-600 text-white shadow-lg animate-slideDown"
      style={{
        animation: 'slideDown 0.3s ease-out'
      }}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-semibold">
              {selectedCount} VO{selectedCount !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={onDokuErfassen}
              className="px-4 py-2 bg-white text-blue-600 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors"
            >
              Doku erfassen ({selectedCount})
            </button>
          </div>
          <button
            onClick={onClear}
            className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded-md text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear selection
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
