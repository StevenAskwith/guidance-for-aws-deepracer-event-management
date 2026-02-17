import { API, graphqlOperation } from 'aws-amplify';
import { useEffect } from 'react';
import { getRaces } from '../graphql/queries';
import { onAddedRace, onDeletedRaces, onUpdatedRace } from '../graphql/subscriptions';
import { useStore } from '../store/store';
import { Race } from '../types';

interface GraphQLResponse<T> {
  data?: T;
  errors?: any[];
}

interface GetRacesData {
  getRaces: Race[];
}

interface OnAddedRaceData {
  onAddedRace: Race;
}

interface OnUpdatedRaceData {
  onUpdatedRace: Race;
}

interface OnDeletedRacesData {
  onDeletedRaces: {
    raceIds: string[];
  };
}

interface SubscriptionEvent<T> {
  value: GraphQLResponse<T>;
}

interface Subscription {
  unsubscribe: () => void;
}

export const useRacesApi = (userHasAccess: boolean, eventId: string | undefined): void => {
  const [, dispatch] = useStore();
  useEffect(() => {
    if (!eventId) {
      // used to display a message that an event need to be selected
      dispatch('RACES_IS_LOADING', false);
    } else if (eventId && userHasAccess) {
      console.debug(eventId);
      async function queryApi() {
        const response = await API.graphql(graphqlOperation(getRaces, { eventId: eventId })) as GraphQLResponse<GetRacesData>;
        console.debug('getRaces');
        const races = response.data?.getRaces;

        if (races) {
          dispatch('NEW_RACES', races);
        }
        dispatch('RACES_IS_LOADING', false);
      }
      queryApi();
    }

    return () => {
      // Unmounting
    };
  }, [dispatch, eventId, userHasAccess]);

  // subscribe to data changes and append them to local array
  useEffect(() => {
    let subscription: Subscription | undefined;
    if (eventId && userHasAccess) {
      const sub = API.graphql(graphqlOperation(onDeletedRaces, { eventId: eventId })) as any;
      subscription = sub.subscribe({
        next: (event: SubscriptionEvent<OnDeletedRacesData>) => {
          const deletedRaces = event.value.data?.onDeletedRaces;
          if (deletedRaces) {
            dispatch('DELETE_RACES', deletedRaces.raceIds);
          }
        },
        error: (error: Error) => {
          console.debug(error);
        },
      });
    }

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [dispatch, eventId, userHasAccess]);

  // subscribe to data changes and append them to local array
  useEffect(() => {
    let subscription: Subscription | undefined;
    if (eventId && userHasAccess) {
      const sub = API.graphql(graphqlOperation(onAddedRace, { eventId: eventId })) as any;
      subscription = sub.subscribe({
        next: (event: SubscriptionEvent<OnAddedRaceData>) => {
          const addedRace = event.value.data?.onAddedRace;
          if (addedRace) {
            // Add in the username
            (addedRace as any)['username'] = addedRace.userId;
            dispatch('ADD_RACES', [addedRace]);
          }
        },
      });
    }

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [dispatch, eventId, userHasAccess]);

  useEffect(() => {
    let subscription: Subscription | undefined;
    console.debug('ON UPDATE RACE SUBSCRIPTION SETUP', eventId, userHasAccess);
    if (eventId && userHasAccess) {
      const sub = API.graphql(graphqlOperation(onUpdatedRace, { eventId: eventId })) as any;
      subscription = sub.subscribe({
        next: (event: SubscriptionEvent<OnUpdatedRaceData>) => {
          console.debug('RACE UPDATE RECEIVED', event.value.data?.onUpdatedRace);
          const updatedRace = event.value.data?.onUpdatedRace;
          if (updatedRace) {
            // Add in the username
            (updatedRace as any)['username'] = updatedRace.userId;
            dispatch('UPDATE_RACE', updatedRace);
          }
        },
      });
    }

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [dispatch, eventId, userHasAccess]);
};
