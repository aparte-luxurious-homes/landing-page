import React from 'react';
import { MenuItem, Select, InputLabel, FormControl } from '@mui/material';

interface PaymentMethodSelectionProps {
    paymentMethod: string;
    setPaymentMethod: (method: string) => void;
    wallet: any;
    formatPrice: (price: number) => string;
}

const PaymentMethodSelection: React.FC<PaymentMethodSelectionProps> = ({
    paymentMethod,
    setPaymentMethod,
    wallet,
    formatPrice
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

            {paymentMethod === "WALLET" && wallet && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Wallet Balance</p>
                    <p className="text-lg font-semibold text-gray-900">{formatPrice(Number(wallet.balance))}</p>
                </div>
            )}
        </div>
    );
};

export default PaymentMethodSelection;
