import React from "react";
import { Box, Button, Divider, IconButton, Typography, Stack, Drawer } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { Link, useLocation, useNavigate } from "react-router-dom";

interface MobileDropdownProps {
  open: boolean;
  onClose: () => void;
}

const menuItems = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about"},
  { label: "Help Center", path: "/help-center", comingSoon: true },
  // { label: "Agents", path: "/agents" },
  // { label: "Apartments", path: "/apartment" },
  // { label: "Services", path: "/services" },
  // { label: "Pricing", path: "/pricing" },
];

const MobileDropdown: React.FC<MobileDropdownProps> = ({ open, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleActionClick = (actionType: "login" | "signup") => {
    if (actionType === 'login') {
      navigate('/login');
      onClose();
      return;
    }
    navigate(`/auth/user-type?action=${actionType}`);
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: "100%",
          maxWidth: "370px",
          bgcolor: "background.paper",
          display: "flex",
          flexDirection: "column",
          marginTop: { xs: "56px", sm: "64px" },
          height: { xs: "calc(100% - 56px)", sm: "calc(100% - 64px)" },
        },
      }}
    >
      <Box 
        sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          p: 3,
          pb: 0,
          // borderBottom: "1px solid",
          // borderColor: "divider"
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: "medium" }}>
          Menu
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{
            color: "text.primary",
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column" }}>
        <Stack sx={{ width: '100%' }} spacing={1}>
          {menuItems.map((item, index) => (
            <React.Fragment key={item.path}>
              <Box sx={{ position: 'relative' }}>
                <Button
                  component={Link}
                  to={item.path}
                  fullWidth
                  variant="text"
                  disabled={item.comingSoon}
                  sx={{
                    textAlign: "left",
                    textTransform: "none",
                    justifyContent: "flex-start",
                    fontWeight: "medium",
                    color: location.pathname === item.path ? "primary.main" : "list.main",
                    "&:hover": {
                      color: "primary.main",
                      backgroundColor: "transparent",
                    },
                    "&.Mui-disabled": {
                      color: "#888888",
                      "&:hover": {
                        backgroundColor: "transparent",
                      }
                    },
                  }}
                  onClick={onClose}
                >
                  {item.label}
                  {item.comingSoon && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: -8,
                        right: 0,
                        backgroundColor: "transparent",
                        color: "#028090",
                        fontSize: "10px",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        fontWeight: "bold",
                        border: "1px solid #028090",
                      }}
                    >
                      Coming Soon
                    </Box>
                  )}
                </Button>
              </Box>
              {index !== 0 && index !== menuItems.length - 1 && (
                <Divider sx={{ width: "100%" }} />
              )}
            </React.Fragment>
          ))}
        </Stack>

        <Box 
          className="flex items-center gap-2 mt-4 cursor-pointer" 
          component={Link} 
          to="/list" 
          sx={{ 
            textDecoration: 'none',
            py: 1.5,
          }}
        >
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/327a41b3030b704979745fedf54db7ed08202124f309815c919d67c58a4bf61e?placeholderIfAbsent=true&apiKey=8e9d8cabec6941f3ad44d75c45253ccb"
            alt=""
            className="object-contain shrink-0 aspect-square w-[18px]"
          />
          <Typography
            variant="body1"
            sx={{
              textTransform: "none",
              color: "primary.main",
              fontWeight: "medium",
              flexGrow: 1,
            }}
          >
            List your Aparté
          </Typography>
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/a64d719319f82f60262ecf128d49c2443acec6a32d7465954b6dd95b08e57a57?placeholderIfAbsent=true&apiKey=8e9d8cabec6941f3ad44d75c45253ccb"
            alt=""
            className="object-contain shrink-0 aspect-[1.42] w-[17px]"
          />
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "white",
              color: "primary.main",
              textTransform: "none",
              border: "1px solid",
              borderColor: "primary.main",
              borderRadius: 1.5,
              width: "47%",
              py: 1,
              fontSize: "0.9rem",
              "&:hover": {
                backgroundColor: "primary.main",
                color: "white",
              },
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
              borderRadius: 1.5,
              width: "47%",
              py: 1,
              fontSize: "0.9rem",
              "&:hover": {
                backgroundColor: "white",
                color: "primary.main",
                border: "1px solid",
                borderColor: "primary.main",
              },
            }}
            onClick={() => handleActionClick("signup")}
          >
            Sign Up
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default MobileDropdown;