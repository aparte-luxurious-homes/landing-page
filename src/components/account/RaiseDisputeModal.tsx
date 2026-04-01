import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Chip,
} from '@mui/material';
import { Close as CloseIcon, CloudUpload as UploadIcon, AttachFile as FileIcon } from '@mui/icons-material';
import { useRaiseDisputeMutation, useUploadDisputeEvidenceMutation, DisputeCategory } from '../../api/disputesApi';
import { toast } from 'react-toastify';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

function formatRaiseDisputeError(error: unknown): string {
  if (!error || typeof error !== 'object') return 'Failed to raise dispute';

  const err = error as FetchBaseQueryError & { message?: string };
  const data =
    'data' in err && err.data && typeof err.data === 'object'
      ? (err.data as any)
      : undefined;
      
  // Priority 1: Top-level message or detail from Aparte API data wrapper
  const nestedData = data?.data;
  if (typeof nestedData === 'string') return nestedData;
  if (nestedData?.message) return nestedData.message;
  if (nestedData?.msg) return nestedData.msg;

  // Priority 2: Standard FastAPI detail
  const detail = data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail.map((item: any) => item.msg || JSON.stringify(item)).join(', ');
  }
  if (detail && typeof detail === 'object' && 'msg' in detail) {
    return String((detail as any).msg);
  }

  // Priority 3: Top-level message property
  if (data?.message) return data.message;
  if (data?.msg) return data.msg;
  
  // Priority 4: RTK Query error message
  if (typeof err.message === 'string') return err.message;
  
  // Fallback
  return 'Failed to raise dispute';
}

interface RaiseDisputeModalProps {
  open: boolean;
  onClose: () => void;
  bookingId: string;
  propertyName: string;
}

const MAX_FILES = 5;
const MAX_FILE_SIZE_MB = 10;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'application/pdf'];

