export interface IPropertyRequest {
  name: string;
  description: string;
  address: string;
  property_type: string;
  city: string;
  state: string;
  country: string;
  latitude?: string | null;
  longitude?: string | null;
  kyc_id: string;
  amenities: string[];
}
