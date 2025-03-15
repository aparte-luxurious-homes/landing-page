import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';
import { useLocation } from 'react-router-dom';
import {
  useGetAllDisputesQuery,
  useSubmitDisputeMutation,
} from '../../api/disputeApi';

interface DisputeResolutionProps {
  showHeader?: boolean;
  customStyles?: React.CSSProperties;
}

const DisputeResolution: React.FC<DisputeResolutionProps> = ({
  customStyles,
  showHeader,
}) => {
  const location = useLocation();

  const { data: disputes, isLoading } = useGetAllDisputesQuery();
  const [submitDispute] = useSubmitDisputeMutation();

  const [disputeType, setDisputeType] = useState('');
  const [description, setDescription] = useState('');
  const [paymentReceipt, setPaymentReceipt] = useState('');
  const [media, setMedia] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bookingId = location.state?.bookingId;

  useEffect(() => {
    // fetchDisputes();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setMedia([...media, ...Array.from(event.target.files)]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setMedia(media.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('type', disputeType);
    formData.append('description', description);
    if (disputeType === 'Payment Issue') {
      formData.append('payment_receipt', paymentReceipt);
    }
    if (bookingId) {
      formData.append('booking_id', bookingId);
    }
    media.forEach((file) => formData.append('media', file));

    try {
      const response = await submitDispute(formData).unwrap();
      console.error('success:', response);
      toast.success('Dispute submitted successfully!');
    } catch (error) {
      console.error('Failed to submit dispute:', error);
      toast.error('Failed to submit dispute. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        ...customStyles,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        ...(showHeader && { someHeaderStyle: true }),
      }}
    >
      {showHeader && (
        <Typography variant="h4" color="primary">
          Dispute Resolution
        </Typography>
      )}
      <Typography variant="body1" sx={{ mb: 2 }}>
        If you encounter any issues during your stay or with your payment, you
        can raise a dispute here. Please select the type of dispute, provide a
        detailed description, and attach any relevant media or payment receipts.
        Our team will review your submission and get back to you as soon as
        possible.
      </Typography>
      <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
        <InputLabel id="dispute-type-label">Dispute Type</InputLabel>
        <Select
          labelId="dispute-type-label"
          value={disputeType}
          onChange={(e) => setDisputeType(e.target.value)}
          label="Dispute Type"
        >
          <MenuItem value="PAYMENTS_AND_REFUNDS">Payments and Refund</MenuItem>
          <MenuItem value="DAMAGE_CLAIMS">Damage Claim</MenuItem>
          <MenuItem value="GENERAL_COMPLAINTS">General Complaints</MenuItem>
        </Select>
      </FormControl>
      <TextField
        label="Description"
        variant="outlined"
        multiline
        rows={4}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        fullWidth
      />
      {disputeType === 'PAYMENTS_AND_REFUNDS' && (
        <TextField
          label="Payment Receipt"
          variant="outlined"
          value={paymentReceipt}
          onChange={(e) => setPaymentReceipt(e.target.value)}
          fullWidth
        />
      )}
      <Button variant="contained" component="label">
        Attach Media
        <input type="file" hidden multiple onChange={handleFileChange} />
      </Button>
      <List>
        {media.map((file, index) => (
          <ListItem key={index}>
            <ListItemText primary={file.name} />
            <ListItemSecondaryAction>
              <IconButton edge="end" onClick={() => handleRemoveFile(index)}>
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? <CircularProgress size={24} /> : 'Submit Dispute'}
      </Button>
      <Typography variant="h6" sx={{ mt: 4 }}>
        My Disputes
      </Typography>
      {isLoading ? (
        <CircularProgress />
      ) : (
        <List>
          {disputes?.data.map((dispute) => (
            <ListItem key={dispute.id}>
              <ListItemText
                primary={dispute.type}
                secondary={`Status: ${dispute.status}`}
              />
            </ListItem>
          ))}
        </List>
      )}
      <ToastContainer
        position="top-right"
        autoClose={2000}
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

export default DisputeResolution;
