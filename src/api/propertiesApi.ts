import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

interface PropertiesResponse {
    stats: {
      total: string;
      totalIsVerified: string;
    };
    data: {
      meta: MetaData;
      data: Property[];
    };
  }
  
  // Pagination metadata
  interface MetaData {
    total: number;
    perPage: number;
    currentPage: number;
    lastPage: number;
    firstPage: number;
    firstPageUrl: string;
    lastPageUrl: string;
    nextPageUrl: string | null;
    previousPageUrl: string | null;
  }
  
  // Property structure
  interface Property {
    id: number;
    name: string;
    description: string;
    address: string;
    city: string;
    state: string;
    country: string;
    latitude: number | null;
    longitude: number | null;
    propertyType: string;
    isVerified: boolean;
    isPetAllowed: boolean;
    createdAt: string;
    media: any[];
    amenities: Amenity[];
    units: Unit[];
  }
  
  // Amenity structure
  interface Amenity {
    id: number;
    amenityId: number;
    assignableId: number;
    assignableType: string;
    createdAt: string;
    amenity: {
      id: number;
      name: string;
    };
  }
  
  // Unit structure
  interface Unit {
    id: number;
    propertyId: number;
    name: string;
    description: string;
    pricePerNight: string;
    maxGuests: number;
    count: number;
    isWholeProperty: boolean;
    bedroomCount: number;
    livingRoomCount: number;
    kitchenCount: number;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
    availability: Availability[];
    reviews: any[];
    amenities: Amenity[];
  }
  
  // Availability structure
  interface Availability {
    id: number;
    unitId: number;
    startDate: string;
    endDate: string;
    count: number;
    isBlackout: boolean;
    pricing: string;
    createdAt: string;
    updatedAt: string;
  }

export const propertiesApi = createApi({
    reducerPath: "propertiesApi",
    baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_API_BASE_URL }),
    endpoints: (builder) => ({
        getProperties: builder.query<PropertiesResponse, void>({
        query: () => "properties",
        }),
    // get a property by ID
    getPropertyById: builder.query<Property, string>({
      query: (id) => `properties/${id}`,
    }),
    }),
});

export const { useGetPropertiesQuery, useGetPropertyByIdQuery  } = propertiesApi;
