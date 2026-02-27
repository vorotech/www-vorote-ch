import { generateScheduleData, Member } from '../components/tools/scheduler/scheduler';

async function runTest() {
  console.log('Running 5 vs 3 Imbalance Reproduction Test...');

  const members: Member[] = [
    { id: 1, name: 'Dmytro', timeOffs: [], weekendOnly: false, maxWeekendSlots: null, allowedWeekdays: [] },
    { id: 2, name: 'Yaroslav', timeOffs: [], weekendOnly: false, maxWeekendSlots: null, allowedWeekdays: [] },
    { id: 3, name: 'Lev', timeOffs: [], weekendOnly: false, maxWeekendSlots: null, allowedWeekdays: [] },
    { id: 4, name: 'Vadym', timeOffs: [], weekendOnly: false, maxWeekendSlots: null, allowedWeekdays: [] },
    { id: 5, name: 'Serhii', timeOffs: [], weekendOnly: false, maxWeekendSlots: null, allowedWeekdays: [] },
    { id: 6, name: 'Oleksandr', timeOffs: [], weekendOnly: true, maxWeekendSlots: 3, allowedWeekdays: [] },
    { id: 7, name: 'Oleksii', timeOffs: [], weekendOnly: false, maxWeekendSlots: null, allowedWeekdays: [] },
  ];

  // February 2026 has 28 days
  // With 7 members, everyone should ideally have 4 shifts.
  // Oleksandr is capped at 3, so one other person should have 5.
  // Everyone else (unconstrained) should have 4 or 5.
  // A result where someone unconstrained has 3 while someone else has 5 is a "spread of 2" which we want to avoid.

  const { stats } = generateScheduleData(1, 2026, members, 8, 1); // Using seed 1 which matches user's report roughly

  console.log('Stats:', JSON.stringify(stats, null, 2));

  const unconstrainedIds = [1, 2, 3, 4, 5, 7];
  const totals = unconstrainedIds.map(id => stats[id].total);
  const min = Math.min(...totals);
  const max = Math.max(...totals);
  const spread = max - min;

  console.log(`Unconstrained Spread: ${spread} (${min} to ${max})`);

  if (spread > 1) {
    console.log(`FAIL: Imbalance detected. Spread is ${spread}, should be 0 or 1.`);
  } else {
    console.log(`PASS: Spread is ${spread}.`);
  }
}

runTest().catch(console.error);
