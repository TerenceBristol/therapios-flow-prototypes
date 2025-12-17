'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import HeilmittelForm from '@/components/heilmittel/HeilmittelForm';
import { Heilmittel } from '@/types';

// Import mock data for fallback
import heilmittelDataJson from '@/data/heilmittelData.json';

const STORAGE_KEY = 'heilmittel-management-data';

const formatDateTime = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function EditHeilmittelPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [heilmittel, setHeilmittel] = useState<Heilmittel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadData = () => {
      try {
        // Get data from session storage or use JSON data
        const stored = sessionStorage.getItem(STORAGE_KEY);
        const data = stored ? JSON.parse(stored) : { heilmittel: heilmittelDataJson };

        // Find the heilmittel by ID
        const found = data.heilmittel.find((h: Heilmittel) => h.id === id);

        if (found) {
          setHeilmittel(found);
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error('Error loading heilmittel:', error);
        setNotFound(true);
      }
      setIsLoading(false);
    };

    loadData();
  }, [id]);

  const handleSave = (data: Heilmittel) => {
    try {
      // Get current data from session storage
      const stored = sessionStorage.getItem(STORAGE_KEY);
      const currentData = stored ? JSON.parse(stored) : { heilmittel: heilmittelDataJson };

      // Update the heilmittel with updatedAt timestamp
      const updatedData = {
        ...data,
        updatedAt: new Date().toISOString()
      };

      currentData.heilmittel = currentData.heilmittel.map((h: Heilmittel) =>
        h.id === id ? updatedData : h
      );

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

  if (notFound) {
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

        {/* Not Found Message */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-xl font-bold text-foreground mb-2">Heilmittel not found</h2>
            <p className="text-muted-foreground mb-4">
              The Heilmittel with ID &quot;{id}&quot; was not found.
            </p>
            <button
              onClick={() => router.push('/prototypes/heilmittel-management')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Back to Overview
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border bg-background">
        <button
          onClick={() => router.push('/prototypes/heilmittel-management')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Overview
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Edit: {heilmittel?.kurzzeichen}
            </h1>
            {heilmittel?.updatedAt && (
              <p className="text-sm text-muted-foreground mt-1">
                Last edited: {formatDateTime(heilmittel.updatedAt)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-hidden">
        <HeilmittelForm
          heilmittel={heilmittel!}
          isEdit={true}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
