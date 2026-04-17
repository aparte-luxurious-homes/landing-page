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
import { 
  usePostPaymentMutation, 
  useGetGatewayConfigQuery 
} from '../../api/paymentApi';
import { useGetProfileQuery } from '../../api/profileApi';
import PaymentMethodSelection from '../booking/PaymentMethodSelection';
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
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentGateway, setPaymentGateway] = useState('');
  
  const [requestExtension, { isLoading: isRequesting }] = useRequestStayExtensionMutation();
  const [postPayment, { isLoading: isInitializingPayment }] = usePostPaymentMutation();
  const { data: profileData } = useGetProfileQuery();
  const { data: gatewayConfigResponse } = useGetGatewayConfigQuery(
    paymentGateway,
    { skip: !paymentGateway || paymentMethod !== 'ONLINE' }
  );

  const wallet = profileData?.data?.wallets?.find((w: any) => w.currency === 'NGN');

  const minDate = addDays(currentEndDateObj, 1);

  const { data: availabilityData, isLoading: isAvailabilityLoading } = useGetUnitAvailabilityQuery(
    { propertyId: propertyId!, unitId: unitId! },
    { skip: !propertyId || !unitId || !open }
  );

  const { maxDate, blackoutDates, bookedDates } = React.useMemo(() => {
    if (!availabilityData?.data || !Array.isArray(availabilityData.data)) {
      return { maxDate: undefined, blackoutDates: [], bookedDates: [] };
    }
    
    const blackoutDatesObjs: Date[] = [];
    const bookedDatesObjs: Date[] = [];
    
    // Process availability data
    availabilityData.data.forEach((item: any) => {
      const isBlackout = item.is_blackout || item.isBlackout || item.is_black_out || false;
      const isBookedOut = item.count === 0 || (item.hasOwnProperty('count') && item.count === 0);
      const isUnavailableStatus = item.status === 'UNAVAILABLE' || item.status === 'BOOKED';
      
      const d = parseDate(typeof item === 'string' ? item : item.date);
      
      if (isBlackout) {
        blackoutDatesObjs.push(d);
      } else if (isBookedOut || isUnavailableStatus) {
        bookedDatesObjs.push(d);
      }
    });
      
    // Find the absolute maximum checkout date (earliest blockage)
    // A guest can checkout ON a booked-out date, but NOT after it.
    // They cannot even checkout ON a blackout date.
    const allBlockages = [...blackoutDatesObjs, ...bookedDatesObjs]
      .map(d => d.getTime())
      .filter(time => time >= currentEndDateObj.getTime())
      .sort((a, b) => a - b);
      
    let maxCheckoutDate: Date | undefined = undefined;
    if (allBlockages.length > 0) {
      maxCheckoutDate = new Date(allBlockages[0]);
    }
    
    return { 
      maxDate: maxCheckoutDate, 
      blackoutDates: blackoutDatesObjs, 
      bookedDates: bookedDatesObjs 
    };
  }, [availabilityData, currentEndDateObj]);

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
    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }
    if (paymentMethod === 'ONLINE' && !paymentGateway) {
      toast.error('Please select a payment gateway');
      return;
    }
    if (!wallet?.id) {
      toast.error('Wallet information not found');
      return;
    }

    if (maxDate && newEndDate > maxDate) {
      toast.error('The selected date is no longer available. Please choose an earlier date.');
      return;
    }
    
    try {
      // Step 1: Create the Extension Booking
      const extensionResponse = await requestExtension({
        bookingId,
        new_end_date: format(newEndDate, 'yyyy-MM-dd'),
      }).unwrap();

      const createdBookingId = extensionResponse.booking_id;
      const totalAmount = extensionResponse.total_price;

      // Step 2: Initiate Payment
      const paymentPayload = {
        amount: totalAmount.toString(),
        booking_id: createdBookingId,
        provider: paymentMethod === 'WALLET' ? '' : paymentGateway,
        description: `Stay Extension Payment for booking ${createdBookingId}`,
        action: 'DEBIT',
        // Add other required fields for postPayment if any
        comment: 'Extension Payment',
        userId: profileData?.data?.userId || '',
        currency: 'NGN',
        type: 'PAYMENT',
        email: profileData?.data?.email || '',
        propertyId: 0, 
        redirect_url: `${window.location.origin}/booking-validation?bookingId=${createdBookingId}&isExtension=true`
      };

      const paymentResponse = await postPayment({
        id: wallet.id,
        payload: paymentPayload,
      }).unwrap();

      const transactionRef = paymentResponse?.data?.reference;
      
      if (paymentMethod === 'WALLET' && paymentResponse?.data?.status === 'SUCCESSFUL') {
        toast.success('Stay extended successfully (paid from wallet)');
        onClose();
        setTimeout(() => window.location.reload(), 1500);
        return;
      }

      if (paymentMethod === 'ONLINE' && paymentResponse?.data?.paymentLink) {
        // Option A: Use SDK (Preferred for better UX)
        const gatewayConfig = gatewayConfigResponse?.data;
        const validationUrl = `${window.location.origin}/booking-validation?paymentReference=${transactionRef}&bookingId=${createdBookingId}&provider=${paymentGateway}&isExtension=true`;

        if (paymentGateway === 'MONNIFY' && window.MonnifySDK && gatewayConfig) {
          window.MonnifySDK.initialize({
            amount: totalAmount,
            currency: 'NGN',
            reference: transactionRef,
            customerFullName: `${profileData?.data?.profile?.firstName || ''} ${profileData?.data?.profile?.lastName || ''}`.trim() || 'Customer',
            customerEmail: profileData?.data?.email,
            apiKey: gatewayConfig.apiKey,
            contractCode: gatewayConfig.contractCode,
            paymentDescription: `Extension Payment for ${createdBookingId}`,
            isTestMode: gatewayConfig.isTestMode,
            onComplete: () => {
              window.location.href = validationUrl;
            },
            onClose: () => {
              toast.info('Payment window closed');
            },
          });
        } else if (paymentGateway === 'PAYSTACK' && window.PaystackPop && gatewayConfig) {
          const handler = window.PaystackPop.setup({
            key: gatewayConfig.publicKey,
            email: profileData?.data?.email,
            amount: totalAmount * 100,
            ref: transactionRef,
            callback: () => {
              window.location.href = validationUrl;
            },
            onClose: () => {
              toast.info('Payment window closed');
            },
          });
          handler.openIframe();
        } else {
          // Fallback to payment link
          window.location.href = paymentResponse.data.paymentLink;
        }
      }
    } catch (err: any) {
      console.error('Extension payment failed:', err);
      toast.error(err?.data?.message || 'Failed to process stay extension payment');
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
                },
                '& .date-blackout': {
                  color: '#d1d5db !important',
                  textDecoration: 'line-through'
                },
                '& .date-booked': {
                  color: '#f97316 !important',
                  fontWeight: 'bold'
                }
              }}
            >
              <DatePicker
                selected={newEndDate}
                onChange={(date) => setNewEndDate(date)}
                minDate={minDate}
                maxDate={maxDate}
                excludeDates={blackoutDates}
                filterDate={(date) => {
                  // Only allow dates that are not blackout AND are at or before maxDate
                  if (maxDate && date > maxDate) return false;
                  return true;
                }}
                dayClassName={(date) => {
                  const time = date.getTime();
                  if (blackoutDates.some(d => d.getTime() === time)) return 'date-blackout';
                  if (bookedDates.some(d => d.getTime() === time)) return 'date-booked';
                  return '';
                }}
                placeholderText="Select new check-out date"
                dateFormat="MMMM d, yyyy"
              />
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ bgcolor: '#f8fafb', p: 2, borderRadius: 2, mb: 3 }}>
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

          <Box sx={{ mb: 1 }}>
            <PaymentMethodSelection
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              paymentGateway={paymentGateway}
              setPaymentGateway={setPaymentGateway}
              wallet={wallet}
              formatPrice={(p) => `₦${p.toLocaleString()}`}
            />
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
          disabled={isRequesting || isInitializingPayment || isAvailabilityLoading || !newEndDate || extraNights <= 0}
          sx={{ 
            bgcolor: '#028090', 
            '&:hover': { bgcolor: '#026f7a' },
            minWidth: 150
          }}
        >
          {isRequesting || isInitializingPayment ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            paymentMethod === 'WALLET' ? 'Pay with Wallet' : 'Proceed to Pay'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExtendStayModal;
