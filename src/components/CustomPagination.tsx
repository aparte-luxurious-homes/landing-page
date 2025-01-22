import React from "react";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import "../assets/styles/custom_pagination.css";

interface CustomPaginationProps {
  count: number;
  page: number;
  onChange: (event: React.MouseEvent<HTMLButtonElement> | React.ChangeEvent<unknown>, page: number) => void;
}

const CustomPagination: React.FC<CustomPaginationProps> = ({
  count,
  page,
  onChange,
}) => {
  
const handlePageChange = (event: React.MouseEvent<HTMLButtonElement> | React.ChangeEvent<unknown>, newPage: number) => {
    if (newPage >= 1 && newPage <= count) {
      onChange(event, newPage);
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= count; i++) {
      pageNumbers.push(
        <button
          key={i}
          className={`pagination-item ${i === page ? "selected" : ""}`}
          onClick={(event) => handlePageChange(event, i)}
        >
          {i}
        </button>
      );
    }
    return pageNumbers;
  };

  return (
    <div className="pagination-container" >
      <button
        className="pagination-item previous"
        onClick={(event) => handlePageChange(event, page - 1)}
        disabled={page === 1}
      >
        <ArrowBackIosIcon sx={{ fontSize: "14px" }} />
      </button>
      {renderPageNumbers()}
      <button
        className="pagination-item next"
        onClick={(event) => handlePageChange(event, page + 1)}
        disabled={page === count}
      >
        <ArrowForwardIosIcon sx={{ fontSize: "14px" }} />
      </button>
    </div>
  );
};

export default CustomPagination;
