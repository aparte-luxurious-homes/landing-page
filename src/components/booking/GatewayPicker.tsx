'use client';

import React from 'react';

import { Option } from './PaymentMethodSelection';

interface GatewayPickerProps {
  value: string;
  onChange: (gateway: 'MONNIFY' | 'PAYSTACK') => void;
}

const logo = (src: string) => <img src={src} alt="" className="w-8 h-8 object-contain" />;

/** The Monnify / Paystack choice on its own, for screens that only pay online. */
const GatewayPicker: React.FC<GatewayPickerProps> = ({ value, onChange }) => (
  <div>
    <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Choose a payment partner</p>
    <div role="radiogroup" aria-label="Payment gateway" className="space-y-3">
      <Option
        selected={value === 'MONNIFY'}
        onSelect={() => onChange('MONNIFY')}
        icon={logo('https://logosandtypes.com/wp-content/uploads/2024/02/Monnify.png')}
        title="Monnify"
        hint="Card, transfer or USSD"
      />
      <Option
        selected={value === 'PAYSTACK'}
        onSelect={() => onChange('PAYSTACK')}
        icon={logo('https://logosandtypes.com/wp-content/uploads/2024/02/Paystack.png')}
        title="Paystack"
        hint="Card, transfer or USSD"
      />
    </div>
  </div>
);

export default GatewayPicker;
