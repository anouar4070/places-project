import { useCallback, useState, useRef, useEffect } from "react";

export const useHttpClient = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  // Stores active HTTP request controllers (to allow aborting them if needed)
  const activeHttpRequests = useRef([]);

  // Function to send HTTP requests
  const sendRequest = useCallback(
    async (url, method = "GET", body = null, headers = {}) => {
      setIsLoading(true);

      const httpAbortCtrl = new AbortController(); // Create controller to abort the request if needed
      activeHttpRequests.current.push(httpAbortCtrl); // Track this controller

      try {
        const response = await fetch(url, {
          method,
          body,
          headers,
          signal: httpAbortCtrl.signal, // Tie the request to this controller
        });

        const responseData = await response.json();
        if (!response.ok) {
          throw new Error(responseData.message);
        }
        return responseData;
      } catch (err) {
        setError(err.message);
      }
      setIsLoading(false);
    },
    [] // useCallback ensures the function is stable and doesn't get recreated on each render
  );

  const clearError = () => {
    setError(null);
  };

  // Cleanup effect to abort any ongoing requests if the component using this hook unmounts
  useEffect(() => {
    return () => {
      activeHttpRequests.current.forEach((abortCtrl) => abortCtrl.abort());
    };
  }, []);

  return { isLoading, error, sendRequest, clearError };
};

/**             🛠️🛠️🛠️ Why using callback() ??  🛠️🛠️🛠️
  use callback is used here, so this function never gets recreated when the component that uses this hook rerenders.
 */
