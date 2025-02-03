import React, { useState } from 'react';
import { Box, Button, Divider, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
// import { useAppSelector } from '../../hooks';
import CloseIcon from '@mui/icons-material/Close';

interface AccountDropdownProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

const AccountDropdown: React.FC<AccountDropdownProps> = ({ anchorEl, onClose }) => {
  const open = Boolean(anchorEl);
  const navigate = useNavigate();
//   const { isAuthenticated } = useAppSelector((state) => state.root.auth);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false); 

  if (!open) return null;

  const handleActionClick = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = () => {
    // Add your logout logic here
    setLogoutDialogOpen(false);
    onClose();
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
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
    <>
      <Box sx={dropdownStyle}>
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
          onClick={() => handleActionClick('/account')}
        >
          My Account
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
          onClick={() => handleActionClick('/manage-listings')}
        >
          Manage My Listings
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
          onClick={() => handleActionClick('/notifications')}
        >
          Notifications
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
          onClick={() => handleActionClick('/messages')}
        >
          Messages
        </Button>
        <Divider sx={{ width: '100%' }} />
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
          onClick={handleLogoutClick}
        >
          Logout
        </Button>
      </Box>

      <Dialog open={logoutDialogOpen} onClose={handleLogoutCancel}>
        <DialogTitle>
          LogOut Account
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
        <DialogActions>
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

export default AccountDropdown;