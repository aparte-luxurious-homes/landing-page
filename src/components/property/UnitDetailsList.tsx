'use client';

import React from 'react';
import { Box, Typography, Tabs, Tab, Grid, Button } from '@mui/material';
import TabContext from '@mui/lab/TabContext';
import TabPanel from '@mui/lab/TabPanel';
import {
    Group as GroupIcon,
    BedroomParent as BedroomParentIcon,
    BathtubOutlined as BathtubIcon,
    Weekend as LivingIcon,
    Kitchen as KitchenIcon,
} from '@mui/icons-material';
import { amenityIconFor, isPublishableAmenity } from '@/lib/amenityIcons';

interface Unit {
    id: string;
    name: string;
    description: string;
    bedroom_count: number;
    bathroom_count: number;
    kitchen_count: number;
    living_room_count: number;
    max_guests: number;
    count: number;
    price_per_night: string;
    caution_fee: string;
    /* Flat {id, name} — NOT the nested {amenity:{name}} this used to declare.
       The FastAPI serializer has returned the flat shape since the rewrite
       (services/properties/serializers.py), so every `amenity.amenity.name`
       read here was undefined and the whole section silently never rendered. */
    amenities: { id: string; name: string }[];
    availability: string[];
    is_verified: boolean;
    is_whole_property: boolean;
    media: {
        fileUrl: string;
    }[];
    meta: {
        total_reviews: number;
        average_rating: number;
    };
    property_id: string;
    createdAt: string;
    updatedAt: string;
}

interface UnitDetailsListProps {
    units: Unit[] | undefined;
    activeTab: string;
    onTabChange: (newValue: string) => void;
    showFullDescription: boolean;
    setShowFullDescription: (show: boolean) => void;
    showAllAmenities: boolean;
    setShowAllAmenities: (show: boolean) => void;
    displayCount: number;
}

/*
 * The exact-key icon map that used to live here ('FREE WIFI', 'SWIMMING
 * POOL', …) was keyed on names that mostly do not exist in the database —
 * production holds 'WiFi', 'Pool', 'Air Conditioning'. Icon selection now
 * lives in lib/amenityIcons and matches by normalised containment, the same
 * way the backend resolves amenity concepts.
 */

