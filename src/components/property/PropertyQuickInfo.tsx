import React from 'react';
import { Box, Typography } from '@mui/material';
import { LocationOn as LocationOnIcon, Home as HomeIcon, Pets as PetsIcon } from '@mui/icons-material';

interface PropertyQuickInfoProps {
    city: string | undefined;
    country: string | undefined;
    propertyType: string | undefined;
    isPetAllowed: boolean | undefined;
}

const PropertyQuickInfo: React.FC<PropertyQuickInfoProps> = ({
    city,
    country,
    propertyType,
    isPetAllowed
}) => {
    return (
        <Box sx={{
            mb: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            flexWrap: 'wrap',
            color: 'text.secondary',
            fontSize: '0.875rem'
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocationOnIcon sx={{ fontSize: 18 }} />
                {city}, {country}
            </Box>
            <Typography sx={{ color: 'text.disabled' }}>•</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <HomeIcon sx={{ fontSize: 18 }} />
                {propertyType}
            </Box>
            <Typography sx={{ color: 'text.disabled' }}>•</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PetsIcon sx={{ fontSize: 18 }} />
                {isPetAllowed ? 'Pets Allowed' : 'No Pets'}
            </Box>
        </Box>
    );
};

export default PropertyQuickInfo;
