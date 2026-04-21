import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAppSelector } from '../hooks'; // Assuming you use Redux Toolkit hooks
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';

const ProtectedRoute: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAppSelector((state) => state.root.auth);

  const isAuthenticated = auth.isAuthenticated && !!auth.token;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // If the user is not authenticated, show the login dialog
    if (!isAuthenticated) {
      setOpen(true);
    }
  }, [isAuthenticated]);

  const handleClose = () => {
    navigate(-1);
    setOpen(false);
  };

  const handleLoginRedirect = () => {
    // Redirect to login and store the original route in the query params
    navigate(`/login?redirect=${location.pathname}`);
  };

  // If the user is authenticated, render the protected route (children)
  if (isAuthenticated) {
    return <Outlet />;
  }

  // If the user is not authenticated, show the dialog
  return (
    <>
      <Dialog
        fullWidth
        open={open}
        onClose={() => {}}
        sx={{ backdropFter: 'blur(50px)' }}
      >
        <DialogTitle>Authentication Required</DialogTitle>
        <DialogContent>
          <Typography>You need to be logged in to access this page.</Typography>
        </DialogContent>
        <DialogActions sx={{ padding: "16px"}}>
          <Button onClick={handleClose}>Close</Button>
          <Button
            onClick={handleLoginRedirect}
            color="primary"
            variant="contained"
          >
            Go to Login
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProtectedRoute;
