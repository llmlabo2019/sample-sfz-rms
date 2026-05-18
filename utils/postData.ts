export const postData = async <TRequest, TResponse>(endpoint: string, postData: TRequest): Promise<TResponse> => {

    const requestBody = { endpoint, postData };
  
    try {
      const response = await fetch('/api/proxy/post', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error; 
    }
};