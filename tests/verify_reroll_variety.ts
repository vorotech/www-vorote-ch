import { generateScheduleData, Member } from '../components/tools/scheduler/scheduler';

async function runTest() {
  console.log('Running Reroll Variety Test...');

  const members: Member[] = [
    { id: 1, name: 'Dmytro', timeOffs: [], weekendOnly: false, maxWeekendSlots: null, allowedWeekdays: [] },
    { id: 2, name: 'Yaroslav', timeOffs: [], weekendOnly: false, maxWeekendSlots: null, allowedWeekdays: [] },
    { id: 3, name: 'Lev', timeOffs: [], weekendOnly: false, maxWeekendSlots: null, allowedWeekdays: [] },
    { id: 4, name: 'Vadym', timeOffs: [], weekendOnly: false, maxWeekendSlots: null, allowedWeekdays: [] },
  ];

  const results: Record<number, Set<number>> = { 1: new Set(), 2: new Set(), 3: new Set(), 4: new Set() };

  for (let seed = 0; seed < 100; seed++) {
    const { stats } = generateScheduleData(2, 2026, members, 8, seed);
    for (const id of [1,2,3,4]) {
      results[id].add(stats[id].total);
    }
  }

  console.log('Total Shift Variations per Member (should be {7, 8} for most):');
  let hasVariety = false;
  for (const id of [1,2,3,4]) {
    const variations = Array.from(results[id]).sort();
    console.log(`Member ${id}: {${variations.join(', ')}}`);
    if (variations.length > 1) hasVariety = true;
  }

  if (hasVariety) {
    console.log('PASS: Members now have varying total shift counts across different seeds.');
  } else {
    console.log('FAIL: Members still have static total shift counts.');
  }
}

runTest().catch(console.error);
