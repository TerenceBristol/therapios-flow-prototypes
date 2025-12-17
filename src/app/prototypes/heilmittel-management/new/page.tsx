'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import HeilmittelForm from '@/components/heilmittel/HeilmittelForm';
import { Heilmittel } from '@/types';

// Import mock data for fallback
import heilmittelDataJson from '@/data/heilmittelData.json';

const STORAGE_KEY = 'heilmittel-management-data';

export default function NewHeilmittelPage() {
  const router = useRouter();

  const handleSave = (data: Heilmittel) => {
    try {
      // Get current data from session storage
      const stored = sessionStorage.getItem(STORAGE_KEY);
      const currentData = stored ? JSON.parse(stored) : { heilmittel: heilmittelDataJson };

      // Add new heilmittel
      currentData.heilmittel = [...currentData.heilmittel, data];

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
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
