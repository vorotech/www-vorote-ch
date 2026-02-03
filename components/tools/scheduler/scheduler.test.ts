import { generateScheduleData, Member } from './scheduler';

export interface SimulationResult {
  iterations: number;
  memberStats: Record<
    number,
    {
      avgTotal: number;
      minTotal: number;
      maxTotal: number;
      avgWeekend: number;
    }
  >;
  fairness: {
    avgSpread: number; // Average difference between max and min shifts in a run
    maxSpread: number; // Max difference seen in any run
    perfectRuns: number; // Number of runs where spread was <= 1
  };
}

export const runSimulation = (month: number, year: number, members: Member[], iterations: number = 100): SimulationResult => {
  const memberStats: Record<number, { totalSum: number; weekendSum: number; min: number; max: number }> = {};
  let totalSpread = 0;
  let maxSpread = 0;
  let perfectRuns = 0;

  members.forEach((m) => {
    memberStats[m.id] = { totalSum: 0, weekendSum: 0, min: Infinity, max: -Infinity };
  });

  for (let i = 0; i < iterations; i++) {
    const { stats } = generateScheduleData(month, year, members);

    let runMin = Infinity;
    let runMax = -Infinity;

    members.forEach((m) => {
      const s = stats[m.id];
      const ms = memberStats[m.id];

      ms.totalSum += s.total;
      ms.weekendSum += s.weekend;
      ms.min = Math.min(ms.min, s.total);
      ms.max = Math.max(ms.max, s.total);

      runMin = Math.min(runMin, s.total);
      runMax = Math.max(runMax, s.total);
    });

    const spread = runMax - runMin;
    totalSpread += spread;
    maxSpread = Math.max(maxSpread, spread);
    if (spread <= 1) perfectRuns++;
  }

  const resultStats: SimulationResult['memberStats'] = {};
  members.forEach((m) => {
    const ms = memberStats[m.id];
    resultStats[m.id] = {
      avgTotal: Number((ms.totalSum / iterations).toFixed(2)),
      minTotal: ms.min,
      maxTotal: ms.max,
      avgWeekend: Number((ms.weekendSum / iterations).toFixed(2)),
    };
  });

  return {
    iterations,
    memberStats: resultStats,
    fairness: {
      avgSpread: Number((totalSpread / iterations).toFixed(2)),
      maxSpread,
      perfectRuns,
    },
  };
};

/*
    INSTRUCTIONS:
    1. Go to the Scheduler UI Settings.
    2. Click 'Export Config for Testing' to copy your current configuration.
    3. Add a new object to the `testCases` array below.
    4. Paste the configuration properties into the new object.
    5. Run this file using a TypeScript runner (e.g., `npx tsx components/tools/scheduler/scheduler.test.ts`).
*/

interface TestCase {
  name: string;
  config: {
    month: number;
    year: number;
    members: Member[];
  };
  expectations?: {
    // Optional: Add specific expectations here if needed in future
  };
}

