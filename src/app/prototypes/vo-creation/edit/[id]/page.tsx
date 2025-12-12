'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { VOForm, VO } from '@/components/vo-creation/VOForm';
import { SuccessState } from '@/components/vo-creation/SuccessState';
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
import practicesDataJson from '@/data/practicesData.json';
import { Practice } from '@/types';

const STORAGE_KEY = 'vo-creation-prototype-data';

interface PrototypeData {
  vos: VO[];
  therapists: Therapist[];
  patients: Patient[];
  arzte: Arzt[];
  practices: Practice[];
  einrichtungen: { id: string; name: string; short_name?: string; type?: string }[];
}

export default function EditVOPage() {
  const router = useRouter();
  const params = useParams();
  const voId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<PrototypeData | null>(null);
  const [currentVO, setCurrentVO] = useState<VO | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [savedVONumber, setSavedVONumber] = useState('');
  const [showImageSidebar, setShowImageSidebar] = useState(true);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

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
        let loadedData: PrototypeData;

        if (stored) {
          loadedData = JSON.parse(stored);
          // Ensure practices exists (migration for existing sessions)
          if (!loadedData.practices) {
            loadedData.practices = practicesDataJson as Practice[];
          }
        } else {
          loadedData = {
            vos: voDataJson as VO[],
            therapists: therapistsDataJson as Therapist[],
            patients: patientsDataJson as Patient[],
            arzte: arzteDataJson as Arzt[],
            practices: practicesDataJson as Practice[],
            einrichtungen: einrichtungenDataJson,
          };
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(loadedData));
        }

        setData(loadedData);

        // Find the VO to edit
        const vo = loadedData.vos.find(v => v.id === voId);
        if (vo) {
          setCurrentVO(vo);
        }
      } catch {
        const fallbackData = {
          vos: voDataJson as VO[],
          therapists: therapistsDataJson as Therapist[],
          patients: patientsDataJson as Patient[],
          arzte: arzteDataJson as Arzt[],
          practices: practicesDataJson as Practice[],
          einrichtungen: einrichtungenDataJson,
        };
        setData(fallbackData);
        const vo = fallbackData.vos.find(v => v.id === voId);
        if (vo) {
          setCurrentVO(vo);
        }
      }
      setIsLoading(false);
    };

    loadData();
  }, [voId]);

  const saveData = (newData: PrototypeData) => {
    setData(newData);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    } catch {
      // Ignore storage errors
    }
  };

  const handleSave = (voData: Omit<VO, 'id' | 'created_at' | 'created_by'>) => {
    if (!data || !currentVO) return;

    const updatedVO: VO = {
      ...voData,
      id: currentVO.id,
      created_at: currentVO.created_at,
      created_by: currentVO.created_by,
    };

    // Update parent VO's fvo_status if this is a Folge-VO
    let updatedVOs = data.vos.map(v => (v.id === currentVO.id ? updatedVO : v));

    if (voData.parent_vo_id && voData.parent_vo_id !== currentVO.parent_vo_id) {
      // New parent VO link
      updatedVOs = updatedVOs.map(v => {
        if (v.id === voData.parent_vo_id) {
          return { ...v, fvo_status: 'Erhalten', fvo_nummer: voData.rez_rezept_nummer };
        }
        return v;
      });
    }

    saveData({ ...data, vos: updatedVOs });
    setSavedVONumber(voData.rez_rezept_nummer);
    setShowSuccess(true);
  };

  const handleCreateTherapist = (therapistData: Omit<Therapist, 'id' | 'rolle' | 'allow_fvo_ordering'>) => {
    if (!data) return;

    const newTherapist: Therapist = {
      ...therapistData,
      id: `t-${Date.now()}`,
      rolle: 'ROLE_THERAPIST',
      allow_fvo_ordering: true,
    };

    saveData({ ...data, therapists: [...data.therapists, newTherapist] });
  };

  const handleCreatePatient = (patientData: Omit<Patient, 'id'>) => {
    if (!data) return;

    const newPatient: Patient = {
      ...patientData,
      id: `p-${Date.now()}`,
    };

    saveData({ ...data, patients: [...data.patients, newPatient] });
  };

  const handleCreateArzt = (arztData: Omit<Arzt, 'id'>) => {
    if (!data) return;

    const newArzt: Arzt = {
      ...arztData,
      id: `a-${Date.now()}`,
    };

    saveData({ ...data, arzte: [...data.arzte, newArzt] });
  };

  const handleCancel = () => {
    router.push('/prototypes/vo-creation');
  };

  const handleReturnToDashboard = () => {
    router.push('/prototypes/vo-creation');
  };

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted-foreground">Laden...</div>
      </div>
    );
  }

  if (!currentVO) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">VO nicht gefunden</h2>
          <p className="text-muted-foreground mb-4">Die angeforderte Verordnung existiert nicht.</p>
          <button
            onClick={handleReturnToDashboard}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Zurück zum Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="py-8">
        <SuccessState
          voNumber={savedVONumber}
          mode="edit"
          onCreateAnother={() => {}} // Not used for edit mode
          onReturnToDashboard={handleReturnToDashboard}
        />
      </div>
    );
  }

  // Get patient name for header
  const patient = data.patients.find(p => p.id === currentVO.patient_id);
  const patientName = patient ? `${patient.pat_vorname} ${patient.pat_nachname}` : 'Unbekannt';

  return (
    <div className="flex">
      {/* Main Content */}
      <div className={`${showImageSidebar ? 'w-1/2' : 'flex-1'} overflow-y-auto`}>
        <div className="max-w-3xl mx-auto px-6 py-8">
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
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                VO {currentVO.rez_rezept_nummer} bearbeiten
              </h1>
              <p className="text-muted-foreground mt-1">
                Patient: {patientName}
              </p>
            </div>
          </div>

          {/* Form */}
          <VOForm
            mode="edit"
            initialVO={currentVO}
            therapists={data.therapists}
            patients={data.patients}
            arzte={data.arzte}
            practices={data.practices}
            einrichtungen={data.einrichtungen}
            vos={data.vos}
            heilmittelCatalog={heilmittelDataJson as Heilmittel[]}
            onSave={handleSave}
            onCancel={handleCancel}
            existingVONumbers={data.vos.filter(v => v.id !== currentVO.id).map(v => v.rez_rezept_nummer)}
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
