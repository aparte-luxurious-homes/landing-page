import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Skeleton,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { styled } from '@mui/system';
import { format } from 'date-fns';
import { useGetUserTransactionsQuery, useRetryTransactionVerificationMutation } from '../../api/transactionsApi';
import type { Transaction } from '../../api/transactionsApi';
import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import Badge from "../badge";

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '&:last-child': {
    marginBottom: 0,
  },
}));

interface TransactionHistoryProps {
  userId: string;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ userId: _userId }) => {
  const [retryVerification, { isLoading: isRetrying }] = useRetryTransactionVerificationMutation();
  const [retryError, setRetryError] = useState<string | null>(null);
  const [retrySuccess, setRetrySuccess] = useState<string | null>(null);

  const { data, isLoading, error } = useGetUserTransactionsQuery(
    undefined,
    {
      selectFromResult: ({ data, isLoading, error }) => ({
        data,
        isLoading,
        error: error as FetchBaseQueryError | SerializedError | undefined,
      }),
    }
  );

  const handleRetryVerification = async (reference: string) => {
    setRetryError(null);
    setRetrySuccess(null);

    try {
      const result = await retryVerification(reference).unwrap();
      if (result.data.success) {
        setRetrySuccess(result.data.message || 'Payment verified successfully!');
      } else {
        setRetryError(result.data.message || 'Payment verification failed');
      }
    } catch (err: any) {
      setRetryError(err?.data?.detail || 'Failed to verify payment. Please try again.');
    }
  };

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

  if (!data?.data?.items?.length) {
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
      {retrySuccess && (
        <Alert severity="success" onClose={() => setRetrySuccess(null)} sx={{ mb: 2 }}>
          {retrySuccess}
        </Alert>
      )}
      {retryError && (
        <Alert severity="error" onClose={() => setRetryError(null)} sx={{ mb: 2 }}>
          {retryError}
        </Alert>
      )}

      {data.data.items.map((transaction: Transaction) => (
        <StyledCard key={transaction.id}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <Typography variant="h6" gutterBottom>
                  {transaction.description}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {transaction.created_at ? format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm') : '--'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Reference: {transaction.reference}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Type: {transaction.transaction_type}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', md: 'flex-end' } }}>
                <Badge status={transaction?.status?.toLocaleLowerCase()} />
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

                {transaction.status === 'PENDING' && transaction.reference && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleRetryVerification(transaction.reference)}
                    disabled={isRetrying}
                    sx={{ mt: 1 }}
                  >
                    {isRetrying ? <CircularProgress size={20} /> : 'Verify'}
                  </Button>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </StyledCard>
      ))}
    </Box>
  );
};

export default TransactionHistory;