import React from 'react';
import { Box, Typography, Button, Skeleton } from '@mui/material';
import DateInput from '../search/DateInput';
import { toast } from 'react-toastify';

interface BookingSidebarProps {
    isLoading: boolean;
    basePrice: number;
    datePrice: number | null;
    checkInDate: Date | null;
    checkOutDate: Date | null;
    setCheckInDate: (date: Date | null) => void;
    setCheckOutDate: (date: Date | null) => void;
    unitAvailability: any[];
    selectedUnits: number;
    setSelectedUnits: (units: number) => void;
    activeUnit: any;
    adults: number;
    children: number;
    setAdults: (val: number) => void;
    setChildren: (val: number) => void;
    pets: number;
    setPets: (val: number) => void;
    isPetAllowed: boolean;
    nights: number;
    totalChargingFee: number;
    cautionFeePercentage: number;
    handleConfirmBookingClick: () => void;
    formatPrice: (price: number) => string;
    bookingMode?: string;
}

const BookingSidebar: React.FC<BookingSidebarProps> = ({
    isLoading,
    basePrice,
    datePrice,
    checkInDate,
    checkOutDate,
    setCheckInDate,
    setCheckOutDate,
    unitAvailability,
    selectedUnits,
    setSelectedUnits,
    activeUnit,
    adults,
    children,
    setAdults,
    setChildren,
    pets,
    setPets,
    isPetAllowed,
    nights,
    totalChargingFee,
    cautionFeePercentage,
    handleConfirmBookingClick,
    formatPrice,
    bookingMode = 'INSTANT',
}) => {
    const isRequestToBook = bookingMode === 'REQUEST_TO_BOOK';
    return (
        <Box sx={{
            position: 'sticky',
            top: 24,
            p: 2.5,
            borderRadius: 2,
            bgcolor: 'background.paper',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            border: '1px solid',
            borderColor: 'divider'
        }}>
            {/* Price Display */}
            <Typography variant="h4" sx={{
                color: 'primary.main',
                mb: 2,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'baseline',
                gap: 1
            }}>
                {isLoading ? <Skeleton width={150} /> : formatPrice(datePrice || basePrice)}
                <Typography component="span" variant="body2" sx={{ color: 'text.secondary' }}>/night</Typography>
            </Typography>

            <Box sx={{ mb: 2.5 }}>
                <DateInput
                    onClose={() => { }}
                    checkInDate={checkInDate}
                    checkOutDate={checkOutDate}
                    onCheckInDateSelect={setCheckInDate}
                    onCheckOutDateSelect={setCheckOutDate}
                    availableDates={unitAvailability}
                    showTwoMonths={false}
                    displayError={(message) => {
                        toast.error(message);
                    }}
                />
            </Box>

            {/* Units Input */}
            <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>Units</Typography>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    '&:hover': {
                        borderColor: 'primary.main',
                    }
                }}>
                    <input
                        type="number"
                        value={selectedUnits}
                        onChange={(e) => {
                            const count = parseInt(e.target.value) || 1;
                            const maxAvail = activeUnit?.count || 1;
                            const constrained = Math.max(1, Math.min(count, maxAvail));
                            setSelectedUnits(constrained);
                            if (count > maxAvail) {
                                toast.warn(`Only ${maxAvail} units available for this type`);
                            }
                        }}
                        min="1"
                        max={activeUnit?.count || 1}
                        style={{
                            width: '100%',
                            border: 'none',
                            outline: 'none',
                            fontSize: '1rem',
                            textAlign: 'center',
                        }}
                    />
                </Box>
            </Box>

            {/* Nights and Guests Inputs */}
            <Box sx={{ my: 2, display: 'flex', gap: 2 }}>
                {/* Guests Input */}
                <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>Guests</Typography>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        p: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        '&:hover': {
                            borderColor: 'primary.main',
                        }
                    }}>
                        <input
                            type="number"
                            value={adults + children || 1}
                            onChange={(e) => {
                                const total = parseInt(e.target.value) || 1;
                                const maxAllowed = (activeUnit?.max_guests || 1) * selectedUnits;
                                const constrainedTotal = Math.max(1, Math.min(total, maxAllowed));
                                setAdults(constrainedTotal);
                                setChildren(0);
                                if (total > maxAllowed) {
                                    toast.warn(`Maximum guests allowed for ${selectedUnits} units is ${maxAllowed}`);
                                }
                            }}
                            min="1"
                            max={(activeUnit?.max_guests || 1) * selectedUnits}
                            style={{
                                width: '100%',
                                border: 'none',
                                outline: 'none',
                                fontSize: '1rem',
                                textAlign: 'center',
                            }}
                        />
                    </Box>
                </Box>
            </Box>

            {/* Pets Input */}
            <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>Pets (Optional)</Typography>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    '&:hover': {
                        borderColor: 'primary.main',
                    }
                }}>
                    <input
                        type="number"
                        value={pets}
                        onChange={(e) => setPets(Math.max(0, parseInt(e.target.value) || 0))}
                        min="0"
                        disabled={!isPetAllowed}
                        style={{
                            width: '100%',
                            border: 'none',
                            outline: 'none',
                            fontSize: '1rem',
                            textAlign: 'center',
                            WebkitAppearance: 'none',
                            MozAppearance: 'textfield',
                            backgroundColor: !isPetAllowed ? '#f0f0f0' : 'transparent',
                            cursor: !isPetAllowed ? 'not-allowed' : 'text'
                        }}
                    />
                </Box>
            </Box>

            {/* Total Price Breakdown */}
            <Box sx={{ mb: 2, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Price Details</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>{nights} night{nights !== 1 ? 's' : ''} × {selectedUnits} unit{selectedUnits !== 1 ? 's' : ''}</Typography>
                    <Typography>{formatPrice(basePrice * nights * selectedUnits)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Caution Fee</Typography>
                    <Typography>{formatPrice(Number(cautionFeePercentage))}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Typography fontWeight={600}>Total</Typography>
                    <Typography fontWeight={600}>{formatPrice(totalChargingFee)}</Typography>
                </Box>
            </Box>

            {/* Book / Request Button */}
            {isRequestToBook && (
                <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mb: 1, color: 'text.secondary' }}>
                    This property requires owner approval before booking is confirmed.
                </Typography>
            )}
            <Button
                fullWidth
                variant="contained"
                onClick={handleConfirmBookingClick}
                sx={{
                    py: 1.5,
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 500,
                }}
            >
                {isRequestToBook ? 'Request to Book' : 'Book Now'}
            </Button>
        </Box>
    );
};

export default BookingSidebar;
