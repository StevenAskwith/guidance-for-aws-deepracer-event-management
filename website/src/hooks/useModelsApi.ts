import { API, Auth, graphqlOperation } from 'aws-amplify';
import { useEffect, useState } from 'react';
import { getAllModels } from '../graphql/queries';
import { onAddedModel, onDeletedModel, onUpdatedModel } from '../graphql/subscriptions';
import { useStore } from '../store/store';
import { Model } from '../types/domain';
import { Dispatch } from '../store/store';

// CONSTANTS
const MODELS_GET_LIMIT = 200;

interface SubscriptionVariables {
  sub?: string;
}

interface GraphQLError {
  message: string;
}

interface GetAllModelsResponse {
  data: {
    getAllModels: {
      models: Model[];
      nextToken: string | null;
    };
  };
}

export const useModelsApi = (allowedToFetchAllModels: boolean = false): void => {
  const [, dispatch] = useStore();
  const [subscriptionVariables, setSubscriptionVariables] = useState<SubscriptionVariables>({});

  // If a user is not allowed to fetch all models the sub need to be provided to filter the subscription.
  useEffect(() => {
    async function getSubscriptionVariables(): Promise<void> {
      if (allowedToFetchAllModels) {
        setSubscriptionVariables({});
      } else {
        const currentUser = await Auth.currentAuthenticatedUser();
        const sub = currentUser.attributes.sub;
        setSubscriptionVariables({ sub: sub });
      }
    }
    getSubscriptionVariables();
  }, [allowedToFetchAllModels]);

  // initial data load
  useEffect(() => {
    const getModelApiCall = async (nextToken: string | null = null): Promise<string | null> => {
      const response = await API.graphql(
        graphqlOperation(getAllModels, { limit: MODELS_GET_LIMIT, nextToken: nextToken })
      ) as GetAllModelsResponse;
      const models = response.data.getAllModels.models;
      dispatch('ADD_MODELS', models);
      return response.data.getAllModels.nextToken;
    };

    const getModels = async (): Promise<void> => {
      dispatch('MODELS_IS_LOADING', true);
      try {
        let nextToken: string | null = null;
        nextToken = await getModelApiCall(nextToken);

        dispatch('MODELS_IS_LOADING', false);

        while (nextToken) {
          nextToken = await getModelApiCall(nextToken);
        }
      } catch (error: any) {
        addErrorNotifications('getAllModels query', error.errors, dispatch);
      } finally {
        dispatch('MODELS_IS_LOADING', false);
      }
    };

    getModels();

    return () => {
      // Unmounting
    };
  }, [dispatch]);

  // subscribe to data changes and append them to local array
  useEffect(() => {
    const subscription = (API.graphql(
      graphqlOperation(onAddedModel, subscriptionVariables)
    ) as any).subscribe({
      next: (event: any) => {
        const addedModel: Model = event.value.data.onAddedModel;
        dispatch('UPDATE_MODEL', addedModel);
      },
      error: (error: any) => {
        const errors: GraphQLError[] = error.error.errors;
        addErrorNotifications('onAddedModel subscription', errors, dispatch);
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [subscriptionVariables, dispatch]);

  // subscribe to delete data changes and delete them from local array
  useEffect(() => {
    const subscription = (API.graphql(
      graphqlOperation(onDeletedModel, subscriptionVariables)
    ) as any).subscribe({
      next: (event: any) => {
        const deletedModel: Model = event.value.data.onDeletedModel;
        dispatch('DELETE_MODELS', [deletedModel]);
      },
      error: (error: any) => {
        const errors: GraphQLError[] = error.error.errors;
        addErrorNotifications('onDeletedModel subscription', errors, dispatch);
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [subscriptionVariables, dispatch]);

  useEffect(() => {
    const subscription = (API.graphql(
      graphqlOperation(onUpdatedModel, subscriptionVariables)
    ) as any).subscribe({
      next: (event: any) => {
        const updatedModel: Model = event.value.data.onUpdatedModel;
        dispatch('UPDATE_MODEL', updatedModel);
      },
      error: (error: any) => {
        const errors: GraphQLError[] = error.error.errors;
        addErrorNotifications('onUpdateModel subscription', errors, dispatch);
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [subscriptionVariables, dispatch]);
};

// adds an error notification for each API error
const addErrorNotifications = (
  apiMethodName: string, 
  errors: GraphQLError[], 
  dispatch: Dispatch
): void => {
  errors.forEach((element, index) => {
    const errorMessage = `${apiMethodName}: ${element.message}`;
    const notificationId = `${apiMethodName}Error${index}`;

    dispatch('ADD_NOTIFICATION', {
      header: errorMessage,
      type: 'error',
      dismissible: true,
      dismissLabel: 'Dismiss message',
      id: notificationId,
      onDismiss: () => {
        dispatch('DISMISS_NOTIFICATION', notificationId);
      },
    });
  });
};
