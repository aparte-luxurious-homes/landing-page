import React, { useState } from 'react'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import CircularProgress from '@mui/material/CircularProgress'
import { Box, Typography, IconButton, Select, MenuItem, FormControl, InputLabel } from '@mui/material'
import { styled } from '@mui/system'
import { useAppDispatch } from '../../hooks'
import { setKycId } from '../../features/property/propertySlice'
import { useUploadKycDocumentMutation } from '../../api/propertiesApi'

const DocumentUploadCard = styled(Box)(() => ({
  width: '100%',
  maxWidth: '800px',
  minHeight: '400px',
  backgroundColor: '#f0f0f0',
  borderRadius: '15px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  padding: '16px',
  border: '2px dashed #ccc',
  '@media (max-width: 480px)': {
    gap: '10px',
    padding: '10px'
  }
}))

const DocumentCard = styled(Box)(() => ({
  width: '100%',
  height: '80px',
  borderRadius: '10px',
  backgroundColor: '#fff',
  display: 'flex',
  alignItems: 'center',
  padding: '0 16px',
  position: 'relative',
  '&:hover': {
    '& .delete-button': {
      opacity: 1
    }
  }
}))

const UploadPlaceholder = styled(Box)(() => ({
  width: '100%',
  height: '80px',
  borderRadius: '10px',
  backgroundColor: '#fff',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  border: '2px dashed #ccc',
  cursor: 'pointer',
  '&:hover': {
    borderColor: '#028090'
  }
}))

const DeleteButton = styled(IconButton)(() => ({
  position: 'absolute',
  right: '8px',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  padding: '4px',
  opacity: 0,
  transition: 'opacity 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.7)'
  },
  '& svg': {
    fontSize: '20px',
    color: 'white'
  }
}))

const TypeBadge = styled(Box)(() => ({
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '0.75rem',
  fontWeight: 500,
  backgroundColor: '#e3f2fd',
  color: '#1565c0',
  marginLeft: 'auto',
  marginRight: '16px'
}))

interface ListFlow5Props {
  onNext: () => void
  onBack: () => void
}

interface DocumentInfo {
  id: string
  file: File
  type: DocumentType
}

type DocumentType = 'UTILITY_BILL' | 'TENANCY_AGREEMENT' | 'TITLE_DEED' | 'CERTIFICATE_OF_OCCUPANCY'

const DOCUMENT_TYPES: DocumentType[] = [
  'UTILITY_BILL',
  'TENANCY_AGREEMENT',
  'TITLE_DEED',
  'CERTIFICATE_OF_OCCUPANCY'
]

const ListFlow5: React.FC<ListFlow5Props> = ({ onNext, onBack }): JSX.Element => {
  const [documents, setDocuments] = useState<DocumentInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<DocumentType>('UTILITY_BILL')
  const dispatch = useAppDispatch()
  const [uploadKycDocument] = useUploadKycDocumentMutation()

  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newDocument = event.target.files[0]
      const documentInfo: DocumentInfo = {
        id: Math.random().toString(36).substr(2, 9),
        file: newDocument,
        type: selectedType
      }
      setDocuments(prev => [...prev, documentInfo])
    }
  }

  const handleDeleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id))
  }

  const handleSubmit = async () => {
    if (documents.length === 0) return

    setLoading(true)
    setError(null)
    try {
      // Upload all documents
      const uploadPromises = documents.map(doc => 
        uploadKycDocument({ 
          document_type: doc.type, 
          document: doc.file 
        }).unwrap()
      )

      const results = await Promise.all(uploadPromises)
      const kycId = results[0].data.id // Use the first document's KYC ID
      dispatch(setKycId(kycId))
      onNext()
    } catch (err) {
      console.error('Document upload error:', err)
      setError('An error occurred while uploading documents. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 md:py-40 md:px-6">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl md:text-3xl text-center font-medium text-black mb-4">
          Upload Your Documents
        </h1>
        <p className="text-lg text-gray-700 text-center mb-2">
          Please upload the required documents for your property
        </p>
        <p className="text-xs text-gray-600 text-center max-w-md mx-auto mb-8">
          Upload utility bills, tenancy agreements, or property ownership documents
        </p>

        {error && (
          <Box 
            sx={{ 
              backgroundColor: '#fdeded',
              color: '#5f2120',
              padding: 2,
              borderRadius: 1,
              marginBottom: 2
            }}
          >
            <Typography variant="body2">{error}</Typography>
          </Box>
        )}

        <DocumentUploadCard>
          {documents.map((doc) => (
            <DocumentCard key={doc.id}>
              <Typography variant="body1" sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {doc.file.name}
              </Typography>
              <TypeBadge>
                {doc.type.replace(/_/g, ' ')}
              </TypeBadge>
              <DeleteButton
                className="delete-button"
                onClick={() => handleDeleteDocument(doc.id)}
                disabled={loading}
              >
                <DeleteIcon />
              </DeleteButton>
            </DocumentCard>
          ))}

          {documents.length < 3 && (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel id="document-type-label">Document Type</InputLabel>
                <Select
                  labelId="document-type-label"
                  value={selectedType}
                  label="Document Type"
                  onChange={(e) => setSelectedType(e.target.value as DocumentType)}
                  disabled={loading}
                >
                  {DOCUMENT_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type.replace(/_/g, ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <UploadPlaceholder>
                <label htmlFor="document-upload" className="cursor-pointer w-full h-full flex items-center justify-center">
                  <input
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    id="document-upload"
                    type="file"
                    onChange={handleDocumentUpload}
                    disabled={loading}
                  />
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    <AddIcon sx={{ fontSize: 40, color: '#666' }} />
                    <Typography variant="body2" color="textSecondary">
                      Upload Document
                    </Typography>
                  </Box>
                </label>
              </UploadPlaceholder>
            </Box>
          )}
        </DocumentUploadCard>

        <div className="flex justify-between w-full mt-8">
          <button
            className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100"
            onClick={onBack}
            disabled={loading}
          >
            <ArrowBackIcon className="mr-2" />
            Back
          </button>
          <button
            className={`flex items-center px-14 py-2 rounded-md ${
              documents.length > 0 && !loading
                ? 'bg-[#028090] text-white hover:bg-[#026f7a]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={handleSubmit}
            disabled={documents.length === 0 || loading}
          >
            {loading ? (
              <CircularProgress size={24} className="text-white" />
            ) : (
              <>
                Continue
                <ArrowForwardIcon className="ml-2" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ListFlow5
