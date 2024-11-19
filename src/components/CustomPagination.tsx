import { Pagination, PaginationItem } from "@mui/material";
import { styled } from "@mui/system";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const CustomPaginationItem = styled(PaginationItem)({
  "&.Mui-selected": {
    backgroundColor: "black",
    color: "white",
  },
  "& .MuiPaginationItem-ellipsis": {
    color: "black",
  },
  "& .MuiPaginationItem-icon": {
    color: "white",
  },
  "& .MuiPaginationItem-page": {
    "&:hover": {
      backgroundColor: "black",
      color: "white",
    },
  },
});

interface CustomPaginationProps {
  count: number;
  page: number;
  onChange: (event: React.ChangeEvent<unknown>, page: number) => void;
}

const CustomPagination: React.FC<CustomPaginationProps> = ({ count, page, onChange }) => {
  return (
    <Pagination
      count={count}
      page={page}
      onChange={onChange}
      renderItem={(item) => (
        <CustomPaginationItem
          slots={{
            previous: ArrowBackIosIcon,
            next: ArrowForwardIosIcon,
          }}
          {...item}
        />
      )}
    />
  );
};

export default CustomPagination;