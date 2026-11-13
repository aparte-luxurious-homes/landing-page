'use client';

import React from 'react';
import { Icon } from '@iconify/react';

interface PaymentMethodSelectionProps {
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  paymentGateway: string;
  setPaymentGateway: (gateway: string) => void;
  wallet: any;
  formatPrice: (price: number) => string;
  disablePaymentOption?: boolean;
}


/** A big tappable option card with a radio dot on the right. */
export const Option: React.FC<{
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  hint?: string;
  badge?: string;
  disablePaymentOption?: boolean;
}> = ({ selected, onSelect, icon, title, hint, badge, disablePaymentOption }) => (
  <button
    type="button"
    role="radio"
    aria-checked={selected}
    onClick={onSelect}
    className={!disablePaymentOption ? `w-full flex items-center gap-4 text-left rounded-2xl border-2 px-4 py-3.5 transition-all ${
      selected
        ? 'border-[#028090] bg-[#028090]/5 shadow-[0_8px_20px_-12px_rgba(2,128,144,0.6)]'
        : 'border-gray-200 bg-white hover:border-[#028090]/50'
    }` : "w-full flex items-center gap-4 text-left rounded-2xl border-2 px-4 py-3.5"}
    disabled={disablePaymentOption ? disablePaymentOption : false}
  >
    <span className="w-11 h-11 shrink-0 rounded-full bg-[#E3F2F4] text-[#026672] flex items-center justify-center overflow-hidden">
      {icon}
    </span>
    <span className="flex-1 min-w-0">
      <span className="flex items-center gap-2 flex-wrap">
        <span className="font-semibold text-gray-900">{title}</span>
        {badge && (
          <span className="rounded-full bg-[#E8C27A]/40 text-[#7a5a14] text-xs font-bold px-2 py-0.5">
            {badge}
          </span>
        )}
      </span>
      {hint && <span className="block text-sm text-gray-500 mt-0.5">{hint}</span>}
    </span>
    <span
      className={`w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center ${
        selected ? 'border-[#028090] bg-[#028090]' : 'border-gray-300'
      }`}
    >
      {selected && <Icon icon="mdi:check" width={16} className="text-white" />}
    </span>
  </button>
);

const PaymentMethodSelection: React.FC<PaymentMethodSelectionProps> = ({
  paymentMethod,
  setPaymentMethod,
  paymentGateway,
  setPaymentGateway,
  wallet,
  formatPrice,
  disablePaymentOption
}) => {
  return (
    <div className="bg-white rounded-[28px] shadow-[0_24px_48px_-16px_rgba(25,25,25,0.2)] border border-black/5 p-5 md:p-6">
      <h2 className="text-2xl font-bold text-[#191919] mb-4">
        How would you like to pay?
      </h2>

      <div role="radiogroup" aria-label="Payment method" className="space-y-3">
        <Option
          selected={paymentMethod === 'ONLINE'}
          onSelect={() => setPaymentMethod('ONLINE')}
          icon={<Icon icon="mdi:credit-card-outline" width={22} />}
          title="Card, transfer or USSD"
          hint="Pay securely online"
        />
        <Option
          selected={paymentMethod === 'WALLET'}
          onSelect={() => setPaymentMethod('WALLET')}
          icon={<Icon icon="mdi:wallet-outline" width={22} />}
          title="Aparte wallet"
          hint={wallet ? `Balance ${formatPrice(Number(wallet.balance))}` : 'Pay from your wallet balance'}
          badge="No processing fee"
          disablePaymentOption={disablePaymentOption}
        />
      </div>

      {paymentMethod === 'ONLINE' && (
        <div className="mt-6">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Choose a payment partner</p>
          <div role="radiogroup" aria-label="Payment gateway" className="space-y-3">
            <Option
              selected={paymentGateway === 'MONNIFY'}
              onSelect={() => setPaymentGateway('MONNIFY')}
              icon={
                <img
                  src="https://logosandtypes.com/wp-content/uploads/2024/02/Monnify.png"
                  alt=""
                  className="w-8 h-8 object-contain"
                />
              }
              title="Monnify"
              badge="Recommended"
            />
            <Option
              selected={paymentGateway === 'PAYSTACK'}
              onSelect={() => setPaymentGateway('PAYSTACK')}
              icon={
                <img
                  src="https://logosandtypes.com/wp-content/uploads/2024/02/Paystack.png"
                  alt=""
                  className="w-8 h-8 object-contain"
                />
              }
              title="Paystack"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelection;
