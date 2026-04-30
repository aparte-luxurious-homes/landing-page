import React, { useState } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Box, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { setBookingMode, BookingMode } from '../../features/property/propertySlice';

interface ListFlowBookingModeProps {
  onNext: () => void;
  onBack: () => void;
}

const OPTIONS: Array<{
  value: BookingMode;
  title: string;
  recommended?: boolean;
  description: string;
  details: string[];
}> = [
  {
    value: 'INSTANT',
    title: 'Instant Book',
    recommended: true,
    description: 'Guests can book your property immediately without waiting for your approval.',
    details: [
      'Bookings confirm as soon as the guest pays',
      'Higher visibility in search results',
      'Best for hands-off hosts',
    ],
  },
  {
    value: 'REQUEST_TO_BOOK',
    title: 'Request to Book',
    description: "Review each booking request before the guest can pay.",
    details: [
      'You approve or reject each request',
      'Dates are held while requests are pending',
      'Requests auto-expire after 24 hours if not actioned',
    ],
  },
];

const ListFlowBookingMode: React.FC<ListFlowBookingModeProps> = ({ onNext, onBack }) => {
  const dispatch = useAppDispatch();
  const currentMode = useAppSelector((state) => state.property.propertyFormData.booking_mode);
  const [selected, setSelected] = useState<BookingMode>(currentMode || 'INSTANT');

  const handleContinue = () => {
    dispatch(setBookingMode(selected));
    onNext();
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 md:py-40 md:px-6">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl md:text-3xl text-center font-medium text-black mb-4">
          How do you want to handle bookings?
        </h1>
        <p className="text-base text-gray-700 text-center mb-8">
          You can change this later from your property settings.
        </p>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {OPTIONS.map((option) => {
            const isSelected = selected === option.value;
            return (
              <Box
                key={option.value}
                onClick={() => setSelected(option.value)}
                sx={{
                  cursor: 'pointer',
                  border: '2px solid',
                  borderColor: isSelected ? '#028090' : 'grey.300',
                  borderRadius: 2,
                  p: 3,
                  backgroundColor: isSelected ? 'rgba(2, 128, 144, 0.05)' : 'transparent',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: '#028090',
                    backgroundColor: 'rgba(2, 128, 144, 0.05)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  {isSelected ? (
                    <CheckCircleIcon sx={{ color: '#028090', mt: 0.5 }} />
                  ) : (
                    <RadioButtonUncheckedIcon sx={{ color: 'grey.400', mt: 0.5 }} />
                  )}
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: isSelected ? '#028090' : 'text.primary' }}>
                        {option.title}
                      </Typography>
                      {option.recommended && (
                        <Typography
                          component="span"
                          sx={{
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            color: '#028090',
                            backgroundColor: 'rgba(2, 128, 144, 0.12)',
                            borderRadius: 1,
                            px: 1,
                            py: 0.25,
                          }}
                        >
                          RECOMMENDED
                        </Typography>
                      )}
                    </Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
                      {option.description}
                    </Typography>
                    <Box component="ul" sx={{ m: 0, pl: 2.5, color: 'text.secondary' }}>
                      {option.details.map((d) => (
                        <Box component="li" key={d} sx={{ fontSize: '0.85rem', mb: 0.25 }}>
                          {d}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>

        <div className="flex justify-between w-full mt-8">
          <button
            className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100"
            onClick={onBack}
          >
            <ArrowBackIcon className="mr-2" />
            Back
          </button>
          <button
            className="flex items-center px-14 py-2 rounded-md bg-[#028090] text-white hover:bg-[#026f7a]"
            onClick={handleContinue}
          >
            Continue
            <ArrowForwardIcon className="ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListFlowBookingMode;
