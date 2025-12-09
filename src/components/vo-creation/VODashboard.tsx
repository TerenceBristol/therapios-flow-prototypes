'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { VOTable } from './VOTable';
import { VO } from './VOForm';
import { Therapist } from './TherapistModal';
import { Patient } from './PatientModal';
import { Arzt } from './ArztModal';

interface Einrichtung {
  id: string;
  name: string;
  short_name?: string;
  type?: string;
}

interface VODashboardProps {
  vos: VO[];
  therapists: Therapist[];
  patients: Patient[];
  arzte: Arzt[];
  einrichtungen: Einrichtung[];
  onEdit: (vo: VO) => void;
  onCreate: () => void;
}

function CreateFromImageModal({
  isOpen,
  onClose,
  onUpload,
}: {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
}) {
  const [dragActive, setDragActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    setIsAnalyzing(true);
    // Small delay then call onUpload which handles the rest
    setTimeout(() => {
      onUpload(file);
    }, 2000);
  };

  const handleAreaClick = () => {
    if (!isAnalyzing) {
      inputRef.current?.click();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">VO aus Bild erstellen</h3>
          {!isAnalyzing && (
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {isAnalyzing ? (
          <div className="py-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
            <p className="text-gray-700 font-medium">AI is analyzing the prescription.</p>
            <p className="text-gray-500 text-sm mt-1">Please wait.</p>
          </div>
        ) : (
          <>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                dragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary hover:bg-gray-50'
              }`}
              onClick={handleAreaClick}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleChange}
              />
              <div className="flex flex-col items-center gap-2">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-gray-600">
                  Bild hierher ziehen oder <span className="text-primary font-medium">auswählen</span>
                </p>
                <p className="text-xs text-gray-400">PNG, JPG bis 10MB</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                Abbrechen
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

type TabType = 'fvo_erhalten' | 'keine_fvo' | 'fertig_behandelt' | 'arztbericht' | 'alle';

const TABS: { key: TabType; label: string }[] = [
  { key: 'fvo_erhalten', label: 'F.-VO erhalten' },
  { key: 'keine_fvo', label: 'Keine Folge-VO' },
  { key: 'fertig_behandelt', label: 'Fertig behandelt' },
  { key: 'arztbericht', label: 'Arztbericht zu versenden' },
  { key: 'alle', label: 'Alle VOs' },
];

const STATUS_OPTIONS = ['Aktiv', 'Abgelaufen', 'Archiviert', 'Abgerechnet', 'Abgebrochen', 'Fertig behandelt'];
const ITEMS_PER_PAGE = 10;

export function VODashboard({
  vos,
  therapists,
  patients,
  arzte,
  einrichtungen,
  onEdit,
  onCreate,
}: VODashboardProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [einrichtungFilter, setEinrichtungFilter] = useState<string>('');
  const [therapeutFilter, setTherapeutFilter] = useState<string>('');
  const [arztFilter, setArztFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Create VO dropdown state
  const [isCreateDropdownOpen, setIsCreateDropdownOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const createDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (createDropdownRef.current && !createDropdownRef.current.contains(event.target as Node)) {
        setIsCreateDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateFromImage = (_file: File) => {
    // For prototype: just set a flag instead of storing the actual image
    // This avoids QuotaExceededError for large images
    sessionStorage.setItem('temp-vo-upload-flag', 'true');
    router.push('/prototypes/vo-creation/create?fromUpload=true');
    setIsUploadModalOpen(false);
  };

  // All VOs (tabs are display-only, showing counts but not filtering)
  const tabFilteredVOs = vos;

  // Apply additional filters
  const filteredVOs = useMemo(() => {
    let result = tabFilteredVOs;

    // Status filter
    if (statusFilter) {
      result = result.filter(v => v.rez_rezeptstatus === statusFilter);
    }

    // Einrichtung filter
    if (einrichtungFilter) {
      result = result.filter(v => v.einrichtung_id === einrichtungFilter);
    }

    // Therapeut filter
    if (therapeutFilter) {
      result = result.filter(v => v.therapist_id === therapeutFilter);
    }

    // Arzt filter
    if (arztFilter) {
      result = result.filter(v => v.arzt_id === arztFilter);
    }

    // Search filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(v => {
        const patient = patients.find(p => p.id === v.patient_id);
        return (
          v.rez_rezept_nummer.toLowerCase().includes(lowerSearch) ||
          (patient && `${patient.pat_vorname} ${patient.pat_nachname}`.toLowerCase().includes(lowerSearch)) ||
          (v.rez_icd_10_code && v.rez_icd_10_code.toLowerCase().includes(lowerSearch))
        );
      });
    }

    return result;
  }, [tabFilteredVOs, statusFilter, einrichtungFilter, therapeutFilter, arztFilter, searchTerm, patients]);

  // Pagination
  const totalPages = Math.ceil(filteredVOs.length / ITEMS_PER_PAGE);
  const paginatedVOs = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredVOs.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredVOs, currentPage]);

  // Tab counts
  const tabCounts = useMemo(() => ({
    fvo_erhalten: vos.filter(v => v.fvo_status === 'Erhalten').length,
    keine_fvo: vos.filter(v => !v.parent_vo_id && v.fvo_status === 'Bestellen').length,
    fertig_behandelt: vos.filter(v => v.beh_completed >= v.beh_total && v.beh_total > 0).length,
    arztbericht: vos.filter(v => v.rez_therapiebericht === 'Ja').length,
    alle: vos.length,
  }), [vos]);

  const clearFilters = () => {
    setStatusFilter('');
    setEinrichtungFilter('');
    setTherapeutFilter('');
    setArztFilter('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex items-start justify-between gap-8">
        {/* Left: Welcome + Title */}
        <div>
          <p className="text-muted-foreground mb-1">Hallo Super Admin, ich hoffe, Du hast einen wundervollen Tag.</p>
          <h1 className="text-2xl font-bold text-foreground">Dashboard - Verwaltung</h1>
        </div>

        {/* Right: Filters + Search */}
        <div className="flex flex-col items-end gap-2">
          {/* Filter dropdowns row */}
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary min-w-[140px]"
            >
              <option value="">VO Status</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>

            <select
              value={einrichtungFilter}
              onChange={(e) => { setEinrichtungFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary min-w-[140px]"
            >
              <option value="">ER: (Auswählen)</option>
              {einrichtungen.map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>

            <select
              value={therapeutFilter}
              onChange={(e) => { setTherapeutFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary min-w-[160px]"
            >
              <option value="">Therapeut: (Auswählen)</option>
              {therapists.map((t) => (
                <option key={t.id} value={t.id}>{t.vorname} {t.nachname}</option>
              ))}
            </select>

            <select
              value={arztFilter}
              onChange={(e) => { setArztFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary min-w-[140px]"
            >
              <option value="">Arzt: (Auswählen)</option>
              {arzte.map((a) => (
                <option key={a.id} value={a.id}>{a.arzt_vorname} {a.arzt_nachname}</option>
              ))}
            </select>
          </div>

          {/* Search box with icon */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder="Suchen"
              className="pl-10 pr-4 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary w-[200px]"
            />
          </div>
          
          {/* Create VO Button with Dropdown */}
          <div className="relative mt-2" ref={createDropdownRef}>
            <button
              onClick={() => setIsCreateDropdownOpen(!isCreateDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              VO erstellen
              <svg className={`w-4 h-4 transition-transform ${isCreateDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isCreateDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-border z-10 overflow-hidden">
                <button
                  onClick={() => {
                    setIsCreateDropdownOpen(false);
                    onCreate();
                  }}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-muted flex items-center gap-3 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div>
                    <span className="block font-medium text-foreground">Manuell erstellen</span>
                    <span className="block text-xs text-muted-foreground">Formular ausfüllen</span>
                  </div>
                </button>
                <div className="border-t border-border my-0"></div>
                <button
                  onClick={() => {
                    setIsCreateDropdownOpen(false);
                    setIsUploadModalOpen(true);
                  }}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-muted flex items-center gap-3 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <span className="block font-medium text-foreground">Aus Bild erstellen</span>
                    <span className="block text-xs text-muted-foreground">Automatisch ausfüllen</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <CreateFromImageModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        onUpload={handleCreateFromImage} 
      />

      {/* Tabs (display-only indicators) */}
      <div className="border-b border-border">
        <nav className="flex gap-6" aria-label="Tabs">
          {TABS.map((tab) => (
            <span
              key={tab.key}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                tab.key === 'alle'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground'
              }`}
            >
              {tab.label}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                tab.key === 'alle' ? 'bg-primary/10' : 'bg-muted'
              }`}>
                {tabCounts[tab.key]}
              </span>
            </span>
          ))}
        </nav>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {filteredVOs.length} Verordnungen gefunden
        {selectedIds.length > 0 && (
          <span className="ml-2">
            ({selectedIds.length} ausgewählt)
          </span>
        )}
      </div>

      {/* Table */}
      <div className="bg-background border border-border rounded-lg overflow-hidden">
        <VOTable
          vos={paginatedVOs}
          therapists={therapists}
          patients={patients}
          arzte={arzte}
          einrichtungen={einrichtungen}
          onEdit={onEdit}
          selectedIds={selectedIds}
          onSelectChange={setSelectedIds}
        />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Zeige {((currentPage - 1) * ITEMS_PER_PAGE) + 1} bis {Math.min(currentPage * ITEMS_PER_PAGE, filteredVOs.length)} von {filteredVOs.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
            >
              Zurück
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-md text-sm ${
                      currentPage === pageNum
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border border-border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
            >
              Weiter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default VODashboard;
