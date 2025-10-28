import React from 'react';

interface TableActionButtonsProps {
  onView: () => void;
  onEdit: () => void;
}

const TableActionButtons: React.FC<TableActionButtonsProps> = ({ onView, onEdit }) => {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onView();
        }}
        className="p-2 hover:bg-muted rounded-md transition-colors text-foreground"
        title="View details"
        aria-label="View"
      >
        👁️
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        className="p-2 hover:bg-muted rounded-md transition-colors text-foreground"
        title="Edit"
        aria-label="Edit"
      >
        ✏️
      </button>
    </div>
  );
};

export default TableActionButtons;
