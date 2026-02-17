import { API, graphqlOperation } from 'aws-amplify';
import { useEffect } from 'react';
import * as queries from '../graphql/queries';
import { onAddedEvent, onDeletedEvents, onUpdatedEvent } from '../graphql/subscriptions';
import { useStore } from '../store/store';
import { Event } from '../types/domain';
import { GetEventsResponse } from '../types/api-responses';

interface UseEventsApiParams {
  selectedEvent: Event | null;
  setSelectedEvent: (event: Event) => void;
  userHasAccess?: boolean;
}

export const useEventsApi = (
  selectedEvent: Event | null, 
  setSelectedEvent: (event: Event) => void, 
  userHasAccess: boolean = false
): void => {
  const [, dispatch] = useStore();

  // initial data load
  useEffect(() => {
    if (userHasAccess) {
      async function getEvents(): Promise<void> {
        dispatch('EVENTS_IS_LOADING', true);
        const responseGetEvents = await API.graphql({
          query: queries.getEvents,
        }) as GetEventsResponse;
        const events = responseGetEvents.data.getEvents;
        const eventsInNewFormat = events.filter((event) => event.raceConfig !== null);
        dispatch('ADD_EVENTS', eventsInNewFormat);
        dispatch('EVENTS_IS_LOADING', false);
      }
      getEvents();
    }
    return () => {
      // Unmounting
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userHasAccess]);

  // subscribe to data changes and append them to local array
  useEffect(() => {
    let onAddEventSubscription: any;
    if (userHasAccess) {
      onAddEventSubscription = (API.graphql(graphqlOperation(onAddedEvent)) as any).subscribe({
        next: (event: any) => {
          console.debug('onAddedEvent received', event);
          dispatch('UPDATE_EVENT', event.value.data.onAddedEvent);
        },
      });
    }
    return () => {
      if (onAddEventSubscription) {
        onAddEventSubscription.unsubscribe();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userHasAccess]);

  // subscribe to updated events and update local array
  useEffect(() => {
    let onUpdatedEventSubscription: any;
    if (userHasAccess) {
      onUpdatedEventSubscription = (API.graphql(graphqlOperation(onUpdatedEvent)) as any).subscribe({
        next: (event: any) => {
          console.debug(event);
          const updatedEvent: Event = event.value.data.onUpdatedEvent;

          dispatch('UPDATE_EVENT', updatedEvent);

          //update the selected event if it has been updated
          if (selectedEvent != null && updatedEvent.eventId === selectedEvent.eventId) {
            console.debug('update the selected event');
            setSelectedEvent(updatedEvent);
          }
        },
      });
    }
    return () => {
      if (onUpdatedEventSubscription) {
        onUpdatedEventSubscription.unsubscribe();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userHasAccess, selectedEvent]);

  // subscribe to delete data changes and delete them from local array
  useEffect(() => {
    let onDeletedEventsSubscription: any;
    if (userHasAccess) {
      onDeletedEventsSubscription = (API.graphql(graphqlOperation(onDeletedEvents)) as any).subscribe({
        next: (event: any) => {
          const eventIdsToDelete: string[] = event.value.data.onDeletedEvents.map(
            (event: string) => JSON.parse(event).eventId
          );
          dispatch('DELETE_EVENTS', eventIdsToDelete);
        },
      });
    }
    return () => {
      if (onDeletedEventsSubscription) {
        onDeletedEventsSubscription.unsubscribe();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userHasAccess]);
};
