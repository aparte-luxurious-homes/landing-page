import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  Skeleton,
} from '@mui/material';
import { styled } from '@mui/system';
import { format } from 'date-fns';
import { useGetUserTransactionsQuery } from '../../api/transactionsApi';

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '&:last-child': {
    marginBottom: 0,
  },
}));

const TransactionStatus = styled(Chip)(({ theme, status }: { theme: any, status: string }) => {
  const colors = {
    PENDING: {
      bg: theme.palette.warning.light,
      color: theme.palette.warning.dark,
    },
    SUCCESSFUL: {
      bg: theme.palette.success.light,
      color: theme.palette.success.dark,
    },
    FAILED: {
      bg: theme.palette.error.light,
      color: theme.palette.error.dark,
    },
  };

  const statusColor = colors[status as keyof typeof colors] || colors.PENDING;

  return {
    backgroundColor: statusColor.bg,
    color: statusColor.color,
    fontWeight: 600,
  };
});

const TransactionHistory: React.FC = () => {
  const { data: transactions, isLoading, error } = useGetUserTransactionsQuery();

  if (isLoading) {
    return (
      <Box>
        {[...Array(3)].map((_, index) => (
          <StyledCard key={index}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <Skeleton variant="text" width="60%" height={24} />
                  <Skeleton variant="text" width="40%" height={20} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Skeleton variant="rectangular" height={60} />
                </Grid>
              </Grid>
            </CardContent>
          </StyledCard>
        ))}
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="error">
          Failed to load transaction history. Please try again later.
        </Typography>
      </Box>
    );
  }

  if (!transactions?.data?.length) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="text.secondary">
          No transactions found.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {transactions.data.map((transaction) => (
        <StyledCard key={transaction.id}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <Typography variant="h6" gutterBottom>
                  {transaction.description}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Reference: {transaction.reference}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', md: 'flex-end' } }}>
                <TransactionStatus
                  label={transaction.status}
                  status={transaction.status}
                  size="small"
                />
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mt: 1,
                    color: transaction.type === 'CREDIT' ? 'success.main' : 'text.primary'
                  }}
                >
                  {transaction.type === 'CREDIT' ? '+' : '-'}₦{transaction.amount.toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </StyledCard>
      ))}
    </Box>
  );
};

export default TransactionHistory; 