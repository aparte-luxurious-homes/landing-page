import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Paper,
  Avatar,
  Divider,
  useTheme,
  useMediaQuery,
  Skeleton,
  Container,
  TextField,
  Button,
} from '@mui/material';
import {
  Person as PersonIcon,
  BookOnline as BookingIcon,
  Receipt as TransactionIcon,
  Settings as SettingsIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { styled } from '@mui/system';
import { useGetProfileQuery, useUpdateProfileMutation } from '../api/profileApi';
import BookingHistory from '../components/account/BookingHistory';
import TransactionHistory from '../components/account/TransactionHistory';
import AccountSettings from '../components/account/AccountSettings';
import PageLayout from '../components/pagelayout';
import FormContainer from '../components/forms/FormContainer';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface Wallet {
  id: string;
  balance: number;
  currency: string;
}

interface ProfileData {
  userId: string;
  status: string;
  provider: string;
  currency: string;
  email: string;
  role: string;
  wallets: Wallet[];
  firstName?: string;
  lastName?: string;
  avatar?: string;
  phone?: string;
}

interface ProfileResponse {
  data: ProfileData;
  message: string;
}

interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
}

const TabPanel = ({ children, value, index, ...other }: TabPanelProps) => (
  <Box
    role="tabpanel"
    hidden={value !== index}
    id={`vertical-tabpanel-${index}`}
    aria-labelledby={`vertical-tab-${index}`}
    sx={{ width: '100%', p: { xs: 2, md: 3 } }}
    {...other}
  >
    {value === index && children}
  </Box>
);

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderRight: `1px solid ${theme.palette.divider}`,
  '& .MuiTab-root': {
    alignItems: 'flex-start',
    textAlign: 'left',
    justifyContent: 'flex-start',
    textTransform: 'none',
    fontSize: '1rem',
    minHeight: 48,
    padding: '12px 24px',
    color: theme.palette.text.secondary,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      backgroundColor: 'rgba(2, 128, 144, 0.04)',
    },
    '&.Mui-selected': {
      color: '#028090',
      backgroundColor: 'rgba(2, 128, 144, 0.08)',
      fontWeight: 600,
    },
    '& .MuiTab-iconWrapper': {
      marginRight: theme.spacing(2),
      color: 'inherit',
    },
  },
  '& .MuiTabs-indicator': {
    backgroundColor: '#028090',
    width: 4,
    borderRadius: '0 4px 4px 0',
  },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
  transition: 'box-shadow 0.3s ease-in-out',
  overflow: 'hidden',
  '&:hover': {
    boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.08)',
  },
}));

const ProfileSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  backgroundColor: '#f8fafb',
  borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    background: 'linear-gradient(180deg, rgba(2, 128, 144, 0.02) 0%, rgba(2, 128, 144, 0.08) 100%)',
    zIndex: 0,
  },
}));

const StyledAvatar = styled(Avatar)(() => ({
  width: 120,
  height: 120,
  border: '4px solid white',
  boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
  backgroundColor: '#028090',
  fontSize: '2.5rem',
  position: 'relative',
  zIndex: 1,
  cursor: 'pointer',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.15)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.1)',
    opacity: 0,
    transition: 'opacity 0.2s ease-in-out',
    borderRadius: '50%',
  },
  '&:hover::after': {
    opacity: 1,
  },
}));

const InfoBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  backgroundColor: '#ffffff',
  borderRadius: theme.shape.borderRadius * 2,
  border: '1px solid rgba(2, 128, 144, 0.08)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.03)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 28px rgba(2, 128, 144, 0.08)',
    borderColor: 'rgba(2, 128, 144, 0.12)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '4px',
    height: '100%',
    background: 'linear-gradient(180deg, #028090 0%, rgba(2, 128, 144, 0.6) 100%)',
    borderRadius: '4px 0 0 4px',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#028090',
      },
    },
    '&.Mui-focused': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#028090',
        borderWidth: 2,
      },
    },
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  padding: '8px 24px',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.95rem',
  boxShadow: 'none',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(2, 128, 144, 0.15)',
  },
}));

const LoadingSkeleton = () => (
  <Box sx={{ p: { xs: 2, md: 3 } }}>
    <Skeleton variant="rectangular" width={200} height={32} sx={{ mb: 4 }} />
    <Box sx={{ display: 'grid', gap: 3 }}>
      {[1, 2, 3].map((item) => (
        <Box key={item} sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Skeleton variant="text" width={100} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="60%" height={24} />
        </Box>
      ))}
    </Box>
  </Box>
);

const ProfileSkeleton = () => (
  <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
    <Skeleton variant="circular" width={120} height={120} />
    <Box sx={{ textAlign: 'center', width: '100%' }}>
      <Skeleton variant="text" width={150} height={32} sx={{ mx: 'auto', mb: 1 }} />
      <Skeleton variant="text" width={200} height={24} sx={{ mx: 'auto' }} />
    </Box>
  </Box>
);

const MyAccountPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UpdateProfileRequest>({});
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { data, isLoading } = useGetProfileQuery(undefined, {
    selectFromResult: ({ data, isLoading }) => ({
      data,
      isLoading,
    }),
  });
  const [updateProfile] = useUpdateProfileMutation();

  const profile = data as ProfileResponse | undefined;

  const handleEditClick = () => {
    setIsEditing(true);
    setEditedProfile({
      firstName: profile?.data?.firstName || '',
      lastName: profile?.data?.lastName || '',
      phone: !profile?.data?.phone ? '' : undefined,
      email: !profile?.data?.email ? '' : undefined,
    });
  };

  const handleSaveClick = async () => {
    try {
      await updateProfile(editedProfile as UpdateProfileRequest).unwrap();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setEditedProfile({});
  };

  const handleInputChange = (field: keyof ProfileData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const renderTabContent = () => {
    if (isLoading) {
      return <LoadingSkeleton />;
    }

    switch (tabValue) {
      case 0:
        return (
          <Box maxWidth="md" sx={{ mx: 'auto', width: '100%' }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 5,
              pb: 2,
              borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
            }}>
              <Typography variant="h5" sx={{ 
                color: '#028090', 
                fontWeight: 600,
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -8,
                  left: 0,
                  width: 60,
                  height: 3,
                  background: 'linear-gradient(90deg, #028090 0%, rgba(2, 128, 144, 0.6) 100%)',
                  borderRadius: 1.5,
                }
              }}>
                Profile Information
              </Typography>
              {!isEditing && (
                <ActionButton
                  startIcon={<EditIcon />}
                  onClick={handleEditClick}
                  sx={{
                    color: '#028090',
                    bgcolor: 'rgba(2, 128, 144, 0.04)',
                    '&:hover': {
                      bgcolor: 'rgba(2, 128, 144, 0.08)',
                    },
                  }}
                >
                  Edit Profile
                </ActionButton>
              )}
            </Box>
            <Box sx={{ display: 'grid', gap: 3 }}>
              <InfoBox>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontWeight: 500, letterSpacing: '0.02em' }}>
                  First Name
                </Typography>
                {isEditing ? (
                  <StyledTextField
                    fullWidth
                    value={editedProfile.firstName}
                    onChange={handleInputChange('firstName')}
                    variant="outlined"
                    size="small"
                  />
                ) : (
                  <Typography sx={{ fontWeight: 600, fontSize: '1.1rem', color: '#2d3748' }}>
                    {profile?.data?.firstName}
                  </Typography>
                )}
              </InfoBox>
              <InfoBox>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontWeight: 500, letterSpacing: '0.02em' }}>
                  Last Name
                </Typography>
                {isEditing ? (
                  <StyledTextField
                    fullWidth
                    value={editedProfile.lastName}
                    onChange={handleInputChange('lastName')}
                    variant="outlined"
                    size="small"
                  />
                ) : (
                  <Typography sx={{ fontWeight: 600, fontSize: '1.1rem', color: '#2d3748' }}>
                    {profile?.data?.lastName}
                  </Typography>
                )}
              </InfoBox>
              <InfoBox>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontWeight: 500, letterSpacing: '0.02em' }}>
                  Email
                </Typography>
                {isEditing && !profile?.data?.email ? (
                  <StyledTextField
                    fullWidth
                    value={editedProfile.email}
                    onChange={handleInputChange('email')}
                    variant="outlined"
                    size="small"
                    placeholder="Add email address"
                    type="email"
                  />
                ) : (
                  <Typography sx={{ fontWeight: 600, fontSize: '1.1rem', color: '#2d3748' }}>
                    {profile?.data?.email || 'Not provided'}
                  </Typography>
                )}
              </InfoBox>
              <InfoBox>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontWeight: 500, letterSpacing: '0.02em' }}>
                  Phone
                </Typography>
                {isEditing && !profile?.data?.phone ? (
                  <StyledTextField
                    fullWidth
                    value={editedProfile.phone}
                    onChange={handleInputChange('phone')}
                    variant="outlined"
                    size="small"
                    placeholder="Add phone number"
                  />
                ) : (
                  <Typography sx={{ fontWeight: 600, fontSize: '1.1rem', color: '#2d3748' }}>
                    {profile?.data?.phone || 'Not provided'}
                  </Typography>
                )}
              </InfoBox>
              {isEditing && (
                <Box sx={{ 
                  display: 'flex', 
                  gap: 2, 
                  justifyContent: 'flex-end', 
                  mt: 4,
                  pt: 3,
                  borderTop: '1px solid rgba(0, 0, 0, 0.06)'
                }}>
                  <ActionButton
                    variant="outlined"
                    onClick={handleCancelClick}
                    sx={{
                      borderColor: '#028090',
                      color: '#028090',
                      '&:hover': {
                        borderColor: '#026f7a',
                        backgroundColor: 'rgba(2, 128, 144, 0.08)',
                      },
                    }}
                  >
                    Cancel
                  </ActionButton>
                  <ActionButton
                    variant="contained"
                    onClick={handleSaveClick}
                    sx={{
                      bgcolor: '#028090',
                      '&:hover': {
                        bgcolor: '#026f7a',
                      },
                    }}
                  >
                    Save Changes
                  </ActionButton>
                </Box>
              )}
            </Box>
          </Box>
        );
      case 1:
        return (
          <Box maxWidth="md" sx={{ mx: 'auto', width: '100%' }}>
            <Typography variant="h5" sx={{ 
              mb: 4, 
              color: '#028090', 
              fontWeight: 600,
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -8,
                left: 0,
                width: 60,
                height: 3,
                backgroundColor: '#028090',
                borderRadius: 1.5,
              }
            }}>
              My Bookings
            </Typography>
            <BookingHistory />
          </Box>
        );
      case 2:
        return (
          <Box maxWidth="md" sx={{ mx: 'auto', width: '100%' }}>
            <Typography variant="h5" sx={{ 
              mb: 4, 
              color: '#028090', 
              fontWeight: 600,
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -8,
                left: 0,
                width: 60,
                height: 3,
                backgroundColor: '#028090',
                borderRadius: 1.5,
              }
            }}>
              Transaction History
            </Typography>
            <TransactionHistory />
          </Box>
        );
      case 3:
        return (
          <Box maxWidth="md" sx={{ mx: 'auto', width: '100%' }}>
            <Typography variant="h5" sx={{ 
              mb: 4, 
              color: '#028090', 
              fontWeight: 600,
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -8,
                left: 0,
                width: 60,
                height: 3,
                backgroundColor: '#028090',
                borderRadius: 1.5,
              }
            }}>
              Account Settings
            </Typography>
            <AccountSettings />
          </Box>
        );
      default:
        return null;
    }
  };

  const content = (
    <Container maxWidth="xl" sx={{ 
      py: { xs: 4, md: 6 }, 
      mt: { xs: '64px', md: '80px' }  // Add margin-top to account for header height
    }}>
      <Box sx={{ 
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        minHeight: '80vh',
        bgcolor: '#f8fafb',
        borderRadius: 2,
        overflow: 'hidden',
        gap: 3
      }}>
        {/* Left Sidebar */}
        <StyledPaper sx={{ 
          width: { xs: '100%', md: 280 },
          mb: { xs: 2, md: 0 },
          display: 'flex',
          flexDirection: 'column',
        }}>
          {isLoading ? (
            <ProfileSkeleton />
          ) : (
            <ProfileSection>
              <Box sx={{ position: 'relative' }}>
                <StyledAvatar src={profile?.data?.avatar || undefined}>
                  {profile?.data?.firstName?.[0] || 'U'}
                </StyledAvatar>
                {isEditing && (
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: -4,
                      right: -4,
                      bgcolor: '#028090',
                      borderRadius: '50%',
                      width: 32,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
                      border: '2px solid white',
                      '&:hover': {
                        bgcolor: '#026f7a',
                      },
                    }}
                  >
                    <EditIcon sx={{ color: 'white', fontSize: 16 }} />
                  </Box>
                )}
              </Box>
              <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <Typography variant="h6" sx={{ 
                  color: '#028090', 
                  fontWeight: 600,
                  fontSize: '1.25rem',
                  mb: 0.5,
                  transition: 'opacity 0.2s ease-in-out',
                  opacity: isEditing ? 0.7 : 1,
                }}>
                  {profile?.data?.firstName} {profile?.data?.lastName}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.secondary',
                    fontSize: '0.95rem',
                    opacity: 0.9
                  }}
                >
                  {profile?.data?.email}
                </Typography>
              </Box>
            </ProfileSection>
          )}
          <Divider />
          <StyledTabs
            orientation={isMobile ? 'horizontal' : 'vertical'}
            variant="scrollable"
            value={tabValue}
            onChange={handleTabChange}
            sx={{ 
              borderRight: isMobile ? 0 : 1, 
              borderColor: 'divider',
              flex: 1,
              '.MuiTabs-scroller': {
                height: '100%',
              }
            }}
          >
            <Tab icon={<PersonIcon />} label="Profile" iconPosition="start" />
            <Tab icon={<BookingIcon />} label="My Bookings" iconPosition="start" />
            <Tab icon={<TransactionIcon />} label="Transactions" iconPosition="start" />
            <Tab icon={<SettingsIcon />} label="Settings" iconPosition="start" />
          </StyledTabs>
        </StyledPaper>

        {/* Right Content Area */}
        <StyledPaper sx={{ flex: 1, overflow: 'hidden' }}>
          <TabPanel value={tabValue} index={tabValue}>
            {renderTabContent()}
          </TabPanel>
        </StyledPaper>
      </Box>
    </Container>
  );

  return <PageLayout>{content}</PageLayout>;
};

export default MyAccountPage; 