const BASE_URL = "https://v1-api-9mba.onrender.com/api/v1/properties";

interface FetchPropertiesParams {
  search?: string;
  property_type?: string;
  city?: string;
  state?: string;
  min_price?: number;
  max_price?: number;
  is_pet_allowed?: boolean;
  availability?: boolean;
  sort?: string;
  amenities?: string[];
}

export const fetchProperties = async (params: FetchPropertiesParams) => {
  const url = new URL(BASE_URL);

  // Append query parameters to the URL
  Object.keys(params).forEach((key) => {
    const value = params[key as keyof FetchPropertiesParams];
    if (value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach((item) => url.searchParams.append(key, item));
      } else {
        url.searchParams.append(key, value.toString());
      }
    }
  });

  const requestOptions = {
    method: 'GET',
    redirect: 'follow' as RequestRedirect,
  };

  try {
    const response = await fetch(url.toString(), requestOptions);
    if (!response.ok) {
      throw new Error(`Error fetching properties: ${response.statusText}`);
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching properties:', error);
    throw error;
  }
};