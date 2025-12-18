'use client';

import React, { useState } from 'react';
import { Heilmittel, HeilmittelKind, HeilmittelBereich, TariffHistoryEntry } from '@/types';
import TariffEditor from './TariffEditor';
import TariffHistoryModal from './TariffHistoryModal';

interface HeilmittelFormProps {
  heilmittel?: Heilmittel;
  isEdit: boolean;
  onSave: (data: Heilmittel) => void;
  onCancel: () => void;
}

interface TariffModalState {
  isOpen: boolean;
  tariffName: string;
  history: TariffHistoryEntry[];
  currentValue: number;
}

const HeilmittelForm: React.FC<HeilmittelFormProps> = ({
  heilmittel,
  isEdit,
  onSave,
  onCancel
}) => {
  // Form state
  const [kurzzeichen, setKurzzeichen] = useState(heilmittel?.kurzzeichen || '');
  const [bezeichnung, setBezeichnung] = useState(heilmittel?.bezeichnung || '');
  const [duration, setDuration] = useState<string>(heilmittel?.duration?.toString() || '');
  const [bereich, setBereich] = useState<HeilmittelBereich>(heilmittel?.bereich || 'PT');
  const [kind, setKind] = useState<HeilmittelKind>(heilmittel?.kind || 'treatment');
  const [bv, setBv] = useState(heilmittel?.bv || false);
  const [isArchived, setIsArchived] = useState(heilmittel?.isArchived || false);
  const [textBestellung, setTextBestellung] = useState(heilmittel?.textBestellung || '');

  // Tariff values and histories
  const [tar1, setTar1] = useState(heilmittel?.tar1 || 0);
  const [tar10, setTar10] = useState(heilmittel?.tar10 || 0);
  const [tar11, setTar11] = useState(heilmittel?.tar11 || 0);
  const [tar12, setTar12] = useState(heilmittel?.tar12 || 0);
  const [tar1History, setTar1History] = useState<TariffHistoryEntry[]>(heilmittel?.tar1History || []);
  const [tar10History, setTar10History] = useState<TariffHistoryEntry[]>(heilmittel?.tar10History || []);
  const [tar11History, setTar11History] = useState<TariffHistoryEntry[]>(heilmittel?.tar11History || []);
  const [tar12History, setTar12History] = useState<TariffHistoryEntry[]>(heilmittel?.tar12History || []);

  // Modal state
  const [historyModal, setHistoryModal] = useState<TariffModalState>({
    isOpen: false,
    tariffName: '',
    history: [],
    currentValue: 0
  });

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!kurzzeichen.trim()) {
      newErrors.kurzzeichen = 'Kurzzeichen is required';
    }

    if (!bezeichnung.trim()) {
      newErrors.bezeichnung = 'Bezeichnung is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Mock current user for audit trail
  const currentUser = 'Max M.';

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const now = new Date().toISOString();
    const data: Heilmittel = {
      id: heilmittel?.id || `hm-${kurzzeichen.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`,
      kurzzeichen: kurzzeichen.trim(),
      bezeichnung: bezeichnung.trim(),
      duration: duration ? parseInt(duration) : null,
      bereich,
      kind,
      bv,
      textBestellung: textBestellung.trim(),
      tar1,
      tar10,
      tar11,
      tar12,
      tar1History,
      tar10History,
      tar11History,
      tar12History,
      // Archive status - update archivedAt/By when status changes
      isArchived,
      archivedAt: isArchived && !heilmittel?.isArchived ? now : (isArchived ? heilmittel?.archivedAt : undefined),
      archivedBy: isArchived && !heilmittel?.isArchived ? currentUser : (isArchived ? heilmittel?.archivedBy : undefined),
      // Audit trail
      lastEditedAt: now,
      lastEditedBy: currentUser,
      createdAt: heilmittel?.createdAt || now,
      createdBy: heilmittel?.createdBy || currentUser
    };

    onSave(data);
  };

  const handleTariffUpdate = (
    tariffKey: 'tar1' | 'tar10' | 'tar11' | 'tar12',
    newValue: number,
    effectiveDate: string
  ) => {
    const now = new Date().toISOString();
    const today = new Date().toISOString().split('T')[0];
    const newEntry: TariffHistoryEntry = {
      id: `hist-${kurzzeichen}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      value: newValue,
      effectiveDate,
      changedAt: now,
      changedBy: currentUser
    };

    // Update history and current value if effective date is today or earlier
    switch (tariffKey) {
      case 'tar1':
        setTar1History(prev => [...prev, newEntry]);
        if (effectiveDate <= today) setTar1(newValue);
        break;
      case 'tar10':
        setTar10History(prev => [...prev, newEntry]);
        if (effectiveDate <= today) setTar10(newValue);
        break;
      case 'tar11':
        setTar11History(prev => [...prev, newEntry]);
        if (effectiveDate <= today) setTar11(newValue);
        break;
      case 'tar12':
        setTar12History(prev => [...prev, newEntry]);
        if (effectiveDate <= today) setTar12(newValue);
        break;
    }
  };

  const openHistoryModal = (tariffName: string, history: TariffHistoryEntry[], currentValue: number) => {
    setHistoryModal({
      isOpen: true,
      tariffName,
      history,
      currentValue
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border bg-background">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {isEdit ? 'Edit Heilmittel' : 'New Heilmittel'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {isEdit ? `Edit details for ${kurzzeichen}` : 'Create a new Heilmittel'}
              </p>
              {/* Audit trail display */}
              {isEdit && heilmittel && (
                <p className="text-xs text-muted-foreground mt-2">
                  {heilmittel.lastEditedAt ? (
                    <>Last edited by {heilmittel.lastEditedBy} on {formatDate(heilmittel.lastEditedAt)}</>
                  ) : heilmittel.createdAt ? (
                    <>Created by {heilmittel.createdBy} on {formatDate(heilmittel.createdAt)}</>
                  ) : null}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="p-2 hover:bg-muted rounded-md transition-colors text-foreground"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Basic Information Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-4">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Kurzzeichen */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Kurzzeichen <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={kurzzeichen}
                  onChange={(e) => setKurzzeichen(e.target.value.toUpperCase())}
                  disabled={isEdit}
                  placeholder="e.g. KG, BGM"
                  className={`w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                    isEdit ? 'bg-muted cursor-not-allowed' : ''
                  } ${errors.kurzzeichen ? 'border-red-500' : 'border-border'}`}
                />
                {errors.kurzzeichen && (
                  <p className="mt-1 text-sm text-red-500">{errors.kurzzeichen}</p>
                )}
              </div>

              {/* Bezeichnung */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Bezeichnung <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={bezeichnung}
                  onChange={(e) => setBezeichnung(e.target.value)}
                  placeholder="Full description"
                  className={`w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.bezeichnung ? 'border-red-500' : 'border-border'
                  }`}
                />
                {errors.bezeichnung && (
                  <p className="mt-1 text-sm text-red-500">{errors.bezeichnung}</p>
                )}
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 20, 30, 45"
                  min="0"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Bereich */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Bereich
                </label>
                <select
                  value={bereich}
                  onChange={(e) => setBereich(e.target.value as HeilmittelBereich)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="PT">PT</option>
                  <option value="ERGO">ERGO</option>
                  <option value="SSSST">SSSST</option>
                </select>
              </div>

              {/* Kind */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Kind
                </label>
                <select
                  value={kind}
                  onChange={(e) => setKind(e.target.value as HeilmittelKind)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="treatment">Treatment</option>
                  <option value="fee">Fee</option>
                  <option value="passiv">Passiv</option>
                </select>
              </div>

              {/* BV */}
              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bv}
                    onChange={(e) => setBv(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-foreground">Blanko Verordnung (BV)</span>
                </label>
              </div>

              {/* Archived */}
              {isEdit && (
                <div className="flex flex-col">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isArchived}
                      onChange={(e) => setIsArchived(e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-foreground">Archived</span>
                  </label>
                  <p className="text-xs text-muted-foreground mt-1 ml-6">
                    Archived items are hidden from active lists
                  </p>
                </div>
              )}
            </div>

            {/* Text_Bestellung */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-foreground mb-1">
                Text_Bestellung
              </label>
              <textarea
                value={textBestellung}
                onChange={(e) => setTextBestellung(e.target.value)}
                placeholder="Order text"
                rows={2}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>
          </div>

          {/* Tariffs Section */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Tariffs</h3>
            <div className="grid grid-cols-2 gap-4">
              <TariffEditor
                tariffName="Tar. 1"
                currentValue={tar1}
                history={tar1History}
                onUpdate={(value, date) => handleTariffUpdate('tar1', value, date)}
                onViewHistory={() => openHistoryModal('Tar. 1', tar1History, tar1)}
              />
              <TariffEditor
                tariffName="Tar. 10"
                currentValue={tar10}
                history={tar10History}
                onUpdate={(value, date) => handleTariffUpdate('tar10', value, date)}
                onViewHistory={() => openHistoryModal('Tar. 10', tar10History, tar10)}
              />
              <TariffEditor
                tariffName="Tar. 11"
                currentValue={tar11}
                history={tar11History}
                onUpdate={(value, date) => handleTariffUpdate('tar11', value, date)}
                onViewHistory={() => openHistoryModal('Tar. 11', tar11History, tar11)}
              />
              <TariffEditor
                tariffName="Tar. 12"
                currentValue={tar12}
                history={tar12History}
                onUpdate={(value, date) => handleTariffUpdate('tar12', value, date)}
                onViewHistory={() => openHistoryModal('Tar. 12', tar12History, tar12)}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-background">
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              {isEdit ? 'Save' : 'Create'}
            </button>
          </div>
        </div>
      </form>

      {/* History Modal */}
      {historyModal.isOpen && (
        <TariffHistoryModal
          tariffName={historyModal.tariffName}
          kurzzeichen={kurzzeichen}
          history={historyModal.history}
          currentValue={historyModal.currentValue}
          onClose={() => setHistoryModal(prev => ({ ...prev, isOpen: false }))}
        />
      )}
    </>
  );
};

export default HeilmittelForm;
