'use client';

import { useState } from 'react';
import { Modal, Box } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FilterSearch from './FilterSearch';
import { useSearchDraft } from '@/components/home/searchContext';

export default function MobileSearchBar() {
  const [open, setOpen] = useState(false);
  const [draft] = useSearchDraft();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-full border border-gray-200 bg-white px-5 py-3 text-left shadow-sm"
      >
        <SearchRoundedIcon sx={{ fontSize: 20, color: '#028090' }} />
        <span className="min-w-0 flex-auto truncate text-sm text-gray-500">
          {draft.location || 'Where to?'}
        </span>
      </button>

      <Modal open={open} onClose={() => setOpen(false)}>
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
          <FilterSearch onClose={() => setOpen(false)} />
        </Box>
      </Modal>
    </div>
  );
}
