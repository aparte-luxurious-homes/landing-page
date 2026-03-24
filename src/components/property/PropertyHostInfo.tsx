import React from 'react';
import { Box, Typography } from '@mui/material';
import { Star as StarIcon, Group as GroupIcon } from '@mui/icons-material';

interface PropertyHostInfoProps {
    agent: {
        name: string;
        image?: string;
        profile?: {
            firstName: string;
            lastName: string;
        };
    } | undefined;
    meta: {
        total_reviews: number;
        average_rating: number;
    } | undefined;
}

const PropertyHostInfo: React.FC<PropertyHostInfoProps> = ({ agent, meta }) => {
    return (
        <Box sx={{
            p: { xs: 2, md: 3 },
            mb: 4,
            borderRadius: 2,
            bgcolor: 'background.paper',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: 2
        }}>
            {agent?.image ? (
                <Box
                    component="img"
                    src={agent?.image}
                    alt="Host"
                    sx={{
                        width: { xs: 48, md: 56 },
                        height: { xs: 48, md: 56 },
                        borderRadius: '50%',
                        objectFit: 'cover'
                    }}
                />
            ) : (
                <Box
                    sx={{
                        width: { xs: 48, md: 56 },
                        height: { xs: 48, md: 56 },
                        borderRadius: '50%',
                        bgcolor: 'grey.200',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <GroupIcon sx={{ fontSize: 30, color: 'grey.400' }} />
                </Box>
            )}
            <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontSize: { xs: '1rem', md: '1.25rem' }, mb: 0.5 }}>
                    Hosted by {agent?.profile?.firstName
                        ? `${agent?.profile?.firstName} ${agent?.profile?.lastName || ''}`
                        : 'Aparte'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StarIcon sx={{ fontSize: '1rem', color: 'primary.main' }} />
                    <Typography variant="body2" color="text.secondary">
                        {meta?.average_rating?.toFixed(1) || '0.0'} · {meta?.total_reviews || 0} reviews
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default PropertyHostInfo;
