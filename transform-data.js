const fs = require('fs');
const path = require('path');

// Read the JSON file
const dataPath = path.join(__dirname, 'src/data/fvoCRMData.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Transform doctors: practiceIds array -> practiceId single value
if (data.doctors && Array.isArray(data.doctors)) {
  data.doctors = data.doctors.map(doctor => {
    const { practiceIds, ...rest } = doctor;

    // Take the first practice ID from the array, or set to undefined if empty
    const practiceId = practiceIds && practiceIds.length > 0 ? practiceIds[0] : undefined;

    return {
      ...rest,
      ...(practiceId ? { practiceId } : {})
    };
  });
}

// Write back to file
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');

console.log('✅ Data migration complete!');
console.log(`   Transformed ${data.doctors.length} doctors`);
console.log('   Changed practiceIds (array) -> practiceId (single value)');
