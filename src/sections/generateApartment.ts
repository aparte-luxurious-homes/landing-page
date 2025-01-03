
import GuestImages from "../assets/images/guest/guestImages";

const titles = [
  "The Skyline Apartment, Lagos",
  "Ocean View Apartment, Lagos",
  "The Cityscape Apartment, Lagos",
  "The Urban Apartment, Lagos",
  "The Skyline Apartment, Lagos",
  "The Ocean Apartment, Lagos",
  "The Cityscape Apartment, Lagos",
  "The Urban Apartment, Lagos",
  "The Skyline Apartment, Lagos",
  "Ocean View Apartment, Lagos",
  "The Cityscape Apartment, Lagos",
  "The Urban Apartment, Lagos",
];

const locations = [
  "Lekki, Lagos",
  "Victoria Island, Lagos",
  "Ikeja, Lagos",
  "Yaba, Lagos",
];

const generateRandomPrice = () => Math.floor(Math.random() * 100000) + 200000;

export const generateRandomApartments = (count: number) => {
  return Array.from({ length: count }, (_, _index) => ({
    imageUrl: GuestImages[Math.floor(Math.random() * GuestImages.length)],
    title: titles[Math.floor(Math.random() * titles.length)],
    location: locations[Math.floor(Math.random() * locations.length)],
    rating: (Math.random() * 2 + 8).toFixed(1), // Random rating between 8.0 and 10.0
    reviews: Math.floor(Math.random() * 1500) + 500, // Random reviews between 500 and 2000
    price: generateRandomPrice(),
  }));
};