const RaiseDisputeModal: React.FC<RaiseDisputeModalProps> = ({ open, onClose, bookingId, propertyName }) => {
  const [category, setCategory] = useState<DisputeCategory>('PROPERTY_MISMATCH');
  const [otherCategory, setOtherCategory] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [raiseDispute, { isLoading: isRaising }] = useRaiseDisputeMutation();
  const [uploadEvidence, { isLoading: isUploading }] = useUploadDisputeEvidenceMutation();
  const isLoading = isRaising || isUploading;

  const categories: { value: DisputeCategory; label: string }[] = [
    { value: 'PROPERTY_MISMATCH', label: 'Property Mismatch' },
    { value: 'CLEANLINESS', label: 'Cleanliness Issue' },
    { value: 'MISSING_AMENITIES', label: 'Missing Amenities' },
    { value: 'UNAVAILABLE_CHECKIN', label: 'Check-in Issue' },
    { value: 'SAFETY_CONCERNS', label: 'Safety Concerns' },
    { value: 'GUEST_DAMAGE', label: 'Guest Damage' },
    { value: 'RULE_VIOLATION', label: 'Rule Violation' },
    { value: 'UNAUTHORIZED_GUEST', label: 'Unauthorized Guest' },
    { value: 'OVERSTAYING', label: 'Overstaying' },
    { value: 'OTHER', label: 'Other' },
  ];

  const getMediaType = (file: File): 'IMAGE' | 'VIDEO' | 'DOCUMENT' => {
    if (file.type.startsWith('image/')) return 'IMAGE';
    if (file.type.startsWith('video/')) return 'VIDEO';
    return 'DOCUMENT';
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    for (const file of selectedFiles) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error(`Unsupported file type: ${file.name}. Use JPG, PNG, WebP, MP4, or PDF.`);
        return;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
        return;
      }
    }

    if (files.length + selectedFiles.length > MAX_FILES) {
      toast.error(`You can attach up to ${MAX_FILES} files.`);
      return;
    }

    setFiles(prev => [...prev, ...selectedFiles]);
    // Reset the input so the same file can be re-selected
    e.target.value = '';
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (category === 'OTHER' && !otherCategory.trim()) {
      toast.error('Please specify the issue for "Other" category');
      return;
    }

    if (!description.trim()) {
      toast.error('Please provide details about the issue');
      return;
    }

    const finalDescription = category === 'OTHER' 
      ? `[Other Issue: ${otherCategory.trim()}] \n${description}`
      : description;

    try {
      const response = await raiseDispute({
        booking_id: bookingId,
        category,
        description: finalDescription,
      }).unwrap();

      // Some APIs wrap the response in a 'data' object, others return it directly.
      const disputeId = (response as any).data?.id || response.id || (response as any).data?.dispute_id || response.dispute_id;

      if (files.length > 0 && disputeId) {
        try {
          // Upload all files in a single request as supported by the updated API
          await uploadEvidence({
            dispute_id: disputeId,
            mediaType: getMediaType(files[0]),
            files: files,
          }).unwrap();
          toast.success(`Dispute raised and ${files.length} file(s) uploaded successfully`);
        } catch (uploadError) {
          console.error('Failed to upload evidence:', uploadError);
          toast.error('Dispute raised, but evidence upload failed. You can try again from dispute details.');
        }
      } else {
        toast.success('Dispute raised successfully');
      }

      onClose();
      // Reload the page to refresh related data (e.g. Booking History dispute buttons)
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      // Reset form
      setCategory('PROPERTY_MISMATCH');
      setOtherCategory('');
      setDescription('');
      setFiles([]);
    } catch (error: unknown) {
      toast.error(formatRaiseDisputeError(error));
    }
  };

  const handleClose = () => {
    onClose();
    setCategory('PROPERTY_MISMATCH');
    setOtherCategory('');
    setDescription('');
    setFiles([]);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Raise a dispute for {propertyName}
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value as DisputeCategory)}
            fullWidth
          >
            {categories.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          {category === 'OTHER' && (
            <TextField
              label="Specify the issue"
              value={otherCategory}
              onChange={(e) => setOtherCategory(e.target.value)}
              placeholder="E.g., Wi-Fi not working, Noise complaint"
              fullWidth
            />
          )}

          <TextField
            label="Description"
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide specific details about the issue"
            fullWidth
          />

          {/* Evidence Upload Section */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Supporting Evidence <Typography component="span" variant="caption" color="text.secondary">(optional)</Typography>
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
              Attach photos, videos, or documents (max {MAX_FILES} files, {MAX_FILE_SIZE_MB}MB each)
            </Typography>

            <Button
              component="label"
              variant="outlined"
              startIcon={<UploadIcon />}
              disabled={files.length >= MAX_FILES}
              sx={{
                color: '#028090',
                borderColor: '#028090',
                borderStyle: 'dashed',
                textTransform: 'none',
                width: '100%',
                py: 1.5,
                '&:hover': { borderColor: '#026f7a', bgcolor: 'rgba(2, 128, 144, 0.04)' },
              }}
            >
              {files.length >= MAX_FILES ? 'Maximum files reached' : 'Upload Files'}
              <input
                type="file"
                hidden
                multiple
                accept=".jpg,.jpeg,.png,.webp,.mp4,.pdf"
                onChange={handleFileSelect}
              />
            </Button>

            {/* File List */}
            {files.length > 0 && (
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {files.map((file, index) => (
                  <Box
                    key={`${file.name}-${index}`}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1,
                      px: 1.5,
                      bgcolor: '#f8fafb',
                      borderRadius: 1,
                      border: '1px solid #eee',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden' }}>
                      <FileIcon sx={{ fontSize: 18, color: '#028090' }} />
                      <Typography variant="caption" noWrap sx={{ maxWidth: 200 }}>
                        {file.name}
                      </Typography>
                      <Chip
                        label={getMediaType(file)}
                        size="small"
                        sx={{ fontSize: '0.65rem', height: 20 }}
                      />
                    </Box>
                    <IconButton size="small" onClick={() => handleRemoveFile(index)}>
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="error"
          disabled={isLoading}
          sx={{ fontWeight: 600 }}
        >
          {isLoading ? 'Submitting...' : 'Raise Dispute'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RaiseDisputeModal;
