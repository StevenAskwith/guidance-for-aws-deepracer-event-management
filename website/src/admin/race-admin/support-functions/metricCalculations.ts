import { Race, Lap } from '../../../types';

interface LapSummary {
  resets: number | null;
  laps: number | null;
  slowestTime: number | null;
  fasestTime: number | null;
  timeSum: number | null;
}

interface RaceMetrics {
  numberOfUniqueRacers: number | null;
  numberOfRaces: number | null;
  mostNumberOfRacesByUser: number | null;
  avgRacesPerUser: string | null;
  totalLaps: number | null;
  totalresets: number | null;
  avgresestsPerLap: string | null;
  avgLapsPerRace: string | null;
  avgLapTime: number | null;
  fastestLap: number | null;
  slowestLap: number | null;
}

const getRaceSummary = (lapsPerRace: (Lap[] | undefined)[]): LapSummary => {
  const allLaps = lapsPerRace.flat().filter((lap): lap is Lap => lap !== undefined);

  return allLaps.reduce(
    (prevValue, lap) => {
      if (lap.isValid) {
        let slowestTime = lap.lapTime;
        let fasestTime = lap.lapTime;

        if (prevValue.slowestTime != null) {
          slowestTime = prevValue.slowestTime < lap.lapTime ? lap.lapTime : prevValue.slowestTime;
        } else {
          slowestTime = lap.lapTime;
        }
        if (prevValue.fasestTime != null) {
          fasestTime = prevValue.fasestTime > lap.lapTime ? lap.lapTime : prevValue.fasestTime;
        } else {
          fasestTime = lap.lapTime;
        }

        return {
          resets: prevValue.resets != null ? prevValue.resets + (lap.resetCount || 0) : (lap.resetCount || 0),
          laps: prevValue.laps != null ? prevValue.laps + 1 : 1,
          slowestTime: slowestTime,
          fasestTime: fasestTime,
          timeSum: prevValue.timeSum != null ? prevValue.timeSum + lap.lapTime : lap.lapTime,
        };
      }
      return prevValue;
    },
    { resets: null, laps: null, slowestTime: null, fasestTime: null, timeSum: null } as LapSummary
  );
};

export const calculateMetrics = (races: Race[]): RaceMetrics => {
  const userIdsForAllRaces = races.map((item) => item.userId);
  const numberOfUniqueRacers = userIdsForAllRaces.filter(
    (value, index, self) => self.indexOf(value) === index
  ).length;

  const numberOfRacesByUserId = userIdsForAllRaces.reduce<Record<string, number>>((acc, userId) => {
    return acc[userId] ? ++acc[userId] : (acc[userId] = 1), acc;
  }, {});

  const mostNumberOfRacesByUser = Math.max(...Object.values(numberOfRacesByUserId));

  const numberOfRaces = races.length;

  const lapsPerRace = races.map((race) => (race.laps ? race.laps : undefined));
  if (lapsPerRace.length > 0) {
    const summary = getRaceSummary(lapsPerRace);

    if (summary.laps && summary.laps > 0) {
      return {
        numberOfUniqueRacers: numberOfUniqueRacers,
        numberOfRaces: numberOfRaces,
        mostNumberOfRacesByUser: mostNumberOfRacesByUser,
        avgRacesPerUser: (numberOfRaces / numberOfUniqueRacers).toFixed(1),
        totalLaps: summary.laps,
        totalresets: summary.resets,
        avgresestsPerLap: summary.resets !== null && summary.laps !== null ? (summary.resets / summary.laps).toFixed(1) : null,
        avgLapsPerRace: (summary.laps / numberOfRaces).toFixed(1),
        avgLapTime: summary.timeSum !== null && summary.laps !== null ? parseInt(String(summary.timeSum / summary.laps)) : null,
        fastestLap: summary.fasestTime,
        slowestLap: summary.slowestTime,
      };
    }
  }
  return {
    numberOfUniqueRacers: null,
    numberOfRaces: null,
    mostNumberOfRacesByUser: null,
    avgRacesPerUser: null,
    totalLaps: null,
    totalresets: null,
    avgresestsPerLap: null,
    avgLapsPerRace: null,
    avgLapTime: null,
    fastestLap: null,
    slowestLap: null,
  };
};
