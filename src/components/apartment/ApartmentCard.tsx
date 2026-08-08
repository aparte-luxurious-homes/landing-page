'use client';

import React from "react";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import StarIcon from "@mui/icons-material/Star";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import BedIcon from "@mui/icons-material/Bed";
import BathtubOutlinedIcon from "@mui/icons-material/BathtubOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import { Link } from '@/lib/router';
import { formatRange, PropertyAggregates } from "../../utils/propertyAggregates";

interface ApartmentCardProps {
  imageUrl: string;
  title: string;
  location: string;
  rating: number;
  reviews: number;
  hasUnits: boolean;
  minPrice: number;
  maxPrice: number;
  propertylink: string;
  aggregates?: PropertyAggregates;
}

const ApartmentCard: React.FC<ApartmentCardProps> = ({
  imageUrl,
  title,
  location,
  rating,
  reviews,
  hasUnits,
  minPrice,
  maxPrice,
  propertylink,
  aggregates,
}) => {
  const safeMinPrice = isNaN(minPrice) ? 0 : minPrice;
  const safeMaxPrice = isNaN(maxPrice) ? 0 : maxPrice;

  const priceDisplay = safeMinPrice === safeMaxPrice
    ? `₦ ${safeMinPrice.toLocaleString()}`
    : `₦ ${safeMinPrice.toLocaleString()} - ₦ ${safeMaxPrice.toLocaleString()}`;
  const filledStars = Math.round(Number(rating) || 0);
  const hasReviews = (reviews ?? 0) > 0;

  const bedroomLabel = aggregates ? formatRange(aggregates.bedroomRange) : "";
  const bathroomLabel = aggregates ? formatRange(aggregates.bathroomRange) : "";
  const showSpec = aggregates?.hasData;

  return (
    <Link to={propertylink}
      className="flex flex-col items-start font-medium rounded-none max-full cursor-pointer"
    >
      <img
        loading="lazy"
        src={imageUrl}
        alt={title}
        className="object-cover w-full h-56 rounded-lg"
      />
      <h2
        className="mt-5 text-2xl text-zinc-900"
        style={{ fontSize: "clamp(1rem, 2.5vw, 1rem)" }}
      >
        {title}
      </h2>
      <div className="flex gap-1.5 mt-2 text-xs leading-none text-black">
        <LocationOnIcon sx={{ color: "#028090" }} />
        <p className="basis-auto">{location}</p>
      </div>
      {showSpec && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-zinc-700">
          {bedroomLabel && (
            <span className="flex items-center gap-1">
              <BedIcon sx={{ color: "#028090", fontSize: 16 }} />
              {bedroomLabel} bed
            </span>
          )}
          {bathroomLabel && (
            <span className="flex items-center gap-1">
              <BathtubOutlinedIcon sx={{ color: "#028090", fontSize: 16 }} />
              {bathroomLabel} bath
            </span>
          )}
          {aggregates && aggregates.maxGuests > 0 && (
            <span className="flex items-center gap-1">
              <GroupOutlinedIcon sx={{ color: "#028090", fontSize: 16 }} />
              up to {aggregates.maxGuests} guests
            </span>
          )}
        </div>
      )}
      <div className="flex gap-2.5 mt-4 text-center">
        <div className="flex flex-col whitespace-nowrap">
          {hasReviews && (
            <div className="flex gap-2.5 text-xs text-white">
              <div className="px-1.5 bg-cyan-700 rounded-md h-[30px] w-[30px] flex items-center justify-center">
                {Number(rating || 0).toFixed(1)}
              </div>
              <div className="flex items-center">
                {[...Array(5)].map((_, index) =>
                  index < filledStars ? (
                    <StarIcon
                      key={index}
                      sx={{
                        color: "black",
                      }}
                    />
                  ) : (
                    <StarOutlineIcon
                      key={index}
                      sx={{
                        color: "black",
                      }}
                    />
                  )
                )}
              </div>
            </div>
          )}
          <div className={`flex gap-0.5 self-start ${hasReviews ? 'mt-4' : ''} text-xl text-cyan-700`}>
            <span>{hasUnits ? priceDisplay : 'No Pricing Info'}</span>
          </div>
        </div>
        {hasReviews && (
          <p className="self-start mt-2.5 text-xs text-zinc-900">
            ({reviews} review{reviews !== 1 ? 's' : ''})
          </p>
        )}
      </div>
    </Link>
  );
};

export default ApartmentCard;
