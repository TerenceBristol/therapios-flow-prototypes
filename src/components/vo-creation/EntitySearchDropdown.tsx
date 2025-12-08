'use client';

import React, { useState, useRef, useEffect } from 'react';

interface EntitySearchDropdownProps<T> {
  label: string;
  placeholder: string;
  entities: T[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreateNew?: () => void;
  displayField: (entity: T) => string;
  searchFields: (keyof T)[];
  getId: (entity: T) => string;
  disabled?: boolean;
  required?: boolean;
  createNewLabel?: string;
}

export function EntitySearchDropdown<T>({
  label,
  placeholder,
  entities,
  selectedId,
  onSelect,
  onCreateNew,
  displayField,
  searchFields,
  getId,
  disabled = false,
  required = false,
  createNewLabel = 'Create New',
}: EntitySearchDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get selected entity display text
  const selectedEntity = entities.find((e) => getId(e) === selectedId);
  const displayText = selectedEntity ? displayField(selectedEntity) : '';

  // Filter entities based on search term
  const filteredEntities = entities.filter((entity) => {
    if (!searchTerm) return true;
    const lowerSearch = searchTerm.toLowerCase();
    return searchFields.some((field) => {
      const value = entity[field];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(lowerSearch);
      }
      if (typeof value === 'number') {
        return value.toString().includes(lowerSearch);
      }
      return false;
    });
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputFocus = () => {
    if (!disabled) {
      setIsOpen(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (!isOpen) setIsOpen(true);
  };

  const handleSelect = (entity: T) => {
    onSelect(getId(entity));
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    onSelect('');
    setSearchTerm('');
    inputRef.current?.focus();
  };

  const handleCreateNew = () => {
    if (onCreateNew) {
      onCreateNew();
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-sm font-medium text-foreground mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            placeholder={selectedId ? displayText : placeholder}
            value={isOpen ? searchTerm : (selectedId ? displayText : '')}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            disabled={disabled}
            className={`w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary pr-8 ${
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            } ${selectedId && !isOpen ? 'text-foreground' : ''}`}
          />

          {/* Dropdown arrow */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg
              className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Clear button when selected */}
          {selectedId && !isOpen && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-6 flex items-center pr-2 text-muted-foreground hover:text-foreground"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {onCreateNew && (
          <button
            type="button"
            onClick={handleCreateNew}
            disabled={disabled}
            className="px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium whitespace-nowrap disabled:opacity-50"
          >
            {createNewLabel}
          </button>
        )}
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredEntities.length > 0 ? (
            filteredEntities.map((entity) => (
              <button
                key={getId(entity)}
                type="button"
                onClick={() => handleSelect(entity)}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors ${
                  getId(entity) === selectedId ? 'bg-muted font-medium' : ''
                }`}
              >
                {displayField(entity)}
              </button>
            ))
          ) : (
            <div className="px-3 py-4 text-center text-sm text-muted-foreground">
              <p>No results found.</p>
              {onCreateNew && (
                <button
                  type="button"
                  onClick={handleCreateNew}
                  className="mt-2 text-primary hover:underline"
                >
                  Create new?
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default EntitySearchDropdown;
