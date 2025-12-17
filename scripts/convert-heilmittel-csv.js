const fs = require('fs');
const path = require('path');

// Read CSV file
const csvPath = path.join(__dirname, '../../Heilmittel.xlsx - Table001 (Page 1-3) (1).csv');
const csvContent = fs.readFileSync(csvPath, 'utf8');

// Parse German number format (comma as decimal separator)
function parseGermanNumber(value) {
  if (!value || value === '0' || value === '') return 0;
  // Replace comma with dot for parsing
  const normalized = value.replace(',', '.');
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
}

// Parse CSV (handling quoted fields with commas)
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Get today's date in YYYY-MM-DD format
const today = new Date().toISOString().split('T')[0];
const now = new Date().toISOString();

// Parse CSV
const lines = csvContent.split('\n').filter(line => line.trim());
const headers = parseCSVLine(lines[0]);

const heilmittelData = [];

for (let i = 1; i < lines.length; i++) {
  const values = parseCSVLine(lines[i]);
  if (values.length < 10) continue;

  const kurzzeichen = values[0];
  const bezeichnung = values[1];
  const tar1 = parseGermanNumber(values[2]);
  const tar10 = parseGermanNumber(values[3]);
  const tar11 = parseGermanNumber(values[4]);
  const tar12 = parseGermanNumber(values[5]);
  const duration = values[6] === '' ? null : parseInt(values[6]) || null;
  const kind = values[7] || 'treatment';
  const bv = values[8] === 'TRUE';
  const bereich = values[9] || 'PT';
  const textBestellung = values[10] || '';

  // Create history entry for each tariff with current value
  const createHistoryEntry = (value) => [{
    id: `hist-${kurzzeichen}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    value,
    effectiveDate: today,
    changedAt: now
  }];

  heilmittelData.push({
    id: `hm-${kurzzeichen.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    kurzzeichen,
    bezeichnung,
    duration,
    kind,
    bv,
    bereich,
    textBestellung,
    tar1,
    tar10,
    tar11,
    tar12,
    tar1History: createHistoryEntry(tar1),
    tar10History: createHistoryEntry(tar10),
    tar11History: createHistoryEntry(tar11),
    tar12History: createHistoryEntry(tar12)
  });
}

// Write JSON file
const outputPath = path.join(__dirname, '../src/data/heilmittelData.json');
fs.writeFileSync(outputPath, JSON.stringify(heilmittelData, null, 2));

console.log(`Converted ${heilmittelData.length} Heilmittel records to JSON`);
console.log(`Output: ${outputPath}`);
