/** Mirrors api-v1 `PropertyType`. EVENT_CENTRE is the venue discriminator; live OpenAPI (api.aparte.ng, 2026-08-28) still enumerates only the six stay types. */
export enum PropertyType {
  DUPLEX = 'DUPLEX',
  BUNGALOW = 'BUNGALOW',
  VILLA = 'VILLA',
  APARTMENT = 'APARTMENT',
  HOTEL = 'HOTEL',
  OTHERS = 'OTHERS',
  EVENT_CENTRE = 'EVENT_CENTRE',
}

export type PropertyTypeValue = `${PropertyType}`;
