import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import {
  Person as PersonIcon,
  BookOnline as BookingIcon,
  Receipt as TransactionIcon,
  Settings as SettingsIcon,
  Gavel as DisputeIcon,
  GroupAdd as ReferralIcon,
  AccountBalanceWallet as WalletIcon,
} from '@mui/icons-material';
import { styled } from '@mui/system';
import { useGetProfileQuery } from '../api/profileApi';
import type { ProfileResponse } from '../api/profileApi';
import ProfileTab from '../components/account/ProfileTab';
import BookingHistory from '../components/account/BookingHistory';
import TransactionHistory from '../components/account/TransactionHistory';
import AccountSettings from '../components/account/AccountSettings';
import WalletDashboard from '../components/account/WalletDashboard';
import DisputesView from '../components/account/DisputesView';
import ReferralsView from '../components/account/ReferralsView';
import PageLayout from '../components/pagelayout';
import { useSearchParams, useNavigate } from 'react-router-dom';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
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
    background:
      'linear-gradient(180deg, rgba(2, 128, 144, 0.02) 0%, rgba(2, 128, 144, 0.08) 100%)',
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
}));

const SidebarSkeleton = () => (
  <Box
    sx={{
      p: 4,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 2,
    }}
  >
    <Skeleton variant="circular" width={120} height={120} />
    <Box sx={{ textAlign: 'center', width: '100%' }}>
      <Skeleton variant="text" width={150} height={32} sx={{ mx: 'auto', mb: 1 }} />
      <Skeleton variant="text" width={200} height={24} sx={{ mx: 'auto' }} />
    </Box>
  </Box>
);

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

const TAB_MAP = ['profile', 'bookings', 'wallet', 'transactions', 'settings', 'disputes', 'referrals'] as const;

const MyAccountPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tabParam = searchParams.get('tab');

  const getTabIndex = (tab: string | null): number => {
    const idx = TAB_MAP.indexOf(tab as any);
    return idx >= 0 ? idx : 0;
  };

  const [tabValue, setTabValue] = useState(getTabIndex(tabParam));
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { data, isLoading } = useGetProfileQuery();
  const profile = data as ProfileResponse | undefined;

  useEffect(() => {
    const currentTab = searchParams.get('tab');
    const expectedTab = TAB_MAP[tabValue];
    if (currentTab !== expectedTab) {
      navigate(`/account?tab=${expectedTab}`, { replace: true });
    }
  }, [tabValue, navigate, searchParams]);

  useEffect(() => {
    setTabValue(getTabIndex(tabParam));
  }, [tabParam]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const renderTabContent = () => {
    if (isLoading && tabValue !== 0) return <LoadingSkeleton />;

    switch (tabValue) {
      case 0:
        return <ProfileTab profile={profile?.data} isLoading={isLoading} />;
      case 1:
        return (
          <Box maxWidth="md" sx={{ mx: 'auto', width: '100%' }}>
            <Typography variant="h5" sx={{ mb: 4, color: '#028090', fontWeight: 600, position: 'relative', '&::after': { content: '""', position: 'absolute', bottom: -8, left: 0, width: 60, height: 3, backgroundColor: '#028090', borderRadius: 1.5 } }}>
              My Bookings
            </Typography>
            <BookingHistory userId={profile?.data?.userId || ''} />
          </Box>
        );
      case 2:
        return (
          <Box maxWidth="md" sx={{ mx: 'auto', width: '100%' }}>
            <Typography variant="h5" sx={{ mb: 4, color: '#028090', fontWeight: 600, position: 'relative', '&::after': { content: '""', position: 'absolute', bottom: -8, left: 0, width: 60, height: 3, backgroundColor: '#028090', borderRadius: 1.5 } }}>
              My Wallet
            </Typography>
            <WalletDashboard walletId={profile?.data?.wallets?.[0]?.id || ''} userId={profile?.data?.userId || ''} hasBvn={!!(profile?.data?.profile?.bvn)} />
          </Box>
        );
      case 3:
        return (
          <Box maxWidth="md" sx={{ mx: 'auto', width: '100%' }}>
            <Typography variant="h5" sx={{ mb: 4, color: '#028090', fontWeight: 600, position: 'relative', '&::after': { content: '""', position: 'absolute', bottom: -8, left: 0, width: 60, height: 3, backgroundColor: '#028090', borderRadius: 1.5 } }}>
              Transaction History
            </Typography>
            <TransactionHistory userId={profile?.data?.userId || ''} />
          </Box>
        );
      case 4:
        return (
          <Box maxWidth="md" sx={{ mx: 'auto', width: '100%' }}>
            <Typography variant="h5" sx={{ mb: 4, color: '#028090', fontWeight: 600, position: 'relative', '&::after': { content: '""', position: 'absolute', bottom: -8, left: 0, width: 60, height: 3, backgroundColor: '#028090', borderRadius: 1.5 } }}>
              Account Settings
            </Typography>
            <AccountSettings />
          </Box>
        );
      case 5:
        return (
          <Box maxWidth="md" sx={{ mx: 'auto', width: '100%' }}>
            <Typography variant="h5" sx={{ mb: 4, color: '#028090', fontWeight: 600, position: 'relative', '&::after': { content: '""', position: 'absolute', bottom: -8, left: 0, width: 60, height: 3, backgroundColor: '#028090', borderRadius: 1.5 } }}>
              Disputes
            </Typography>
            <DisputesView />
          </Box>
        );
      case 6:
        return (
          <Box maxWidth="md" sx={{ mx: 'auto', width: '100%' }}>
            <Typography variant="h5" sx={{ mb: 4, color: '#028090', fontWeight: 600, position: 'relative', '&::after': { content: '""', position: 'absolute', bottom: -8, left: 0, width: 60, height: 3, backgroundColor: '#028090', borderRadius: 1.5 } }}>
              Referrals
            </Typography>
            <ReferralsView />
          </Box>
        );
      default:
        return null;
    }
  };

  const firstName = profile?.data?.profile?.firstName;
  const lastName = profile?.data?.profile?.lastName;

  const content = (
    <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 }, mt: { xs: '64px', md: '80px' } }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, minHeight: '80vh', bgcolor: '#f8fafb', borderRadius: 2, overflow: 'hidden', gap: 3 }}>
        <StyledPaper sx={{ width: { xs: '100%', md: 280 }, mb: { xs: 2, md: 0 }, display: 'flex', flexDirection: 'column' }}>
          {isLoading ? <SidebarSkeleton /> : (
            <ProfileSection>
              <StyledAvatar src={profile?.data?.profile?.profileImage}>
                {firstName?.[0] || profile?.data?.email?.[0] || 'U'}
              </StyledAvatar>
              <Box sx={{ textAlign: 'center', zIndex: 1 }}>
                <Typography variant="h6" sx={{ color: '#028090', fontWeight: 600 }}>
                  {firstName} {lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
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
            sx={{ flex: 1 }}
          >
            <Tab icon={<PersonIcon />} label="Profile" iconPosition="start" />
            <Tab icon={<BookingIcon />} label="My Bookings" iconPosition="start" />
            <Tab icon={<WalletIcon />} label="My Wallet" iconPosition="start" />
            <Tab icon={<TransactionIcon />} label="Transactions" iconPosition="start" />
            <Tab icon={<SettingsIcon />} label="Settings" iconPosition="start" />
            <Tab icon={<DisputeIcon />} label="Disputes" iconPosition="start" />
            <Tab icon={<ReferralIcon />} label="Referrals" iconPosition="start" />
          </StyledTabs>
        </StyledPaper>
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
