'use client';

import React, { Suspense, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { VOForm, VO } from '@/components/vo-creation/VOForm';
import { ImageSidebar } from '@/components/vo-creation/ImageSidebar';
import { Therapist } from '@/components/vo-creation/TherapistModal';
import { Patient } from '@/components/vo-creation/PatientModal';
import { Arzt } from '@/components/vo-creation/ArztModal';
import { Treatment, Heilmittel } from '@/components/vo-creation/TreatmentRow';

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
  const fromUpload = searchParams.get('fromUpload') === 'true';

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<PrototypeData | null>(null);
  const [showImageSidebar, setShowImageSidebar] = useState(true);
  const [uploadedImage, setUploadedImage] = useState<string | null>(preImageUrl || null);
  
  // State for mocked OCR data
  const [mockVoNumber, setMockVoNumber] = useState(preVoNumber);
  const [mockTherapistId, setMockTherapistId] = useState(preTherapistId);
  const [mockPatientId, setMockPatientId] = useState('');
  const [mockArztId, setMockArztId] = useState('');
  const [mockIcd10Code, setMockIcd10Code] = useState('');
  const [mockEinrichtungId, setMockEinrichtungId] = useState('');
  const [mockTreatments, setMockTreatments] = useState<Treatment[] | undefined>(undefined);

  // Track if mock data is ready (for fromUpload flow)
  const [mockDataReady, setMockDataReady] = useState(!fromUpload);

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

  // Handle fromUpload logic (use placeholder image and mock OCR)
  useEffect(() => {
    if (fromUpload && data) {
      // 1. Check for upload flag and use placeholder image
      const uploadFlag = sessionStorage.getItem('temp-vo-upload-flag');
      if (uploadFlag) {
        // Use a placeholder prescription image (SVG data URL)
        const placeholderSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500">
          <rect fill="#f8f9fa" width="400" height="500"/>
          <rect fill="#e9ecef" x="20" y="20" width="360" height="60" rx="4"/>
          <text x="200" y="55" text-anchor="middle" fill="#6c757d" font-family="Arial" font-size="14">Kassenärztliche Vereinigung Berlin</text>
          <rect fill="#fff" x="20" y="100" width="360" height="380" rx="4" stroke="#dee2e6"/>
          <text x="40" y="130" fill="#212529" font-family="Arial" font-size="12" font-weight="bold">Verordnung (Muster 13)</text>
          <line x1="40" y1="145" x2="360" y2="145" stroke="#dee2e6"/>
          <text x="40" y="170" fill="#6c757d" font-family="Arial" font-size="10">Patient:</text>
          <rect fill="#e9ecef" x="100" y="155" width="200" height="20" rx="2"/>
          <text x="40" y="210" fill="#6c757d" font-family="Arial" font-size="10">ICD-10:</text>
          <rect fill="#e9ecef" x="100" y="195" width="80" height="20" rx="2"/>
          <text x="40" y="250" fill="#6c757d" font-family="Arial" font-size="10">Heilmittel:</text>
          <rect fill="#e9ecef" x="100" y="235" width="150" height="20" rx="2"/>
          <text x="40" y="290" fill="#6c757d" font-family="Arial" font-size="10">Anzahl:</text>
          <rect fill="#e9ecef" x="100" y="275" width="50" height="20" rx="2"/>
          <text x="200" y="420" text-anchor="middle" fill="#adb5bd" font-family="Arial" font-size="11">[Hochgeladenes Rezept]</text>
        </svg>`;
        const encodedSvg = btoa(unescape(encodeURIComponent(placeholderSvg)));
        setUploadedImage(`data:image/svg+xml;base64,${encodedSvg}`);
        // Clear the flag
        sessionStorage.removeItem('temp-vo-upload-flag');
      }

      // 2. Mock "OCR" / Prefill all fields
      // Generate random VO Number
      if (!mockVoNumber) {
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        setMockVoNumber(`${randomNum}-1`);
      }

      // Pick random therapist
      if (!mockTherapistId && data.therapists.length > 0) {
        const randomTherapist = data.therapists[Math.floor(Math.random() * data.therapists.length)];
        setMockTherapistId(randomTherapist.id);
      }

      // Pick random patient
      if (!mockPatientId && data.patients.length > 0) {
        const randomPatient = data.patients[Math.floor(Math.random() * data.patients.length)];
        setMockPatientId(randomPatient.id);
      }

      // Pick random doctor
      if (!mockArztId && data.arzte.length > 0) {
        const randomArzt = data.arzte[Math.floor(Math.random() * data.arzte.length)];
        setMockArztId(randomArzt.id);
      }

      // Pick random ICD code from common ones
      if (!mockIcd10Code) {
        const mockIcdCodes = ['G20', 'G35', 'G82.12', 'R26.0', 'F03.G', 'M41.9', 'Z96.64', 'R47.0', 'G81.9'];
        const randomIcd = mockIcdCodes[Math.floor(Math.random() * mockIcdCodes.length)];
        setMockIcd10Code(randomIcd);
      }

      // Pick random facility
      if (!mockEinrichtungId && data.einrichtungen.length > 0) {
        const randomEinrichtung = data.einrichtungen[Math.floor(Math.random() * data.einrichtungen.length)];
        setMockEinrichtungId(randomEinrichtung.id);
      }

      // Generate mock treatment
      if (!mockTreatments) {
        const treatmentCodes = ['KG-H', 'KG-ZNS-H', 'MLD60-H', 'STIMM-H', 'SPRECH-H'];
        const frequencies = ['1x Woche', '2x Woche', '3x Woche'];
        const randomCode = treatmentCodes[Math.floor(Math.random() * treatmentCodes.length)];
        const randomFreq = frequencies[Math.floor(Math.random() * frequencies.length)];
        const randomAnzahl = Math.floor(6 + Math.random() * 25); // 6-30 treatments

        setMockTreatments([
          {
            id: `tr-mock-${Date.now()}`,
            heilmittel_code: randomCode,
            anzahl: randomAnzahl,
            frequenz: randomFreq,
          },
          { id: `tr-${Date.now()}-2`, heilmittel_code: '', anzahl: 0, frequenz: '' },
        ]);
      }

      // Mark mock data as ready so VOForm can render with pre-filled values
      setMockDataReady(true);
    }
  }, [fromUpload, data]);

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

  if (isLoading || !data || !mockDataReady) {
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
            initialVoNumber={mockVoNumber}
            initialTherapistId={mockTherapistId}
            initialPatientId={mockPatientId}
            initialArztId={mockArztId}
            initialIcd10Code={mockIcd10Code}
            initialEinrichtungId={mockEinrichtungId}
            initialTreatments={mockTreatments}
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
