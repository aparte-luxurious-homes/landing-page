'use client';

import { useCallback } from 'react';

import { useGetGatewayConfigQuery } from '../api/paymentApi';
import type { FlexPaymentInit } from '../api/flexPaymentsApi';

interface OpenGatewayArgs {
  /** Reference and amount exactly as the server issued them. */
  init: FlexPaymentInit;
  email: string;
  fullName?: string;
  description: string;
  /** Where to land once the gateway says it is done; the server verifies from there. */
  returnUrl: string;
  onClosed?: () => void;
}

/**
 * Opens the Monnify or Paystack checkout for a payment the server has already
 * initialised. The page must mount <PaymentScripts />. Returns false when the
 * SDK or its config is not ready, so the caller can say so.
 *
 * The same two SDK calls live inline in ConfirmBooking and
 * ExtensionPaymentDialog; this is the shared form for the flexible-payment
 * screens.
 */
export function useGatewayCheckout(provider: string) {
  const { data, isFetching } = useGetGatewayConfigQuery(provider, { skip: !provider });
  const config = data?.data;

  const openGateway = useCallback(
    ({ init, email, fullName, description, returnUrl, onClosed }: OpenGatewayArgs): boolean => {
      if (!config) return false;
      const done = () => {
        window.location.href = returnUrl;
      };
      if (init.provider === 'MONNIFY' && window.MonnifySDK) {
        window.MonnifySDK.initialize({
          amount: init.amount,
          currency: 'NGN',
          reference: init.reference,
          customerFullName: fullName || 'Customer',
          customerEmail: email,
          apiKey: config.apiKey,
          contractCode: config.contractCode,
          paymentDescription: description,
          isTestMode: config.isTestMode,
          onComplete: done,
          onClose: () => onClosed?.(),
        });
        return true;
      }
      if (init.provider === 'PAYSTACK' && window.PaystackPop) {
        window.PaystackPop
          .setup({
            key: config.publicKey,
            email,
            amount: Math.round(init.amount * 100),
            ref: init.reference,
            callback: done,
            onClose: () => onClosed?.(),
          })
          .openIframe();
        return true;
      }
      return false;
    },
    [config],
  );

  return { openGateway, isGatewayReady: !!config && !isFetching };
}
