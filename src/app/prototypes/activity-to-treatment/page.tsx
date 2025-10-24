'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Activity, CalendarTreatment, VORecord } from '@/types';
import calendarData from '@/data/calendarData.json';
import therapistVOData from '@/data/therapistVOData.json';
import ActivityCard from '@/components/calendar/ActivityCard';
import TreatmentCard from '@/components/calendar/TreatmentCard';
import ActivityEditModal from '@/components/calendar/ActivityEditModal';
import VOSelectionModal from '@/components/calendar/VOSelectionModal';
import TreatmentEditModal from '@/components/calendar/TreatmentEditModal';

export default function ActivityToTreatmentCalendar() {
  const [activities, setActivities] = useState<Activity[]>(calendarData.activities as Activity[]);
  const [treatments, setTreatments] = useState<CalendarTreatment[]>(
    calendarData.treatments as CalendarTreatment[]
  );

  // Modal states
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isVOSelectionModalOpen, setIsVOSelectionModalOpen] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState<Partial<CalendarTreatment> | null>(null);
  const [isTreatmentModalOpen, setIsTreatmentModalOpen] = useState(false);
  const [isNewFromActivity, setIsNewFromActivity] = useState(false);
  const [activityBeingConverted, setActivityBeingConverted] = useState<Activity | null>(null);

  // Toast state
  const [showToast, setShowToast] = useState(false);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // Get active VOs for therapist S. Zeibig
  const availableVOs = useMemo(() => {
    return (therapistVOData as VORecord[]).filter(
      (vo) => vo.therapist === 'S. Zeibig' && vo.voStatus === 'Aktiv'
    );
  }, []);

  // Week range for calendar (Sept 28 - Oct 4, 2025)
  const weekDays = [
    { date: '2025-09-28', dayName: 'SUN', dayNum: '28' },
    { date: '2025-09-29', dayName: 'MON', dayNum: '29' },
    { date: '2025-09-30', dayName: 'TUE', dayNum: '30' },
    { date: '2025-10-01', dayName: 'WED', dayNum: '01' },
    { date: '2025-10-02', dayName: 'THU', dayNum: '02' },
    { date: '2025-10-03', dayName: 'FRI', dayNum: '03' },
    { date: '2025-10-04', dayName: 'SAT', dayNum: '04' },
  ];

  // Calculate summary statistics
  const { totalBehandlungen, totalAktivitaten } = useMemo(() => {
    const behandlungenMinutes = treatments.reduce((sum, t) => sum + (t.duration || 0), 0);
    const aktivitatenMinutes = activities.reduce((sum, a) => sum + (a.duration || 0), 0);

    return {
      totalBehandlungen: {
        hours: Math.floor(behandlungenMinutes / 60),
        minutes: behandlungenMinutes % 60,
      },
      totalAktivitaten: {
        hours: Math.floor(aktivitatenMinutes / 60),
        minutes: aktivitatenMinutes % 60,
      },
    };
  }, [treatments, activities]);

  // Get activities and treatments for a specific day
  const getItemsForDay = (date: string) => {
    const dayActivities = activities
      .filter((a) => a.date === date)
      .sort((a, b) => a.position - b.position);
    const dayTreatments = treatments
      .filter((t) => t.date === date)
      .sort((a, b) => a.position - b.position);

    const allItems = [
      ...dayActivities.map((a) => ({ type: 'activity' as const, item: a })),
      ...dayTreatments.map((t) => ({ type: 'treatment' as const, item: t })),
    ].sort((a, b) => {
      const aPos = 'position' in a.item ? a.item.position : 0;
      const bPos = 'position' in b.item ? b.item.position : 0;
      return aPos - bPos;
    });

    // Calculate day statistics
    const dayBehandlungenMinutes = dayTreatments.reduce((sum, t) => sum + (t.duration || 0), 0);
    const dayAktivitatenMinutes = dayActivities.reduce((sum, a) => sum + (a.duration || 0), 0);

    return {
      items: allItems,
      stats: {
        behandlungen: {
          hours: Math.floor(dayBehandlungenMinutes / 60),
          minutes: dayBehandlungenMinutes % 60,
        },
        aktivitaten: {
          hours: Math.floor(dayAktivitatenMinutes / 60),
          minutes: dayAktivitatenMinutes % 60,
        },
      },
    };
  };

  // Activity handlers
  const handleActivityClick = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsActivityModalOpen(true);
  };

  const handleActivitySave = (updatedActivity: Activity) => {
    setActivities((prev) =>
      prev.map((a) => (a.id === updatedActivity.id ? updatedActivity : a))
    );
    setIsActivityModalOpen(false);
    setSelectedActivity(null);
  };

  const handleActivityDelete = (activityId: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== activityId));
    setIsActivityModalOpen(false);
    setSelectedActivity(null);
  };

  const handleConvertToTreatment = (activity: Activity) => {
    setActivityBeingConverted(activity);
    setIsActivityModalOpen(false);
    setIsVOSelectionModalOpen(true);
  };

  // VO Selection handler
  const handleVOSelect = (vo: VORecord) => {
    if (!activityBeingConverted) return;

    // Create a new treatment based on the activity and selected VO
    const newTreatment: Partial<CalendarTreatment> = {
      id: `treat-${Date.now()}`,
      type: 'treatment',
      patientName: vo.patientName,
      voNumber: vo.voNumber,
      voId: vo.id,
      date: activityBeingConverted.date,
      duration: 0, // Empty by default as per user requirement
      notes: activityBeingConverted.notes || '', // Pre-populate from activity notes
      behandlungsart: 'Durchgeführt',
      patientRejected: false,
      position: activityBeingConverted.position,
      therapist: activityBeingConverted.therapist,
      behStatus: vo.treatmentStatus,
    };

    setSelectedTreatment(newTreatment);
    setIsNewFromActivity(true);
    setIsVOSelectionModalOpen(false);
    setIsTreatmentModalOpen(true);
  };

  // Treatment handlers
  const handleTreatmentClick = (treatment: CalendarTreatment) => {
    setSelectedTreatment(treatment);
    setIsNewFromActivity(false);
    setIsTreatmentModalOpen(true);
  };

  const handleTreatmentSave = (savedTreatment: CalendarTreatment) => {
    if (isNewFromActivity && activityBeingConverted) {
      // Remove the activity and add the new treatment
      setActivities((prev) => prev.filter((a) => a.id !== activityBeingConverted.id));
      setTreatments((prev) => [...prev, savedTreatment]);
      setActivityBeingConverted(null);

      // Show success toast
      setShowToast(true);
    } else {
      // Update existing treatment
      setTreatments((prev) =>
        prev.map((t) => (t.id === savedTreatment.id ? savedTreatment : t))
      );
    }

    setIsTreatmentModalOpen(false);
    setSelectedTreatment(null);
    setIsNewFromActivity(false);
  };

  const handleTreatmentDelete = (treatmentId: string) => {
    setTreatments((prev) => prev.filter((t) => t.id !== treatmentId));
    setIsTreatmentModalOpen(false);
    setSelectedTreatment(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Therapist Calendar - Activity to Treatment
          </h1>

          {/* Tabs */}
          <div className="flex gap-8 border-b border-gray-200">
            <button className="pb-3 px-1 text-gray-500 hover:text-gray-700 font-medium text-sm">
              Offene VOs (21)
            </button>
            <button className="pb-3 px-1 text-gray-500 hover:text-gray-700 font-medium text-sm">
              Geteilte VOs (6)
            </button>
            <button className="pb-3 px-1 text-gray-500 hover:text-gray-700 font-medium text-sm">
              Abgeschlossene VOs (169)
            </button>
            <button className="pb-3 px-1 border-b-2 border-blue-600 text-blue-600 font-medium text-sm">
              Kalender
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Summary and Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            <span className="font-semibold">September 2025</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-700">
              Behandlungen: {totalBehandlungen.hours}h {totalBehandlungen.minutes}m
            </div>
            <div className="text-sm text-gray-700">
              Aktivitäten: {totalAktivitaten.hours}h {totalAktivitaten.minutes}m
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              Vorh.
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              Heute
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              Nächste
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-blue-900 rounded-lg hover:bg-blue-950">
              Doku erfassen
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="grid grid-cols-7 divide-x divide-gray-200">
            {weekDays.map((day) => {
              const { items, stats } = getItemsForDay(day.date);

              return (
                <div key={day.date} className="min-h-[500px]">
                  {/* Day Header */}
                  <div className="bg-gray-50 border-b border-gray-200 p-3">
                    <div className="text-center">
                      <div className="text-xs font-semibold text-gray-600 uppercase">
                        {day.dayName}
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mt-1">
                        {day.dayNum}
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-600 space-y-1">
                      <div>
                        Behandlungen: {stats.behandlungen.hours}h {stats.behandlungen.minutes}m
                      </div>
                      <div>
                        Aktivitäten: {stats.aktivitaten.hours}h {stats.aktivitaten.minutes}m
                      </div>
                    </div>
                  </div>

                  {/* Day Content */}
                  <div className="p-3">
                    {items.length === 0 ? (
                      <div className="text-center text-sm text-gray-400 mt-8">
                        Keine Einträge
                      </div>
                    ) : (
                      items.map((item) =>
                        item.type === 'activity' ? (
                          <ActivityCard
                            key={`activity-${item.item.id}`}
                            activity={item.item as Activity}
                            onClick={() => handleActivityClick(item.item as Activity)}
                            availableVOs={availableVOs}
                          />
                        ) : (
                          <TreatmentCard
                            key={`treatment-${item.item.id}`}
                            treatment={item.item as CalendarTreatment}
                            onClick={() => handleTreatmentClick(item.item as CalendarTreatment)}
                          />
                        )
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ActivityEditModal
        activity={selectedActivity}
        isOpen={isActivityModalOpen}
        onClose={() => {
          setIsActivityModalOpen(false);
          setSelectedActivity(null);
        }}
        onSave={handleActivitySave}
        onDelete={handleActivityDelete}
        onConvertToTreatment={handleConvertToTreatment}
      />

      <VOSelectionModal
        isOpen={isVOSelectionModalOpen}
        onClose={() => {
          setIsVOSelectionModalOpen(false);
          setActivityBeingConverted(null);
        }}
        onSelectVO={handleVOSelect}
        availableVOs={availableVOs}
      />

      <TreatmentEditModal
        treatment={selectedTreatment}
        isOpen={isTreatmentModalOpen}
        onClose={() => {
          setIsTreatmentModalOpen(false);
          setSelectedTreatment(null);
          setIsNewFromActivity(false);
          setActivityBeingConverted(null);
        }}
        onSave={handleTreatmentSave}
        onDelete={handleTreatmentDelete}
        isNewFromActivity={isNewFromActivity}
      />

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-fade-in">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span className="font-medium">Activity successfully converted to treatment</span>
        </div>
      )}
    </div>
  );
}

