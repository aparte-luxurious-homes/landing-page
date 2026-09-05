'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Alert,
  Button,
  Breadcrumbs,
  Link,
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
import { useAppSelector } from '../hooks';
import { selectUserRole } from '../features/auth/authSlice';
import ProfileTab from '../components/account/ProfileTab';
import BookingHistory from '../components/account/BookingHistory';
import TransactionHistory from '../components/account/TransactionHistory';
import AccountSettings from '../components/account/AccountSettings';
import WalletDashboard from '../components/account/WalletDashboard';
import DisputesView from '../components/account/DisputesView';
import ReferralsView from '../components/account/ReferralsView';
import PageLayout from '../components/pagelayout';
import {
  useSearchParams,
  useNavigate,
  Link as RouterLink,
} from '@/lib/router';
import {
  isProfilePayoutBannerDismissed,
  setProfilePayoutBannerDismissed,
} from '../utils/payoutNudge';

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

interface MyAccountPageProps {
  /**
   * The nested booking-details view. Under react-router this came from
   * useOutlet(); in the App Router the child route passes it explicitly, so
   * this component no longer depends on router context to know what to show.
   */
  children?: React.ReactNode;
  /** True when rendered by /account/bookings/[bookingId]. Replaces useMatch. */
  isBookingDetail?: boolean;
}

