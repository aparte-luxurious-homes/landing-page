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
import type { Transaction } from '../../api/transactionsApi';
import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '&:last-child': {
    marginBottom: 0,
  },
}));

type TransactionStatusType = 'PENDING' | 'SUCCESSFUL' | 'FAILED';

interface TransactionStatusProps {
  status: TransactionStatusType;
}

const TransactionStatus = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'status',
})<TransactionStatusProps>(({ theme, status }) => {
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

  const statusColor = colors[status] || colors.PENDING;

  return {
    backgroundColor: statusColor.bg,
    color: statusColor.color,
    fontWeight: 600,
  };
});

interface TransactionHistoryProps {
  userId: string;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ userId }) => {
  const { data, isLoading, error } = useGetUserTransactionsQuery(
    { userId },
    {
      selectFromResult: ({ data, isLoading, error }) => ({
        data,
        isLoading,
        error: error as FetchBaseQueryError | SerializedError | undefined,
      }),
    }
  );

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

  if (!data?.data?.length) {
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
      {data.data.map((transaction: Transaction) => (
        <StyledCard key={transaction.id}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <Typography variant="h6" gutterBottom>
                  {transaction.description}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {format(new Date(transaction.createdAt), 'MMM dd, yyyy HH:mm')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Reference: {transaction.reference}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Type: {transaction.transactionType}
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
                    color: transaction.action === 'CREDIT' ? 'success.main' : 'text.primary'
                  }}
                >
                  {transaction.action === 'CREDIT' ? '+' : '-'}₦{parseFloat(transaction.amount).toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  {transaction.currency}
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