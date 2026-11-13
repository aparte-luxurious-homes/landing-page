import { Drawer, Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FilterContent from './FilterContent';
import { FilterContentProps } from '../../types/search';

interface MobileFilterDrawerProps {
  open: boolean;
  onClose: () => void;
  filterProps: FilterContentProps;
}

const MobileFilterDrawer: React.FC<MobileFilterDrawerProps> = ({
  open,
  onClose,
  filterProps
}) => {
  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: "100%",
          maxWidth: "370px",
          marginTop: { xs: "56px", sm: "64px" },
          height: { xs: "calc(100% - 56px)", sm: "calc(100% - 64px)" },
        },
      }}
    >
      {/*
        This drawer had no way out on the devices it exists for.

        MUI fires `onClose` on a backdrop tap or the Escape key, and nothing
        else was wired to it. At `maxWidth: 370px` on a 375px phone the
        backdrop is a five-pixel strip down the right edge — not a tap target
        anybody hits — and a phone has no Escape key. The only remaining exit
        was "Apply Filters", which sits below the fold and *applies* the
        filters rather than dismissing them, so backing out of the drawer
        unchanged was impossible.

        `position: sticky` rather than a plain header: the paper is the scroll
        container (its content runs to roughly 1220px on a 390px-tall
        viewport), so a header that scrolled away would put the close button
        out of reach again the moment anyone looked at the amenities.
      */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          px: 2,
          py: 1.5,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Filters
        </Typography>
        <IconButton
          onClick={onClose}
          aria-label="Close filters"
          edge="end"
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ px: 4, pt: 3, pb: 4 }}>
        <FilterContent {...filterProps} />
      </Box>
    </Drawer>
  );
};

export default MobileFilterDrawer;
