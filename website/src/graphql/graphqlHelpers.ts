// Typed GraphQL Helper Functions
// ================================
// These wrappers around AWS Amplify's API.graphql() provide proper TypeScript typing
// by distinguishing between queries/mutations (which return Promises) and subscriptions
// (which return Observables). This eliminates the need for `as any` or `as Promise<any>`
// casts throughout the codebase.
//
// Usage:
//   import { graphqlQuery, graphqlMutate, graphqlSubscribe } from '../graphql/graphqlHelpers';
//
//   // Queries (using graphqlOperation style)
//   const cars = await graphqlQuery<{ listCars: Car[] }>(listCars, { online: true });
//
//   // Mutations (using { query, variables } style)
//   await graphqlMutate(deleteFleets, { fleetIds });
//
//   // Subscriptions
//   const sub = graphqlSubscribe(onUpdatedCarsInfo).subscribe({
//     next: (event) => console.log(event.value.data),
//     error: (err) => console.error(err),
//   });

import { GraphQLResult } from '@aws-amplify/api-graphql';
import { API, graphqlOperation } from 'aws-amplify';

/**
 * Execute a GraphQL query or mutation using graphqlOperation() style.
 * Returns the full response data object.
 *
 * @example
 * const response = await graphqlQuery<{ listCars: Car[] }>(listCars, { online: true });
 * const cars = response.listCars;
 */
export async function graphqlQuery<T = any>(
    query: string,
    variables?: Record<string, any>
): Promise<T> {
    const result = (await API.graphql(graphqlOperation(query, variables))) as GraphQLResult<T>;
    return result.data as T;
}

/**
 * Execute a GraphQL mutation using { query, variables } style.
 * Returns the full response data object.
 *
 * @example
 * const response = await graphqlMutate<{ deleteFleets: string[] }>(deleteFleets, { fleetIds });
 */
export async function graphqlMutate<T = any>(
    query: string,
    variables?: Record<string, any>,
    options?: { authMode?: string }
): Promise<T> {
    const params: any = { query, variables };
    if (options?.authMode) {
        params.authMode = options.authMode;
    }
    const result = (await API.graphql(params)) as GraphQLResult<T>;
    return result.data as T;
}

/** Subscription event shape from AWS Amplify */
export interface GraphQLSubscriptionEvent<T> {
    value: {
        data: T;
    };
}

/** Subscription observable returned by graphqlSubscribe */
export interface GraphQLSubscription<T> {
    subscribe(handlers: {
        next: (event: GraphQLSubscriptionEvent<T>) => void;
        error?: (error: any) => void;
    }): { unsubscribe: () => void };
}

/**
 * Create a GraphQL subscription with proper typing.
 * Returns a typed observable that can be subscribed to.
 *
 * @example
 * const sub = graphqlSubscribe<{ onUpdatedCarsInfo: Car[] }>(onUpdatedCarsInfo).subscribe({
 *   next: (event) => {
 *     const cars = event.value.data.onUpdatedCarsInfo;
 *   },
 *   error: (err) => console.error(err),
 * });
 * // Later: sub.unsubscribe();
 */
export function graphqlSubscribe<T = any>(
    subscription: string,
    variables?: Record<string, any>
): GraphQLSubscription<T> {
    return API.graphql(
        graphqlOperation(subscription, variables)
    ) as unknown as GraphQLSubscription<T>;
}
