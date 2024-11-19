import React, { useState } from "react";

const GuestsInput: React.FC = () => {
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
    <div className="flex items-center">
      <button
        type="button"
        onClick={handleDecrement}
        className="px-2 py-1 border border-gray-300 rounded-l"
      >
        -
      </button>
      <input
        type="text"
        value={guests}
        readOnly
        className="w-12 text-center border-t border-b border-gray-300"
      />
      <button
        type="button"
        onClick={handleIncrement}
        className="px-2 py-1 border border-gray-300 rounded-r"
      >
        +
      </button>
    </div>
  );
};

export default GuestsInput;
