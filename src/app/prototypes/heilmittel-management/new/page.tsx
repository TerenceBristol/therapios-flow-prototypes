'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HeilmittelForm from '@/components/heilmittel/HeilmittelForm';
import { Heilmittel } from '@/types';

// Import mock data for fallback
import heilmittelDataJson from '@/data/heilmittelData.json';

const STORAGE_KEY = 'heilmittel-management-data';

// Normalize IDs to numbers (fixes stale sessionStorage with old string IDs)
const normalizeHeilmittelIds = (data: Heilmittel[]): Heilmittel[] =>
  data.map((h, index) => ({
    ...h,
    id: typeof h.id === 'number' ? h.id : index + 1
  }));

export default function NewHeilmittelPage() {
  const router = useRouter();
  const [allHeilmittel, setAllHeilmittel] = useState<Heilmittel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load all heilmittel for validation
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      const rawData = stored ? JSON.parse(stored) : { heilmittel: heilmittelDataJson };

      // Normalize IDs to numbers (fixes stale sessionStorage with old string IDs)
      const normalizedData = normalizeHeilmittelIds(rawData.heilmittel || []);
      setAllHeilmittel(normalizedData);
    } catch {
      const normalizedData = normalizeHeilmittelIds(heilmittelDataJson as Heilmittel[]);
      setAllHeilmittel(normalizedData);
    }
    setIsLoading(false);
  }, []);

  const handleSave = (data: Heilmittel) => {
    try {
      // Get current data from session storage
      const stored = sessionStorage.getItem(STORAGE_KEY);
      const currentData = stored ? JSON.parse(stored) : { heilmittel: heilmittelDataJson };

      // Generate new numeric ID (max existing ID + 1)
      const maxId = currentData.heilmittel.reduce((max: number, h: Heilmittel) => Math.max(max, h.id), 0);
      const newId = maxId + 1;

      // Add new heilmittel with generated ID
      const newHeilmittel = {
        ...data,
        id: newId
      };
      currentData.heilmittel = [...currentData.heilmittel, newHeilmittel];

      // Save to session storage
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(currentData));

      // Navigate back to list
      router.push('/prototypes/heilmittel-management');
    } catch (error) {
      console.error('Error saving heilmittel:', error);
    }
  };

  const handleCancel = () => {
    router.push('/prototypes/heilmittel-management');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border bg-background">
        <button
          onClick={() => router.push('/prototypes/heilmittel-management')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Overview
        </button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-hidden">
        <HeilmittelForm
          isEdit={false}
          allHeilmittel={allHeilmittel}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
