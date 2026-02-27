import { generateScheduleData, Member } from '../components/tools/scheduler/scheduler';

async function runTest() {
  console.log('Running Specialist vs Time-Off Fairness Reproduction Test...');

  const members: Member[] = [
    { id: 1, name: 'Dmytro', timeOffs: [], weekendOnly: false, maxWeekendSlots: null, allowedWeekdays: [] },
    { id: 2, name: 'Yaroslav', timeOffs: [], weekendOnly: false, maxWeekendSlots: null, allowedWeekdays: [] },
    { id: 3, name: 'Lev', timeOffs: [], weekendOnly: false, maxWeekendSlots: null, allowedWeekdays: [] },
    { id: 4, name: 'Vadym', timeOffs: [], weekendOnly: false, maxWeekendSlots: null, allowedWeekdays: [] },
    { id: 5, name: 'Serhii', timeOffs: [], weekendOnly: false, maxWeekendSlots: null, allowedWeekdays: [] },
    { id: 6, name: 'Oleksandr', timeOffs: [], weekendOnly: true, maxWeekendSlots: 3, allowedWeekdays: [] },
    { id: 7, name: 'Oleksii', timeOffs: [
      { start: '2026-03-18T00:00:00.000Z', end: '2026-03-31T00:00:00.000Z' }
    ], weekendOnly: false, maxWeekendSlots: null, allowedWeekdays: [] },
  ];

  // March 2026 has 31 days
  const { stats } = generateScheduleData(2, 2026, members);

  console.log('Stats:', JSON.stringify(stats, null, 2));

  // Expectations:
  // Oleksii (ID 7) should have 2-3 shifts (proportional to his 17/31 presence)
  // Oleksandr (ID 6) should have 3 shifts (his cap, because he is present all month and cap < average)
  
  if (stats[6].total < 3) {
    console.log(`FAIL: Oleksandr (ID 6) has only ${stats[6].total} shifts, expected 3`);
  } else {
    console.log(`PASS: Oleksandr (ID 6) has ${stats[6].total} shifts`);
  }

  if (stats[7].total > 3) {
    console.log(`FAIL: Oleksii (ID 7) has ${stats[7].total} shifts, expected 2-3`);
  } else {
    console.log(`PASS: Oleksii (ID 7) has ${stats[7].total} shifts`);
  }
}

runTest().catch(console.error);
