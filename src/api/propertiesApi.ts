import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { IPropertyRequest } from '../types';
import type { DiscountPolicy, DiscountSummary } from '../utils/discounts';
import { RootState } from '../app/store';
import { REHYDRATE } from 'redux-persist';

interface PropertiesResponse {
  message: string;
  data: {
    stats: {
      total: string;
      totalIsVerified: string;
    };
    data: {
      meta: MetaData;
      data: Property[];
    };
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
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  property_type: string;
  is_verified: boolean;
  is_pet_allowed: boolean;
  is_party_allowed: boolean;
  rules: string | null;
  is_featured: boolean;
  createdAt: string;
  media: any[];
  amenities: Amenity[];
  units: Unit[];
  meta: {
    total_reviews: number;
    average_rating: number;
  };
  // Listing-wide policies, plus the best offer anywhere on the listing already
  // resolved across its units. Prefer `discount_summary` for anything that
  // advertises: a unit can override the property, so the raw policy below is
  // only the default for units that have not said otherwise.
  long_stay_discount_policy?: DiscountPolicy | null;
  extension_discount_policy?: DiscountPolicy | null;
  discount_summary?: {
    long_stay: DiscountSummary | null;
    extension: DiscountSummary | null;
  };
}

// Amenity structure
interface Amenity {
  id: string;
  amenityId: string;
  assignableId: string;
  assignableType: string;
  createdAt: string;
  amenity: {
    id: string;
    name: string;
  };
}

// Unit structure
interface Unit {
  id: string;
  property_id: string;
  name: string;
  description: string;
  price_per_night: string;
  max_guests: number;
  count: number;
  is_whole_property: boolean;
  bedroom_count: number;
  bathroom_count: number;
  living_room_count: number;
  kitchen_count: number;
  is_verified: boolean;
  createdAt: string;
  updatedAt: string;
  availability: Availability[];
  reviews: any[];
  amenities: Amenity[];
  seating_capacity?: number;
  standing_capacity?: number;
  car_park_spaces?: number;
  power_supply_provision?: string;
  additional_fees?: Array<{ id: string; fee_name: string; fee_amount: number | string; is_mandatory: boolean }>;
  /** Event-centre hall: rate card, hire hours and same-day rule. */
  event_price_per_day?: number | null;
  event_price_per_half_day?: number | null;
  event_price_per_hour?: number | null;
  opening_time?: string | null;
  closing_time?: string | null;
  half_day_windows?: Array<{ name: string; start: string; end: string }>;
  allows_multiple_bookings_per_day?: boolean;
  /** The hire types a guest can actually book ("PER_DAY" | "PER_HALF_DAY" | "PER_HOUR"). */
  offered_billing_units?: string[];
  /** What the headline price (price_per_night) is per. */
  headline_billing_unit?: string | null;
  /** This unit's OWN override — null when it simply inherits the property's. */
  long_stay_discount_policy?: DiscountPolicy | null;
  extension_discount_policy?: DiscountPolicy | null;
  /** What will actually price this unit. This is the one to display. */
  effective_long_stay_discount_policy?: DiscountPolicy | null;
  effective_extension_discount_policy?: DiscountPolicy | null;
}

/** GET /properties/{id}/units/{unit_id}/event-slots */
export interface EventSlots {
  date: string;
  opening_time: string;
  closing_time: string;
  event_buffer_minutes: number;
  allows_multiple_bookings_per_day: boolean;
  offered_billing_units: string[];
  blackout: boolean;
  full_day_available: boolean;
  half_day_windows: Array<{ name: string; start: string; end: string; available: boolean }>;
  hourly_starts: Array<{ start: string; max_hours: number }>;
  busy: Array<{ start: string; end: string }>;
}

// Availability structure
interface Availability {
  id: string;
  unit_id: string;
  start_date: string;
  end_date: string;
  date: string;
  count: number;
  is_blackout: boolean;
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

import { BASE_API_URL } from '../utils/url';
import type { SearchInterpretation } from '../types/search';

/** Response envelope for `properties/search` — the list shape plus `search`. */
export interface PropertySearchResponse {
  message: string;
  data: PropertiesResponse['data'] & { search: SearchInterpretation };
}

/**
 * Serialize params, dropping empties.
 *
 * `new URLSearchParams(obj)` stringifies `undefined` into the literal string
 * "undefined" and sends it — which the backend then tries to parse as a real
 * filter value. Filtering here fixes that for every caller.
 */
const buildQueryString = (params: Record<string, unknown>): string => {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    sp.set(key, String(value));
  });
  return sp.toString();
};

