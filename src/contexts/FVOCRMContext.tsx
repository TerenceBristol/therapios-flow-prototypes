'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  Practice,
  PracticeDoctor,
  PracticeVO,
  PracticeActivity,
  PracticeFollowUp,
  Therapist,
  Facility
} from '@/types';
import mockData from '@/data/fvoCRMData.json';

// Context value interface
export interface FVOCRMContextValue {
  // Data
  practices: Practice[];
  doctors: PracticeDoctor[];
  vos: PracticeVO[];
  activities: PracticeActivity[];
  followUps: PracticeFollowUp[];
  therapists: Therapist[];
  facilities: Facility[];

  // Practice CRUD
  updatePractice: (id: string, data: Partial<Practice>) => void;
  getPracticeById: (id: string) => Practice | undefined;

  // Doctor CRUD
  updateDoctor: (id: string, data: Partial<PracticeDoctor>) => void;
  getDoctorById: (id: string) => PracticeDoctor | undefined;

  // VO CRUD
  updateVO: (id: string, updates: Partial<PracticeVO>) => void;
  bulkUpdateVOs: (ids: string[], updates: Partial<PracticeVO>) => void;
  getVOById: (id: string) => PracticeVO | undefined;

  // Activity CRUD
  addActivity: (activity: Omit<PracticeActivity, 'id' | 'createdAt'>) => void;
  deleteActivity: (activityId: string) => void;
  getActivitiesForPractice: (practiceId: string) => PracticeActivity[];
  resolveActivity: (activityId: string, resolvedBy: string, resolutionNotes?: string) => void;

  // Follow-up CRUD
  addFollowUp: (followUp: Omit<PracticeFollowUp, 'id' | 'completed' | 'createdAt'>) => void;
  deleteFollowUp: (followUpId: string) => void;
  getFollowUpsForPractice: (practiceId: string) => PracticeFollowUp[];
  completeFollowUp: (followUpId: string, completionNotes?: string) => void;

  // Therapist helpers
  getTherapistById: (id: string) => Therapist | undefined;
  getTherapistsByFacility: (facilityId: string) => Therapist[];

  // Facility helpers
  getFacilityById: (id: string) => Facility | undefined;
  getFacilityByName: (name: string) => Facility | undefined;
}

// Create context with undefined default (will throw error if used outside provider)
export const FVOCRMContext = createContext<FVOCRMContextValue | undefined>(undefined);

// Provider props
interface FVOCRMProviderProps {
  children: ReactNode;
}

