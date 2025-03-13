import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItemText,
  IconButton,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Badge,
} from '@mui/material';
import { Delete as DeleteIcon, Markunread as MarkunreadIcon, MarkunreadMailbox as MarkreadIcon } from '@mui/icons-material';
import { styled } from '@mui/system';
import PageLayout from "../pagelayout/index";
import { useGetNotificationsQuery } from '../../api/notificationApi';

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '&:last-child': {
    marginBottom: 0,
  },
  boxShadow: theme.shadows ? theme.shadows[3 as keyof typeof theme.shadows] || theme.shadows[0 as keyof typeof theme.shadows] : 'none',
}));

const Notifications: React.FC = () => {
  const {  data: result, isLoading } = useGetNotificationsQuery();

  const [notifications, setNotifications] = useState<any[]>([
    // Sample notifications for UI purposes
    { id: 1, body: 'Booking confirmed for property XYZ', status: 'unread' },
    { id: 2, body: 'Booking cancelled for property ABC', status: 'read' },
  ]);
  // const [isLoading, setIsLoading] = useState(false);

  const handleMarkAsRead = (id: number | string) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, status: 'read' } : notification
    ));
  };

  const handleMarkAsUnread = (id: number | string) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, status: 'unread' } : notification
    ));
  };

  const handleDelete = (id: number | string) => {
    setNotifications(notifications.filter(notification => notification.id != id));
  };

  return (
    <PageLayout>
      <Box sx={{ px: { xs: 2, md: 24 }, py: { xs: 10, md: 18 } }}>
        <Typography variant="h4" sx={{ mb: 4 }} color='primary'>
          Notifications
        </Typography>
        {isLoading ? (
          <CircularProgress />
        ) : (
          <List>
            {result?.data?.data.map((notification) => (
              <StyledCard key={notification.id}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={10}>
                      <ListItemText
                        primary={notification.body}
                        secondary={`Status: ${notification.status}`}
                      />
                    </Grid>
                    <Grid item xs={12} md={2} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                      {notification.status === 'unread' ? (
                        <IconButton edge="end" onClick={() => handleMarkAsRead(notification.id)} color='primary'>
                          <Badge color="secondary" variant="dot">
                            <MarkreadIcon />
                          </Badge>
                        </IconButton>
                      ) : (
                        <IconButton edge="end" onClick={() => handleMarkAsUnread(notification.id)} color='primary'>
                          <MarkunreadIcon />
                        </IconButton>
                      )}
                      <IconButton edge="end" onClick={() => handleDelete(notification.id)} color='primary'>
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </CardContent>
              </StyledCard>
            ))}
          </List>
        )}
      </Box>
    </PageLayout>
  );
};

export default Notifications;