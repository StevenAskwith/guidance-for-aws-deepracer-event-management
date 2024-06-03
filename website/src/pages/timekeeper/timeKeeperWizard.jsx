import {
  Box,
  BreadcrumbGroup,
  Button,
  Form,
  Modal,
  SpaceBetween,
  Wizard
} from '@cloudscape-design/components';
import { API } from 'aws-amplify';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EventSelectorModal } from '../../components/eventSelectorModal';
import * as mutations from '../../graphql/mutations';
import { useLocalStorage } from '../../hooks/useLocalStorage';
// import * as queries from '../../graphql/queries';
// import * as subscriptions from '../../graphql/subscriptions'
import useMutation from '../../hooks/useMutation';
import {
  useSelectedEventContext,
  useSelectedTrackContext,
} from '../../store/contexts/storeProvider';
import { useStore } from '../../store/store';
import { CarSelector } from './components/carSelector';
import { ModelSelector } from './components/modelSelector';
import { UploadModelToCar } from './components/uploadModelsToCar';
import { RaceFinishPage } from './pages/raceFinishPageLite';
import { RacePage } from './pages/racePageLite';
import { RaceSetupPage } from './pages/raceSetupPageLite';
import { getAverageWindows } from './support-functions/averageClaculations';
import { defaultRace } from './support-functions/raceDomain';

