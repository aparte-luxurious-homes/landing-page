import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Divider,
  CircularProgress,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { addDays, differenceInDays, format } from 'date-fns';
import { useRequestStayExtensionMutation } from '../../api/bookingsApi';
import { useGetUnitAvailabilityQuery } from '../../api/propertiesApi';
import { toast } from 'react-toastify';

interface ExtendStayModalProps {
  open: boolean;
  onClose: () => void;
  bookingId: string;
  currentEndDate: string; // YYYY-MM-DD
  pricePerNight: number;
  propertyName: string;
  propertyId?: string;
  unitId?: string;
}

const ExtendStayModal: React.FC<ExtendStayModalProps> = ({
  open,
  onClose,
  bookingId,
  currentEndDate,
  pricePerNight,
  propertyName,
  propertyId,
  unitId,
}) => {
  const parseDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const currentEndDateObj = parseDate(currentEndDate);
  
  const [newEndDate, setNewEndDate] = useState<Date | null>(
    addDays(currentEndDateObj, 1)
  );
  const [requestExtension, { isLoading }] = useRequestStayExtensionMutation();
  const minDate = addDays(currentEndDateObj, 1);

  const { data: availabilityData, isLoading: isAvailabilityLoading } = useGetUnitAvailabilityQuery(
    { propertyId: propertyId!, unitId: unitId! },
    { skip: !propertyId || !unitId || !open }
  );

  const maxDate = React.useMemo(() => {
    if (!availabilityData?.data) return undefined;
    
    const blockedDatesStr = availabilityData.data
      .filter((item: any) => {
        if (item.hasOwnProperty('count') && item.count > 0 && !item.is_blackout) return false;
        if (item.status && item.status !== 'UNAVAILABLE' && item.status !== 'BOOKED') return false;
        return true;
      })
      .map((item: any) => (typeof item === 'string' ? item : item.date));
      
    // Sort to find the earliest blocked night at or after minDate
    const blockedDates = blockedDatesStr
      .map((d: string) => parseDate(d).getTime())
      .filter((time: number) => time >= minDate.getTime())
      .sort((a: number, b: number) => a - b);
      
    if (blockedDates.length > 0) {
      // The earliest blocked night is the maximum allowed checkout date
      // (checking out on that morning avoids overlapping the blocked night)
      return new Date(blockedDates[0]);
    }
    return undefined;
  }, [availabilityData, minDate]);

  const extraNights = newEndDate 
    ? Math.max(0, differenceInDays(
        new Date(newEndDate.getFullYear(), newEndDate.getMonth(), newEndDate.getDate()),
        new Date(currentEndDateObj.getFullYear(), currentEndDateObj.getMonth(), currentEndDateObj.getDate())
      ))
    : 0;
  
  const dailyRate = pricePerNight || 0;
  const extensionAmount = extraNights * dailyRate;

  const handleSubmit = async () => {
    if (!newEndDate) return;

    try {
      await requestExtension({
        bookingId,
        new_end_date: format(newEndDate, 'yyyy-MM-dd'),
      }).unwrap();

      toast.success('Stay extension requested successfully');
      onClose();
      // Reload or refresh data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      console.error('Extension request failed:', err);
      toast.error(err?.data?.message || 'Failed to request stay extension');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Extend Stay
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ py: 1 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Extending your stay at <strong>{propertyName}</strong>
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', mb: 2, color: 'info.main' }}>
            Current Check-out: {format(currentEndDateObj, 'MMM dd, yyyy')}
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              New Check-out Date
            </Typography>
            <Box 
              sx={{ 
                '& .react-datepicker-wrapper': { width: '100%' },
                '& .react-datepicker__input-container input': {
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0',
                  fontSize: '0.9rem',
                  outline: 'none',
                  '&:focus': { borderColor: '#028090' }
                }
              }}
            >
              <DatePicker
                selected={newEndDate}
                onChange={(date) => setNewEndDate(date)}
                minDate={minDate}
                maxDate={maxDate}
                placeholderText="Select new check-out date"
                dateFormat="MMMM d, yyyy"
              />
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ bgcolor: '#f8fafb', p: 2, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Additional Nights</Typography>
              <Typography variant="body2" fontWeight={600}>{extraNights} {extraNights === 1 ? 'night' : 'nights'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Daily Rate</Typography>
              <Typography variant="body2" fontWeight={600}>₦{dailyRate.toLocaleString()}</Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="subtitle1" fontWeight={700}>Total Extension Cost</Typography>
              <Typography variant="subtitle1" fontWeight={700} color="primary">
                ₦{extensionAmount.toLocaleString()}
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, px: 3 }}>
        <Button onClick={onClose} variant="text" color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading || !newEndDate || extraNights <= 0}
          sx={{ 
            bgcolor: '#028090', 
            '&:hover': { bgcolor: '#026f7a' },
            minWidth: 150
          }}
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Submit Extension Request'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExtendStayModal;
