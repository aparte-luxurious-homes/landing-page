'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Rating,
  TextField,
  Box,
  Typography,
  CircularProgress,
  IconButton,
} from '@mui/material';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import CloseIcon from '@mui/icons-material/Close';
import {
  useSubmitReviewMutation,
  useUploadReviewPhotosMutation,
} from '../../api/reviewsApi';
import { toast } from 'react-toastify';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 5;
const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

interface SelectedImage {
  file: File;
  previewUrl: string;
  uri?: string;
  fileName?: string;
  mimeType?: string;
}

interface SubmitReviewModalProps {
  open: boolean;
  onClose: () => void;
  bookingId: string;
  propertyId: string;
  propertyName: string;
}

const SubmitReviewModal: React.FC<SubmitReviewModalProps> = ({
  open,
  onClose,
  bookingId,
  propertyId,
  propertyName,
}) => {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<SelectedImage[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitReview, { isLoading }] = useSubmitReviewMutation();
  const [uploadReviewPhotos] = useUploadReviewPhotosMutation();
  // Revoke any outstanding object URLs when the modal unmounts to avoid leaks.
  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setRating(null);
    setComment('');
    images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setImages([]);
  };

  const handlePickFiles = () => {
    if (!isLoading) fileInputRef.current?.click();
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    // Reset the input so the same file can be re-selected after removal.
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (selected.length === 0) return;

    const accepted: SelectedImage[] = [];
    for (const file of selected) {
      if (images.length + accepted.length >= MAX_FILES) {
        toast.error(`You can attach up to ${MAX_FILES} photos`);
        break;
      }
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error(`${file.name}: please upload a JPEG, PNG, or WebP image`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name}: image must be under 10MB`);
        continue;
      }
      accepted.push({ file, previewUrl: URL.createObjectURL(file) });
    }

    if (accepted.length > 0) {
      setImages((prev) => [...prev, ...accepted]);
    }
  };

  const handleRemoveImage = (previewUrl: string) => {
    URL.revokeObjectURL(previewUrl);
    setImages((prev) => prev.filter((img) => img.previewUrl !== previewUrl));
  };

  const handleUploadReviewImages = async () => {
    const formData = new FormData();

    images.forEach((image) => {
      formData.append("files", image.file);    
    });

    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }

    const imageUrl = await uploadReviewPhotos(formData).unwrap();
    setImageUrls(imageUrl);
    console.log(images);
  };

  const handleSubmit = async () => {
    if (!rating) return;

    try {
      // NOTE: `images` are collected/validated here but not yet sent — wiring the
      // files into the mutation happens once the reviewsApi multipart change lands.
      await submitReview({
        booking_id: bookingId,
        property_id: propertyId,
        rating: rating as number,
        comment,
        photo_urls: imageUrls
      }).unwrap();
      toast.success('Review submitted successfully');
      onClose();
      // Reload the page to refresh all related data (e.g. Booking History action buttons)
      // setTimeout(() => {
      //   window.location.reload();
      // }, 1000);
      resetForm();
    } catch (error: unknown) {
      const err = error as any;
      const detail = err?.data?.detail;
      let message = 'Failed to submit review';
      if (typeof detail === 'string') message = detail;
      else if (Array.isArray(detail))
        message = detail
          .map((item: any) => item.msg || JSON.stringify(item))
          .join(', ');
      else if (detail?.msg) message = detail.msg;
      else if (err?.data?.message) message = err.data.message;
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>
        Review your stay at {propertyName}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, py: 2 }}>
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Rate your experience
            </Typography>
            <Rating
              value={rating}
              onChange={(_, newValue) => setRating(newValue)}
              size="large"
              sx={{ fontSize: '3.5rem', color: '#028090' }}
            />
          </Box>
          <TextField
            label="Tell us about your stay"
            multiline
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What did you like or dislike? (Max 500 characters)"
            inputProps={{ maxLength: 500 }}
            fullWidth
          />

          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Add photos (optional)
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1.5,
                alignItems: 'center',
              }}
            >
              {images.map((img) => (
                <Box
                  key={img.previewUrl}
                  sx={{
                    position: 'relative',
                    width: 88,
                    height: 88,
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: '1px solid rgba(0,0,0,0.12)',
                  }}
                >
                  <Box
                    component="img"
                    src={img.previewUrl}
                    alt={img.file.name}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                  <IconButton
                    onClick={() => handleRemoveImage(img.previewUrl)}
                    size="small"
                    disabled={isLoading}
                    sx={{
                      position: 'absolute',
                      top: 2,
                      right: 2,
                      width: 22,
                      height: 22,
                      bgcolor: 'rgba(0,0,0,0.55)',
                      color: '#fff',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.75)' },
                    }}
                  >
                    <CloseIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Box>
              ))}

              {images.length < MAX_FILES && (
                <Button
                  onClick={handlePickFiles}
                  disabled={isLoading}
                  startIcon={<AddPhotoAlternateOutlinedIcon />}
                  sx={{
                    width: 88,
                    height: 88,
                    minWidth: 88,
                    flexDirection: 'column',
                    gap: 0.5,
                    color: '#028090',
                    border: '1px dashed rgba(2,128,144,0.5)',
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '0.7rem',
                    '& .MuiButton-startIcon': { m: 0 },
                    '&:hover': {
                      borderColor: '#028090',
                      bgcolor: 'rgba(2,128,144,0.04)',
                    },
                  }}
                >
                  Add
                </Button>
              )}
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: 'block' }}
            >
              Up to {MAX_FILES} images (JPEG, PNG, WebP), max 10MB each.
            </Typography>
            <Button onClick={handleUploadReviewImages}>Upload Images</Button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              hidden
              onChange={handleFilesSelected}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          // disabled={isLoading || !rating || !comment.trim()}
          sx={{
            bgcolor: '#028090',
            '&:hover': { bgcolor: '#026f7a' },
            '&.Mui-disabled': { bgcolor: 'rgba(0, 0, 0, 0.12)' },
            textTransform: 'none',
            px: 4,
          }}
        >
          {isLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} color="inherit" />
              <span>Submitting...</span>
            </Box>
          ) : (
            'Submit Review'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SubmitReviewModal;
