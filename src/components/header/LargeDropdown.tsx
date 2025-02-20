import React from 'react';
import {
  Box,
  Button,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { logout } from '../../features/auth/authSlice';

interface LargeDropdownProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

interface AccountDropdownProps {
  onClose: () => void;
}

const LargeDropdown: React.FC<LargeDropdownProps> = ({ anchorEl, onClose }) => {
  const open = Boolean(anchorEl);
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.root.auth);

  if (!open) return null;

  const handleActionClick = (actionType: 'login' | 'signup') => {
    if (actionType === 'login') {
      navigate('/login');
      onClose();
      return;
    }
    navigate(`/auth/user-type?action=${actionType}`);
    onClose();
  };

  const dropdownStyle = {
    position: 'absolute',
    top: '100%',
    right: 0,
    transform: 'translateY(10px)',
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
    width: 300,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    alignItems: 'flex-start',
    zIndex: 1300,
    margin: '0 auto',
  };

  return (
    <Box sx={dropdownStyle}>
      {isAuthenticated ? (
        <AccountDropdown onClose={onClose} />
      ) : (
        <Stack sx={{ width: '100%' }} spacing={1}>
          <Button
            fullWidth
            variant="text"
            sx={{
              textAlign: 'left',
              textTransform: 'none',
              justifyContent: 'flex-start',
              color: 'black',
              fontWeight: 400,
            }}
            onClick={() => handleActionClick('login')}
          >
            Login
          </Button>
          <Button
            fullWidth
            variant="text"
            sx={{
              textAlign: 'left',
              textTransform: 'none',
              justifyContent: 'flex-start',
              color: 'black',
              fontWeight: 400,
            }}
            onClick={() => handleActionClick('signup')}
          >
            Sign Up
          </Button>
          <Divider sx={{ width: '100%' }} />
          <Box sx={{ position: 'relative' }}>
            <Button
              fullWidth
              variant="text"
              disabled
              sx={{
                textAlign: 'left',
                textTransform: 'none',
                justifyContent: 'flex-start',
                color: 'black',
                fontWeight: 400,
                '&.Mui-disabled': {
                  color: '#888888',
                },
              }}
              onClick={onClose}
            >
              Help Center
              <Box
                sx={{
                  position: 'absolute',
                  top: -8,
                  right: 0,
                  backgroundColor: 'transparent',
                  color: '#FFD700',
                  fontSize: '10px',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  border: '1px solid #FFD700',
                }}
              >
                Coming Soon
              </Box>
            </Button>
          </Box>
        </Stack>
      )}
    </Box>
  );
};

const AccountDropdown: React.FC<AccountDropdownProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [logoutDialogOpen, setLogoutDialogOpen] = React.useState(false);

  const linkButtonStyle = {
    textAlign: 'left',
    textTransform: 'none',
    justifyContent: 'flex-start',
    color: 'black',
    fontWeight: 400,
  };

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const handleActionClick = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogoutConfirm = () => {
    // logout dispatch
    dispatch(logout());
    setLogoutDialogOpen(false);
    onClose();
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  return (
    <>
      <Stack width={'100%'}>
        <Button
          fullWidth
          variant="text"
          sx={linkButtonStyle}
          onClick={() => handleActionClick('/account')}
        >
          My Account
        </Button>
        <Button
          fullWidth
          variant="text"
          sx={linkButtonStyle}
          onClick={() => handleActionClick('/manage-listings')}
        >
          Manage My Listings
        </Button>
        <Button
          component={Link}
          to="/list"
          fullWidth
          variant="text"
          sx={linkButtonStyle}
          onClick={onClose}
        >
          List Your Aparte
        </Button>
        <Button
          fullWidth
          variant="text"
          sx={linkButtonStyle}
          onClick={() => handleActionClick('/notifications')}
        >
          Notifications
        </Button>
        <Button
          fullWidth
          variant="text"
          sx={linkButtonStyle}
          onClick={() => handleActionClick('/messages')}
        >
          Messages
        </Button>
        <Divider sx={{ width: '100%' }} />
        <Button
          fullWidth
          variant="text"
          sx={linkButtonStyle}
          onClick={handleLogoutClick}
        >
          Logout
        </Button>
      </Stack>

      {/* Dialog */}

      <Dialog
        sx={{
          '& .MuiPaper-root': {
            borderRadius: '8px', // Set the desired border-radius
            padding: '16px',
          },
        }}
        maxWidth="xs"
        fullWidth
        open={logoutDialogOpen}
        onClose={handleLogoutCancel}
      >
        <DialogTitle>
          Logout Account
          <IconButton
            aria-label="close"
            onClick={handleLogoutCancel}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to logout your account?
          </DialogContentText>
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: 'center', // Centers the actions
          }}
        >
          <Button
            onClick={handleLogoutConfirm}
            sx={{
              borderColor: '#028090',
              color: '#028090',
              '&:hover': {
                backgroundColor: '#028090',
                color: 'white',
              },
            }}
            variant="outlined"
          >
            Yes, log me out
          </Button>
          <Button
            onClick={handleLogoutCancel}
            sx={{
              borderColor: '#028090',
              color: '#028090',
              '&:hover': {
                backgroundColor: '#028090',
                color: 'white',
              },
            }}
            variant="outlined"
          >
            No, it's a mistake
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LargeDropdown;
