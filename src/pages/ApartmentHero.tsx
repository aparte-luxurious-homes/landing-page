import React, { useState, useRef, useCallback } from 'react';
import { Button, Modal, IconButton } from '@mui/material';
import PlaceCard from "../assets/images/placecard.png";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Keyboard } from 'swiper/modules';
import { Close as CloseIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';

interface MediaItem {
  fileUrl?: string;
  media_url?: string;
  mediaUrl?: string;
  media_type?: string;
  mediaType?: string;
}

interface ApartmentHeroProps {
  title: string | undefined;
  unit: Unit | null;
  images: MediaItem[];
}

interface Unit {
  amenities: unknown[];
  availability: unknown[];
  bedroom_count: number;
  caution_fee: string;
  id: string;
  living_room_count: number;
  max_guests: number;
  price_per_night: string;
  is_verified: boolean;
  is_whole_property: boolean;
  media: MediaItem[];
  meta: {
    total_reviews: number;
    average_rating: number;
  };
  property_id: string;
  createdAt: string;
  updatedAt: string;
}

const ApartmentHero: React.FC<ApartmentHeroProps> = ({ title, unit, images: propImages }) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  const showLightbox = lightboxIndex !== null;
  const openLightbox = useCallback((index: number) => setLightboxIndex(index), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  // Combine unit media and property media (unit-specific first, then property-level)
  const unitMedia = unit?.media && unit.media.length > 0 ? unit.media : [];
  const propertyMedia = propImages && propImages.length > 0 ? propImages : [];
  const rawImages = [...unitMedia, ...propertyMedia];

  const mediaItems = rawImages.map(img => ({
    url: (img as any).media_url || (img as any).mediaUrl || (img as any).fileUrl || '',
    type: ((img as any).media_type || (img as any).mediaType || 'IMAGE') as string,
  }));
  const mainItem = mediaItems[0] || { url: '', type: 'IMAGE' };
  const hasMultipleImages = mediaItems.length > 1;

  const viewAllPhotosButton = (
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
      onClick={() => openLightbox(0)}
    >
      <svg width="14" height="14" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 21H14C19 21 21 19 21 14V8C21 3 19 1 14 1H8C3 1 1 3 1 8V14C1 19 3 21 8 21Z" stroke="#191919" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 9C9.10457 9 10 8.10457 10 7C10 5.89543 9.10457 5 8 5C6.89543 5 6 5.89543 6 7C6 8.10457 6.89543 9 8 9Z" stroke="#191919" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M1.66992 17.9505L6.59992 14.6405C7.38992 14.1105 8.52992 14.1705 9.23992 14.7805L9.56992 15.0705C10.3499 15.7405 11.6099 15.7405 12.3899 15.0705L16.5499 11.5005C17.3299 10.8305 18.5899 10.8305 19.3699 11.5005L20.9999 12.9005" stroke="#191919" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      View all photos
    </Button>
  );

  return (
    <div className="relative w-full h-full lg:mb-4">
      <div className="text-[16px] p-4 pt-6 lg:pt-0 font-medium lg:text-[24px] apartment-hero">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="md:hidden text-[#667185] hover:text-[#4B5563] no-underline flex items-center"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <h1 className="m-0">{title}</h1>
        </div>
      </div>

      <div className={`flex flex-col ${hasMultipleImages ? 'md:flex-row' : ''} gap-4`}>
        {/* Main image section */}
        <div className={`relative w-full ${hasMultipleImages ? 'md:w-2/3' : 'md:w-full'}`}>
          {/* Mobile Slider - only show if multiple images */}
          {hasMultipleImages && (
            <div className="block md:hidden -mx-4">
              <Swiper
                modules={[Navigation, Pagination]}
                pagination={{ clickable: true }}
                navigation
                loop
                className="w-full h-[300px]"
              >
                {mediaItems.map((item, index) => (
                  <SwiperSlide key={index}>
                    {item.type === 'VIDEO' ? (
                      <video
                        src={item.url}
                        controls
                        preload="metadata"
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => openLightbox(index)}
                      />
                    ) : (
                      <img
                        src={item.url || PlaceCard}
                        alt={`${title || 'Apartment'} — photo ${index + 1}`}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => openLightbox(index)}
                      />
                    )}
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          )}

          {/* Mobile Single Image/Video - only show if single item */}
          {!hasMultipleImages && (
            <div className="block md:hidden -mx-4">
              {mainItem.type === 'VIDEO' ? (
                <video
                  src={mainItem.url}
                  controls
                  preload="metadata"
                  className="w-full h-[300px] object-cover cursor-pointer"
                  onClick={() => openLightbox(0)}
                />
              ) : (
                <img
                  src={mainItem.url || PlaceCard}
                  alt={title || 'Apartment'}
                  className="w-full h-[300px] object-cover cursor-pointer"
                  onClick={() => openLightbox(0)}
                  loading="lazy"
                />
              )}
            </div>
          )}

          {/* Desktop Main Image/Video */}
          <div className="hidden md:block">
            {mainItem.type === 'VIDEO' ? (
              <video
                src={mainItem.url}
                controls
                preload="metadata"
                className={`w-full h-full md:h-[406px] object-cover cursor-pointer ${
                  hasMultipleImages ? 'rounded-tl-2xl rounded-bl-2xl' : 'rounded-2xl'
                }`}
              />
            ) : (
              <img
                src={mainItem.url || PlaceCard}
                alt="Apartment Main"
                className={`w-full h-full md:h-[406px] object-cover cursor-pointer ${
                  hasMultipleImages ? 'rounded-tl-2xl rounded-bl-2xl' : 'rounded-2xl'
                }`}
                onClick={() => openLightbox(0)}
                loading="lazy"
              />
            )}
          </div>

          {/* View all photos button - mobile */}
          {hasMultipleImages && (
            <div className="absolute top-4 right-4 md:hidden">
              {viewAllPhotosButton}
            </div>
          )}
        </div>

        {/* Secondary images section - only show real images, no placeholders */}
        {hasMultipleImages && (
          <div className="hidden md:flex flex-col gap-4 w-1/3">
            {/* First secondary item */}
            <div className="relative">
              {mediaItems[1]?.type === 'VIDEO' ? (
                <video
                  src={mediaItems[1].url}
                  muted
                  preload="metadata"
                  className={`w-full object-cover cursor-pointer ${
                    mediaItems.length === 2
                      ? 'h-[406px] rounded-r-2xl'
                      : 'h-[195px] rounded-tr-2xl'
                  }`}
                  onClick={() => openLightbox(1)}
                />
              ) : (
                <img
                  src={mediaItems[1]?.url}
                  alt={`${title || 'Apartment'} — photo 2`}
                  className={`w-full object-cover cursor-pointer ${
                    mediaItems.length === 2
                      ? 'h-[406px] rounded-r-2xl'
                      : 'h-[195px] rounded-tr-2xl'
                  }`}
                  onClick={() => openLightbox(1)}
                />
              )}
              <div className="absolute top-3 right-2 text-[14px]">
                {viewAllPhotosButton}
              </div>
            </div>

            {/* Second secondary item - only if 3+ items exist */}
            {mediaItems.length > 2 && (
              mediaItems[2]?.type === 'VIDEO' ? (
                <video
                  src={mediaItems[2].url}
                  muted
                  preload="metadata"
                  className="w-full h-[195px] object-cover rounded-br-2xl cursor-pointer"
                  onClick={() => openLightbox(2)}
                />
              ) : (
                <img
                  src={mediaItems[2]?.url}
                  alt={`${title || 'Apartment'} — photo 3`}
                  className="w-full h-[195px] object-cover rounded-br-2xl cursor-pointer"
                  onClick={() => openLightbox(2)}
                />
              )
            )}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {mediaItems.length > 0 && (
        <Modal
          open={showLightbox}
          onClose={closeLightbox}
          aria-labelledby="image-lightbox"
          className="flex justify-center items-center"
          slotProps={{
            backdrop: {
              sx: { backgroundColor: 'rgba(0, 0, 0, 0.9)' }
            }
          }}
        >
          <div
            className="relative w-full h-full flex flex-col items-center justify-center outline-none"
            tabIndex={-1}
          >
            {/* Top bar: counter + close button */}
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3">
              <span ref={counterRef} className="text-white text-sm font-medium" />
              <IconButton
                onClick={closeLightbox}
                sx={{ color: 'white' }}
                aria-label="Close lightbox"
              >
                <CloseIcon />
              </IconButton>
            </div>

            {/* Swiper carousel */}
            <Swiper
              modules={[Navigation, Pagination, Keyboard]}
              navigation
              keyboard={{ enabled: true }}
              initialSlide={lightboxIndex ?? 0}
              loop={mediaItems.length > 1}
              className="w-full h-full lightbox-swiper"
              onSlideChange={(swiper) => {
                if (counterRef.current) {
                  counterRef.current.textContent = `${swiper.realIndex + 1} / ${mediaItems.length}`;
                }
              }}
              onSwiper={(swiper) => {
                if (counterRef.current) {
                  counterRef.current.textContent = `${swiper.realIndex + 1} / ${mediaItems.length}`;
                }
              }}
            >
              {mediaItems.map((item, index) => (
                <SwiperSlide key={index} className="flex items-center justify-center">
                  {item.type === 'VIDEO' ? (
                    <video
                      src={item.url}
                      controls
                      preload="metadata"
                      className="max-w-full max-h-[85vh] object-contain mx-auto"
                    />
                  ) : (
                    <img
                      src={item.url}
                      alt={`${title || 'Apartment'} — photo ${index + 1}`}
                      className="max-w-full max-h-[85vh] object-contain mx-auto"
                    />
                  )}
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ApartmentHero;
