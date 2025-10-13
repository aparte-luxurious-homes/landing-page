export const createProperty = async (formData: FormData, token?: string) => {
  
    const requestOptions = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
      redirect: 'follow' as RequestRedirect,
    };
  
    try {
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/v1/properties`;
      const response = await fetch(apiUrl, requestOptions);
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create property');
      }
      return result;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };