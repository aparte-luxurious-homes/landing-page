'use client';

import { useRef } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { toast } from 'react-toastify';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

interface ProfileImageUploadProps {
  currentImage?: string;
  fallbackInitial: string;
  onImageSelected: (file: File) => Promise<void>;
  isUploading: boolean;
}

export default function ProfileImageUpload({
  currentImage,
  fallbackInitial,
  onImageSelected,
  isUploading,
}: ProfileImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (!isUploading) fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error('Please upload a JPEG, PNG, or WebP image');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error('Image must be under 10MB');
      return;
    }

    await onImageSelected(file);
    // reset so the same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Box sx={{ position: 'relative', display: 'inline-block' }}>
      <Avatar
        src={currentImage}
        onClick={handleClick}
        sx={{
          width: 120,
          height: 120,
          fontSize: '2.5rem',
          fontWeight: 600,
          backgroundColor: '#028090',
          border: '4px solid #fff',
          boxShadow: '0 4px 14px rgba(2,128,144,0.25)',
          cursor: isUploading ? 'default' : 'pointer',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': isUploading
            ? {}
            : {
                transform: 'scale(1.04)',
                boxShadow: '0 6px 20px rgba(2,128,144,0.35)',
              },
        }}
      >
        {fallbackInitial.toUpperCase()}
      </Avatar>

      {/* Camera overlay */}
      {!isUploading && (
        <IconButton
          onClick={handleClick}
          sx={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            backgroundColor: '#028090',
            color: '#fff',
            width: 36,
            height: 36,
            border: '3px solid #fff',
            '&:hover': { backgroundColor: '#026d7a' },
          }}
        >
          <CameraAltIcon sx={{ fontSize: 16 }} />
        </IconButton>
      )}

      {/* Loading overlay */}
      {isUploading && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            backgroundColor: 'rgba(0,0,0,0.4)',
          }}
        >
          <CircularProgress size={36} sx={{ color: '#fff' }} />
        </Box>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        hidden
        onChange={handleFileChange}
      />
    </Box>
  );
}
