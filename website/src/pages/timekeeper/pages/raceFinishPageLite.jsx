import {
  Box,
  Button,
  Container,
  Grid,
  Header,
  Modal,
  SpaceBetween,
} from '@cloudscape-design/components';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RaceTypeEnum } from '../../../admin/events/support-functions/raceConfig';
import { FastestAverageLapTable } from '../components/fastesAverageLapTable';
import { LapTable } from '../components/lapTable';
import { Breadcrumbs } from '../support-functions/supportFunctions';

export const RaceFinishPage = ({
  eventName,
  raceInfo,
  fastestLap = [],
  fastestAverageLap = [],
  raceConfig,
  onAction,
  onNext,
  submitRaceHandler,
  discardRaceHandler
}) => {
  const { t } = useTranslation(['translation', 'help-admin-timekeeper-race-finish']);
  const [buttonsIsDisabled, SetButtonsIsDisabled] = useState(false);
  //const [sendMutation, loading, errorMessage, data] = useMutation();
  const [warningModalVisible, setWarningModalVisible] = useState(false);
  //const [, dispatch] = useStore();
  //const messageDisplayTime = 4000;
  //const notificationId = '';

  // // Clear the notification is submit is successful and go back to racer selector page again
  // useEffect(() => {
  //   if (!loading && !errorMessage && data) {
  //     setTimeout(() => {
  //       dispatch('DISMISS_NOTIFICATION', notificationId);
  //       SetButtonsIsDisabled(false);
  //       onNext();
  //     }, messageDisplayTime);
  //   }
  // }, [errorMessage, loading]);

  // const submitRaceHandler = async () => {
  //   SetButtonsIsDisabled(true);
  //   console.log(raceInfo);

  //   sendMutation('updateOverlayInfo', {
  //     eventId: raceInfo.eventId,
  //     eventName: raceConfig.eventName,
  //     trackId: raceInfo.trackId,
  //     username: raceInfo.username,
  //     userId: raceInfo.userId,
  //     laps: raceInfo.laps,
  //     averageLaps: raceInfo.averageLaps,
  //     timeLeftInMs: 0,
  //     raceStatus: 'RACE_SUBMITTED',
  //   });
  //   sendMutation('addRace', { ...raceInfo });
  // };

  // const discardRaceHandler = () => {
  //   SetButtonsIsDisabled(true);
  //   setWarningModalVisible(false);
  //   dispatch('ADD_NOTIFICATION', {
  //     type: 'warning',
  //     content: t('timekeeper.end-session.race-discarded'),
  //     id: notificationId,
  //     dismissible: true,
  //     onDismiss: () => {
  //       dispatch('DISMISS_NOTIFICATION', notificationId);
  //     },
  //   });
  //   setTimeout(() => {
  //     SetButtonsIsDisabled(false);
  //     dispatch('DISMISS_NOTIFICATION', notificationId);
  //     onNext();
  //   }, messageDisplayTime);
  // };

  const raceInfoPanel = (
    <Container header={<Header>{t('timekeeper.end-session.race-info')}</Header>}>
      <SpaceBetween direction="vertical" size="l">
        <Box>
          <Header variant="h3">{t('topnav.event')}</Header>
          {eventName}
        </Box>
        <Box>
          <Header variant="h3">{t('events.track-type')}</Header>
          {raceInfo.trackId}
        </Box>
        <Box>
          <Header variant="h3">{t('timekeeper.end-session.customer')}</Header>
          {raceInfo.username}
        </Box>
        <Box>
          <Header variant="h3">{t('timekeeper.end-session.raced-by-proxy')}</Header>
          {raceInfo.racedByProxy ? t('common.yes') : t('common.no')}
        </Box>
      </SpaceBetween>
    </Container>
  );

  let fastestAverageLapInformation = <></>;
  if (raceConfig.rankingMethod === RaceTypeEnum.BEST_AVERAGE_LAP_TIME_X_LAP) {
    fastestAverageLapInformation = <FastestAverageLapTable fastestAverageLap={fastestAverageLap} />;
  }

  const lapsPanel = (
    <Container header={<Header>{t('timekeeper.end-session.laps-panel-header')}</Header>}>
      <SpaceBetween size="m" direction="vertical">
        <LapTable
          header={t('timekeeper.fastest-lap')}
          variant="embedded"
          laps={fastestLap}
          onAction={onAction}
        />
        {fastestAverageLapInformation}
        <hr></hr>
        <LapTable
          header={t('timekeeper.recorded-laps')}
          variant="embedded"
          laps={raceInfo.laps}
          averageLapInformation={raceInfo.averageLaps}
          rankingMethod={raceConfig.rankingMethod}
          onAction={onAction}
        />
      </SpaceBetween>
    </Container>
  );

  // const actionButtons = (
  //   <Box float="right">
  //     <SpaceBetween direction="horizontal" size="xs">
  //       <Button
  //         variant="link"
  //         disabled={buttonsIsDisabled}
  //         onClick={() => setWarningModalVisible(true)}
  //       >
  //         {t('timekeeper.end-session.discard-race')}
  //       </Button>
  //       <Button variant="primary" disabled={buttonsIsDisabled} onClick={submitRaceHandler}>
  //         {t('timekeeper.end-session.submit-race')}
  //       </Button>
  //     </SpaceBetween>
  //   </Box>
  // );

  const warningModal = (
    <Modal
      onDismiss={() => setWarningModalVisible(false)}
      visible={warningModalVisible}
      closeAriaLabel="Warning"
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button
              variant="link"
              disabled={buttonsIsDisabled}
              onClick={() => setWarningModalVisible(false)}
            >
              {t('button.cancel')}
            </Button>
            <Button variant="primary" disabled={buttonsIsDisabled} onClick={discardRaceHandler}>
              {t('timekeeper.end-session.discard-race')}
            </Button>
          </SpaceBetween>
        </Box>
      }
      header="Warning!"
    >
      {t('timekeeper.end-session.warning-message')}
    </Modal>
  );

  const breadcrumbs = Breadcrumbs();
  return (
    <>
      <Grid gridDefinition={[{ colspan: 5 }, { colspan: 7 }, { colspan: 12 }]}>
        {raceInfoPanel}
        {lapsPanel}
        {/* {actionButtons} */}
      </Grid>

      {warningModal}
    </>
  );
};
