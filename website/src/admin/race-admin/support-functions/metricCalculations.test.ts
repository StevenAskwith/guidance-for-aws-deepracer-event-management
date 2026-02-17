import { calculateMetrics } from './metricCalculations';
import { Race } from '../../../types/domain';

describe('Race Manager', () => {
  describe('Metric Calculation', () => {
    test('race with no laps', () => {
      const noRaces: Race[] = [];

      const raceMetrics = calculateMetrics(noRaces);

      // checking the entire object to ensure no parts are missing unit tests
      expect(raceMetrics).toEqual({
        numberOfRaces: null,
        numberOfUniqueRacers: null,
        mostNumberOfRacesByUser: null,
        avgRacesPerUser: null,
        totalLaps: null,
        totalresets: null,
        avgresestsPerLap: null,
        avgLapsPerRace: null,
        avgLapTime: null,
        fastestLap: null,
        slowestLap: null,
      });
    });

    describe('Total number of races', () => {
      test('for one race', () => {
        const singleRace = [{ laps: [{ lapTime: 1000, resetCount: 10, isValid: true }], userId: '111' }];
        const raceMetrics = calculateMetrics(singleRace as any);

        expect(raceMetrics).toEqual(
          expect.objectContaining({
            numberOfRaces: 1,
          })
        );
      });

      test('for two races', () => {
        const twoRaces = [
          { laps: [{ lapTime: 1000, resetCount: 10, isValid: true }], userId: '111' },
          { laps: [{ lapTime: 1000, resetCount: 10, isValid: true }], userId: '222' },
        ];
        const raceMetrics = calculateMetrics(twoRaces as any);

        expect(raceMetrics).toEqual(
          expect.objectContaining({
            numberOfRaces: 2,
          })
        );
      });
    });

    describe('Number of unique racers', () => {
      test('for one racer', () => {
        const singleRace = [{ laps: [{ lapTime: 1000, resetCount: 10, isValid: true }], userId: '111' }];
        const raceMetrics = calculateMetrics(singleRace as any);

        expect(raceMetrics).toEqual(
          expect.objectContaining({
            numberOfUniqueRacers: 1,
          })
        );
      });

      test('for multiple races by the same racer', () => {
        const twoRaces = [
          { laps: [{ lapTime: 1000, resetCount: 10, isValid: true }], userId: '111' },
          { laps: [{ lapTime: 1000, resetCount: 10, isValid: true }], userId: '222' },
          { laps: [{ lapTime: 1000, resetCount: 10, isValid: true }], userId: '111' },
        ];
        const raceMetrics = calculateMetrics(twoRaces as any);

        expect(raceMetrics).toEqual(
          expect.objectContaining({
            numberOfUniqueRacers: 2,
          })
        );
      });
    });

    describe('User with most races', () => {
      test('user with two races - three races in total', () => {
        const races = [
          { laps: [{ lapTime: 1000, resetCount: 10, isValid: true }], userId: '111' },
          { laps: [{ lapTime: 1000, resetCount: 10, isValid: true }], userId: '222' },
          { laps: [{ lapTime: 1000, resetCount: 10, isValid: true }], userId: '111' },
        ];
        const raceMetrics = calculateMetrics(races as any);

        expect(raceMetrics).toEqual(
          expect.objectContaining({
            mostNumberOfRacesByUser: 2,
          })
        );
      });
    });

    describe('Avg races per user', () => {
      test('two races - different users', () => {
        const races = [
          { laps: [{ lapTime: 1000, resetCount: 10, isValid: true }], userId: '111' },
          { laps: [{ lapTime: 1000, resetCount: 10, isValid: true }], userId: '222' },
        ];
        const raceMetrics = calculateMetrics(races as any);

        expect(raceMetrics).toEqual(
          expect.objectContaining({
            avgRacesPerUser: '1.0',
          })
        );
      });

      test('three races - two with the same user', () => {
        const races = [
          { laps: [{ lapTime: 1000, resetCount: 10, isValid: true }], userId: '111' },
          { laps: [{ lapTime: 1000, resetCount: 10, isValid: true }], userId: '222' },
          { laps: [{ lapTime: 1000, resetCount: 10, isValid: true }], userId: '111' },
        ];
        const raceMetrics = calculateMetrics(races as any);

        expect(raceMetrics).toEqual(
          expect.objectContaining({
            avgRacesPerUser: '1.5',
          })
        );
      });
    });

    describe('Total number of resets', () => {
      test('for one race with one lap', () => {
        const totalResets = 10;
        const singleRace = [{ laps: [{ lapTime: 1000, resetCount: totalResets, isValid: true }] }];

        const raceMetrics = calculateMetrics(singleRace as any);

        expect(raceMetrics).toEqual(
          expect.objectContaining({
            totalresets: totalResets,
          })
        );
      });

      test('for one race with two laps', () => {
        const resetsLapOne = 10;
        const resetsLapTwo = 17;
        const totalResets = resetsLapOne + resetsLapTwo;
        const singleRace = [
          {
            laps: [
              { lapTime: 1000, resetCount: resetsLapOne, isValid: true },
              { lapTime: 1000, resetCount: resetsLapTwo, isValid: true },
            ],
          },
        ];
        const raceMetrics = calculateMetrics(singleRace as any);

        expect(raceMetrics).toEqual(
          expect.objectContaining({
            totalresets: totalResets,
          })
        );
      });

      test('for two races', () => {
        const resetsRaceOneLapOne = 10;
        const resetsRaceOneLapTwo = 11;
        const resetsRaceTwoLapOne = 12;
        const resetsRaceTwoLapTwo = 13;
        const totalResets =
          resetsRaceOneLapOne + resetsRaceOneLapTwo + resetsRaceTwoLapOne + resetsRaceTwoLapTwo;
        const races = [
          {
            laps: [
              { lapTime: 1000, resetCount: resetsRaceOneLapOne, isValid: true },
              { lapTime: 1000, resetCount: resetsRaceOneLapTwo, isValid: true },
            ],
          },
          {
            laps: [
              { lapTime: 1000, resetCount: resetsRaceTwoLapOne, isValid: true },
              { lapTime: 1000, resetCount: resetsRaceTwoLapTwo, isValid: true },
            ],
          },
        ];
        const raceMetrics = calculateMetrics(races as any);

        expect(raceMetrics).toEqual(
          expect.objectContaining({
            totalresets: totalResets,
          })
        );
      });
    });

    describe('Total number of laps', () => {
      test('for one race with one lap', () => {
        const singleRace = [{ laps: [{ lapTime: 1000, resetCount: 10, isValid: true }] }];

        const raceMetrics = calculateMetrics(singleRace as any);

        expect(raceMetrics).toEqual(
          expect.objectContaining({
            totalLaps: 1,
          })
        );
      });

      test('for one race with two laps', () => {
        const singleRace = [
          {
            laps: [
              { lapTime: 1000, resetCount: 10, isValid: true },
              { lapTime: 1000, resetCount: 10, isValid: true },
            ],
          },
        ];
        const raceMetrics = calculateMetrics(singleRace as any);

        expect(raceMetrics).toEqual(
          expect.objectContaining({
            totalLaps: 2,
          })
        );
      });

      test('for two races', () => {
        const races = [
          {
            laps: [
              { lapTime: 1000, resetCount: 10, isValid: true },
              { lapTime: 1000, resetCount: 10, isValid: true },
            ],
          },
          {
            laps: [
              { lapTime: 1000, resetCount: 10, isValid: true },
              { lapTime: 1000, resetCount: 10, isValid: true },
            ],
          },
        ];
        const raceMetrics = calculateMetrics(races as any);
        expect(raceMetrics).toEqual(
          expect.objectContaining({
            totalLaps: 4,
          })
        );
      });
    });

    describe('Avg resets per lap', () => {
      test('for one race with one lap', () => {
        const singleRace = [{ laps: [{ lapTime: 1000, resetCount: 10, isValid: true }] }];

        const raceMetrics = calculateMetrics(singleRace as any);

        expect(raceMetrics).toEqual(
          expect.objectContaining({
            avgresestsPerLap: '10.0',
          })
        );
      });

      test('for one race with two laps - interger', () => {
        const singleRace = [
          {
            laps: [
              { lapTime: 1000, resetCount: 10, isValid: true },
              { lapTime: 1000, resetCount: 20, isValid: true },
            ],
          },
        ];
        const raceMetrics = calculateMetrics(singleRace as any);

        expect(raceMetrics).toEqual(
          expect.objectContaining({
            avgresestsPerLap: '15.0',
          })
        );
      });

      test('for one race with two laps - float', () => {
        const singleRace = [
          {
            laps: [
              { lapTime: 1000, resetCount: 11, isValid: true },
              { lapTime: 1000, resetCount: 22, isValid: true },
            ],
          },
        ];
        const raceMetrics = calculateMetrics(singleRace as any);

        expect(raceMetrics).toEqual(
          expect.objectContaining({
            avgresestsPerLap: '16.5',
          })
        );
      });

      test('for two races - integer', () => {
        const races = [
          {
            laps: [
              { lapTime: 1000, resetCount: 10, isValid: true },
              { lapTime: 1000, resetCount: 20, isValid: true },
            ],
          },
          {
            laps: [
              { lapTime: 1000, resetCount: 30, isValid: true },
              { lapTime: 1000, resetCount: 40, isValid: true },
            ],
          },
        ];
        const raceMetrics = calculateMetrics(races as any);

        expect(raceMetrics).toEqual(
          expect.objectContaining({
            avgresestsPerLap: '25.0',
          })
        );
      });
    });

    describe('Avg Laps Per Race', () => {
      test('for one race with one lap', () => {
        const singleRace = [{ laps: [{ lapTime: 1000, resetCount: 10, isValid: true }] }];

        const raceMetrics = calculateMetrics(singleRace as any);
        expect(raceMetrics).toEqual(
          expect.objectContaining({
            avgLapsPerRace: '1.0',
          })
        );
      });

      test('for one race with two laps', () => {
        const singleRace = [
          {
            laps: [
              { lapTime: 1000, resetCount: 10, isValid: true },
              { lapTime: 1000, resetCount: 10, isValid: true },
            ],
          },
        ];
        const raceMetrics = calculateMetrics(singleRace as any);

        expect(raceMetrics).toEqual(
          expect.objectContaining({
            avgLapsPerRace: '2.0',
          })
        );
      });

      test('for two races - integer', () => {
        const races = [
          {
            laps: [
              { lapTime: 1000, resetCount: 10, isValid: true },
              { lapTime: 1000, resetCount: 10, isValid: true },
            ],
          },
          {
            laps: [
              { lapTime: 1000, resetCount: 10, isValid: true },
              { lapTime: 1000, resetCount: 10, isValid: true },
            ],
          },
        ];
        const raceMetrics = calculateMetrics(races as any);

        expect(raceMetrics).toEqual(
          expect.objectContaining({
            avgLapsPerRace: '2.0',
          })
        );
      });

      test('for two races - float', () => {
        const races = [
          {
            laps: [
              { lapTime: 1000, resetCount: 10, isValid: true },
              { lapTime: 1000, resetCount: 10, isValid: true },
            ],
          },
          {
            laps: [{ lapTime: 1000, resetCount: 10, isValid: true }],
          },
        ];
        const raceMetrics = calculateMetrics(races as any);

        expect(raceMetrics).toEqual(
          expect.objectContaining({
            avgLapsPerRace: '1.5',
          })
        );
      });
    });

    describe('Avg Laptime', () => {
      test('for one race with one lap', () => {
        const singleRace = [{ laps: [{ lapTime: 1000, resetCount: 10, isValid: true }] }];

        const raceMetrics = calculateMetrics(singleRace as any);

        expect(raceMetrics).toEqual(
          expect.objectContaining({
            avgLapTime: 1000,
          })
        );
      });

      test('for one race with two laps', () => {
        const singleRace = [
          {
            laps: [
              { lapTime: 1000, resetCount: 10, isValid: true },
              { lapTime: 3000, resetCount: 10, isValid: true },
            ],
          },
        ];
        const raceMetrics = calculateMetrics(singleRace as any);

        expect(raceMetrics).toEqual(
          expect.objectContaining({
            avgLapTime: 2000,
          })
        );
      });

      test('for two races - integer', () => {
        const races = [
          {
            laps: [
              { lapTime: 5000, resetCount: 10, isValid: true },
              { lapTime: 3000, resetCount: 10, isValid: true },
            ],
          },
          {
            laps: [
              { lapTime: 3000, resetCount: 10, isValid: true },
              { lapTime: 1000, resetCount: 10, isValid: true },
            ],
          },
        ];
        const raceMetrics = calculateMetrics(races as any);

        expect(raceMetrics).toEqual(
          expect.objectContaining({
            avgLapTime: 3000,
          })
        );
      });
    });

    describe('Fastest Laptime', () => {
      test('for one race with one lap', () => {
        const singleRace = [{ laps: [{ lapTime: 1000, resetCount: 10, isValid: true }] }];

        const raceMetrics = calculateMetrics(singleRace as any);

        expect(raceMetrics).toEqual(
          expect.objectContaining({
            fastestLap: 1000,
          })
        );
      });

      test('for one race with two laps', () => {
        const singleRace = [
          {
            laps: [
              { lapTime: 1000, resetCount: 10, isValid: true },
              { lapTime: 600, resetCount: 10, isValid: true },
            ],
          },
        ];
        const raceMetrics = calculateMetrics(singleRace as any);

        expect(raceMetrics).toEqual(
          expect.objectContaining({
            fastestLap: 600,
          })
        );
      });

      test('for one race with two laps, one not valid', () => {
        const singleRace = [
          {
            laps: [
              { lapTime: 1000, resetCount: 10, isValid: true },
              { lapTime: 600, resetCount: 10, isValid: false },
            ],
          },
        ];
        const raceMetrics = calculateMetrics(singleRace as any);

        expect(raceMetrics).toEqual(
          expect.objectContaining({
            fastestLap: 1000,
          })
        );
      });

      test('for two races - integer', () => {
        const races = [
          {
            laps: [
              { lapTime: 2000, resetCount: 10, isValid: true },
              { lapTime: 3000, resetCount: 10, isValid: true },
            ],
          },
          {
            laps: [
              { lapTime: 4000, resetCount: 10, isValid: true },
              { lapTime: 900, resetCount: 10, isValid: true },
            ],
          },
        ];
        const raceMetrics = calculateMetrics(races as any);

        expect(raceMetrics).toEqual(
          expect.objectContaining({
            fastestLap: 900,
          })
        );
      });
    });

    describe('Slowest Laptime', () => {
      test('for one race with one lap', () => {
        const singleRace = [{ laps: [{ lapTime: 7000, resetCount: 10, isValid: true }] }];

        const raceMetrics = calculateMetrics(singleRace as any);
        expect(raceMetrics).toEqual(
          expect.objectContaining({
            slowestLap: 7000,
          })
        );
      });

      test('for one race with two laps', () => {
        const singleRace = [
          {
            laps: [
              { lapTime: 5000, resetCount: 10, isValid: true },
              { lapTime: 1000, resetCount: 10, isValid: true },
            ],
          },
        ];
        const raceMetrics = calculateMetrics(singleRace as any);

        expect(raceMetrics).toEqual(
          expect.objectContaining({
            slowestLap: 5000,
          })
        );
      });

      test('for one race with two laps, one not valid', () => {
        const singleRace = [
          {
            laps: [
              { lapTime: 5000, resetCount: 10, isValid: false },
              { lapTime: 1000, resetCount: 10, isValid: true },
            ],
          },
        ];
        const raceMetrics = calculateMetrics(singleRace as any);

        expect(raceMetrics).toEqual(
          expect.objectContaining({
            slowestLap: 1000,
          })
        );
      });

      test('for two races - integer', () => {
        const races = [
          {
            laps: [
              { lapTime: 1000, resetCount: 10, isValid: true },
              { lapTime: 5000, resetCount: 10, isValid: true },
            ],
          },
          {
            laps: [
              { lapTime: 6000, resetCount: 10, isValid: true },
              { lapTime: 3000, resetCount: 10, isValid: true },
            ],
          },
        ];
        const raceMetrics = calculateMetrics(races as any);
        expect(raceMetrics).toEqual(
          expect.objectContaining({
            slowestLap: 6000,
          })
        );
      });
    });
  });
});
