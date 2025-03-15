import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { IPropertyRequest } from '../types';
import { RootState } from '../app/store';
import { REHYDRATE } from 'redux-persist';

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

interface AmenitiesResponse {
  message: string;
  data: Array<any>;
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
  isFeatured: boolean;
  createdAt: string;
  media: any[];
  amenities: Amenity[];
  units: Unit[];
  meta: {
    total_reviews: number;
    average_rating: number;
  };
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
  date: string;
  count: number;
  isBlackout: boolean;
  pricing: string;
  createdAt: string;
  updatedAt: string;
}

interface UnitAvailabiltyRequest {
  propertyId: string;
  unitId: string;
  startDate?: string | null;
  endDate?: string | null;
}

export const propertiesApi = createApi({
  reducerPath: 'propertiesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).root.auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  extractRehydrationInfo(
    action: { type: string; payload?: { [key: string]: any } },
    { reducerPath }
  ) {
    if (action.type === REHYDRATE && action.payload) {
      return action.payload[reducerPath];
    }
  },
  keepUnusedDataFor: 0,
  tagTypes: ['allProperties'],
  endpoints: (builder) => ({
    getProperties: builder.query<PropertiesResponse, Record<string, any>>({
      query: (filters: Record<string, any>) => {
        const queryParams = new URLSearchParams(filters).toString();
        return `properties?${queryParams}`;
      },

      // 'properties',
      providesTags: ['allProperties'],
    }),
    // get a property by ID
    getPropertyById: builder.query<Property, string>({
      query: (id) => `properties/${id}`,
    }),

    getUnitAvailability: builder.query<
      { message: string; data: { date: string }[] },
      UnitAvailabiltyRequest
    >({
      query: ({
        propertyId,
        unitId,
        startDate,
        endDate,
      }: UnitAvailabiltyRequest) => {
        const url = `properties/${propertyId}/units/${unitId}/availability`;

        if (!startDate || !endDate) return url;

        const queryParams = new URLSearchParams({
          start_date: startDate,
          end_date: endDate,
        }).toString();
        return `${url}?${queryParams}`;
      },
    }),

    getAmenities: builder.query<AmenitiesResponse, void>({
      query: () => 'amenities',
    }),
    createProperty: builder.mutation<any, { payload: IPropertyRequest }>({
      query: ({ payload }) => ({
        url: '/properties',
        method: 'post',
        body: payload,
      }),
      invalidatesTags: ['allProperties'],
    }),

    uploadPropertyMedia: builder.mutation<
      any,
      { id: string; mediaType: string; media: File }
    >({
      query: ({ id, mediaType, media }) => {
        let formData = new FormData();
        formData.append('media_type', mediaType);
        formData.append('media_file', media);
        return {
          url: `/properties/${id}/media`,
          method: 'POST',
          body: formData,
          formData: true,
        };
      },
    }),

    assignAmenitiesToProperty: builder.mutation<
      any,
      { id: string; amenityIds: string[] }
    >({
      query: ({ id, amenityIds }) => ({
        url: `/properties/${id}/amenities`,
        method: 'POST',
        body: {
          amenity_ids: amenityIds,
        },
      }),
    }),

    addPropertyUnit: builder.mutation<any, { id: string; units: any[] }>({
      query: ({ id, units }) => ({
        url: `/properties/${id}/units`,
        method: 'POST',
        body: { units },
      }),
    }),

    assignAmenitiesToUnit: builder.mutation<
      any,
      { propertyId: string; unitId: string; amenityIds: string[] }
    >({
      query: ({ propertyId, unitId, amenityIds }) => ({
        url: `/properties/${propertyId}/units/${unitId}/amenities`,
        method: 'POST',
        body: {
          amenity_ids: amenityIds,
        },
      }),
    }),

    uploadUnitMedia: builder.mutation<
      any,
      { propertyId: string; unitId: string; mediaType: string; media: File }
    >({
      query: ({ propertyId, unitId, mediaType, media }) => {
        let formData = new FormData();
        formData.append('media_type', mediaType);
        formData.append('media_file', media);
        return {
          url: `/properties/${propertyId}/units/${unitId}/media`,
          method: 'POST',
          body: formData,
          formData: true,
        };
      },
    }),

    uploadKycDocument: builder.mutation<
      any,
      { document_type: string; document: File }
    >({
      query: ({ document_type, document }) => {
        const formData = new FormData();
        formData.append('doc_type', document_type);
        formData.append('doc_file', document);
        return {
          url: '/kyc/upload',
          method: 'POST',
          body: formData,
          formData: true,
        };
      },
    }),

    // verifyKyc: builder.mutation<
    //   any,
    //   { documentIds: string[] }
    // >({
    //   query: ({ documentIds }) => ({
    //     url: '/kyc/verify',
    //     method: 'POST',
    //     body: {
    //       document_ids: documentIds
    //     },
    //   }),
    // }),

    deletePropertyUnit: builder.mutation<
      any,
      { propertyId: string; unitId: string }
    >({
      query: ({ propertyId, unitId }) => ({
        url: `/properties/${propertyId}/units/${unitId}/amenities`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useLazyGetPropertiesQuery,
  useGetPropertiesQuery,
  useGetPropertyByIdQuery,
  useLazyGetUnitAvailabilityQuery,
  useGetAmenitiesQuery,
  useCreatePropertyMutation,
  useUploadPropertyMediaMutation,
  useAssignAmenitiesToPropertyMutation,
  useAddPropertyUnitMutation,
  useAssignAmenitiesToUnitMutation,
  useUploadUnitMediaMutation,
  useDeletePropertyUnitMutation,
  useUploadKycDocumentMutation,
} = propertiesApi;
