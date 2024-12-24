// FILE: utils/generateProperties.ts
import GuestImages from "../../assets/images/guest/guestImages";

const titles = ["Apartments De Grande", "The Central Park Hotel", "Water Front Classic", "The Yellow Base", "Hotel De Luna", "Park Luddison Hotel", "Red Edigurgh", "The White House", "Peaceful Stay Apartment", "The Aparte Lodge"];
const addresses = ["Lekki, Lagos Nigeria", "Ibadan, Oyo Nigeria", "Ajah, Lagos Nigeria", "Garki, Abuja Nigeria", "Ikeja, Lagos Nigeria", "Victoria Island, Lagos Nigeria", "Ikoyi, Lagos Nigeria", "Wuse, Abuja Nigeria", "Yaba, Lagos Nigeria", "Surulere, Lagos Nigeria"];

export const generateRandomProperties = (count: number) => {
  return Array.from({ length: count }, (_, index) => ({
    id: `property-${index + 1}`,
    title: titles[Math.floor(Math.random() * titles.length)],
    address: addresses[Math.floor(Math.random() * addresses.length)],
    images: GuestImages.sort(() => 0.5 - Math.random()).slice(0, 14),
  }));
};