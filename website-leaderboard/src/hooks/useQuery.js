import { generateClient } from 'aws-amplify/api';
import { useEffect, useState } from 'react';

import * as queries from '../graphql/queries';

const client = generateClient();

export default function useQuery(method, params = {}) {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    const queryApi = async () => {
      try {
        setLoading(true);
        const response = await client.graphql({ query: queries[method], variables: params });
        setData(response.data[method]);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };
    queryApi();
    return () => {
      // abort();
    };
  }, [method]);

  return [data, loading, error];
}
