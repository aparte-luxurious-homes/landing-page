'use client';

import React from 'react';
import {
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
} from '@mui/material';

interface PaymentMethodSelectionProps {
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  paymentGateway: string;
  setPaymentGateway: (gateway: string) => void;
  wallet: any;
  formatPrice: (price: number) => string;
}

const PaymentMethodSelection: React.FC<PaymentMethodSelectionProps> = ({
  paymentMethod,
  setPaymentMethod,
  paymentGateway,
  setPaymentGateway,
  wallet,
  formatPrice,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-medium mb-4">Payment Method</h2>
      <FormControl fullWidth>
        <InputLabel>Select Payment Method</InputLabel>
        <Select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          label="Select Payment Method"
        >
          <MenuItem value="">Please Select</MenuItem>
          <MenuItem value="ONLINE">Pay Online</MenuItem>
          <MenuItem value="WALLET">Pay with Wallet</MenuItem>
        </Select>
      </FormControl>

      {paymentMethod === 'ONLINE' && (
        <div className="mt-6">
          <FormLabel
            component="legend"
            className="text-sm font-medium text-gray-700 mb-2"
          >
            Select Payment Gateway
          </FormLabel>
          <RadioGroup
            value={paymentGateway}
            onChange={(e) => setPaymentGateway(e.target.value)}
            className="space-y-2"
          >
            <div className="border rounded-lg p-4 hover:border-primary-500 transition-colors">
              <FormControlLabel
                value="MONNIFY"
                control={<Radio />}
                label={
                  <div className="flex items-center gap-3">
                    <img
                      src="https://logosandtypes.com/wp-content/uploads/2024/02/Monnify.png"
                      alt="Monnify"
                      className="h-12 w-auto"
                    />
                    <span className="font-medium">Pay with Monnify</span>
                    <span className="text-sm text-gray-500">- Recommended</span>
                  </div>
                }
                className="w-full"
              />
            </div>
            <div className="border rounded-lg p-4 hover:border-primary-500 transition-colors">
              <FormControlLabel
                value="PAYSTACK"
                control={<Radio />}
                label={
                  <div className="flex items-center gap-2">
                    <img
                      src="https://logosandtypes.com/wp-content/uploads/2024/02/Paystack.png"
                      alt="Paystack"
                      className="h-12 w-auto"
                    />
                    <span className="font-medium">Pay with Paystack</span>
                  </div>
                }
                className="w-full"
              />
            </div>
          </RadioGroup>

          {paymentGateway && (
            <p className="text-sm text-green-600 mt-2">
              Selected: {paymentGateway}
            </p>
          )}
        </div>
      )}

      {paymentMethod === 'WALLET' && wallet && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Wallet Balance</p>
          <p className="text-lg font-semibold text-gray-900">
            {formatPrice(Number(wallet.balance))}
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelection;
