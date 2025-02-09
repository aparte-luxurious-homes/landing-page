import React, { useState } from 'react';

interface GuestCounterProps {
  onAction: (e: string) => void;
}

const GuestCounter: React.FC<GuestCounterProps> = ({ onAction }) => {
  const [guests, setGuests] = useState(1);

  const handleIncrement = () => {
    setGuests(guests + 1);
  };

  const handleDecrement = () => {
    if (guests > 1) {
      setGuests(guests - 1);
    }
  };

  return (
    <div className="flex gap-6 items-center px-4 py-2.5 mt-5 rounded-xl bg-zinc-100">
      <img
        loading="lazy"
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/3e139f6d1d7f0380905469bbad01c008af7db68962b3b9ef04fdb7fbf7702420?placeholderIfAbsent=true&apiKey=8e9d8cabec6941f3ad44d75c45253ccb"
        alt=""
        className="object-contain shrink-0 self-stretch my-auto aspect-square w-[18px]"
      />
      <span className="self-stretch my-auto text-sm">Add Guests</span>
      <button
        onClick={() => onAction('decrement')}
        aria-label="Decrease guest count"
        className="object-contain shrink-0 self-stretch rounded-none aspect-square w-[20px]"
      >
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/b417e5bd0ced9b68408b15c99b48eff37e2e42bf45741480f8c7ee31dd22a9d0?placeholderIfAbsent=true&apiKey=8e9d8cabec6941f3ad44d75c45253ccb"
          alt=""
          className="w-full h-full"
        />
      </button>
      <span className="self-stretch my-auto font-medium text-center text-sm">
        {guests}
      </span>
      <button
        onClick={() => onAction('increment')}
        // onClick={handleIncrement}
        aria-label="Increase guest count"
        className="object-contain shrink-0 self-stretch rounded-none aspect-square w-[20px]"
      >
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/15d8b3ec1e0236b3e2c78f88424c3e669805d769a68ec2eebf345cae374bf23e?placeholderIfAbsent=true&apiKey=8e9d8cabec6941f3ad44d75c45253ccb"
          alt=""
          className="w-full h-full"
        />
      </button>
    </div>
  );
};

export default GuestCounter;
