import React from 'react';

interface SearchInputProps {
  placeholder: string;
  iconSrc: string;
  borderRadius: string;
  py?: string;
  onClick?: () => void;
}

const SearchInput: React.FC<SearchInputProps> = ({
  placeholder,
  iconSrc,
  borderRadius,
  py = "6",
  onClick,
}) => {
  return (
    <div className="flex flex-col text-base rounded-none max-w-100 text-zinc-500">
      <div
        className={`flex gap-5 px-7 py-${py} bg-white border border-cyan-700 border-solid shadow-sm`}
        style={{ borderRadius }}
        onClick={onClick}
      >
        <img
          loading="lazy"
          src={iconSrc}
          alt=""
          className="object-contain shrink-0 w-6 aspect-square"
        />
        <input
          type="text"
          placeholder={placeholder}
          className="flex-auto my-auto bg-transparent border-none outline-none"
          aria-label={placeholder}
        />
      </div>
    </div>
  );
};

export default SearchInput;