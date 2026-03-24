import React, { useState } from 'react';
import { useVerifyIdentityMutation, useGetProfileQuery } from '../../api/profileApi';
import { toast } from 'react-toastify';
import FormInput from '../inputs/FormInput';
import { extractErrorMessage } from '../../utils/errorHandler';
import { format, parseISO, isValid } from 'date-fns';

interface QuickProfileCompleteProps {
    onComplete: () => void;
    initialData?: {
        firstName?: string;
        lastName?: string;
        phone?: string;
        dob?: string;
    };
}

const QuickProfileComplete: React.FC<QuickProfileCompleteProps> = ({ onComplete, initialData }) => {
    const [verificationMethod, setVerificationMethod] = useState<'bvn' | 'nin' | null>(null);
    const [formData, setFormData] = useState({
        bvn: '',
        nin: '',
        mobileNumber: initialData?.phone || '',
        consent: false,
    });

    const [verifyIdentity, { isLoading: isVerifying }] = useVerifyIdentityMutation();
    const { refetch: refetchProfile } = useGetProfileQuery();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!verificationMethod) {
            toast.error("Please select a verification method (BVN or NIN)");
            return;
        }

        const value = verificationMethod === 'bvn' ? formData.bvn : formData.nin;
        if (!value) {
            toast.error(`Please provide your ${verificationMethod.toUpperCase()}`);
            return;
        }

        if (!/^\d{11}$/.test(value)) {
            toast.error(`${verificationMethod.toUpperCase()} must be 11 digits`);
            return;
        }

        if (!formData.mobileNumber || !/^\d{10,15}$/.test(formData.mobileNumber)) {
            toast.error("Please provide a valid mobile number (10-15 digits)");
            return;
        }

        if (!formData.consent) {
            toast.error("You must consent to verify your identity");
            return;
        }

        try {
            const formattedDob = initialData?.dob ? (() => {
                const date = parseISO(initialData.dob);
                return isValid(date) ? format(date, 'dd-MMM-yyyy') : initialData.dob;
            })() : undefined;

            const payload = {
                type: verificationMethod,
                value: value,
                mobileNumber: formData.mobileNumber,
                consent: true,
                firstName: initialData?.firstName,
                lastName: initialData?.lastName,
                dob: formattedDob
            };

            await verifyIdentity(payload).unwrap();
            toast.success("Identity verified successfully!");

            // Refetch profile to get the auto-populated data
            await refetchProfile();

            // We can now close the modal as the profile is completed
            onComplete();
        } catch (err: any) {
            console.error("Verification failed", err);
            const errorMessage = extractErrorMessage(err, "Verification failed");
            toast.error(errorMessage);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl text-zinc-900">
                <h2 className="text-xl font-bold mb-2">Verify Your Identity</h2>
                <p className="mb-6 text-zinc-600 text-sm">Provide either your BVN or NIN to automatically complete your profile and proceed.</p>

                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => setVerificationMethod('bvn')}
                        className={`flex-1 py-2 rounded-md border transition-all ${verificationMethod === 'bvn' ? 'bg-[#028090] text-white border-[#028090]' : 'bg-white text-zinc-700 border-zinc-300'}`}
                    >
                        BVN
                    </button>
                    <button
                        onClick={() => setVerificationMethod('nin')}
                        className={`flex-1 py-2 rounded-md border transition-all ${verificationMethod === 'nin' ? 'bg-[#028090] text-white border-[#028090]' : 'bg-white text-zinc-700 border-zinc-300'}`}
                    >
                        NIN
                    </button>
                </div>

                <form onSubmit={handleVerify} className="space-y-4">
                    {verificationMethod && (
                        <div className="space-y-4">
                            <FormInput
                                label={verificationMethod.toUpperCase()}
                                name={verificationMethod}
                                value={verificationMethod === 'bvn' ? formData.bvn : formData.nin}
                                onChange={handleChange}
                                placeholder={`${verificationMethod.toUpperCase()} (11 digits)`}
                            />
                            <FormInput
                                label="Mobile Number"
                                name="mobileNumber"
                                value={formData.mobileNumber}
                                onChange={handleChange}
                                placeholder="Phone number (e.g. 08012345678)"
                            />
                        </div>
                    )}

                    <div className="flex items-start gap-2 p-1">
                        <input
                            type="checkbox"
                            name="consent"
                            id="consent"
                            checked={formData.consent}
                            onChange={handleChange}
                            className="mt-1 accent-[#028090]"
                        />
                        <label htmlFor="consent" className="text-xs text-zinc-600 cursor-pointer">
                            I authorize Aparte to verify my identity and fetch my profile details using the provided {verificationMethod?.toUpperCase() || 'identity number'}.
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={isVerifying || !verificationMethod}
                        className="w-full bg-[#028090] text-white py-3 rounded-md hover:bg-[#026f7d] transition-colors font-medium mt-2 disabled:bg-zinc-300"
                    >
                        {isVerifying ? 'Verifying...' : 'Verify & Continue'}
                    </button>
                    <p className="text-xs text-zinc-500 text-center mt-2">
                        Your identity data is securely handled and only used for verification purposes.
                    </p>
                </form>
            </div>
        </div>
    );
};

export default QuickProfileComplete;
