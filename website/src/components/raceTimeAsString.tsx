// @ts-nocheck - Type checking disabled during incremental migration. TODO: Add proper props interfaces
import { convertMsToString } from '../support-functions/time';

const RaceTimeAsString = ({ timeInMS, showMills = true }) => {
  return <>{timeInMS ? convertMsToString(timeInMS, showMills) : '-'}</>;
};

export { RaceTimeAsString };
