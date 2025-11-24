const fs = require('fs');
const path = require('path');

// Read the JSON file
const dataPath = path.join(__dirname, 'src/data/fvoCRMData.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Realistic German medical practice opening hours patterns
// Structure: periods[0] = main hours (full day), periods[1] = break time
const breakPatterns = [
  // Pattern A: Standard hours (08:00-17:00 with 12:00-13:00 lunch)
  {
    monday: { periods: [{ open: "08:00", close: "17:00" }, { open: "12:00", close: "13:00" }], isClosed: false },
    tuesday: { periods: [{ open: "08:00", close: "17:00" }, { open: "12:00", close: "13:00" }], isClosed: false },
    wednesday: { periods: [{ open: "08:00", close: "17:00" }, { open: "12:00", close: "13:00" }], isClosed: false },
    thursday: { periods: [{ open: "08:00", close: "17:00" }, { open: "12:00", close: "13:00" }], isClosed: false },
    friday: { periods: [{ open: "08:00", close: "16:00" }, { open: "12:00", close: "13:00" }], isClosed: false },
    saturday: { periods: [], isClosed: true },
    sunday: { periods: [], isClosed: true }
  },
  // Pattern B: Early start (07:30-17:30 with 12:30-13:30 lunch)
  {
    monday: { periods: [{ open: "07:30", close: "17:30" }, { open: "12:30", close: "13:30" }], isClosed: false },
    tuesday: { periods: [{ open: "07:30", close: "17:30" }, { open: "12:30", close: "13:30" }], isClosed: false },
    wednesday: { periods: [{ open: "07:30", close: "17:30" }, { open: "12:30", close: "13:30" }], isClosed: false },
    thursday: { periods: [{ open: "07:30", close: "17:30" }, { open: "12:30", close: "13:30" }], isClosed: false },
    friday: { periods: [{ open: "07:30", close: "16:30" }, { open: "12:30", close: "13:30" }], isClosed: false },
    saturday: { periods: [], isClosed: true },
    sunday: { periods: [], isClosed: true }
  },
  // Pattern C: Late shift (08:30-18:00 with 13:00-14:00 lunch)
  {
    monday: { periods: [{ open: "08:30", close: "18:00" }, { open: "13:00", close: "14:00" }], isClosed: false },
    tuesday: { periods: [{ open: "08:30", close: "18:00" }, { open: "13:00", close: "14:00" }], isClosed: false },
    wednesday: { periods: [{ open: "08:30", close: "18:00" }, { open: "13:00", close: "14:00" }], isClosed: false },
    thursday: { periods: [{ open: "08:30", close: "18:00" }, { open: "13:00", close: "14:00" }], isClosed: false },
    friday: { periods: [{ open: "08:30", close: "17:00" }, { open: "13:00", close: "14:00" }], isClosed: false },
    saturday: { periods: [], isClosed: true },
    sunday: { periods: [], isClosed: true }
  },
  // Pattern D: With Saturday morning (08:00-17:00 with 12:30-13:30 lunch)
  {
    monday: { periods: [{ open: "08:00", close: "17:00" }, { open: "12:30", close: "13:30" }], isClosed: false },
    tuesday: { periods: [{ open: "08:00", close: "17:00" }, { open: "12:30", close: "13:30" }], isClosed: false },
    wednesday: { periods: [{ open: "08:00", close: "17:00" }, { open: "12:30", close: "13:30" }], isClosed: false },
    thursday: { periods: [{ open: "08:00", close: "17:00" }, { open: "12:30", close: "13:30" }], isClosed: false },
    friday: { periods: [{ open: "08:00", close: "16:00" }, { open: "12:30", close: "13:30" }], isClosed: false },
    saturday: { periods: [{ open: "09:00", close: "12:00" }], isClosed: false },
    sunday: { periods: [], isClosed: true }
  },
  // Pattern E: Early close (07:00-16:00 with 12:00-13:00 lunch)
  {
    monday: { periods: [{ open: "07:00", close: "16:00" }, { open: "12:00", close: "13:00" }], isClosed: false },
    tuesday: { periods: [{ open: "07:00", close: "16:00" }, { open: "12:00", close: "13:00" }], isClosed: false },
    wednesday: { periods: [{ open: "07:00", close: "16:00" }, { open: "12:00", close: "13:00" }], isClosed: false },
    thursday: { periods: [{ open: "07:00", close: "16:00" }, { open: "12:00", close: "13:00" }], isClosed: false },
    friday: { periods: [{ open: "07:00", close: "15:00" }, { open: "12:00", close: "13:00" }], isClosed: false },
    saturday: { periods: [], isClosed: true },
    sunday: { periods: [], isClosed: true }
  }
];

// Update each practice with a break pattern
data.practices = data.practices.map((practice, index) => {
  // Cycle through patterns
  const patternIndex = index % breakPatterns.length;
  return {
    ...practice,
    openingHours: breakPatterns[patternIndex]
  };
});

// Write the updated data back
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

console.log(`Updated ${data.practices.length} practices with correct break times`);
console.log('\nPatterns applied (periods[0]=main hours, periods[1]=break):');
console.log('- Pattern A: 08:00-17:00, Break 12:00-13:00');
console.log('- Pattern B: 07:30-17:30, Break 12:30-13:30');
console.log('- Pattern C: 08:30-18:00, Break 13:00-14:00');
console.log('- Pattern D: 08:00-17:00, Break 12:30-13:30 (+ Saturday 09:00-12:00)');
console.log('- Pattern E: 07:00-16:00, Break 12:00-13:00');
