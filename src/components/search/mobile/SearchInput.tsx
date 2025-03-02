import React from 'react';

interface SearchInputProps {
  placeholder: string;
  iconSrc: string;
  borderRadius: string;
  py?: string;
  onClick?: () => void;
  value?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  placeholder,
  iconSrc,
  borderRadius,
  py = '6',
  onClick,
  value,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex gap-5 px-7 py-${py} bg-white border border-cyan-700 border-solid shadow-sm text-left`}
      style={{ borderRadius }}
    >
      <img
        loading="lazy"
        src={iconSrc}
        alt=""
        className="object-contain shrink-0 w-6 aspect-square"
      />
      <span className="flex-auto my-auto text-zinc-500 text-base">
        {value || placeholder}
      </span>
    </button>
  );
};

export default SearchInput;
