import React from "react";
import { Box, Button, Divider, IconButton, Typography } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { Link, useLocation, useNavigate } from "react-router-dom";

interface MobileDropdownProps {
  open: boolean;
  onClose: () => void;
}

const menuItems = [
  { label: "Home", path: "/" },
  { label: "Agents", path: "/agents" },
  { label: "Apartments", path: "./Apartment" },
  { label: "Services", path: "/services" },
  { label: "Pricing", path: "/pricing" },
];

const dropdownStyle = {
  position: "absolute",
  top: "90%",
  right: 0,
  transform: "translateY(10px)",
  bgcolor: "background.paper",
  borderBottomLeftRadius: 16,
  borderBottomRightRadius: 16,
  boxShadow: 24,
  p: 3,
  width: "90vw",
  maxWidth: "370px",
  display: "flex",
  flexDirection: "column",
  gap: 1,
  alignItems: "flex-start",
  zIndex: 1300,
  margin: "0 auto",
};

const MobileDropdown: React.FC<MobileDropdownProps> = ({ open, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();

  if (!open) return null;

  const handleActionClick = (actionType: "login" | "signup") => {
    if (actionType === 'login') {
      navigate('/login');
      onClose();
      return;
    }
    navigate(`/auth/user-type?action=${actionType}`);
    onClose();
    // navigate(`/auth/user-type?action=${actionType}`);
    // onClose();
  };

  return (
    <Box sx={dropdownStyle}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          width: "100%",
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            backgroundColor: "#D9D9D9",
            color: "black",
            borderRadius: "50%",
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {menuItems.map((item, index) => (
        <React.Fragment key={index}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Button
              component={Link}
              to={item.path}
              fullWidth
              variant="text"
              sx={{
                textAlign: "left",
                textTransform: "none",
                justifyContent: "flex-start",
                fontWeight: "medium",
                color:
                  location.pathname === item.path
                    ? "primary.main"
                    : "list.main",
              }}
              onClick={onClose}
            >
              {item.label}
            </Button>
          </Box>
          <Divider sx={{ width: "100%" }} />
        </React.Fragment>
      ))}

      <Box
        className="flex justify-between items-center"
        sx={{ mt: 2, mb: 2, width: "100%" }}
      >
        <Box className="flex items-center gap-2" sx={{ flexGrow: 1 }}>
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/327a41b3030b704979745fedf54db7ed08202124f309815c919d67c58a4bf61e?placeholderIfAbsent=true&apiKey=8e9d8cabec6941f3ad44d75c45253ccb"
            alt=""
            className="object-contain shrink-0 aspect-square w-[18px]"
          />
         <Link to="/list" style={{ textDecoration: 'none' }}>
            <Typography
              variant="body1"
              sx={{
                textTransform: "none",
                color: "primary.main",
                fontWeight: "medium",
              }}
            >
              List your Aparté
            </Typography>
          </Link>
        </Box>
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/a64d719319f82f60262ecf128d49c2443acec6a32d7465954b6dd95b08e57a57?placeholderIfAbsent=true&apiKey=8e9d8cabec6941f3ad44d75c45253ccb"
          alt=""
          className="object-contain shrink-0 aspect-[1.42] w-[17px]"
        />
      </Box>

      <Box
        sx={{
          mt: 1,
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <Button
          variant="contained"
          sx={{
            backgroundColor: "white",
            color: "primary.main",
            textTransform: "none",
            border: "1px solid",
            borderColor: "primary.main",
            borderRadius: 2,
            width: "47%",
            py: 2,
          }}
          onClick={() => handleActionClick("login")}
        >
          Login
        </Button>
        <Button
          variant="contained"
          sx={{
            backgroundColor: "primary.main",
            color: "white",
            textTransform: "none",
            borderRadius: 2,
            width: "47%",
            py: 2,
          }}
          onClick={() => handleActionClick("signup")}
        >
          Sign Up
        </Button>
      </Box>
    </Box>
  );
};

export default MobileDropdown;