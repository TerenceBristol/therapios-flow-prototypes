#!/usr/bin/env node

/**
 * Migration script to transform FVO CRM data to new format
 *
 * Changes:
 * 1. Practice.phone → Practice.contacts array
 * 2. OpeningHoursDay structure → periods array format
 * 3. Add empty vacationPeriods array
 * 4. Add empty comment fields to VOs
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'src', 'data', 'fvoCRMData.json');
const BACKUP_FILE = path.join(__dirname, 'src', 'data', 'fvoCRMData.backup.json');

console.log('🔄 Starting FVO CRM data migration...\n');

// Read existing data
const rawData = fs.readFileSync(DATA_FILE, 'utf8');
const data = JSON.parse(rawData);

// Create backup
console.log('📦 Creating backup...');
fs.writeFileSync(BACKUP_FILE, rawData);
console.log('✅ Backup created at:', BACKUP_FILE, '\n');

// Migration functions

function migratePhoneToContacts(practice) {
  // If already migrated (has contacts array), skip
  if (practice.contacts && Array.isArray(practice.contacts)) {
    return practice;
  }

  // Transform phone string to contacts array
  const contacts = [];

  if (practice.phone) {
    contacts.push({
      id: `cnt-${practice.id}-1`,
      name: 'Main',
      phone: practice.phone,
      isPrimary: true
    });
  }

  return {
    ...practice,
    contacts,
    // Keep phone for backward compatibility but mark as deprecated
    phone: practice.phone
  };
}

function migrateOpeningHours(practice) {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const openingHours = { ...practice.openingHours };

  days.forEach(day => {
    const dayHours = openingHours[day];

    // If already migrated (has periods array), skip
    if (dayHours.periods && Array.isArray(dayHours.periods)) {
      return;
    }

    // Transform single open/close to periods array
    if (dayHours.isClosed) {
      openingHours[day] = {
        periods: [],
        isClosed: true
      };
    } else {
      openingHours[day] = {
        periods: [{
          open: dayHours.open,
          close: dayHours.close
        }],
        isClosed: false
      };
    }
  });

  return {
    ...practice,
    openingHours
  };
}

function addVacationPeriods(practice) {
  return {
    ...practice,
    vacationPeriods: practice.vacationPeriods || []
  };
}

function addVOComments(vo) {
  return {
    ...vo,
    comment: vo.comment || undefined,
    commentHistory: vo.commentHistory || undefined
  };
}

// Run migrations

console.log('👥 Migrating practices...');
let migratedCount = 0;
data.practices = data.practices.map(practice => {
  let migrated = practice;
  migrated = migratePhoneToContacts(migrated);
  migrated = migrateOpeningHours(migrated);
  migrated = addVacationPeriods(migrated);
  migratedCount++;
  return migrated;
});
console.log(`✅ Migrated ${migratedCount} practices\n`);

console.log('📋 Migrating VOs...');
let voCount = 0;
data.vos = data.vos.map(vo => {
  voCount++;
  return addVOComments(vo);
});
console.log(`✅ Processed ${voCount} VOs\n`);

// Write migrated data
console.log('💾 Writing migrated data...');
fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
console.log('✅ Migration complete!\n');

console.log('📊 Summary:');
console.log(`  - Practices migrated: ${migratedCount}`);
console.log(`  - VOs processed: ${voCount}`);
console.log(`  - Backup file: ${BACKUP_FILE}`);
console.log('\n✨ Data migration successful!');
