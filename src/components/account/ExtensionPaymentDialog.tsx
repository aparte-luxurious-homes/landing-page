'use client';
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Divider,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { usePostPaymentMutation, useGetGatewayConfigQuery } from '../../api/paymentApi';
import { useGetProfileQuery } from '../../api/profileApi';
import PaymentMethodSelection from '../booking/PaymentMethodSelection';
import { toast } from 'react-toastify';

/**
 * Pay for a stay extension that already exists.
 *
 * On a request-to-book property an extension is created AWAITING_OWNER_APPROVAL
 * and becomes APPROVED when the owner accepts it; the guest then pays. The
 * "Pay Now" action used to route into the booking checkout, which only knows
 * how to pay a *booking*: it posted `booking_id: null` with no `extension_id`,
 * so the wallet was debited as a plain top-up and the extension stayed
 * unpaid. This dialog is the one payment path for an existing extension and
 * always keys the payment on `extension_id` (EXT-…), exactly as the second
 * step of ExtendStayModal does for an instant extension.
 */
interface ExtensionPaymentDialogProps {
  open: boolean;
  onClose: () => void;
  /** The PARENT booking's id — the booking the guest returns to. */
  bookingId: string;
  /** The extension's public id (EXT-…), NOT its row id. */
  extensionId: string;
  amount: number;
  propertyName?: string;
  newEndDate?: string;
}

const ExtensionPaymentDialog: React.FC<ExtensionPaymentDialogProps> = ({
  open,
  onClose,
  bookingId,
  extensionId,
  amount,
  propertyName,
  newEndDate,
}) => {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentGateway, setPaymentGateway] = useState('');
  const [postPayment, { isLoading }] = usePostPaymentMutation();
  const { data: profileData } = useGetProfileQuery();
  const { data: gatewayConfigResponse } = useGetGatewayConfigQuery(paymentGateway, {
    skip: !paymentGateway || paymentMethod !== 'ONLINE',
  });
  const wallet = profileData?.data?.wallets?.find(
    (w: { currency?: string }) => w.currency === 'NGN'
  );

  const handlePay = async () => {
    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }
    if (paymentMethod === 'ONLINE' && !paymentGateway) {
      toast.error('Please select a payment gateway');
      return;
    }
    if (!wallet?.id) {
      toast.error('Wallet information not found');
      return;
    }
    if (!extensionId || !extensionId.startsWith('EXT-')) {
      // Guard against ever being handed the row id: the API looks payments up
      // by the EXT- public id and would otherwise charge the wallet for nothing.
      toast.error('This extension cannot be paid from here. Please refresh and try again.');
      return;
    }

    try {
      const paymentResponse = await postPayment({
        id: wallet.id,
        payload: {
          amount: amount.toString(),
          extension_id: extensionId,
          provider: paymentMethod === 'WALLET' ? '' : paymentGateway,
          description: `Stay Extension Payment for booking ${bookingId}`,
          action: 'DEBIT',
          comment: 'Extension Payment',
          userId: profileData?.data?.userId || '',
          currency: 'NGN',
          type: 'PAYMENT',
          email: profileData?.data?.email || '',
          propertyId: 0,
          redirect_url: `${window.location.origin}/booking-validation?bookingId=${bookingId}&isExtension=true`,
        },
      }).unwrap();

      const transactionRef = paymentResponse?.data?.reference;

      if (paymentMethod === 'WALLET' && paymentResponse?.data?.status === 'SUCCESSFUL') {
        toast.success('Stay extended successfully (paid from wallet)');
        onClose();
        setTimeout(() => window.location.reload(), 1500);
        return;
      }

      if (paymentMethod === 'ONLINE' && paymentResponse?.data?.paymentLink) {
        const gatewayConfig = gatewayConfigResponse?.data;
        const validationUrl = `${window.location.origin}/booking-validation?paymentReference=${transactionRef}&bookingId=${bookingId}&provider=${paymentGateway}&isExtension=true`;

        if (paymentGateway === 'MONNIFY' && window.MonnifySDK && gatewayConfig) {
          window.MonnifySDK.initialize({
            amount,
            currency: 'NGN',
            reference: transactionRef,
            customerFullName:
              `${profileData?.data?.profile?.firstName || ''} ${profileData?.data?.profile?.lastName || ''}`.trim() ||
              'Customer',
            customerEmail: profileData?.data?.email,
            apiKey: gatewayConfig.apiKey,
            contractCode: gatewayConfig.contractCode,
            paymentDescription: `Extension Payment for ${bookingId}`,
            isTestMode: gatewayConfig.isTestMode,
            onComplete: () => {
              window.location.href = validationUrl;
            },
            onClose: () => {
              toast.info('Payment window closed');
            },
          });
        } else if (paymentGateway === 'PAYSTACK' && window.PaystackPop && gatewayConfig) {
          const handler = window.PaystackPop.setup({
            key: gatewayConfig.publicKey,
            email: profileData?.data?.email,
            amount: amount * 100,
            ref: transactionRef,
            callback: () => {
              window.location.href = validationUrl;
            },
            onClose: () => {
              toast.info('Payment window closed');
            },
          });
          handler.openIframe();
        } else {
          window.location.href = paymentResponse.data.paymentLink;
        }
      }
    } catch (err) {
      const data = (err as { data?: { detail?: { message?: string } | string; message?: string } })?.data;
      const detail = typeof data?.detail === 'string' ? data.detail : data?.detail?.message;
      toast.error(detail || data?.message || 'Payment failed');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1 }}>
        <Box>
          <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
            Pay for your extension
          </Typography>
          {propertyName && (
            <Typography variant="body2" color="text.secondary">
              {propertyName}
            </Typography>
          )}
        </Box>
        <IconButton onClick={onClose} aria-label="Close" size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            The owner approved your extension{newEndDate ? ` until ${newEndDate}` : ''}. Paying confirms it.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5 }}>
            <Typography variant="body1">Amount due</Typography>
            <Typography variant="body1" sx={{ fontWeight: 700 }}>
              ₦{amount.toLocaleString()}
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <PaymentMethodSelection
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          paymentGateway={paymentGateway}
          setPaymentGateway={setPaymentGateway}
          wallet={wallet}
          formatPrice={(p) => `₦${p.toLocaleString()}`}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2, px: 3 }}>
        <Button onClick={onClose} variant="text" color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handlePay}
          variant="contained"
          disabled={isLoading || !paymentMethod || (paymentMethod === 'ONLINE' && !paymentGateway)}
          sx={{ textTransform: 'none' }}
        >
          {isLoading ? <CircularProgress size={20} color="inherit" /> : `Pay ₦${amount.toLocaleString()}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExtensionPaymentDialog;
