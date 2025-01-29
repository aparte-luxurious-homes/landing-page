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
      const response = await fetch("https://v1-api-9mba.onrender.com/api/v1/properties", requestOptions);
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