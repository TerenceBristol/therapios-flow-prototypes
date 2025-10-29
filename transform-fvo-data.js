const fs = require('fs');
const path = require('path');

// Status mapping from English to German
const statusMap = {
  'Pending': 'Bestellen',
  'To Order': 'Bestellen',
  'Ordered': 'Bestellt',
  'To Follow Up': 'Nachverfolgen',
  'Followed Up': 'Nachverfolgt',
  'To Call': 'Telefonieren',
  'Called': 'Telefoniert',
  'Received': 'Received' // Keep as is, will be filtered out
};

// Therapy type to Heilmittel code mapping
const therapyTypeToCode = {
  'Physical Therapy': 'KG-H',
  'Speech Therapy': 'L-E45H',
  'Occupational Therapy': 'BO-E-H',
  'Manual Therapy': 'MT',
  'Lymphatic Drainage': 'MLD45H',
  'Neurological Treatment': 'NOB-E-HB'
};

// Treatment counts (anzahl) to choose from
const treatmentCounts = [6, 10, 12, 18];

// Helper function to format ISO date to DD.MM.YYYY
function formatDate(isoString) {
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

// Helper function to generate random birth date (age 20-90)
function generateBirthDate() {
  const now = new Date();
  const age = Math.floor(Math.random() * 70) + 20; // 20-90 years old
  const birthYear = now.getFullYear() - age;
  const birthMonth = Math.floor(Math.random() * 12) + 1;
  const birthDay = Math.floor(Math.random() * 28) + 1; // Safe day range

  const day = String(birthDay).padStart(2, '0');
  const month = String(birthMonth).padStart(2, '0');
  return `${day}.${month}.${birthYear}`;
}

// Helper function to get random treatment count
function getRandomTreatmentCount() {
  return treatmentCounts[Math.floor(Math.random() * treatmentCounts.length)];
}

// Transform VO object
function transformVO(vo) {
  // Map status
  const newStatus = statusMap[vo.status] || vo.status;

  // Map therapy type to code
  const therapyCode = therapyTypeToCode[vo.therapyType] || 'KG-H';

  // Generate anzahl
  const anzahl = getRandomTreatmentCount();

  // Format status date
  const statusDate = formatDate(vo.statusTimestamp);

  // Generate birth date
  const gebDatum = generateBirthDate();

  // Return transformed VO without batchId
  return {
    id: vo.id,
    patientName: vo.patientName,
    therapyType: therapyCode,
    anzahl: anzahl,
    status: newStatus,
    statusTimestamp: vo.statusTimestamp,
    statusDate: statusDate,
    gebDatum: gebDatum,
    practiceId: vo.practiceId,
    doctorId: vo.doctorId,
    facilityName: vo.facilityName,
    createdAt: vo.createdAt
  };
}

// Main transformation function
function transformData() {
  console.log('Loading fvoCRMData.json...');

  const dataPath = path.join(__dirname, 'src', 'data', 'fvoCRMData.json');
  const rawData = fs.readFileSync(dataPath, 'utf8');
  const data = JSON.parse(rawData);

  console.log(`Found ${data.vos.length} VOs and ${data.batches?.length || 0} batches`);

  // Transform VOs
  console.log('Transforming VOs...');
  const transformedVOs = data.vos
    .map(transformVO)
    .filter(vo => vo.status !== 'Received'); // Filter out Received status

  console.log(`Transformed ${transformedVOs.length} VOs (filtered out ${data.vos.length - transformedVOs.length} with Received status)`);

  // Remove batches array
  const transformedData = {
    practices: data.practices,
    doctors: data.doctors,
    vos: transformedVOs,
    activities: data.activities
  };

  // Write transformed data
  console.log('Writing transformed data...');
  fs.writeFileSync(
    dataPath,
    JSON.stringify(transformedData, null, 2),
    'utf8'
  );

  console.log('✓ Data transformation complete!');
  console.log(`  - Updated ${transformedVOs.length} VOs with new fields`);
  console.log(`  - Removed ${data.vos.length - transformedVOs.length} VOs with Received status`);
  console.log(`  - Removed batches array`);
  console.log(`  - Added anzahl, statusDate, gebDatum fields`);
  console.log(`  - Mapped statuses to German`);
  console.log(`  - Mapped therapy types to Heilmittel codes`);
}

// Run transformation
try {
  transformData();
} catch (error) {
  console.error('Error transforming data:', error);
  process.exit(1);
}
