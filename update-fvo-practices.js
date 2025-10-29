const fs = require('fs');
const path = require('path');

// Read the data file
const dataPath = path.join(__dirname, 'src/data/fvoCRMData.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

console.log('Starting FVO-CRM data update...\n');

// 1. Remove keyContacts from all practices
console.log('Step 1: Removing keyContacts from all practices...');
let practicesUpdated = 0;
data.practices = data.practices.map(practice => {
  const { keyContacts, ...rest } = practice;
  if (keyContacts) {
    practicesUpdated++;
  }
  return rest;
});
console.log(`✓ Removed keyContacts from ${practicesUpdated} practices\n`);

// 2. Create 7 new doctors for unassigned practices
console.log('Step 2: Creating doctors for unassigned practices...');

const unassignedPractices = [
  { id: 'prac-012', name: 'Downtown Medical Clinic', specialty: 'General Medicine', doctorName: 'Dr. Schmidt' },
  { id: 'prac-013', name: 'Hillside Pediatric Center', specialty: 'Pediatrics', doctorName: 'Dr. Müller' },
  { id: 'prac-015', name: 'Eastside Family Medicine', specialty: 'Family Medicine', doctorName: 'Dr. Wagner' },
  { id: 'prac-024', name: 'Maple Grove Allergy & Asthma', specialty: 'Allergy & Immunology', doctorName: 'Dr. Klein' },
  { id: 'prac-025', name: 'Oakwood Endocrinology', specialty: 'Endocrinology', doctorName: 'Dr. Fischer' },
  { id: 'prac-029', name: 'Highland Hematology', specialty: 'Hematology', doctorName: 'Dr. Meyer' },
  { id: 'prac-030', name: 'Cedar Ridge Infectious Disease', specialty: 'Infectious Disease', doctorName: 'Dr. Schneider' }
];

// Get existing facilities from other doctors to use as examples
const existingFacilities = [...new Set(data.doctors.flatMap(d => d.facilities || []))];
const sampleFacilities = existingFacilities.slice(0, 3); // Use first 3 facilities

// Find highest existing doctor ID
const existingDoctorIds = data.doctors.map(d => {
  const match = d.id.match(/doc-(\d+)/);
  return match ? parseInt(match[1]) : 0;
});
let nextDoctorId = Math.max(...existingDoctorIds) + 1;
let nextArztId = Math.max(...data.doctors.map(d => d.arztId || 0)) + 1;

// Create new doctors
const newDoctors = unassignedPractices.map((practice, index) => {
  const doctorId = `doc-${String(nextDoctorId++).padStart(3, '0')}`;

  return {
    id: doctorId,
    arztId: nextArztId++,
    name: practice.doctorName,
    practiceId: practice.id,
    facilities: sampleFacilities,
    specialty: practice.specialty,
    phone: '',
    email: '',
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
});

// Add new doctors to the data
data.doctors = [...data.doctors, ...newDoctors];

console.log(`✓ Created ${newDoctors.length} new doctors:`);
newDoctors.forEach(doc => {
  console.log(`  - ${doc.name} (${doc.specialty}) for practice ${doc.practiceId}`);
});
console.log('');

// 3. Write updated data back to file
console.log('Step 3: Writing updated data to file...');
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log('✓ Data file updated successfully\n');

// Summary
console.log('=== Summary ===');
console.log(`Total practices: ${data.practices.length}`);
console.log(`Total doctors: ${data.doctors.length}`);
console.log(`Total VOs: ${data.vos.length}`);
console.log(`Total activities: ${data.activities.length}`);
console.log('\nAll practices now have assigned doctors!');
