import { API } from 'aws-amplify';
import { useEffect, useState } from 'react';
import * as queries from '../graphql/queries';

interface Group {
  groupName: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const useGroupsApi = (): [Group[], boolean, string] => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // initial data load
  useEffect(() => {
    async function getGroups(): Promise<void> {
      setIsLoading(true);
      try {
        const responseGetGroups: any = await API.graphql({
          query: queries.listGroups,
        });
        const groups: Group[] = responseGetGroups.data.listGroups;
        console.debug(groups);
        setGroups(groups);
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : String(err));
      } finally {
        setIsLoading(false);
      }
    }
    getGroups();

    return () => {
      // Unmounting
    };
  }, []);

  return [groups, isLoading, errorMessage];
};
