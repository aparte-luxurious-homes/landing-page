import React, { useState } from 'react';
import { Box, Button, IconButton, MenuItem, Select, FormControl, InputLabel, SelectChangeEvent, Checkbox, FormControlLabel, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { styled } from '@mui/system';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { useNavigate } from 'react-router-dom';

const DocumentUploadCard = styled(Box)(() => ({
  width: '100%',
  maxWidth: '700px',
  backgroundColor: '#fff',
  border: '1px solid #ccc',
  borderRadius: '15px',
  padding: '40px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  margin: '20px auto',
  marginTop: '180px', 
}));

const DragAndDropBox = styled(Box)(() => ({
  width: '100%',
  height: '200px',
  backgroundColor: 'rgba(2, 128, 144, 0.1)',
  borderRadius: '10px',
  border: '2px dashed #ccc',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  cursor: 'pointer',
  marginBottom: '20px',
}));

const FileList = styled(Box)(() => ({
  width: '100%',
  marginTop: '10px',
}));

const FileItem = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px',
  borderRadius: '5px',
  backgroundColor: 'rgba(2, 128, 144, 0.1)',
  marginBottom: '10px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
}));

const KycDetails: React.FC = () => {
  const [documentType, setDocumentType] = useState<string>('');
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);
  const [uploadStatus, setUploadStatus] = useState<string[]>([]);
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const navigate = useNavigate();

  const handleDocumentTypeChange = (event: SelectChangeEvent<string>) => {
    setDocumentType(event.target.value as string);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
      setUploadProgress((prevProgress) => [...prevProgress, ...newFiles.map(() => 0)]);
      setUploadStatus((prevStatus) => [...prevStatus, ...newFiles.map(() => 'uploading')]);
      simulateUpload(newFiles.length);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files) {
      const newFiles = Array.from(event.dataTransfer.files);
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
      setUploadProgress((prevProgress) => [...prevProgress, ...newFiles.map(() => 0)]);
      setUploadStatus((prevStatus) => [...prevStatus, ...newFiles.map(() => 'uploading')]);
      simulateUpload(newFiles.length);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDeleteFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    setUploadProgress((prevProgress) => prevProgress.filter((_, i) => i !== index));
    setUploadStatus((prevStatus) => prevStatus.filter((_, i) => i !== index));
  };

  const simulateUpload = (fileCount: number) => {
    for (let i = 0; i < fileCount; i++) {
      const index = files.length - fileCount + i;
      const interval = setInterval(() => {
        setUploadProgress((prevProgress) => {
          const newProgress = [...prevProgress];
          if (newProgress[index] < 100) {
            newProgress[index] += 10;
          } else {
            clearInterval(interval);
            setUploadStatus((prevStatus) => {
              const newStatus = [...prevStatus];
              newStatus[index] = 'completed';
              return newStatus;
            });
          }
          return newProgress;
        });
      }, 500);
    }
  };

  const handleRetryUpload = (index: number) => {
    setUploadStatus((prevStatus) => {
      const newStatus = [...prevStatus];
      newStatus[index] = 'uploading';
      return newStatus;
    });
    simulateUpload(1);
  };

  const handleNext = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    navigate('/');
  };

  const handleListYourAparte = () => {
    navigate('/list');
  };

  return (
    <DocumentUploadCard>
      <Box mb={2}>
        <h1 className="font-semibold" style={{ fontSize: '1.5rem', fontWeight: 'semibold', marginBottom: '10px' }}>Upload Your KYC Documents</h1>
        <p style={{ fontSize: '0.875rem' }}>Please kindly upload your 'Know Your Customer' Documents this would help us verify your identity</p>
      </Box>
      <FormControl fullWidth variant="outlined" margin="normal">
        <InputLabel id="document-type-label">Document Type</InputLabel>
        <Select
          labelId="document-type-label"
          value={documentType}
          onChange={handleDocumentTypeChange}
          label="Document Type"
        >
          <MenuItem value="INTERNATIONAL_PASSPORT">International Passport</MenuItem>
          <MenuItem value="DRIVERS_LICENSE">Driver's License</MenuItem>
          <MenuItem value="UTILITY_BILL">Utility Bill</MenuItem>
          <MenuItem value="POWER_BILL">Power Bill</MenuItem>
          <MenuItem value="TENANCY_AGREEMENT">Tenancy Agreement</MenuItem>
          <MenuItem value="TITLE_DEED">Title Deed</MenuItem>
          <MenuItem value="CERTIFICATE_OF_OCCUPANCY">Certificate of Occupancy</MenuItem>
        </Select>
      </FormControl>
      <DragAndDropBox
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <CloudUploadIcon sx={{ fontSize: '3rem', color: '#ccc' }} />
        <Box mt={2}>
          Drag and drop files here or
        </Box>
        <Button
          variant="contained"
          component="label"
          sx={{ mt: 2, backgroundColor: 'gray', color: 'white', '&:hover': { backgroundColor: 'gray' } }}
        >
          Choose File
          <input
            type="file"
            hidden
            multiple
            onChange={handleFileUpload}
          />
        </Button>
      </DragAndDropBox>
      <Box mt={2} mb={2} textAlign="left" style={{ fontSize: '0.875rem', color: 'gray' }}>
        Only .jpg, .png, .pdf file types are allowed. Max file size is 3MB.
      </Box>
      <Box mt={4} mb={2}>
        <h2 className="font-semibold" style={{ fontSize: '1.25rem', fontWeight: 'semibold' }}>Uploaded Files</h2>
      </Box>
      <FileList>
        {files.map((file, index) => (
          <FileItem key={index}>
            <Box display="flex" alignItems="center">
              <InsertDriveFileIcon sx={{ mr: 1 }} style={{ color: 'gray' }} />
              <Box>{file.name}</Box>
            </Box>
            <Box display="flex" alignItems="center">
              {uploadStatus[index] === 'uploading' && (
                <Box mr={2} style={{ fontSize: '0.875rem', color: 'gray' }}>
                  {uploadProgress[index]}% - {((3 - (uploadProgress[index] / 100) * 3)).toFixed(1)} MB - {((3 - (uploadProgress[index] / 100) * 3) * 2).toFixed(1)} secs left
                </Box>
              )}
              {uploadStatus[index] === 'completed' && (
                <Box mr={2} style={{ fontSize: '0.875rem', color: 'green' }}>
                  Upload completed
                </Box>
              )}
              {uploadStatus[index] === 'failed' && (
                <Box mr={2} style={{ fontSize: '0.875rem', color: 'red' }}>
                  Upload failed
                </Box>
              )}
              {uploadStatus[index] === 'failed' && (
                <Button variant="contained" color="primary" onClick={() => handleRetryUpload(index)}>
                  Retry
                </Button>
              )}
              <IconButton onClick={() => handleDeleteFile(index)}>
                <DeleteIcon />
              </IconButton>
            </Box>
          </FileItem>
        ))}
      </FileList>
      <Box mt={4}>
        <FormControlLabel
          control={<Checkbox checked={confirmChecked} onChange={(e) => setConfirmChecked(e.target.checked)} />}
          label="I confirm that the uploaded document is a valid government issued document and is liable to validity check."
        />
      </Box>
      <Box mt={4} display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          color="primary"
          onClick={handleNext}
          disabled={!confirmChecked}
        >
          Continue
          <ArrowForwardIcon className="ml-2" />
        </Button>
      </Box>
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Great job! 🎉</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Your KYC details have been submitted successfully! You would be contacted with further details. You can now go ahead to list your properties.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleListYourAparte} color="primary">
            List Your Aparte
          </Button>
          <Button onClick={handleCloseDialog} color="primary" autoFocus>
            Okay
          </Button>
        </DialogActions>
      </Dialog>
    </DocumentUploadCard>
  );
};

export default KycDetails;