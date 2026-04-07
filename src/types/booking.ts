export interface BookingDetails {
  id: string;
  title: string;
  check_in_date: string;
  check_out_date: string;
  adults: number;
  children: number;
  pets: number;
  nights: number;
  base_price: number;
  caution_fee: number;
  total_charging_fee: number;
  unit_image: string;
  unit_count: number;
  unit_id: string;
  booking_mode?: string;
  owner?: {
    profile?: {
      firstName: string;
      lastName: string;
    };
  };
}

// type for booking form data if needed
export interface BookingFormData {
  check_in_date: string;
  check_out_date: string;
  adults: number;
  children: number;
  pets: number;
}

// type for booking response from API
export interface BookingResponse {
  success: boolean;
  booking?: BookingDetails;
  error?: string;
}