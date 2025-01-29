import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface PropertyUnit {
  id?: string | null;
  propertyId?: string | null;
  name: string;
  description: string;
  price_per_night: number;
  max_guests: number;
  count: number;
  is_whole_property: boolean;
  bedroom_count: number;
  living_room_count: number;
  kitchen_count: number;
  image?: File | null;
};

interface PropertyFormData {
  propertyId: string | null;
  name: string;
  description: string;
  city: string;
  state: string;
  address: string;
  property_type: string;
  country: string;
  zip_code: string;
  street: string;
  latitude?: string | null;
  longitude?: string | null;
  kyc_id: string;
  amenities: Array<string>;
  apartmentMedia: Array<File>;
  featuredMedia: File | null;
  featuredUnit: PropertyUnit | null;
}

interface State {
  propertyFormData: PropertyFormData;
}

const defaultPropertyFormData = {
  propertyId: null,
  name: '',
  description: '',
  city: '',
  state: '',
  address: '',
  property_type: '',
  country: '',
  zip_code: '',
  street: '',
  kyc_id: '',
  amenities: [],
  featuredMedia: null,
  featuredUnit: null,
  /**
   * @deprecated
   */
  apartmentMedia: [],
};

const initialState: State = {
  propertyFormData: defaultPropertyFormData,
};

const propertySlice = createSlice({
  name: 'property',
  initialState,
  reducers: {
    setPropertyId(state, action: PayloadAction<string | null>) {
        state.propertyFormData.propertyId = action.payload;
    },
    setApartmentNameAndDesc(
      state,
      action: PayloadAction<{ name: string; desc: string }>
    ) {
      if (action.payload) {
        Object.assign(state.propertyFormData, {
          name: action.payload.name,
          description: action.payload.desc,
        });
      }
    },
    setApartmentType(state, action: PayloadAction<string>) {
      if (action.payload) {
        state.propertyFormData.property_type = action.payload;
      }
    },
    setApartmentAddress(
      state,
      action: PayloadAction<
        Pick<
          PropertyFormData,
          'country' | 'state' | 'city' | 'zip_code' | 'street'
        >
      >
    ) {
      if (action.payload) {
        Object.assign(state.propertyFormData, {
          ...action.payload,
          address: `${action.payload.street}, ${action.payload.city}, ${action.payload.state}`,
        });
      }
    },
    setFeaturedMedia(state, action: PayloadAction<File | null>) {
      if (action.payload) {
        state.propertyFormData.featuredMedia = action.payload;
      }
    },
    setAmenities(state, action: PayloadAction<Array<string>>){
      state.propertyFormData.amenities = action.payload;
    },
    setFeaturedUnit(state, action: PayloadAction<PropertyUnit>){
      state.propertyFormData.featuredUnit= action.payload;
    },
    /**
     * @deprecated
     */
    setApartmentMedia(state, action: PayloadAction<Array<File>>) {
      if (action.payload) {
        state.propertyFormData.apartmentMedia = action.payload;
      }
    },
    resetFormData(state) {
      Object.assign(state.propertyFormData, defaultPropertyFormData);
    },
  },
});

export const {
  setPropertyId,
  setApartmentNameAndDesc,
  setApartmentType,
  setApartmentAddress,
  setAmenities,
  setApartmentMedia,
  setFeaturedMedia,
  setFeaturedUnit,
  resetFormData,
} = propertySlice.actions;
export default propertySlice.reducer;
