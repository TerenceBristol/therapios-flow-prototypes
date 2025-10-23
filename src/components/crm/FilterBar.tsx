'use client';

import React, { useState, useRef, useEffect } from 'react';

interface FilterBarProps {
  // ER filter (primary)
  selectedER: string;
  erOptions: string[];
  onERChange: (er: string) => void;
  // Actions
  showHelperText: boolean;
  showFVOActionsButton: boolean;
  fvoActionsEnabled: boolean;
  onFVOActionsClick: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  selectedER,
  erOptions,
  onERChange,
  showHelperText,
  showFVOActionsButton,
  fvoActionsEnabled,
  onFVOActionsClick
}) => {
  const [isERDropdownOpen, setIsERDropdownOpen] = useState(false);
  const [erSearchTerm, setErSearchTerm] = useState('');
  
  const erDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (erDropdownRef.current && !erDropdownRef.current.contains(event.target as Node)) {
        setIsERDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleERSelect = (er: string) => {
    onERChange(er);
    setIsERDropdownOpen(false);
    setErSearchTerm('');
  };

  const filteredERs = erOptions.filter(er =>
    er.toLowerCase().includes(erSearchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="filter-bar-with-actions">
        {/* Left Side Filters */}
        <div className="filter-bar-left">
          {/* Spalten anzeigen - Static Filter */}
          <div className="filter-group">
            <div className="dropdown-container">
              <button
                className="dropdown-button dropdown-button-disabled"
                disabled
                type="button"
              >
                <span className="dropdown-text">Spalten anzeigen</span>
              </button>
            </div>
          </div>

          {/* ER Dropdown (Primary Filter) */}
          <div className="filter-group" ref={erDropdownRef}>
            <div className="dropdown-container">
              <button
                className="dropdown-button"
                onClick={() => setIsERDropdownOpen(!isERDropdownOpen)}
                type="button"
              >
                <span className="dropdown-text">
                  {selectedER === 'All ERs' ? 'ER (Auswählen)' : selectedER}
                </span>
                <span className="dropdown-arrow">▼</span>
              </button>
              
              {isERDropdownOpen && (
                <div className="dropdown-menu">
                  <input
                    type="text"
                    className="dropdown-search"
                    placeholder="Search ERs..."
                    value={erSearchTerm}
                    onChange={(e) => setErSearchTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  
                  <div className="dropdown-options">
                    {filteredERs.map((er) => (
                      <button
                        key={er}
                        className={`dropdown-option ${er === selectedER ? 'selected' : ''}`}
                        onClick={() => handleERSelect(er)}
                        type="button"
                      >
                        {er === 'All ERs' ? 'ER (Auswählen)' : er}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - F.VO Actions Button */}
        <div className="filter-bar-right">
          {/* F.VO Actions Button */}
          {showFVOActionsButton && (
            <button
              className="fvo-actions-button"
              onClick={onFVOActionsClick}
              disabled={!fvoActionsEnabled}
              type="button"
            >
              F.VO Actions
            </button>
          )}
        </div>
      </div>

      {/* Helper Text */}
      {showHelperText && (
        <div className="filter-helper-text">
          Please Select an ER and check at least one VO to do F.VO Actions
        </div>
      )}
    </div>
  );
};

export default FilterBar;