const MyAccountPage: React.FC<MyAccountPageProps> = ({
  children,
  isBookingDetail = false,
}) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tabParam = searchParams.get('tab');
  const bookingDetailsMatch = isBookingDetail;

  const getTabIndex = (tab: string | null): number => {
    const idx = TAB_MAP.indexOf(tab as any);
    return idx >= 0 ? idx : 0;
  };

  // The URL is the SINGLE SOURCE OF TRUTH for which tab is showing, and
  // tabValue is derived from it rather than mirrored into state.
  //
  // It used to be `useState` kept in sync with the URL by two effects — one
  // pushing tabValue -> URL, the other pushing URL -> tabValue. Each treated
  // the other's output as its input, so they could ping-pong forever:
  // arriving at `?tab=wallet&bankDetails=1` from the bookings tab let the
  // first effect see the NEW url against the STALE tabValue (still 1), rewrite
  // the URL back to `?tab=bookings` (dropping bankDetails), at which point the
  // second effect set tabValue back toward wallet, and round it went. Every
  // iteration remounted the tab and refired its queries — an infinite loop of
  // API calls between the bookings and wallet tabs, reported in production.
  //
  // Deriving removes one direction of the sync entirely, so there is nothing
  // left to disagree with. A booking-detail route always shows the bookings
  // tab regardless of the query string.
  const tabValue = bookingDetailsMatch ? 1 : getTabIndex(tabParam);
  const outlet = children;
  const [profilePayoutBannerDismissed, setProfilePayoutBannerDismissedState] = useState(
    () => isProfilePayoutBannerDismissed()
  );
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { data, isLoading } = useGetProfileQuery();
  const profile = data as ProfileResponse | undefined;
  const userRole = useAppSelector(selectUserRole);
  const isGuest = userRole === 'GUEST';

  // The only remaining effect is a genuine REDIRECT, not a sync: guests have
  // no referrals tab, so asking for one sends them to profile. It writes the
  // URL and nothing writes back, so it cannot oscillate.
  useEffect(() => {
    if (bookingDetailsMatch) return;
    if (isGuest && tabParam === 'referrals') {
      navigate('/account?tab=profile', { replace: true });
    }
  }, [tabParam, isGuest, navigate, bookingDetailsMatch]);

  // Changing tab is now a pure navigation — the URL changes, and tabValue
  // follows because it is derived from it. Previously this set state and left
  // an effect to catch up, which is what made the two directions race.
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    const tabSlug = TAB_MAP[newValue];
    // `bankDetails=1` is meaningful only on the wallet tab (it focuses the
    // bank-details form), so it is carried there and dropped everywhere else.
    const bankQs =
      tabSlug === 'wallet' && searchParams.get('bankDetails') === '1'
        ? '&bankDetails=1'
        : '';
    navigate(`/account?tab=${tabSlug}${bankQs}`, { replace: true });
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
            <WalletDashboard
              walletId={profile?.data?.wallets?.[0]?.id || ''}
              userId={profile?.data?.userId || ''}
              hasBvn={!!(profile?.data?.profile?.bvn)}
              focusBankDetails={tabValue === 2 && searchParams.get('bankDetails') === '1'}
              onBankDetailsFocusConsumed={handleBankDetailsDeepLinkConsumed}
            />
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

  const showProfilePayoutBanner =
    Boolean(profile?.data?.shouldShowPayoutNudge) && !profilePayoutBannerDismissed;

  const dismissProfilePayoutBanner = () => {
    setProfilePayoutBannerDismissed();
    setProfilePayoutBannerDismissedState(true);
  };

  const handleBankDetailsDeepLinkConsumed = useCallback(() => {
    navigate('/account?tab=wallet', { replace: true });
  }, [navigate]);

  const content = (
    <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 }, mt: { xs: '64px', md: '80px' } }}>
      {showProfilePayoutBanner && (
        <Alert
          severity="info"
          sx={{ mb: 2, borderRadius: 2 }}
          action={
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1, alignItems: { sm: 'center' } }}>
              <Button
                color="inherit"
                size="small"
                onClick={() => navigate('/account?tab=wallet&bankDetails=1')}
                sx={{ fontWeight: 600 }}
              >
                Add Bank Details
              </Button>
              <Button size="small" onClick={dismissProfilePayoutBanner}>
                Dismiss
              </Button>
            </Box>
          }
        >
          <Typography variant="body2" sx={{ maxWidth: 720 }}>
            If the property is left in good condition, your caution fee will be refunded after checkout.
            Update your bank details to receive it.
          </Typography>
        </Alert>
      )}
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
            <Tab icon={<PersonIcon />} label="Profile" value={0} iconPosition="start" />
            <Tab icon={<BookingIcon />} label="My Bookings" value={1} iconPosition="start" />
            <Tab icon={<WalletIcon />} label="My Wallet" value={2} iconPosition="start" />
            <Tab icon={<TransactionIcon />} label="Transactions" value={3} iconPosition="start" />
            <Tab icon={<SettingsIcon />} label="Settings" value={4} iconPosition="start" />
            <Tab icon={<DisputeIcon />} label="Disputes" value={5} iconPosition="start" />
            {!isGuest && <Tab icon={<ReferralIcon />} label="Referrals" value={6} iconPosition="start" />}
          </StyledTabs>
        </StyledPaper>
        <StyledPaper sx={{ flex: 1, overflow: 'hidden' }}>
          {outlet ? (
            <Box
              sx={{ width: '100%', p: { xs: 2, md: 3 } }}
              role="region"
              aria-label="Booking details"
            >
              <Box maxWidth="md" sx={{ mx: 'auto', width: '100%' }}>
                <Typography
                  variant="h5"
                  sx={{
                    mb: 1,
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
                    },
                  }}
                >
                  My Bookings
                </Typography>
                <Breadcrumbs
                  separator="›"
                  sx={{ mb: 3, mt:3, '& .MuiBreadcrumbs-separator': { color: 'text.secondary' } }}
                >
                  <Link
                    component={RouterLink}
                    to="/account?tab=bookings"
                    underline="hover"
                    sx={{ color: '#028090', fontWeight: 500 }}
                  >
                    All bookings
                  </Link>
                  <Typography color="text.primary" fontWeight={500}>
                    Booking receipt
                  </Typography>
                </Breadcrumbs>
                {outlet}
              </Box>
            </Box>
          ) : (
            <TabPanel value={tabValue} index={tabValue}>
              {renderTabContent()}
            </TabPanel>
          )}
        </StyledPaper>
      </Box>
    </Container>
  );

  return <PageLayout>{content}</PageLayout>;
};

export default MyAccountPage;
