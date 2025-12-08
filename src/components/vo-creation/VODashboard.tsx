'use client';

import React, { useState, useMemo } from 'react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [einrichtungFilter, setEinrichtungFilter] = useState<string>('');
  const [therapeutFilter, setTherapeutFilter] = useState<string>('');
  const [arztFilter, setArztFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Get patient by ID helper
  const getPatient = (id: string) => patients.find(p => p.id === id);

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
        const patient = getPatient(v.patient_id);
        return (
          v.rez_rezept_nummer.toLowerCase().includes(lowerSearch) ||
          (patient && `${patient.pat_vorname} ${patient.pat_nachname}`.toLowerCase().includes(lowerSearch)) ||
          (v.rez_icd_10_code && v.rez_icd_10_code.toLowerCase().includes(lowerSearch))
        );
      });
    }

    return result;
  }, [tabFilteredVOs, statusFilter, einrichtungFilter, therapeutFilter, arztFilter, searchTerm]);

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
        </div>
      </div>

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