// --- DEFINE TEST CASES BELOW ---
const testCases: TestCase[] = [
  {
    name: 'Default 3 Person Scenario',
    config: {
      month: 0,
      year: 2026,
      members: [
        { id: 1, name: 'Person 1', timeOffs: [], weekendOnly: false, maxWeekendSlots: null, allowedWeekdays: [] },
        { id: 2, name: 'Person 2', timeOffs: [], weekendOnly: false, maxWeekendSlots: null, allowedWeekdays: [] },
        { id: 3, name: 'Person 3', timeOffs: [], weekendOnly: false, maxWeekendSlots: null, allowedWeekdays: [] },
      ],
    },
  },
  {
    name: 'Team 7 members with 2 weekends only',
    config: {
      month: 0,
      year: 2026,
      members: [
        {
          id: 1,
          name: 'Person 1',
          weekendOnly: true,
          maxWeekendSlots: null,
          allowedWeekdays: [0, 6],
          timeOffs: [
            {
              start: '2026-01-07T00:00:00.000Z',
              end: '2026-01-11T00:00:00.000Z',
            },
          ],
        },
        {
          id: 2,
          name: 'Person 2',
          weekendOnly: false,
          maxWeekendSlots: null,
          allowedWeekdays: [],
          timeOffs: [
            {
              start: '2026-01-09T00:00:00.000Z',
              end: '2026-01-14T00:00:00.000Z',
            },
          ],
        },
        {
          id: 3,
          name: 'Person 3',
          weekendOnly: false,
          maxWeekendSlots: null,
          allowedWeekdays: [2, 1, 0, 4, 5],
          timeOffs: [
            {
              start: '2026-01-21T00:00:00.000Z',
              end: '2026-01-21T00:00:00.000Z',
            },
          ],
        },
        {
          id: 4,
          name: 'Person 4',
          weekendOnly: false,
          maxWeekendSlots: null,
          allowedWeekdays: [],
          timeOffs: [
            {
              start: '2026-01-09T00:00:00.000Z',
              end: '2026-01-19T00:00:00.000Z',
            },
          ],
        },
        {
          id: 5,
          name: 'Person 5',
          weekendOnly: true,
          maxWeekendSlots: 3,
          allowedWeekdays: [0, 6],
          timeOffs: [
            {
              start: '2026-01-18T00:00:00.000Z',
              end: '2026-01-31T00:00:00.000Z',
            },
          ],
        },
        {
          id: 6,
          name: 'Person 6',
          weekendOnly: false,
          maxWeekendSlots: null,
          allowedWeekdays: [],
          timeOffs: [
            {
              start: '2026-01-27T00:00:00.000Z',
              end: '2026-01-31T00:00:00.000Z',
            },
          ],
        },
        {
          id: 7,
          name: 'Person 7',
          weekendOnly: false,
          maxWeekendSlots: null,
          allowedWeekdays: [],
          timeOffs: [],
        },
      ],
    },
  },
  {
    name: 'February 2026 - Weekly Distribution Test',
    config: {
      month: 1, // February
      year: 2026,
      members: [
        {
          id: 1,
          name: 'Person 1',
          weekendOnly: true,
          maxWeekendSlots: null,
          allowedWeekdays: [0, 6],
          timeOffs: [
            {
              start: '2026-01-07T00:00:00.000Z',
              end: '2026-01-11T00:00:00.000Z',
            },
          ],
        },
        {
          id: 2,
          name: 'Person 2',
          weekendOnly: false,
          maxWeekendSlots: null,
          allowedWeekdays: [],
          timeOffs: [
            {
              start: '2026-01-09T00:00:00.000Z',
              end: '2026-01-14T00:00:00.000Z',
            },
          ],
        },
        {
          id: 3,
          name: 'Person 3',
          weekendOnly: false,
          maxWeekendSlots: null,
          allowedWeekdays: [],
          timeOffs: [
            {
              start: '2026-01-21T00:00:00.000Z',
              end: '2026-01-21T00:00:00.000Z',
            },
          ],
        },
        {
          id: 4,
          name: 'Person 4',
          weekendOnly: false,
          maxWeekendSlots: null,
          allowedWeekdays: [],
          timeOffs: [
            {
              start: '2026-01-09T00:00:00.000Z',
              end: '2026-01-19T00:00:00.000Z',
            },
          ],
        },
        {
          id: 5,
          name: 'Person 5',
          weekendOnly: true,
          maxWeekendSlots: 3,
          allowedWeekdays: [0, 6],
          timeOffs: [
            {
              start: '2026-01-18T00:00:00.000Z',
              end: '2026-01-31T00:00:00.000Z',
            },
          ],
        },
        {
          id: 6,
          name: 'Person 6',
          weekendOnly: false,
          maxWeekendSlots: null,
          allowedWeekdays: [],
          timeOffs: [
            {
              start: '2026-01-27T00:00:00.000Z',
              end: '2026-01-31T00:00:00.000Z',
            },
          ],
        },
        {
          id: 7,
          name: 'Person 7',
          weekendOnly: false,
          maxWeekendSlots: null,
          allowedWeekdays: [],
          timeOffs: [],
        },
      ],
    },
  },
  // Paste new exported configs here as new objects:
  // {
  //    name: "Scenario Name",
  //    config: ... (pasted content)
  // }
];
// ---------------------------------

console.log(`\nFound ${testCases.length} test cases. Starting simulations...\n`);

testCases.forEach((testCase, index) => {
  console.log(`\n================================================================`);
  console.log(`TEST CASE ${index + 1}: ${testCase.name}`);
  console.log(`================================================================`);

  const { config } = testCase;
  console.log(`Running simulation for ${config.members.length} members over 100 iterations...`);

  // Ensure dates are parsed as Dates if they came from JSON
  const membersWithDates = config.members.map((m) => ({
    ...m,
    timeOffs: m.timeOffs.map((t) => ({
      start: new Date(t.start),
      end: new Date(t.end),
    })),
  }));

  const result = runSimulation(config.month, config.year, membersWithDates, 100);

  console.log('\n--- Simulation Results ---');
  console.log(`Fairness Score (Perfect Runs): ${result.fairness.perfectRuns}%`);
  console.log(`Average Spread: ${result.fairness.avgSpread}`);
  console.log(`Max Spread: ${result.fairness.maxSpread}`);

  console.log('\n--- Member Stats (Avg Shifts) ---');
  Object.entries(result.memberStats).forEach(([id, stats]) => {
    const member = config.members.find((m) => m.id === Number(id));
    console.log(`- ${member?.name.padEnd(15)}: ${stats.avgTotal} (Range: ${stats.minTotal}-${stats.maxTotal}) | Wknd: ${stats.avgWeekend}`);
  });
});
