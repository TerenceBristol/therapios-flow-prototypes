/**
 * Therapist statistics calculation utilities for FVO CRM
 */

import { PracticeVO, TherapistStats, Therapist, Facility, PracticeDoctor, Practice } from '@/types';

// Configurable thresholds for therapist volume detection
export const THERAPIST_THRESHOLDS = {
  critical: 2,  // < 2 VOs is critical
  low: 5,       // < 5 VOs is low volume
};

/**
 * Calculate therapist statistics from VOs
 * Aggregates VOs by therapistId for reporting and filtering
 *
 * @param therapists - Array of all therapists
 * @param facilities - Array of all facilities
 * @param vos - Array of all VOs
 * @param timeWindowDays - Number of days to look back (null = all time)
 * @returns Array of therapist stats sorted by pending VO count (ascending)
 */
export function calculateTherapistStats(
  therapists: Therapist[],
  facilities: Facility[],
  vos: PracticeVO[],
  timeWindowDays: number | null = null
): TherapistStats[] {
  // Filter VOs by time window if specified
  let filteredVOs = vos;
  if (timeWindowDays !== null) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeWindowDays);

    filteredVOs = vos.filter(vo => {
      const voDate = new Date(vo.createdAt);
      return voDate >= cutoffDate;
    });
  }

  // Group VOs by therapistId
  const therapistMap = new Map<string, {
    vos: PracticeVO[];
    practices: Set<string>;
    lastVODate?: string;
  }>();

  filteredVOs.forEach(vo => {
    if (!vo.therapistId) return; // Skip VOs without therapist assignment

    if (!therapistMap.has(vo.therapistId)) {
      therapistMap.set(vo.therapistId, {
        vos: [],
        practices: new Set(),
        lastVODate: undefined
      });
    }

    const therapistData = therapistMap.get(vo.therapistId)!;
    therapistData.vos.push(vo);
    therapistData.practices.add(vo.practiceId);

    // Track most recent VO date
    if (!therapistData.lastVODate || vo.createdAt > therapistData.lastVODate) {
      therapistData.lastVODate = vo.createdAt.split('T')[0]; // Extract YYYY-MM-DD
    }
  });

  // Create facility lookup map
  const facilityMap = new Map(facilities.map(f => [f.id, f]));

  // Calculate stats for each therapist
  const stats: TherapistStats[] = [];

  therapists.forEach(therapist => {
    const data = therapistMap.get(therapist.id);
    const facility = facilityMap.get(therapist.facilityId);

    if (!facility) return; // Skip therapists without valid facility

    const allVOs = data?.vos || [];
    const totalVOs = allVOs.length;
    // Exclude both "Received" and "In Transit" from pending count
    const pendingVOs = allVOs.filter(vo => vo.status !== 'Received' && vo.status !== 'In Transit').length;

    stats.push({
      therapist,
      facility,
      totalVOs,
      pendingVOs,
      practices: data ? Array.from(data.practices) : [],
      lastVODate: data?.lastVODate,
      timeWindow: timeWindowDays === null
        ? 'all time'
        : `${timeWindowDays} days`
    });
  });

  // Sort by pending VO count (ascending)
  return stats.sort((a, b) => a.pendingVOs - b.pendingVOs);
}

/**
 * Get therapist by ID
 * Helper to find a therapist entity by ID
 *
 * @param therapists - Array of all therapists
 * @param therapistId - Therapist ID to find
 * @returns Therapist or undefined
 */
export function getTherapistById(
  therapists: Therapist[],
  therapistId: string
): Therapist | undefined {
  return therapists.find(t => t.id === therapistId);
}

/**
 * Get facility by ID
 * Helper to find a facility entity by ID
 *
 * @param facilities - Array of all facilities
 * @param facilityId - Facility ID to find
 * @returns Facility or undefined
 */
export function getFacilityById(
  facilities: Facility[],
  facilityId: string
): Facility | undefined {
  return facilities.find(f => f.id === facilityId);
}

/**
 * Get compatible practices for a therapist
 * Returns practices whose doctors can send VOs to this therapist's facility
 *
 * @param therapist - Therapist entity
 * @param doctors - Array of all doctors
 * @param practices - Array of all practices
 * @param facilities - Array of all facilities
 * @returns Array of compatible practice entities
 */
export function getCompatiblePractices(
  therapist: Therapist,
  doctors: PracticeDoctor[],
  practices: Practice[],
  facilities: Facility[]
): Practice[] {
  const facility = getFacilityById(facilities, therapist.facilityId);
  if (!facility) return [];

  // Find doctors who have this facility in their facilities list
  const compatibleDoctorIds = doctors
    .filter(doc => doc.facilities.includes(facility.name))
    .map(doc => doc.practiceId)
    .filter(Boolean) as string[];

  // Get unique practice IDs
  const uniquePracticeIds = [...new Set(compatibleDoctorIds)];

  // Return practice entities
  return practices.filter(p => uniquePracticeIds.includes(p.id));
}

/**
 * Get therapist stats for a specific practice
 * Returns only therapists that receive VOs from this practice
 *
 * @param therapists - Array of all therapists
 * @param facilities - Array of all facilities
 * @param vos - Array of all VOs
 * @param practiceId - Practice ID to filter by
 * @returns Array of therapist stats for this practice
 */
export function getTherapistStatsForPractice(
  therapists: Therapist[],
  facilities: Facility[],
  vos: PracticeVO[],
  practiceId: string
): TherapistStats[] {
  const practiceVOs = vos.filter(vo => vo.practiceId === practiceId);
  const practiceTherapistIds = new Set(practiceVOs.map(vo => vo.therapistId).filter(Boolean));
  const practiceTherapists = therapists.filter(t => practiceTherapistIds.has(t.id));

  return calculateTherapistStats(practiceTherapists, facilities, practiceVOs);
}
