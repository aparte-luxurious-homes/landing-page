import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    CircularProgress,
    Alert,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Chip
} from '@mui/material';
import { styled } from '@mui/system';
import { Add as AddIcon, AccountBalance as BankIcon, AccountBalanceWallet as WalletIcon } from '@mui/icons-material';
import {
    useGetWalletDetailsQuery,
    useGetPayoutAccountsQuery,
    useCreatePayoutAccountMutation,
    useVerifyPayoutAccountMutation,
    useWithdrawFundsMutation,
    useGetNigerianBanksQuery,
    useLazyResolveBankAccountQuery,
} from '../../api/walletsApi';

const StyledCard = styled(Card)(({ theme }) => ({
    marginBottom: theme.spacing(3),
    borderRadius: theme.shape.borderRadius,
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    overflow: 'hidden',
}));

const BalanceCard = styled(Card)(({ theme }) => ({
    background: 'linear-gradient(135deg, #028090 0%, #005662 100%)',
    color: 'white',
    marginBottom: theme.spacing(3),
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: '0 8px 20px rgba(2, 128, 144, 0.25)',
}));

interface WalletDashboardProps {
    walletId: string;
    userId: string;
    hasBvn?: boolean;
}

const WalletDashboard: React.FC<WalletDashboardProps> = ({ walletId, userId, hasBvn }) => {
    // Queries
    const { data: walletData, isLoading: isLoadingWallet, refetch: refetchWallet } = useGetWalletDetailsQuery(walletId, { skip: !walletId });
    const { data: payoutData, isLoading: isLoadingPayouts, refetch: refetchPayouts } = useGetPayoutAccountsQuery(walletId, { skip: !walletId });
    const { data: banksData, isLoading: isLoadingBanks } = useGetNigerianBanksQuery();

    // Mutations
    const [createPayoutAccount, { isLoading: isCreatingPayout }] = useCreatePayoutAccountMutation();
    const [verifyPayoutAccount, { isLoading: isVerifyingPayout }] = useVerifyPayoutAccountMutation();
    const [withdrawFunds, { isLoading: isWithdrawing }] = useWithdrawFundsMutation();
    const [resolveAccount, { isFetching: isResolvingAccount }] = useLazyResolveBankAccountQuery();

    // State
    const [isAddBankOpen, setIsAddBankOpen] = useState(false);
    const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

    // Add Bank Form setup
    const [bankCode, setBankCode] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountName, setAccountName] = useState(''); // Would ideally be resolved by endpoint, but allowing manual entry to start
    const [bvn, setBvn] = useState('');
    const [addBankError, setAddBankError] = useState('');
    const [addBankSuccess, setAddBankSuccess] = useState('');

    // Withdraw Form setup
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [selectedPayoutId, setSelectedPayoutId] = useState('');
    const [withdrawError, setWithdrawError] = useState('');
    const [withdrawSuccess, setWithdrawSuccess] = useState('');

    const wallet = walletData?.data;
    const payoutAccounts = payoutData?.data.items || [];
    const banks = banksData?.data || [];

    // Auto-resolve account name once BVN is available (either on profile or entered in the field)
    useEffect(() => {
        const effectiveBvn = hasBvn ? undefined : bvn.length === 11 ? bvn : undefined;
        if (accountNumber.length === 10 && bankCode && (hasBvn || effectiveBvn)) {
            setAddBankError('');
            resolveAccount({ account_number: accountNumber, bank_code: bankCode, bvn: effectiveBvn })
                .unwrap()
                .then((result) => {
                    if (result.data?.account_name) setAccountName(result.data.account_name);
                })
                .catch((err: any) => {
                    const errorMsg = err?.data?.detail || err?.data?.message || err?.message || 'Could not resolve account name. Please enter manually.';
                    setAddBankError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
                });
        }
    }, [accountNumber, bankCode, bvn, hasBvn, resolveAccount]);

    const handleAddBank = async () => {
        setAddBankError('');
        setAddBankSuccess('');
        if (!bankCode || !accountNumber || !accountName) {
            setAddBankError('All fields are required');
            return;
        }

        const selectedBank = banks.find(b => b.code === bankCode);
        if (!selectedBank) {
            setAddBankError('Invalid bank selected');
            return;
        }

        try {
            const response = await createPayoutAccount({
                wallet_id: walletId,
                account_name: accountName,
                account_number: accountNumber,
                bank_name: selectedBank.name,
                bank_code: bankCode,
                ...(!hasBvn && bvn ? { bvn } : {}),
            }).unwrap();

            setAddBankSuccess('Bank account added successfully!');
            setTimeout(() => {
                setIsAddBankOpen(false);
                setBankCode('');
                setAccountNumber('');
                setAccountName('');
                setBvn('');
                setAddBankSuccess('');
            }, 1500);

            // Verify the account automatically after creating if possible, or leave for manual verification UI
            if (response.data?.id) {
                try {
                    await verifyPayoutAccount({ wallet_id: walletId, account_id: response.data.id }).unwrap();
                    refetchPayouts();
                } catch (verifyErr) {
                    console.log("Auto-verify failed, user can manually verify later", verifyErr);
                }
            }

        } catch (err: any) {
            const errorMsg = err?.data?.detail || err?.data?.message || err?.message || 'Failed to add bank account';
            setAddBankError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
        }
    };

    const handleVerifyBank = async (accountId: string) => {
        try {
            await verifyPayoutAccount({ wallet_id: walletId, account_id: accountId }).unwrap();
            refetchPayouts();
        } catch (err: any) {
            const errorMsg = err?.data?.detail || err?.data?.message || err?.message || 'Verification failed';
            setAddBankError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
        }
    };

    const handleWithdraw = async () => {
        setWithdrawError('');
        setWithdrawSuccess('');

        if (!withdrawAmount || isNaN(Number(withdrawAmount)) || Number(withdrawAmount) <= 0) {
            setWithdrawError('Please enter a valid amount');
            return;
        }

        if (!selectedPayoutId) {
            setWithdrawError('Please select a bank account');
            return;
        }

        const amountNum = parseFloat(withdrawAmount);
        const balanceNum = parseFloat(wallet?.balance || '0');

        if (amountNum > balanceNum) {
            setWithdrawError('Insufficient funds');
            return;
        }

        try {
            await withdrawFunds({
                wallet_id: walletId,
                user_id: userId,
                currency: wallet?.currency || 'NGN',
                amount: withdrawAmount,
                payout_id: selectedPayoutId,
                description: 'Wallet Withdrawal'
            }).unwrap();

            setWithdrawSuccess('Withdrawal initiated successfully!');

            setTimeout(() => {
                setIsWithdrawOpen(false);
                setWithdrawAmount('');
                setSelectedPayoutId('');
                setWithdrawSuccess('');
                refetchWallet(); // Refresh balance
            }, 2000);

        } catch (err: any) {
            const errorMsg = err?.data?.detail?.message || err?.data?.detail || err?.data?.message || err?.message || 'Failed to process withdrawal';
            setWithdrawError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
        }
    };

    const formatCurrency = (amount: string | number | undefined, currency = 'NGN') => {
        if (amount === undefined) return `${currency} 0.00`;
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: currency || 'NGN'
        }).format(Number(amount));
    };

    if (!walletId) {
        return (
            <Box p={4} textAlign="center">
                <WalletIcon sx={{ fontSize: 60, color: 'action.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">Wallet not initialized</Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                    Please refresh your profile or contact support if this persists.
                </Typography>
                <Button variant="outlined" onClick={() => window.location.reload()}>Refresh Page</Button>
            </Box>
        );
    }

    if (isLoadingWallet) {
        return (
            <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <BalanceCard>
                <CardContent sx={{ p: 4 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={8}>
                            <Typography variant="h6" sx={{ opacity: 0.8, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <WalletIcon /> Available Balance
                            </Typography>
                            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                                {formatCurrency(wallet?.balance, wallet?.currency)}
                            </Typography>
                            {(parseFloat(wallet?.pending_cash || '0') > 0 || parseFloat((wallet as any)?.pendingCash || '0') > 0) && (
                                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                    Pending/Locked: {formatCurrency(wallet?.pending_cash || (wallet as any)?.pendingCash, wallet?.currency)}
                                </Typography>
                            )}
                        </Grid>
                        <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                            <Button
                                variant="contained"
                                color="secondary"
                                size="large"
                                sx={{
                                    bgcolor: 'rgba(255,255,255,0.2)',
                                    color: 'white',
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                                    borderRadius: 2,
                                    px: 4
                                }}
                                onClick={() => setIsWithdrawOpen(true)}
                            >
                                Withdraw Funds
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </BalanceCard>

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#028090' }}>
                    Saved Bank Accounts
                </Typography>
                <Button
                    startIcon={<AddIcon />}
                    variant="outlined"
                    size="small"
                    onClick={() => setIsAddBankOpen(true)}
                    sx={{ color: '#028090', borderColor: '#028090' }}
                >
                    Add Bank
                </Button>
            </Box>

            <StyledCard>
                <List sx={{ p: 0 }}>
                    {isLoadingPayouts ? (
                        <ListItem><CircularProgress size={24} sx={{ my: 2, mx: 'auto' }} /></ListItem>
                    ) : payoutAccounts.length === 0 ? (
                        <ListItem>
                            <ListItemText
                                primary="No bank accounts added yet."
                                secondary="Add a bank account to withdraw your funds."
                            />
                        </ListItem>
                    ) : (
                        payoutAccounts.map((acc: any, index: number) => (
                            <React.Fragment key={`${acc.id}-${index}`}>
                                {index > 0 && <Box sx={{ borderTop: '1px solid rgba(0,0,0,0.05)' }} />}
                                <ListItem sx={{ py: 2 }}>
                                    <ListItemText
                                        primary={
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <BankIcon color="action" fontSize="small" />
                                                <Typography fontWeight="500">{acc.bank_name}</Typography>
                                                {acc.is_verified ? (
                                                    <Chip label="Verified" size="small" color="success" sx={{ height: 20, fontSize: '0.7rem' }} />
                                                ) : (
                                                    <Chip label="Unverified" size="small" color="warning" sx={{ height: 20, fontSize: '0.7rem' }} />
                                                )}
                                            </Box>
                                        }
                                        secondary={
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                                {acc.account_number} • {acc.account_name}
                                            </Typography>
                                        }
                                    />
                                    <ListItemSecondaryAction>
                                        {!acc.is_verified && (
                                            <Button size="small" onClick={() => handleVerifyBank(acc.id)} disabled={isVerifyingPayout}>
                                                Verify
                                            </Button>
                                        )}
                                    </ListItemSecondaryAction>
                                </ListItem>
                            </React.Fragment>
                        ))
                    )}
                </List>
            </StyledCard>

            {/* Add Bank Dialog */}
            <Dialog open={isAddBankOpen} onClose={() => { setIsAddBankOpen(false); setBvn(''); setAddBankError(''); }} maxWidth="sm" fullWidth>
                <DialogTitle>Add Bank Account</DialogTitle>
                <DialogContent>
                    {addBankError && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{addBankError}</Alert>}
                    {addBankSuccess && <Alert severity="success" sx={{ mb: 2, mt: 1 }}>{addBankSuccess}</Alert>}

                    <TextField
                        select
                        fullWidth
                        label="Select Bank"
                        value={bankCode}
                        onChange={(e) => setBankCode(e.target.value)}
                        margin="normal"
                        disabled={isLoadingBanks}
                    >
                        {banks.map((b: any) => (
                            <MenuItem key={`${b.code}-${b.id}`} value={b.code}>{b.name}</MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        fullWidth
                        label="Account Number"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        margin="normal"
                        inputProps={{ maxLength: 10 }}
                        InputProps={{
                            endAdornment: isResolvingAccount && <CircularProgress size={20} />
                        }}
                    />

                    <TextField
                        fullWidth
                        label="Account Name"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        margin="normal"
                        helperText="Name must match your profile and bank exactly"
                        disabled={isResolvingAccount}
                    />

                    {!hasBvn && (
                        <TextField
                            fullWidth
                            label="BVN (Bank Verification Number)"
                            value={bvn}
                            onChange={(e) => setBvn(e.target.value.replace(/\D/g, '').slice(0, 11))}
                            margin="normal"
                            inputProps={{ maxLength: 11 }}
                            helperText="Your 11-digit BVN — optional but needed for account verification."
                        />
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => { setIsAddBankOpen(false); setBvn(''); setAddBankError(''); }}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleAddBank}
                        disabled={isCreatingPayout || !bankCode || accountNumber.length < 10 || !accountName}
                        sx={{ bgcolor: '#028090', '&:hover': { bgcolor: '#026d7a' } }}
                    >
                        {isCreatingPayout ? <CircularProgress size={24} color="inherit" /> : 'Save Account'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Withdraw Dialog */}
            <Dialog open={isWithdrawOpen} onClose={() => setIsWithdrawOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Withdraw Funds</DialogTitle>
                <DialogContent>
                    {withdrawError && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{withdrawError}</Alert>}
                    {withdrawSuccess && <Alert severity="success" sx={{ mb: 2, mt: 1 }}>{withdrawSuccess}</Alert>}

                    <Box sx={{ mb: 3, mt: 1, p: 2, bgcolor: 'rgba(2, 128, 144, 0.05)', borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary">Available Balance</Typography>
                        <Typography variant="h6" color="#028090" fontWeight={600}>
                            {formatCurrency(wallet?.balance, wallet?.currency)}
                        </Typography>
                    </Box>

                    <TextField
                        fullWidth
                        label="Amount"
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        margin="normal"
                        InputProps={{
                            startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>₦</Typography>
                        }}
                    />

                    <TextField
                        select
                        fullWidth
                        label="Select Destination Account"
                        value={selectedPayoutId}
                        onChange={(e) => setSelectedPayoutId(e.target.value)}
                        margin="normal"
                    >
                        {payoutAccounts.map((acc: any, index: number) => (
                            <MenuItem key={`${acc.id}-${index}`} value={acc.id} disabled={!acc.is_verified}>
                                {acc.bank_name} - {acc.account_number} {!acc.is_verified && '(Unverified)'}
                            </MenuItem>
                        ))}
                        {payoutAccounts.length === 0 && (
                            <MenuItem disabled value="">No accounts added yet</MenuItem>
                        )}
                    </TextField>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setIsWithdrawOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleWithdraw}
                        disabled={isWithdrawing || !withdrawAmount || !selectedPayoutId}
                        sx={{ bgcolor: '#028090', '&:hover': { bgcolor: '#026d7a' } }}
                    >
                        {isWithdrawing ? <CircularProgress size={24} color="inherit" /> : 'Confirm Withdrawal'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default WalletDashboard;
