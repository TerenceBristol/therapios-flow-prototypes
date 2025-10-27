import React from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  resultCount: number;
  totalCount: number;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, resultCount, totalCount }) => {
  const handleClear = () => {
    onChange('');
  };

  return (
    <div className="mb-4">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search practices..."
          className="w-full px-4 py-2 pr-10 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        )}
      </div>
      {value && (
        <div className="mt-2 text-sm text-muted-foreground">
          Showing {resultCount} of {totalCount} practices
        </div>
      )}
    </div>
  );
};

export default SearchBar;
