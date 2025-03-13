import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
} from '@mui/material';
import { Visibility as VisibilityIcon } from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';
// import axios from 'axios';

interface Dispute {
  id: string;
  type: string;
  description: string;
  status: string;
  created_at: string;
}

const DisputeView: React.FC = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    setIsLoading(true);
    try {
      // Replace with actual API call
      const response = await fetch('/api/disputes'); // Example API endpoint
      const data = await response.json();
      setDisputes(data);
    } catch (error) {
      console.error('Failed to fetch disputes:', error);
      toast.error('Failed to fetch disputes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (dispute: Dispute) => {
    setSelectedDispute(dispute);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedDispute(null);
  };

  return (
    <Box sx={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        My Disputes
      </Typography>
      {isLoading ? (
        <CircularProgress />
      ) : (
        <List>
          {disputes.map((dispute) => (
            <ListItem key={dispute.id}>
              <ListItemText
                primary={dispute.type}
                secondary={`Status: ${dispute.status} - Submitted on: ${new Date(dispute.created_at).toLocaleDateString()}`}
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={() => handleViewDetails(dispute)}>
                  <VisibilityIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      {selectedDispute && (
        <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>Dispute Details</DialogTitle>
          <DialogContent>
            <Typography variant="h6">{selectedDispute.type}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Submitted on: {new Date(selectedDispute.created_at).toLocaleDateString()}
            </Typography>
            <Typography variant="body1">{selectedDispute.description}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Status: {selectedDispute.status}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Box>
  );
};

export default DisputeView;
