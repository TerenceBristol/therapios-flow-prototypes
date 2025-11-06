import { GroupedPatient, VO, VOStatus } from '../data/voTypes';
import patientData from '../data/patientViewData.json';

// Helper to calculate days since a date
function daysSince(dateString: string): number {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Calculate days since last treatment for a patient
// Uses mock data based on VO issuance date and treatment progress
function calculateDaysSinceLastTreatment(vos: any[]): number {
  if (vos.length === 0) return 0;

  let mostRecentTreatmentDate = new Date(0);

  vos.forEach(vo => {
    if (!vo.ausstDatum || !vo.behStatus) return;

    // Parse treatment progress (e.g., "3/10" means 3 treatments completed)
    const [completed] = vo.behStatus.split('/').map((n: string) => parseInt(n));

    if (completed > 0) {
      // Mock: assume ~2-3 days between treatments
      const issueDate = new Date(vo.ausstDatum);
      const daysPerTreatment = 2.5; // average
      const daysSinceIssue = completed * daysPerTreatment;
      const lastTreatmentDate = new Date(issueDate.getTime() + (daysSinceIssue * 24 * 60 * 60 * 1000));

      if (lastTreatmentDate > mostRecentTreatmentDate) {
        mostRecentTreatmentDate = lastTreatmentDate;
      }
    }
  });

  if (mostRecentTreatmentDate.getTime() === 0) return 0;

  return daysSince(mostRecentTreatmentDate.toISOString());
}

// Transform raw patient data into GroupedPatient format
export function getGroupedPatients(): GroupedPatient[] {
  return patientData.patients.map((patient) => {
    // Enrich VOs with additional fields
    const enrichedVOs: VO[] = patient.vos.map((vo, index) => ({
      id: `${patient.id}-vo-${index}`,
      name: vo.name,
      voNr: vo.voNr,
      voStatus: vo.voStatus as VOStatus,
      behStatus: vo.behStatus,
      tageSeit: vo.ausstDatum ? daysSince(vo.ausstDatum) : 0,
      tb: vo.tb,
      primaererTherapeut: vo.primaererTherapeut,
      geteilterTherapeut: vo.geteilterTherapeut || '–',
      behWbh: 0, // Default value, can be calculated from behStatus if needed
      einrichtung: vo.einrichtung,
      organizer: vo.heilmittel, // Using heilmittel as organizer for now
      heilmittel: vo.heilmittel,
      abgelehnteBeh: 0, // Default value
      doppelB: 'Nein', // Default value
      ausstDatum: vo.ausstDatum,
      fVoStatus: vo.fVoStatus,
    }));

    // Get facility and therapists from first VO (since they're patient-level)
    const firstVO = patient.vos[0];

    // Parse shared therapists - can be multiple, comma-separated
    const sharedTherapistString = firstVO?.geteilterTherapeut || '–';
    const sharedTherapists = sharedTherapistString === '–'
      ? []
      : sharedTherapistString.split(',').map(t => t.trim()).filter(t => t.length > 0);

    // Calculate days since last treatment
    const daysSinceLastTreatment = calculateDaysSinceLastTreatment(patient.vos);

    return {
      id: patient.id,
      name: patient.name,
      facility: firstVO?.einrichtung || '',
      primaryTherapist: firstVO?.primaererTherapeut || '',
      sharedTherapists,
      orderingStatus: 'by_admin', // Default value
      activeVOCount: patient.aktivCount,
      totalVOCount: patient.vos.length,
      daysSinceLastTreatment,
      vos: enrichedVOs,
    };
  });
}

// Get patients with at least one active VO
export function getPatientsWithActiveVOs(): GroupedPatient[] {
  return getGroupedPatients().filter(p => p.activeVOCount > 0);
}

// Get patients with no active VOs
export function getPatientsWithoutActiveVOs(): GroupedPatient[] {
  return getGroupedPatients().filter(p => p.activeVOCount === 0);
}

// Get active VOs for a patient
export function getActiveVOs(patient: GroupedPatient): VO[] {
  return patient.vos.filter(vo => vo.voStatus === 'Aktiv');
}

// Get non-active VOs for a patient
export function getNonActiveVOs(patient: GroupedPatient): VO[] {
  return patient.vos.filter(vo => vo.voStatus !== 'Aktiv');
}
