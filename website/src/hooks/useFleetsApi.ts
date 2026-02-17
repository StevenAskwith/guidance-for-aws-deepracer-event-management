import { API, graphqlOperation } from 'aws-amplify';
import { useEffect } from 'react';
import * as queries from '../graphql/queries';
import { onAddedFleet, onDeletedFleets, onUpdatedFleet } from '../graphql/subscriptions';
import { useStore } from '../store/store';
import { Fleet } from '../types/domain';

interface GetAllFleetsResponse {
  data: {
    getAllFleets: Fleet[];
  };
}

export function useFleetsApi(userHasAccess: boolean = false): void {
  const [, dispatch] = useStore();

  // initial data load
  useEffect(() => {
    if (userHasAccess) {
      // Get Fleets
      console.debug('GET FLEETS');
      async function getAllFleets(): Promise<void> {
        dispatch('FLEETS_IS_LOADING', true);
        const response = await API.graphql({
          query: queries.getAllFleets,
        }) as GetAllFleetsResponse;

        const fleets = response.data.getAllFleets.map((fleet) => {
          const updatedCarIds = fleet.deviceIds ? fleet.deviceIds : [];
          return { ...fleet, deviceIds: updatedCarIds };
        });
        dispatch('ADD_FLEETS', fleets);
        dispatch('FLEETS_IS_LOADING', false);
      }
      getAllFleets();
    }
    return () => {
      // Unmounting
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userHasAccess]);

  // subscribe to data changes and append them to local array
  useEffect(() => {
    let subscription: any;
    if (userHasAccess) {
      subscription = (API.graphql(graphqlOperation(onAddedFleet)) as any).subscribe({
        next: (fleet: any) => {
          dispatch('UPDATE_FLEET', fleet.value.data.onAddedFleet);
        },
        error: (error: any) => console.warn(error),
      });
    }
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userHasAccess]);

  // subscribe to updated fleets and update local array
  useEffect(() => {
    let subscription: any;
    if (userHasAccess) {
      subscription = (API.graphql(graphqlOperation(onUpdatedFleet)) as any).subscribe({
        next: (fleet: any) => {
          const updatedFleet: Fleet = fleet.value.data.onUpdatedFleet;
          dispatch('UPDATE_FLEET', updatedFleet);
        },
        error: (error: any) => console.warn(error),
      });
    }
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userHasAccess]);

  // subscribe to delete data changes and delete them from local array
  useEffect(() => {
    let subscription: any;
    if (userHasAccess) {
      const subscribe = (): any => {
        return (API.graphql(graphqlOperation(onDeletedFleets)) as any).subscribe({
          next: (fleet: any) => {
            console.debug('DELETED FLEET: start: ' + JSON.stringify(fleet.value.data));
            const fleetIdsToDelete: string[] = fleet.value.data.onDeletedFleets.map(
              (fleet: Fleet) => fleet.fleetId
            );
            dispatch('DELETE_FLEETS', fleetIdsToDelete);
          },
          error: (error: any) => {
            console.warn(error);
          },
        });
      };
      subscription = subscribe();
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userHasAccess]);
}
