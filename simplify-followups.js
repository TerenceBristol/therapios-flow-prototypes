const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'src', 'data', 'fvoCRMData.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Clear existing follow-ups
data.followUps = [];

// Helper to create follow-up
const createFollowUp = (practiceId, dueDate, dueTime, notes, userId = 'user-001') => ({
  id: `fu-${practiceId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  practiceId,
  dueDate,
  dueTime,
  notes,
  completed: false,
  completedAt: null,
  userId,
  createdAt: new Date().toISOString()
});

// URGENT - 6 practices (Oct 25 - Nov 1, 2025)
const urgentFollowUps = [
  { practiceId: 'prac-001', dueDate: '2025-10-25', dueTime: '09:00', notes: 'Follow up on pending VO request - patient waiting' },
  { practiceId: 'prac-002', dueDate: '2025-10-27', dueTime: '14:00', notes: 'Check status of ordered supplies' },
  { practiceId: 'prac-003', dueDate: '2025-10-28', dueTime: '10:30', notes: 'Contact practice about missing documentation' },
  { practiceId: 'prac-004', dueDate: '2025-10-30', dueTime: '11:00', notes: 'Verify receipt of faxed VO' },
  { practiceId: 'prac-005', dueDate: '2025-10-31', dueTime: '15:00', notes: 'Confirm appointment scheduling' },
  { practiceId: 'prac-006', dueDate: '2025-11-01', dueTime: '09:30', notes: 'Follow up on urgent patient case' }
];

// THIS WEEK - 7 practices (Nov 2-7, 2025)
const thisWeekFollowUps = [
  { practiceId: 'prac-007', dueDate: '2025-11-02', dueTime: '10:00', notes: 'Check on new patient registration' },
  { practiceId: 'prac-008', dueDate: '2025-11-03', dueTime: '14:00', notes: 'Review updated opening hours' },
  { practiceId: 'prac-009', dueDate: '2025-11-04', dueTime: '11:30', notes: 'Discuss vacation period coverage' },
  { practiceId: 'prac-010', dueDate: '2025-11-05', dueTime: '09:00', notes: 'Follow up on equipment delivery' },
  { practiceId: 'prac-011', dueDate: '2025-11-05', dueTime: '16:00', notes: 'Confirm doctor availability for consultation' },
  { practiceId: 'prac-012', dueDate: '2025-11-06', dueTime: '13:00', notes: 'Review quarterly performance metrics' },
  { practiceId: 'prac-013', dueDate: '2025-11-07', dueTime: '10:00', notes: 'Schedule staff training session' }
];

// FUTURE - 6 practices (Nov 8+, 2025)
const futureFollowUps = [
  { practiceId: 'prac-014', dueDate: '2025-11-10', dueTime: '09:00', notes: 'Monthly check-in call' },
  { practiceId: 'prac-015', dueDate: '2025-11-12', dueTime: '14:00', notes: 'Review contract renewal terms' },
  { practiceId: 'prac-016', dueDate: '2025-11-15', dueTime: '11:00', notes: 'Quarterly business review meeting' },
  { practiceId: 'prac-017', dueDate: '2025-11-18', dueTime: '10:30', notes: 'Discuss new service offerings' },
  { practiceId: 'prac-018', dueDate: '2025-11-22', dueTime: '15:00', notes: 'Plan year-end inventory review' },
  { practiceId: 'prac-019', dueDate: '2025-11-28', dueTime: '09:30', notes: 'Follow up on expansion plans' }
];

// Create all follow-ups
[...urgentFollowUps, ...thisWeekFollowUps, ...futureFollowUps].forEach(fu => {
  data.followUps.push(createFollowUp(fu.practiceId, fu.dueDate, fu.dueTime, fu.notes));
});

// Save updated data
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');

console.log('✅ Follow-ups simplified successfully!');
console.log(`📊 Distribution:`);
console.log(`   - Urgent (overdue/due today): ${urgentFollowUps.length} practices`);
console.log(`   - This Week (Nov 2-7): ${thisWeekFollowUps.length} practices`);
console.log(`   - Future (Nov 8+): ${futureFollowUps.length} practices`);
console.log(`   - No Follow-ups: ${31 - (urgentFollowUps.length + thisWeekFollowUps.length + futureFollowUps.length)} practices`);
console.log(`   - Total follow-ups: ${data.followUps.length}`);
