import { useState } from 'react';
import { Modal, Box } from '@mui/material';
import SearchInput from './SearchInput';
import FilterSearch from './FilterSearch';

export default function MobileSearchBar() {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div className="relative">
      <SearchInput
        placeholder="Search Destination"
        borderRadius="100px"
        py="3"
        iconSrc="https://cdn.builder.io/api/v1/image/assets/TEMP/bcb37e3d8ecf19fa7b396369e2164a940320256d14fb26a4eedda91f5b84f09c?placeholderIfAbsent=true&apiKey=8e9d8cabec6941f3ad44d75c45253ccb"
        onClick={handleOpen}
        onInput={undefined}
      />
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '55%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: '370px',
            bgcolor: 'background.paper',
            boxShadow: 20,
            p: 3,
            borderRadius: '30px',
          }}
        >
          <FilterSearch onClose={handleClose} />
        </Box>
      </Modal>
    </div>
  );
}
