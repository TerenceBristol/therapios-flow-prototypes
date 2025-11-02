const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'src', 'data', 'fvoCRMData.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const voStatuses = ['Aktiv', 'Abgebrochen', 'Fertig Behandelt', 'Abgelaufen', 'Abgerechnet'];

// Helper to generate realistic VO number
const generateVONumber = () => {
  const part1 = Math.floor(Math.random() * 9000) + 1000; // 1000-9999
  const part2 = Math.floor(Math.random() * 9) + 1; // 1-9
  return `${part1}-${part2}`;
};

// Helper to get weighted random VO status (more "Aktiv" and "Fertig Behandelt", fewer "Abgebrochen")
const getRandomVOStatus = () => {
  const rand = Math.random();
  if (rand < 0.35) return 'Aktiv'; // 35%
  if (rand < 0.65) return 'Fertig Behandelt'; // 30%
  if (rand < 0.80) return 'Abgerechnet'; // 15%
  if (rand < 0.92) return 'Abgelaufen'; // 12%
  return 'Abgebrochen'; // 8%
};

// Update all VOs with voNumber and voStatus
let updatedCount = 0;
data.vos.forEach(vo => {
  vo.voNumber = generateVONumber();
  vo.voStatus = getRandomVOStatus();
  updatedCount++;
});

// Save updated data
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');

console.log('✅ VO fields added successfully!');
console.log(`📊 Updated ${updatedCount} VOs with voNumber and voStatus`);

// Show distribution of statuses
const statusCounts = {};
data.vos.forEach(vo => {
  statusCounts[vo.voStatus] = (statusCounts[vo.voStatus] || 0) + 1;
});

console.log('\n📈 VO Status Distribution:');
Object.entries(statusCounts).forEach(([status, count]) => {
  const percentage = ((count / data.vos.length) * 100).toFixed(1);
  console.log(`   - ${status}: ${count} (${percentage}%)`);
});