const UnitDetailsList: React.FC<UnitDetailsListProps> = ({
    units,
    activeTab,
    onTabChange,
    showFullDescription,
    setShowFullDescription,
    showAllAmenities,
    setShowAllAmenities,
    displayCount,
}) => {
    return (
        <Box id="unit-details" sx={{ mb: 3 }}>
            <Typography variant="h5" gutterBottom fontWeight={500}>
                Unit Details
            </Typography>
            <TabContext value={activeTab.toString()}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={activeTab}
                        onChange={(_, newValue) => {
                            onTabChange(newValue);
                            // Reset scroll position when changing units
                            window.scrollTo({
                                top: document.getElementById('unit-details')?.offsetTop || 0,
                                behavior: 'smooth'
                            });
                        }}
                        variant="scrollable"
                        scrollButtons="auto"
                        aria-label="property units"
                    >
                        {units?.map((unit) => (
                            <Tab
                                key={unit.id}
                                label={unit.name}
                                value={unit.id}
                                sx={{
                                    textTransform: 'none',
                                    fontSize: '1rem',
                                    fontWeight: 500,
                                }}
                            />
                        ))}
                    </Tabs>
                </Box>

                {units?.map((unit) => (
                    <TabPanel key={unit.id} value={unit.id.toString()}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Box sx={{
                                    p: { xs: 2, md: 3 },
                                }}>
                                    <Grid container spacing={4}>
                                        {/* Unit Description */}
                                        <Grid item xs={12}>
                                            <Typography
                                                variant="body1"
                                                color="text.secondary"
                                                sx={{
                                                    lineHeight: 1.7,
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: showFullDescription ? 'unset' : 3,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                {unit.description}
                                            </Typography>
                                            {unit.description && unit.description.length > 250 && (
                                                <Button
                                                    onClick={() => setShowFullDescription(!showFullDescription)}
                                                    sx={{
                                                        mt: 1,
                                                        textTransform: 'none',
                                                        fontSize: '0.875rem',
                                                        fontWeight: 500,
                                                        color: 'primary.main',
                                                        p: 0,
                                                        '&:hover': {
                                                            bgcolor: 'transparent',
                                                            color: 'primary.dark',
                                                        }
                                                    }}
                                                >
                                                    {showFullDescription ? 'Show less' : 'Read more'}
                                                </Button>
                                            )}
                                        </Grid>

                                        {/* Basic Unit Info */}
                                        <Grid item xs={12}>
                                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                                                Basic Unit Info
                                            </Typography>
                                            <Grid container spacing={2}>
                                                <Grid item xs={6} sm={3}>
                                                    <Box sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1.5,
                                                        color: 'text.primary'
                                                    }}>
                                                        <GroupIcon sx={{ fontSize: 24, color: 'primary.main' }} />
                                                        <Typography>{unit.max_guests} Guests</Typography>
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={6} sm={3}>
                                                    <Box sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1.5,
                                                        color: 'text.primary'
                                                    }}>
                                                        <BedroomParentIcon sx={{ fontSize: 24, color: 'primary.main' }} />
                                                        <Typography>{unit.bedroom_count} Bedrooms</Typography>
                                                    </Box>
                                                </Grid>
                                                {unit.bathroom_count > 0 && (
                                                    <Grid item xs={6} sm={3}>
                                                        <Box sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 1.5,
                                                            color: 'text.primary'
                                                        }}>
                                                            <BathtubIcon sx={{ fontSize: 24, color: 'primary.main' }} />
                                                            <Typography>{unit.bathroom_count} Bathrooms</Typography>
                                                        </Box>
                                                    </Grid>
                                                )}
                                                <Grid item xs={6} sm={3}>
                                                    <Box sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1.5,
                                                        color: 'text.primary'
                                                    }}>
                                                        <LivingIcon sx={{ fontSize: 24, color: 'primary.main' }} />
                                                        <Typography>{unit.living_room_count} Living Room</Typography>
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={6} sm={3}>
                                                    <Box sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1.5,
                                                        color: 'text.primary'
                                                    }}>
                                                        <KitchenIcon sx={{ fontSize: 24, color: 'primary.main' }} />
                                                        <Typography>{unit.kitchen_count} Kitchen</Typography>
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        </Grid>

                                        {/* Unit Amenities */}
                                        {unit.amenities && unit.amenities.some(amenity => isPublishableAmenity(amenity?.name)) && (
                                            <Grid item xs={12}>
                                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                                                    Amenities
                                                </Typography>
                                                <Grid container spacing={2}>
                                                    {unit.amenities
                                                        .filter(amenity => isPublishableAmenity(amenity?.name))
                                                        .slice(0, showAllAmenities ? undefined : displayCount)
                                                        .map((amenity, index) => (
                                                            <Grid item xs={6} sm={3} key={index}>
                                                                <Box sx={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: 1.5,
                                                                    // p: 1.5,
                                                                    borderRadius: 1,
                                                                    bgcolor: 'background.default',
                                                                    transition: 'all 0.2s ease-in-out',
                                                                    '&:hover': {
                                                                        bgcolor: 'action.hover',
                                                                        transform: 'translateY(-2px)',
                                                                    }
                                                                }}>
                                                                    {React.createElement(amenityIconFor(amenity?.name), { className: 'text-black mr-2' })}
                                                                    <Typography variant="body2" noWrap>
                                                                        {amenity?.name}
                                                                    </Typography>
                                                                </Box>
                                                            </Grid>
                                                        ))}
                                                </Grid>

                                                {unit.amenities.filter(amenity => isPublishableAmenity(amenity?.name)).length > displayCount && (
                                                    <Button
                                                        onClick={() => setShowAllAmenities(!showAllAmenities)}
                                                        sx={{
                                                            mt: 3,
                                                            textTransform: 'none',
                                                            fontSize: '0.875rem',
                                                            fontWeight: 500,
                                                            color: 'primary.main',
                                                            '&:hover': {
                                                                bgcolor: 'transparent',
                                                                color: 'primary.dark',
                                                            }
                                                        }}
                                                    >
                                                        {showAllAmenities ? 'Show less' : `Show all ${unit.amenities.length} amenities`}
                                                    </Button>
                                                )}
                                            </Grid>
                                        )}
                                    </Grid>
                                </Box>
                            </Grid>
                        </Grid>
                    </TabPanel>
                ))}
            </TabContext>
        </Box>
    );
};

export default UnitDetailsList;
