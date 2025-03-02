import { Box } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

interface CustomPaginationProps {
  count: number;
  page: number;
  onChange: (event: React.MouseEvent<HTMLButtonElement> | React.ChangeEvent<unknown>, newPage: number) => void;
  variant?: 'outlined' | 'text';
  shape?: 'rounded' | 'circular';
  size?: 'small' | 'medium' | 'large';
}

const CustomPagination: React.FC<CustomPaginationProps> = ({
  count,
  page,
  onChange,
  variant = 'outlined',
  shape = 'rounded',
  size = 'medium',
}) => {
  const handlePageChange = (
    event: React.MouseEvent<HTMLButtonElement> | React.ChangeEvent<unknown>,
    newPage: number
  ) => {
    if (newPage >= 1 && newPage <= count) {
      onChange(event, newPage);
    }
  };

  const buttonClasses = `
    pagination-item 
    ${variant === 'outlined' ? 'border border-gray-300' : ''} 
    ${shape === 'rounded' ? 'rounded-md' : 'rounded-full'}
    ${size === 'small' ? 'w-8 h-8' : size === 'large' ? 'w-12 h-12' : 'w-10 h-10'}
  `;

  return (
    <Box className="flex items-center justify-center gap-2">
      <button
        className={`${buttonClasses} ${page === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={(event) => handlePageChange(event, page - 1)}
        disabled={page === 1}
      >
        <ArrowBackIosIcon sx={{ fontSize: size === 'small' ? 14 : size === 'large' ? 20 : 16 }} />
      </button>
      
      <Box className="flex gap-1">
        {Array.from({ length: count }, (_, i) => i + 1).map((number) => (
          <button
            key={number}
            className={`
              ${buttonClasses}
              ${number === page ? 'bg-cyan-700 text-white' : 'hover:bg-gray-100'}
            `}
            onClick={(event) => handlePageChange(event, number)}
          >
            {number}
          </button>
        ))}
      </Box>

      <button
        className={`${buttonClasses} ${page === count ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={(event) => handlePageChange(event, page + 1)}
        disabled={page === count}
      >
        <ArrowForwardIosIcon sx={{ fontSize: size === 'small' ? 14 : size === 'large' ? 20 : 16 }} />
      </button>
    </Box>
  );
};

export default CustomPagination;
