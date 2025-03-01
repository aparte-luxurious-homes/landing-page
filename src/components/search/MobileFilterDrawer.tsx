import { Drawer, Box } from '@mui/material';
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
      <Box sx={{ p: 4 }}>
        <FilterContent {...filterProps} />
      </Box>
    </Drawer>
  );
};

export default MobileFilterDrawer; 