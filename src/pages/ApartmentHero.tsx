import React, { useState } from 'react';
import { Button, Modal } from '@mui/material';
// import GuestImages from '../assets/images/guest/guestImages';

interface ApartmentHeroProps {
  title: string;
  unitImages: Unit;
}
interface Unit {
  amenities: any[];
  availability: any[];
  bedroomCount: number;
  cautionFee: string;
  id: number;
  livingRoomCount: number;
  maxGuests: number;
  pricePerNight: string;
  isVerified: boolean;
  isWholeProperty: boolean;
  media: Media[];
  meta: {
    total_reviews: number;
    average_rating: number;
  };
  propertyId: number;
  createdAt: string;
  updatedAt: string;
}
interface Media {
  id: number;
  mediaUrl: string;
  mediaType: string;
  isFeatured: Boolean;
  assignableId: number;
  assignableType: number;
  uploadedAt: string;
  fileUrl: string;
}


const ApartmentHero: React.FC<ApartmentHeroProps> = ({ title, unitImages }) => {
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  // const [images, setImages] = useState<string[]>([]);

  const imageUrl =
  unitImages?.media?.length > 0
    ? unitImages?.media[0].fileUrl
    : "No Image Added";

  console.log("imageUrl", imageUrl);

  // useEffect(() => {
  //   // Simulate fetching new images each time the component mounts
  //   const fetchImages = () => {
  //     setImages(GuestImages);
  //   };

  //   fetchImages();
  // }, []);

  return (
    <div className="relative w-full h-full lg:mb-4">
      <div className="text-[16px] p-4 pt-14 lg:pt-0 font-medium lg:text-[24px] apartment-hero">
        <h1>{title}</h1>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative w-full md:w-2/3">
          {unitImages && (
            <img
              src={unitImages?.media[0]?.fileUrl || "No Image attached yet"}
              alt="Apartment Main"
              className="w-full h-full md:h-[406px] object-cover rounded-tl-2xl rounded-bl-2xl"
              loading="lazy"
            />
          )}
          <div className="absolute top-4 right-4 md:hidden">
            <Button
              color="primary"
              sx={{
                backgroundColor: "white",
                color: "black",
                border: "1px solid black",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px",
                textTransform: "none",
                fontSize: "14px",
                width: "150px"
              }}
              onClick={() => setShowAllPhotos(true)}
            >
              <svg width="14" height="14" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 21H14C19 21 21 19 21 14V8C21 3 19 1 14 1H8C3 1 1 3 1 8V14C1 19 3 21 8 21Z" stroke="#191919" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M8 9C9.10457 9 10 8.10457 10 7C10 5.89543 9.10457 5 8 5C6.89543 5 6 5.89543 6 7C6 8.10457 6.89543 9 8 9Z" stroke="#191919" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M1.66992 17.9505L6.59992 14.6405C7.38992 14.1105 8.52992 14.1705 9.23992 14.7805L9.56992 15.0705C10.3499 15.7405 11.6099 15.7405 12.3899 15.0705L16.5499 11.5005C17.3299 10.8305 18.5899 10.8305 19.3699 11.5005L20.9999 12.9005" stroke="#191919" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              View all photos
            </Button>
          </div>
        </div>

        <div className="hidden md:flex flex-col gap-4 w-1/3">
          {unitImages && (
            <div className="relative">
              {unitImages?.media[1]?.fileUrl ? (
                <img
                  src={unitImages?.media[1]?.fileUrl}
                  alt=""
                  className="w-full h-full md:h-[195px] object-cover rounded-tr-2xl rounded-br-2xl"
                />
              ) : (
                <p>No Images added</p>
              )}
              <div className="absolute top-3 right-2 text-[14px]">
                <Button
                  color="primary"
                  sx={{
                    backgroundColor: "white",
                    color: "black",
                    border: "1px solid black",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px",
                    textTransform: "none",
                    fontSize: "14px",
                    width: "150px"
                  }}
                  onClick={() => setShowAllPhotos(true)}
                >
                  <svg width="14" height="14" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 21H14C19 21 21 19 21 14V8C21 3 19 1 14 1H8C3 1 1 3 1 8V14C1 19 3 21 8 21Z" stroke="#191919" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M8 9C9.10457 9 10 8.10457 10 7C10 5.89543 9.10457 5 8 5C6.89543 5 6 5.89543 6 7C6 8.10457 6.89543 9 8 9Z" stroke="#191919" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M1.66992 17.9505L6.59992 14.6405C7.38992 14.1105 8.52992 14.1705 9.23992 14.7805L9.56992 15.0705C10.3499 15.7405 11.6099 15.7405 12.3899 15.0705L16.5499 11.5005C17.3299 10.8305 18.5899 10.8305 19.3699 11.5005L20.9999 12.9005" stroke="#191919" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  View all photos
                </Button>
              </div>
            </div>
          )}
          {unitImages && (
              unitImages?.media[2]?.fileUrl ? (
                <img
                  src={unitImages?.media[2]?.fileUrl}
                  alt=""
                  className="w-full h-full md:h-[195px] object-cover rounded-tr-2xl rounded-br-2xl"
                />
              ) : (
                <p>No Images added</p>
              )
          )}
        </div>
      </div>

      <Modal
        open={showAllPhotos}
        onClose={() => setShowAllPhotos(false)}
        aria-labelledby="view-all-photos"
        className="flex justify-center items-center overflow-auto"
      >
        <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-3xl h-full md:h-auto overflow-y-auto">
          <h2 className="text-lg font-bold mb-4">Photos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {unitImages?.media.map((image, index) => (
              <img
                key={index}
                src={image?.fileUrl}
                alt={`Apartment Photo ${index + 1}`}
                className="w-full h-48 object-cover rounded-md"
              />
            ))}
          </div>
          <Button
            variant="contained"
            color="primary"
            sx={{ backgroundColor: "#028090", marginTop: "20px" }}
            onClick={() => setShowAllPhotos(false)}
            className="pt-2"
          >
            Close
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ApartmentHero;