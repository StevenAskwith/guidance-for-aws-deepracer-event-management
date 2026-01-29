import { useCallback, useEffect, useState } from 'react';

// Store types - using any for flexibility during incremental migration
// TODO: Replace with strongly-typed discriminated union of action types
type ActionIdentifier = string;
type ActionHandler = (state: any, payload: any) => any;
type Actions = Record<ActionIdentifier, ActionHandler>;
type Listener = (state: any) => void;
type DispatchFunction = (actionIdentifier: ActionIdentifier, payload?: any) => void;

let globalState: any = {};
let listeners: Listener[] = [];
let actions: Actions = {};

/**
 * low level custom hook for managing the global store.
 * use higher level hooks if possible ex: useUsers()
 * @returns array [state, dispatch] state is the global state, dispatch is the dispatch function for the store.
 *
 * @example
 * const [state, dispatch] = useStore();
 */
export const useStore = (): [any, DispatchFunction] => {
  const [, setState] = useState(globalState);

  const dispatch: DispatchFunction = useCallback((actionIdentifier, payload) => {
    const newState = actions[actionIdentifier](globalState, payload);
    globalState = { ...globalState, ...newState };

    for (const listener of listeners) {
      listener(globalState);
    }
  }, []);

  useEffect(() => {
    listeners.push(setState);

    return () => {
      listeners = listeners.filter((li) => li !== setState);
    };
  }, []);

  return [globalState, dispatch];
};

export const initStore = (userActions: Actions, initialState?: any): void => {
  if (initialState) {
    globalState = { ...globalState, ...initialState };
  }
  actions = { ...actions, ...userActions };
};
