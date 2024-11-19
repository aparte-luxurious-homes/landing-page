import React from 'react';

interface PropertyTypeProps {}

const PropertyType: React.FC<PropertyTypeProps> = () => {
  return (
    <div className="flex gap-7 px-4 py-3 mt-5 rounded-xl bg-zinc-100">
      <img
        loading="lazy"
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/10fd403de1f3d214fa9279b784cccb8c471c239e4509affde84a0b93916233d3?placeholderIfAbsent=true&apiKey=8e9d8cabec6941f3ad44d75c45253ccb"
        alt=""
        className="object-contain shrink-0 self-start aspect-square w-[18px]"
      />
      <button className="basis-auto text-left text-sm">Property type</button>
    </div>
  );
};

export default PropertyType;