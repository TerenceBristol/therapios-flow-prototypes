const fs = require('fs');
const path = require('path');

// Read the existing data
const dataPath = path.join(__dirname, 'src/data/fvoCRMData.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Extract unique facility names from VOs (filter out undefined/null)
const uniqueFacilities = [...new Set(data.vos.map(vo => vo.facilityName).filter(Boolean))].sort();

console.log('Unique facilities found:', uniqueFacilities.length);
console.log(uniqueFacilities);

// Determine facility type based on name
function getFacilityType(name) {
  if (name.startsWith('ER ')) return 'ER';
  if (name.includes('Care Home')) return 'Care Home';
  return 'Clinic';
}

// Generate facility entities
const facilities = uniqueFacilities.map((name, index) => ({
  id: `fac-${String(index + 1).padStart(3, '0')}`,
  name,
  type: getFacilityType(name),
  address: `${index + 100} Medical Plaza, ${name.split(' ').pop()}, Germany`,
  phone: `+49 ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 9000000 + 1000000)}`,
  email: `contact@${name.toLowerCase().replace(/\s+/g, '')}.de`,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2025-10-01T00:00:00Z'
}));

console.log('\nGenerated facilities:', facilities.length);

// German therapist names
const germanFirstNames = [
  'Anna', 'Lukas', 'Emma', 'Leon', 'Mia', 'Noah', 'Sophie', 'Felix',
  'Hannah', 'Paul', 'Lea', 'Jonas', 'Laura', 'Tim', 'Marie', 'Max',
  'Sarah', 'Moritz', 'Lena', 'David', 'Julia', 'Ben', 'Lisa', 'Tom',
  'Jana', 'Simon', 'Nina', 'Finn', 'Clara', 'Niklas'
];

const germanLastNames = [
  'Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner',
  'Becker', 'Schulz', 'Hoffmann', 'Koch', 'Bauer', 'Richter', 'Klein',
  'Wolf', 'Schröder', 'Neumann', 'Schwarz', 'Zimmermann', 'Braun'
];

const specialties = [
  'Physiotherapy', 'Occupational Therapy', 'Speech Therapy',
  'Manual Therapy', 'Sports Therapy', 'Lymphatic Drainage'
];

// Generate 2-4 therapists per facility
let therapistCounter = 1;
const therapists = [];

facilities.forEach(facility => {
  const numTherapists = Math.floor(Math.random() * 3) + 2; // 2-4 therapists

  for (let i = 0; i < numTherapists; i++) {
    const firstName = germanFirstNames[Math.floor(Math.random() * germanFirstNames.length)];
    const lastName = germanLastNames[Math.floor(Math.random() * germanLastNames.length)];

    therapists.push({
      id: `ther-${String(therapistCounter).padStart(3, '0')}`,
      name: `${firstName} ${lastName}`,
      facilityId: facility.id,
      specialty: specialties[Math.floor(Math.random() * specialties.length)],
      phone: `+49 ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 9000000 + 1000000)}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${facility.name.toLowerCase().replace(/\s+/g, '')}.de`,
      active: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2025-10-01T00:00:00Z'
    });

    therapistCounter++;
  }
});

console.log('Generated therapists:', therapists.length);

// Assign therapistIds to VOs with strategic distribution for low-volume testing
// Group VOs by facility
const vosByFacility = {};
data.vos.forEach(vo => {
  if (!vosByFacility[vo.facilityName]) {
    vosByFacility[vo.facilityName] = [];
  }
  vosByFacility[vo.facilityName].push(vo);
});

// For each facility, assign VOs to therapists ensuring some have low counts
facilities.forEach(facility => {
  const facilityVOs = vosByFacility[facility.name] || [];
  const facilityTherapists = therapists.filter(t => t.facilityId === facility.id);

  if (facilityVOs.length === 0 || facilityTherapists.length === 0) return;

  // Sort therapists to create intentional distribution
  // First therapist gets 1-2 VOs (critical)
  // Second therapist gets 3-5 VOs (low volume)
  // Remaining therapists split the rest

  let voIndex = 0;

  facilityTherapists.forEach((therapist, tIndex) => {
    let targetVOs;

    if (tIndex === 0 && facilityVOs.length > 2) {
      // First therapist: 1-2 VOs (critical low volume)
      targetVOs = Math.min(Math.floor(Math.random() * 2) + 1, facilityVOs.length);
    } else if (tIndex === 1 && facilityVOs.length > 5) {
      // Second therapist: 3-5 VOs (low volume)
      targetVOs = Math.min(Math.floor(Math.random() * 3) + 3, facilityVOs.length - voIndex);
    } else {
      // Remaining therapists split the rest
      const remaining = facilityVOs.length - voIndex;
      const remainingTherapists = facilityTherapists.length - tIndex;
      targetVOs = Math.ceil(remaining / remainingTherapists);
    }

    // Assign VOs to this therapist
    for (let i = 0; i < targetVOs && voIndex < facilityVOs.length; i++) {
      facilityVOs[voIndex].therapistId = therapist.id;
      voIndex++;
    }
  });
});

// Add 2-3 "In Transit" status VOs for testing
const inTransitCount = Math.floor(Math.random() * 2) + 2;
for (let i = 0; i < inTransitCount && i < data.vos.length; i++) {
  const randomIndex = Math.floor(Math.random() * data.vos.length);
  data.vos[randomIndex].status = 'In Transit';
  data.vos[randomIndex].statusDate = '25.10.2025';
  data.vos[randomIndex].statusTimestamp = '2025-10-25T10:00:00Z';
}

// Update the data structure
data.facilities = facilities;
data.therapists = therapists;

// Write back to file
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

console.log('\n✓ Data generation complete!');
console.log(`✓ Generated ${facilities.length} facilities`);
console.log(`✓ Generated ${therapists.length} therapists`);
console.log(`✓ Assigned therapistIds to ${data.vos.length} VOs`);
console.log(`✓ Added ${inTransitCount} "In Transit" status VOs`);

// Print distribution stats
const therapistVOCounts = therapists.map(t => ({
  name: t.name,
  facility: facilities.find(f => f.id === t.facilityId)?.name,
  voCount: data.vos.filter(vo => vo.therapistId === t.id).length
})).sort((a, b) => a.voCount - b.voCount);

console.log('\nTherapist VO Distribution (lowest to highest):');
console.log('Low Volume (< 5 VOs):');
therapistVOCounts.filter(t => t.voCount < 5).forEach(t => {
  console.log(`  ${t.name} (${t.facility}): ${t.voCount} VOs`);
});

console.log('\nCritical Low Volume (< 3 VOs):');
therapistVOCounts.filter(t => t.voCount < 3).forEach(t => {
  console.log(`  ${t.name} (${t.facility}): ${t.voCount} VOs`);
});