export function FVOCRMProvider({ children }: FVOCRMProviderProps) {
  // Initialize state from mock data
  const [practices, setPractices] = useState<Practice[]>(mockData.practices as Practice[]);
  const [doctors, setDoctors] = useState<PracticeDoctor[]>(mockData.doctors as PracticeDoctor[]);
  const [vos, setVOs] = useState<PracticeVO[]>(mockData.vos as PracticeVO[]);
  const [activities, setActivities] = useState<PracticeActivity[]>(mockData.activities as PracticeActivity[]);
  const [followUps, setFollowUps] = useState<PracticeFollowUp[]>((mockData.followUps as unknown as PracticeFollowUp[]) || []);
  const [therapists, setTherapists] = useState<Therapist[]>(mockData.therapists as Therapist[]);
  const [facilities, setFacilities] = useState<Facility[]>(mockData.facilities as Facility[]);

  // ========== Practice CRUD ==========

  const updatePractice = useCallback((id: string, data: Partial<Practice>) => {
    setPractices(prev => prev.map(practice =>
      practice.id === id
        ? { ...practice, ...data, updatedAt: new Date().toISOString() }
        : practice
    ));
  }, []);

  const getPracticeById = useCallback((id: string) => {
    return practices.find(p => p.id === id);
  }, [practices]);

  // ========== Doctor CRUD ==========

  const updateDoctor = useCallback((id: string, data: Partial<PracticeDoctor>) => {
    setDoctors(prev => prev.map(doctor =>
      doctor.id === id
        ? { ...doctor, ...data, updatedAt: new Date().toISOString() }
        : doctor
    ));
  }, []);

  const getDoctorById = useCallback((id: string) => {
    return doctors.find(d => d.id === id);
  }, [doctors]);

  // ========== VO CRUD ==========

  const updateVO = useCallback((id: string, updates: Partial<PracticeVO>) => {
    setVOs(prev => prev.map(vo => {
      if (vo.id !== id) return vo;

      const updated = { ...vo, ...updates };

      // If status changed, update timestamp and formatted date
      if (updates.status && updates.status !== vo.status) {
        const now = new Date();
        updated.statusTimestamp = now.toISOString();
        updated.statusDate = now.toLocaleDateString('de-DE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      }

      return updated;
    }));
  }, []);

  const bulkUpdateVOs = useCallback((ids: string[], updates: Partial<PracticeVO>) => {
    setVOs(prev => prev.map(vo => {
      if (!ids.includes(vo.id)) return vo;

      const updated = { ...vo, ...updates };

      // If status changed, update timestamp and formatted date
      if (updates.status && updates.status !== vo.status) {
        const now = new Date();
        updated.statusTimestamp = now.toISOString();
        updated.statusDate = now.toLocaleDateString('de-DE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      }

      return updated;
    }));
  }, []);

  const getVOById = useCallback((id: string) => {
    return vos.find(v => v.id === id);
  }, [vos]);

  // ========== Activity CRUD ==========

  const addActivity = useCallback((activity: Omit<PracticeActivity, 'id' | 'createdAt'>) => {
    const newActivity: PracticeActivity = {
      ...activity,
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };

    setActivities(prev => [...prev, newActivity]);
  }, []);

  const deleteActivity = useCallback((activityId: string) => {
    setActivities(prev => prev.filter(activity => activity.id !== activityId));
  }, []);

  const getActivitiesForPractice = useCallback((practiceId: string) => {
    return activities
      .filter(a => a.practiceId === practiceId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [activities]);

  const resolveActivity = useCallback((activityId: string, resolvedBy: string, resolutionNotes?: string) => {
    setActivities(prev => prev.map(activity => {
      if (activity.id !== activityId) return activity;

      // If resolution notes provided, append to existing notes
      const updatedNotes = resolutionNotes
        ? `${activity.notes}\n\nResolution: ${resolutionNotes}`
        : activity.notes;

      return {
        ...activity,
        notes: updatedNotes,
        issueStatus: 'resolved' as const,
        resolvedAt: new Date().toISOString(),
        resolvedBy
      };
    }));
  }, []);

  // ========== Follow-up CRUD ==========

  const addFollowUp = useCallback((followUp: Omit<PracticeFollowUp, 'id' | 'completed' | 'createdAt'>) => {
    const newFollowUp: PracticeFollowUp = {
      ...followUp,
      id: `fu-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      completed: false,
      createdAt: new Date().toISOString()
    };

    setFollowUps(prev => [...prev, newFollowUp]);
  }, []);

  const deleteFollowUp = useCallback((followUpId: string) => {
    setFollowUps(prev => prev.filter(followUp => followUp.id !== followUpId));
  }, []);

  const getFollowUpsForPractice = useCallback((practiceId: string) => {
    return followUps.filter(f => f.practiceId === practiceId);
  }, [followUps]);

  const completeFollowUp = useCallback((followUpId: string, completionNotes?: string) => {
    // Find the follow-up
    const followUp = followUps.find(f => f.id === followUpId);
    if (!followUp) return;

    const completedAt = new Date().toISOString();
    const completedBy = 'user-002'; // Mock: current user completing the follow-up

    // Mark follow-up as completed
    setFollowUps(prev => prev.map(f =>
      f.id === followUpId
        ? { ...f, completed: true, completedAt, completedBy }
        : f
    ));

    // Combine follow-up notes with completion notes if provided
    const activityNotes = completionNotes
      ? `${followUp.notes}\n\nCompletion: ${completionNotes}`
      : followUp.notes;

    // Auto-create activity from the completed follow-up
    const newActivity: PracticeActivity = {
      id: followUpId, // Use same ID so we can track it came from this follow-up
      practiceId: followUp.practiceId,
      date: new Date().toISOString(),
      notes: activityNotes,
      userId: followUp.userId, // Original scheduler
      createdAt: new Date().toISOString(),
      isIssue: false,
      completedAt, // When follow-up was completed
      completedBy, // Who completed it (may differ from scheduler)
    };

    setActivities(prev => [...prev, newActivity]);
  }, [followUps]);

  // ========== Therapist Helpers ==========

  const getTherapistById = useCallback((id: string) => {
    return therapists.find(t => t.id === id);
  }, [therapists]);

  const getTherapistsByFacility = useCallback((facilityId: string) => {
    return therapists.filter(t => t.facilityId === facilityId);
  }, [therapists]);

  // ========== Facility Helpers ==========

  const getFacilityById = useCallback((id: string) => {
    return facilities.find(f => f.id === id);
  }, [facilities]);

  const getFacilityByName = useCallback((name: string) => {
    return facilities.find(f => f.name === name);
  }, [facilities]);

  // Context value
  const value: FVOCRMContextValue = {
    // Data
    practices,
    doctors,
    vos,
    activities,
    followUps,
    therapists,
    facilities,

    // Practice CRUD
    updatePractice,
    getPracticeById,

    // Doctor CRUD
    updateDoctor,
    getDoctorById,

    // VO CRUD
    updateVO,
    bulkUpdateVOs,
    getVOById,

    // Activity CRUD
    addActivity,
    deleteActivity,
    getActivitiesForPractice,
    resolveActivity,

    // Follow-up CRUD
    addFollowUp,
    deleteFollowUp,
    getFollowUpsForPractice,
    completeFollowUp,

    // Therapist helpers
    getTherapistById,
    getTherapistsByFacility,

    // Facility helpers
    getFacilityById,
    getFacilityByName
  };

  return (
    <FVOCRMContext.Provider value={value}>
      {children}
    </FVOCRMContext.Provider>
  );
}

// Custom hook to use the context
export function useFVOCRM() {
  const context = useContext(FVOCRMContext);
  if (context === undefined) {
    throw new Error('useFVOCRM must be used within a FVOCRMProvider');
  }
  return context;
}
