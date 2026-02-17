import { API, graphqlOperation } from 'aws-amplify';
import { useEffect, useState } from 'react';

import * as queries from '../graphql/queries';

type QueryMethod = keyof typeof queries;

interface QueryParams {
    [key: string]: any;
}

export default function useQuery<T = any>(
    method: QueryMethod,
    params: QueryParams = {}
): [T | undefined, boolean, Error | string] {
    const [data, setData] = useState<T>();
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | string>('');

    const paramsKey = JSON.stringify(params);

    useEffect(() => {
        const queryApi = async (): Promise<void> => {
            try {
                setLoading(true);
                const response: any = await API.graphql(graphqlOperation(queries[method], params));
                setData(response.data[method]);
                setLoading(false);
            } catch (err) {
                setError(err as Error);
                setLoading(false);
            }
        };
        queryApi();
        return () => {
            // abort();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [method, paramsKey]);

    return [data, loading, error];
}
