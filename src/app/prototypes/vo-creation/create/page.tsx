'use client';

import React, { Suspense, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { VOForm, VO } from '@/components/vo-creation/VOForm';
import { ImageSidebar } from '@/components/vo-creation/ImageSidebar';
import { Therapist } from '@/components/vo-creation/TherapistModal';
import { Patient } from '@/components/vo-creation/PatientModal';
import { Arzt } from '@/components/vo-creation/ArztModal';
import { Heilmittel } from '@/components/vo-creation/TreatmentRow';

// Import mock data for initialization
import voDataJson from '@/data/voCreationData.json';
import therapistsDataJson from '@/data/therapistsData.json';
import patientsDataJson from '@/data/patientsData.json';
import arzteDataJson from '@/data/arzteData.json';
import einrichtungenDataJson from '@/data/einrichtungenData.json';
import heilmittelDataJson from '@/data/heilmittelCatalog.json';

const STORAGE_KEY = 'vo-creation-prototype-data';

interface PrototypeData {
  vos: VO[];
  therapists: Therapist[];
  patients: Patient[];
  arzte: Arzt[];
  einrichtungen: { id: string; name: string; short_name?: string; type?: string }[];
}

function CreateVOContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Pre-population from query params (from VO Upload integration)
  const preVoNumber = searchParams.get('voNumber') || '';
  const preTherapistId = searchParams.get('therapistId') || '';
  const preImageUrl = searchParams.get('imageUrl') || '';

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<PrototypeData | null>(null);
  const [showImageSidebar, setShowImageSidebar] = useState(true);
  const [uploadedImage, setUploadedImage] = useState<string | null>(preImageUrl || null);

  // Handle image upload from sidebar
  const handleImageUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setUploadedImage(result);
    };
    reader.readAsDataURL(file);
  }, []);

  // Load data from sessionStorage or initialize
  useEffect(() => {
    const loadData = () => {
      try {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        if (stored) {
          setData(JSON.parse(stored));
        } else {
          const initialData: PrototypeData = {
            vos: voDataJson as VO[],
            therapists: therapistsDataJson as Therapist[],
            patients: patientsDataJson as Patient[],
            arzte: arzteDataJson as Arzt[],
            einrichtungen: einrichtungenDataJson,
          };
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
          setData(initialData);
        }
      } catch {
        setData({
          vos: voDataJson as VO[],
          therapists: therapistsDataJson as Therapist[],
          patients: patientsDataJson as Patient[],
          arzte: arzteDataJson as Arzt[],
          einrichtungen: einrichtungenDataJson,
        });
      }
      setIsLoading(false);
    };

    loadData();
  }, []);

  const saveData = (newData: PrototypeData) => {
    setData(newData);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    } catch {
      // Ignore storage errors
    }
  };

  const handleSave = (voData: Omit<VO, 'id' | 'created_at' | 'created_by'>) => {
    if (!data) return;

    const newVO: VO = {
      ...voData,
      id: `vo-${Date.now()}`,
      created_at: new Date().toISOString(),
      created_by: 'By Admin',
    };

    // Update parent VO's fvo_status if this is a Folge-VO
    let updatedVOs = [...data.vos, newVO];
    if (voData.parent_vo_id) {
      updatedVOs = updatedVOs.map(v => {
        if (v.id === voData.parent_vo_id) {
          return { ...v, fvo_status: 'Erhalten', fvo_nummer: voData.rez_rezept_nummer };
        }
        return v;
      });
    }

    saveData({ ...data, vos: updatedVOs });
    router.push(`/prototypes/vo-creation?success=created&voNumber=${encodeURIComponent(voData.rez_rezept_nummer)}`);
  };

  const handleCancel = () => {
    router.push('/prototypes/vo-creation');
  };

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted-foreground">Laden...</div>
      </div>
    );
  }

  return (
    <div className="flex">
      {/* Main Content */}
      <div className={`flex-1 ${showImageSidebar ? 'pr-4' : ''}`}>
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Zurück zum Dashboard
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Neue Verordnung erstellen</h1>
                <p className="text-muted-foreground mt-1">
                  Füllen Sie alle erforderlichen Felder aus, um eine neue VO zu erstellen.
                </p>
              </div>
              <button
                onClick={() => setShowImageSidebar(!showImageSidebar)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {showImageSidebar ? 'Bild ausblenden' : 'Bild anzeigen'}
              </button>
            </div>
          </div>

          {/* Form */}
          <VOForm
            mode="create"
            therapists={data.therapists}
            patients={data.patients}
            arzte={data.arzte}
            einrichtungen={data.einrichtungen}
            vos={data.vos}
            heilmittelCatalog={heilmittelDataJson as Heilmittel[]}
            onSave={handleSave}
            onCancel={handleCancel}
            existingVONumbers={data.vos.map(v => v.rez_rezept_nummer)}
            initialVoNumber={preVoNumber}
            initialTherapistId={preTherapistId}
          />
        </div>
      </div>

      {/* Image Sidebar */}
      <ImageSidebar
        imageUrl={uploadedImage}
        onImageUpload={handleImageUpload}
        onClose={() => setShowImageSidebar(false)}
        isOpen={showImageSidebar}
      />
    </div>
  );
}

export default function CreateVOPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="text-muted-foreground">Laden...</div></div>}>
      <CreateVOContent />
    </Suspense>
  );
}
