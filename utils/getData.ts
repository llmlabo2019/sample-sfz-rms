export const getData = async (endpoint: string): Promise<any> => {
  const requestBody = {
    endpoint,
  };

  try {
    const response = await fetch('/api/proxy/get', {
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
