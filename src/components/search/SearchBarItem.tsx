import React from 'react';

interface SearchBarItemProps {
  label: string;
  value: string;
  onClick: () => void;
  isActive?: boolean; // Add isActive prop for active state styling
  className?: string; //
}

const SearchBarItem: React.FC<SearchBarItemProps> = ({
  label,
  value,
  onClick,
  isActive = false, // Set default value for isActive prop to false
}) => (
  <div
    className={`flex flex-col self-stretch my-auto cursor-pointer  
     ${
       label !== 'Location'
         ? 'px-4 md:px-4 lg:px-8 xl:px-12'
         : 'pr-4 md:pr-4 lg:pr-12'
     }`}
    onClick={onClick}
    style={{
      maxWidth: '12rem',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    }}
  >
    <div
      className="self-start text-[12px]"
      style={{ color: isActive ? '#028090' : '#1f2937' }}
    >
      {label}
    </div>
    <div
      className="text-sm lg:text-base"
      style={{ color: isActive ? '#028090' : '#6b7280' }}
    >
      {value}
    </div>
  </div>
);

export default SearchBarItem;