export const propertiesApi = createApi({
  reducerPath: 'propertiesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_API_URL,
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
  // Keep results briefly so browser Back (and re-applying a filter you just
  // removed) reads from cache instead of refetching. `0` meant every history
  // navigation was a fresh round trip.
  keepUnusedDataFor: 60,
  tagTypes: ['allProperties'],
  endpoints: (builder) => ({
    getProperties: builder.query<PropertiesResponse, Record<string, any>>({
      // Guests see the most recently VERIFIED homes first. The API's default
      // ordering ranks by agent tier before recency, and "newest listed"
      // would surface homes that are not bookable yet — verification is the
      // moment a listing becomes real inventory, so it is the honest signal
      // of freshness for a guest. Any caller passing its own sort_by (e.g.
      // a price sort from the filter bar) still wins.
      query: (filters: Record<string, any>) =>
        `properties?${buildQueryString({ sort_by: 'recently_verified', ...filters })}`,
      providesTags: ['allProperties'],
    }),

    /**
     * Natural-language search.
     *
     * Same envelope as `getProperties` plus an additive `data.search` block,
     * so the existing `data.data.data` unwrapping is unchanged.
     */
    searchProperties: builder.query<PropertySearchResponse, Record<string, any>>({
      query: (params: Record<string, any>) =>
        `properties/search?${buildQueryString(params)}`,
      providesTags: ['allProperties'],
    }),
    // get a property by ID
    getPropertyById: builder.query<{ message: string; data: Property }, string>({
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

    /**
     * What an event-centre hall can still be booked for on one date: free
     * hourly starts (each with the longest hire that fits), half-day sessions,
     * and whether the whole day is free. Computed by the same engine that
     * accepts the booking.
     */
    getEventSlots: builder.query<
      { message: string; data: EventSlots },
      { propertyId: string; unitId: string; date: string }
    >({
      query: ({ propertyId, unitId, date }) =>
        `properties/${propertyId}/units/${unitId}/event-slots?date=${date}`,
    }),

    /** `appliesTo` narrows to amenities a venue ("VENUE") or a stay ("STAY") offers. */
    getAmenities: builder.query<AmenitiesResponse, 'VENUE' | 'STAY' | void>({
      query: (appliesTo) => (appliesTo ? `amenities?applies_to=${appliesTo}` : 'amenities'),
    }),

    getEventTypes: builder.query<{ message: string; data: Array<{ id: number; name: string }> }, void>({
      query: () => 'event-types',
    }),

    getLocationSuggestions: builder.query<
      {
        message: string;
        data: {
          cities: { name: string; count: number }[];
          states: { name: string; count: number }[];
        };
      },
      void
    >({
      query: () => 'properties/locations',
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
  useSearchPropertiesQuery,
  useGetPropertyByIdQuery,
  useGetUnitAvailabilityQuery,
  useLazyGetUnitAvailabilityQuery,
  useGetAmenitiesQuery,
  useGetEventSlotsQuery,
  useGetEventTypesQuery,
  useGetLocationSuggestionsQuery,
  useCreatePropertyMutation,
  useUploadPropertyMediaMutation,
  useAssignAmenitiesToPropertyMutation,
  useAddPropertyUnitMutation,
  useAssignAmenitiesToUnitMutation,
  useUploadUnitMediaMutation,
  useDeletePropertyUnitMutation,
  useUploadKycDocumentMutation,
} = propertiesApi;