export const TimekeeperWizard = () => {
  const { t } = useTranslation();
  const [activeStepIndex, setActiveStepIndex] = useLocalStorage('DREM-timekeeper-activeStepIndex', 0);
  const [previousStepIndex, setPreviousStepIndex] = useLocalStorage('DREM-timekeeper-previousStepIndex', 0);
  const [raceConfig, setRaceConfig] = useLocalStorage('DREM-timekeeper-race-config', {});
  const [race, setRace] = useLocalStorage('DREM-timekeeper-current-race', defaultRace);
  const [fastestLap, SetFastestLap] = useState([]);
  const [fastestAverageLap, setFastestAverageLap] = useState([]);
  const selectedEvent = useSelectedEventContext();
  const selectedTrack = useSelectedTrackContext();
  const [eventSelectModalVisible, setEventSelectModalVisible] = useState(false);
  const [selectedModels, setSelectedModels] = useState([]);
  const [clearModelsOnCarToggle, setClearModelsOnCarToggle] = useLocalStorage('DREM-timekeeper-clearModelsOnCarToggle', true);
  const [selectedCars, setSelectedCars] = useState([]);
  const [errorText, setErrorText] = useState('');
  const [isLoadingNextStep, setIsLoadingNextStep] = useState(false);
  const [sendMutation, loading, errorMessage, data] = useMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const messageDisplayTime = 4000;
  const notificationId = '';

  // delete models from Cars
  async function carDeleteAllModels() {
    const InstanceIds = selectedCars.map((i) => i.InstanceId);

    const response = await API.graphql({
      query: mutations.carDeleteAllModels,
      variables: { resourceIds: InstanceIds },
    });
  }

  // check if active index is timekeeper and set isLoading to true if it is
  useEffect(() => {
    if (activeStepIndex === 4) {
      setIsLoadingNextStep(true);
    }
  },[activeStepIndex])

  useEffect(() => {
    console.log("username:", race.username)
    setSelectedModels([])
  },[race.username])

  // Show event selector modal if no event has been selected, timekeeper must have an event selected to work
  useEffect(() => {
    if (selectedEvent.eventId == null) {
      setEventSelectModalVisible(true);
    }
  }, [selectedEvent]);

  const [, dispatch] = useStore();
  // change event info and race config when a user select another event
  useEffect(() => {
    if (selectedEvent.eventId !== race.eventId) {
      let raceDetails = selectedEvent.raceConfig;
      raceDetails['eventName'] = selectedEvent.eventName;
      setRaceConfig(raceDetails);

      const modifiedRace = { ...race, eventId: selectedEvent.eventId };
      setRace(modifiedRace);
    }
  }, [selectedEvent, selectedTrack, setRace, setRaceConfig]);

  // Reset the timekeeper when navigating away from the timekeeper
  useEffect(() => {
    return () => {
      setRaceConfig({});
      setPreviousStepIndex(0);
      setActiveStepIndex(0);
      setIsModalOpen(false);
      setRace(defaultRace);
    };
  }, []);

  useEffect(() => {
    dispatch('SIDE_NAV_IS_OPEN', false);
  }, [dispatch]);

  // Ensures Laps are cleared when wizard is reset.
  useEffect(() => {
    if (race.username === null){
      race.laps = [];
    }
  }, [race.username])

  // Find the fastest lap and fastest average window
  useEffect(() => {
    if (race.laps && race.laps.length) {
      // Get all valid laps
      const validLaps = race.laps.filter((o) => {
        return o.isValid === true;
      });
      if (validLaps.length) {
        // Find fastest time
        var res = Math.min.apply(
          Math,
          validLaps.map((o) => {
            return o.time;
          })
        );
        // Get object with the fastest time
        const obj = validLaps.find((o) => {
          return o.time === res;
        });
        SetFastestLap([obj]);
      } else {
        SetFastestLap([]);
      }
    } else {
      SetFastestLap([]);
    }

    race.averageLaps = getAverageWindows(race.laps, raceConfig.averageLapsWindow);
    if (race.averageLaps.length > 0) {
      const fastestAvgLap = race.averageLaps.reduce((acc, currentValue) => {
        return acc.avgTime > currentValue.avgTime ? currentValue : acc;
      });
      setFastestAverageLap([fastestAvgLap]);
    } else {
      setFastestAverageLap([]);
    }
    console.info("Find the fastest lap and fastest average window:", race);
  }, [race.laps]);

  // handlers functions
  const actionHandler = (id) => {
    console.debug('alter lap status for lap id: ' + id);
    const lapsCopy = [...race.laps];
    const updatedLap = { ...race.laps[id] };
    updatedLap.isValid = !updatedLap.isValid;
    lapsCopy[id] = updatedLap;
    setRace({ ...race, laps: lapsCopy });
  };

  const raceIsDoneHandler = () => {
    setIsLoadingNextStep(false)
    setPreviousStepIndex(5);
    setActiveStepIndex(5);
  };

  const raceInfoHandler = (event) => {
    console.info('Race Info Handler');
    console.info(event);
    setRace({ ...race, ...event });
  };

  const resetRacehandler = () => {
    console.info('Reset Race Handler');
    setRace(defaultRace);
    setRaceConfig({});
    SetFastestLap([]);
    setFastestAverageLap([]);
    setErrorText("");

    setPreviousStepIndex(0);
    setActiveStepIndex(0);
    setIsModalOpen(false);
    setIsLoadingNextStep(false);
  };

  async function handleOnNavigate(detail) {
    console.log("handleOnNavigate", detail);
    if (activeStepIndex === 0 && race.username === null) {
      // console.log("race", race);
      setErrorText(t("timekeeper.wizard.select-racer-error"));
    } else if (activeStepIndex === 1 && selectedCars.length === 0 && detail.reason === "next") {
      setErrorText(t("timekeeper.wizard.no-car-selected-error"));
    } else if (activeStepIndex === 2 && selectedModels.length === 0 && detail.reason === "next") {
      setErrorText(t("timekeeper.wizard.no-models-selected-error"));
    } else if (activeStepIndex === 2 && selectedModels.length > 0 && detail.reason === "next" && clearModelsOnCarToggle) {
      setIsModalOpen(true);
    }
    else if (detail.reason === "previous") {
      console.log("previous");
      setIsLoadingNextStep(false)
      setPreviousStepIndex(previousStepIndex - 1)
      setActiveStepIndex(previousStepIndex)
      setErrorText("");
    } else {
      setIsLoadingNextStep(false)
      setPreviousStepIndex(activeStepIndex);
      setActiveStepIndex(detail.requestedStepIndex)
      setErrorText("");
    }
  }

  // Clear the notification is submit is successful and go back to racer selector page again
  useEffect(() => {
    if (!loading && !errorMessage && data) {
      setTimeout(() => {
        dispatch('DISMISS_NOTIFICATION', notificationId);
        //SetButtonsIsDisabled(false);
        resetRacehandler();
      }, messageDisplayTime);
    }
  }, [errorMessage, loading]);

  const submitRaceHandler = async () => {
    //SetButtonsIsDisabled(true);
    console.log("race:", race);

    sendMutation('updateOverlayInfo', {
      eventId: race.eventId,
      eventName: raceConfig.eventName,
      trackId: race.trackId,
      username: race.username,
      userId: race.userId,
      laps: race.laps,
      averageLaps: race.averageLaps,
      timeLeftInMs: 0,
      raceStatus: 'RACE_SUBMITTED',
    });
    sendMutation('addRace', { ...race });
  };

  const discardRaceHandler = () => {
    //SetButtonsIsDisabled(true);
    //setWarningModalVisible(false);
    dispatch('ADD_NOTIFICATION', {
      type: 'warning',
      content: t('timekeeper.end-session.race-discarded'),
      id: notificationId,
      dismissible: true,
      onDismiss: () => {
        dispatch('DISMISS_NOTIFICATION', notificationId);
      },
    });
    setTimeout(() => {
      //SetButtonsIsDisabled(false);
      dispatch('DISMISS_NOTIFICATION', notificationId);
      resetRacehandler();
    }, messageDisplayTime);
  };

  const breadcrumbs = [
    { text: t('home.breadcrumb'), href: '/' },
    { text: t('operator.breadcrumb'), href: '/admin/home' },
    { text: t('topnav.time-keeper-wizard'), href: '/admin/timekeeper-wizard' },
  ]

  // JSX
  return <>
    <EventSelectorModal
      visible={eventSelectModalVisible}
      onDismiss={() => setEventSelectModalVisible(false)}
      onOk={() => setEventSelectModalVisible(false)}
    />
    <Modal
      onDismiss={() => {
        setIsModalOpen(false);
      }}
      visible={isModalOpen}
      closeAriaLabel={t('carmodelupload.close-modal-ari-label')}
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button
              variant="link"
              onClick={() => {
                setIsModalOpen(false);
              }}
            >
              {t('button.cancel')}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                carDeleteAllModels();
                setIsModalOpen(false);
                setPreviousStepIndex(2);
                setActiveStepIndex(3);
                setErrorText("");
              }}
            >
              {t('carmodelupload.header-delete-upload')}
            </Button>
          </SpaceBetween>
        </Box>
      }
      header={t('carmodelupload.header-delete')}
    >
      {t('carmodelupload.header-delete-confirm')}: <br></br>{' '}
      {selectedCars.map((selectedCars) => {
        return selectedCars.ComputerName + ' ';
      })}
    </Modal>
    <BreadcrumbGroup items={breadcrumbs} ariaLabel="Breadcrumbs" />
    <Form errorText={errorText}>
      <Wizard
          i18nStrings={{
          stepNumberLabel: (stepNumber) => `Step ${stepNumber}`,
          collapsedStepsLabel: (stepNumber, stepsCount) =>
            `Step ${stepNumber} of ${stepsCount}`,
          skipToButtonLabel: (step, stepNumber) => `Skip to ${step.title}`,
          navigationAriaLabel: t("common.steps"),
          cancelButton: t("button.cancel"),
          previousButton: t("button.previous"),
          nextButton: t("button.next"),
          submitButton: t("button.submit-race"),
          optional: t("button.optional"),
        }}
        onNavigate={({ detail }) => handleOnNavigate(detail)}
        onSubmit={({ detail }) => {
          console.log("Submit Race");
          submitRaceHandler();
        }}
        onCancel={() => {
          // console.log("Reset Wizard")
          resetRacehandler();
        }}
        activeStepIndex={activeStepIndex}
        isLoadingNextStep={isLoadingNextStep}
        allowSkipTo={true}
        steps={[
          {
            title: t("timekeeper.wizard.select-racer"),
            content: (
              <RaceSetupPage race={race} setRace={setRace}/>
            ),
            isOptional: false,
          },
          {
            title: t("timekeeper.wizard.select-car"),
            content: (
              <CarSelector query={{
                tokens: [{ propertyKey: 'fleetName', value: selectedTrack.fleetId, operator: '=' }],
                operation: 'and',
              }}
              selectedCars={selectedCars} setSelectedCars={setSelectedCars}/>
            ),
            isOptional: true,
          },
          {
            title: t("timekeeper.wizard.select-models"),
            content: (
              <ModelSelector query={{
                tokens: [{ propertyKey: 'username', value: race.username, operator: '=' }],
                operation: 'and',
              }}
              selectedModels={selectedModels}
              setSelectedModels={setSelectedModels}
              clearModelsOnCarToggle={clearModelsOnCarToggle}
              setClearModelsOnCarToggle={setClearModelsOnCarToggle}
              />
            ),
            isOptional: true,
          },
          {
            title: t("timekeeper.wizard.upload-progress"),
            content: (
              <UploadModelToCar cars={selectedCars} event={selectedEvent} modelsToUpload={selectedModels}/>
            ),
            isOptional: true,
          },
          {
            title: t("timekeeper.wizard.timekeeper"),
            content: (
              <RacePage
                raceInfo={race}
                setRaceInfo={raceInfoHandler}
                fastestLap={fastestLap}
                fastestAverageLap={fastestAverageLap}
                raceConfig={raceConfig}
                onNext={raceIsDoneHandler}
                selectedCar={selectedCars[0]}
              />
            ),
            isOptional: false,
          },
          {
            title: t("timekeeper.wizard.submit-race"),
            content: (
              <RaceFinishPage
                eventName={raceConfig.eventName}
                raceInfo={race}
                fastestLap={fastestLap}
                fastestAverageLap={fastestAverageLap}
                raceConfig={raceConfig}
                onAction={actionHandler}
                onNext={resetRacehandler}
                submitRaceHandler={submitRaceHandler}
                discardRaceHandler={discardRaceHandler}
              />
            ),
            isOptional: false,
          },
        ]}
      />
    </Form>
  </>;
};
