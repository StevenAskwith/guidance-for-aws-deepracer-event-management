import { generateClient } from 'aws-amplify/api';
import { useEffect, useState } from 'react';
import { onNewOverlayInfo } from '../graphql/subscriptions';
import { useWindowSize } from '../hooks/useWindowSize';
import styles from './raceInfoFooter.module.css';
import RaceOverlayInfo from './raceOverlayInfo';

const client = generateClient();

const racesStatusesWithFooterVisible = [
  //'NO_RACER_SELECTED',
  'READY_TO_START',
  'RACE_IN_PROGRESS',
  'RACE_PAUSED',
  //'RACE_FINSIHED',
];

const RaceInfoFooter = ({ eventId, trackId, visible, raceFormat }) => {
  const [raceInfo, SetRaceInfo] = useState({
    username: '',
    timeLeftInMs: null,
    raceStatus: '',
    laps: [],
    currentLapTimeInMs: null,
  });
  const [isVisible, SetIsVisible] = useState(false);

  const windowSize = useWindowSize();
  const aspectRatio = windowSize.width / windowSize.height;

  useEffect(() => {
    const subscription = client
      .graphql({
        query: onNewOverlayInfo,
        variables: { eventId: eventId, trackId: trackId },
      })
      .subscribe({
        next: ({ data }) => {
          const raceInfo = data.onNewOverlayInfo;
          if (racesStatusesWithFooterVisible.includes(raceInfo.raceStatus)) {
            SetRaceInfo((prevstate) => {
              return {
                username: raceInfo.username,
                timeLeftInMs: raceInfo.timeLeftInMs,
                raceStatus: raceInfo.raceStatus,
                laps: raceInfo.laps,
                currentLapTimeInMs: raceInfo.currentLapTimeInMs,
                averageLaps: raceInfo.averageLaps,
              };
            });
            SetIsVisible(true);
          } else {
            SetRaceInfo();
            SetIsVisible(false);
          }
        },
        error: (error) => console.warn(error),
      });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [eventId]);

  let username;
  if (raceInfo) {
    username = raceInfo.username;
    if (aspectRatio < 1.2 && username.length > 15) {
      username = username.substr(0, 20) + '...';
    } else if (username.length > 30) {
      username = username.substr(0, 30) + '...';
    }
  }
  return (
    <>
      {isVisible && visible && (
        <div className={styles.footerRoot}>
          <div>
            <span className={styles.footerCountdown}>
              <RaceOverlayInfo
                username={username}
                raceStatus={raceInfo.raceStatus}
                timeLeftInMs={raceInfo.timeLeftInMs}
                laps={raceInfo.laps}
                averageLaps={raceInfo.averageLaps}
                currentLapTimeInMs={raceInfo.currentLapTimeInMs}
                raceFormat={raceFormat}
              />
            </span>
          </div>
        </div>
      )}
    </>
  );
};

export { RaceInfoFooter };
