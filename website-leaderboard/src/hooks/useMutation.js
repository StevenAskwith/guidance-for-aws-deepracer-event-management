import { generateClient } from 'aws-amplify/api';
import { useCallback, useState } from 'react';

import * as mutations from '../graphql/mutations';

const client = generateClient();

export default function useMutation() {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState();
  const [errorMessage, setErrorMessage] = useState('');

  const send = useCallback(async (method, payload) => {
    try {
      setIsLoading(true);
      setData();
      const response = await client.graphql({ query: mutations[method], variables: payload });
      setData({ ...response.data[method] });
      setIsLoading(false);
      setErrorMessage('');
      console.info(response.data[method]);
    } catch (error) {
      console.info(error);
      console.warn(error.errors[0].message);
      setIsLoading(false);
      setErrorMessage(error.errors[0].message);
      setData();
    }
  }, []);

  return [send, isLoading, errorMessage, data];
}
