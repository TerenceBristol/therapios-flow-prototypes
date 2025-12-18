const fs = require('fs');
const path = require('path');

// Read the current data
const dataPath = path.join(__dirname, '../src/data/heilmittelData.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// German names for audit trail
const users = ['Max M.', 'Sarah S.', 'Thomas K.', 'Anna B.', 'Michael W.'];
const getRandomUser = () => users[Math.floor(Math.random() * users.length)];

// Generate random date in last 30 days
const getRandomRecentDate = () => {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 30);
  const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return date.toISOString();
};

// Items to archive (2-3 older/deprecated codes)
const archivedKurzzeichen = ['AB-E-BV', 'AB-P-BV', 'BD-BV'];

// Transform each item
const updatedData = data.map((item, index) => {
  const isArchived = archivedKurzzeichen.includes(item.kurzzeichen);
  const createdDate = '2024-01-15T10:00:00.000Z';
  const lastEditDate = getRandomRecentDate();
  const createdBy = getRandomUser();
  const lastEditedBy = getRandomUser();

  // Add changedBy to all history entries
  const updateHistory = (history) => {
    return history.map(entry => ({
      ...entry,
      changedBy: entry.changedBy || getRandomUser()
    }));
  };

  return {
    ...item,
    // Archive status
    isArchived,
    archivedAt: isArchived ? '2025-12-10T14:30:00.000Z' : undefined,
    archivedBy: isArchived ? 'Sarah S.' : undefined,

    // Audit trail
    createdAt: createdDate,
    createdBy: createdBy,
    lastEditedAt: lastEditDate,
    lastEditedBy: lastEditedBy,

    // Update history entries with changedBy
    tar1History: updateHistory(item.tar1History || []),
    tar10History: updateHistory(item.tar10History || []),
    tar11History: updateHistory(item.tar11History || []),
    tar12History: updateHistory(item.tar12History || [])
  };
});

// Write the updated data
fs.writeFileSync(dataPath, JSON.stringify(updatedData, null, 2));

console.log(`Updated ${updatedData.length} items`);
console.log(`Archived items: ${updatedData.filter(i => i.isArchived).map(i => i.kurzzeichen).join(', ')}`);
