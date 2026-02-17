import { useEffect, useState } from 'react';
import { graphqlMutate } from '../graphql/graphqlHelpers';
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
                const response = await graphqlMutate<{ listGroups: Group[] }>(queries.listGroups);
                const groups: Group[] = response.listGroups;
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
